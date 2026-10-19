import { Check, ChevronRight, Clock, RotateCcw, UserRound } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { ActionStatus, StoreAction } from '../data/mockData'
import { SeverityChip } from './ui'

const statusLabel: Record<ActionStatus, string> = {
  open: 'To do',
  started: 'In progress',
  done: 'Done',
  snoozed: 'Snoozed',
}

export function ActionCard({
  action,
  rank,
  onOpen,
  onStatusChange,
  style,
}: {
  action: StoreAction
  rank: number
  onOpen: () => void
  onStatusChange: (status: ActionStatus) => void
  style?: CSSProperties
}) {
  if (action.status === 'done') {
    return (
      <article className="action-card is-done" style={style} aria-label={`${action.title}, done`}>
        <span className="done-mark" aria-hidden>
          <Check size={16} strokeWidth={2.6} />
        </span>
        <p className="done-title">{action.title}</p>
        <button type="button" className="button button-ghost button-sm" onClick={() => onStatusChange('open')}>
          <RotateCcw size={14} aria-hidden />
          Undo
        </button>
      </article>
    )
  }

  const titleId = `action-${action.id}-title`

  return (
    <article className={`action-card${rank === 1 ? ' is-first' : ''}`} style={style} aria-labelledby={titleId}>
      <div className="action-top">
        <span className="rank" aria-label={`Priority ${rank}`}>
          {rank}
        </span>
        <SeverityChip severity={action.severity} />
        {action.status !== 'open' && <span className={`status status-${action.status}`}>{statusLabel[action.status]}</span>}
        <span className="due">
          <Clock size={14} aria-hidden />
          {action.dueBy}
        </span>
      </div>

      <h3 id={titleId}>{action.title}</h3>
      <p className="action-summary">{action.summary}</p>

      <div className="action-metric">
        <span>{action.metricLabel}</span>
        <strong>{action.metricValue}</strong>
      </div>

      <div className="action-meta">
        <span className="impact">{action.impact}</span>
        <span className="owner">
          <UserRound size={14} aria-hidden />
          {action.owner}
        </span>
      </div>

      <div className="action-buttons">
        {action.status === 'started' ? (
          <button type="button" className="button button-primary" onClick={() => onStatusChange('done')}>
            <Check size={16} aria-hidden />
            Mark done
          </button>
        ) : (
          <button type="button" className="button button-primary" onClick={() => onStatusChange('started')}>
            {action.primaryCta}
          </button>
        )}
        <button type="button" className="button button-secondary" onClick={onOpen}>
          Why this?
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>
    </article>
  )
}
