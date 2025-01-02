import { BackButton } from "@/components/BackButton"
import { getSystem } from "@/lib/queries/getSystems"
import { getServicesBySystemId } from "@/lib/queries/service"
import Decimal from "decimal.js"
import { validate as uuidValidate } from "uuid"
import { SystemServiceHeader } from "./SystemServiceHeader"
import { SystemServicesSearch } from "./SystemServicesSearch"
import { SystemServicesTable } from "./SystemServicesTable"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ systemId: string }>
}) {
    const { systemId } = await params

    if (!systemId) {
        return {
            title: "Services of a System",
        }
    }

    return {
        title: `Services of a System #${systemId}`,
    }
}

export default async function SystemsToServiceFormPage({
    params,
    searchParams,
}: {
    params: Promise<{ systemId: string }>
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const { systemId } = await params
    const { exchangeRate, year } = await searchParams

    if (!uuidValidate(systemId)) {
        return (
            <>
                <h2 className="mb-2 text-2xl">
                    System ID #{systemId} not valid
                </h2>
                <BackButton title="Go Back" variant="default" />
            </>
        )
    }

    try {
        const system = await getSystem(systemId)

        if (!system) {
            return (
                <>
                    <h2 className="mb-2 text-2xl">
                        System ID #{systemId} not found
                    </h2>
                    <BackButton title="Go Back" variant="default" />
                </>
            )
        }

        if (!year || !exchangeRate) {
            return (
                <div className="flex flex-col gap-1 sm:px-8">
                    <SystemServiceHeader
                        systemId={systemId}
                        name={system.name}
                        description={system.description}
                        users={system.users}
                        applicationId={system.applicationId} />
                    <SystemServicesSearch systemId={systemId} year={year} exchangeRate={exchangeRate} />
                    <p className="mt-4">
                        Please check whether the provided year and exchange rate (EUR / USD) are valid.
                    </p>
                    <p>
                        Click on <span className="font-bold">Search</span> when you are ready.
                    </p>
                </div>
            )
        }

        let exchangeRateDecimal: Decimal

        try {
            exchangeRateDecimal = new Decimal(exchangeRate)
        } catch (error) {
            return (
                <>
                    <h2 className="mb-2 text-2xl">
                        Exchange Rate {exchangeRate} not valid
                    </h2>
                    <BackButton title="Go Back" variant="default" />
                </>
            )
        }

        if (!Number.isInteger(+year)) {
            return (
                <>
                    <h2 className="mb-2 text-2xl">
                        Year {year} is not valid
                    </h2>
                    <BackButton title="Go Back" variant="default" />
                </>
            )
        }

        const yearFilter = +year

        const result = await getServicesBySystemId(systemId, yearFilter)
        const services = result.map((service) => {
            return {
                ...service,
                systemAmount: service.serviceCurrency === "EUR"
                    ? new Decimal(service.systemAmount).mul(exchangeRateDecimal).toFixed(2)
                    : service.systemAmount,
            }
        })

        return (
            <div className="flex flex-col gap-1 sm:px-8">
                <SystemServiceHeader
                    systemId={systemId}
                    name={system.name}
                    description={system.description}
                    users={system.users}
                    applicationId={system.applicationId} />
                <SystemServicesSearch systemId={systemId} year={year} exchangeRate={exchangeRate} />
                <SystemServicesTable data={services} />
            </div>
        )
    } catch (e) {
        if (e instanceof Error) {
            console.error(e)
            throw e
        }
    }
}
