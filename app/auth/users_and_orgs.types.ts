import { z } from "zod/v4"

export const APIKeyRoleSchema = z.enum([
  "viewer",
  "editor",
  "developer",
  "admin",
  "superadmin",
])
export type APIKeyRole = z.infer<typeof APIKeyRoleSchema>

export const OrgSchema = z.object({
  ID: z.string(),
  Domain: z.string().nullable(),
  Data: z.object({
    Name: z.string(),
    DefaultRole: APIKeyRoleSchema.nullable(),
    IncludedSeconds: z.number().int(),
    BillingDoMStart: z.number().int().max(28),
  }),
  CreatedAt: z.date(),
  UpdatedAt: z.date(),
})

export type Org = z.infer<typeof OrgSchema>

export const UserSchema = z.object({
  ID: z.string(),
  Email: z.string(),
  OrgID: z.string(),
  Data: z.object({
    PersonalAPIKeyID: z.string().optional(),
    GoogleAuth: z.object({}).nullable().optional(),
    MFACode: z.string().optional(), // enabled if not empty string
    AuditLogEntries: z.array(z.string()).optional(),
  }),
  CreatedAt: z.date(),
  UpdatedAt: z.date(),
})

export type User = z.infer<typeof UserSchema>
