/**
 * Snowdesk Forecast Module
 * Fetches 72-hour weather forecasts from Open-Meteo (free, no API key)
 * for all BC ski resorts.
 */

// Resort coordinates (summit/base mid-point elevations)
const RESORT_COORDS = {
    'Whistler Blackcomb': { lat: 50.1163, lon: -122.9574 },
    'Cypress Mountain': { lat: 49.3965, lon: -123.2046 },
    'Grouse Mountain': { lat: 49.3805, lon: -123.0826 },
    'Mt. Seymour': { lat: 49.3688, lon: -123.0139 },
    'Sun Peaks': { lat: 50.8839, lon: -119.8863 },
    'Blue Mountain': { lat: 44.5015, lon: -80.3161 },
}

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast'

/**
 * Fetch 72h forecast for a single resort
 */
async function fetchForecast(name, { lat, lon }) {
    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        hourly: 'snowfall,temperature_2m,wind_speed_10m,precipitation_probability,weathercode',
        forecast_days: 3,
        timezone: 'America/Vancouver',
    })

    const res = await fetch(`${OPEN_METEO_BASE}?${params}`)
    if (!res.ok) throw new Error(`Open-Meteo returned ${res.status} for ${name}`)

    const json = await res.json()
    const { snowfall, temperature_2m, wind_speed_10m, precipitation_probability } = json.hourly

    // ── Aggregate snowfall into 24h / 48h / 72h buckets ──
    const snow24h = snowfall.slice(0, 24).reduce((a, b) => a + b, 0)
    const snow48h = snowfall.slice(0, 48).reduce((a, b) => a + b, 0)
    const snow72h = snowfall.reduce((a, b) => a + b, 0)

    // ── Hourly snowfall for chart data (next 24h) ──
    const hourlySnow = snowfall.slice(0, 24).map((cm, i) => ({
        hour: i,
        cm: Math.round(cm * 100) / 100,
    }))

    // ── Temperature stats ──
    const temps24h = temperature_2m.slice(0, 24)
    const tempAvg = temps24h.reduce((a, b) => a + b, 0) / temps24h.length
    const tempMin = Math.min(...temps24h)
    const tempMax = Math.max(...temps24h)

    // ── Wind stats ──
    const winds24h = wind_speed_10m.slice(0, 24)
    const windAvg = winds24h.reduce((a, b) => a + b, 0) / winds24h.length
    const windMax = Math.max(...winds24h)

    // ── Precipitation probability (for confidence indicator) ──
    const precipProbs24h = precipitation_probability.slice(0, 24)
    const precipProbAvg = precipProbs24h.reduce((a, b) => a + b, 0) / precipProbs24h.length

    // ── Snow intensity windows (find peak snowfall periods) ──
    const peakHour = snowfall.indexOf(Math.max(...snowfall.slice(0, 48)))
    const peakWindow = peakHour >= 0 ? {
        startsIn: peakHour,
        label: peakHour < 6 ? 'Next few hours' :
            peakHour < 12 ? 'This morning' :
                peakHour < 18 ? 'This afternoon' :
                    peakHour < 24 ? 'Tonight' :
                        peakHour < 36 ? 'Tomorrow' : 'Day after tomorrow',
    } : null

    return {
        snowfall24h: Math.round(snow24h * 10) / 10,
        snowfall48h: Math.round(snow48h * 10) / 10,
        snowfall72h: Math.round(snow72h * 10) / 10,
        hourlySnow,
        temperature: {
            avg: Math.round(tempAvg * 10) / 10,
            min: Math.round(tempMin * 10) / 10,
            max: Math.round(tempMax * 10) / 10,
        },
        wind: {
            avg: Math.round(windAvg * 10) / 10,
            max: Math.round(windMax * 10) / 10,
        },
        precipProbability: Math.round(precipProbAvg),
        peakWindow,
    }
}

/**
 * Fetch forecasts for all resorts in parallel
 * @param {Array} resorts - Array of resort objects with `name` property
 * @returns {Map<string, object>} Map of resort name → forecast data
 */
export async function fetchAllForecasts(resorts) {
    const forecasts = new Map()

    const results = await Promise.allSettled(
        resorts.map(async (resort) => {
            const coords = RESORT_COORDS[resort.name]
            if (!coords) {
                console.warn(`⚠️  No coordinates for "${resort.name}", skipping forecast`)
                return { name: resort.name, forecast: null }
            }
            const forecast = await fetchForecast(resort.name, coords)
            return { name: resort.name, forecast }
        })
    )

    for (const result of results) {
        if (result.status === 'fulfilled' && result.value.forecast) {
            forecasts.set(result.value.name, result.value.forecast)
        } else if (result.status === 'rejected') {
            console.error(`❌ Forecast failed:`, result.reason?.message)
        }
    }

    return forecasts
}
