import * as fs from 'node:fs'
import { Logger } from './logger'

export function exportToFile(data: any, filename?: string) {
  const fileName = filename || 'results'
  const now = new Date()
  const isoSafe = now.toISOString().replace(/[:.]/g, '-')

  const filePath = `./src/results/${isoSafe}_${fileName}.json`

  fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
    if (!error) {
      // Logger.log(`File successfully written at ${filePath}`)
      return
    }

    Logger.error(`Error writing file: ${error}`)
  })
}
