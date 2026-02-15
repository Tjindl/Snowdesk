import { useEffect, useState, useCallback } from 'react'
import ResortCard from '../components/ResortCard'
import Snowfall from '../components/Snowfall'

const SORT_OPTIONS = [
  { key: 'score', label: 'Best Score' },
  { key: 'snow', label: 'Fresh Snow' },
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Open First' },
]

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api/resorts'

export default function Home() {
  const [resorts, setResorts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('score')
  const [lastRefresh, setLastRefresh] = useState(null)

  const fetchData = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        // GitHub Pages returns { resorts: [...] }, Express returns [...]
        const list = Array.isArray(data) ? data : data.resorts || []
        setResorts(list)
        setLoading(false)
        setRefreshing(false)
        setError(false)
        setLastRefresh(new Date())
      })
      .catch(() => {
        setError(true)
        setLoading(false)
        setRefreshing(false)
      })
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = resorts.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.location?.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'score') {
      return (b.score ?? 0) - (a.score ?? 0)
    }
    if (sortBy === 'snow') {
      const aSnow = parseFloat(a.snow?.snowfall24h) || parseFloat(a.snow?.newSnow) || 0
      const bSnow = parseFloat(b.snow?.snowfall24h) || parseFloat(b.snow?.newSnow) || 0
      return bSnow - aSnow
    }
    if (sortBy === 'status') {
      return (b.isOpen ? 1 : 0) - (a.isOpen ? 1 : 0)
    }
    return (a.name || '').localeCompare(b.name || '')
  })

  // Featured = best scored resort (or first if no scores)
  const bestToday = resorts.find(r => r.isBestToday)
  const featured = bestToday || sorted[0]
  const rest = sorted.filter(r => r !== featured)
  const openCount = resorts.filter(r => r.isOpen).length

  const bestSnow = resorts.reduce((best, r) => {
    const val = parseFloat(r.snow?.snowfall24h) || parseFloat(r.snow?.newSnow) || 0
    return val > best.val ? { name: r.name, val } : best
  }, { name: '—', val: 0 })

  const topScore = bestToday ? { name: bestToday.name, score: bestToday.score, grade: bestToday.grade } : null

  return (
    <div className="app">
      {/* ── Scene ── */}
      <div className="bg-sky" />
      <div className="aurora" />
      <div className="stars" />
      <div className="noise" />

      {/* ── Snowfall (Canvas) ── */}
      <Snowfall />

      {/* ── Mountains ── */}
      <div className="mountains-container">
        <svg className="mountain-layer" style={{ height: '100%' }} viewBox="0 0 1600 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mtn1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.12" />
              <stop offset="40%" stopColor="#475569" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="snow1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path fill="url(#mtn1)" d="M-20,400 L-20,280 L40,260 L80,220 L110,235 L150,180 L175,195 L210,140 L235,155 L270,100 L295,85 L320,110 L350,130 L390,90 L420,105 L460,65 L485,50 L510,70 L540,95 L575,60 L610,45 L640,70 L680,105 L710,80 L745,55 L780,35 L800,50 L830,75 L870,40 L900,25 L925,45 L955,70 L990,50 L1020,30 L1050,55 L1080,85 L1120,60 L1155,40 L1190,65 L1220,90 L1260,55 L1290,75 L1330,110 L1370,85 L1400,120 L1440,150 L1490,130 L1530,160 L1600,140 L1620,400 Z" />
          <path fill="url(#snow1)" d="M270,100 L295,85 L320,110 L300,105 Z M460,65 L485,50 L510,70 L490,68 Z M610,45 L640,70 L625,60 Z M780,35 L800,50 L830,75 L870,40 L900,25 L925,45 L910,40 L880,35 L850,45 L820,60 L795,45 Z M1020,30 L1050,55 L1035,45 Z M1155,40 L1190,65 L1175,55 Z" />
        </svg>
        <svg className="mountain-layer" style={{ height: '70%' }} viewBox="0 0 1600 300" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mtn2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.15" />
              <stop offset="35%" stopColor="#334155" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="snow2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path fill="url(#mtn2)" d="M-20,300 L-20,220 L30,200 L70,170 L100,185 L140,145 L165,155 L200,115 L230,100 L255,120 L290,135 L325,100 L355,85 L385,110 L420,130 L460,95 L490,70 L515,55 L540,75 L570,100 L610,75 L645,55 L670,40 L700,60 L735,85 L770,60 L800,45 L835,65 L865,90 L900,70 L935,50 L960,65 L995,90 L1030,65 L1060,80 L1100,105 L1140,80 L1175,60 L1200,45 L1230,65 L1270,95 L1310,70 L1340,85 L1380,110 L1420,95 L1460,120 L1510,100 L1560,130 L1620,110 L1620,300 Z" />
          <path fill="url(#snow2)" d="M200,115 L230,100 L255,120 L240,115 Z M490,70 L515,55 L540,75 L520,68 Z M645,55 L670,40 L700,60 L680,52 Z M800,45 L835,65 L820,55 Z M935,50 L960,65 L950,58 Z M1175,60 L1200,45 L1230,65 L1210,55 Z" />
        </svg>
        <svg className="mountain-layer" style={{ height: '50%' }} viewBox="0 0 1600 220" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mtn3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#1e293b" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <path fill="url(#mtn3)" d="M-20,220 L-20,160 L25,148 L60,125 L85,135 L120,105 L150,95 L175,110 L210,85 L240,70 L265,82 L300,100 L340,80 L370,65 L400,50 L425,60 L460,80 L500,60 L530,45 L555,35 L580,50 L610,70 L650,55 L680,40 L710,55 L745,75 L780,55 L810,40 L845,55 L875,75 L910,60 L940,45 L975,60 L1010,80 L1050,60 L1080,50 L1115,65 L1150,85 L1190,65 L1220,55 L1260,70 L1300,90 L1340,75 L1380,85 L1420,100 L1460,85 L1500,95 L1560,80 L1620,100 L1620,220 Z" />
        </svg>
        <svg className="mountain-layer" style={{ height: '30%' }} viewBox="0 0 1600 130" preserveAspectRatio="none">
          <defs>
            <linearGradient id="trees" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path fill="url(#trees)" d="M-20,130 L-20,85 L5,82 L12,70 L18,80 L30,78 L38,62 L44,75 L55,72 L62,58 L68,70 L80,68 L88,54 L95,66 L105,63 L112,50 L118,62 L130,60 L138,48 L145,58 L155,55 L162,42 L168,54 L180,52 L188,40 L195,50 L205,48 L215,55 L225,52 L232,38 L238,50 L250,48 L260,55 L270,50 L278,36 L285,48 L295,45 L305,52 L315,48 L322,35 L330,47 L340,44 L350,50 L360,46 L368,34 L375,46 L385,42 L395,50 L405,46 L412,33 L420,45 L430,42 L440,48 L450,44 L458,32 L465,44 L475,40 L485,48 L495,44 L505,50 L515,45 L522,33 L530,44 L540,40 L550,48 L560,43 L568,30 L575,42 L585,40 L595,46 L605,42 L612,30 L620,42 L630,38 L640,46 L650,42 L658,28 L665,40 L675,38 L685,44 L695,40 L705,46 L715,42 L722,30 L730,42 L740,38 L750,45 L760,40 L768,28 L775,40 L785,36 L795,44 L805,40 L815,46 L825,42 L832,30 L840,42 L850,38 L860,45 L870,40 L878,28 L885,40 L895,36 L905,44 L915,40 L925,46 L935,42 L942,30 L950,42 L960,38 L970,45 L980,40 L988,28 L995,40 L1005,36 L1015,44 L1025,40 L1035,46 L1045,42 L1052,30 L1060,42 L1070,38 L1080,45 L1090,40 L1098,28 L1105,40 L1115,36 L1125,44 L1135,40 L1145,46 L1155,42 L1162,30 L1170,42 L1180,38 L1190,45 L1200,40 L1208,28 L1215,40 L1225,36 L1235,44 L1245,40 L1255,46 L1265,42 L1272,32 L1280,42 L1290,38 L1300,45 L1310,40 L1320,46 L1330,42 L1338,30 L1345,42 L1355,38 L1365,45 L1375,40 L1385,46 L1395,42 L1402,32 L1410,42 L1420,38 L1430,44 L1440,40 L1450,46 L1460,42 L1470,48 L1480,44 L1490,50 L1500,45 L1510,48 L1520,42 L1530,46 L1540,42 L1550,48 L1560,44 L1570,50 L1580,45 L1590,48 L1620,45 L1620,130 Z" />
        </svg>
        <svg className="mountain-layer" style={{ height: '12%' }} viewBox="0 0 1600 50" preserveAspectRatio="none">
          <defs>
            <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0" />
              <stop offset="100%" stopColor="#030712" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <rect fill="url(#fog)" width="1600" height="50" />
        </svg>
      </div>

      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <div className="logo-group">
            <div className="logo-mark">❄</div>
            <div>
              <h1 className="logo-text">SNOWDESK</h1>
              <p className="logo-sub">Live Snow Conditions · BC</p>
            </div>
          </div>
          <div className="header-right">
            <button
              className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
              onClick={() => fetchData(true)}
              disabled={refreshing}
              title="Refresh data"
            >
              ↻
            </button>
            <div className="live-badge">
              <span className="live-dot" />
              LIVE
            </div>
            <p className="header-date">
              {new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">❄️ Mountain Report</p>
          <h2 className="hero-title">
            Today's <span>Snow Conditions</span>
          </h2>
          <p className="hero-subtitle">
            Real-time snow data from British Columbia's top ski resorts, updated every 30 minutes from official resort reports.
          </p>

          {!loading && !error && resorts.length > 0 && (
            <div className="quick-stats">
              <div className="quick-stat">
                <div className="quick-stat-icon blue">⛷</div>
                <div>
                  <div className="quick-stat-value">{resorts.length}</div>
                  <div className="quick-stat-label">Resorts</div>
                </div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-icon green">✓</div>
                <div>
                  <div className="quick-stat-value">{openCount}</div>
                  <div className="quick-stat-label">Open Now</div>
                </div>
              </div>
              {bestSnow.val > 0 && (
                <div className="quick-stat">
                  <div className="quick-stat-icon amber">❄</div>
                  <div>
                    <div className="quick-stat-value">{bestSnow.name}</div>
                    <div className="quick-stat-label">Most Fresh Snow</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Main ── */}
      <main className="main">
        {loading ? (
          <div>
            <div className="loading-state">
              <div className="loading-orb">
                <div className="loading-glow" />
              </div>
              <p className="loading-text">Fetching conditions...</p>
              <p className="loading-subtext">Checking resort reports across BC</p>
            </div>
            <div className="skeleton-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="skeleton-line title" />
                  <div className="skeleton-line subtitle" />
                  <div className="skeleton-line stats" />
                  <div className="skeleton-line stats" />
                  <div className="skeleton-line ops" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h3 className="empty-title">Connection Error</h3>
            <p className="empty-text">Could not reach the Snowdesk API. Make sure the server is running.</p>
            <button className="retry-btn" onClick={() => { setLoading(true); setError(false); fetchData() }}>
              ↻ Try Again
            </button>
          </div>
        ) : resorts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">❄️</div>
            <h3 className="empty-title">No Data Yet</h3>
            <p className="empty-text">Resort data is still loading. Check back in a moment.</p>
          </div>
        ) : (
          <>
            {/* Controls Bar */}
            <div className="controls-bar">
              <div className="section-header">
                <span className="section-title">
                  <span className="section-dot" />
                  All Resorts
                </span>
                <span className="section-badge">{filtered.length} TRACKED</span>
              </div>
              <div className="controls-row">
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search resorts..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className="search-clear" onClick={() => setSearch('')}>×</button>
                  )}
                </div>
                <div className="sort-pills">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      className={`sort-pill ${sortBy === opt.key ? 'active' : ''}`}
                      onClick={() => setSortBy(opt.key)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {lastRefresh && (
                <p className="last-refresh">
                  Last refreshed: {lastRefresh.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            {featured && (
              <div className="featured-wrapper card-enter">
                <ResortCard resort={featured} featured={true} />
              </div>
            )}

            {rest.length > 0 && (
              <div className="cards-grid">
                {rest.map((resort, i) => (
                  <div key={resort.name || i} className="card-enter" style={{ animationDelay: `${(i + 1) * 0.08}s` }}>
                    <ResortCard resort={resort} />
                  </div>
                ))}
              </div>
            )}

            {filtered.length === 0 && search && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3 className="empty-title">No Results</h3>
                <p className="empty-text">No resorts match "{search}"</p>
              </div>
            )}

            {!loading && !error && (
              <div className="coming-soon-banner">
                <span className="coming-soon-icon">🏔️</span>
                <span className="coming-soon-text">More resorts coming soon — stay tuned!</span>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">SNOWDESK</div>
          <div className="footer-divider" />
          <p className="footer-meta">
            Data sourced from resort websites · Auto-refreshes every 30 minutes
          </p>
        </div>
      </footer>
    </div>
  )
}
