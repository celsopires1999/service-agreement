import { Agreement } from "@/core/agreement/domain/agreement"
import { AgreementDataBuilder } from "@/core/agreement/domain/agreement-data-builder"
import { AgreementDrizzleRepository } from "@/core/agreement/infra/db/drizzle/agreement-drizzle.repository"
import { PlanDataBuilder } from "@/core/plan/domain/plan-data-builder"
import { PlanDrizzleRepository } from "@/core/plan/infra/db/drizzle/plan-drizzle.repository"
import { ServiceDataBuilder } from "@/core/service/domain/service-data-builder"
import { ServiceDrizzleRepository } from "@/core/service/infra/db/drizzle/service-drizzle.repository"
import { SystemDataBuilder } from "@/core/system/domain/system-data-builder"
import { SystemDrizzleRepository } from "@/core/system/infra/db/drizzle/system-drizzle.repository"
import { UserListDataBuilder } from "@/core/users-list/domain/users-list-data-builder"
import { UserListDrizzleRepository } from "@/core/users-list/infra/db/drizzle/user-list-drizzle.repository"

type Repositories = {
    planRepository: PlanDrizzleRepository
    systemRepository: SystemDrizzleRepository
    agreementRepository: AgreementDrizzleRepository
    serviceRepository: ServiceDrizzleRepository
    userListRepository: UserListDrizzleRepository
}

export async function createAgreementRelations(
    repositories: Repositories,
): Promise<Agreement> {
    const {
        planRepository,
        systemRepository,
        agreementRepository,
        serviceRepository,
        userListRepository,
    } = repositories

    // Create Plans
    const providerPlan = PlanDataBuilder.aPlan().build()
    await planRepository.insert(providerPlan)

    const localPlan = PlanDataBuilder.aPlan().build()
    await planRepository.insert(localPlan)

    // Create Systems
    const systems = SystemDataBuilder.theSystems(4).build()

    for (const system of systems) {
        await systemRepository.insert(system)
    }

    // Create Agreement
    const agreement = AgreementDataBuilder.anAgreement()
        .withProviderPlanId(providerPlan.planId)
        .withLocalPlanId(localPlan.planId)
        .build()
    await agreementRepository.insert(agreement)

    // Create Services
    const services = ServiceDataBuilder.theServices(3)
        .withAgreementId(agreement.agreementId)
        .withServiceSystems([
            {
                systemId: systems[0].systemId,
                allocation: "40",
            },
            {
                systemId: systems[1].systemId,
                allocation: "10",
            },
            {
                systemId: systems[2].systemId,
                allocation: "35",
            },
            {
                systemId: systems[3].systemId,
                allocation: "15",
            },
        ])
        .build()

    for (const service of services) {
        await serviceRepository.insert(service)

        // Create User List for each Service
        const userList = UserListDataBuilder.aUserList()
            .withServiceId(service.serviceId)
            .build()
        await userListRepository.save(userList)
    }

    return agreement
}
