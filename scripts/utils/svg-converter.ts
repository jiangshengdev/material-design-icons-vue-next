import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import fs from 'fs'
import consola from 'consola'

const fsPromises = fs.promises

// fast-xml-parser 配置
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  preserveOrder: true,
}

const builderOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  preserveOrder: true,
  suppressEmptyNode: true,
}

const parser = new XMLParser(parserOptions)
const builder = new XMLBuilder(builderOptions)

/**
 * 转换 SVG 内容，设置正确的属性
 * - 设置 fill="currentColor"
 * - 设置 width="1em"
 * - 设置 height="1em"
 * - 移除 xmlns 属性
 */
export function convertSvg(xml: string): string | null {
  if (!xml || xml.trim().length === 0) {
    return null
  }

  try {
    const parsed = parser.parse(xml)

    // 查找 svg 元素并修改属性
    for (const node of parsed) {
      if (node.svg) {
        // 获取或创建属性对象
        const attrs = node[':@'] || {}

        // 设置新属性
        attrs['@_fill'] = 'currentColor'
        attrs['@_width'] = '1em'
        attrs['@_height'] = '1em'

        // 移除 xmlns 属性
        delete attrs['@_xmlns']

        // 更新属性
        node[':@'] = attrs

        break
      }
    }

    return builder.build(parsed)
  } catch (error) {
    consola.warn('SVG 解析失败:', error)

    return null
  }
}

/**
 * 读取并转换指定路径的 SVG 文件
 */
export async function readAndConvertSvg(svgPath: string): Promise<string | null> {
  try {
    const content = await fsPromises.readFile(svgPath, 'utf-8')

    if (!content || content.trim().length === 0) {
      consola.warn(`空 SVG 文件: ${svgPath}`)

      return null
    }

    const converted = convertSvg(content)

    if (!converted) {
      consola.warn(`无效 SVG 文件: ${svgPath}`)

      return null
    }

    return converted
  } catch (error) {
    consola.warn(`无法读取 SVG 文件 "${svgPath}":`, error)

    return null
  }
}
