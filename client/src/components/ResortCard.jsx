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

  if (featured) {
    return (
      <div className="featured-card">
        <div className="featured-shimmer" />
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
      <div className="card-header">
        <div>
          <h3 className="card-name">{resort.name}</h3>
          <p className="resort-location">📍 {resort.location}</p>
        </div>
        <div className="status-badge" data-open={resort.isOpen}>
          <span className="status-dot" />
          {resort.isOpen ? 'OPEN' : 'CLOSED'}
        </div>
      </div>

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
