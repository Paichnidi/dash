export type FlightCategory = 'VFR' | 'MVFR' | 'IFR' | 'LIFR' | 'UNKNOWN'

export interface Metar {
  icaoId: string
  rawOb: string
  obsTime: string
  temp: number | null
  dewp: number | null
  wdir: number | string | null
  wspd: number | null
  wgst: number | null
  visib: string | number | null
  altim: number | null
  wxString: string | null
  clouds: { cover: string; base: number | null }[]
  fltCat: FlightCategory
  elevationM: number | null
}

export interface Taf {
  icaoId: string
  rawTAF: string
  issueTime: string
  validTimeFrom: number
  validTimeTo: number
  fcsts: {
    timeFrom: number
    timeTo: number
    fltCat?: FlightCategory
    wdir?: number | string
    wspd?: number
    wgst?: number
    visib?: string | number
    wxString?: string
    clouds?: { cover: string; base: number | null }[]
  }[]
}

export async function fetchMetar(icao: string): Promise<Metar | null> {
  const res = await fetch(
    `/.netlify/functions/aviation?type=metar&icao=${icao}`
  )

  if (!res.ok) throw new Error('METAR request failed')

  const data = await res.json()

  if (!Array.isArray(data) || data.length === 0) return null

  const m = data[0]

  return {
    icaoId: m.icaoId,
    rawOb: m.rawOb,
    obsTime: m.obsTime ? new Date(m.obsTime * 1000).toISOString() : '',
    temp: m.temp ?? null,
    dewp: m.dewp ?? null,
    wdir: m.wdir ?? null,
    wspd: m.wspd ?? null,
    wgst: m.wgst ?? null,
    visib: m.visib ?? null,
    altim: m.altim ?? null,
    wxString: m.wxString ?? null,
    clouds: (m.clouds ?? []).map((c: any) => ({
      cover: c.cover,
      base: c.base ?? null
    })),
    fltCat: (m.fltCat as FlightCategory) ?? 'UNKNOWN',
    elevationM: m.elev ?? null,
  }
}


export async function fetchTaf(icao: string): Promise<Taf | null> {
  const res = await fetch(
    `/.netlify/functions/aviation?type=taf&icao=${icao}`
  )
  if (!res.ok) throw new Error('TAF request failed')
  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) return null
  const t = data[0]
  return {
    icaoId: t.icaoId,
    rawTAF: t.rawTAF,
    issueTime: t.issueTime ? new Date(t.issueTime * 1000).toISOString() : '',
    validTimeFrom: t.validTimeFrom,
    validTimeTo: t.validTimeTo,
    fcsts: (t.fcsts ?? []).map((f: any) => ({
      timeFrom: f.timeFrom,
      timeTo: f.timeTo,
      fltCat: f.fltCat,
      wdir: f.wdir,
      wspd: f.wspd,
      wgst: f.wgst,
      visib: f.visib,
      wxString: f.wxString,
      clouds: (f.clouds ?? []).map((c: any) => ({ cover: c.cover, base: c.base ?? null })),
    })),
  }
}

/** Crosswind & headwind components given runway heading and wind direction/speed (knots) */
export function windComponents(runwayHeadingDeg: number, windDirDeg: number, windSpeedKt: number) {
  const angle = ((windDirDeg - runwayHeadingDeg + 360) % 360) * (Math.PI / 180)
  const headwind = Math.round(windSpeedKt * Math.cos(angle) * 10) / 10
  const crosswind = Math.round(Math.abs(windSpeedKt * Math.sin(angle)) * 10) / 10
  const crosswindDirection = Math.sin(angle) >= 0 ? 'right' : 'left'
  return { headwind, crosswind, crosswindDirection }
}

export function densityAltitude(
  elevationFt: number,
  altimeterInHg: number,
  oatC: number
) {
  const pressureAltitude = elevationFt + (29.92 - altimeterInHg) * 1000
  const isaTemp = 15 - (elevationFt / 1000) * 2
  const densityAlt = pressureAltitude + 120 * (oatC - isaTemp)

  return {
    pressureAltitude: Math.round(pressureAltitude),
    densityAltitude: Math.round(densityAlt)
  }
}

export function densityAltitudeFromMetar(metar: Metar) {
  const elevationFt = (metar.elevationM ?? 0) * 3.28084

  // AviationWeather API gives altim in hPa, convert to inHg
  const altimeterInHg = (metar.altim ?? 1013.25) / 33.8639

  const oatC = metar.temp ?? 15

  return densityAltitude(
    elevationFt,
    altimeterInHg,
    oatC
  )
}

export const FLIGHT_CATEGORY_COLOR: Record<FlightCategory, string> = {
  VFR: 'var(--color-vfr)',
  MVFR: 'var(--color-mvfr)',
  IFR: 'var(--color-ifr)',
  LIFR: 'var(--color-lifr)',
  UNKNOWN: 'var(--color-muted)',
}
