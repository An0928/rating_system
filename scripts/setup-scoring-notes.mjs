import mysql from "mysql2/promise"

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL is not set")
  process.exit(1)
}

const conn = await mysql.createConnection(url)

await conn.query(`
  CREATE TABLE IF NOT EXISTS scoring_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    post_id VARCHAR(255) NOT NULL,
    note TEXT NULL,
    flagged TINYINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_student_post (student_id, post_id)
  )
`)

console.log("[setup] scoring_notes table ready")

// Quick sanity check of the existing tables so we know column names line up.
for (const t of ["students", "posts", "submissions", "scoring_notes"]) {
  try {
    const [rows] = await conn.query(`SELECT COUNT(*) AS c FROM \`${t}\``)
    console.log(`[setup] ${t}: ${rows[0].c} rows`)
  } catch (e) {
    console.log(`[setup] ${t}: ERROR ${e.message}`)
  }
}

await conn.end()
