import puppeteer from 'puppeteer'

const URL = 'https://www.cypressmountain.com/mountain-report'

export async function scrapeCypress() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()

  try {
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 })

    const data = await page.evaluate(() => {
      const getSnowByLabel = (label) => {
        const items = document.querySelectorAll('li.border-brwf-accent-secondary')
        for (const item of items) {
          if (item.innerText.includes(label)) {
            const spans = item.querySelectorAll('span')
            return spans[spans.length - 1]?.innerText.trim() || null
          }
        }
        return null
      }

      const getStatNumber = (label) => {
        const headings = document.querySelectorAll('h3.h5')
        for (const h of headings) {
          if (h.innerText.toLowerCase().includes(label)) {
            const container = h.closest('div')
            const text = container?.innerText || ''
            const match = text.match(/(\d+)\s*\n*of\s*(\d+)/)
            return match ? `${match[1]} / ${match[2]}` : null
          }
        }
        return null
      }

      return {
        snow: {
          base: getSnowByLabel('Base Depth'),
          snowOvernight: getSnowByLabel('Snow Overnight'),
          snowfall24h: getSnowByLabel('Snow 24 Hrs.'),
          snowfall48h: getSnowByLabel('Snow 48 Hrs.'),
          snowfall7day: getSnowByLabel('Snow 7 Days'),
          seasonTotal: getSnowByLabel('Snow Season Total'),
        },
        lifts: {
          open: getStatNumber('lifts open'),
        },
        trails: {
          open: getStatNumber('trails open'),
        },
        isOpen: true
      }
    })

    return {
      name: 'Cypress Mountain',
      location: 'North Vancouver, BC',
      lastUpdated: new Date().toISOString(),
      ...data
    }

  } catch (error) {
    console.error('Cypress scraper failed:', error.message)
    return null
  } finally {
    await browser.close()
  }
}