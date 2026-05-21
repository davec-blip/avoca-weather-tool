export interface ClimateData {
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
  }
}

export async function fetchClimateNormals(lat: number, lng: number): Promise<ClimateData> {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate()
  const startDate = `${year}-${month}-01`
  const endDate = `${year}-${month}-${String(daysInMonth).padStart(2, '0')}`

  const url = new URL('https://climate-api.open-meteo.com/v1/climate')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lng))
  url.searchParams.set('start_date', startDate)
  url.searchParams.set('end_date', endDate)
  url.searchParams.set('models', 'EC_Earth3P_HR')
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum')
  url.searchParams.set('temperature_unit', 'fahrenheit')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Open-Meteo climate failed: ${res.status}`)
  return res.json()
}
