import Link from "next/link"
import { getSubmissions, getWeeks, type SubmissionFilters } from "@/lib/queries"
import { ListControls } from "@/components/list-controls"
import { GroupBadge, JudgmentBadge, FlagBadge } from "@/components/badges"
import { formatDateTime, truncate } from "@/lib/format"

export const dynamic = "force-dynamic"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams

  const filters: SubmissionFilters = {
    group: (sp.group as SubmissionFilters["group"]) ?? "",
    week: sp.week ?? "",
    judgment: sp.judgment ?? "",
    studentId: sp.student ?? "",
  }

  const [rows, weeks] = await Promise.all([getSubmissions(filters), getWeeks()])

  const searchingStudent = filters.studentId?.trim()

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 md:px-8">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">媒體素養教學研究</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-balance md:text-3xl">
          學生對話紀錄檢視工具
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          檢視每位學生與 AI 的完整對話、判斷結果，並撰寫評分備註。
        </p>
      </header>

      <section className="mb-6">
        <ListControls weeks={weeks} />
      </section>

      {searchingStudent && (
        <p className="mb-3 text-sm text-muted-foreground">
          顯示學生 <span className="font-mono text-foreground">{searchingStudent}</span> 的所有已完成紀錄（
          {rows.length} 筆）
        </p>
      )}

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        {/* header row (desktop) */}
        <div className="hidden grid-cols-[8.5rem_6rem_1fr_5rem_9.5rem] gap-4 border-b border-border bg-secondary/40 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
          <div>學生 ID</div>
          <div>分組</div>
          <div>週次 / 貼文</div>
          <div>判斷</div>
          <div>完成時間</div>
        </div>

        {rows.length === 0 ? (
          <div className="px-4 py-16 text-center text-sm text-muted-foreground">沒有符合條件的紀錄。</div>
        ) : (
          <ul>
            {rows.map((r) => (
              <li key={r.id} className="border-b border-border last:border-b-0">
                <Link
                  href={`/submissions/${r.id}`}
                  className="grid grid-cols-1 gap-2 px-4 py-4 transition-colors hover:bg-secondary/40 md:grid-cols-[8.5rem_6rem_1fr_5rem_9.5rem] md:items-center md:gap-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-foreground">{r.student_id}</span>
                    <span className="md:hidden">
                      <FlagBadge flagged={!!r.flagged} />
                    </span>
                  </div>

                  <div>
                    <GroupBadge isStructured={r.is_structured} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">
                        第 {r.week ?? "?"} 週
                      </span>
                      <span className="hidden md:inline">
                        <FlagBadge flagged={!!r.flagged} />
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground" title={r.caption ?? ""}>
                      {truncate(r.caption, 70) || "（無貼文說明）"}
                    </p>
                  </div>

                  <div>
                    <JudgmentBadge judgment={r.judgment} />
                  </div>

                  <div className="font-mono text-xs text-muted-foreground">{formatDateTime(r.completed_at)}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-4 text-xs text-muted-foreground">共 {rows.length} 筆紀錄</p>
    </main>
  )
}
