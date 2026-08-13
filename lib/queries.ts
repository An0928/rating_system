import { query } from "./db"
import type { SubmissionRow, SubmissionDetail, ScoringNote } from "./types"

export interface SubmissionFilters {
  group?: "structured" | "unstructured" | ""
  week?: string
  judgment?: string
  studentId?: string
}

/**
 * List submissions joined with student group + post metadata + flagged status.
 */
export async function getSubmissions(filters: SubmissionFilters = {}): Promise<SubmissionRow[]> {
  const where: string[] = []
  const params: any[] = []

  if (filters.group === "structured") where.push("st.is_structured = 1")
  if (filters.group === "unstructured") where.push("st.is_structured = 0")

  if (filters.week && filters.week !== "") {
    where.push("p.week = ?")
    params.push(Number(filters.week))
  }

  if (filters.judgment && filters.judgment !== "") {
    where.push("s.judgment = ?")
    params.push(filters.judgment)
  }

  if (filters.studentId && filters.studentId.trim() !== "") {
    where.push("s.student_id = ?")
    params.push(filters.studentId.trim())
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : ""

  return query<SubmissionRow>(
    `SELECT
       s.id,
       s.student_id,
       s.post_id,
       s.judgment,
       s.completed_at,
       st.is_structured,
       p.week,
       p.slot,
       p.caption,
       CASE WHEN sn.flagged = 1 THEN 1 ELSE 0 END AS flagged
     FROM submissions s
     LEFT JOIN students st ON st.student_id = s.student_id
     LEFT JOIN posts p ON p.id = s.post_id
     LEFT JOIN scoring_notes sn ON sn.student_id = s.student_id AND sn.post_id = s.post_id
     ${whereSql}
     ORDER BY s.completed_at DESC`,
    params,
  )
}

/**
 * Distinct week numbers available for the filter dropdown.
 */
export async function getWeeks(): Promise<number[]> {
  const rows = await query<{ week: number }>(
    `SELECT DISTINCT p.week AS week
     FROM submissions s
     JOIN posts p ON p.id = s.post_id
     WHERE p.week IS NOT NULL
     ORDER BY p.week ASC`,
  )
  return rows.map((r) => r.week)
}

/**
 * Full detail for a single submission.
 */
export async function getSubmissionDetail(id: number): Promise<SubmissionDetail | null> {
  const rows = await query<SubmissionDetail>(
    `SELECT
       s.id,
       s.student_id,
       s.post_id,
       s.judgment,
       s.chat_log,
       s.completed_at,
       st.is_structured,
       p.week,
       p.slot,
       p.username,
       p.handle,
       p.caption,
       p.image_url,
       p.image_description,
       p.likes
     FROM submissions s
     LEFT JOIN students st ON st.student_id = s.student_id
     LEFT JOIN posts p ON p.id = s.post_id
     WHERE s.id = ?
     LIMIT 1`,
    [id],
  )
  return rows[0] ?? null
}

/**
 * Existing scoring note for a student/post pair, if any.
 */
export async function getScoringNote(studentId: string, postId: string): Promise<ScoringNote | null> {
  const rows = await query<ScoringNote>(
    `SELECT * FROM scoring_notes WHERE student_id = ? AND post_id = ? LIMIT 1`,
    [studentId, postId],
  )
  return rows[0] ?? null
}
