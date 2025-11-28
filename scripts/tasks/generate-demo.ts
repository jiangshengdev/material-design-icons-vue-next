import { format, iconCategories } from '../helpers'
import { dest, src } from 'gulp'
import cancat from 'gulp-concat'
import prettierFormat from '../plugins/prettier-format'
import { itemDefinition, listDefinition, listRename } from '../plugins/demo-definition'
import { indexTemplate, panesTemplate, paneTemplate } from '../templates/demo-template'
import fs from 'fs'
import path from 'path'

// 4.0 版本的本地源文件路径
const ICONS_SOURCE_PATH = 'material-design-icons-4.0.0/src'

// 4.0 版本的 SVG 路径模式: {icon_name}/materialicons/24px.svg (使用 filled 变体作为 demo)
const DEMO_SVG_SELECTOR = '*/materialicons/24px.svg'

async function list() {
  const processes = iconCategories.map((iconCategory) => {
    return new Promise((resolve) => {
      const svgFullSelector = path.join(ICONS_SOURCE_PATH, iconCategory, DEMO_SVG_SELECTOR)

      src(svgFullSelector)
        .pipe(itemDefinition(iconCategory))
        .pipe(cancat(`${iconCategory}.tsx`))
        .pipe(listDefinition(iconCategory))
        .pipe(prettierFormat())
        .pipe(listRename())
        .pipe(dest('playground/views/icons'))
        .on('end', resolve)
    })
  })

  await Promise.all(processes)
}

async function index() {
  const indexContent = iconCategories
    .map((category) => {
      return indexTemplate(category)
    })
    .join('\n')
    .concat('\n')

  // 确保目录存在
  const iconsDir = path.join(__dirname, '../../playground/views/icons')

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true })
  }

  fs.writeFileSync(path.join(iconsDir, 'index.ts'), await format(indexContent))
}

async function panes() {
  const panesContent = iconCategories
    .map((iconCategory) => {
      return paneTemplate(iconCategory)
    })
    .join('\n')
  const demo = panesTemplate(panesContent)

  fs.writeFileSync(path.join(__dirname, '../../playground/views/IconPanes.tsx'), await format(demo))
}

export default async function generateDemo() {
  await list()
  await index()
  await panes()
}
