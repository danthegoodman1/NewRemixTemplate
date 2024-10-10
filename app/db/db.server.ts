import pkg from "pg"
const { Pool } = pkg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  min: 1,
  max: 10,
})
