import mysql from "mysql2/promise"

// A singleton pool so we don't exhaust connections during dev hot-reloads.
declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined
}

function createPool() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return mysql.createPool(url)
}

export const pool: mysql.Pool = global._mysqlPool ?? createPool()

if (process.env.NODE_ENV !== "production") {
  global._mysqlPool = pool
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await pool.query(sql, params)
  return rows as T[]
}
