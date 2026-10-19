import { ChevronRight, Ruler, ShieldAlert } from 'lucide-react'
import type { QualityAlert } from '../data/mockData'
import { SeverityChip } from './ui'

export function AlertsList({
  alerts,
  onOpenAction,
  compact = false,
}: {
  alerts: QualityAlert[]
  onOpenAction: (actionId: string) => void
  compact?: boolean
}) {
  return (
    <ul className="alert-list">
      {alerts.map((alert) => {
        const Icon = alert.kind === 'quality' ? ShieldAlert : Ruler
        return (
          <li key={alert.id} className="alert">
            <span className={`alert-icon alert-icon-${alert.severity.toLowerCase()}`} aria-hidden>
              <Icon size={18} />
            </span>
            <div className="alert-body">
              <div className="alert-top">
                <p className="alert-title">{alert.title}</p>
                <SeverityChip severity={alert.severity} />
              </div>
              <p className="alert-metric">
                {alert.kind === 'quality' ? 'Quality' : 'Returns'} · {alert.metric}
              </p>
              {!compact && <p className="alert-reason">{alert.reason}</p>}
              <p className="alert-next">{alert.nextStep}</p>
              {alert.actionId && !compact && (
                <button type="button" className="link-button" onClick={() => onOpenAction(alert.actionId!)}>
                  Open action
                  <ChevronRight size={14} aria-hidden />
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
