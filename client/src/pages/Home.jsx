import { useEffect, useState } from 'react'
import ResortCard from '../components/ResortCard'

export default function Home() {
  const [resorts, setResorts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3002/api/resorts')
      .then(res => res.json())
      .then(data => {
        setResorts(data)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-700 px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">❄️ SnowDesk</h1>
        <p className="text-slate-400 text-sm mt-1">Live Canadian ski resort conditions</p>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-slate-400">Loading conditions...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resorts.map((resort, i) => (
              <ResortCard key={i} resort={resort} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}