import puppeteer from 'puppeteer'

const URL = 'https://mtseymour.ca/the-mountain/todays-conditions-hours'

export async function scrapeSeymour() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()

  try {
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 })

    const data = await page.evaluate(() => {
      const getCircleStat = (label) => {
        const items = document.querySelectorAll('ul.circle-data li, ul.circle-data.large li')
        for (const item of items) {
          if (item.innerText.toUpperCase().includes(label)) {
            return item.querySelector('.value')?.innerText.replace('cm', '').trim() + 'cm' || null
          }
        }
        return null
      }

      const getDayRunsOpen = () => {
        const items = document.querySelectorAll('ul.circle-data.large li')
        for (const item of items) {
          if (item.innerText.includes('DAY RUNS OPEN')) {
            return item.innerText.match(/(\d+)/)?.[1] || null
          }
        }
        return null
      }

      // Count lift accordion headings
      const liftRows = document.querySelectorAll('tr.accordion-heading')
      const lifts = Array.from(liftRows).filter(tr => {
        const text = tr.innerText
        return text.includes('Chair') || text.includes('Carpet') || text.includes('Express')
      })
      const liftsOpen = lifts.filter(tr =>
        tr.closest('tbody')?.querySelector('.status-open') !== null
      ).length

      // Count runs with status-open
      const runRows = document.querySelectorAll('article.trail-row')
      const runsOpen = Array.from(runRows).filter(a =>
        a.querySelector('.status-open') !== null
      ).length

      return {
        snow: {
          base: getCircleStat('AT THE BASE'),
          summit: getCircleStat('AT THE SUMMIT'),
          snowfall24h: getCircleStat('24HR SNOWFALL'),
          snowfall48h: getCircleStat('48HR SNOWFALL'),
          snowfall7day: getCircleStat('7 DAY SNOWFALL'),
          seasonTotal: getCircleStat('THIS SEASON'),
        },
        lifts: {
          open: lifts.length > 0 ? `${liftsOpen} / ${lifts.length}` : null,
        },
        trails: {
          open: getDayRunsOpen() ? `${getDayRunsOpen()} open` : null,
        },
        isOpen: document.querySelector('.status-open') !== null
      }
    })

    return {
      name: 'Mount Seymour',
      location: 'North Vancouver, BC',
      lastUpdated: new Date().toISOString(),
      ...data
    }

  } catch (error) {
    console.error('Seymour scraper failed:', error.message)
    return null
  } finally {
    await browser.close()
  }
}