"use server"

import { revalidatePath } from "next/cache"
import { query } from "@/lib/db"
import { getScoringNote } from "@/lib/queries"
import { countTurns } from "@/lib/parse-chat-log"

export interface SaveNoteResult {
  ok: boolean
  flagged: boolean
  note: string
  message: string
}

/**
 * Upsert the scoring note (text + flagged + scores) for a student/post pair.
 */
export async function saveScoringNote(formData: FormData): Promise<SaveNoteResult> {
  const studentId = String(formData.get("student_id") ?? "").trim()
  const postId = String(formData.get("post_id") ?? "").trim()
  const note = String(formData.get("note") ?? "")
  const flagged = formData.get("flagged") === "on" || formData.get("flagged") === "1" ? 1 : 0

  if (!studentId || !postId) {
    return { ok: false, flagged: false, note, message: "缺少 student_id 或 post_id" }
  }

  // Parse score fields (1, 2, 3, or null)
  const parseScore = (value: string | null): number | null => {
    if (!value || value === "") return null
    const num = parseInt(value, 10)
    return [1, 2, 3].includes(num) ? num : null
  }

  const observeScore = parseScore(String(formData.get("observe_score") ?? ""))
  const challengeScore = parseScore(String(formData.get("challenge_score") ?? ""))
  const alternativeScore = parseScore(String(formData.get("alternative_score") ?? ""))
  const judgmentScore = parseScore(String(formData.get("judgment_score") ?? ""))
  const judgmentIntegrated =
    formData.get("judgment_integrated") === "1" || formData.get("judgment_integrated") === "on"
      ? 1
      : 0

  // Fetch the submission to get chat_log and calculate chat_round
  const submissionRows = await query<{ chat_log: string }>(
    `SELECT chat_log FROM submissions WHERE student_id = ? AND post_id = ? LIMIT 1`,
    [studentId, postId],
  )
  const chatRound = submissionRows.length > 0 ? countTurns(submissionRows[0].chat_log) : null

  await query(
    `INSERT INTO scoring_notes (student_id, post_id, note, flagged, chat_round, observe_score, challenge_score, alternative_score, judgment_score, judgment_integrated)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE note = VALUES(note), flagged = VALUES(flagged), chat_round = VALUES(chat_round), observe_score = VALUES(observe_score), challenge_score = VALUES(challenge_score), alternative_score = VALUES(alternative_score), judgment_score = VALUES(judgment_score), judgment_integrated = VALUES(judgment_integrated)`,
    [studentId, postId, note === "" ? null : note, flagged, chatRound, observeScore, challengeScore, alternativeScore, judgmentScore, judgmentIntegrated],
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
