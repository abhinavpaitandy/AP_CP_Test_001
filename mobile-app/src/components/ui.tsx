import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, CircleAlert, Info, TriangleAlert } from 'lucide-react'
import type { Severity } from '../data/mockData'

const severityIcon = { High: TriangleAlert, Medium: CircleAlert, Low: Info } as const

export function SeverityChip({ severity }: { severity: Severity }) {
  const Icon = severityIcon[severity]
  return (
    <span className={`chip chip-${severity.toLowerCase()}`}>
      <Icon size={13} strokeWidth={2.4} aria-hidden />
      {severity}
    </span>
  )
}

/** A signed change. `goodWhenUp` decides whether the arrow reads as good or bad. */
export function Delta({ value, label, goodWhenUp = true }: { value: number; label: string; goodWhenUp?: boolean }) {
  const up = value >= 0
  const tone = value === 0 ? 'neutral' : up === goodWhenUp ? 'good' : 'bad'
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span className={`delta delta-${tone}`}>
      <Icon size={14} strokeWidth={2.4} aria-hidden />
      {label}
    </span>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  action,
  id,
}: {
  eyebrow?: string
  title: string
  action?: ReactNode
  id?: string
}) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 id={id}>{title}</h2>
      </div>
      {action}
    </div>
  )
}
