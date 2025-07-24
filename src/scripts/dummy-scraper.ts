import puppeteer from 'puppeteer'

import { Item } from '../entities/item'
import { DumbSellItem } from '../entities/processed'

import { renameFile } from '../helpers/rename-file'
import { exportToFile } from '../helpers/export-to-file'

const MAX_ITEMS_PER_PAGE = 30
const BASE_URL = new URL('https://ragnatales.com.br/market')
const FETCH_URL = new URL('https://api.ragnatales.com.br')
const MERCHANT_BUFF_PERCENTAGE = 1.24

export default async function scrape() {
  await Promise.all([
    scrapeCategory({ categoryName: 'usable' }),
    scrapeCategory({ categoryName: 'etc' })
  ])
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

    const url = new URL(`market/${categoryName}?page=1&query=`, BASE_URL)
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

    const result: Item[] = []

    for (let i = 1; i <= totalPages; i++) {
      const filters = { query: '', [categoryName]: true }
      const encodedFilters = encodeURIComponent(JSON.stringify(filters))

      // Working!
      const fetchUrl = new URL(
        `market/?page=${i}&rows_per_page=${MAX_ITEMS_PER_PAGE}&filters=${encodedFilters}`,
        FETCH_URL
      )

      // Step 3: Run fetch inside the browser context instead of navigating
      const fetchData = await page.evaluate(async (url) => {
        console.log('Evaluating...')

        console.log('Fetch URL:', url.toString())

        const data = await fetch(url)
          .then((response) => response.json())
          .catch((error) => console.error('Fetch error:', error))

        return data
      }, fetchUrl.toString())

      const items: Item[] = fetchData.rows

      const dumbSells = items.filter(
        (item) => item.value_sell * MERCHANT_BUFF_PERCENTAGE > item.price
      )

      result.push(...dumbSells)
    }

    console.log('Finished scraping category:', categoryName)

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
    console.error('Error during scraping:', error, JSON.stringify(error))
  }
}

scrape()
