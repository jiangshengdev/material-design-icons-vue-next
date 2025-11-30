import { rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'

async function removeDir(path: string) {
  if (existsSync(path)) {
    await rm(path, { recursive: true, force: true })
  }
}

export async function cleanSrc() {
  await Promise.all([removeDir('src/icons'), removeDir('playground/views/icons')])
}
