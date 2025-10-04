import {
    pgTable,
    text,
    timestamp,
    varchar,
    uuid,
    integer,
    decimal,
    pgEnum,
    primaryKey,
    date,
    unique,
    boolean,
} from "drizzle-orm/pg-core"

import { relations } from "drizzle-orm"
import { ServiceStatus } from "@/core/service/domain/service.types"
import { Role } from "@/core/user/domain/role"
// import { Role } from "@/core/user/domain/user"

export const plans = pgTable(
    "plans",
    {
        planId: uuid("plan_id").defaultRandom().primaryKey(),
        code: varchar("code").notNull(),
        description: text("description").notNull(),
        euro: decimal("euro", { precision: 8, scale: 4 }).notNull(),
        planDate: date("plan_date", { mode: "string" }).notNull(),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (t) => [unique().on(t.code)],
)

export const agreements = pgTable(
    "agreements",
    {
        agreementId: uuid("agreement_id").defaultRandom().primaryKey(),
        year: integer("year").notNull(),
        code: varchar("code").notNull(),
        revision: integer("revision").notNull().default(1),
        isRevised: boolean("is_revised").notNull().default(false),
        revisionDate: date("revision_date", { mode: "string" }).notNull(),
        providerPlanId: uuid("provider_plan_id")
            .notNull()
            .references(() => plans.planId),
        localPlanId: uuid("local_plan_id")
            .notNull()
            .references(() => plans.planId),
        name: varchar("name").notNull(),
        description: text("description").notNull(),
        contactEmail: varchar("contact_email").notNull(),
        comment: text("comment"),
        documentUrl: text("document_url"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (t) => [unique().on(t.year, t.code, t.localPlanId)],
)

export const currencyEnum = pgEnum("currency", ["EUR", "USD"])

export function enumToPgEnum<T extends Record<string, any>>( // eslint-disable-line  @typescript-eslint/no-explicit-any
    myEnum: T,
): [T[keyof T], ...T[keyof T][]] {
    return Object.values(myEnum).map((value: any) => `${value}`) as any // eslint-disable-line  @typescript-eslint/no-explicit-any
}

export const serviceStatusEnum = pgEnum(
    "service_status",
    enumToPgEnum(ServiceStatus),
)

export const services = pgTable(
    "services",
    {
        serviceId: uuid("service_id").defaultRandom().primaryKey(),
        agreementId: uuid("agreement_id")
            .notNull()
            .references(() => agreements.agreementId),
        name: varchar("name").notNull(),
        description: text("description").notNull(),
        runAmount: decimal("run_amount", { precision: 12, scale: 2 }).notNull(),
        chgAmount: decimal("chg_amount", { precision: 12, scale: 2 }).notNull(),
        amount: decimal("amount", { precision: 12, scale: 2 })
            .notNull()
            .default("0.00"),
        currency: currencyEnum("currency").notNull(),
        responsibleEmail: varchar("responsible_email").notNull(),
        providerAllocation: text("provider_allocation").notNull(),
        localAllocation: text("local_allocation").notNull(),
        isActive: boolean("is_active").notNull().default(false),
        validatorEmail: varchar("validator_email").notNull(),
        status: serviceStatusEnum("status").notNull().default("created"),
        documentUrl: text("document_url"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (t) => [unique().on(t.agreementId, t.name)],
)

export const systems = pgTable("systems", {
    systemId: uuid("system_id").defaultRandom().primaryKey(),
    name: varchar("name").unique().notNull(),
    description: text("description").notNull(),
    applicationId: varchar("application_id").unique().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
})

export const serviceSystems = pgTable(
    "service_systems",
    {
        serviceId: uuid("service_id")
            .notNull()
            .references(() => services.serviceId),
        systemId: uuid("system_id")
            .notNull()
            .references(() => systems.systemId),
        allocation: decimal("allocation", { precision: 9, scale: 6 }).notNull(),
        runAmount: decimal("run_amount", { precision: 12, scale: 2 }).notNull(),
        chgAmount: decimal("chg_amount", { precision: 12, scale: 2 }).notNull(),
        amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
        currency: currencyEnum("currency").notNull(),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (t) => [primaryKey({ columns: [t.serviceId, t.systemId] })],
)

export const userLists = pgTable(
    "user_lists",
    {
        userListId: uuid("user_list_id").defaultRandom().primaryKey(),
        serviceId: uuid("service_id")
            .notNull()
            .references(() => services.serviceId),
        usersNumber: integer("users_number").notNull(),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (t) => [unique().on(t.serviceId)],
)

export const userListItems = pgTable("user_list_items", {
    userListItemId: uuid("user_list_item_id").defaultRandom().primaryKey(),
    userListId: uuid("user_list_id")
        .notNull()
        .references(() => userLists.userListId),
    name: varchar("name").notNull(),
    email: varchar("email").notNull(),
    corpUserId: varchar("corp_user_id").notNull(),
    area: varchar("area").notNull(),
    costCenter: varchar("cost_center").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
})

export const roleEnum = pgEnum("role", enumToPgEnum(Role))

export const users = pgTable("users", {
    userId: uuid("user_id").defaultRandom().primaryKey(),
    email: varchar("email").notNull().unique(),
    name: varchar("name").notNull(),
    role: roleEnum("role").notNull().default("viewer"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
})

// Create relations
export const agreementsRelations = relations(agreements, ({ many }) => ({
    services: many(services),
}))

export const servicesRelations = relations(services, ({ one, many }) => ({
    agreement: one(agreements, {
        fields: [services.agreementId],
        references: [agreements.agreementId],
    }),
    systems: many(serviceSystems),
    userLists: many(userLists),
}))

export const systemsRelations = relations(systems, ({ many }) => ({
    services: many(serviceSystems),
}))

export const serviceSystemsRelations = relations(serviceSystems, ({ one }) => ({
    service: one(services, {
        fields: [serviceSystems.serviceId],
        references: [services.serviceId],
    }),
    system: one(systems, {
        fields: [serviceSystems.systemId],
        references: [systems.systemId],
    }),
}))

export const userListsRelations = relations(userLists, ({ one, many }) => ({
    service: one(services, {
        fields: [userLists.serviceId],
        references: [services.serviceId],
    }),
    items: many(userListItems),
}))

export const userListItemsRelations = relations(userListItems, ({ one }) => ({
    userList: one(userLists, {
        fields: [userListItems.userListId],
        references: [userLists.userListId],
    }),
}))
