import through2 from 'through2'
import { itemTemplate, listTemplate } from '../templates/demo-template'
import rename from 'gulp-rename'
import { getListName } from '../helpers'
import path from 'path'

export function itemDefinition(iconCategory: string) {
  return through2.obj(async (chunk, _enc, callback) => {
    // 从路径中提取图标名称
    // 路径格式: material-design-icons-4.0.0/src/{category}/{icon_name}/materialicons/24px.svg
    // chunk.path 包含完整路径，我们需要提取 {icon_name}
    const filePath = chunk.path
    const parts = filePath.split(path.sep)
    // 找到 materialicons 目录的位置，图标名称在它前面
    const variantIndex = parts.findIndex((p: string) => p.startsWith('materialicons'))
    const iconName = variantIndex > 0 ? parts[variantIndex - 1] : chunk.stem

    chunk.contents = Buffer.from(itemTemplate(iconCategory, iconName))
    callback(null, chunk)
  })
}

export function listDefinition(iconCategory: string) {
  return through2.obj(async (chunk, _enc, callback) => {
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
