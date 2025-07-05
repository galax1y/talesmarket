import * as fs from 'node:fs'

import puppeteer from 'puppeteer'

import { Item } from '../entities/item'
import { ProcessedItem } from '../entities/processed'

import { exportToFile } from '../helpers/export-to-file'

const MAX_ITEMS_PER_PAGE = 30
const BASE_URL = new URL('https://ragnatales.com.br/market')
const TEN_PERCENT = 0.1

async function scrape() {
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
      // HATS
      ['elmo gigante', 800],
      ['orelhas do ifrit', 200],
      ['mascara de mergulho', 200],
      ['olhos bionicos', 2200],
      ['oculos 3d', 3300],
      ['sopro do ifrit', 800],
      // ['peixe fresco', 1500],
      ['rosario da guarda real', 400],
      ['asas de reginleif', 1500],
      ['cd antiquado', 3000],
      ['lagrima de amdarais', 5000],
      ['chapeu da guarda real', 1000],
      ['capuz de morpheus ilusional', 3000],
      ['maca ilusional', 6000],
      ['elmo de goibne ilusional', 6000],
      // ARMADURAS
      ['kandura', 150],
      ['colete do dragao', 100],
      ['batina do clero', 300],
      ['vestigio de odin', 1200],
      ['sobretudo do maestro', 2000],
      ['armadura da nobreza', 400],
      ['armadura de goibne ilusional', 6000],
      // ARMAS
      ['aco igneo', 200],
      ['adaga do perseguidor', 400],
      ['manjuba', 200],
      ['vara sagrada', 200],
      ['machado de combate', 200],
      ['guarda-chuva antiquado', 200],
      ['arco mistico', 200],
      ['espada cromada de duas maos', 200],
      ['lanca gigante', 800],
      ['arco gigante', 800],
      ['pilares', 400],
      ['bastao da aberracao', 800],
      ['tentaculo afiado', 100],
      ['sabre sinoite', 200],
      ['rosa labareda', 200],
      ['bandagens limpas', 100],
      ['lamina gemea azul', 800],
      ['lamina gemea vermelha', 800],
      ['lamina dos ceus', 1500],
      ['ukulele do novo oz', 200],
      ['microfone floral de igu', 200],
      ['katar da petala purpura', 400],
      ['martelo veterano', 400],
      ['arco demoniaco', 400],
      ['gladio da nobreza', 400],
      ['machado de fogo vivo', 3500],
      ['luva de combo ilusional', 2000],
      ['shuriken da nevasca ilusional', 2000],
      ['bazerald ilusional', 2000],
      ['tae goo lyeon ilusional', 2000],
      ['brilho dourado ilusional', 6000],
      ['tabula ilusional', 2000],
      ['balista ilusional', 2000],
      ['arco de caca ilusional', 2000],
      ['bandagens limpas ilusionais', 2000],
      // ESCUDOS
      ['escudo ceruleo', 100],
      ['biblia de exorcismo', 200],
      ['escudo de bradium', 400],
      ['escudo gigante', 800],
      ['absorvedor de magia', 1500],
      ['egide da nobreza', 800],
      ['spiritus sancti ilusional', 2000],
      // CAPAS
      ['manto ceruleo', 100],
      ['mushika', 200],
      ['pedaco de pele do guardiao', 1000],
      ['manteau do dragao', 100],
      ['manteau de chamas de naght sieger', 400],
      ['manteau do clero', 400],
      ['capa heroica', 3000],
      ['capa do carrasco', 1600],
      ['capa do sobrevivente ilusional', 1200],
      ['veu de morpheus ilusional', 400],
      ['ombreiras de goibne ilusionais', 2000],
      // SAPATOS
      ['sapatos ceruleos', 100],
      ['saltos da rainha scaraba', 200],
      ['botas gigantes', 800],
      ['botas da aberracao', 1000],
      ['botas do clero', 400],
      ['botas do carrasco', 1500],
      ['botas veteranas', 1500],
      ['botas temporais for', 4000],
      ['botas temporais agi', 4000],
      ['botas temporais des', 4000],
      ['botas temporais vit', 4000],
      ['botas temporais int', 4000],
      ['botas temporais sor', 4000],
      ['grevas de goibne ilusionais', 4000],
      // ACESSORIOS
      ['anel de bradium', 200],
      ['broche de bradium', 200],
      ['colar de bradium', 200],
      ['brinco de bradium', 200],
      ['luva de bradium', 200],
      ['rosario preto', 200],
      ['lampiao das trevas', 200],
      ['protecao do gigante', 1500],
      ['chip quebrado 01', 200],
      ['chip quebrado 02', 200],
      ['chip quebrado 03', 200],
      ['chip de dados', 1500],
      ['anel de ametista brilhante', 400],
      ['condensador fisico', 1000],
      ['condensador mental', 1000],
      ['anel do novo oz', 400],
      ['bracelete floral de igu', 400],
      ['anel sombrio', 400],
      ['broche da ganancia', 400],
      ['bracelete de morpheus ilusional', 400],
      ['anel de morpheus ilusional', 400],
      ['anel ilusional', 2000],
      ['anel de goibne ilusional', 3000],
      // SUPER-APRENDIZ
      // ['beijo do arcanjo', 200],
      // ['protecao arcangelical', 200],
      // ['guardiao arcangelical', 200],
      // ['cardiga arcangelical', 200],
      // ['reencarnacao do arcanjo', 200],
      ['vestes de ghostring', 2000]

      // ['escudo gigante', 800],
      // ['egide da nobreza', 800],
      // ['sobretudo do maestro', 2000],
      // ['lanca gigante', 800],
      // ['pilares', 400],
      // ['martelo veterano', 400],
      // ['arco demoniaco', 400],
      // ['gladio da nobreza', 800],
      // ['manteau de chamas de naght sieger', 400],
      // ['capa do carrasco', 1600],
      // ['vestes de ghostring', 2000],
      // ['tae goo lyeon ilusional', 2000],
      // ['balista ilusional', 2000],
      // ['bandagens limpas ilusionais', 2000],
      // ['luva de combo ilusional', 2000],
      // ['tabula ilusional', 2000],
      // ['botas veteranas', 1500],
      // ['botas da aberracao', 1000],
      // ['anel sombrio', 400]
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

      items.map((item) =>
        result.push({
          name: itemName,
          price: item.price,
          coins,
          zenyPerCoin: item.price / (coins * TEN_PERCENT),
          offer: {
            map_x: item.map_x,
            map_y: item.map_y,
            price: item.price,
            quantity: item.amount
          }
        })
      )
    }

    result.sort((a, b) => a.zenyPerCoin - b.zenyPerCoin)

    await browser.close()

    exportToFile(result)
  } catch (error) {
    console.log(error)
  }
}

function convertToBase64(raw: string): string {
  return Buffer.from(raw).toString('base64')
}

scrape()
