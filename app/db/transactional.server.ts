import { PoolClient } from "pg"
import { pool } from "./db.server"

export async function inTransaction(
  fn: (conn: PoolClient) => Promise<any>
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
