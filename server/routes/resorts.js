import express from 'express'
import { scrapeWhistler } from '../scrapers/whistler.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const whistler = await scrapeWhistler()
  res.json([whistler])
})

export default router