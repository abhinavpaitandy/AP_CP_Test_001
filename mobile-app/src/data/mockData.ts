// Fictional demo data for one store on a single trading day.
// Reference moment: Monday 19 October 2026, 14:30 (store trades 10:00–20:00).
// Headline figures are derived (sales = traffic × conversion × basket) so the
// numbers a manager sees on different screens always agree with each other.

export type ScenarioKey = 'stock' | 'conversion' | 'returns'
export type ActionStatus = 'open' | 'started' | 'done' | 'snoozed'
export type Severity = 'High' | 'Medium' | 'Low'

export interface StoreAction {
  id: string
  title: string
  summary: string
  metricLabel: string
  metricValue: string
  impact: string
  owner: string
  dueBy: string
  severity: Severity
  confidence: number
  urgency: number
  businessImpact: number
  actionability: number
  status: ActionStatus
  dataFreshness: string
  primaryCta: string
  detail: {
    issue: string
    whyItMatters: string
    signals: string[]
    causes: string[]
    recommendedAction: string
    confidenceText: string
    limitations: string
  }
  productId: string
}

export interface DayPoint {
  day: string
  sales: number
  salesLastYear: number
  visitors: number
  conversion: number
}

export interface HourPoint {
  hour: string
  visitors: number
  conversion: number
  conversionLastYear: number
}

export interface Article {
  id: string
  name: string
  department: 'Women' | 'Men' | 'Kids' | 'Home'
  price: number
  sizes: string
  stockFloor: number
  stockRoom: number
  /** Units sold per trading hour today. */
  unitsPerHour: number
}

export interface QualityAlert {
  id: string
  kind: 'returns' | 'quality'
  severity: Severity
  articleId: string
  title: string
  metric: string
  reason: string
  nextStep: string
  actionId?: string
}

export interface Performance {
  asOf: string
  salesTarget: number
  traffic: number
  trafficLastYear: number
  conversion: number
  conversionLastYear: number
  avgBasket: number
  avgBasketLastYear: number
}

export interface StoreSnapshot {
  storeName: string
  dateLabel: string
  dataFreshness: string
  performance: Performance
  actions: StoreAction[]
  week: DayPoint[]
  hourly: HourPoint[]
  articles: Article[]
  alerts: QualityAlert[]
  assistantSuggestions: string[]
}

export const scenarioOptions: { key: ScenarioKey; label: string; description: string }[] = [
  { key: 'stock', label: 'Stock opportunity', description: 'Best-seller running out on the floor' },
  { key: 'conversion', label: 'Conversion drop', description: 'Busy store, fewer buyers at midday' },
  { key: 'returns', label: 'Return spike', description: 'Fit issue driving knitwear returns' },
]

const basePerformance: Performance = {
  asOf: '14:30',
  salesTarget: 142000,
  traffic: 1480,
  trafficLastYear: 1365,
  conversion: 15.2,
  conversionLastYear: 17.6,
  avgBasket: 384,
  avgBasketLastYear: 352,
}

