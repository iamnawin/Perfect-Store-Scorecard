import type { ReactNode } from 'react'
import { FeedbackLayer } from './FeedbackLayer'

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[radial-gradient(circle_at_top,#f6f9fc_0%,#e7ebf0_52%,#dde4ec_100%)]">
      <div className="mx-auto flex h-[100dvh] w-full items-center justify-center px-2 py-2 sm:px-4 sm:py-6">
        <div className="flex h-full min-h-0 w-full items-center justify-center">
          <div className="relative flex h-full w-full min-w-0 max-w-[402px] flex-col overflow-hidden rounded-[1.7rem] border border-[#d8dde6] bg-[#f7f9fb] shadow-[0_18px_44px_rgba(15,23,42,0.18)] sm:h-[844px] sm:rounded-[2.35rem]">
            <div className="flex min-h-0 flex-1 flex-col">
              {children}
            </div>
            <FeedbackLayer />
          </div>
        </div>
      </div>
    </div>
  )
}
