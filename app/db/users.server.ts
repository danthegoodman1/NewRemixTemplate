import { logger } from "app/logger"
import { UserRow } from "./users.types"
import { extractError } from "app/utils"
import { RowsNotFound } from "./errors"
import { randomUUID } from "crypto"
import { PoolClient } from "pg"

export async function createOrGetUser(
  conn: PoolClient,
  email: string,
  name: string,
  platform: "twitch" | "google",
  scopes: string[],
  refreshToken?: string
): Promise<UserRow> {
  try {
    // Update the scopes and platforms if the user already exists
    const result = await conn.query<UserRow>(
      `UPDATE users
       SET ${platform === "twitch" ? "twitch_scopes" : "google_scopes"} = $1,
           platforms = CASE
             WHEN NOT $2 = ANY(platforms) THEN array_append(platforms, $2)
             ELSE platforms
           END,
           refresh_token = COALESCE($3, refresh_token)
       WHERE email = $4
       RETURNING *`,
      [scopes, platform, refreshToken, email]
    )
    let user = result.rows.length > 0 ? result.rows[0] : undefined

    if (!user) {
      const id = randomUUID()
      user = (
        await conn.query<UserRow>(
          `INSERT INTO users (
             id, email, name, created_ms, refresh_token,
             ${platform === "twitch" ? "twitch_scopes" : "google_scopes"},
             platforms
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            id,
            email,
            name,
            new Date().getTime(),
            refreshToken,
            scopes,
            [platform],
          ]
        )
      ).rows[0]
    }

    // TODO: background launch any user creation jobs (deduped)

    return user
  } catch (error) {
    logger.error(
      {
        err: extractError(error),
      },
      "error in createOrGetUser"
    )
    throw error
  }
}

export async function selectUserById(
  conn: PoolClient,
  id: string
): Promise<UserRow> {
  const result = await conn.query<UserRow>(
    `SELECT *
     FROM users
     WHERE id = $1`,
    [id]
  )

  if (result.rows.length === 0) {
    throw new RowsNotFound()
  }

  return result.rows[0]
}

export async function selectUserByEmail(
  conn: PoolClient,
  email: string
): Promise<UserRow> {
  const result = await conn.query<UserRow>(
    `SELECT *
     FROM users
     WHERE email = $1`,
    [email]
  )

  if (result.rows.length === 0) {
    throw new RowsNotFound()
  }

  return result.rows[0]
}

export async function updateUserRefreshToken(
  conn: PoolClient,
  id: string,
  refreshToken: string
) {
  await conn.query(
    `UPDATE users
     SET refresh_token = $1
     WHERE id = $2`,
    [refreshToken, id]
  )
}

/**
 * Get a user by their code or id
 */
export async function getUserBySlugOrId(
  conn: PoolClient,
  slugOrUserId: string
): Promise<UserRow> {
  const result = await conn.query<UserRow>(
    `SELECT *
     FROM users
     WHERE id = $1 OR slug = $1`,
    [slugOrUserId]
  )

  if (result.rows.length === 0) {
    throw new RowsNotFound()
  }

  return result.rows[0]
}

export async function setUserSlug(
  conn: PoolClient,
  userId: string,
  slug: string
): Promise<void> {
  const result = await conn.query(
    `UPDATE users
     SET code = $1
     WHERE id = $2`,
    [slug, userId]
  )

  if (result.rowCount === 0) {
    throw new RowsNotFound()
  }
}
