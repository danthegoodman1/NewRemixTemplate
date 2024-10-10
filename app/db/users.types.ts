import { z } from "zod"

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
  scopes: z.string(),
  created_ms: z.string(),
  refresh_token: z.string().optional(),
  platform: z.enum(["twitch", "google"]),
})

export type UserRow = z.infer<typeof UserRow>
