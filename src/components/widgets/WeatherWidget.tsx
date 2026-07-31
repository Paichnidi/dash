import { useEffect, useState } from 'react'
import { WidgetCard } from '../WidgetCard'
import { ExpandedModal } from '../ExpandedModal'
import { Skeleton } from '../Skeleton'
import { useSettings } from '../../lib/settings'
import { fetchWeather, WEATHER_LABELS, type WeatherBundle } from '../../lib/weather'
import { Sun, Cloud, CloudRain, CloudSnow, CloudFog, CloudLightning, Moon, Sunrise, Droplets, Wind } from 'lucide-react'

function WeatherIcon({ code, isDay = true, size = 22 }: { code: number; isDay?: boolean; size?: number }) {
  if (code === 0 || code === 1) return isDay ? <Sun size={size} /> : <Moon size={size} />
  if (code === 2 || code === 3) return <Cloud size={size} />
  if (code === 45 || code === 48) return <CloudFog size={size} />
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain size={size} />
  if ([71, 73, 75].includes(code)) return <CloudSnow size={size} />
  if ([95, 96, 99].includes(code)) return <CloudLightning size={size} />
  return <Cloud size={size} />
}

function hourLabel(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric' })
}

function dayLabel(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short' })
}

export function WeatherWidget({ dragHandleProps, isDragging }: { dragHandleProps?: any; isDragging?: boolean }) {
  const { settings } = useSettings()
  const [data, setData] = useState<WeatherBundle | null>(null)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchWeather(settings.homeLat, settings.homeLon)
      .then((d) => { if (!cancelled) setData(d) })
      .catch(() => { if (!cancelled) setError(true) })
    const t = setInterval(() => {
      fetchWeather(settings.homeLat, settings.homeLon).then((d) => !cancelled && setData(d)).catch(() => {})
    }, 15 * 60 * 1000)
    return () => { cancelled = true; clearInterval(t) }
  }, [settings.homeLat, settings.homeLon])

  return (
    <>
      <WidgetCard id="weather" label="Weather" tag={settings.homeLabel} onExpand={() => setOpen(true)} dragHandleProps={dragHandleProps} isDragging={isDragging}>
        {error && <div className="text-sm text-muted dark:text-muted-dark py-4">Weather unavailable</div>}
        {!error && !data && (
          <div className="space-y-2 py-1">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        )}
        {data && (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-3xl font-semibold tabular-nums">{data.now.temp}°</div>
              <div className="text-sm text-muted dark:text-muted-dark mt-0.5">{WEATHER_LABELS[data.now.code] ?? '—'}</div>
              <div className="font-mono text-xs text-muted dark:text-muted-dark mt-1.5">
                {Math.round(data.now.windDir)}° @ {data.now.windSpeed}kt
              </div>
            </div>
            <div style={{ color: 'var(--color-accent)' }}>
              <WeatherIcon code={data.now.code} isDay={data.now.isDay} size={30} />
            </div>
          </div>
        )}
      </WidgetCard>

      <ExpandedModal open={open} onClose={() => setOpen(false)} title={settings.homeLabel} tag="Weather">
        {data && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display text-5xl font-semibold tabular-nums">{data.now.temp}°</div>
                <div className="text-muted dark:text-muted-dark">
                  Feels like {data.now.apparentTemp}° · {WEATHER_LABELS[data.now.code]}
                </div>
              </div>
              <div style={{ color: 'var(--color-accent)' }}>
                <WeatherIcon code={data.now.code} isDay={data.now.isDay} size={44} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.03] px-3 py-2.5">
                <Wind size={14} className="text-muted dark:text-muted-dark mb-1" />
                <div>{Math.round(data.now.windDir)}° @ {data.now.windSpeed}kt</div>
              </div>
              <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.03] px-3 py-2.5">
                <Droplets size={14} className="text-muted dark:text-muted-dark mb-1" />
                <div>{data.now.precipProbability}% precip</div>
              </div>
              <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.03] px-3 py-2.5">
                <Sunrise size={14} className="text-muted dark:text-muted-dark mb-1" />
                <div>
                  {new Date(data.now.sunrise).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark mb-2">
                Next 24 hours
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                {data.hourly.map((h) => (
                  <div key={h.time} className="flex flex-col items-center gap-1.5 shrink-0 w-10">
                    <span className="text-xs text-muted dark:text-muted-dark">{hourLabel(h.time)}</span>
                    <WeatherIcon code={h.code} size={16} />
                    <span className="text-sm font-medium tabular-nums">{h.temp}°</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark mb-2">
                7-day forecast
              </div>
              <div className="space-y-1">
                {data.daily.map((d) => (
                  <div key={d.date} className="flex items-center justify-between py-1.5 border-b border-hairline dark:border-hairline-dark last:border-0">
                    <span className="text-sm w-10">{dayLabel(d.date)}</span>
                    <span style={{ color: 'var(--color-accent)' }}><WeatherIcon code={d.code} size={16} /></span>
                    <span className="text-xs text-muted dark:text-muted-dark w-14 text-right">{d.precipProbability}%</span>
                    <span className="text-sm tabular-nums w-16 text-right">
                      <span className="text-muted dark:text-muted-dark">{d.min}°</span> / {d.max}°
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </ExpandedModal>
    </>
  )
}
