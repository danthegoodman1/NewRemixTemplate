import { PoolClient } from "pg"
import { pool } from "./db.server"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function inTransaction<T>(
  fn: (conn: PoolClient) => Promise<T>
): Promise<T> {
  const conn = await pool.connect()
  let retries = 0
  const maxRetries = 3

  try {
    while (true) {
      try {
        await conn.query("BEGIN")
        await conn.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
        const res = await fn(conn)
        await conn.query("COMMIT")
        return res
      } catch (e: any) {
        await conn.query("ROLLBACK")
        // Check for PostgreSQL serialization error code
        if (e.code === "40001" && retries < maxRetries) {
          retries++
          const delayMs = Math.pow(2, retries - 1) * 50 // Exponential backoff: 50ms, 100ms, 200ms
          console.warn(
            `Serialization error detected. Retrying transaction (attempt ${retries}/${maxRetries}) after ${delayMs}ms...`
          )
          await delay(delayMs)
          // Continue the loop to retry
          continue
        }
        // If it's not a serialization error or max retries reached, rethrow
        throw e
      }
    }
  } finally {
    await conn.release()
  }
}

export async function withConn(
  fn: (conn: PoolClient) => Promise<any>
): Promise<void> {
  const conn = await pool.connect()
  try {
    await fn(conn)
  } catch (e) {
    // TODO: handle specific errors for retrying
    throw e
  } finally {
    await conn.release()
  }
}