const actionBase: StoreAction[] = [
  {
    id: 'stock-opportunity',
    title: 'Refill Black Wide-Leg Trousers on the floor',
    summary: 'Selling 4.2 units an hour with only 3 left in the selling area. The floor runs out in about 45 minutes.',
    metricLabel: 'Floor stock',
    metricValue: '3 left · 18 in stockroom',
    impact: '≈ SEK 9,900 sales at risk today',
    owner: 'Stockroom team',
    dueBy: 'Before 15:00',
    severity: 'High',
    confidence: 0.94,
    urgency: 0.92,
    businessImpact: 0.96,
    actionability: 0.9,
    status: 'open',
    dataFreshness: 'Updated 4 min ago',
    primaryCta: 'Start refill',
    detail: {
      issue: 'The store’s fastest-selling bottom has almost no visible stock left, while 18 units sit in the stockroom.',
      whyItMatters:
        'At today’s pace about 20 more customers will look for this style before close. Without a refill most of them leave without it.',
      signals: [
        '3 units on the floor, 18 in the stockroom',
        'Selling 4.2 units per hour, 52% above forecast',
        'Sizes S and M are already gone from the main fixture',
      ],
      causes: [
        'Morning replenishment round was based on forecast, not today’s sell-through',
        'Strong weekend demand carried over into Monday',
      ],
      recommendedAction:
        'Move 10 units (mostly S and M) from the stockroom to the women’s denim and trousers wall, then check again at 17:00.',
      confidenceText: 'High confidence. Stock counts and till data agree and were updated 4 minutes ago.',
      limitations: 'Assumes stockroom counts are accurate. A quick physical check before moving stock is recommended.',
    },
    productId: 'article-101',
  },
  {
    id: 'conversion-drop',
    title: 'Fix the midday conversion dip',
    summary: 'Visitors are up 8.4% on last year, but fewer of them are buying. The gap is concentrated between 12:00 and 14:00.',
    metricLabel: 'Conversion',
    metricValue: '15.2% vs 17.6% last year',
    impact: '≈ SEK 13,800 upside if it recovers',
    owner: 'Shift lead',
    dueBy: 'Before 16:00',
    severity: 'High',
    confidence: 0.8,
    urgency: 0.88,
    businessImpact: 0.87,
    actionability: 0.76,
    status: 'open',
    dataFreshness: 'Updated 7 min ago',
    primaryCta: 'Start check',
    detail: {
      issue: 'The store is attracting more visitors than last year but converting fewer of them into purchases.',
      whyItMatters:
        'Recovering the 2.4-point gap for the rest of the day is worth roughly 36 extra transactions, without needing more traffic.',
      signals: [
        'Traffic 1,480 today, +8.4% on the same day last year',
        'Conversion 12:00–14:00 averaged 13.0%, against 17.2% last year',
        'Conversion before 12:00 and after 14:00 is close to normal',
      ],
      causes: [
        'Fitting-room queues during the lunch peak',
        'Only two tills open during staff breaks',
        'Gaps on key fixtures (see the trousers refill)',
      ],
      recommendedAction:
        'Stagger lunch breaks so three tills and the fitting room stay staffed from 12:00 to 14:00. Re-check conversion at 16:00.',
      confidenceText: 'Moderate confidence. The pattern is clear, but queue length is not measured directly.',
      limitations: 'Fitting-room and till queue data are not available, so the cause is a strong hypothesis, not confirmed.',
    },
    productId: 'article-204',
  },
  {
    id: 'return-review',
    title: 'Check fit on Ribbed Knit Top, size M',
    summary: 'Returns on size M are running at 12.6%, well above the 8.1% knitwear baseline. Most cite “runs small”.',
    metricLabel: 'Return rate',
    metricValue: '12.6% vs 8.1% baseline',
    impact: '≈ SEK 2,100 margin lost per week',
    owner: 'Department lead',
    dueBy: 'Today',
    severity: 'Medium',
    confidence: 0.84,
    urgency: 0.68,
    businessImpact: 0.7,
    actionability: 0.71,
    status: 'open',
    dataFreshness: 'Updated 11 min ago',
    primaryCta: 'Start review',
    detail: {
      issue: 'One size of one style is coming back far more often than comparable knitwear.',
      whyItMatters:
        'Repeated returns cost margin, tie up stock and frustrate customers who bought the wrong size.',
      signals: [
        'Size M return rate 12.6% vs 8.1% knitwear baseline',
        '62% of returns give “runs small” as the reason',
        'Most returns arrive within 48 hours of purchase',
      ],
      causes: ['Size M may be cut smaller than the size guide suggests', 'Fixture shows M without fit guidance'],
      recommendedAction:
        'Try on two size M units against the size guide, add a “consider sizing up” note at the fixture, and report the fit to the product team.',
      confidenceText: 'Moderate to high confidence. The pattern has held for six days across 31 returns.',
      limitations: 'Reasons are chosen by customers at the till and are not verified.',
    },
    productId: 'article-305',
  },
]

const week: DayPoint[] = [
  { day: 'Mon', sales: 128400, salesLastYear: 124100, visitors: 2310, conversion: 16.9 },
  { day: 'Tue', sales: 131200, salesLastYear: 127300, visitors: 2380, conversion: 16.6 },
  { day: 'Wed', sales: 139100, salesLastYear: 133600, visitors: 2460, conversion: 17.2 },
  { day: 'Thu', sales: 135800, salesLastYear: 138200, visitors: 2420, conversion: 17.0 },
  { day: 'Fri', sales: 158300, salesLastYear: 149500, visitors: 2790, conversion: 16.4 },
  { day: 'Sat', sales: 204100, salesLastYear: 196400, visitors: 3560, conversion: 16.1 },
  { day: 'Sun', sales: 176200, salesLastYear: 171000, visitors: 3120, conversion: 15.8 },
]

const hourly: HourPoint[] = [
  { hour: '10', visitors: 210, conversion: 18.6, conversionLastYear: 18.9 },
  { hour: '11', visitors: 290, conversion: 17.2, conversionLastYear: 18.1 },
  { hour: '12', visitors: 360, conversion: 13.1, conversionLastYear: 17.4 },
  { hour: '13', visitors: 380, conversion: 12.9, conversionLastYear: 17.0 },
  { hour: '14', visitors: 240, conversion: 16.3, conversionLastYear: 17.2 },
]

const articles: Article[] = [
  { id: 'article-101', name: 'Black Wide-Leg Trousers', department: 'Women', price: 499, sizes: 'XS–XL', stockFloor: 3, stockRoom: 18, unitsPerHour: 4.2 },
  { id: 'article-118', name: 'Relaxed Fit Hoodie', department: 'Men', price: 299, sizes: 'S–XXL', stockFloor: 6, stockRoom: 34, unitsPerHour: 3.1 },
  { id: 'article-127', name: 'Straight Regular Jeans', department: 'Men', price: 399, sizes: '30–36', stockFloor: 4, stockRoom: 0, unitsPerHour: 1.8 },
  { id: 'article-412', name: 'Kids Padded Jacket', department: 'Kids', price: 449, sizes: '110–140', stockFloor: 2, stockRoom: 12, unitsPerHour: 1.4 },
  { id: 'article-204', name: 'Tailored Knit Blazer', department: 'Women', price: 699, sizes: 'XS–L', stockFloor: 11, stockRoom: 22, unitsPerHour: 1.1 },
  { id: 'article-305', name: 'Ribbed Knit Top', department: 'Women', price: 199, sizes: 'XS–XL', stockFloor: 16, stockRoom: 29, unitsPerHour: 1.5 },
  { id: 'article-402', name: 'Cotton Overshirt', department: 'Men', price: 399, sizes: 'S–XL', stockFloor: 9, stockRoom: 31, unitsPerHour: 0.8 },
]

