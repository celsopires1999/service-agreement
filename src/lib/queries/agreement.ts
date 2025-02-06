import "server-only"

import { db } from "@/db"
import { agreements, plans, services, serviceSystems } from "@/db/schema"
import { asc, desc, eq, ilike, max, or, and } from "drizzle-orm"

export async function getAgreement(agreementId: string) {
    const agreement = await db
        .select({
            agreementId: agreements.agreementId,
            year: agreements.year,
            code: agreements.code,
            revision: agreements.revision,
            isRevised: agreements.isRevised,
            revisionDate: agreements.revisionDate,
            providerPlanId: agreements.providerPlanId,
            localPlanId: agreements.localPlanId,
            name: agreements.name,
            description: agreements.description,
            contactEmail: agreements.contactEmail,
            comment: agreements.comment,
            localPlan: plans.code,
        })
        .from(agreements)
        .innerJoin(plans, eq(plans.planId, agreements.localPlanId))
        .where(eq(agreements.agreementId, agreementId))
        .limit(1)

    return agreement[0]
}

export type getAgreementType = Awaited<ReturnType<typeof getAgreement>>

export async function getAgreementSearchResults(
    localPlanId: string,
    searchText: string,
) {
    let searchWithLocalPlan = true

    if (
        localPlanId === "all" ||
        localPlanId === "" ||
        localPlanId === null ||
        localPlanId === undefined
    ) {
        searchWithLocalPlan = false
    }

    return db
        .select({
            agreementId: agreements.agreementId,
            year: agreements.year,
            code: agreements.code,
            revision: agreements.revision,
            isRevised: agreements.isRevised,
            revisionDate: agreements.revisionDate,
            providerPlanId: agreements.providerPlanId,
            localPlanId: agreements.localPlanId,
            name: agreements.name,
            description: agreements.description,
            contactEmail: agreements.contactEmail,
            comment: agreements.comment,
            localPlan: plans.code,
        })
        .from(agreements)
        .where(
            !searchWithLocalPlan
                ? or(
                      ilike(agreements.code, `%${searchText}%`),
                      ilike(agreements.name, `%${searchText}%`),
                      ilike(agreements.contactEmail, `%${searchText}%`),
                  )
                : and(
                      or(
                          ilike(agreements.code, `%${searchText}%`),
                          ilike(agreements.name, `%${searchText}%`),
                          ilike(agreements.contactEmail, `%${searchText}%`),
                      ),
                      eq(agreements.localPlanId, localPlanId),
                  ),
        )
        .innerJoin(plans, eq(plans.planId, agreements.localPlanId))
        .orderBy(
            asc(agreements.code),
            desc(agreements.year),
            desc(agreements.revision),
        )
}

export type getAgreementSearchResultsType = Awaited<
    ReturnType<typeof getAgreementSearchResults>
>[number]

export async function getLastYearBySystemId(systemId: string) {
    return db
        .selectDistinct({
            year: agreements.year,
            localPlanId: agreements.localPlanId,
            revision: agreements.revision,
        })
        .from(agreements)
        .innerJoin(services, eq(services.agreementId, agreements.agreementId))
        .innerJoin(
            serviceSystems,
            eq(serviceSystems.serviceId, services.serviceId),
        )
        .where(eq(serviceSystems.systemId, systemId))
        .orderBy(desc(agreements.year), desc(agreements.revision))
        .limit(1)
}

export async function getAgreementLastReviewSearchResults(searchText: string) {
    const t2 = db
        .select({
            code: agreements.code,
            maxRevision: max(agreements.revision).as("maxRevision"),
        })
        .from(agreements)
        .groupBy(agreements.code)
        .as("t2")

    return db
        .select({
            agreementId: agreements.agreementId,
            year: agreements.year,
            code: agreements.code,
            revision: agreements.revision,
            isRevised: agreements.isRevised,
            revisionDate: agreements.revisionDate,
            providerPlanId: agreements.providerPlanId,
            localPlanId: agreements.localPlanId,
            name: agreements.name,
            description: agreements.description,
            contactEmail: agreements.contactEmail,
            comment: agreements.comment,
            localPlan: plans.code,
        })
        .from(agreements)
        .innerJoin(
            t2,
            and(
                eq(t2.code, agreements.code),
                eq(t2.maxRevision, agreements.revision),
            ),
        )
        .innerJoin(plans, eq(plans.planId, agreements.localPlanId))
        .where(
            or(
                ilike(agreements.code, `%${searchText}%`),
                ilike(agreements.name, `%${searchText}%`),
                ilike(agreements.contactEmail, `%${searchText}%`),
            ),
        )
        .orderBy(
            asc(agreements.code),
            desc(agreements.year),
            desc(agreements.revision),
        )
}
