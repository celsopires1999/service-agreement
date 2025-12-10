import { PostgreSqlContainer } from "@testcontainers/postgresql"

export default async function globalSetup() {
    try {
        await new PostgreSqlContainer("postgres:latest")
            .withPassword("test")
            .withUsername("test")
            .withDatabase("test")
            .withExposedPorts(5432)
            .withReuse()
            .start()
    } catch (e) {
        console.error("Error on creating container: ", { origin: e })
        throw e
    }
}
