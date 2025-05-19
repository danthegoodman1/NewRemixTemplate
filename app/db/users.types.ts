import { z } from "zod/v4"
import { refreshToken } from "~/auth/google.server"

/**
 * Emails are the primary mechanism for identifying users, but they also have unique IDs
 * so that we can relate information without using PII.
 */

export const UserRow = z.object({
  id: z.string(),
  /**
   * This is a slug that can be used to identify the user in a URL
   */
  slug: z.string().optional(),
  email: z.string().email(),
  name: z.string(),
  /**
   * Key value of platform to auth info
   */
  auth: z.record(
    z.string(),
    z.object({
      refreshToken: z.string(),
      scopes: z.array(z.string()),
      id: z.string().optional(),
    })
  ),
  created_ms: z.string(),
})

export type UserRow = z.infer<typeof UserRow>
