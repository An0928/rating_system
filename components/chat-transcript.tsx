import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/types"

export function ChatTranscript({ messages }: { messages: ChatMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        沒有可解析的對話內容。
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((m, i) => {
        const isStudent = m.role === "student"
        return (
          <div
            key={i}
            className={cn("flex w-full", isStudent ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "flex max-w-[80%] flex-col gap-1",
                isStudent ? "items-end" : "items-start",
              )}
            >
              <span className="px-1 text-[11px] font-medium text-muted-foreground">
                {isStudent ? "學生" : "AI"}
              </span>
              <div
                className={cn(
                  "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  isStudent
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-secondary text-secondary-foreground",
                )}
              >
                {m.text}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
