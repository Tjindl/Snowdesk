import { scrapeWhistler } from './scrapers/whistler.js'
import { scrapeCypress } from './scrapers/cypress.js'
import { scrapeGrouse } from './scrapers/grouse.js'
import { scrapeSeymour } from './scrapers/seymour.js'
import { scrapeSunPeaks } from './scrapers/sunpeaks.js'
import { fetchAllForecasts } from './forecast.js'
import { scoreAndRank } from './score.js'
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
    console.log('🏔️  Snowdesk Scraper — starting...')
    const start = Date.now()

    // Phase 1: Scrape all resorts
    console.log('📡 Phase 1: Scraping resort data...')
    const [whistler, cypress, grouse, seymour, sunPeaks] = await Promise.all([
        scrapeWhistler(),
        scrapeCypress(),
        scrapeGrouse(),
        scrapeSeymour(),
        scrapeSunPeaks(),
    ])

    const resorts = [whistler, cypress, grouse, seymour, sunPeaks].filter(Boolean)
    console.log(`   ✓ ${resorts.length} resorts scraped`)

    // Phase 2: Fetch 72h weather forecasts
    console.log('🌤️  Phase 2: Fetching 72h forecasts from Open-Meteo...')
    const forecasts = await fetchAllForecasts(resorts)
    console.log(`   ✓ ${forecasts.size} forecasts received`)

    // Phase 3: Score and rank
    console.log('🧮 Phase 3: Computing Ski Quality Scores...')
    const ranked = scoreAndRank(resorts, forecasts)
    for (const r of ranked) {
        const badge = r.isBestToday ? ' 👑 BEST TODAY' : ''
        console.log(`   #${r.rank} ${r.name}: ${r.score}/100 (${r.grade})${badge}`)
    }

    // Write output
    const output = {
        resorts: ranked,
        lastUpdated: new Date().toISOString(),
        count: ranked.length,
    }

    const outDir = join(__dirname, '..', 'data')
    mkdirSync(outDir, { recursive: true })

    const outPath = join(outDir, 'resorts.json')
    writeFileSync(outPath, JSON.stringify(output, null, 2))

    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    console.log(`\n✅ Done in ${elapsed}s — ${ranked.length} resorts scored & written to data/resorts.json`)
}

main().catch(err => {
    console.error('❌ Scraper failed:', err)
    process.exit(1)
})
