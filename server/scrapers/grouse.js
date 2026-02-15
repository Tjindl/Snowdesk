import puppeteer from 'puppeteer'

const URL = 'https://www.grousemountain.com/current_conditions'

export async function scrapeGrouse() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()

  try {
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 })

    const data = await page.evaluate(() => {
      const getSnowByLabel = (label) => {
        const items = document.querySelectorAll('li')
        for (const item of items) {
          if (item.innerText.trim().startsWith(label)) {
            return item.querySelector('h3.metric')?.innerText.trim() || null
          }
        }
        return null
      }

      const countByStatus = (selector, status) => {
        const items = document.querySelectorAll(selector)
        return Array.from(items).filter(el =>
          el.querySelector('span.open') !== null
        ).length
      }

      const liftsOpen = document.querySelectorAll('h2 + ul li span.open, #lifts li span.open')
      const runsOpen = Array.from(document.querySelectorAll('#runs li span.open')).length
      const runsClosed = Array.from(document.querySelectorAll('#runs li')).filter(li =>
        li.innerText.toLowerCase().includes('closed')
      ).length

      // Count lifts
      const liftItems = Array.from(document.querySelectorAll('li')).filter(li => {
        const text = li.innerText
        return (text.includes('Chair') || text.includes('Carpet') || text.includes('Gondola'))
          && !text.includes('Lift Tickets')
      })
      const liftsOpenCount = liftItems.filter(li => li.querySelector('span.open')).length

      return {
        snow: {
          snowfall12h: getSnowByLabel('12HRS'),
          snowOvernight: getSnowByLabel('OVERNIGHT'),
          snowfall24h: getSnowByLabel('24HRS'),
          snowfall48h: getSnowByLabel('48HRS'),
          snowfall7day: getSnowByLabel('SEVEN DAYS'),
          seasonTotal: getSnowByLabel('TOTAL THIS SEASON'),
          base: getSnowByLabel('DEPTH PLATEAU'),
        },
        lifts: {
          open: liftsOpenCount > 0 ? `${liftsOpenCount} / ${liftItems.length}` : null,
        },
        trails: {
          open: runsOpen > 0 ? `${runsOpen} / ${runsOpen + runsClosed}` : null,
        },
        isOpen: document.querySelector('span.open') !== null
      }
    })

    return {
      name: 'Grouse Mountain',
      location: 'North Vancouver, BC',
      lastUpdated: new Date().toISOString(),
      ...data
    }

  } catch (error) {
    console.error('Grouse scraper failed:', error.message)
    return null
  } finally {
    await browser.close()
  }
}