import type { StoreAction } from '../data/mockData'
import { computePriority } from '../domain/scoring'
import { SeverityChip } from './ui'

export function ActionDetail({ action }: { action: StoreAction }) {
  return (
    <div className="detail">
      <div className="detail-chips">
        <SeverityChip severity={action.severity} />
        <span className="tag">Priority score {computePriority(action).toFixed(2)}</span>
        <span className="tag">{action.dataFreshness}</span>
      </div>

      <div className="detail-recommendation">
        <p className="eyebrow">Recommended action</p>
        <p>{action.detail.recommendedAction}</p>
        <p className="detail-owner">
          {action.owner} · {action.dueBy} · {action.impact}
        </p>
      </div>

      <section>
        <h3>What the data shows</h3>
        <ul className="detail-list">
          {action.detail.signals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Why it matters</h3>
        <p>{action.detail.whyItMatters}</p>
      </section>

      <section>
        <h3>Likely causes</h3>
        <ul className="detail-list">
          {action.detail.causes.map((cause) => (
            <li key={cause}>{cause}</li>
          ))}
        </ul>
      </section>

      <section className="detail-confidence">
        <h3>Confidence · {Math.round(action.confidence * 100)}%</h3>
        <p>{action.detail.confidenceText}</p>
        <p className="detail-limit">{action.detail.limitations}</p>
      </section>
    </div>
  )
}
