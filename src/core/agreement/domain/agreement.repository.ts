import { Agreement } from "./agreement"

export interface AgreementRepository {
    insert(plan: Agreement): Promise<void>
    update(plan: Agreement): Promise<void>
    delete(planId: string): Promise<void>
    find(planId: string): Promise<Agreement | null>
    countRevisions(year: number, code: string): Promise<number>
}
