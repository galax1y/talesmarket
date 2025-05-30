import * as fs from 'node:fs'
import * as path from 'node:path'

import puppeteer from 'puppeteer'

import { Item } from './entities/item'
import { zenyFormatter } from './helpers/zeny-formatter'
import { ProcessedItem } from './entities/processed'

const MAX_ITEMS_PER_PAGE = 30
const BASE_URL = new URL('https://ragnatales.com.br/market')
const TEN_PERCENT = 0.1

async function main() {
  try {
    const browser = await puppeteer.launch({
      headless: false
      // defaultViewport: null,
      // args: ['--start-maximized'],
      // slowMo: 200
    })

    const page = await browser.newPage()
    await page.goto(BASE_URL.toString())
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

    const itemsToQuery: Map<string, number> = new Map([
      ['escudo gigante', 800],
      ['machado gigante', 800],
      ['egide da nobreza', 800],
      ['sobretudo do maestro', 2000],
      ['lança gigante', 800],
      ['pilares', 400],
      ['martelo veterano', 400],
      ['arco demoniaco', 400],
      ['gladio da nobreza', 800],
      ['manteau de chamas de naght sieger', 400],
      ['capa do carrasco', 1600],
      ['vestes de ghostring', 2000],
      ['tae goo lyeon ilusional', 2000],
      ['balista ilusional', 2000],
      ['bandagens limpas ilusionais', 2000],
      ['luva de combo ilusional', 2000],
      ['tabula ilusional', 2000]
      // ['escudo de bradium', 400],
      // ['capa heroica', 3000],
    ])

    const result: ProcessedItem[] = []

    for (const [itemName, coins] of itemsToQuery) {
      const itemUrl = new URL(
        `/market?query=${convertToBase64(itemName)}`,
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

      const minZenyPerCoin =
        items.length === 0
          ? undefined
          : items.reduce((min, item) => {
              const zenyPerCoin = item.price / (coins * TEN_PERCENT)
              return Math.min(min, zenyPerCoin)
            }, Number.MAX_VALUE)

      const processed: ProcessedItem = {
        name: itemName,
        coins,
        zenyPerCoin: minZenyPerCoin ?? 0,
        offers: []
      }

      result.push(processed)
    }

    result.sort((a, b) => a.zenyPerCoin - b.zenyPerCoin)

    await browser.close()

    const now = new Date()
    const isoSafe = now.toISOString().replace(/[:.]/g, '-')

    const filePath = `./src/results/${isoSafe}_results.txt`

    fs.writeFile(filePath, JSON.stringify(result, null, 2), (err) => {
      if (err) {
        console.log('Error writing file:', err)
      }
    })
  } catch (error) {
    console.log(error)
  }
}

function convertToBase64(raw: string): string {
  return Buffer.from(raw).toString('base64')
}

main()
