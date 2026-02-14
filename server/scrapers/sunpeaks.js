import puppeteer from 'puppeteer'

const SUNPEAKS_URL = 'https://www.sunpeaksresort.com/ski-ride/mountain-stats'

export async function scrapeSunPeaks() {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  try {
    await page.goto(SUNPEAKS_URL, { waitUntil: 'networkidle2', timeout: 30000 })

    // Dump all text with cm to find selectors
    const content = await page.evaluate(() => {
      const results = []
      document.querySelectorAll('*').forEach(el => {
        const text = el.innerText?.trim()
        if (text && text.length < 100 && text.match(/\d+\s*cm/i)) {
          results.push({ tag: el.tagName, class: el.className, text })
        }
      })
      return results
    })

    require('fs').writeFileSync('/tmp/sunpeaks_debug.json', JSON.stringify(content, null, 2))
    console.log('Sun Peaks debug written to /tmp/sunpeaks_debug.json')

  } catch (error) {
    console.error('Sun Peaks scraper failed:', error.message)
  } finally {
    await browser.close()
  }
}