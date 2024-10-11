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
  authData: {
    platform: string
    scopes: string[]
    refreshToken?: string
    id?: string
  }
): Promise<UserRow> {
  try {
    // First, try to select the existing user
    const selectResult = await conn.query<UserRow>(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    )

    let user: UserRow | undefined
    if (selectResult.rows.length > 0) {
      user = selectResult.rows[0]
      // User exists, update the auth
      const updatedAuth = {
        ...user.auth,
        [authData.platform]: {
          refreshToken: authData.refreshToken,
          scopes: authData.scopes,
          id: authData.id,
        },
      }

      const updateResult = await conn.query<UserRow>(
        `UPDATE users
         SET auth = $1
         WHERE email = $2
         RETURNING *`,
        [JSON.stringify(updatedAuth), email]
      )
      user = updateResult.rows[0]
    } else {
      // User doesn't exist, create a new one
      const id = randomUUID()
      const newAuth = {
        [authData.platform]: {
          refreshToken: authData.refreshToken,
          scopes: authData.scopes,
          id: authData.id,
        },
      }
      const insertResult = await conn.query<UserRow>(
        `INSERT INTO users (
           id, email, name, created_ms, auth
         )
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, email, name, new Date().getTime(), JSON.stringify(newAuth)]
      )
      user = insertResult.rows[0]
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
