"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"

const SELECT_CLS =
  "h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"

export function ListControls({ weeks }: { weeks: number[] }) {
  const router = useRouter()
  const params = useSearchParams()

  const group = params.get("group") ?? ""
  const week = params.get("week") ?? ""
  const judgment = params.get("judgment") ?? ""
  const [student, setStudent] = useState(params.get("student") ?? "")

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      router.push(`/?${next.toString()}`)
    },
    [params, router],
  )

  const submitSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setParam("student", student.trim())
    },
    [student, setParam],
  )

  const clearAll = useCallback(() => {
    setStudent("")
    router.push("/")
  }, [router])

  const hasFilters = !!(group || week || judgment || params.get("student"))

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={submitSearch} className="flex flex-wrap items-center gap-2">
        <label htmlFor="student-search" className="sr-only">
          搜尋 student_id
        </label>
        <input
          id="student-search"
          value={student}
          onChange={(e) => setStudent(e.target.value)}
          placeholder="輸入 student_id 查詢該學生所有紀錄…"
          className="h-9 w-72 rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          搜尋
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="分組篩選"
          className={SELECT_CLS}
          value={group}
          onChange={(e) => setParam("group", e.target.value)}
        >
          <option value="">全部分組</option>
          <option value="structured">結構化</option>
          <option value="unstructured">非結構化</option>
        </select>

        <select
          aria-label="週次篩選"
          className={SELECT_CLS}
          value={week}
          onChange={(e) => setParam("week", e.target.value)}
        >
          <option value="">全部週次</option>
          {weeks.map((w) => (
            <option key={w} value={String(w)}>
              第 {w} 週
            </option>
          ))}
        </select>

        <select
          aria-label="判斷篩選"
          className={SELECT_CLS}
          value={judgment}
          onChange={(e) => setParam("judgment", e.target.value)}
        >
          <option value="">全部判斷</option>
          <option value="real">真的</option>
          <option value="fake">假的</option>
          <option value="unsure">不確定</option>
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="h-9 rounded-md border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            清除全部
          </button>
        )}
      </div>
    </div>
  )
}
