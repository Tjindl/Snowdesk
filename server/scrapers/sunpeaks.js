import puppeteer from 'puppeteer'

const URL = 'https://www.sunpeaksresort.com/ski-ride/weather-conditions-cams/weather-snow-report'

export async function scrapeSunPeaks() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()

  try {
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 })

    const data = await page.evaluate(() => {
      const getSnowByLabel = (label) => {
        const items = document.querySelectorAll('ul.list-snow li')
        for (const item of items) {
          if (item.innerText.toUpperCase().includes(label)) {
            return item.querySelector('.inner')?.innerText.trim().replace('\n', '') || null
          }
        }
        return null
      }

      const getBaseByLabel = (label) => {
        const items = document.querySelectorAll('ul.list-snow.snow-base li')
        for (const item of items) {
          if (item.innerText.toUpperCase().includes(label)) {
            return item.querySelector('.inner')?.innerText.trim().replace('\n', '') || null
          }
        }
        return null
      }

      return {
        snow: {
          base: getBaseByLabel('MID MOUNTAIN'),
          summit: getBaseByLabel('ALPINE'),
          newSnow: getSnowByLabel('NEW SNOW'),
          snowfall24h: getSnowByLabel('24 HR'),
          snowfall48h: getSnowByLabel('48 HR'),
          snowfall7day: getSnowByLabel('7 DAYS'),
        },
        isOpen: true
      }
    })

    return {
      name: 'Sun Peaks',
      location: 'Sun Peaks, BC',
      lastUpdated: new Date().toISOString(),
      ...data
    }

  } catch (error) {
    console.error('Sun Peaks scraper failed:', error.message)
    return null
  } finally {
    await browser.close()
  }
}