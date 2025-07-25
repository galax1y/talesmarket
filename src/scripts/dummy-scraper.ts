import puppeteer from 'puppeteer'
import { intervalToDuration } from 'date-fns'

import { Item } from '../entities/item'
import { DumbSellItem } from '../entities/processed'

import { Logger } from '../helpers/logger'
import { renameFile } from '../helpers/rename-file'
import { exportToFile } from '../helpers/export-to-file'

import {
  API_URL,
  BASE_URL,
  MAX_ITEMS_PER_PAGE,
  MERCHANT_BUFF_PERCENTAGE
} from '../helpers/constants'

export default async function scrape() {
  const startTime = new Date()

  await Promise.all([
    scrapeCategory({ categoryName: 'usable' }),
    scrapeCategory({ categoryName: 'etc' })
  ])

  const endTime = new Date()

  const duration = intervalToDuration({ start: startTime, end: endTime })

  Logger.log(`Dummy scraping completed in ${duration.seconds} seconds`)
}

interface CategoryProps {
  categoryName: string
}

async function scrapeCategory({ categoryName }: CategoryProps) {
  try {
    const browser = await puppeteer.launch({
      headless: false
    })

    const page = await browser.newPage()

    Logger.log(`Starting scraping category: '${categoryName}'`)

    const marketPageUrl = new URL(`/market/${categoryName}`, BASE_URL)
    await page.goto(marketPageUrl.toString())

    const response = await page.waitForResponse(
      (res) =>
        res.url().includes('api.ragnatales.com.br/market') &&
        res.status() === 200,
      { timeout: 10000 } // in ms
    )

    const data = await response.json()
    const totalPages = Math.ceil(data.total_count / MAX_ITEMS_PER_PAGE)

    const result: Item[] = []

    const fetchUrl = new URL(`/market`, API_URL)
    const filters = JSON.stringify({ query: '', [categoryName]: true })
    fetchUrl.searchParams.set('filters', filters)
    fetchUrl.searchParams.set('rows_per_page', String(MAX_ITEMS_PER_PAGE))

    for (let i = 1; i <= totalPages; i++) {
      fetchUrl.searchParams.set('page', String(i))

      // Step 3: Run fetch inside the browser context instead of navigating
      const fetchData = await page.evaluate(async (url) => {
        const data = await fetch(url)
          .then((response) => response.json())
          .catch((error) => console.error(`Error while fetching: ${error}`))

        return data
      }, fetchUrl.toString())

      const items: Item[] = fetchData.rows

      const dumbSells = items.filter(
        (item) => item.value_sell * MERCHANT_BUFF_PERCENTAGE > item.price
      )

      result.push(...dumbSells)
    }

    Logger.log(`Finished scraping category: '${categoryName}'`)

    await browser.close()

    const dumbSells: DumbSellItem[] = result
      .map((item) => {
        const npcSellPrice = item.value_sell * MERCHANT_BUFF_PERCENTAGE

        const totalProfit = (npcSellPrice - item.price) * item.amount

        return {
          name: item.name,
          price: item.price,
          amount: item.amount,
          npcSellPrice,
          totalProfit,
          offer: {
            map_x: item.map_x,
            map_y: item.map_y,
            price: item.price,
            quantity: item.amount
          }
        }
      })
      .sort((a, b) => b.totalProfit - a.totalProfit)

    const filename = `dumbsell_${categoryName}`

    renameFile(filename)
    exportToFile(dumbSells, filename)
  } catch (error) {
    Logger.error(`Flow error: ${error}`)
  }
}

scrape()
