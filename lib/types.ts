export type Judgment = "real" | "fake" | "unsure"

export type ChatRole = "ai" | "student"

export interface ChatMessage {
  role: ChatRole
  text: string
}

export interface SubmissionRow {
  id: number
  student_id: string
  post_id: string
  judgment: Judgment
  completed_at: string
  is_structured: number | null
  week: number | null
  slot: number | null
  caption: string | null
  flagged: number
}

export interface SubmissionDetail {
  id: number
  student_id: string
  post_id: string
  judgment: Judgment
  chat_log: string
  completed_at: string
  is_structured: number | null
  week: number | null
  slot: number | null
  username: string | null
  handle: string | null
  caption: string | null
  image_url: string | null
  image_description: string | null
  likes: number | null
}

export interface ScoringNote {
  id: number
  student_id: string
  post_id: string
  note: string | null
  flagged: number
  created_at: string
  updated_at: string
}

export const JUDGMENT_LABELS: Record<Judgment, string> = {
  real: "真的",
  fake: "假的",
  unsure: "不確定",
}

export function groupLabel(isStructured: number | null): string {
  if (isStructured === null || isStructured === undefined) return "未知"
  return isStructured ? "結構化" : "非結構化"
}
