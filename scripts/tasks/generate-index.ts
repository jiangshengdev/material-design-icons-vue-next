import path from 'path'
import fs from 'fs'
import { format, iconCategories } from '../helpers'
import { categoriesIndexTemplate, categoryIndexTemplate } from '../templates/index-template'

const fsPromises = fs.promises

/**
 * 扫描分类目录下的所有组件文件，提取组件名称
 * @param categoryPath 分类目录路径
 * @returns 组件名称列表
 */
async function scanCategoryComponents(categoryPath: string): Promise<string[]> {
  const componentNames: string[] = []

  try {
    const files = await fsPromises.readdir(categoryPath)

    for (const file of files) {
      // 只处理 .tsx 文件，排除 index.ts
      if (file.endsWith('.tsx') && file !== 'index.tsx') {
        // 从文件名提取组件名称（去掉 .tsx 后缀）
        const componentName = file.replace('.tsx', '')

        componentNames.push(componentName)
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read category directory: ${categoryPath}`, error)
  }

  // 按字母顺序排序
  return componentNames.sort()
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
      console.warn(`Warning: No components found in category: ${category}`)

      return
    }

    // 生成索引文件内容：只导出组件
    // 注意：IconVariant 类型现在从 src/components/createIconComponent 导出
    const componentExports = componentNames.map((name) => categoryIndexTemplate(name)).join('\n')

    const indexContent = componentExports

    // 格式化并写入文件
    const formattedContent = await format(indexContent)
    const indexPath = path.join(categoryPath, 'index.ts')

    await fsPromises.writeFile(indexPath, formattedContent)

    console.log(`Generated index for ${category}: ${componentNames.length} components`)
  })

  await Promise.all(processes)
}

/**
 * 生成根索引文件
 * 在 src/icons/index.ts 中重新导出所有分类模块
 * 注意：IconVariant 类型现在从 src/components/createIconComponent 导出
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

  console.log(`Generated root index: ${iconCategories.length} categories`)
}

/**
 * 生成所有索引文件
 * 1. 为每个分类生成 index.ts
 * 2. 生成根 src/icons/index.ts
 */
export default async function generateIndex() {
  console.log('Generating index files...')

  // 先生成分类索引
  await generateCategoryIndexFiles()

  // 再生成根索引
  await generateRootIndexFile()

  console.log('Index generation complete!')
}
