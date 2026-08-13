import { cn } from "@/lib/utils"
import { JUDGMENT_LABELS, type Judgment } from "@/lib/types"

export function GroupBadge({ isStructured }: { isStructured: number | null }) {
  if (isStructured === null || isStructured === undefined) {
    return <span className="text-muted-foreground text-xs">—</span>
  }
  const structured = !!isStructured
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        structured
          ? "bg-primary/15 text-primary ring-primary/30"
          : "bg-muted text-muted-foreground ring-border",
      )}
    >
      {structured ? "結構化" : "非結構化"}
    </span>
  )
}

const JUDGMENT_STYLES: Record<Judgment, string> = {
  real: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  fake: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  unsure: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
}

export function JudgmentBadge({ judgment }: { judgment: Judgment }) {
  const label = JUDGMENT_LABELS[judgment] ?? judgment
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        JUDGMENT_STYLES[judgment] ?? "bg-muted text-muted-foreground ring-border",
      )}
    >
      {label}
    </span>
  )
}

export function FlagBadge({ flagged }: { flagged: boolean }) {
  if (!flagged) return null
  return (
    <span
      title="需要特別注意"
      className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive ring-1 ring-inset ring-destructive/30"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0v-6h13.5a1 1 0 0 0 .8-1.6L16 9l3.3-4.4A1 1 0 0 0 18.5 3H5V3a1 1 0 0 0-1-1Z" />
      </svg>
      注意
    </span>
  )
}
