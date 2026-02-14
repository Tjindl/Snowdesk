import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import resortsRouter from './routes/resorts.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/resorts', resortsRouter)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`SnowDesk server running on port ${PORT}`)
})
import { scrapeBlueMountain } from './scrapers/bluemountain.js'
scrapeBlueMountain()