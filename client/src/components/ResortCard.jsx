export default function ResortCard({ resort }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold">{resort.name}</h2>
          <p className="text-slate-400 text-sm">{resort.location}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${resort.isOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {resort.isOpen ? 'Open' : 'Closed'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        {resort.snow?.base && <SnowStat label="Base Depth" value={resort.snow.base} />}
        {resort.snow?.newSnow && <SnowStat label="New Snow" value={resort.snow.newSnow} />}
        {resort.snow?.snowfall24h && <SnowStat label="24h Snow" value={resort.snow.snowfall24h} />}
        {resort.snow?.snowfall48h && <SnowStat label="48h Snow" value={resort.snow.snowfall48h} />}
        {resort.snow?.snowfall7day && <SnowStat label="7 Day" value={resort.snow.snowfall7day} />}
        {resort.snow?.snowfall72h && <SnowStat label="72h Snow" value={resort.snow.snowfall72h} />}
        {resort.snow?.seasonTotal && <SnowStat label="Season" value={resort.snow.seasonTotal} />}
      </div>

      {(resort.lifts || resort.trails) && (
        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-700">
          {resort.lifts?.open && (
            <div className="flex items-center gap-2">
              <span className="text-blue-400 text-lg">🚡</span>
              <div>
                <p className="text-white font-semibold text-sm">{resort.lifts.open}</p>
                <p className="text-slate-400 text-xs">Lifts Open</p>
              </div>
            </div>
          )}
          {resort.trails?.open && (
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-lg">⛷️</span>
              <div>
                <p className="text-white font-semibold text-sm">{resort.trails.open}</p>
                <p className="text-slate-400 text-xs">Trails Open</p>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-slate-500 text-xs mt-4">
        Updated {new Date(resort.lastUpdated).toLocaleTimeString()}
      </p>
    </div>
  )
}

function SnowStat({ label, value }) {
  return (
    <div className="bg-slate-700/50 rounded-xl p-3 text-center">
      <p className="text-white font-bold text-lg">{value}</p>
      <p className="text-slate-400 text-xs mt-1">{label}</p>
    </div>
  )
}