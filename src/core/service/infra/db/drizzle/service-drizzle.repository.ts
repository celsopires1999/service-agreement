import { Service } from "@/core/service/domain/service"
import { ServiceRepository } from "@/core/service/domain/service.repository"
import { ServiceSystem } from "@/core/service/domain/serviceSystems"
import { ValidationError } from "@/core/shared/domain/validators/validation.error"
import { DB } from "@/db"
import { services, serviceSystems } from "@/db/schema"
import { and, count, eq, or } from "drizzle-orm"

export class ServiceDrizzleRepository implements ServiceRepository {
    constructor(private readonly db: DB) {}

    async insert(service: Service) {
        await this.db.insert(services).values({
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
            status: service.status,
            validatorEmail: service.validatorEmail,
            documentUrl: service.documentUrl,
        })

        const serviceId = service.serviceId

        for (const serviceSystem of service.serviceSystems) {
            await this.db.insert(serviceSystems).values({
                serviceId,
                systemId: serviceSystem.systemId,
                allocation: serviceSystem.allocation,
                runAmount: serviceSystem.runAmount,
                chgAmount: serviceSystem.chgAmount,
                amount: serviceSystem.amount,
                currency: serviceSystem.currency,
            })
        }
    }

    async update(service: Service) {
        const result = await this.db
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
                status: service.status,
                validatorEmail: service.validatorEmail,
                documentUrl: service.documentUrl,
            })
            .where(eq(services.serviceId, service.serviceId))
            .returning({ updatedId: services.serviceId })

        if (result[0].updatedId !== service.serviceId) {
            throw new ValidationError(
                `Service ID #${service.serviceId} not found`,
            )
        }

        await this.db
            .delete(serviceSystems)
            .where(eq(serviceSystems.serviceId, service.serviceId))

        for (const serviceSystem of service.serviceSystems) {
            await this.db.insert(serviceSystems).values({
                serviceId: serviceSystem.serviceId,
                systemId: serviceSystem.systemId,
                allocation: serviceSystem.allocation,
                runAmount: serviceSystem.runAmount,
                chgAmount: serviceSystem.chgAmount,
                amount: serviceSystem.amount,
                currency: serviceSystem.currency,
            })
        }
    }

    async delete(serviceId: string): Promise<void> {
        const foundService = await this.find(serviceId)

        if (!foundService) {
            throw new ValidationError(`Service ID #${serviceId} not found`)
        }

        await this.db
            .delete(serviceSystems)
            .where(eq(serviceSystems.serviceId, foundService.serviceId))

        await this.db.delete(services).where(eq(services.serviceId, serviceId))
    }

    async find(serviceId: string): Promise<Service | null> {
        const serviceModel = await this.db.query.services.findFirst({
            where: eq(services.serviceId, serviceId),
        })

        if (!serviceModel) {
            return null
        }

        const serviceSystemModels = await this.db.query.serviceSystems.findMany(
            {
                where: eq(serviceSystems.serviceId, serviceId),
            },
        )

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

    async findManyByAgreementId(
        agreementId: string,
    ): Promise<Service[] | null> {
        const serviceModels = await this.db.query.services.findMany({
            where: eq(services.agreementId, agreementId),
        })

        if (!serviceModels.length) {
            return null
        }

        const serviceEntities = await Promise.all(
            serviceModels.map(async (serviceModel) => {
                const serviceSystemEntities = await this.db.query.serviceSystems
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

    async countNotValidatedServicesByAgreementId(
        agreementId: string,
    ): Promise<number> {
        const resultNotValidated = await this.db
            .select({
                totalNotValidatedServices: count(),
            })
            .from(services)
            .where(
                and(
                    eq(services.agreementId, agreementId),
                    or(
                        eq(services.status, "created"),
                        eq(services.status, "assigned"),
                    ),
                ),
            )

        return resultNotValidated[0].totalNotValidatedServices
    }
}
