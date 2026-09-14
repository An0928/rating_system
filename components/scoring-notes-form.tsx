"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { saveScoringNote, type SaveNoteResult } from "@/app/actions"
import { cn } from "@/lib/utils"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-9 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
    >
      {pending ? "儲存中…" : "儲存備註"}
    </button>
  )
}

type ScoreOption = 1 | 2 | 3

interface ScoreFieldProps {
  label: string
  name: string
  value: ScoreOption | null
  onChange: (value: ScoreOption | null) => void
}

function ScoreField({ label, name, value, onChange }: ScoreFieldProps) {
  const options: Array<{ value: ScoreOption; label: string }> = [
    { value: 1, label: "1 分・空泛敷衍" },
    { value: 2, label: "2 分・表面切題" },
    { value: 3, label: "3 分・具體且有推理" },
  ]

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex flex-wrap gap-3 rounded-lg border border-input bg-card px-3 py-3">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-foreground">{option.label}</span>
          </label>
        ))}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value=""
            checked={value === null}
            onChange={() => onChange(null)}
            className="w-4 h-4 cursor-pointer"
          />
          <span className="text-sm text-muted-foreground">未選</span>
        </label>
      </div>
      <input type="hidden" name={name} value={value ?? ""} />
    </div>
  )
}

export function ScoringNotesForm({
  studentId,
  postId,
  initialNote,
  initialFlagged,
  initialObserveScore,
  initialChallengeScore,
  initialAlternativeScore,
  initialJudgmentScore,
  initialJudgmentIntegrated,
}: {
  studentId: string
  postId: string
  initialNote: string
  initialFlagged: boolean
  initialObserveScore?: 1 | 2 | 3 | null
  initialChallengeScore?: 1 | 2 | 3 | null
  initialAlternativeScore?: 1 | 2 | 3 | null
  initialJudgmentScore?: 1 | 2 | 3 | null
  initialJudgmentIntegrated?: boolean
}) {
  const [flagged, setFlagged] = useState(initialFlagged)
  const [observeScore, setObserveScore] = useState<ScoreOption | null>(initialObserveScore ?? null)
  const [challengeScore, setChallengeScore] = useState<ScoreOption | null>(initialChallengeScore ?? null)
  const [alternativeScore, setAlternativeScore] = useState<ScoreOption | null>(initialAlternativeScore ?? null)
  const [judgmentScore, setJudgmentScore] = useState<ScoreOption | null>(initialJudgmentScore ?? null)
  const [judgmentIntegrated, setJudgmentIntegrated] = useState(initialJudgmentIntegrated ?? false)

  const [state, formAction] = useActionState<SaveNoteResult | null, FormData>(
    async (_prev, formData) => saveScoringNote(formData),
    null,
  )

  // Keep the toggle in sync with the confirmed server state after a save.
  useEffect(() => {
    if (state?.ok) setFlagged(state.flagged)
  }, [state])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="student_id" value={studentId} />
      <input type="hidden" name="post_id" value={postId} />
      {/* Submit the current toggle value even though the checkbox is styled as a button. */}
      <input type="hidden" name="flagged" value={flagged ? "1" : "0"} />

      {/* Scoring fields */}
      <ScoreField
        label="觀察"
        name="observe_score"
        value={observeScore}
        onChange={setObserveScore}
      />

      <ScoreField
        label="挑戰假設"
        name="challenge_score"
        value={challengeScore}
        onChange={setChallengeScore}
      />

      <ScoreField
        label="替代觀點"
        name="alternative_score"
        value={alternativeScore}
        onChange={setAlternativeScore}
      />

      <ScoreField
        label="判斷"
        name="judgment_score"
        value={judgmentScore}
        onChange={setJudgmentScore}
      />

      {/* Integration checkbox */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={judgmentIntegrated}
            onChange={(e) => setJudgmentIntegrated(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <span className="text-sm font-medium text-foreground">
            判斷階段是否有整合前面重點
          </span>
        </label>
        <input type="hidden" name="judgment_integrated" value={judgmentIntegrated ? "1" : "0"} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="note" className="text-sm font-medium text-foreground">
          評分備註
        </label>
        <textarea
          id="note"
          name="note"
          defaultValue={initialNote}
          rows={5}
          placeholder="針對這筆對話寫下你的評分觀察…"
          className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setFlagged((v) => !v)}
          aria-pressed={flagged}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
            flagged
              ? "border-destructive/40 bg-destructive/15 text-destructive"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0v-6h13.5a1 1 0 0 0 .8-1.6L16 9l3.3-4.4A1 1 0 0 0 18.5 3H5V3a1 1 0 0 0-1-1Z" />
          </svg>
          {flagged ? "已標記為需要注意" : "標記為需要注意"}
        </button>

        <SubmitButton />

        {state?.ok && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {state.message}
          </span>
        )}
        {state && !state.ok && (
          <span className="text-sm font-medium text-destructive">{state.message}</span>
        )}
      </div>
    </form>
  )
}
