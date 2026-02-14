import puppeteer from 'puppeteer'

const WHISTLER_URL = 'https://www.whistlerblackcomb.com/the-mountain/mountain-conditions/snow-and-weather-report.aspx'

export async function scrapeWhistler() {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  try {
    await page.goto(WHISTLER_URL, { waitUntil: 'networkidle2', timeout: 30000 })

    const data = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector)
        return el ? el.innerText.trim() : null
      }

      const getMetric = (label) => {
        const metrics = document.querySelectorAll('.snow_report__metrics__metric')
        for (const metric of metrics) {
          if (metric.innerText.includes(label)) {
            return metric.querySelector('.snow_report__metrics__measurement')?.innerText.trim() || null
          }
        }
        return null
      }

      return {
        snow: {
          base: getMetric('BASE'),
          snowfall12h: getMetric('12 HOUR'),
          snowfall24h: getMetric('24 HOUR'),
          snowfall48h: getMetric('48 HOUR'),
          snowfall7day: getMetric('7 DAY'),
          seasonTotal: getMetric('CURRENT'),
        }
      }
    })

    return {
      name: 'Whistler Blackcomb',
      location: 'Whistler, BC',
      lastUpdated: new Date().toISOString(),
      ...data,
      isOpen: true
    }

  } catch (error) {
    console.error('Whistler scraper failed:', error.message)
    return null
  } finally {
    await browser.close()
  }
}