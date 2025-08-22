import * as schema from "@/db/schema"
import {
    PostgreSqlContainer,
    StartedPostgreSqlContainer,
} from "@testcontainers/postgresql"
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { Client } from "pg"

export function setupTestDb() {
    let adminDb: NodePgDatabase<typeof schema> & {
        $client: Client
    }

    let _testDb: NodePgDatabase<typeof schema> & {
        $client: Client
    }

    let databaseName: string

    const startedPostgresContainer = startPostgres()

    beforeEach(async () => {
        const container = startedPostgresContainer.postgresContainer
        const adminClient = new Client({
            connectionString: container.getConnectionUri(),
        })

        await adminClient.connect()
        adminDb = drizzle(adminClient, { schema })

        databaseName = "test_" + Math.random().toString(36).substring(7)

        await adminDb.execute(`CREATE DATABASE ${databaseName}`)

        const testClient = new Client({
            connectionString: container
                .getConnectionUri()
                .replace(/\/[a-zA-Z0-9_-]+$/, `/${databaseName}`),
        })
        await testClient.connect()
        _testDb = drizzle(testClient, { schema })

        await migrate(_testDb, {
            migrationsFolder: "src/db/migrations",
        })
    }, 20000)

    afterEach(async () => {
        await _testDb.$client.end()
        await adminDb.execute(`DROP DATABASE ${databaseName}`)
        await adminDb.$client.end()
    })

    return {
        get testDb() {
            return _testDb
        },
    }
}

export function startPostgres() {
    let _postgresContainer: StartedPostgreSqlContainer

    beforeAll(async () => {
        do {
            try {
                _postgresContainer = await new PostgreSqlContainer(
                    "postgres:latest",
                )
                    .withPassword("test")
                    .withUsername("test")
                    .withDatabase("test")
                    .withExposedPorts({
                        container: 5432,
                        host: 54320,
                    })
                    .withReuse()
                    .start()
                break
            } catch (e) {
                const error = e as Error
                if (!error.message.includes("port is already allocated")) {
                    throw error
                }
            }
        } while (true)
    }, 20000)

    return {
        get postgresContainer() {
            return _postgresContainer
        },
    }
}
