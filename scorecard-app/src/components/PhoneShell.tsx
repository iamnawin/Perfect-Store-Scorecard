import type { ReactNode } from 'react'

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-start justify-center bg-[#e8edf2] py-8 px-4">
      <div className="w-full max-w-[390px] min-h-[844px] bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col">
        {children}
      </div>
    </div>
  )
}
