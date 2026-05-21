export interface ForecastData {
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
    weathercode: number[]
    apparent_temperature_max: number[]
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    relativehumidity_2m: number[]
    apparent_temperature: number[]
  }
}

export async function fetchForecast(lat: number, lng: number): Promise<ForecastData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lng))
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,apparent_temperature_max')
  url.searchParams.set('hourly', 'temperature_2m,relativehumidity_2m,apparent_temperature')
  url.searchParams.set('temperature_unit', 'fahrenheit')
  url.searchParams.set('precipitation_unit', 'mm')
  url.searchParams.set('timezone', 'auto')
  url.searchParams.set('forecast_days', '14')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Open-Meteo forecast failed: ${res.status}`)
  return res.json()
}
