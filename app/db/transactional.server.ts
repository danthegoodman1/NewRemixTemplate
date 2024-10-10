import { PoolClient } from "pg"
import { pool } from "./db.server"

export default async function inTransaction<T>(
  fn: (conn: PoolClient) => Promise<T>
): Promise<void> {
  const conn = await pool.connect()
  try {
    await conn.query("BEGIN")
    await conn.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
    await fn(conn)
    await conn.query("COMMIT")
  } catch (e) {
    await conn.query("ROLLBACK")
    // TODO: handle specific errors for retrying
    throw e
  } finally {
    await conn.release()
  }
}
