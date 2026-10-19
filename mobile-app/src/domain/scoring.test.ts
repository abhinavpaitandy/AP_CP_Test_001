import { describe, expect, it } from 'vitest'
import { computePriority, sortActions } from './scoring'
import { defaultSnapshot, type StoreAction } from '../data/mockData'

const [template] = defaultSnapshot.actions

const actions: StoreAction[] = [
  { ...template, id: 'a', confidence: 0.5, urgency: 0.6, businessImpact: 0.4, actionability: 0.2 },
  { ...template, id: 'b', confidence: 0.9, urgency: 0.8, businessImpact: 0.9, actionability: 0.7 },
]

describe('priority scoring', () => {
  it('computes the expected score from impact, urgency, confidence and actionability', () => {
    expect(computePriority(actions[1])).toBe(0.454)
  })

  it('ranks higher priorities first', () => {
    expect(sortActions(actions)[0].id).toBe('b')
  })
})
