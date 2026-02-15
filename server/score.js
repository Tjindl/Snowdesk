/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Snowdesk Ski Quality Score™ — Multi-Factor Scoring Engine  ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Computes a 0–100 composite quality score for each resort using
 * a weighted multi-factor model with sigmoid normalization, trend
 * analysis, and contextual boosters.
 *
 * FACTORS:
 *   1. Fresh Snow Index     (25%)  — recent snowfall recency-weighted
 *   2. Base Depth Score     (15%)  — logarithmic depth evaluation
 *   3. Forecast Momentum    (20%)  — predicted incoming snow + trend
 *   4. Temperature Quality  (15%)  — cold = dry powder, warm = slush
 *   5. Wind Penalty         (10%)  — high wind degrades experience
 *   6. Operations Score     (10%)  — lift/trail open percentage
 *   7. Powder Probability   ( 5%)  — forecast confidence in snowfall
 *
 * BONUSES:
 *   - "Powder Day" bonus:   +5 pts if 15+ cm in last 24h
 *   - "Storm Incoming":     +3 pts if forecast > 20cm in 48h
 *   - "Bluebird Day":       +2 pts if 0 wind + cold + sunny
 */

// ── Sigmoid normalization: maps any value to 0–1 with smooth curve ──
function sigmoid(x, midpoint, steepness) {
    return 1 / (1 + Math.exp(-steepness * (x - midpoint)))
}

// ── Clamp helper ──
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val))
}

// ── Parse "XX cm" strings into numbers ──
function parseCm(str) {
    if (!str) return 0
    const match = String(str).match(/([\d.]+)/)
    return match ? parseFloat(match[1]) : 0
}

// ── Parse "X / Y" fraction strings ──
function parseFraction(str) {
    if (!str) return null
    const match = String(str).match(/(\d+)\s*\/\s*(\d+)/)
    return match ? { open: parseInt(match[1]), total: parseInt(match[2]) } : null
}

/**
 * FACTOR 1: Fresh Snow Index (0–100)
 * Uses recency-weighted snowfall — recent snow matters more.
 * Sigmoid curve: 10cm/24h scores ~50, 25cm scores ~85, 40cm+ scores ~95+
 */
function freshSnowIndex(snow) {
    const s24 = parseCm(snow?.snowfall24h)
    const s48 = parseCm(snow?.snowfall48h)
    const s7d = parseCm(snow?.snowfall7day)
    const overnight = parseCm(snow?.snowOvernight || snow?.snowfall12h)

    // Recency weighting: overnight × 3, 24h × 2, 48h × 1, 7d × 0.3
    const weighted = (overnight * 3 + s24 * 2 + s48 * 1 + s7d * 0.3) / 6.3

    return sigmoid(weighted, 8, 0.2) * 100
}

/**
 * FACTOR 2: Base Depth Score (0–100)
 * Logarithmic — diminishing returns after ~150cm (good base is good enough)
 */
function baseDepthScore(snow) {
    const base = parseCm(snow?.base)
    if (base <= 0) return 0

    // log curve: 50cm ≈ 40pts, 100cm ≈ 60pts, 200cm ≈ 80pts, 300cm+ ≈ 90+
    return clamp(Math.log(base / 10 + 1) * 28, 0, 100)
}

/**
 * FACTOR 3: Forecast Momentum (0–100)
 * Evaluates incoming snow + trend direction.
 * Rising forecast = momentum boost, declining = penalty.
 */
function forecastMomentum(forecast) {
    if (!forecast) return 30 // neutral if no forecast

    const f24 = forecast.snowfall24h || 0
    const f48 = forecast.snowfall48h || 0
    const f72 = forecast.snowfall72h || 0

    // Base score from predicted 48h snowfall
    const baseScore = sigmoid(f48, 10, 0.15) * 70

    // Trend momentum: is snow accelerating or decelerating?
    // Compare last 24h window to first 24h window
    const first24 = f24
    const last24 = f72 - f48
    const trend = first24 > 0 ? (first24 - last24) / first24 : 0

    // Trend boost: +30 if ramping up, -10 if declining
    const trendBonus = trend > 0 ? trend * 30 : trend * 10

    return clamp(baseScore + trendBonus, 0, 100)
}

/**
 * FACTOR 4: Temperature Quality (0–100)
 * Optimal skiing: -5°C to -10°C (dry powder).
 * Too warm (>2°C) = slushy. Extremely cold (<-25°C) = uncomfortable.
 */
function temperatureQuality(forecast) {
    if (!forecast?.temperature) return 50

    const temp = forecast.temperature.avg

    // Gaussian-like curve centered at -7°C
    const optimal = -7
    const deviation = Math.abs(temp - optimal)

    if (temp > 2) {
        // Above freezing penalty — slush risk
        return clamp(40 - (temp - 2) * 12, 0, 40)
    }
    if (temp < -25) {
        // Extreme cold penalty
        return clamp(60 + (temp + 25) * 3, 20, 60)
    }

    // Bell curve around optimal
    return clamp(100 - deviation * deviation * 0.8, 30, 100)
}

/**
 * FACTOR 5: Wind Penalty (100 = calm, 0 = dangerously windy)
 * Inverted — less wind = higher score
 */
