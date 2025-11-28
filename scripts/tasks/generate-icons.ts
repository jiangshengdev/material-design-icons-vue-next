import path from 'path'
import fs from 'fs'
import { dest, src } from 'gulp'
import { iconDefinition, iconRename } from '../plugins/icon-definition'
import prettierFormat from '../plugins/prettier-format'
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

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const iconName = entry.name
      const iconPath = path.join(categoryPath, iconName)
      const variants: Partial<Record<IconVariant, string>> = {}

      // 扫描该图标的所有变体目录
      const variantEntries = await fsPromises.readdir(iconPath, { withFileTypes: true })

      for (const variantEntry of variantEntries) {
        if (!variantEntry.isDirectory()) continue

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
    console.warn(`Warning: Could not scan category "${category}":`, error)
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
    console.log(`Scanned ${icons.length} icons in category "${category}"`)
  }

  return allIcons
}

/**
 * 读取 SVG 文件内容
 * @param filePath SVG 文件路径
 * @returns SVG 内容或 null（如果读取失败）
 */
async function readSVGContent(filePath: string): Promise<string | null> {
  try {
    const content = await fsPromises.readFile(filePath, 'utf-8')

    if (!content || content.trim().length === 0) {
      console.warn(`Warning: Empty SVG file: ${filePath}`)

      return null
    }

    return content
  } catch (error) {
    console.warn(`Warning: Could not read SVG file "${filePath}":`, error)

    return null
  }
}

/**
 * 为单个图标生成组件
 * 使用 Gulp 流处理 SVG 转换和格式化
 */
function generateIconComponent(
  iconInfo: IconInfo,
  duplicateHandler: DuplicateNameHandler,
): Promise<void> {
  return new Promise((resolve) => {
    // 获取 filled 变体的路径作为主要源文件
    // 如果没有 filled 变体，使用第一个可用的变体
    const variants = Object.keys(iconInfo.variants) as IconVariant[]
    const primaryVariant = variants.includes('filled') ? 'filled' : variants[0]
    const primaryPath = iconInfo.variants[primaryVariant]!

    // 处理重名
    const originalComponentName = getComponentName(iconInfo.name)
    const finalComponentName = duplicateHandler.handleDuplicateName(
      originalComponentName,
      iconInfo.category,
    )

    // 使用 Gulp 流处理
    src(primaryPath)
      .pipe(
        iconDefinition({
          iconInfo,
          componentName: finalComponentName,
        }),
      )
      .pipe(iconRename(finalComponentName))
      .pipe(prettierFormat())
      .pipe(dest(`src/icons/${iconInfo.category}`))
      .on('end', () => {
        resolve()
      })
      .on('error', (error: Error) => {
        console.error(`Error generating icon ${iconInfo.name}:`, error)
        resolve()
      })
  })
}

/**
 * 主函数：生成所有图标组件
 */
export default async function generateIcons(): Promise<void> {
  console.log('Starting icon generation from Material Design Icons 4.0...')
  console.log(`Source path: ${ICONS_SOURCE_PATH}`)

  // 扫描所有图标
  const allIcons = await scanAllIcons()

  // 创建重名处理器
  const duplicateHandler = new DuplicateNameHandler()

  // 按分类生成图标
  for (const [category, icons] of allIcons) {
    console.log(`Generating ${icons.length} icons for category "${category}"...`)

    for (const iconInfo of icons) {
      await generateIconComponent(iconInfo, duplicateHandler)
    }
  }

  // 输出重名统计
  const duplicateLog = duplicateHandler.getDuplicateLog()

  if (duplicateLog.size > 0) {
    console.log('\nDuplicate icon names detected:')

    for (const [originalName, renamedList] of duplicateLog) {
      console.log(`  ${originalName}: ${renamedList.join(', ')}`)
    }
  }

  console.log('\nIcon generation complete!')
}

// 导出扫描函数供测试使用
export { scanCategory, scanAllIcons, readSVGContent, ICONS_SOURCE_PATH }
