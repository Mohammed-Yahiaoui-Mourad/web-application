import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface DetailDrawerProps {
  open: boolean
  title: string
  subtitle?: string
  badge?: ReactNode
  onClose: () => void
  footer?: ReactNode
  children: ReactNode
}

export default function DetailDrawer({
  open,
  title,
  subtitle,
  badge,
  onClose,
  footer,
  children,
}: DetailDrawerProps) {
  if (!open) return null

  return (
    <>
      <button
        type="button"
        aria-label="Fermer le panneau"
        onClick={onClose}
        className="fixed inset-0 z-30 bg-slate-950/25 backdrop-blur-[1px]"
      />

      <aside className="fixed inset-y-4 right-4 z-40 flex w-[min(460px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
        <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
                {badge}
              </div>
              {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>

        {footer ? <div className="border-t border-slate-200 bg-white px-6 py-4">{footer}</div> : null}
      </aside>
    </>
  )
}
