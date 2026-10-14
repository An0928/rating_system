import type { ChatMessage, ChatRole } from "./types"

// A prefix regex that matches a line beginning a new message.
// Accepts both full-width "：" and half-width ":" colon after the speaker label,
// and tolerates optional leading whitespace.
// Optionally captures a stage name in square brackets (for AI messages).
// Groups: 1=speaker, 2=stage (optional), 3=message text
const PREFIX_RE = /^\s*(AI|學生|Student)\s*(?:\[([^\]]+)\])?\s*[：:]\s?(.*)$/

/**
 * Parse a chat_log string into an ordered array of messages.
 *
 * Format: each turn starts on a new line with "AI：" or "學生：".
 * English format: each turn starts on a new line with "AI：", "學生：" or "Student:" (EN transcripts).
 * A line that does NOT start with one of these prefixes is treated as a
 * continuation of the current message (preserving the newline), so multi-line
 * answers stay a single message.
 */
export function parseChatLog(chatLog: string | null | undefined): ChatMessage[] {
  if (!chatLog) return []

  const lines = chatLog.replace(/\r\n/g, "\n").split("\n")
  const messages: ChatMessage[] = []
  let current: ChatMessage | null = null

  for (const line of lines) {
    const match = line.match(PREFIX_RE)
    if (match) {
      // Start a new message.
      if (current) messages.push(current)
      const role: ChatRole = match[1] === "AI" ? "ai" : "student"
      const stage = match[2] // stage is captured only if it exists in the format "AI [stage]："
      current = { role, text: match[3] ?? "", ...(stage && { stage }) }
    } else if (current) {
      // Continuation of the current message (keep the line break).
      current.text += "\n" + line
    } else if (line.trim().length > 0) {
      // Content before any recognized prefix — attach it to an AI message
      // so nothing is silently dropped.
      current = { role: "ai", text: line }
    }
  }

  if (current) messages.push(current)

  // Trim trailing/leading whitespace on each message text.
  return messages.map((m) => ({ role: m.role, text: m.text.trim(), ...(m.stage && { stage: m.stage }) }))
}

/**
 * 計算一段 chat_log 裡，AI 總共發言了幾則訊息（即總輪數）。
 * 定義與訓練系統 actions.ts 裡 turnCount 的算法一致：
 * 統計 role 為 "ai" 的訊息則數。
 */
export function countTurns(chatLog: string | null | undefined): number {
  const messages = parseChatLog(chatLog)
  return messages.filter((m) => m.role === "ai").length
}
