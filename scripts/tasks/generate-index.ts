import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { glob } from 'tinyglobby'
import consola from 'consola'
import { format, iconCategories, naturalCompare } from '../helpers'
import { categoriesIndexTemplate, categoryIndexTemplate } from '../templates/index-template'

const fsPromises = fs.promises
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 扫描分类目录下的所有组件文件，提取组件名称
 * 使用 tinyglobby 进行文件扫描
 * @param categoryPath 分类目录路径
 * @returns 组件名称列表
 */
async function scanCategoryComponents(categoryPath: string): Promise<string[]> {
  try {
    // 使用 glob 扫描 .tsx 文件，排除 index.tsx
    const files = await glob('*.tsx', {
      cwd: categoryPath,
      ignore: ['index.tsx'],
    })

    // 从文件名提取组件名称（去掉 .tsx 后缀）
    const componentNames = files.map((file) => file.replace('.tsx', ''))

    return componentNames.sort(naturalCompare)
  } catch (error) {
    consola.warn(`无法读取分类目录: ${categoryPath}`, error)

    return []
  }
}

/**
 * 生成分类索引文件
 * 为每个分类目录生成 index.ts，导出该分类下的所有图标组件
 */
async function generateCategoryIndexFiles() {
  const processes = iconCategories.map(async (category) => {
    const categoryPath = path.join(__dirname, '../../src/icons', category)

    // 扫描该分类下的所有组件
    const componentNames = await scanCategoryComponents(categoryPath)

    if (componentNames.length === 0) {
      consola.warn(`分类 ${category} 中没有找到组件`)

      return
    }

    // 生成索引文件内容：只导出组件
    const componentExports = componentNames.map((name) => categoryIndexTemplate(name)).join('\n')

    // 格式化并写入文件
    const formattedContent = await format(componentExports)
    const indexPath = path.join(categoryPath, 'index.ts')

    await fsPromises.writeFile(indexPath, formattedContent)

    consola.info(`生成索引 (${category}): ${componentNames.length} 个组件`)
  })

  await Promise.all(processes)
}

/**
 * 生成根索引文件
 * 在 src/icons/index.ts 中重新导出所有分类模块
 */
async function generateRootIndexFile() {
  // 生成分类导出语句
  const categoryExports = iconCategories
    .map((category) => categoriesIndexTemplate(category))
    .join('\n')

  const indexContent = `${categoryExports}\n`

  // 格式化并写入文件
  const formattedContent = await format(indexContent)
  const indexPath = path.join(__dirname, '../../src/icons/index.ts')

  await fsPromises.writeFile(indexPath, formattedContent)

  consola.info(`生成根索引: ${iconCategories.length} 个分类`)
}

/**
 * 生成所有索引文件
 * 1. 为每个分类生成 index.ts
 * 2. 生成根 src/icons/index.ts
 */
export default async function generateIndex() {
  consola.info('生成索引文件...')

  // 先生成分类索引
  await generateCategoryIndexFiles()

  // 再生成根索引
  await generateRootIndexFile()

  consola.success('索引生成完成!')
}
