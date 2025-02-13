import { Service } from "@/core/service/domain/service"
import { ServiceSystem } from "@/core/service/domain/serviceSystems"
import { db } from "@/db"
import { services, serviceSystems } from "@/db/schema"
import { eq } from "drizzle-orm"

export class ServiceDrizzleRepository {
    async insert(service: Service) {
        return await db.transaction(async (tx) => {
            const result = await tx
                .insert(services)
                .values({
                    serviceId: service.serviceId,
                    agreementId: service.agreementId,
                    name: service.name,
                    description: service.description,
                    runAmount: service.runAmount,
                    chgAmount: service.chgAmount,
                    amount: service.amount,
                    currency: service.currency,
                    responsibleEmail: service.responsibleEmail,
                    isActive: service.isActive,
                    providerAllocation: service.providerAllocation,
                    localAllocation: service.localAllocation,
                    isValidated: service.isValidated,
                    validatorEmail: service.validatorEmail,
                })
                .returning({ insertedId: services.serviceId })

            const serviceId = result[0].insertedId

            for (const serviceSystem of service.serviceSystems) {
                await tx.insert(serviceSystems).values({
                    serviceId,
                    systemId: serviceSystem.systemId,
                    allocation: serviceSystem.allocation,
                    runAmount: serviceSystem.runAmount,
                    chgAmount: serviceSystem.chgAmount,
                    amount: serviceSystem.amount,
                    currency: serviceSystem.currency,
                })
            }

            return serviceId
        })
    }

    async findById(serviceId: string): Promise<Service | null> {
        const serviceModel = await db.query.services.findFirst({
            where: eq(services.serviceId, serviceId),
        })

        if (!serviceModel) {
            return null
        }

        const serviceSystemModels = await db.query.serviceSystems.findMany({
            where: eq(serviceSystems.serviceId, serviceId),
        })

        const serviceSystemEntities = serviceSystemModels.map(
            (serviceSystemModel) => {
                return new ServiceSystem({
                    serviceId: serviceSystemModel.serviceId,
                    systemId: serviceSystemModel.systemId,
                    allocation: serviceSystemModel.allocation,
                    runAmount: serviceSystemModel.runAmount,
                    chgAmount: serviceSystemModel.chgAmount,
                    amount: serviceSystemModel.amount,
                    currency: serviceSystemModel.currency,
                })
            },
        )

        return new Service({
            ...serviceModel,
            serviceSystems: serviceSystemEntities,
        })
    }

    async update(service: Service) {
        return await db.transaction(async (tx) => {
            const result = await tx
                .update(services)
                .set({
                    name: service.name,
                    description: service.description,
                    runAmount: service.runAmount,
                    chgAmount: service.chgAmount,
                    amount: service.amount,
                    currency: service.currency,
                    responsibleEmail: service.responsibleEmail,
                    isActive: service.isActive,
                    providerAllocation: service.providerAllocation,
                    localAllocation: service.localAllocation,
                    isValidated: service.isValidated,
                    validatorEmail: service.validatorEmail,
                })
                .where(eq(services.serviceId, service.serviceId))
                .returning({ updatedId: services.serviceId })

            if (result[0].updatedId !== service.serviceId) {
                throw new Error(`Service ID #${service.serviceId} not found`)
            }

            await tx
                .delete(serviceSystems)
                .where(eq(serviceSystems.serviceId, service.serviceId))

            for (const serviceSystem of service.serviceSystems) {
                await tx.insert(serviceSystems).values({
                    serviceId: serviceSystem.serviceId,
                    systemId: serviceSystem.systemId,
                    allocation: serviceSystem.allocation,
                    runAmount: serviceSystem.runAmount,
                    chgAmount: serviceSystem.chgAmount,
                    amount: serviceSystem.amount,
                    currency: serviceSystem.currency,
                })
            }

            return service.serviceId
        })
    }

    async findManyByAgreementId(
        agreementId: string,
    ): Promise<Service[] | null> {
        const serviceModels = await db.query.services.findMany({
            where: eq(services.agreementId, agreementId),
        })

        if (!serviceModels.length) {
            return null
        }

        const serviceEntities = await Promise.all(
            serviceModels.map(async (serviceModel) => {
                const serviceSystemEntities = await db.query.serviceSystems
                    .findMany({
                        where: eq(
                            serviceSystems.serviceId,
                            serviceModel.serviceId,
                        ),
                    })
                    .then((serviceSystemModels) =>
                        serviceSystemModels.map(
                            (serviceSystemModel) =>
                                new ServiceSystem({
                                    serviceId: serviceSystemModel.serviceId,
                                    systemId: serviceSystemModel.systemId,
                                    allocation: serviceSystemModel.allocation,
                                    runAmount: serviceSystemModel.runAmount,
                                    chgAmount: serviceSystemModel.chgAmount,
                                    amount: serviceSystemModel.amount,
                                    currency: serviceSystemModel.currency,
                                }),
                        ),
                    )

                return new Service({
                    ...serviceModel,
                    serviceSystems: serviceSystemEntities,
                })
            }),
        )

        return serviceEntities
    }
}
