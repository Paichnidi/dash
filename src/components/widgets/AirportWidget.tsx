import { useEffect, useState } from 'react'
import { WidgetCard } from '../WidgetCard'
import { ExpandedModal } from '../ExpandedModal'
import { Skeleton } from '../Skeleton'
import { useSettings } from '../../lib/settings'
import {
  fetchMetar,
  fetchTaf,
  windComponents,
  densityAltitudeFromMetar,
  FLIGHT_CATEGORY_COLOR,
  type Metar,
  type Taf
} from '../../lib/aviation'

import { AlertTriangle, Navigation } from 'lucide-react'

export function AirportWidget({ dragHandleProps, isDragging }: { dragHandleProps?: any; isDragging?: boolean }) {
  const { settings } = useSettings()
  const [metar, setMetar] = useState<Metar | null>(null)
  const [taf, setTaf] = useState<Taf | null>(null)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)
  const [runway, setRunway] = useState(360)

  useEffect(() => {
    let cancelled = false
    const load = () => {
      fetchMetar(settings.favoriteAirport).then((m) => !cancelled && setMetar(m)).catch(() => !cancelled && setError(true))
      fetchTaf(settings.favoriteAirport).then((t) => !cancelled && setTaf(t)).catch(() => {})
    }
    load()
    const t = setInterval(load, 10 * 60 * 1000)
    return () => { cancelled = true; clearInterval(t) }
  }, [settings.favoriteAirport])

  const catColor = metar ? FLIGHT_CATEGORY_COLOR[metar.fltCat] : 'var(--color-muted)'
  const isAttention = metar && metar.fltCat !== 'VFR' && metar.fltCat !== 'UNKNOWN'

  const wind = metar && typeof metar.wdir === 'number' && metar.wspd != null
    ? windComponents(runway, metar.wdir, metar.wspd)
    : null

  const da = metar ? densityAltitudeFromMetar(metar) : null

  return (
    <>
      <WidgetCard id="airport" label="Airport" tag={settings.favoriteAirport} onExpand={() => setOpen(true)} dragHandleProps={dragHandleProps} isDragging={isDragging}>
        {error && <div className="text-sm text-muted dark:text-muted-dark py-4">Airport data unavailable</div>}
        {!error && !metar && (
          <div className="space-y-2 py-1">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        )}
        {metar && (
          <div>
            <div className="flex items-center gap-2">
              {isAttention && <AlertTriangle size={14} style={{ color: catColor }} />}
              <span className="font-display text-xl font-semibold" style={{ color: catColor }}>
                {metar.fltCat}
              </span>
            </div>
            <div className="font-mono text-sm mt-1.5">
              {typeof metar.wdir === 'number' ? `${String(metar.wdir).padStart(3, '0')}°` : metar.wdir} @ {metar.wspd}kt
              {metar.wgst ? ` G${metar.wgst}` : ''}
            </div>
            <div className="text-xs text-muted dark:text-muted-dark mt-1">
              {metar.visib}SM · {metar.temp}°C
            </div>
          </div>
        )}
      </WidgetCard>

      <ExpandedModal open={open} onClose={() => setOpen(false)} title={settings.favoriteAirport} tag="Airport">
        {metar && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              {isAttention && <AlertTriangle size={16} style={{ color: catColor }} />}
              <span className="font-display text-2xl font-semibold" style={{ color: catColor }}>{metar.fltCat}</span>
            </div>

            <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.03] px-3.5 py-3 font-mono text-xs leading-relaxed break-words">
              {metar.rawOb}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">Wind</div>
                <div className="mt-0.5">{typeof metar.wdir === 'number' ? `${String(metar.wdir).padStart(3, '0')}°` : metar.wdir} @ {metar.wspd}kt{metar.wgst ? ` G${metar.wgst}` : ''}</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">Visibility</div>
                <div className="mt-0.5">{metar.visib}SM</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">Ceiling</div>
                <div className="mt-0.5">
                  {metar.clouds.find((c) => ['BKN', 'OVC'].includes(c.cover))
                    ? `${metar.clouds.find((c) => ['BKN', 'OVC'].includes(c.cover))?.base ?? '—'} ft`
                    : 'Unlimited'}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">Altimeter</div>
                <div className="mt-0.5">
                  {metar.altim ? (metar.altim / 33.8639).toFixed(2) : '—'} inHg
                </div>
              </div>
            </div>

            <div className="border-t border-hairline dark:border-hairline-dark pt-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Navigation size={13} className="text-muted dark:text-muted-dark" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">
                  Crosswind — runway heading
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={10}
                value={runway}
                onChange={(e) => setRunway(Number(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
              />
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="font-mono">RWY {String(Math.round(runway / 10)).padStart(2, '0')}</span>
                {wind && (
                  <span>
                    {wind.headwind >= 0 ? 'Headwind' : 'Tailwind'} {Math.abs(wind.headwind)}kt · Crosswind {wind.crosswind}kt {wind.crosswindDirection}
                  </span>
                )}
              </div>
            </div>

            {da && (
              <div className="border-t border-hairline dark:border-hairline-dark pt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">Pressure Alt</div>
                  <div className="mt-0.5 tabular-nums">{da.pressureAltitude.toLocaleString()} ft</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">Density Alt</div>
                  <div className="mt-0.5 tabular-nums">{da.densityAltitude.toLocaleString()} ft</div>
                </div>
              </div>
            )}

            {taf && (
              <div className="border-t border-hairline dark:border-hairline-dark pt-4">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark mb-2">TAF</div>
                <div className="font-mono text-xs leading-relaxed break-words text-muted dark:text-muted-dark">
                  {taf.rawTAF}
                </div>
              </div>
            )}

            <a
              href={`https://aviationweather.gov/data/notam/?ids=${settings.favoriteAirport}`}
              target="_blank"
              rel="noreferrer"
              className="block text-center text-sm font-medium rounded-xl py-2.5 border border-hairline dark:border-hairline-dark hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
            >
              View NOTAMs ↗
            </a>
          </div>
        )}
      </ExpandedModal>
    </>
  )
}
