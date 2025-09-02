import { Service } from "./service"

export interface ServiceRepository {
    insert(service: Service): Promise<void>
    update(service: Service): Promise<void>
    delete(serviceId: string): Promise<void>
    find(serviceId: string): Promise<Service | null>
    findManyByAgreementId(agreementId: string): Promise<Service[] | null>
}
