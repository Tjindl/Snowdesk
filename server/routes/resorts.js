import express from 'express'
import { scrapeWhistler } from '../scrapers/whistler.js'
import { scrapeBlueMountain } from '../scrapers/bluemountain.js'
import cron from 'node-cron'

const router = express.Router()

let cache = {
  data: null,
  lastUpdated: null
}

async function refreshCache() {
  console.log('Refreshing resort data...')
  const [whistler, blueMountain] = await Promise.all([
    scrapeWhistler(),
    scrapeBlueMountain()
  ])
  cache.data = [whistler, blueMountain].filter(Boolean)
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