import puppeteer from 'puppeteer'

const URL = 'https://www.bluemountain.ca/mountain/mountain-report'

export async function scrapeBlueMountain() {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  try {
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 })

    const data = await page.evaluate(() => {
      const getStatByLabel = (label) => {
        const stats = document.querySelectorAll('.StatsWidget_statItem__yJzYz')
        for (const stat of stats) {
          if (stat.innerText.includes(label)) {
            return stat.querySelector('.StatsWidget_statLabel__AMd6S')
              ?.innerText.split('\n')[0].trim() || null
          }
        }
        return null
      }

      const weatherText = document.querySelector('.WeatherCard_list__FfTEF')?.innerText || ''
      const allDepths = Array.from(document.querySelectorAll('.SnowfallBannerWidget_snowfallDepth__gLDou'))
  .map(el => el.innerText.trim())

      return {
  snow: {
    newSnow: allDepths[0] || null,
    snowfall24h: allDepths[1] || null,             // "2cm"
    snowfall48h: allDepths[2] || null,             // "3cm"  
    snowfall72h: allDepths[3] || null,             // "5cm"
    seasonTotal: allDepths[4] || null,             // "237cm"
    conditions: null,                              // not available on this page
  },
  lifts: { open: getStatByLabel('Open Lifts') },
  trails: { open: getStatByLabel('Open Trails') },
  isOpen: !!document.querySelector('.Hours_status__szatZ')?.innerText.includes('OPEN')
}
    })

    return {
      name: 'Blue Mountain',
      location: 'Collingwood, ON',
      lastUpdated: new Date().toISOString(),
      ...data
    }

  } catch (error) {
    console.error('Blue Mountain scraper failed:', error.message)
    return null
  } finally {
    await browser.close()
  }
}