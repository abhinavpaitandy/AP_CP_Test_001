import type { StoreSnapshot } from '../data/mockData'
import { formatSek, formatSigned, recommendReplenishment, summarizePerformance } from './metrics'
import { sortActions } from './scoring'

export interface AssistantAnswer {
  text: string
  sources: string[]
}

/**
 * Deterministic stand-in for the Store Intelligence model. Answers are built
 * from the same snapshot the screens use, so they never contradict the UI.
 */
export function answerQuestion(question: string, snapshot: StoreSnapshot): AssistantAnswer {
  const q = question.toLowerCase()
  const p = snapshot.performance
  const s = summarizePerformance(p)
  const [top] = sortActions(snapshot.actions.filter((a) => a.status !== 'done'))

  if (q.includes('convert') || q.includes('conversion')) {
    const midday = snapshot.hourly.filter((h) => h.hour === '12' || h.hour === '13')
    const avg = (key: 'conversion' | 'conversionLastYear') =>
      midday.reduce((sum, h) => sum + h[key] * h.visitors, 0) / midday.reduce((sum, h) => sum + h.visitors, 0)
    return {
      text: `Conversion is ${p.conversion.toFixed(1)}% against ${p.conversionLastYear.toFixed(1)}% on the same day last year (${formatSigned(s.conversionDeltaPts, 1, ' pts')}), while traffic is ${formatSigned(s.trafficVsLastYear)}. Demand is there; the drop sits between 12:00 and 14:00, where conversion averaged ${avg('conversion').toFixed(1)}% vs ${avg('conversionLastYear').toFixed(1)}% last year. That points to lunch-peak friction: fitting-room queues, fewer open tills and empty fixtures.`,
      sources: ['Door counter', 'Till transactions', 'Last year, same weekday'],
    }
  }

  if (q.includes('product') || q.includes('attention') || q.includes('stock')) {
    const urgent = snapshot.articles.map(recommendReplenishment).filter((r) => r.state !== 'healthy')
    const quality = snapshot.alerts.filter((a) => a.kind === 'quality')
    return {
      text: `Stock: ${urgent.map((r) => `${r.article.name} (${r.state === 'transfer' ? 'stockroom empty, request a transfer' : `move ${r.moveUnits}`})`).join(', ')}. Quality: ${quality.map((a) => a.title).join('; ')}. Returns: Ribbed Knit Top in size M is coming back far more than usual, mostly for running small.`,
      sources: ['Stock counts', 'Returns log', 'Delivery checks'],
    }
  }

  if (q.includes('last year') || q.includes('compare') || q.includes('against')) {
    return {
      text: `Sales so far are ${formatSek(s.sales)}, ${formatSigned(s.salesVsLastYear)} on last year at the same time. Traffic is ${formatSigned(s.trafficVsLastYear)} and average basket ${formatSigned(s.basketVsLastYear)}, but conversion is ${formatSigned(s.conversionDeltaPts, 1, ' pts')}. The growth is coming from more visitors spending more, not from converting better.`,
      sources: ['Till transactions', 'Door counter', 'Last year, same weekday'],
    }
  }

  if (q.includes('summar')) {
    return {
      text: `At ${p.asOf} the store has taken ${formatSek(s.sales)}, ${Math.round(s.targetProgress * 100)}% of today’s ${formatSek(p.salesTarget)} target. Traffic is strong (${formatSigned(s.trafficVsLastYear)}), conversion is the weak spot (${p.conversion.toFixed(1)}%). Three things to do: refill the wide-leg trousers, staff tills and fitting rooms over lunch, and check the fit on the size M knit top.`,
      sources: ['Till transactions', 'Door counter', 'Stock counts'],
    }
  }

  if (top) {
    return {
      text: `Start with “${top.title}”. It ranks first because it combines high impact (${top.impact.replace('≈ ', 'about ')}) with a fix your team can finish quickly. ${top.detail.recommendedAction}`,
      sources: ['Priority model', 'Stock counts', 'Till transactions'],
    }
  }

  return {
    text: 'All of today’s priority actions are done. Keep an eye on midday conversion and the quality alerts in Stock.',
    sources: ['Priority model'],
  }
}
