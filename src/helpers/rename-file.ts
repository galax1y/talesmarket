import * as fs from 'node:fs'
import path from 'node:path'
import { Logger } from './logger'

export function renameFile(targetSubstring: string) {
  const dir = './src/results'
  const OLD_FILE_PREFIX = 'old_'

  fs.readdir(dir, (err, files) => {
    if (err) {
      return Logger.error(`Error reading directory: ${err}`)
    }

    files = files.filter((file) => !file.startsWith(OLD_FILE_PREFIX))

    const matchedFile = files.find((file) => file.includes(targetSubstring))

    if (!matchedFile) {
      Logger.log(`No file found containing "${targetSubstring}"`)
      return
    }

    const newFileName = 'old_' + matchedFile

    const oldPath = path.join(dir, matchedFile)

    const newPath = path.join(dir, newFileName)

    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        return Logger.error(`Error renaming file: ${err}`)
      }
      // Logger.log(`Renamed "${matchedFile}" to "${newFileName}"`)
    })
  })
}
