import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'

const EXIT_MS = 180

/**
 * Bottom sheet on phones, side panel on desktop. Closes on Escape and on
 * backdrop tap, returns focus to the trigger, and exits faster than it enters.
 */
export function Sheet({
  open,
  onClose,
  eyebrow,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  eyebrow?: string
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  // Stay mounted after `open` turns false long enough to play the exit animation.
  const [rendered, setRendered] = useState(open)
  if (open && !rendered) setRendered(true)
  const closing = rendered && !open

  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!closing) return
    const timer = window.setTimeout(() => {
      setRendered(false)
      returnFocus.current?.focus()
    }, EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [closing])

  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!rendered && !open) return null

  return (
    <div className="sheet-root" data-state={closing ? 'closed' : 'open'}>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden />
      <section className="sheet" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="sheet-grabber" aria-hidden />
        <header className="sheet-header">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2 id={titleId}>{title}</h2>
          </div>
          <button ref={closeRef} type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} aria-hidden />
          </button>
        </header>
        <div className="sheet-body">{children}</div>
        {footer && <footer className="sheet-footer">{footer}</footer>}
      </section>
    </div>
  )
}
