export default function ResortCard({ resort, featured = false }) {
  const snowStats = [
    { label: 'Base', value: resort.snow?.base, icon: '📏' },
    { label: 'Overnight', value: resort.snow?.snowOvernight, icon: '🌙' },
    { label: '24h', value: resort.snow?.snowfall24h, icon: '⏱' },
    { label: '48h', value: resort.snow?.snowfall48h, icon: '📊' },
    { label: '7 Day', value: resort.snow?.snowfall7day, icon: '📅' },
    { label: 'New Snow', value: resort.snow?.newSnow, icon: '✨' },
    { label: 'Season', value: resort.snow?.seasonTotal, icon: '🏔' },
  ].filter(s => s.value)

  const updatedTime = new Date(resort.lastUpdated).toLocaleTimeString('en-CA', {
    hour: '2-digit', minute: '2-digit'
  })

  const updatedDate = new Date(resort.lastUpdated).toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric'
  })

  const conditions = resort.snow?.conditions

  // ── Score & Forecast data ──
  const score = resort.score ?? null
  const grade = resort.grade ?? null
  const trend = resort.trend ?? null
  const forecast = resort.forecast ?? null
  const rank = resort.rank ?? null
  const isBestToday = resort.isBestToday ?? false
  const bonuses = resort.scoreMeta?.bonuses ?? []

  const trendIcon = trend === 'rising' ? '↑' : trend === 'falling' ? '↓' : '→'
  const trendClass = trend === 'rising' ? 'trend-up' : trend === 'falling' ? 'trend-down' : 'trend-steady'

  // Score color based on value
  const scoreColor = score >= 80 ? '#4ade80'
    : score >= 60 ? '#facc15'
      : score >= 40 ? '#fb923c'
        : '#f87171'

  // SVG circle calculations for score gauge
  const circumference = 2 * Math.PI * 28
  const offset = score !== null ? circumference - (score / 100) * circumference : circumference

  // ── Score Badge Component ──
  const ScoreBadge = ({ size = 'normal' }) => {
    if (score === null) return null
    const r = size === 'large' ? 32 : 28
    const circ = 2 * Math.PI * r
    const off = circ - (score / 100) * circ
    const dim = size === 'large' ? 80 : 68

    return (
      <div className={`score-gauge ${size}`}>
        <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
          <circle
            cx={dim / 2} cy={dim / 2} r={r}
            fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"
          />
          <circle
            cx={dim / 2} cy={dim / 2} r={r}
            fill="none" stroke={scoreColor} strokeWidth="4"
            strokeDasharray={circ} strokeDashoffset={off}
            strokeLinecap="round"
            transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
            className="score-ring"
          />
        </svg>
        <div className="score-value">
          <span className="score-number" style={{ color: scoreColor }}>{score}</span>
          <span className="score-label">{grade}</span>
        </div>
      </div>
    )
  }

  // ── Forecast Strip Component ──
  const ForecastStrip = () => {
    if (!forecast) return null
    return (
      <div className="forecast-strip">
        <div className="forecast-title">
          <span className="forecast-title-icon">🌨️</span>
          <span>FORECAST</span>
          <span className={`trend-badge ${trendClass}`}>{trendIcon}</span>
        </div>
        <div className="forecast-chips">
          <div className="forecast-chip">
            <span className="forecast-chip-value">{forecast.snowfall24h}cm</span>
            <span className="forecast-chip-label">24h</span>
          </div>
          <div className="forecast-chip">
            <span className="forecast-chip-value">{forecast.snowfall48h}cm</span>
            <span className="forecast-chip-label">48h</span>
          </div>
          <div className="forecast-chip">
            <span className="forecast-chip-value">{forecast.snowfall72h}cm</span>
            <span className="forecast-chip-label">72h</span>
          </div>
          <div className="forecast-chip temp">
            <span className="forecast-chip-value">{forecast.temperature.avg}°</span>
            <span className="forecast-chip-label">Temp</span>
          </div>
        </div>
        {forecast.peakWindow && forecast.snowfall48h > 2 && (
          <div className="peak-window">
            ⚡ Peak snow: {forecast.peakWindow.label}
          </div>
        )}
      </div>
    )
  }

  if (featured) {
    return (
      <div className="featured-card">
        <div className="featured-shimmer" />

        {isBestToday && (
          <div className="best-today-banner">
            <span className="best-today-icon">👑</span>
            <span>BEST MOUNTAIN TODAY</span>
          </div>
        )}

        {rank && <div className="rank-badge">#{rank}</div>}

        <div className="featured-header">
          <div>
            <span className="featured-tag">
              <span className="featured-tag-dot" />
              FEATURED RESORT
            </span>
            <h2 className="featured-name">{resort.name}</h2>
            <p className="resort-location">📍 {resort.location}</p>
          </div>
          <div className="featured-right">
            <ScoreBadge size="large" />
            <div className="status-badge" data-open={resort.isOpen}>
              <span className="status-dot" />
              {resort.isOpen ? 'OPEN' : 'CLOSED'}
            </div>
            {conditions && (
              <div className="conditions-tag" data-condition={conditions.toLowerCase().includes('powder') ? 'powder' : conditions.toLowerCase().includes('packed') ? 'packed' : 'default'}>
                {conditions}
              </div>
            )}
          </div>
        </div>

        {bonuses.length > 0 && (
          <div className="bonus-row">
            {bonuses.map(b => (
              <span key={b.label} className="bonus-tag">
                {b.icon} {b.label} <span className="bonus-pts">+{b.points}</span>
              </span>
            ))}
          </div>
        )}

        {snowStats.length > 0 && (
          <div className="snow-stats-grid featured">
            {snowStats.map(({ label, value, icon }, idx) => (
              <div key={label} className="snow-chip featured" style={{ animationDelay: `${idx * 0.06}s` }}>
                <span className="snow-chip-icon">{icon}</span>
                <span className="snow-chip-value">{value}</span>
                <span className="snow-chip-label">{label}</span>
              </div>
            ))}
          </div>
        )}

        <ForecastStrip />

        {(resort.lifts?.open || resort.trails?.open) && (
          <div className="ops-row">
            {resort.lifts?.open && (
              <div className="ops-item">
                <span className="ops-icon">🚡</span>
                <div className="ops-data">
                  <span className="ops-value">{resort.lifts.open}</span>
                  <span className="ops-label">LIFTS</span>
                </div>
              </div>
            )}
            {resort.trails?.open && (
              <div className="ops-item">
                <span className="ops-icon">⛷</span>
                <div className="ops-data">
                  <span className="ops-value">{resort.trails.open}</span>
                  <span className="ops-label">TRAILS</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="card-footer-row">
          <p className="updated-time">🕐 {updatedDate} · {updatedTime}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="resort-card">
      {rank && <div className="rank-badge compact">#{rank}</div>}

      <div className="card-header">
        <div>
          <h3 className="card-name">{resort.name}</h3>
          <p className="resort-location">📍 {resort.location}</p>
        </div>
        <div className="card-header-right">
          <ScoreBadge />
          <div className="status-badge" data-open={resort.isOpen}>
            <span className="status-dot" />
            {resort.isOpen ? 'OPEN' : 'CLOSED'}
          </div>
        </div>
      </div>

      {bonuses.length > 0 && (
        <div className="bonus-row">
          {bonuses.map(b => (
            <span key={b.label} className="bonus-tag">
              {b.icon} {b.label}
            </span>
          ))}
        </div>
      )}

      {conditions && (
        <div className="conditions-tag" data-condition={conditions.toLowerCase().includes('powder') ? 'powder' : conditions.toLowerCase().includes('packed') ? 'packed' : 'default'}>
          {conditions}
        </div>
      )}

      {snowStats.length > 0 && (
        <div className="snow-stats-grid">
          {snowStats.map(({ label, value, icon }, idx) => (
            <div key={label} className="snow-chip" style={{ animationDelay: `${idx * 0.05}s` }}>
              <span className="snow-chip-icon">{icon}</span>
              <span className="snow-chip-value">{value}</span>
              <span className="snow-chip-label">{label}</span>
            </div>
          ))}
        </div>
      )}

      <ForecastStrip />

      {(resort.lifts?.open || resort.trails?.open) && (
        <div className="ops-row">
          {resort.lifts?.open && (
            <div className="ops-item">
              <span className="ops-icon">🚡</span>
              <div className="ops-data">
                <span className="ops-value">{resort.lifts.open}</span>
                <span className="ops-label">LIFTS</span>
              </div>
            </div>
          )}
          {resort.trails?.open && (
            <div className="ops-item">
              <span className="ops-icon">⛷</span>
              <div className="ops-data">
                <span className="ops-value">{resort.trails.open}</span>
                <span className="ops-label">TRAILS</span>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="updated-time">🕐 {updatedDate} · {updatedTime}</p>
    </div>
  )
}
