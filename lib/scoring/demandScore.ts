import type { WeatherSignals } from '../weather/computeSignals'

export type Phase = 'CALM' | 'BUILDING' | 'SURGE' | 'POST_EVENT'

interface WeekSignals {
  daysAbove90: number
  daysBelow32: number
  consecutiveHotDays: number
  consecutiveColdDays: number
  stormDays: number
  thunderstormDays: number
  hasFreezeRain: boolean
  hasSnow: boolean
  postStormDays: number
  heatStressDays: number
  avgHumidity: number
}

export function computeDemandScore(signals: WeekSignals, anomalyF: number): number {
  let score = 0

  // Absolute temperature pressure (max 40 pts)
  score += signals.daysAbove90 * 5
  score += (signals.daysAbove90) * 7  // days_above_95 not available in WeekSignals, use daysAbove90 as proxy
  score += signals.daysBelow32 * 5
  if (signals.consecutiveHotDays >= 3) score += 8
  if (signals.consecutiveColdDays >= 3) score += 8

  // Anomaly pressure (max 25 pts)
  if (anomalyF >= 5)  score += 8
  if (anomalyF >= 10) score += 10
  if (anomalyF >= 15) score += 7
  if (anomalyF <= -10) score += 15

  // Storm pressure (max 20 pts)
  score += signals.stormDays * 4
  score += signals.thunderstormDays * 2
  if (signals.hasFreezeRain) score += 10
  if (signals.hasSnow) score += 7
  score += signals.postStormDays * 3

  // Humidity / comfort (max 15 pts)
  score += signals.heatStressDays * 4
  if (signals.avgHumidity > 70) score += 3

  return Math.min(Math.round(score), 100)
}

export function computeDemandScoreFromSignals(signals: WeatherSignals, week: 'w1' | 'w2'): number {
  const isW1 = week === 'w1'

  // days_above_95 is tracked separately; subtract from above90 count for proper weighting
  const daysAbove90 = isW1 ? signals.daysAbove90W1 : signals.daysAbove90W2
  const daysAbove95 = isW1 ? signals.daysAbove95W1 : signals.daysAbove95W2
  const daysBelow32 = isW1 ? signals.daysBelow32W1 : signals.daysBelow32W2
  const daysBelow20 = isW1 ? signals.daysBelow20W1 : signals.daysBelow20W2
  const consecutiveHotDays = isW1 ? signals.consecutiveHotDaysW1 : signals.consecutiveHotDaysW2
  const consecutiveColdDays = isW1 ? signals.consecutiveColDaysW1 : signals.consecutiveColdDaysW2
  const stormDays = isW1 ? signals.stormDaysW1 : signals.stormDaysW2
  const thunderstormDays = isW1 ? signals.thunderstormDaysW1 : signals.thunderstormDaysW2
  const hasFreezeRain = isW1 ? signals.hasFreezeRainW1 : signals.hasFreezeRainW2
  const hasSnow = isW1 ? signals.hasSnowW1 : false
  const postStormDays = isW1 ? signals.postStormDaysW1 : signals.postStormDaysW2
  const heatStressDays = isW1 ? signals.heatStressDaysW1 : signals.heatStressDaysW2
  const avgHumidity = isW1 ? signals.avgHumidityW1 : signals.avgHumidityW2
  const anomalyF = isW1 ? signals.week1TempAnomalyF : signals.week2TempAnomalyF

  let score = 0

  // Absolute temperature pressure (max 40 pts)
  score += daysAbove90 * 5
  score += daysAbove95 * 7
  score += daysBelow32 * 5
  score += daysBelow20 * 9
  if (consecutiveHotDays >= 3) score += 8
  if (consecutiveColdDays >= 3) score += 8

  // Anomaly pressure (max 25 pts)
  if (anomalyF >= 5)  score += 8
  if (anomalyF >= 10) score += 10
  if (anomalyF >= 15) score += 7
  if (anomalyF <= -10) score += 15

  // Storm pressure (max 20 pts)
  score += stormDays * 4
  score += thunderstormDays * 2
  if (hasFreezeRain) score += 10
  if (hasSnow) score += 7
  score += postStormDays * 3

  // Humidity / comfort (max 15 pts)
  score += heatStressDays * 4
  if (avgHumidity > 70) score += 3

  return Math.min(Math.round(score), 100)
}

export function classifyPhase(week: 'w1' | 'w2', signals: WeatherSignals, score: number): Phase {
  const postStormDays = week === 'w1' ? signals.postStormDaysW1 : signals.postStormDaysW2
  const anomalyF = week === 'w1' ? signals.week1TempAnomalyF : signals.week2TempAnomalyF

  if (postStormDays >= 2) return 'POST_EVENT'
  if (score >= 50) return 'SURGE'
  if (score >= 25 || anomalyF >= 8) return 'BUILDING'
  return 'CALM'
}

const SITUATION_MATRIX: Record<string, string> = {
  'CALM|CALM':          'Full Lull',
  'CALM|BUILDING':      'Surge Incoming — 10+ days out',
  'CALM|SURGE':         'Surge Incoming — 7–10 days out',
  'BUILDING|SURGE':     'Surge Imminent — 3–6 days out',
  'SURGE|SURGE':        'Active Sustained Surge',
  'SURGE|CALM':         'Coming Off Surge',
  'SURGE|BUILDING':     'Surge + Second Wave Coming',
  'POST_EVENT|CALM':    'Storm Recovery',
  'POST_EVENT|BUILDING': 'Storm Recovery + Incoming',
  'CALM|POST_EVENT':    'Pre-Storm Calm',
}

export function getSituationLabel(phaseW1: Phase, phaseW2: Phase): string {
  return SITUATION_MATRIX[`${phaseW1}|${phaseW2}`] ?? `${phaseW1} → ${phaseW2}`
}

export function formatAnomalyLabel(anomalyF: number, month: string): string {
  if (Math.abs(anomalyF) < 3) return 'Near historical average'
  const dir = anomalyF > 0 ? 'above' : 'below'
  const abs = Math.abs(anomalyF).toFixed(0)
  return `${abs}°F ${dir} the 10-year average for ${month} in this market`
}
