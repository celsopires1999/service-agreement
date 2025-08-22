import { PostgreSqlContainer } from "@testcontainers/postgresql"

export default async function globalSetup() {
    try {
        await new PostgreSqlContainer("postgres:latest")
            .withPassword("test")
            .withUsername("test")
            .withDatabase("test")
            .withExposedPorts({
                container: 5432,
                host: 54320,
            })
            .withReuse()
            .start()
    } catch (e) {
        throw e
    }
}
