'use client'

import { useEffect, useRef } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import type { WeatherSignals } from '@/lib/weather/computeSignals'

const DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1e1e1e' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#111111' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#141414' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#050505' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#050505' }] },
]

interface Props {
  lat: number
  lng: number
  signals: WeatherSignals
}

export default function MapDisplay({ lat, lng, signals }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '', v: 'weekly' })

    importLibrary('maps').then(() => {
      if (!mapRef.current) return

      const map = new google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 9,
        mapTypeId: 'roadmap',
        styles: DARK_MAP_STYLES,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
      })

      const today = new Date()
      const dayScores = generateDayScores(signals)

      dayScores.forEach((dayScore, i) => {
        if (dayScore <= 25) return

        const date = new Date(today)
        date.setDate(date.getDate() + i)
        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

        const isGreen = dayScore >= 75
        const color = isGreen ? '#4ADE80' : '#FBBF24'

        const jitterLat = lat + (Math.sin(i * 2.3) * 0.08)
        const jitterLng = lng + (Math.cos(i * 1.7) * 0.12)

        const marker = new google.maps.Marker({
          position: { lat: jitterLat, lng: jitterLng },
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: color,
            fillOpacity: 0.9,
            strokeColor: color,
            strokeWeight: 2,
          },
        })

        const driver = getPrimaryDriver(signals, i)

        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="background:#1e1e1e;color:#fff;padding:12px 16px;border-radius:8px;font-family:monospace;min-width:180px;border:1px solid rgba(255,255,255,0.12)"><div style="font-size:13px;color:#a1a1a1;margin-bottom:4px">Day ${i + 1} — ${dayLabel}</div><div style="font-size:16px;font-weight:700;color:${color}">Score ${dayScore}</div><div style="font-size:12px;color:#a1a1a1;margin-top:4px">${driver}</div></div>`,
        })

        marker.addListener('click', () => infoWindow.open(map, marker))
      })
    }).catch(console.error)
  }, [lat, lng, signals])

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%', background: '#0a0a0a' }}
    />
  )
}

function generateDayScores(signals: WeatherSignals): number[] {
  return Array.from({ length: 14 }, (_, i) => {
    const isW1 = i < 7
    let score = 0

    if (isW1) {
      if (signals.daysAbove90W1 > 0) score += 20
      score += signals.heatStressDaysW1 * 5
      score += signals.stormDaysW1 * 8
      if (signals.postStormDaysW1 > 0 && i > 0) score += 10
      if (signals.week1TempAnomalyF >= 10) score += 15
      else if (signals.week1TempAnomalyF >= 5) score += 8
      if (signals.daysBelow32W1 > 0) score += 15
    } else {
      if (signals.daysAbove90W2 > 0) score += 18
      score += signals.heatStressDaysW2 * 5
      score += signals.stormDaysW2 * 8
      if (signals.week2TempAnomalyF >= 10) score += 15
      else if (signals.week2TempAnomalyF >= 5) score += 8
      if (signals.daysBelow32W2 > 0) score += 15
    }

    const variation = Math.round(Math.sin(i * 1.2) * 10)
    return Math.min(100, Math.max(0, score + variation))
  })
}

function getPrimaryDriver(signals: WeatherSignals, dayIndex: number): string {
  if (dayIndex < 7) {
    if (signals.hasFreezeRainW1) return 'Freeze Rain Event'
    if (signals.postStormDaysW1 > 0 && dayIndex > 0) return 'Post-Storm Reactive'
    if (signals.stormDaysW1 > 0) return 'Storm Activity'
    if (signals.heatStressDaysW1 > 0) return 'Heat Stress'
    if (signals.daysAbove95W1 > 0) return 'Extreme Heat'
    if (signals.daysAbove90W1 > 0) return 'Heat Surge'
    if (signals.daysBelow32W1 > 0) return 'Freeze Risk'
  } else {
    if (signals.hasFreezeRainW2) return 'Freeze Rain'
    if (signals.stormDaysW2 > 0) return 'Storm Activity'
    if (signals.daysAbove90W2 > 0) return 'Heat Surge'
    if (signals.daysBelow32W2 > 0) return 'Freeze Risk'
  }
  return 'Moderate Demand'
}
