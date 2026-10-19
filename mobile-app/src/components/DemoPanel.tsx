import { Check } from 'lucide-react'
import { scenarioOptions, type ScenarioKey } from '../data/mockData'

export type DemoFlags = {
  staleData: boolean
  offlineMode: boolean
  missingStock: boolean
  assistantFailure: boolean
}

const flagCopy: { key: keyof DemoFlags; label: string; description: string }[] = [
  { key: 'staleData', label: 'Stale data', description: 'Last sync over an hour ago' },
  { key: 'offlineMode', label: 'Offline', description: 'No connection, cached data only' },
  { key: 'missingStock', label: 'Missing stock count', description: 'Trousers count unavailable' },
  { key: 'assistantFailure', label: 'Assistant error', description: 'Store Intelligence fails to answer' },
]

export function DemoPanel({
  scenario,
  flags,
  onScenario,
  onToggle,
  onReset,
}: {
  scenario: ScenarioKey
  flags: DemoFlags
  onScenario: (key: ScenarioKey) => void
  onToggle: (key: keyof DemoFlags) => void
  onReset: () => void
}) {
  return (
    <div className="demo">
      <fieldset className="option-group">
        <legend>Scenario</legend>
        {scenarioOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            className="option"
            aria-pressed={scenario === option.key}
            onClick={() => onScenario(option.key)}
          >
            <span>
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </span>
            {scenario === option.key && <Check size={18} aria-hidden />}
          </button>
        ))}
      </fieldset>

      <fieldset className="option-group">
        <legend>Simulate conditions</legend>
        {flagCopy.map((flag) => (
          <button
            key={flag.key}
            type="button"
            role="switch"
            aria-checked={flags[flag.key]}
            className="option"
            onClick={() => onToggle(flag.key)}
          >
            <span>
              <strong>{flag.label}</strong>
              <span>{flag.description}</span>
            </span>
            <span className="switch" aria-hidden />
          </button>
        ))}
      </fieldset>

      <button type="button" className="button button-secondary button-block" onClick={onReset}>
        Reset demo
      </button>
      <p className="demo-note">All figures are fictional demo data for Stockholm City.</p>
    </div>
  )
}
