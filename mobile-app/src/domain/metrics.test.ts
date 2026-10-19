import { describe, expect, it } from 'vitest'
import { defaultSnapshot, getSnapshotForScenario } from '../data/mockData'
import { formatCover, formatSigned, recommendReplenishment, replenishmentPlan, summarizePerformance } from './metrics'

const article = { id: 'a', name: 'Test', department: 'Women' as const, price: 100, sizes: 'S–L' }

describe('replenishment', () => {
  it('moves enough stock to reach three hours of floor cover', () => {
    const r = recommendReplenishment({ ...article, stockFloor: 3, stockRoom: 18, unitsPerHour: 4.2 })
    expect(r.state).toBe('move')
    expect(r.moveUnits).toBe(10)
  })

  it('caps the move at what the stockroom holds and flags the shortfall', () => {
    const r = recommendReplenishment({ ...article, stockFloor: 2, stockRoom: 4, unitsPerHour: 4 })
    expect(r.moveUnits).toBe(4)
    expect(r.shortfall).toBe(6)
  })

  it('asks for a transfer when the stockroom is empty', () => {
    const r = recommendReplenishment({ ...article, stockFloor: 4, stockRoom: 0, unitsPerHour: 1.8 })
    expect(r.state).toBe('transfer')
  })

  it('leaves well-covered articles alone and sorts the plan by urgency', () => {
    const plan = replenishmentPlan(defaultSnapshot.articles)
    expect(plan[0].article.name).toBe('Black Wide-Leg Trousers')
    expect(plan.at(-1)?.state).toBe('healthy')
  })
})

describe('performance summary', () => {
  it('keeps the headline numbers consistent with the action copy', () => {
    const s = summarizePerformance(defaultSnapshot.performance)
    expect(s.sales).toBeCloseTo(86390, -2)
    expect(s.trafficVsLastYear).toBeCloseTo(8.4, 1)
    expect(s.conversionDeltaPts).toBeCloseTo(-2.4, 5)
  })

  it('reflects scenario overrides', () => {
    const s = summarizePerformance(getSnapshotForScenario('conversion').performance)
    expect(s.salesVsLastYear).toBeLessThan(0)
  })
})

describe('formatting', () => {
  it('formats signed deltas with a true minus sign', () => {
    expect(formatSigned(-2.4, 1, ' pts')).toBe('−2.4 pts')
    expect(formatSigned(8.43)).toBe('+8.4%')
  })

  it('shows short cover in minutes', () => {
    expect(formatCover(0.71)).toBe('45 min')
    expect(formatCover(2.2)).toBe('2.2 h')
  })
})
