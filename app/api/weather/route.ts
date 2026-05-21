export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { geocodeZip } from '@/lib/weather/geocode'
import { fetchForecast } from '@/lib/weather/fetchForecast'
import { fetchClimateNormals } from '@/lib/weather/fetchClimateNormals'
import { computeSignals } from '@/lib/weather/computeSignals'
import { computeDemandScoreFromSignals, classifyPhase, getSituationLabel } from '@/lib/scoring/demandScore'

export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get('zip')
  if (!zip) return NextResponse.json({ error: 'Missing zip' }, { status: 400 })

  try {
    const geo = await geocodeZip(zip)
    const [forecast, climate] = await Promise.all([
      fetchForecast(geo.lat, geo.lng),
      fetchClimateNormals(geo.lat, geo.lng),
    ])
    const signals = computeSignals(forecast, climate)
    const scoreW1 = computeDemandScoreFromSignals(signals, 'w1')
    const scoreW2 = computeDemandScoreFromSignals(signals, 'w2')
    const phaseW1 = classifyPhase('w1', signals, scoreW1)
    const phaseW2 = classifyPhase('w2', signals, scoreW2)
    const situationLabel = getSituationLabel(phaseW1, phaseW2)

    return NextResponse.json({
      geo, signals, scoreW1, scoreW2, phaseW1, phaseW2, situationLabel,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
