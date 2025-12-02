import path from 'path'
import fs from 'fs'
import { glob } from 'tinyglobby'
import pMap from 'p-map'
import consola from 'consola'
import { format, iconCategories, getListName, naturalCompare } from '../helpers'
import {
  itemTemplate,
  listTemplate,
  indexTemplate,
  panesTemplate,
  paneTemplate,
} from '../templates/demo-template'

const fsPromises = fs.promises

// 4.0 版本的本地源文件路径
const ICONS_SOURCE_PATH = 'material-design-icons-4.0.0/src'

/**
 * 扫描分类下的所有图标名称
 * @param category 图标分类
 * @returns 图标名称列表
 */
async function scanCategoryIcons(category: string): Promise<string[]> {
  const categoryPath = path.join(ICONS_SOURCE_PATH, category)

  try {
    // 使用 glob 扫描 filled 变体的 SVG 文件
    const svgFiles = await glob('*/materialicons/24px.svg', {
      cwd: categoryPath,
    })

    // 从路径中提取图标名称
    // 路径格式: {icon_name}/materialicons/24px.svg
    const iconNames = svgFiles.map((file) => {
      const parts = file.split('/')

      return parts[0]
    })

    return iconNames.sort(naturalCompare)
  } catch (error) {
    consola.warn(`无法扫描分类 "${category}":`, error)

    return []
  }
}

/**
 * 生成分类的列表组件
 */
async function generateCategoryList(category: string): Promise<void> {
  const iconNames = await scanCategoryIcons(category)

  if (iconNames.length === 0) {
    consola.warn(`分类 ${category} 中没有找到图标`)

    return
  }

  // 生成列表项
  const items = iconNames.map((iconName) => itemTemplate(category, iconName)).join('\n')

  // 生成列表组件
  const listContent = listTemplate(category, items)

  // 格式化代码
  const formattedContent = await format(listContent)

  // 确保目录存在
  const outputDir = 'playground/views/icons'

  await fsPromises.mkdir(outputDir, { recursive: true })

  // 写入文件
  const listName = getListName(category)
  const outputPath = path.join(outputDir, `${listName}.tsx`)

  await fsPromises.writeFile(outputPath, formattedContent, 'utf-8')
}

/**
 * 生成所有分类的列表组件
 */
async function generateAllLists(): Promise<void> {
  await pMap(
    iconCategories,
    async (category) => {
      await generateCategoryList(category)
    },
    { concurrency: 10 },
  )
}

/**
 * 生成索引文件
 */
async function generateIndexFile(): Promise<void> {
  const indexContent = iconCategories
    .map((category) => indexTemplate(category))
    .join('\n')
    .concat('\n')

  const formattedContent = await format(indexContent)

  const outputDir = 'playground/views/icons'

  await fsPromises.mkdir(outputDir, { recursive: true })

  const outputPath = path.join(outputDir, 'index.ts')

  await fsPromises.writeFile(outputPath, formattedContent, 'utf-8')
}

/**
 * 生成 IconPanes 组件
 */
async function generatePanesComponent(): Promise<void> {
  const panesContent = iconCategories.map((category) => paneTemplate(category)).join('\n')

  const demoContent = panesTemplate(panesContent)

  const formattedContent = await format(demoContent)

  const outputPath = 'playground/views/IconPanes.tsx'

  await fsPromises.writeFile(outputPath, formattedContent, 'utf-8')
}

/**
 * 主函数：生成所有 Demo 文件
 */
export default async function generateDemo(): Promise<void> {
  consola.info('生成 Demo 文件...')

  // 生成列表组件
  await generateAllLists()
  consola.info(`生成了 ${iconCategories.length} 个列表组件`)

  // 生成索引文件
  await generateIndexFile()
  consola.info('生成了索引文件')

  // 生成 IconPanes 组件
  await generatePanesComponent()
  consola.info('生成了 IconPanes 组件')

  consola.success('Demo 生成完成!')
}
