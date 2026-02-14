import express from 'express'
import { scrapeWhistler } from '../scrapers/whistler.js'
import cron from 'node-cron'

const router = express.Router()

// In-memory cache
let cache = {
  data: null,
  lastUpdated: null
}

// Scrape all resorts and update cache
async function refreshCache() {
  console.log('Refreshing resort data...')
  const whistler = await scrapeWhistler()
  cache.data = [whistler]
  cache.lastUpdated = new Date().toISOString()
  console.log('Cache updated at', cache.lastUpdated)
}

// Run once on startup
refreshCache()

// Then refresh every 30 minutes
cron.schedule('*/30 * * * *', refreshCache)

router.get('/', (req, res) => {
  if (!cache.data) {
    return res.status(503).json({ error: 'Data not ready yet, try again in a moment' })
  }
  res.json(cache.data)
})

export default router