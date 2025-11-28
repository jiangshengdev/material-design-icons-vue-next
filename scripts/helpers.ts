import { camelCase, upperFirst } from 'lodash-es'
import prettier, { Options } from 'prettier'
import path from 'path'
import fs from 'fs'

const fsPromises = fs.promises
const prettierConfigPath = '../.prettierrc.json'

// 图标变体类型定义
export type IconVariant = 'filled' | 'outlined' | 'round' | 'sharp' | 'twotone'

/**
 * 图标信息接口
 */
export interface IconInfo {
  category: string // 图标分类 (action, alert, etc.)
  name: string // 图标名称 (accessibility, 3d_rotation, etc.)
  variants: Partial<Record<IconVariant, string>> // 可用的变体及其 SVG 路径
}

// 目录名到变体类型的映射
export const VARIANT_DIR_MAP: Record<string, IconVariant> = {
  materialicons: 'filled',
  materialiconsoutlined: 'outlined',
  materialiconsround: 'round',
  materialiconssharp: 'sharp',
  materialiconstwotone: 'twotone',
}

// 变体类型到目录名的映射
export const VARIANT_TO_DIR: Record<IconVariant, string> = {
  filled: 'materialicons',
  outlined: 'materialiconsoutlined',
  round: 'materialiconsround',
  sharp: 'materialiconssharp',
  twotone: 'materialiconstwotone',
}

export const iconCategories = [
  'action',
  'alert',
  'av',
  'communication',
  'content',
  'device',
  'editor',
  'file',
  'hardware',
  'home',
  'image',
  'maps',
  'navigation',
  'notification',
  'places',
  'social',
  'toggle',
]

// 4.0 版本的 SVG 路径模式: {variant}/24px.svg
export const svgSelector = '*/24px.svg'

function nameNormalize(name: string) {
  return name.replace(/ic_(.+)(_24px|_26x24px)/, '$1')
}

export function getComponentName(name: string) {
  return 'MDI' + upperFirst(camelCase(nameNormalize(name)))
}

export function getClassName(name: string) {
  return 'mdi-' + nameNormalize(name).replace(/_/g, '-')
}

export function getDisplayName(name: string) {
  return upperFirst(nameNormalize(name).replace(/_/g, ' '))
}

export function getListName(name: string) {
  return `List${upperFirst(name)}`
}

/**
 * 重名检测和处理器
 * 用于处理跨分类的图标重名问题
 */
export class DuplicateNameHandler {
  // 全局组件名称注册表
  private registeredNames: Set<string> = new Set()

  // 记录重名情况：原始名称 -> 分类列表
  private duplicateLog: Map<string, string[]> = new Map()

  /**
   * 检测并处理重名
   * 策略：第一个注册的保留原名，后续重名的添加分类前缀
   * @param componentName 原始组件名称（如 MDIHome）
   * @param category 图标分类（如 action, home）
   * @returns 处理后的组件名称
   */
  handleDuplicateName(componentName: string, category: string): string {
    if (!this.registeredNames.has(componentName)) {
      // 第一次注册，保留原名
      this.registeredNames.add(componentName)

      return componentName
    }

    // 重名情况：添加分类前缀
    // 例如：MDIHome (action) -> MDIHomeHome (home 分类)
    const categoryPrefix = upperFirst(category)
    const newName = componentName.replace('MDI', `MDI${categoryPrefix}`)

    // 记录重名情况
    if (!this.duplicateLog.has(componentName)) {
      this.duplicateLog.set(componentName, [])
    }

    this.duplicateLog.get(componentName)!.push(`${newName} (from ${category})`)

    // 注册新名称
    this.registeredNames.add(newName)

    console.warn(
      `Duplicate icon name detected: ${componentName} -> ${newName} (category: ${category})`,
    )

    return newName
  }

  /**
   * 获取所有重名记录
   */
  getDuplicateLog(): Map<string, string[]> {
    return this.duplicateLog
  }

  /**
   * 检查名称是否已注册
   */
  isRegistered(name: string): boolean {
    return this.registeredNames.has(name)
  }

  /**
   * 重置注册表（用于测试）
   */
  reset(): void {
    this.registeredNames.clear()
    this.duplicateLog.clear()
  }
}

export async function format(content: string, userOptions: Options = { parser: 'typescript' }) {
  const defaultOptionBuffer = await fsPromises.readFile(path.resolve(__dirname, prettierConfigPath))
  const defaultOptions = JSON.parse(defaultOptionBuffer.toString())
  const options = Object.assign({}, defaultOptions, userOptions)

  return await prettier.format(content, options)
}

/**
 * 将 esbuild 生成的大型 export { ... } 语句转换为独立的 export 语句
 * 这样可以确保 Vite 能够正确识别 ESM 格式
 */
export async function transformExportsToIndividual(filePath: string): Promise<void> {
  const content = await fsPromises.readFile(filePath, 'utf-8')

  // 查找 export { ... } 语句的起始位置
  const exportMatch = content.match(/^export\s*\{/m)

  if (!exportMatch || !exportMatch.index) {
    console.log('No export statement found, skipping transformation')

    return
  }

  const beforeExport = content.substring(0, exportMatch.index)
  const afterExportStart = content.substring(exportMatch.index)

  // 提取 export { ... } 中的所有导出项
  // 注意：使用 ms 标志允许跨越多行匹配，[^}]+ 会匹配包括换行符在内的所有非 } 字符
  const exportBlockMatch = afterExportStart.match(/^export\s*\{([^}]+)\};?\s*$/ms)

  if (!exportBlockMatch) {
    console.log('Could not parse export statement, skipping transformation')

    return
  }

  const exportsContent = exportBlockMatch[1]

  // 将导出项分割成单独的名称
  // 注意：这假设导出项都是简单的标识符，没有 'as' 别名或复杂模式
  // split(',') 会按逗号分割，trim() 会移除所有空白字符（包括换行符）
  const exportNames = exportsContent
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name.length > 0)

  // 验证所有导出项都是简单标识符（安全检查）
  const allSimpleIdentifiers = exportNames.every((name) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name))

  if (!allSimpleIdentifiers) {
    console.warn(
      'Warning: Some export names contain complex patterns. Transformation may not be accurate.',
    )
    // 继续处理，但发出警告
  }

  // 生成独立的 export 语句
  const individualExports = exportNames.map((name) => `export { ${name} };`).join('\n')

  // 重新组合文件内容
  const newContent = beforeExport + individualExports + '\n'

  // 写回文件
  await fsPromises.writeFile(filePath, newContent, 'utf-8')

  console.log(
    `Transformed ${exportNames.length} exports to individual statements in ${path.basename(filePath)}`,
  )
}
