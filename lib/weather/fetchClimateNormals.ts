export interface ClimateData {
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
  }
}

/**
 * Fetches the same calendar month across the last 10 years using the
 * Open-Meteo Historical Archive API (ERA5-based reanalysis).
 * 10 parallel requests are made and merged so computeSignals can
 * average them into a true 10-year monthly baseline.
 */
export async function fetchClimateNormals(lat: number, lng: number): Promise<ClimateData> {
  const now = new Date()
  const currentYear = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const daysInMonth = new Date(currentYear, now.getMonth() + 1, 0).getDate()
  const dayPad = String(daysInMonth).padStart(2, '0')

  // Fetch the same month for each of the past 10 years (currentYear-10 … currentYear-1)
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 10 + i)

  const results = await Promise.allSettled(
    years.map(y => {
      const url = new URL('https://archive-api.open-meteo.com/v1/archive')
      url.searchParams.set('latitude', String(lat))
      url.searchParams.set('longitude', String(lng))
      url.searchParams.set('start_date', `${y}-${month}-01`)
      url.searchParams.set('end_date', `${y}-${month}-${dayPad}`)
      url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum')
      url.searchParams.set('temperature_unit', 'fahrenheit')
      return fetch(url.toString()).then(r => r.ok ? (r.json() as Promise<ClimateData>) : Promise.reject(r.status))
    })
  )

  // Merge all successful year responses into a single flat array
  const allMaxTemps: number[] = []
  const allMinTemps: number[] = []
  const allPrecips: number[] = []
  const allTimes: string[] = []

  for (const r of results) {
    if (r.status !== 'fulfilled') continue
    const data = r.value
    allMaxTemps.push(...data.daily.temperature_2m_max.filter(v => v != null && !isNaN(v)))
    allMinTemps.push(...data.daily.temperature_2m_min.filter(v => v != null && !isNaN(v)))
    allPrecips.push(...data.daily.precipitation_sum.filter(v => v != null && !isNaN(v)))
    allTimes.push(...data.daily.time)
  }

  // Fallback: if the archive calls all fail, return sensible defaults so the app doesn't crash
  if (allMaxTemps.length === 0) {
    return {
      daily: {
        time: [],
        temperature_2m_max: [75],
        temperature_2m_min: [55],
        precipitation_sum: [50],
      }
    }
  }

  return {
    daily: {
      time: allTimes,
      temperature_2m_max: allMaxTemps,
      temperature_2m_min: allMinTemps,
      precipitation_sum: allPrecips,
    }
  }
}
