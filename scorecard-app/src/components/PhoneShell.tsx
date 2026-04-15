import type { ReactNode } from 'react'

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full bg-[#e7ebf0]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col px-3 py-4 sm:max-w-none sm:items-center sm:px-4 sm:py-6">
        <div className="flex flex-1 min-h-0 w-full items-start justify-center">
          <div className="relative flex h-full w-full min-w-0 flex-col overflow-hidden bg-[#f7f9fb] sm:h-[844px] sm:max-w-[390px] sm:rounded-[2.35rem] sm:border sm:border-[#d8dde6] sm:shadow-[0_16px_36px_rgba(15,23,42,0.16)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
