import Link from "next/link"
import { notFound } from "next/navigation"
import { getSubmissionDetail, getScoringNote } from "@/lib/queries"
import { parseChatLog } from "@/lib/parse-chat-log"
import { ChatTranscript } from "@/components/chat-transcript"
import { ScoringNotesForm } from "@/components/scoring-notes-form"
import { PostThumbnail } from "@/components/post-thumbnail"
import { GroupBadge, JudgmentBadge } from "@/components/badges"
import { formatDateTime } from "@/lib/format"
import { groupLabel } from "@/lib/types"

export const dynamic = "force-dynamic"

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  )
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isFinite(numericId)) notFound()

  const detail = await getSubmissionDetail(numericId)
  if (!detail) notFound()

  const note = await getScoringNote(detail.student_id, detail.post_id)
  const messages = parseChatLog(detail.chat_log)

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8 md:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        返回列表
      </Link>

      {/* Meta section */}
      <section className="mt-4 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-lg font-semibold text-foreground">{detail.student_id}</h1>
          <GroupBadge isStructured={detail.is_structured} />
          <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            第 {detail.week ?? "?"} 週
          </span>
          <JudgmentBadge judgment={detail.judgment} />
        </div>

        <div className="mt-5 flex flex-col gap-5 md:flex-row">
          {detail.image_url && (
            <div className="shrink-0">
              <PostThumbnail
                src={detail.image_url}
                alt={`貼文圖片：${detail.caption ?? detail.post_id}`}
              />
            </div>
          )}

          <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <MetaItem label="分組">{groupLabel(detail.is_structured)}</MetaItem>
            <MetaItem label="週次 / Slot">
              第 {detail.week ?? "?"} 週{detail.slot != null ? ` · slot ${detail.slot}` : ""}
            </MetaItem>
            <MetaItem label="判斷">
              <JudgmentBadge judgment={detail.judgment} />
            </MetaItem>
            <MetaItem label="完成時間">
              <span className="font-mono text-xs">{formatDateTime(detail.completed_at)}</span>
            </MetaItem>
            <MetaItem label="貼文帳號">
              {detail.username ? `${detail.username}${detail.handle ? ` (${detail.handle})` : ""}` : "—"}
            </MetaItem>
            <MetaItem label="Post ID">
              <span className="font-mono text-xs">{detail.post_id}</span>
            </MetaItem>
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">貼文說明</dt>
              <dd className="mt-1 text-sm leading-relaxed text-foreground">
                {detail.caption || "（無貼文說明）"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Chat transcript */}
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">對話紀錄</h2>
        <div className="rounded-xl border border-border bg-background/40 p-4 md:p-6">
          <ChatTranscript messages={messages} />
        </div>
      </section>

      {/* Scoring notes */}
      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">評分備註</h2>
        <ScoringNotesForm
          studentId={detail.student_id}
          postId={detail.post_id}
          initialNote={note?.note ?? ""}
          initialFlagged={!!note?.flagged}
        />
        {note?.updated_at && (
          <p className="mt-3 text-xs text-muted-foreground">
            上次更新：<span className="font-mono">{formatDateTime(note.updated_at)}</span>
          </p>
        )}
      </section>
    </main>
  )
}
