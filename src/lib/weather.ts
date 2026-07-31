export interface WeatherNow {
  temp: number
  apparentTemp: number
  code: number
  windSpeed: number
  windDir: number
  isDay: boolean
  precipProbability: number
  sunrise: string
  sunset: string
}

export interface WeatherHour {
  time: string
  temp: number
  code: number
  precipProbability: number
}

export interface WeatherDay {
  date: string
  max: number
  min: number
  code: number
  precipProbability: number
}

export interface WeatherBundle {
  now: WeatherNow
  hourly: WeatherHour[]
  daily: WeatherDay[]
}

// WMO weather codes -> short label
export const WEATHER_LABELS: Record<number, string> = {
  0: 'Clear',
  1: 'Mostly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime Fog',
  51: 'Light Drizzle',
  53: 'Drizzle',
  55: 'Dense Drizzle',
  61: 'Light Rain',
  63: 'Rain',
  65: 'Heavy Rain',
  71: 'Light Snow',
  73: 'Snow',
  75: 'Heavy Snow',
  80: 'Rain Showers',
  81: 'Rain Showers',
  82: 'Violent Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm w/ Hail',
  99: 'Severe Thunderstorm',
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherBundle> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,is_day,precipitation_probability',
    hourly: 'temperature_2m,weather_code,precipitation_probability',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,sunrise,sunset',
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'kn',
    timezone: 'auto',
    forecast_days: '7',
  })
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)
  if (!res.ok) throw new Error('Weather request failed')
  const data = await res.json()

  const now: WeatherNow = {
    temp: Math.round(data.current.temperature_2m),
    apparentTemp: Math.round(data.current.apparent_temperature),
    code: data.current.weather_code,
    windSpeed: Math.round(data.current.wind_speed_10m),
    windDir: data.current.wind_direction_10m,
    isDay: data.current.is_day === 1,
    precipProbability: data.current.precipitation_probability ?? 0,
    sunrise: data.daily.sunrise[0],
    sunset: data.daily.sunset[0],
  }

  const hourly: WeatherHour[] = data.hourly.time
    .map((t: string, i: number) => ({
      time: t,
      temp: Math.round(data.hourly.temperature_2m[i]),
      code: data.hourly.weather_code[i],
      precipProbability: data.hourly.precipitation_probability[i],
    }))
    .filter((h: WeatherHour) => new Date(h.time).getTime() >= Date.now() - 60 * 60 * 1000)
    .slice(0, 24)

  const daily: WeatherDay[] = data.daily.time.map((t: string, i: number) => ({
    date: t,
    max: Math.round(data.daily.temperature_2m_max[i]),
    min: Math.round(data.daily.temperature_2m_min[i]),
    code: data.daily.weather_code[i],
    precipProbability: data.daily.precipitation_probability_max[i],
  }))

  return { now, hourly, daily }
}
