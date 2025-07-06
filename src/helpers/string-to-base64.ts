export function stringToBase64(raw: string): string {
  return Buffer.from(raw).toString('base64')
}
