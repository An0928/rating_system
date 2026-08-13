"use server"

import { revalidatePath } from "next/cache"
import { query } from "@/lib/db"
import { getScoringNote } from "@/lib/queries"

export interface SaveNoteResult {
  ok: boolean
  flagged: boolean
  note: string
  message: string
}

/**
 * Upsert the scoring note (text + flagged) for a student/post pair.
 */
export async function saveScoringNote(formData: FormData): Promise<SaveNoteResult> {
  const studentId = String(formData.get("student_id") ?? "").trim()
  const postId = String(formData.get("post_id") ?? "").trim()
  const note = String(formData.get("note") ?? "")
  const flagged = formData.get("flagged") === "on" || formData.get("flagged") === "1" ? 1 : 0

  if (!studentId || !postId) {
    return { ok: false, flagged: false, note, message: "缺少 student_id 或 post_id" }
  }

  await query(
    `INSERT INTO scoring_notes (student_id, post_id, note, flagged)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE note = VALUES(note), flagged = VALUES(flagged)`,
    [studentId, postId, note === "" ? null : note, flagged],
  )

  revalidatePath("/")
  revalidatePath(`/submissions`)

  return {
    ok: true,
    flagged: flagged === 1,
    note,
    message: "已儲存評分備註",
  }
}

/**
 * Toggle only the flagged state (used by the flag button for instant feedback).
 */
export async function toggleFlag(studentId: string, postId: string): Promise<SaveNoteResult> {
  const existing = await getScoringNote(studentId, postId)
  const nextFlag = existing?.flagged ? 0 : 1
  const note = existing?.note ?? null

  await query(
    `INSERT INTO scoring_notes (student_id, post_id, note, flagged)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE flagged = VALUES(flagged)`,
    [studentId, postId, note, nextFlag],
  )

  revalidatePath("/")

  return {
    ok: true,
    flagged: nextFlag === 1,
    note: note ?? "",
    message: nextFlag ? "已標記為需要注意" : "已取消標記",
  }
}
