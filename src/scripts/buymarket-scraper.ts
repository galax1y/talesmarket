import puppeteer, { Browser } from 'puppeteer'

import { Item } from '../entities/item'
import { BuyOffer, ProcessedBuyOffer } from '../entities/buy-offer'

import { Logger } from '../helpers/logger'
import { renameFile } from '../helpers/rename-file'
import { exportToFile } from '../helpers/export-to-file'

import {
  API_URL,
  BASE_URL,
  BUYMARKET_URL,
  MAX_ITEMS_PER_PAGE
} from '../helpers/constants'
import { intervalToDuration } from 'date-fns'

export default async function scrape() {
  const startTime = Date.now()

  const browser = await puppeteer.launch({
    headless: false
  })

  try {
    const buyOffers = await scrapeBuyMarket(browser)
    const groupedOffers = groupByItemName(buyOffers)
    sortBuyOffersByPrice(groupedOffers)
    Logger.log(`Total unique items: ${groupedOffers.size}`)

    const highestUniqueOffers: BuyOffer[] = []
    for (const [_, offers] of groupedOffers.entries()) {
      const highestOfferForItem = offers.pop()

      if (!highestOfferForItem) {
        continue
      }

      highestUniqueOffers.push(highestOfferForItem)
    }

    const items = await scrapeItems(browser, highestUniqueOffers)

    const processed: ProcessedBuyOffer[] = items.map((offer) => {
      const marketOffer = highestUniqueOffers.find(
        (uniqueOffer) => uniqueOffer.item.name === offer.name
      )

      if (!marketOffer) {
        return {
          itemName: offer.name,
          price: offer.price,
          amount: offer.amount,
          totalProfit: 0,
          buyLocation: {
            map_x: 0,
            map_y: 0,
            price: 0,
            quantity: 0
          },
          sellLocation: {
            map_x: 0,
            map_y: 0,
            price: 0,
            quantity: 0
          }
        }
      }

      return {
        itemName: offer.name,
        price: offer.price,
        amount: offer.amount,
        totalProfit: (marketOffer.price - offer.price) * offer.amount,
        buyLocation: {
          map_x: offer.map_x,
          map_y: offer.map_y,
          price: offer.price,
          quantity: offer.amount
        },
        sellLocation: {
          map_x: marketOffer.store.map_x,
          map_y: marketOffer.store.map_y,
          price: marketOffer.price,
          quantity: marketOffer.amount_remain
        }
      }
    })

    processed.sort((a, b) => b.totalProfit - a.totalProfit)

    renameFile('buymarket')
    exportToFile(processed, 'buymarket')
  } catch (error) {
    Logger.error(`Flow error: ${error}`)
  } finally {
    Logger.log('Finished script. Cleaning up...')
    await browser.close()
  }

  const endTime = Date.now()

  const duration = intervalToDuration({ start: startTime, end: endTime })

  Logger.log(`Buymarket scraping completed in ${duration.seconds} seconds`)
}

function groupByItemName(offers: BuyOffer[]): Map<string, BuyOffer[]> {
  const offerMap = new Map<string, BuyOffer[]>()

  for (const offer of offers) {
    const itemName = offer.item.name

    const offersForItem = offerMap.get(itemName)

    if (!offersForItem) {
      offerMap.set(itemName, [offer])
      continue
    }

    offersForItem.push(offer)
  }

  return offerMap
}

function sortBuyOffersByPrice(offers: Map<string, BuyOffer[]>): void {
  offers.forEach((buyoffers) => {
    buyoffers.sort((a, b) => a.price - b.price)
  })
}

async function scrapeItems(
  browser: Browser,
  items: BuyOffer[]
): Promise<Item[]> {
  const page = await browser.newPage()

  await page.goto(BASE_URL.toString())

  Logger.log('Started item scraping...')

  const result: Item[] = []

  const fetchUrl = new URL(`/market`, API_URL)
  fetchUrl.searchParams.set('page', '1')
  fetchUrl.searchParams.set('rows_per_page', String(MAX_ITEMS_PER_PAGE))

  for (const offer of items) {
    const filters = JSON.stringify({ query: offer.item.name })
    fetchUrl.searchParams.set('filters', filters)

    const data = await page.evaluate(async (url) => {
      const data = await fetch(url)
        .then((response) => response.json())
        .catch((error) => console.error(`Error while fetching: ${error}`))

      return data
    }, fetchUrl.toString())

    const items: Item[] = data.rows
    const profitableItems = items.filter((item) => item.price < offer.price)

    result.push(...profitableItems)
  }

  return result
}

async function scrapeBuyMarket(browser: Browser): Promise<BuyOffer[]> {
  Logger.log('Buymarket scraping initiated')
  const page = await browser.newPage()

  await page.goto(BUYMARKET_URL.toString())

  const response = await page.waitForResponse(
    (res) =>
      res.url().includes('api.ragnatales.com.br/market') &&
      res.status() === 200,
    { timeout: 10000 } // in ms
  )

  const data = await response.json()
  const totalPages = Math.ceil(data.total_count / MAX_ITEMS_PER_PAGE)
  Logger.log(`Total pages to scrape: ${totalPages}`)

  const result: BuyOffer[] = []

  const fetchUrl = new URL(`/market/buystore`, API_URL)
  fetchUrl.searchParams.set('query', '')
  fetchUrl.searchParams.set('type', 'all')
  fetchUrl.searchParams.set('rows_per_page', String(MAX_ITEMS_PER_PAGE))

  for (let i = 1; i <= totalPages; i++) {
    Logger.log(`Scraping buymarket page ${i}`)
    fetchUrl.searchParams.set('page', String(i))

    const data = await page.evaluate(async (url) => {
      const data = await fetch(url)
        .then((response) => response.json())
        .catch((error) => Logger.error(`Error while fetching: ${error}`))

      return data
    }, fetchUrl.toString())

    result.push(...data.rows)
  }

  Logger.log(`Total buy offers scraped: ${result.length}`)

  Logger.log(`Finished scraping buymarket, exiting...`)
  await page.close()

  return result
}

scrape()
