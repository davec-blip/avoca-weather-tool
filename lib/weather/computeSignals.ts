import type { ForecastData } from './fetchForecast'
import type { ClimateData } from './fetchClimateNormals'

export interface WeatherSignals {
  // Per-day forecast arrays (14 days) — stored so the UI can show actual daily data
  dailyHighsF?: number[]
  dailyLowsF?: number[]
  dailyCodes?: number[]
  dailyDates?: string[]

  // Temperature — Week 1
  week1HighF: number
  week1LowF: number
  daysAbove90W1: number
  daysAbove95W1: number
  daysBelow32W1: number
  daysBelow20W1: number
  consecutiveHotDaysW1: number
  consecutiveColDaysW1: number

  // Temperature — Week 2
  week2HighF: number
  week2LowF: number
  daysAbove90W2: number
  daysAbove95W2: number
  daysBelow32W2: number
  daysBelow20W2: number
  consecutiveHotDaysW2: number
  consecutiveColdDaysW2: number

  // Anomaly (vs 30-year monthly normal)
  monthlyAvgHighF: number
  monthlyAvgLowF: number
  week1TempAnomalyF: number
  week2TempAnomalyF: number
  anomalyStreakDays: number

  // Other temp
  heatIndexPeakF: number
  tempSwingMaxF: number

  // Storm — Week 1
  stormDaysW1: number
  heavyRainDaysW1: number
  hasFreezeRainW1: boolean
  hasSnowW1: boolean
  thunderstormDaysW1: number
  postStormDaysW1: number
  totalPrecip7DayMm: number

  // Storm — Week 2
  stormDaysW2: number
  hasFreezeRainW2: boolean
  thunderstormDaysW2: number
  postStormDaysW2: number

  // Precip anomaly
  monthlyAvgPrecipMm: number
  precipAnomalyPct: number

  // Humidity / Comfort
  avgHumidityW1: number
  highHumidityDaysW1: number
  heatStressDaysW1: number
  avgHumidityW2: number
  heatStressDaysW2: number
}

function isStormCode(code: number): boolean {
  return (code >= 61 && code <= 82) || (code >= 95 && code <= 99)
}

function isThunderstormCode(code: number): boolean {
  return code >= 95 && code <= 99
}

function isFreezeRainCode(code: number): boolean {
  return code === 66 || code === 67
}

function isSnowCode(code: number): boolean {
  return code >= 71 && code <= 77
}

function maxConsecutiveHotStreak(highs: number[]): number {
  let max = 0, cur = 0
  for (const h of highs) {
    if (h >= 90) { cur++; max = Math.max(max, cur) }
    else cur = 0
  }
  return max
}

function maxConsecutiveColdStreak(lows: number[]): number {
  let max = 0, cur = 0
  for (const l of lows) {
    if (l <= 35) { cur++; max = Math.max(max, cur) }
    else cur = 0
  }
  return max
}

function getHourlySliceForDay(hourly: ForecastData['hourly'], dayIndex: number) {
  const start = dayIndex * 24
  const end = start + 24
  return {
    humidity: hourly.relativehumidity_2m.slice(start, end),
    apparentTemp: hourly.apparent_temperature.slice(start, end),
  }
}

