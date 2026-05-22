'use client'

import { useEffect, useRef } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

const LIGHT_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#f1f5f9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f1f5f9' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#e2eaf5' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e2eed6' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e2eaf5' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dde6f5' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#c8d8ee' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#3774ba' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#e2eaf5' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#bfcfe8' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
]

interface Props {
  lat: number
  lng: number
  zip: string
}

export default function MapDisplay({ lat, lng, zip }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '', v: 'weekly' })

    importLibrary('maps').then(async () => {
      if (!mapRef.current) return

      const map = new google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 11,
        mapTypeId: 'roadmap',
        styles: LIGHT_MAP_STYLES,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
      })

      // Try to fetch the zip code boundary polygon from Nominatim (OpenStreetMap)
      let boundaryLoaded = false
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(zip)}&countrycodes=us&format=geojson&polygon_geojson=1`,
          { headers: { 'Accept-Language': 'en-US' } }
        )
        if (res.ok) {
          const geoJson = await res.json()
          if (geoJson.features && geoJson.features.length > 0) {
            map.data.addGeoJson(geoJson)
            map.data.setStyle({
              fillColor: '#3774BA',
              fillOpacity: 0.13,
              strokeColor: '#3774BA',
              strokeWeight: 2,
              strokeOpacity: 0.65,
            })

            // Fit the map to the boundary
            const bounds = new google.maps.LatLngBounds()
            map.data.forEach(feature => {
              feature.getGeometry()?.forEachLatLng(ll => bounds.extend(ll))
            })
            if (!bounds.isEmpty()) {
              map.fitBounds(bounds, 24) // 24px padding
              // Cap zoom so surrounding area is always visible
              google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
                if ((map.getZoom() ?? 0) > 12) map.setZoom(12)
              })
            }
            boundaryLoaded = true
          }
        }
      } catch {
        // Nominatim unavailable — fall through to circle fallback
      }

      // Fallback: draw a simple circle if the boundary wasn't found
      if (!boundaryLoaded) {
        new google.maps.Circle({
          center: { lat, lng },
          radius: 6500,
          fillColor: '#3774BA',
          fillOpacity: 0.13,
          strokeColor: '#3774BA',
          strokeWeight: 2,
          map,
        })
      }
    }).catch(console.error)
  }, [lat, lng, zip])

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%', background: '#f1f5f9' }}
    />
  )
}
