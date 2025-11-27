import through2 from 'through2'
import { itemTemplate, listTemplate } from '../templates/demo-template'
import rename from 'gulp-rename'
import { getListName } from '../helpers'

export function itemDefinition(iconCategory: string) {
  return through2.obj(async (chunk, enc, callback) => {
    const fileName = chunk.stem

    chunk.contents = Buffer.from(itemTemplate(iconCategory, fileName))
    callback(null, chunk)
  })
}

export function listDefinition(iconCategory: string) {
  return through2.obj(async (chunk, enc, callback) => {
    const items = chunk.contents

    chunk.contents = Buffer.from(listTemplate(iconCategory, items))
    callback(null, chunk)
  })
}

export function listRename() {
  return rename((p: rename.ParsedPath) => {
    const baseName = p.basename

    if (!baseName) {
      return
    }

    const componentName = `${getListName(baseName)}`

    return {
      dirname: '/',
      basename: componentName,
      extname: '.tsx',
    }
  })
}
