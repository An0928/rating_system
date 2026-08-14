"use client"

import { useState } from "react"

function cleanText(text: string): string {
  return text.replace(/\\n/g, " ").replace(/\n/g, " ")
}

export function PostThumbnail({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="flex h-40 w-40 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-secondary/40 text-center text-xs text-muted-foreground">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        <span className="px-2 leading-snug">圖片無法載入</span>
        <span className="px-2 font-mono text-[10px] leading-snug break-all">{cleanText(src)}</span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || "/placeholder.svg"}
      alt={cleanText(alt)}
      onError={() => setFailed(true)}
      className="h-40 w-40 rounded-lg border border-border object-cover"
      crossOrigin="anonymous"
    />
  )
}