import * as fs from 'node:fs'

import puppeteer from 'puppeteer'

import { Item } from '../entities/item'
import { DumbSellItem, ProcessedItem } from '../entities/processed'
import { exportToFile } from '../helpers/export-to-file'
import { renameFile } from '../helpers/rename-file'

const MAX_ITEMS_PER_PAGE = 30
const BASE_URL = new URL('https://ragnatales.com.br/market')
const MERCHANT_BUFF_PERCENTAGE = 1.24

async function scrape() {
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
      const pageUrl = new URL(
        `market/${categoryName}?page=${i}&query=`,
        BASE_URL
      )
      await page.goto(pageUrl.toString())

      // Should probably check if we can do this in parallel (opening multiple pages) instead of scraping 200+ pages sequentially
      const response = await page.waitForResponse(
        (res) =>
          res.url().includes('api.ragnatales.com.br/market') &&
          res.status() === 200,
        { timeout: 10000 } // in ms
      )

      const data = await response.json()

      const items: Item[] = data.rows

      const dumbSells = items.filter(
        (item) => item.value_sell * MERCHANT_BUFF_PERCENTAGE > item.price
      )

      result.push(...dumbSells)
    }

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
    console.error('Error during scraping:', error)
  }
}

scrape()