const alerts: QualityAlert[] = [
  {
    id: 'alert-overshirt-buttons',
    kind: 'quality',
    severity: 'High',
    articleId: 'article-402',
    title: 'Cotton Overshirt: loose buttons',
    metric: '4 returns this week',
    reason: 'All four mention buttons coming off after first wear. Same delivery batch (week 38).',
    nextStep: 'Check the 9 floor units and pull any with loose buttons. Report to quality.',
  },
  {
    id: 'alert-knit-top-fit',
    kind: 'returns',
    severity: 'Medium',
    articleId: 'article-305',
    title: 'Ribbed Knit Top, size M',
    metric: '12.6% returns vs 8.1%',
    reason: '62% of returns say the size runs small.',
    nextStep: 'Add sizing guidance at the fixture.',
    actionId: 'return-review',
  },
  {
    id: 'alert-skirt-delivery',
    kind: 'quality',
    severity: 'Low',
    articleId: 'article-509',
    title: 'Satin Midi Skirt: pulled threads',
    metric: '3 of 24 units in delivery',
    reason: 'Found during unpacking of this morning’s delivery.',
    nextStep: 'Inspect the remaining 21 units before they go to the floor.',
  },
]

const scenarioOverrides: Record<ScenarioKey, (snapshot: StoreSnapshot) => StoreSnapshot> = {
  stock: (snapshot) => snapshot,
  conversion: (snapshot) => ({
    ...snapshot,
    dataFreshness: 'Updated 6 min ago',
    performance: { ...snapshot.performance, traffic: 1520, conversion: 14.1, avgBasket: 390 },
    actions: snapshot.actions.map((action) =>
      action.id === 'conversion-drop'
        ? {
            ...action,
            summary: 'Visitors are up 11% on last year, but conversion has fallen to 14.1%. The gap is widest between 12:00 and 14:00.',
            metricValue: '14.1% vs 17.6% last year',
            impact: '≈ SEK 20,600 upside if it recovers',
            urgency: 0.97,
            businessImpact: 0.98,
          }
        : action,
    ),
    assistantSuggestions: [
      'Why is conversion down today?',
      'How are we doing against last year?',
      'Summarize today’s performance',
    ],
  }),
  returns: (snapshot) => ({
    ...snapshot,
    dataFreshness: 'Updated 9 min ago',
    performance: { ...snapshot.performance, traffic: 1498, conversion: 16.4, avgBasket: 372 },
    actions: snapshot.actions.map((action) =>
      action.id === 'return-review'
        ? {
            ...action,
            title: 'Stop the size M return spike on knit tops',
            summary: 'Size M returns jumped to 18.4% in three days and now make up a third of all knitwear returns.',
            metricValue: '18.4% vs 8.1% baseline',
            impact: '≈ SEK 4,800 margin lost per week',
            severity: 'High',
            urgency: 0.95,
            businessImpact: 0.94,
            confidence: 0.9,
            actionability: 0.92,
            detail: {
              ...action.detail,
              signals: [
                'Size M return rate 18.4% vs 8.1% knitwear baseline',
                '68% of returns give “runs small” as the reason',
                'Rate has risen every day since Friday',
              ],
            },
          }
        : action,
    ),
    alerts: snapshot.alerts.map((alert) =>
      alert.id === 'alert-knit-top-fit' ? { ...alert, severity: 'High', metric: '18.4% returns vs 8.1%' } : alert,
    ),
    assistantSuggestions: [
      'Which products need attention?',
      'What should I prioritize?',
      'Summarize today’s performance',
    ],
  }),
}

export function getSnapshotForScenario(key: ScenarioKey): StoreSnapshot {
  const base: StoreSnapshot = {
    storeName: 'Stockholm City',
    dateLabel: 'Monday 19 October',
    dataFreshness: 'Updated 4 min ago',
    performance: { ...basePerformance },
    actions: actionBase.map((action) => ({ ...action })),
    week,
    hourly,
    articles: articles.map((article) => ({ ...article })),
    alerts: alerts.map((alert) => ({ ...alert })),
    assistantSuggestions: [
      'What should I prioritize?',
      'Why is conversion down today?',
      'Which products need attention?',
      'How are we doing against last year?',
    ],
  }
  return scenarioOverrides[key](base)
}

export const defaultSnapshot = getSnapshotForScenario('stock')
