import { pascalCase, upperFirst } from 'scule'
import prettier, { type Options } from 'prettier'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const fsPromises = fs.promises
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
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
function nameNormalize(name: string) {
  return name.replace(/ic_(.+)(_24px|_26x24px)/, '$1')
}

export function getComponentName(name: string) {
  return 'MDI' + pascalCase(nameNormalize(name))
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
