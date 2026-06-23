import { Pool } from "pg"
import * as schema from "@/db/schema"
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres"
import { config } from "dotenv"
import {
    getConnectionStringUrl,
    getPoolMax,
    getTokenRefreshMarginMs,
    parseDbAuthMode,
    createAzurePoolSecrets,
    getAzurePoolConfig,
    refreshAzureSecrets,
} from "@/db/db-config"
import type { AzurePoolSecrets } from "@/db/db-config"

config({ path: ".env.local" })

let _currentPool: Pool | null = null
let _currentDb: NodePgDatabase<typeof schema> | null = null
let _refreshTimer: ReturnType<typeof setTimeout> | null = null
let _azureSecrets: AzurePoolSecrets | null = null

function createPoolAndDb(password: string): { pool: Pool; db: NodePgDatabase<typeof schema> } {
    const pool = new Pool({
        ...getAzurePoolConfig({ password, expiresOnTimestamp: 0 }),
    })
    return { pool, db: drizzle(pool, { schema }) }
}

function createPoolAndDbFromUrl(): { pool: Pool; db: NodePgDatabase<typeof schema> } {
    const pool = new Pool({ connectionString: getConnectionStringUrl(), max: getPoolMax() })
    return { pool, db: drizzle(pool, { schema }) }
}

function scheduleTokenRefresh() {
    if (_refreshTimer) {
        clearTimeout(_refreshTimer)
    }

    const marginMs = getTokenRefreshMarginMs()
    const expiresOn = _azureSecrets!.expiresOnTimestamp
    const delay = Math.max(expiresOn - Date.now() - marginMs, 5_000)

    _refreshTimer = setTimeout(async () => {
        try {
            const newSecrets = await refreshAzureSecrets()
            _azureSecrets = newSecrets

            const { pool: newPool, db: newDb } = createPoolAndDb(newSecrets.password)
            const oldPool = _currentPool

            _currentPool = newPool
            _currentDb = newDb

            scheduleTokenRefresh()

            drainPool(oldPool)
        } catch (err) {
            console.error("Token refresh failed, retrying in 30s", err)
            _refreshTimer = setTimeout(() => scheduleTokenRefresh(), 30_000)
        }
    }, delay)
}

function drainPool(pool: Pool | null) {
    if (!pool) return
    const timeout = setTimeout(() => {
        console.warn("Force-ending old database pool")
        pool.end().catch(() => {})
    }, 30_000)
    pool.end().then(() => clearTimeout(timeout)).catch(() => clearTimeout(timeout))
}

export async function getDb(): Promise<NodePgDatabase<typeof schema>> {
    if (_currentDb) return _currentDb

    const mode = parseDbAuthMode()

    if (mode === "managed-identity") {
        const secrets = await createAzurePoolSecrets()
        _azureSecrets = secrets

        const { pool, db } = createPoolAndDb(secrets.password)
        _currentPool = pool
        _currentDb = db

        scheduleTokenRefresh()
    } else {
        const { pool, db } = createPoolAndDbFromUrl()
        _currentPool = pool
        _currentDb = db
    }

    return _currentDb
}

export type DB = NodePgDatabase<typeof schema>
