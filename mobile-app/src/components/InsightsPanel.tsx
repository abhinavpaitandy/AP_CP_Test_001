import type { ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TooltipContentProps } from 'recharts'
import { CalendarRange, Clock, TrendingDown, Users } from 'lucide-react'
import type { StoreSnapshot } from '../data/mockData'
import { formatSek, formatSigned, summarizePerformance } from '../domain/metrics'
import { SectionHeader } from './ui'

const chartPalette = {
  light: { current: '#2a78d6', lastYear: '#a8a49c', grid: '#e4e1da', axis: '#6b6862', cursor: 'rgba(20,20,20,0.05)', surface: '#ffffff' },
  dark: { current: '#3987e5', lastYear: '#6b6862', grid: '#2c2c2f', axis: '#9a968e', cursor: 'rgba(255,255,255,0.06)', surface: '#18181a' },
}

const compact = (value: number) => (value >= 1000 ? `${Math.round(value / 1000)}K` : `${value}`)

function ChartTooltip({ active, payload, label, format }: TooltipContentProps & { format: (value: number) => string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((entry) => (
        <p key={String(entry.dataKey)} className="chart-tooltip-row">
          <span className="swatch" style={{ background: entry.color }} aria-hidden />
          <span>{entry.name}</span>
          <strong>{format(Number(entry.value))}</strong>
        </p>
      ))}
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  legend,
  children,
  table,
}: {
  title: string
  subtitle: string
  legend?: { label: string; color: string }[]
  children: ReactNode
  table: { head: string[]; rows: (string | number)[][] }
}) {
  return (
    <figure className="card chart-card">
      <figcaption>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </figcaption>
      {legend && (
        <ul className="legend">
          {legend.map((item) => (
            <li key={item.label}>
              <span className="swatch" style={{ background: item.color }} aria-hidden />
              {item.label}
            </li>
          ))}
        </ul>
      )}
      <div className="chart-area">{children}</div>
      <details className="chart-table">
        <summary>View data</summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {table.head.map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={String(row[0])}>
                  {row.map((cell, i) => (i === 0 ? <th key={i} scope="row">{cell}</th> : <td key={i}>{cell}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}

function buildInsights(snapshot: StoreSnapshot) {
  const s = summarizePerformance(snapshot.performance)
  const conversions = [...snapshot.week.map((d) => d.conversion), snapshot.performance.conversion]
  let fallingDays = 0
  for (let i = conversions.length - 1; i > 0 && conversions[i] < conversions[i - 1]; i--) fallingDays++
  const weekend = snapshot.week.filter((d) => d.day === 'Sat' || d.day === 'Sun')
  const weekendTy = weekend.reduce((sum, d) => sum + d.sales, 0)
  const weekendLy = weekend.reduce((sum, d) => sum + d.salesLastYear, 0)
  const midday = snapshot.hourly.filter((h) => h.hour === '12' || h.hour === '13')
  const middayVisitors = midday.reduce((sum, h) => sum + h.visitors, 0)

  return [
    {
      icon: Users,
      title: 'Growth is coming from traffic, not conversion',
      body: `Visitors are ${formatSigned(s.trafficVsLastYear)} and baskets ${formatSigned(s.basketVsLastYear)} on last year, but conversion is ${formatSigned(s.conversionDeltaPts, 1, ' pts')}. Converting better is the biggest lever left today.`,
    },
    {
      icon: TrendingDown,
      title: fallingDays > 1 ? `Conversion has fallen ${fallingDays} days running` : 'Conversion is below last year',
      body: `From ${conversions[conversions.length - 1 - fallingDays].toFixed(1)}% to ${snapshot.performance.conversion.toFixed(1)}% today. Worth raising at the weekly review if it continues.`,
    },
    {
      icon: Clock,
      title: 'Lunch is the busiest and weakest window',
      body: `${Math.round((middayVisitors / snapshot.performance.traffic) * 100)}% of today’s visitors came between 12:00 and 14:00, when conversion was lowest.`,
    },
    {
      icon: CalendarRange,
      title: `Weekend sales ${formatSigned(((weekendTy - weekendLy) / weekendLy) * 100)} on last year`,
      body: `${formatSek(weekendTy)} across Saturday and Sunday. Saturday was the week’s peak with ${snapshot.week.find((d) => d.day === 'Sat')?.visitors.toLocaleString('en-US')} visitors.`,
    },
  ]
}

export function InsightsPanel({ snapshot, theme }: { snapshot: StoreSnapshot; theme: 'light' | 'dark' }) {
  const c = chartPalette[theme]
  const axis = { tickLine: false, axisLine: false, tick: { fill: c.axis, fontSize: 12 } } as const
  const insights = buildInsights(snapshot)
  const hourly = snapshot.hourly.map((h) => ({ ...h, label: `${h.hour}:00` }))

  return (
    <div className="insights">
      <section aria-labelledby="business-insights">
        <SectionHeader id="business-insights" eyebrow="What the numbers say" title="Business insights" />
        <ul className="insight-grid">
          {insights.map(({ icon: Icon, title, body }) => (
            <li key={title} className="card insight">
              <span className="insight-icon" aria-hidden>
                <Icon size={18} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="trend-charts">
        <SectionHeader id="trend-charts" eyebrow="Sales, traffic and conversion" title="Trends" />
        <div className="chart-grid">
          <ChartCard
            title="Conversion by hour"
            subtitle="Today vs the same weekday last year, %"
            legend={[
              { label: 'Today', color: c.current },
              { label: 'Last year', color: c.lastYear },
            ]}
            table={{
              head: ['Hour', 'Today', 'Last year', 'Visitors'],
              rows: hourly.map((h) => [h.label, `${h.conversion}%`, `${h.conversionLastYear}%`, h.visitors]),
            }}
          >
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={hourly} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid vertical={false} stroke={c.grid} />
                <XAxis dataKey="label" {...axis} tickMargin={8} padding={{ left: 14, right: 14 }} />
                <YAxis {...axis} domain={[10, 20]} ticks={[10, 15, 20]} unit="%" />
                <Tooltip cursor={{ stroke: c.grid, strokeWidth: 1 }} content={(props) => <ChartTooltip {...props} format={(v) => `${v.toFixed(1)}%`} />} />
                <Line name="Last year" dataKey="conversionLastYear" stroke={c.lastYear} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: c.surface }} isAnimationActive={false} />
                <Line name="Today" dataKey="conversion" stroke={c.current} strokeWidth={2} dot={{ r: 4, fill: c.current, strokeWidth: 2, stroke: c.surface }} activeDot={{ r: 5, strokeWidth: 2, stroke: c.surface }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Sales, last 7 days"
            subtitle="This year vs last year, SEK"
            legend={[
              { label: 'This year', color: c.current },
              { label: 'Last year', color: c.lastYear },
            ]}
            table={{
              head: ['Day', 'This year', 'Last year'],
              rows: snapshot.week.map((d) => [d.day, formatSek(d.sales), formatSek(d.salesLastYear)]),
            }}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={snapshot.week} barGap={2} barCategoryGap="28%" margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid vertical={false} stroke={c.grid} />
                <XAxis dataKey="day" {...axis} tickMargin={8} />
                <YAxis {...axis} domain={[0, 250000]} ticks={[0, 50000, 100000, 150000, 200000, 250000]} tickFormatter={compact} />
                <Tooltip cursor={{ fill: c.cursor }} content={(props) => <ChartTooltip {...props} format={formatSek} />} />
                <Bar name="This year" dataKey="sales" fill={c.current} radius={[4, 4, 0, 0]} maxBarSize={14} isAnimationActive={false} />
                <Bar name="Last year" dataKey="salesLastYear" fill={c.lastYear} radius={[4, 4, 0, 0]} maxBarSize={14} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Visitors, last 7 days"
            subtitle="Door counter, full trading days"
            table={{ head: ['Day', 'Visitors', 'Conversion'], rows: snapshot.week.map((d) => [d.day, d.visitors.toLocaleString('en-US'), `${d.conversion}%`]) }}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={snapshot.week} barCategoryGap="34%" margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid vertical={false} stroke={c.grid} />
                <XAxis dataKey="day" {...axis} tickMargin={8} />
                <YAxis {...axis} domain={[0, 4000]} ticks={[0, 1000, 2000, 3000, 4000]} tickFormatter={compact} />
                <Tooltip cursor={{ fill: c.cursor }} content={(props) => <ChartTooltip {...props} format={(v) => v.toLocaleString('en-US')} />} />
                <Bar name="Visitors" dataKey="visitors" fill={c.current} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </section>
    </div>
  )
}
