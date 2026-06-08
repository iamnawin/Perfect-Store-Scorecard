import { Link2, RotateCcw } from 'lucide-react'
import type { ScorecardVersionRecord } from '../types'

export function RevisitBanner({
  sourceScorecard,
  activeScorecard,
}: {
  sourceScorecard: ScorecardVersionRecord
  activeScorecard: ScorecardVersionRecord
}) {
  if (!activeScorecard.isRevisit) return null

  return (
    <div className="rounded-lg border border-[#c9d8ea] bg-[#edf4ff] px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#c9d8ea] bg-white text-primary">
          <RotateCcw size={15} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13px] font-semibold text-primary">Revisit Mode</p>
            <span className="rounded-md border border-[#c9d8ea] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
              V{activeScorecard.versionNumber}
            </span>
          </div>
          <p className="mt-1 text-[12px] text-[#014486]">
            Previous values are prefilled. Update only what changed.
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#014486]">
            <Link2 size={12} />
            <span>
              Source V{sourceScorecard.versionNumber} submitted {formatSubmittedAt(sourceScorecard.submittedAt)} by {sourceScorecard.submittedBy}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatSubmittedAt(value: string | null) {
  if (!value) return 'previously'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
