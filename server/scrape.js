import { scrapeWhistler } from './scrapers/whistler.js'
import { scrapeCypress } from './scrapers/cypress.js'
import { scrapeGrouse } from './scrapers/grouse.js'
import { scrapeSeymour } from './scrapers/seymour.js'
import { scrapeSunPeaks } from './scrapers/sunpeaks.js'
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
    console.log('🏔️  Snowdesk Scraper — starting...')
    const start = Date.now()

    const [whistler, cypress, grouse, seymour, sunPeaks] = await Promise.all([
        scrapeWhistler(),
        scrapeCypress(),
        scrapeGrouse(),
        scrapeSeymour(),
        scrapeSunPeaks(),
    ])

    const resorts = [whistler, cypress, grouse, seymour, sunPeaks].filter(Boolean)
    const output = {
        resorts,
        lastUpdated: new Date().toISOString(),
        count: resorts.length,
    }

    const outDir = join(__dirname, '..', 'data')
    mkdirSync(outDir, { recursive: true })

    const outPath = join(outDir, 'resorts.json')
    writeFileSync(outPath, JSON.stringify(output, null, 2))

    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    console.log(`✅ Done in ${elapsed}s — ${resorts.length} resorts written to data/resorts.json`)
}

main().catch(err => {
    console.error('❌ Scraper failed:', err)
    process.exit(1)
})
