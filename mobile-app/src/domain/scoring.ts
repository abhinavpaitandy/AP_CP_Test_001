import type { StoreAction } from '../data/mockData'

export function computePriority(action: StoreAction): number {
  const score =
    action.businessImpact * action.urgency * action.confidence * action.actionability

  return Number(score.toFixed(3))
}

export function sortActions(actions: StoreAction[]): StoreAction[] {
  return [...actions].sort((a, b) => computePriority(b) - computePriority(a))
}
