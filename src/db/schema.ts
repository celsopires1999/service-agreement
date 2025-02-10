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
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (t) => [unique().on(t.year, t.code, t.localPlanId)],
)

export const currencyEnum = pgEnum("currency", ["EUR", "USD"])

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
}))

export const systemsRelations = relations(systems, ({ many }) => ({
    services: many(serviceSystems),
}))
