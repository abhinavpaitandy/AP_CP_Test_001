import type { Article, Performance } from '../data/mockData'

/** Hours of floor cover a replenishment round should leave behind. */
export const TARGET_COVER_HOURS = 3

export interface PerformanceSummary {
  sales: number
  salesLastYear: number
  salesVsLastYear: number
  targetProgress: number
  trafficVsLastYear: number
  conversionDeltaPts: number
  basketVsLastYear: number
}

const pctChange = (current: number, previous: number) => ((current - previous) / previous) * 100

export function summarizePerformance(p: Performance): PerformanceSummary {
  const sales = Math.round((p.traffic * (p.conversion / 100) * p.avgBasket) / 10) * 10
  const salesLastYear = Math.round((p.trafficLastYear * (p.conversionLastYear / 100) * p.avgBasketLastYear) / 10) * 10

  return {
    sales,
    salesLastYear,
    salesVsLastYear: pctChange(sales, salesLastYear),
    targetProgress: Math.min(1, sales / p.salesTarget),
    trafficVsLastYear: pctChange(p.traffic, p.trafficLastYear),
    conversionDeltaPts: p.conversion - p.conversionLastYear,
    basketVsLastYear: pctChange(p.avgBasket, p.avgBasketLastYear),
  }
}

export type ReplenishmentState = 'move' | 'transfer' | 'healthy'

export interface Replenishment {
  article: Article
  coverHours: number
  moveUnits: number
  shortfall: number
  state: ReplenishmentState
}

/**
 * Recommends how many units to bring from the stockroom so the floor holds
 * TARGET_COVER_HOURS of sales at today's pace. If the stockroom can't cover
 * the need, the article needs a transfer from another store instead.
 */
export function recommendReplenishment(article: Article): Replenishment {
  const coverHours = article.unitsPerHour > 0 ? article.stockFloor / article.unitsPerHour : Infinity
  const needed = Math.max(0, Math.ceil(article.unitsPerHour * TARGET_COVER_HOURS) - article.stockFloor)
  const moveUnits = Math.min(needed, article.stockRoom)
  const shortfall = needed - moveUnits

  const state: ReplenishmentState = needed === 0 ? 'healthy' : moveUnits === 0 ? 'transfer' : 'move'
  return { article, coverHours, moveUnits, shortfall, state }
}

export function replenishmentPlan(articles: Article[]): Replenishment[] {
  return articles.map(recommendReplenishment).sort((a, b) => a.coverHours - b.coverHours)
}

export const formatSek = (value: number) => `SEK ${Math.round(value).toLocaleString('en-US')}`

export const formatSigned = (value: number, digits = 1, unit = '%') =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value).toFixed(digits)}${unit}`

export function formatCover(hours: number): string {
  if (!Number.isFinite(hours)) return 'No sales yet'
  if (hours < 1) return `${Math.max(5, Math.round((hours * 60) / 5) * 5)} min`
  return `${hours.toFixed(1)} h`
}
