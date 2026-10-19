import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ChartColumn, ChevronRight, ListChecks, Moon, Package, SlidersHorizontal, Sparkles, Sun, TriangleAlert, WifiOff } from 'lucide-react'
import { Basket, Rail } from '@lucasmarkes/hairline/react'
import { getSnapshotForScenario, type ActionStatus, type ScenarioKey } from './data/mockData'
import { answerQuestion } from './domain/assistant'
import { replenishmentPlan } from './domain/metrics'
import { sortActions } from './domain/scoring'
import { ActionCard } from './components/ActionCard'
import { ActionDetail } from './components/ActionDetail'
import { AlertsList } from './components/AlertsList'
import { AssistantPanel, type AssistantPhase, type ChatMessage } from './components/AssistantPanel'
import { DemoPanel, type DemoFlags } from './components/DemoPanel'
import { PerformanceOverview } from './components/PerformanceOverview'
import { Sheet } from './components/Sheet'
import { StockRow } from './components/StockPanel'
import { SectionHeader } from './components/ui'
import './App.css'

type Tab = 'today' | 'stock' | 'insights' | 'assistant'
type Theme = 'light' | 'dark'

const tabs: { key: Tab; label: string; icon: typeof ListChecks }[] = [
  { key: 'today', label: 'Today', icon: ListChecks },
  { key: 'stock', label: 'Stock', icon: Package },
  { key: 'insights', label: 'Insights', icon: ChartColumn },
  { key: 'assistant', label: 'Assistant', icon: Sparkles },
]

// Recharts is most of the bundle, so the charts load only when Insights opens.
const InsightsPanel = lazy(() => import('./components/InsightsPanel').then((m) => ({ default: m.InsightsPanel })))

const defaultFlags: DemoFlags = { staleData: false, offlineMode: false, missingStock: false, assistantFailure: false }

const STATE_KEY = 'store-actions-state-v2'
const THEME_KEY = 'store-actions-theme'
const MISSING_COUNT_ARTICLE = 'article-101'

const welcomeMessage: ChatMessage = {
  role: 'assistant',
  text: 'Hi! I can explain today’s priorities, compare with last year, or check stock and returns. What would you like to know?',
}

interface StoredState {
  scenario: ScenarioKey
  statuses: Record<string, ActionStatus>
  moved: string[]
  messages: ChatMessage[]
}

function readStored(): Partial<StoredState> {
  try {
    return JSON.parse(localStorage.getItem(STATE_KEY) ?? '{}') as Partial<StoredState>
  } catch {
    return {}
  }
}

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Storage unavailable: fall through to the OS preference.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const stored = readStored()

