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
} from "drizzle-orm/pg-core"

import { relations } from "drizzle-orm"

export const agreements = pgTable("agreements", {
    agreementId: uuid("agreement_id").defaultRandom().primaryKey(),
    year: integer("year").notNull(),
    revision: integer("revision").notNull(),
    revisionDate: date("revision_date", { mode: "string" }).notNull(),
    name: varchar("name").notNull(),
    description: text("description").notNull(),
    contactEmail: varchar("contact_email").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
})

export const currencyEnum = pgEnum("currency", ["EUR", "USD"])

export const services = pgTable("services", {
    serviceId: uuid("service_id").defaultRandom().primaryKey(),
    agreementId: uuid("agreement_id")
        .notNull()
        .references(() => agreements.agreementId),
    name: varchar("name").notNull(),
    description: text("description").notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: currencyEnum("currency").notNull(),
    responsibleEmail: varchar("responsible_email").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
})

export const systems = pgTable("systems", {
    systemId: uuid("system_id").defaultRandom().primaryKey(),
    name: varchar("name").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
})

export const servicesSystems = pgTable(
    "services_systems",
    {
        serviceId: uuid("service_id")
            .notNull()
            .references(() => services.serviceId),
        systemId: uuid("system_id")
            .notNull()
            .references(() => systems.systemId),
        allocation: decimal("allocation", { precision: 5, scale: 2 }).notNull(),
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

// Create relations
export const agreementsRelations = relations(agreements, ({ many }) => ({
    services: many(services),
}))

export const servicesRelations = relations(services, ({ one, many }) => ({
    agreement: one(agreements, {
        fields: [services.agreementId],
        references: [agreements.agreementId],
    }),
    systems: many(servicesSystems),
}))

export const systemsRelations = relations(systems, ({ many }) => ({
    services: many(servicesSystems),
}))
