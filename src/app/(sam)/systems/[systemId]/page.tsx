import { BackButton } from "@/components/BackButton"
import { getServicesBySystemId } from "@/lib/queries/service"
import { getSystem } from "@/lib/queries/system"
import Decimal from "decimal.js"
import { Suspense } from "react"
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
    const { exchangeRate, localPlanId } = await searchParams

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

        if (!exchangeRate || !localPlanId) {
            return (
                <div className="flex flex-col gap-1 sm:px-8">
                    <SystemServiceHeader
                        systemId={systemId}
                        name={system.name}
                        description={system.description}
                    />
                    <Suspense key={systemId} fallback={<p>Loading...</p>}>
                        <SystemServicesSearch
                            systemId={systemId}
                            exchangeRate={exchangeRate}
                            localPlanId={localPlanId}
                        />
                    </Suspense>
                    <p className="mt-4">
                        Please check whether the provided Local Plan is valid.
                    </p>
                    <p>
                        Click on <span className="font-bold">Search</span> when
                        you are ready.
                    </p>
                </div>
            )
        }

        let exchangeRateDecimal: Decimal

        try {
            exchangeRateDecimal = new Decimal(exchangeRate)
        } catch (error) /* eslint-disable-line  @typescript-eslint/no-unused-vars */ {
            return (
                <>
                    <h2 className="mb-2 text-2xl">
                        Exchange Rate {exchangeRate} not valid
                    </h2>
                    <BackButton title="Go Back" variant="default" />
                </>
            )
        }

        const localPlanIdFilter = localPlanId ?? ""

        const result = await getServicesBySystemId(systemId, localPlanIdFilter)
        const services = result.map((service) => {
            return {
                ...service,
                systemAmount:
                    service.serviceCurrency === "EUR"
                        ? new Decimal(service.systemAmount)
                              .mul(exchangeRateDecimal)
                              .toFixed(2)
                        : service.systemAmount,
                runAmount:
                    service.serviceCurrency === "EUR"
                        ? new Decimal(service.systemRunAmount)
                              .mul(exchangeRateDecimal)
                              .toFixed(2)
                        : service.systemRunAmount,
                chgAmount:
                    service.serviceCurrency === "EUR"
                        ? new Decimal(service.systemChgAmount)
                              .mul(exchangeRateDecimal)
                              .toFixed(2)
                        : service.systemChgAmount,
            }
        })

        return (
            <div className="flex flex-col gap-1 sm:px-8">
                <SystemServiceHeader
                    systemId={systemId}
                    name={system.name}
                    description={system.description}
                />
                <Suspense key={systemId} fallback={<p>Loading...</p>}>
                    <SystemServicesSearch
                        systemId={systemId}
                        exchangeRate={exchangeRate}
                        localPlanId={localPlanId}
                    />
                </Suspense>
                <SystemServicesTable data={services} />
            </div>
        )
    } catch (error) {
        if (error instanceof Error) {
            return <p className="mt-4">Error: ${error.message}</p>
        }

        return <p className="mt-4">Unexpected error</p>
    }
}
