import * as fs from 'node:fs'

export function exportToFile(data: any, filename?: string) {
  const fileName = filename || 'results'
  const now = new Date()
  const isoSafe = now.toISOString().replace(/[:.]/g, '-')

  const filePath = `./src/results/${isoSafe}_${fileName}.json`

  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.log('Error writing file:', err)
    }
  })
}
