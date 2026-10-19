import type { Performance } from '../data/mockData'
import { formatSek, formatSigned, summarizePerformance } from '../domain/metrics'
import { Delta } from './ui'

export function PerformanceOverview({ performance }: { performance: Performance }) {
  const s = summarizePerformance(performance)
  const progress = Math.round(s.targetProgress * 100)

  return (
    <section className="card performance" aria-labelledby="performance-title">
      <div className="performance-hero">
        <p className="eyebrow" id="performance-title">
          Store performance · as of {performance.asOf}
        </p>
        <p className="hero-figure">{formatSek(s.sales)}</p>
        <div className="hero-meta">
          <Delta value={s.salesVsLastYear} label={`${formatSigned(s.salesVsLastYear)} vs last year`} />
        </div>
        <div className="target">
          <div
            className="meter"
            role="meter"
            aria-label="Progress to daily sales target"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span style={{ transform: `scaleX(${s.targetProgress})` }} />
          </div>
          <p className="target-label">
            <strong>{progress}%</strong> of {formatSek(performance.salesTarget)} daily target
          </p>
        </div>
      </div>

      <dl className="kpi-grid">
        <div className="kpi">
          <dt>Traffic</dt>
          <dd className="kpi-value">{performance.traffic.toLocaleString('en-US')}</dd>
          <dd>
            <Delta value={s.trafficVsLastYear} label={formatSigned(s.trafficVsLastYear)} />
          </dd>
        </div>
        <div className="kpi">
          <dt>Conversion</dt>
          <dd className="kpi-value">{performance.conversion.toFixed(1)}%</dd>
          <dd>
            <Delta value={s.conversionDeltaPts} label={formatSigned(s.conversionDeltaPts, 1, ' pts')} />
          </dd>
        </div>
        <div className="kpi">
          <dt>Basket</dt>
          <dd className="kpi-value">{formatSek(performance.avgBasket).replace('SEK ', '')}</dd>
          <dd>
            <Delta value={s.basketVsLastYear} label={formatSigned(s.basketVsLastYear)} />
          </dd>
        </div>
      </dl>
      <p className="kpi-footnote">Changes compare with the same weekday last year, up to {performance.asOf}. Basket is average spend in SEK.</p>
    </section>
  )
}
