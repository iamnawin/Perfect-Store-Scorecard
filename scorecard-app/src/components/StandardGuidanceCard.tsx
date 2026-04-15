import type { ReactNode } from 'react'

export function StandardGuidanceCard({
  title,
  summary,
  detail,
}: {
  title: string
  summary: string
  detail?: ReactNode
}) {
  return (
    <div className="rounded-xl border border-outline bg-surface-lowest px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
        Standard Mode
      </p>
      <p className="mt-2 text-[14px] font-semibold text-on-surface">{title}</p>
      <p className="mt-1 text-[12px] leading-snug text-on-surface-variant">{summary}</p>
      {detail ? <div className="mt-3 text-[12px] text-on-surface">{detail}</div> : null}
    </div>
  )
}
