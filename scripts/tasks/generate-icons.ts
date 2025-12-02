import path from 'path'
import fs from 'fs'
import pMap from 'p-map'
import consola from 'consola'
import { iconTemplate } from '../templates/icon-template'
import { readAndConvertSvg } from '../utils/svg-converter'
import { format, naturalCompare } from '../helpers'
import {
  iconCategories,
  VARIANT_DIR_MAP,
  IconVariant,
  IconInfo,
  DuplicateNameHandler,
  getComponentName,
} from '../helpers'

const fsPromises = fs.promises

// 4.0 版本的本地源文件路径
const ICONS_SOURCE_PATH = 'material-design-icons-4.0.0/src'

/**
 * 扫描指定分类下的所有图标
 * @param category 图标分类名称
 * @returns 该分类下所有图标的信息
 */
async function scanCategory(category: string): Promise<IconInfo[]> {
  const categoryPath = path.join(ICONS_SOURCE_PATH, category)
  const icons: IconInfo[] = []

  try {
    const entries = await fsPromises.readdir(categoryPath, { withFileTypes: true })
    const iconEntries = entries
      .filter((entry) => entry.isDirectory())
      .sort((a, b) => naturalCompare(a.name, b.name))

    for (const entry of iconEntries) {
      const iconName = entry.name
      const iconPath = path.join(categoryPath, iconName)
      const variants: Partial<Record<IconVariant, string>> = {}

      // 扫描该图标的所有变体目录
      const variantEntries = await fsPromises.readdir(iconPath, { withFileTypes: true })
      const sortedVariantEntries = variantEntries
        .filter((variantEntry) => variantEntry.isDirectory())
        .sort((a, b) => naturalCompare(a.name, b.name))

      for (const variantEntry of sortedVariantEntries) {
        const variantDirName = variantEntry.name
        const variant = VARIANT_DIR_MAP[variantDirName]

        if (!variant) continue

        // 检查 24px.svg 文件是否存在
        const svgPath = path.join(iconPath, variantDirName, '24px.svg')

        try {
          await fsPromises.access(svgPath)
          variants[variant] = svgPath
        } catch {
          // SVG 文件不存在，跳过
        }
      }

      // 只有至少有一个变体的图标才添加
      if (Object.keys(variants).length > 0) {
        icons.push({
          category,
          name: iconName,
          variants,
        })
      }
    }
  } catch (error) {
    consola.warn(`无法扫描分类 "${category}":`, error)
  }

  return icons
}

/**
 * 扫描所有分类的图标
 * @returns 所有分类的图标信息映射
 */
async function scanAllIcons(): Promise<Map<string, IconInfo[]>> {
  const allIcons = new Map<string, IconInfo[]>()

  for (const category of iconCategories) {
    const icons = await scanCategory(category)

    allIcons.set(category, icons)
    consola.info(`扫描到 ${icons.length} 个图标 (${category})`)
  }

  return allIcons
}

/**
 * 收集图标的所有变体 SVG 内容
 */
async function collectVariantSVGs(
  iconInfo: IconInfo,
): Promise<Partial<Record<IconVariant, string>>> {
  const svgContents: Partial<Record<IconVariant, string>> = {}

  for (const [variant, svgPath] of Object.entries(iconInfo.variants)) {
    const content = await readAndConvertSvg(svgPath as string)

    if (content) {
      svgContents[variant as IconVariant] = content
    }
  }

  return svgContents
}

/**
 * 为单个图标生成组件
 * 使用纯 async/await 实现
 */
async function generateIconComponent(
  iconInfo: IconInfo,
  duplicateHandler: DuplicateNameHandler,
): Promise<void> {
  // 处理重名
  const originalComponentName = getComponentName(iconInfo.name)
  const finalComponentName = duplicateHandler.handleDuplicateName(
    originalComponentName,
    iconInfo.category,
  )

  // 收集所有变体的 SVG 内容
  const svgContents = await collectVariantSVGs(iconInfo)

  if (Object.keys(svgContents).length === 0) {
    consola.warn(`图标 "${iconInfo.name}" 没有有效的 SVG 内容`)

    return
  }

  // 生成 Vue 组件
  const vueComponent = iconTemplate(svgContents, iconInfo.name, finalComponentName)

  // 格式化代码
  const formattedCode = await format(vueComponent)

  // 确保目标目录存在
  const outputDir = `src/icons/${iconInfo.category}`

  await fsPromises.mkdir(outputDir, { recursive: true })

  // 写入文件
  const outputPath = path.join(outputDir, `${finalComponentName}.tsx`)

  await fsPromises.writeFile(outputPath, formattedCode, 'utf-8')
}

/**
 * 主函数：生成所有图标组件
 */
export default async function generateIcons(): Promise<void> {
  consola.info('开始生成图标组件 (Material Design Icons 4.0)...')
  consola.info(`源路径: ${ICONS_SOURCE_PATH}`)

  // 扫描所有图标
  const allIcons = await scanAllIcons()

  // 创建重名处理器
  const duplicateHandler = new DuplicateNameHandler()

  // 按分类生成图标，使用 p-map 控制并发
  for (const [category, icons] of allIcons) {
    consola.info(`生成 ${icons.length} 个图标 (${category})...`)

    await pMap(
      icons,
      async (iconInfo) => {
        await generateIconComponent(iconInfo, duplicateHandler)
      },
      { concurrency: 10 },
    )
  }

  // 输出重名统计
  const duplicateLog = duplicateHandler.getDuplicateLog()

  if (duplicateLog.size > 0) {
    consola.info('\n检测到重名图标:')

    for (const [originalName, renamedList] of duplicateLog) {
      consola.info(`  ${originalName}: ${renamedList.join(', ')}`)
    }
  }

  consola.success('图标生成完成!')
}

// 导出扫描函数供测试使用
export { scanCategory, scanAllIcons, ICONS_SOURCE_PATH }
