const STATE_TO_REGION: Record<string, string> = {
  ME: 'Northeast', NH: 'Northeast', VT: 'Northeast', MA: 'Northeast',
  RI: 'Northeast', CT: 'Northeast', NY: 'Northeast', NJ: 'Northeast',
  PA: 'Northeast', DE: 'Northeast', MD: 'Northeast', DC: 'Northeast',

  VA: 'Southeast', WV: 'Southeast', NC: 'Southeast', SC: 'Southeast',
  GA: 'Southeast', FL: 'Southeast', AL: 'Southeast', MS: 'Southeast',
  TN: 'Southeast', KY: 'Southeast', AR: 'Southeast', LA: 'Southeast',

  OH: 'Midwest', MI: 'Midwest', IN: 'Midwest', IL: 'Midwest',
  WI: 'Midwest', MN: 'Midwest', IA: 'Midwest', MO: 'Midwest',
  ND: 'Midwest', SD: 'Midwest', NE: 'Midwest', KS: 'Midwest',

  TX: 'West', OK: 'West', NM: 'West', CO: 'West', WY: 'West',
  MT: 'West', ID: 'West', UT: 'West', AZ: 'West', NV: 'West',
  CA: 'West', OR: 'West', WA: 'West', AK: 'West', HI: 'West',
}

export function stateToRegion(stateCode: string): string {
  return STATE_TO_REGION[stateCode.toUpperCase()] ?? 'West'
}

export async function geocodeZip(zip: string): Promise<{
  lat: number
  lng: number
  city: string
  state: string
  region: string
}> {
  // Validate format up front
  if (!/^\d{5}$/.test(zip)) {
    throw new Error(`Invalid zip code format: ${zip}`)
  }

  const key = process.env.GOOGLE_MAPS_API_KEY
  // Use components filter to restrict to US postal codes only
  const url = `https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:${zip}|country:US&key=${key}`
  const res = await fetch(url)
  const data = await res.json()

  if (data.status !== 'OK' || !data.results?.length) {
    throw new Error(`Zip code ${zip} not found in the US`)
  }

  const result = data.results[0]
  const { lat, lng } = result.geometry.location

  const components: Array<{ types: string[]; long_name: string; short_name: string }> =
    result.address_components

  // Confirm result is in the US
  const countryComp = components.find(c => c.types.includes('country'))
  if (countryComp?.short_name !== 'US') {
    throw new Error(`Zip code ${zip} is not a US zip code`)
  }

  const stateComp = components.find(c => c.types.includes('administrative_area_level_1'))
  const state = stateComp?.short_name ?? ''

  // Validate state is a known US state
  if (!state || !STATE_TO_REGION[state.toUpperCase()]) {
    throw new Error(`Zip code ${zip} did not resolve to a valid US state`)
  }

  // City: try multiple component types — some zips (e.g. Beverly Hills 90210)
  // return sublocality or neighborhood instead of locality
  const cityComp =
    components.find(c => c.types.includes('locality')) ??
    components.find(c => c.types.includes('sublocality_level_1')) ??
    components.find(c => c.types.includes('sublocality')) ??
    components.find(c => c.types.includes('neighborhood')) ??
    components.find(c => c.types.includes('postal_town')) ??
    components.find(c => c.types.includes('administrative_area_level_2'))

  const city = cityComp?.long_name ?? ''
  const region = stateToRegion(state)

  return { lat, lng, city, state, region }
}