export function computeSignals(
  forecast: ForecastData,
  climate: ClimateData
): WeatherSignals {
  const daily = forecast.daily
  const hourly = forecast.hourly

  const w1Highs = daily.temperature_2m_max.slice(0, 7)
  const w1Lows = daily.temperature_2m_min.slice(0, 7)
  const w1Codes = daily.weathercode.slice(0, 7)
  const w1Precip = daily.precipitation_sum.slice(0, 7)
  const w2Highs = daily.temperature_2m_max.slice(7, 14)
  const w2Lows = daily.temperature_2m_min.slice(7, 14)
  const w2Codes = daily.weathercode.slice(7, 14)

  // ── Climate normals ──────────────────────────────────────────────────────
  const climHighs = climate.daily.temperature_2m_max.filter(v => v != null && !isNaN(v))
  const climLows = climate.daily.temperature_2m_min.filter(v => v != null && !isNaN(v))
  const climPrecips = climate.daily.precipitation_sum.filter(v => v != null && !isNaN(v))

  const monthlyAvgHighF = climHighs.length
    ? climHighs.reduce((a, b) => a + b, 0) / climHighs.length
    : 75
  const monthlyAvgLowF = climLows.length
    ? climLows.reduce((a, b) => a + b, 0) / climLows.length
    : 55
  const monthlyAvgPrecipMm = climPrecips.length
    ? climPrecips.reduce((a, b) => a + b, 0)
    : 50

  // ── W1 Temperature ───────────────────────────────────────────────────────
  const week1HighF = Math.max(...w1Highs)
  const week1LowF = Math.min(...w1Lows)
  const daysAbove90W1 = w1Highs.filter(h => h >= 90).length
  const daysAbove95W1 = w1Highs.filter(h => h >= 95).length
  const daysBelow32W1 = w1Lows.filter(l => l <= 32).length
  const daysBelow20W1 = w1Lows.filter(l => l <= 20).length
  const consecutiveHotDaysW1 = maxConsecutiveHotStreak(w1Highs)
  const consecutiveColDaysW1 = maxConsecutiveColdStreak(w1Lows)

  // ── W2 Temperature ───────────────────────────────────────────────────────
  const week2HighF = Math.max(...w2Highs)
  const week2LowF = Math.min(...w2Lows)
  const daysAbove90W2 = w2Highs.filter(h => h >= 90).length
  const daysAbove95W2 = w2Highs.filter(h => h >= 95).length
  const daysBelow32W2 = w2Lows.filter(l => l <= 32).length
  const daysBelow20W2 = w2Lows.filter(l => l <= 20).length
  const consecutiveHotDaysW2 = maxConsecutiveHotStreak(w2Highs)
  const consecutiveColdDaysW2 = maxConsecutiveColdStreak(w2Lows)

  // ── Anomaly ──────────────────────────────────────────────────────────────
  const week1TempAnomalyF = week1HighF - monthlyAvgHighF
  const week2TempAnomalyF = week2HighF - monthlyAvgHighF

  // Consecutive days (across all 14) where daily high >= 10°F above normal
  let anomalyStreakDays = 0
  let curStreak = 0
  for (const h of [...w1Highs, ...w2Highs]) {
    if (h - monthlyAvgHighF >= 10) { curStreak++; anomalyStreakDays = Math.max(anomalyStreakDays, curStreak) }
    else curStreak = 0
  }

  // ── Heat index peak (apparent_temperature max across 14 days) ────────────
  const allApparent = daily.apparent_temperature_max
  const heatIndexPeakF = allApparent.length ? Math.max(...allApparent) : week1HighF

  // ── Temp swing max (largest single-day high - low delta) ─────────────────
  let tempSwingMaxF = 0
  for (let i = 0; i < 14; i++) {
    const swing = daily.temperature_2m_max[i] - daily.temperature_2m_min[i]
    if (swing > tempSwingMaxF) tempSwingMaxF = swing
  }

  // ── Storm signals W1 ─────────────────────────────────────────────────────
  const stormDaysW1 = w1Codes.filter(isStormCode).length
  const thunderstormDaysW1 = w1Codes.filter(isThunderstormCode).length
  const hasFreezeRainW1 = w1Codes.some(isFreezeRainCode)
  const hasSnowW1 = w1Codes.some(isSnowCode)
  const heavyRainDaysW1 = w1Precip.filter(p => p > 25).length
  const totalPrecip7DayMm = w1Precip.reduce((a, b) => a + b, 0)

  // Post-storm days W1: days 2–7 (index 1–6) that immediately follow a storm day
  let postStormDaysW1 = 0
  for (let i = 1; i < 7; i++) {
    if (isStormCode(w1Codes[i - 1])) postStormDaysW1++
  }

  // ── Storm signals W2 ─────────────────────────────────────────────────────
  const stormDaysW2 = w2Codes.filter(isStormCode).length
  const thunderstormDaysW2 = w2Codes.filter(isThunderstormCode).length
  const hasFreezeRainW2 = w2Codes.some(isFreezeRainCode)

  // Post-storm days W2: days that immediately follow a storm day within W2
  // Also count day 8 (index 7) if day 7 (index 6) was a storm
  let postStormDaysW2 = 0
  const allCodesForPostStorm = [...w1Codes, ...w2Codes]
  for (let i = 7; i < 14; i++) {
    if (isStormCode(allCodesForPostStorm[i - 1])) postStormDaysW2++
  }

  // ── Precip anomaly ────────────────────────────────────────────────────────
  const weeklyNormalMm = monthlyAvgPrecipMm / 4
  const precipAnomalyPct = weeklyNormalMm > 0
    ? (totalPrecip7DayMm / weeklyNormalMm) - 1
    : 0

  // ── Humidity / Comfort ────────────────────────────────────────────────────
  const w1HumidityByDay: number[] = []
  const w2HumidityByDay: number[] = []
  let highHumidityDaysW1 = 0
  let heatStressDaysW1 = 0
  let heatStressDaysW2 = 0

  for (let d = 0; d < 7; d++) {
    const { humidity } = getHourlySliceForDay(hourly, d)
    const avgHum = humidity.length
      ? humidity.reduce((a, b) => a + b, 0) / humidity.length
      : 50
    w1HumidityByDay.push(avgHum)
    if (avgHum > 70) highHumidityDaysW1++
    if (w1Highs[d] > 88 && avgHum > 60) heatStressDaysW1++
  }

  for (let d = 7; d < 14; d++) {
    const { humidity } = getHourlySliceForDay(hourly, d)
    const avgHum = humidity.length
      ? humidity.reduce((a, b) => a + b, 0) / humidity.length
      : 50
    w2HumidityByDay.push(avgHum)
    if (w2Highs[d - 7] > 88 && avgHum > 60) heatStressDaysW2++
  }

  const avgHumidityW1 = w1HumidityByDay.length
    ? w1HumidityByDay.reduce((a, b) => a + b, 0) / w1HumidityByDay.length
    : 50
  const avgHumidityW2 = w2HumidityByDay.length
    ? w2HumidityByDay.reduce((a, b) => a + b, 0) / w2HumidityByDay.length
    : 50

  return {
    dailyHighsF: daily.temperature_2m_max.slice(0, 14),
    dailyLowsF: daily.temperature_2m_min.slice(0, 14),
    dailyCodes: daily.weathercode.slice(0, 14),
    dailyDates: daily.time.slice(0, 14),

    week1HighF,
    week1LowF,
    daysAbove90W1,
    daysAbove95W1,
    daysBelow32W1,
    daysBelow20W1,
    consecutiveHotDaysW1,
    consecutiveColDaysW1,

    week2HighF,
    week2LowF,
    daysAbove90W2,
    daysAbove95W2,
    daysBelow32W2,
    daysBelow20W2,
    consecutiveHotDaysW2,
    consecutiveColdDaysW2,

    monthlyAvgHighF,
    monthlyAvgLowF,
    week1TempAnomalyF,
    week2TempAnomalyF,
    anomalyStreakDays,

    heatIndexPeakF,
    tempSwingMaxF,

    stormDaysW1,
    heavyRainDaysW1,
    hasFreezeRainW1,
    hasSnowW1,
    thunderstormDaysW1,
    postStormDaysW1,
    totalPrecip7DayMm,

    stormDaysW2,
    hasFreezeRainW2,
    thunderstormDaysW2,
    postStormDaysW2,

    monthlyAvgPrecipMm,
    precipAnomalyPct,

    avgHumidityW1,
    highHumidityDaysW1,
    heatStressDaysW1,
    avgHumidityW2,
    heatStressDaysW2,
  }
}
