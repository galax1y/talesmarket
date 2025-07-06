import * as fs from 'node:fs'
import path from 'node:path'

export function renameFile(targetSubstring: string) {
  const dir = './src/results'
  const OLD_FILE_PREFIX = 'old_'

  fs.readdir(dir, (err, files) => {
    if (err) {
      return console.error('Error reading directory:', err)
    }

    files = files.filter((file) => !file.startsWith(OLD_FILE_PREFIX))

    const matchedFile = files.find((file) => file.includes(targetSubstring))

    if (!matchedFile) {
      console.log(`No file found containing "${targetSubstring}"`)
      return
    }

    const newFileName = 'old_' + matchedFile

    const oldPath = path.join(dir, matchedFile)

    const newPath = path.join(dir, newFileName)

    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        return console.error('Error renaming file:', err)
      }
      console.log(`Renamed "${matchedFile}" to "${newFileName}"`)
    })
  })
}
