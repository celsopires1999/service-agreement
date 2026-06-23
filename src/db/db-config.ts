const AZURE_TOKEN_SCOPE = "https://ossrdbms-aad.database.windows.net/.default"

export type DbAuthMode = "connection-string" | "managed-identity"

export function parseDbAuthMode(): DbAuthMode {
    const mode = process.env.DB_AUTH_MODE
    if (mode === "managed-identity") return "managed-identity"
    return "connection-string"
}

function parseConnectionString(connStr: string): {
    host: string
    port: number
    database: string
    user: string
} {
    const url = new URL(connStr)
    const database = url.pathname.replace(/^\//, "")
    if (!database) {
        throw new Error(
            "AZURE_POSTGRESQL_CONNECTIONSTRING must include a database name in the path",
        )
    }
    return {
        host: url.hostname,
        port: parseInt(url.port || "5432", 10),
        database,
        user: url.username,
    }
}

export type AzureToken = {
    token: string
    expiresOnTimestamp: number
}

async function acquireAzureToken(): Promise<AzureToken> {
    const { DefaultAzureCredential } = await import("@azure/identity")
    const credential = new DefaultAzureCredential()
    const accessToken = await credential.getToken(AZURE_TOKEN_SCOPE)
    if (!accessToken?.token) {
        throw new Error(
            "Failed to acquire Azure AD token for PostgreSQL connection",
        )
    }
    return {
        token: accessToken.token,
        expiresOnTimestamp: accessToken.expiresOnTimestamp,
    }
}

export function getConnectionStringUrl(): string {
    const url = process.env.DATABASE_URL
    if (!url) {
        throw new Error(
            "DATABASE_URL environment variable is required when DB_AUTH_MODE is 'connection-string'",
        )
    }
    return url
}

function getAzureConnectionString(): string {
    const connStr = process.env.AZURE_POSTGRESQL_CONNECTIONSTRING
    if (!connStr) {
        throw new Error(
            "AZURE_POSTGRESQL_CONNECTIONSTRING environment variable is required when DB_AUTH_MODE is 'managed-identity'",
        )
    }
    return connStr
}

export function getPoolMax(): number {
    const val = process.env.DB_POOL_MAX
    if (val) {
        const n = parseInt(val, 10)
        if (Number.isFinite(n) && n > 0) return n
    }
    return 10
}

export function getTokenRefreshMarginMs(): number {
    const val = process.env.DB_TOKEN_REFRESH_MARGIN_MS
    if (val) {
        const n = parseInt(val, 10)
        if (Number.isFinite(n) && n > 0) return n
    }
    return 300_000
}

export type AzurePoolSecrets = {
    password: string
    expiresOnTimestamp: number
}

export async function createAzurePoolSecrets(): Promise<AzurePoolSecrets> {
    const token = await acquireAzureToken()

    return {
        password: token.token,
        expiresOnTimestamp: token.expiresOnTimestamp,
    }
}

export function getAzurePoolConfig(secrets: AzurePoolSecrets) {
    const connStr = getAzureConnectionString()
    const parsed = parseConnectionString(connStr)

    return {
        host: parsed.host,
        port: parsed.port,
        database: parsed.database,
        user: parsed.user,
        password: secrets.password,
        ssl: { rejectUnauthorized: false } as const,
        max: getPoolMax(),
    }
}

export async function refreshAzureSecrets(): Promise<AzurePoolSecrets> {
    const token = await acquireAzureToken()
    return {
        password: token.token,
        expiresOnTimestamp: token.expiresOnTimestamp,
    }
}
