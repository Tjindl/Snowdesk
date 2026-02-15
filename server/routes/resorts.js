import express from 'express'
import cron from 'node-cron'
import { scrapeWhistler } from '../scrapers/whistler.js'
import { scrapeCypress } from '../scrapers/cypress.js'
import { scrapeGrouse } from '../scrapers/grouse.js'
import { scrapeSeymour } from '../scrapers/seymour.js'
import { scrapeSunPeaks } from '../scrapers/sunpeaks.js'
const router = express.Router()

let cache = {
  data: null,
  lastUpdated: null
}

async function refreshCache() {
  console.log('Refreshing resort data...')
  const [whistler, cypress, grouse, seymour, sunPeaks] = await Promise.all([
  scrapeWhistler(),
  scrapeCypress(),
  scrapeGrouse(),
  scrapeSeymour(),
  scrapeSunPeaks()
])
cache.data = [whistler, cypress, grouse, seymour, sunPeaks].filter(Boolean)
  cache.lastUpdated = new Date().toISOString()
  console.log('Cache updated at', cache.lastUpdated)
}

refreshCache()
cron.schedule('*/30 * * * *', refreshCache)

router.get('/', (req, res) => {
  if (!cache.data) {
    return res.status(503).json({ error: 'Data not ready yet, try again in a moment' })
  }
  res.json(cache.data)
})

export default router