import buyMarketScraper from './buymarket-scraper'
import dummyScraper from './dummy-scraper'
import instanceCoinScraper from './instance-coins-scraper'

async function scrapeAll() {
  await Promise.all([buyMarketScraper(), dummyScraper(), instanceCoinScraper()])
}

scrapeAll()
