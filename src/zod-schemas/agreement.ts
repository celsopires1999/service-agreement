import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { agreements } from "@/db/schema";

export const insertAgreementSchema = createInsertSchema(agreements, {
  year: (schema) => schema.min(1, "Year is required"),
  version: (schema) => schema.min(1, "Version is required"),
  date: (schema) =>
    schema.refine((value) => value instanceof Date && !isNaN(value.getTime()), {
      message: "Must be a valid date",
    }),
  name: (schema) =>
    schema
      .min(1, "Name is required")
      .max(100, "Name must be 100 characters or less"),
  description: (schema) =>
    schema
      .min(1, "Description is required")
      .max(500, "Description must be 500 characters or less"),
  contactEmail: (schema) => schema.email("Invalid email address"),
  comment: (schema) =>
    schema.max(500, "Comment must be 500 characters or less"),
});

export const selectAgreementSchema = createSelectSchema(agreements);

export type insertAgreementSchemaType = typeof insertAgreementSchema._type;

export type selectAgreementSchemaType = typeof selectAgreementSchema._type;
