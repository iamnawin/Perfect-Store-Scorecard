import type { ReactNode } from 'react'

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="h-[100dvh] w-full bg-[#e7ebf0] sm:flex sm:items-start sm:justify-center sm:px-3 sm:py-6">
      <div className="relative flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden bg-[#f7f9fb] sm:h-[844px] sm:max-w-[390px] sm:rounded-[2.35rem] sm:border sm:border-[#d8dde6] sm:shadow-[0_16px_36px_rgba(15,23,42,0.16)]">
        {children}
      </div>
    </div>
  )
}