function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [scenario, setScenario] = useState<ScenarioKey>(stored.scenario ?? 'stock')
  const [statuses, setStatuses] = useState<Record<string, ActionStatus>>(stored.statuses ?? {})
  const [moved, setMoved] = useState<string[]>(stored.moved ?? [])
  const [messages, setMessages] = useState<ChatMessage[]>(stored.messages?.length ? stored.messages : [welcomeMessage])
  const [phase, setPhase] = useState<AssistantPhase>('idle')
  const [flags, setFlags] = useState<DemoFlags>(defaultFlags)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [demoOpen, setDemoOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0d0d0e' : '#f4f2ee')
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Non-critical.
    }
  }, [theme])

  useEffect(() => {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify({ scenario, statuses, moved, messages } satisfies StoredState))
    } catch {
      // Non-critical.
    }
  }, [scenario, statuses, moved, messages])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  const snapshot = useMemo(() => {
    const data = getSnapshotForScenario(scenario)
    if (flags.staleData) data.dataFreshness = 'Updated 1 h 12 min ago'
    if (flags.offlineMode) data.dataFreshness = 'Offline · last sync 12:30'
    data.actions = data.actions.map((action) => ({ ...action, status: statuses[action.id] ?? action.status }))
    return data
  }, [scenario, flags.staleData, flags.offlineMode, statuses])

  const actions = useMemo(() => sortActions(snapshot.actions), [snapshot.actions])
  const plan = useMemo(() => replenishmentPlan(snapshot.articles), [snapshot.articles])
  const toRefill = plan.filter((item) => item.state !== 'healthy')
  const wellStocked = plan.filter((item) => item.state === 'healthy')
  const doneCount = actions.filter((a) => a.status === 'done').length
  const detailAction = actions.find((a) => a.id === detailId) ?? null
  const unitsToMove = toRefill.filter((r) => !moved.includes(r.article.id)).reduce((sum, r) => sum + r.moveUnits, 0)

  const setStatus = (id: string, status: ActionStatus) => {
    setStatuses((current) => ({ ...current, [id]: status }))
    const message = { open: 'Action reopened', started: 'Marked in progress', done: 'Action done. Nice work.', snoozed: 'Snoozed until tomorrow' }
    setToast(message[status])
  }

  const toggleMoved = (articleId: string) => {
    setMoved((current) => (current.includes(articleId) ? current.filter((id) => id !== articleId) : [...current, articleId]))
  }

  const closeDetail = useCallback(() => setDetailId(null), [])
  const closeDemo = useCallback(() => setDemoOpen(false), [])

  const ask = (question: string) => {
    setMessages((current) => [...current, { role: 'user', text: question }])
    setPhase('searching')
    const answer = answerQuestion(question, snapshot)
    timers.current.push(
      window.setTimeout(() => setPhase('solving'), 700),
      window.setTimeout(() => setPhase('composing'), 1400),
      window.setTimeout(() => {
        setMessages((current) => [
          ...current,
          flags.assistantFailure
            ? { role: 'error', text: 'Store Intelligence couldn’t reach the sales data. Your question was saved.' }
            : { role: 'assistant', text: answer.text, sources: answer.sources },
        ])
        setPhase('idle')
      }, 2000),
    )
  }

  const retry = () => {
    const lastQuestion = [...messages].reverse().find((m) => m.role === 'user')
    if (lastQuestion) ask(lastQuestion.text)
  }

  const reset = () => {
    timers.current.forEach(window.clearTimeout)
    setScenario('stock')
    setStatuses({})
    setMoved([])
    setMessages([welcomeMessage])
    setPhase('idle')
    setFlags(defaultFlags)
    setDemoOpen(false)
    setToast('Demo reset')
  }

  const goTo = (next: Tab) => {
    setTab(next)
    window.scrollTo({ top: 0 })
  }

  const freshnessState = flags.offlineMode ? 'offline' : flags.staleData ? 'stale' : 'live'

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden />
            <div>
              <h1 className="app-name">Today’s Store Actions</h1>
              <p className="store-line">
                {snapshot.storeName} · {snapshot.dateLabel}
              </p>
            </div>
          </div>

          <nav className="tabs-desktop" aria-label="Main">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button key={key} type="button" aria-current={tab === key ? 'page' : undefined} onClick={() => goTo(key)}>
                <Icon size={17} aria-hidden />
                {label}
              </button>
            ))}
          </nav>

          <div className="topbar-actions">
            <span className={`freshness freshness-${freshnessState}`}>
              <span className="freshness-dot" aria-hidden />
              <span className="freshness-text">{snapshot.dataFreshness}</span>
            </span>
            <button
              type="button"
              className="icon-button"
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            >
              {theme === 'light' ? <Moon size={18} aria-hidden /> : <Sun size={18} aria-hidden />}
            </button>
            <button type="button" className="icon-button" onClick={() => setDemoOpen(true)} aria-label="Demo controls">
              <SlidersHorizontal size={18} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {(flags.offlineMode || flags.staleData) && (
        <div className="banner" role="status">
          {flags.offlineMode ? <WifiOff size={16} aria-hidden /> : <TriangleAlert size={16} aria-hidden />}
          {flags.offlineMode
            ? 'You’re offline. Showing data from 12:30. Actions will sync when you reconnect.'
            : 'Data is over an hour old. Check figures on the floor before acting.'}
        </div>
      )}

      <main className="main" key={tab}>
        {tab === 'today' && (
          <div className="today-grid">
            <div className="area-perf">
              <PerformanceOverview performance={snapshot.performance} />
            </div>

            <section className="area-actions" aria-labelledby="actions-title">
              <SectionHeader
                id="actions-title"
                eyebrow={`Priorities · ${doneCount} of ${actions.length} done`}
                title={doneCount === actions.length ? 'All done for today' : `${actions.length - doneCount} actions need you today`}
              />
              <div className="progress-steps" aria-hidden>
                {actions.map((a) => (
                  <span key={a.id} className={a.status === 'done' ? 'is-done' : a.status === 'started' ? 'is-started' : ''} />
                ))}
              </div>
              {doneCount === actions.length && (
                <div className="card empty-state">
                  <Basket className="empty-figure" label="An empty wire basket" />
                  <p>Every priority is handled. New actions appear here when the data changes.</p>
                </div>
              )}
              <div className="action-list">
                {actions.map((action, index) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    rank={index + 1}
                    style={{ '--i': index } as CSSProperties}
                    onOpen={() => setDetailId(action.id)}
                    onStatusChange={(status) => setStatus(action.id, status)}
                  />
                ))}
              </div>
            </section>

            <aside className="area-side">
              <section className="card side-card" aria-labelledby="refill-title">
                <SectionHeader
                  id="refill-title"
                  eyebrow="Stock replenishment"
                  title={`${unitsToMove} units to refill`}
                  action={
                    <button type="button" className="link-button" onClick={() => goTo('stock')}>
                      All stock
                      <ChevronRight size={14} aria-hidden />
                    </button>
                  }
                />
                <ul className="stock-list">
                  {toRefill.slice(0, 3).map((item) => (
                    <StockRow
                      key={item.article.id}
                      item={item}
                      compact
                      moved={moved.includes(item.article.id)}
                      countMissing={flags.missingStock && item.article.id === MISSING_COUNT_ARTICLE}
                    />
                  ))}
                </ul>
              </section>

              <section className="card side-card" aria-labelledby="alerts-title">
                <SectionHeader
                  id="alerts-title"
                  eyebrow="Returns and quality"
                  title={`${snapshot.alerts.length} alerts`}
                  action={
                    <button type="button" className="link-button" onClick={() => goTo('stock')}>
                      Details
                      <ChevronRight size={14} aria-hidden />
                    </button>
                  }
                />
                <AlertsList alerts={snapshot.alerts.slice(0, 2)} compact onOpenAction={setDetailId} />
              </section>
            </aside>
          </div>
        )}

        {tab === 'stock' && (
          <div className="stock-layout">
            <section className="card stock-summary" aria-labelledby="stock-title">
              <div className="stock-summary-head">
                <p className="eyebrow">Stock replenishment</p>
                <h2 id="stock-title">Refill the floor</h2>
                <p className="stock-summary-text">
                  Keep three hours of sales on the floor at today’s pace.
                </p>
              </div>
              <Rail className="stock-figure" label="A garment rail with hangers" />
              <dl className="stock-stats">
                  <div>
                    <dt>To move</dt>
                    <dd>{unitsToMove}</dd>
                  </div>
                  <div>
                    <dt>Transfers</dt>
                    <dd>{toRefill.filter((r) => r.state === 'transfer').length}</dd>
                  </div>
                  <div>
                    <dt>Healthy</dt>
                    <dd>{wellStocked.length}</dd>
                  </div>
              </dl>
            </section>

            <section aria-labelledby="refill-list-title">
              <SectionHeader id="refill-list-title" eyebrow="Lowest floor cover first" title="Needs refilling" />
              <ul className="card stock-list stock-list-full">
                {toRefill.map((item) => (
                  <StockRow
                    key={item.article.id}
                    item={item}
                    moved={moved.includes(item.article.id)}
                    countMissing={flags.missingStock && item.article.id === MISSING_COUNT_ARTICLE}
                    onToggleMoved={() => toggleMoved(item.article.id)}
                  />
                ))}
              </ul>
            </section>

            <section aria-labelledby="quality-title">
              <SectionHeader id="quality-title" eyebrow="Returns and product quality" title="Alerts" />
              <div className="card alerts-card">
                <AlertsList alerts={snapshot.alerts} onOpenAction={setDetailId} />
              </div>
            </section>

            <details className="card well-stocked">
              <summary>
                Well stocked <span className="count">{wellStocked.length}</span>
              </summary>
              <ul className="stock-list">
                {wellStocked.map((item) => (
                  <StockRow key={item.article.id} item={item} moved={false} countMissing={false} />
                ))}
              </ul>
            </details>
          </div>
        )}

        {tab === 'insights' && (
          <Suspense fallback={<p className="loading">Loading insights…</p>}>
            <InsightsPanel snapshot={snapshot} theme={theme} />
          </Suspense>
        )}

        {tab === 'assistant' && (
          <AssistantPanel
            messages={messages}
            phase={phase}
            suggestions={snapshot.assistantSuggestions}
            offline={flags.offlineMode}
            onSend={ask}
            onRetry={retry}
          />
        )}
      </main>

      <nav className="bottom-nav" aria-label="Main">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" aria-current={tab === key ? 'page' : undefined} onClick={() => goTo(key)}>
            <Icon size={22} strokeWidth={tab === key ? 2.3 : 1.8} aria-hidden />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <Sheet
        open={detailAction !== null}
        onClose={closeDetail}
        eyebrow="Why this action"
        title={detailAction?.title ?? ''}
        footer={
          detailAction && (
            <>
              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  setStatus(detailAction.id, detailAction.status === 'started' ? 'done' : 'started')
                  closeDetail()
                }}
              >
                {detailAction.status === 'started' ? 'Mark done' : detailAction.primaryCta}
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  closeDetail()
                  goTo('assistant')
                }}
              >
                <Sparkles size={16} aria-hidden />
                Ask assistant
              </button>
              <button
                type="button"
                className="button button-ghost"
                onClick={() => {
                  setStatus(detailAction.id, 'snoozed')
                  closeDetail()
                }}
              >
                Snooze
              </button>
            </>
          )
        }
      >
        {detailAction && <ActionDetail action={detailAction} />}
      </Sheet>

      <Sheet open={demoOpen} onClose={closeDemo} eyebrow="Demo controls" title="Scenario and conditions">
        <DemoPanel
          scenario={scenario}
          flags={flags}
          onScenario={(key) => {
            setScenario(key)
            setToast(`Scenario: ${key === 'stock' ? 'stock opportunity' : key === 'conversion' ? 'conversion drop' : 'return spike'}`)
          }}
          onToggle={(key) => setFlags((current) => ({ ...current, [key]: !current[key] }))}
          onReset={reset}
        />
      </Sheet>

      <div className="toast-region" aria-live="polite">
        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  )
}

export default App
