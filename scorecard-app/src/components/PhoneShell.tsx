import type { ReactNode } from 'react'

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-start justify-center bg-[#e7ebf0] py-6 px-3">
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#f7f9fb] border border-[#d8dde6] rounded-[2.35rem] shadow-[0_16px_36px_rgba(15,23,42,0.16)] overflow-hidden relative flex flex-col">
        {children}
      </div>
    </div>
  )
}
