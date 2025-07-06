import puppeteer, { Browser } from 'puppeteer'

import { Item } from '../entities/item'
import { BuyOffer, ProcessedBuyOffer } from '../entities/buy-offer'

import { renameFile } from '../helpers/rename-file'
import { exportToFile } from '../helpers/export-to-file'
import { stringToBase64 } from '../helpers/string-to-base64'

const MAX_ITEMS_PER_PAGE = 30
const BASE_URL = new URL('https://ragnatales.com.br/market')
const BUYMARKET_URL = new URL('https://ragnatales.com.br/buymarket')

export default async function scrape() {
  const browser = await puppeteer.launch({
    headless: false
  })

  try {
    const buyOffers = await scrapeBuyMarket(browser)

    const highestUniqueOffers = getHighestItemPriceOffers(buyOffers)

    const items = await scrapeItems(browser, highestUniqueOffers)

    items.sort((a, b) => a.price - b.price)

    const processed: ProcessedBuyOffer[] = items.map((offer) => {
      const marketOffer = highestUniqueOffers.find(
        (uniqueOffer) => uniqueOffer.item.name === offer.name
      )!

      return {
        itemName: offer.name,
        price: offer.price,
        amount: offer.amount,
        totalProfit: (marketOffer.price - offer.price) * offer.amount,
        offer: {
          map_x: marketOffer.store.map_x,
          map_y: marketOffer.store.map_y,
          price: marketOffer.price,
          quantity: marketOffer.amount_remain
        }
      }
    })

    renameFile('buymarket')
    exportToFile(processed, 'buymarket')
  } catch (error) {
    console.error(error)
  } finally {
    await browser.close()
  }
}
function getHighestItemPriceOffers(offers: BuyOffer[]): BuyOffer[] {
  const grouped = new Map<string, BuyOffer>()

  for (const offer of offers) {
    const name = offer.item.name
    const existing = grouped.get(name)

    if (!existing || offer.item.price > existing.item.price) {
      grouped.set(name, offer)
    }
  }

  return Array.from(grouped.values())
}

async function scrapeItems(
  browser: Browser,
  items: BuyOffer[]
): Promise<Item[]> {
  const page = await browser.newPage()
  await page.setRequestInterception(true)

  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.searchParams.has('rows_per_page')) {
      url.searchParams.set('rows_per_page', String(MAX_ITEMS_PER_PAGE))

      request.continue({
        url: url.toString()
      })
    } else {
      request.continue()
    }
  })

  const result: Item[] = []

  for (const offer of items) {
    const itemUrl = new URL(
      `/market?query=${stringToBase64(offer.item.name.toLowerCase())}`,
      BASE_URL
    )

    await page.goto(itemUrl.toString())

    const response = await page.waitForResponse(
      (res) =>
        res.url().includes('api.ragnatales.com.br/market') &&
        res.status() === 200,
      { timeout: 10000 } // in ms
    )

    const data = await response.json()
    const items: Item[] = data.rows

    const profitableItems = items.filter((item) => item.price < offer.price)

    result.push(...profitableItems)
  }

  return result
}

async function scrapeBuyMarket(browser: Browser): Promise<BuyOffer[]> {
  const page = await browser.newPage()

  const url = new URL(`buymarket/?page=1&type=all`, BUYMARKET_URL)
  await page.setRequestInterception(true)

  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.searchParams.has('rows_per_page')) {
      url.searchParams.set('rows_per_page', String(MAX_ITEMS_PER_PAGE))

      request.continue({
        url: url.toString()
      })
    } else {
      request.continue()
    }
  })

  await page.goto(url.toString())

  const response = await page.waitForResponse(
    (res) =>
      res.url().includes('api.ragnatales.com.br/market') &&
      res.status() === 200,
    { timeout: 10000 } // in ms
  )

  const data = await response.json()
  const totalPages: number = data.total_pages

  const result: BuyOffer[] = []

  for (let i = 1; i <= totalPages; i++) {
    const pageUrl = new URL(`buymarket/?page=${i}&type=all`, BUYMARKET_URL)
    await page.goto(pageUrl.toString())

    const response = await page.waitForResponse(
      (res) =>
        res.url().includes('api.ragnatales.com.br/market') &&
        res.status() === 200,
      { timeout: 10000 } // in ms
    )

    const data = await response.json()

    result.push(...data.rows)
  }

  await page.close()

  return result
}

scrape()