function windScore(forecast) {
    if (!forecast?.wind) return 70

    const avg = forecast.wind.avg
    const max = forecast.wind.max

    // Blend average and max wind (gust matters)
    const effective = avg * 0.6 + max * 0.4

    // 0 km/h = 100, 20 km/h = 70, 40 km/h = 30, 60+ km/h ≈ 0
    return clamp(100 - effective * 1.7, 0, 100)
}

/**
 * FACTOR 6: Operations Score (0–100)
 * What % of lifts and trails are open
 */
function operationsScore(resort) {
    let score = 0
    let factors = 0

    // Open/closed status
    if (resort.isOpen) {
        score += 50
        factors += 1
    }

    // Lift percentage
    const lifts = parseFraction(resort.lifts?.open)
    if (lifts && lifts.total > 0) {
        score += (lifts.open / lifts.total) * 100
        factors += 1
    }

    // Trail percentage
    const trails = parseFraction(resort.trails?.open)
    if (trails && trails.total > 0) {
        score += (trails.open / trails.total) * 100
        factors += 1
    }

    return factors > 0 ? score / factors : (resort.isOpen ? 60 : 0)
}

/**
 * FACTOR 7: Powder Probability (0–100)
 * Combines precipitation probability with sub-zero temps
 */
function powderProbability(forecast) {
    if (!forecast) return 30

    const precipProb = forecast.precipProbability || 0
    const temp = forecast.temperature?.avg ?? 0

    // Snow only falls when it's cold enough
    const snowChance = temp < 0 ? precipProb : precipProb * Math.max(0, 1 - temp / 5)

    return clamp(snowChance, 0, 100)
}

// ═══════════════════════════════════════════════════════════════
//  MAIN SCORING FUNCTION
// ═══════════════════════════════════════════════════════════════

/**
 * Compute the Ski Quality Score for a single resort.
 * @param {object} resort   — scraped resort data
 * @param {object} forecast — 72h forecast from Open-Meteo
 * @returns {object} { score, grade, factors, bonuses, trend }
 */
export function computeScore(resort, forecast) {
    // ── Calculate individual factors ──
    const factors = {
        freshSnow: { value: freshSnowIndex(resort.snow), weight: 0.25 },
        baseDepth: { value: baseDepthScore(resort.snow), weight: 0.15 },
        forecastMomentum: { value: forecastMomentum(forecast), weight: 0.20 },
        temperature: { value: temperatureQuality(forecast), weight: 0.15 },
        wind: { value: windScore(forecast), weight: 0.10 },
        operations: { value: operationsScore(resort), weight: 0.10 },
        powderProb: { value: powderProbability(forecast), weight: 0.05 },
    }

    // ── Weighted composite ──
    let raw = 0
    for (const f of Object.values(factors)) {
        raw += f.value * f.weight
    }

    // ── Contextual bonuses ──
    const bonuses = []
    const s24 = parseCm(resort.snow?.snowfall24h)
    const overnight = parseCm(resort.snow?.snowOvernight || resort.snow?.snowfall12h)

    if (s24 >= 15 || overnight >= 10) {
        bonuses.push({ label: 'Powder Day', points: 5, icon: '🎿' })
        raw += 5
    }

    if (forecast && forecast.snowfall48h >= 20) {
        bonuses.push({ label: 'Storm Incoming', points: 3, icon: '🌨️' })
        raw += 3
    }

    if (forecast && forecast.wind?.avg < 5 &&
        forecast.temperature?.avg < -3 &&
        forecast.snowfall24h < 1) {
        bonuses.push({ label: 'Bluebird Day', points: 2, icon: '☀️' })
        raw += 2
    }

    const score = Math.round(clamp(raw, 0, 100))

    // ── Grade label ──
    const grade = score >= 85 ? 'Epic'
        : score >= 70 ? 'Great'
            : score >= 55 ? 'Good'
                : score >= 40 ? 'Fair'
                    : 'Poor'

    // ── Trend indicator ──
    let trend = 'steady'
    if (forecast) {
        if (forecast.snowfall24h >= 5) trend = 'rising'
        else if (forecast.snowfall24h >= 2) trend = 'steady'
        else if (parseCm(resort.snow?.snowfall24h) > 5 && forecast.snowfall24h < 2) trend = 'falling'
    }

    // Round factor values for output
    const factorSummary = {}
    for (const [key, f] of Object.entries(factors)) {
        factorSummary[key] = Math.round(f.value)
    }

    return {
        score,
        grade,
        trend,
        factors: factorSummary,
        bonuses,
    }
}

/**
 * Score and rank all resorts.
 * @param {Array} resorts   — array of resort objects
 * @param {Map}   forecasts — Map<resortName, forecastData>
 * @returns {Array} resorts sorted by score, with score/rank/isBestToday attached
 */
export function scoreAndRank(resorts, forecasts) {
    // Compute scores
    const scored = resorts.map(resort => {
        const forecast = forecasts.get(resort.name) || null
        const result = computeScore(resort, forecast)

        return {
            ...resort,
            forecast,
            score: result.score,
            grade: result.grade,
            trend: result.trend,
            scoreMeta: {
                factors: result.factors,
                bonuses: result.bonuses,
            },
        }
    })

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score)

    // Assign ranks
    scored.forEach((resort, i) => {
        resort.rank = i + 1
        resort.isBestToday = i === 0
    })

    return scored
}
