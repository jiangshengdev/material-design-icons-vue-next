import { load } from 'cheerio'
import through2 from 'through2'
import fs from 'fs'
import { iconTemplate } from '../templates/icon-template'
import { IconVariant, IconInfo } from '../helpers'
import rename from 'gulp-rename'

const fsPromises = fs.promises

/**
 * 转换 SVG 内容，设置正确的属性
 * - 设置 fill="currentColor"
 * - 设置 width="1em"
 * - 设置 height="1em"
 * - 移除 xmlns 属性
 */
export async function svgConvert(xml: string): Promise<string> {
  const $ = load(xml, { xmlMode: true })
  const svg = $('svg').first()

  if (svg.length) {
    svg.attr('fill', 'currentColor')
    svg.attr('width', '1em')
    svg.attr('height', '1em')
    svg.removeAttr('xmlns')
  }

  return $.root().html() ?? ''
}

/**
 * 读取并转换指定变体的 SVG 内容
 */
async function readAndConvertSVG(svgPath: string): Promise<string | null> {
  try {
    const content = await fsPromises.readFile(svgPath, 'utf-8')

    if (!content || content.trim().length === 0) {
      console.warn(`Warning: Empty SVG file: ${svgPath}`)

      return null
    }

    return await svgConvert(content)
  } catch (error) {
    console.warn(`Warning: Could not read SVG file "${svgPath}":`, error)

    return null
  }
}

/**
 * 收集图标的所有变体 SVG 内容
 */
async function collectVariantSVGs(
  iconInfo: IconInfo,
): Promise<Partial<Record<IconVariant, string>>> {
  const svgContents: Partial<Record<IconVariant, string>> = {}

  for (const [variant, svgPath] of Object.entries(iconInfo.variants)) {
    const content = await readAndConvertSVG(svgPath as string)

    if (content) {
      svgContents[variant as IconVariant] = content
    }
  }

  return svgContents
}

interface IconDefinitionOptions {
  iconInfo: IconInfo
  componentName: string
}

/**
 * Gulp 插件：将 SVG 转换为 Vue 组件
 * 支持多变体的统一组件生成
 */
export function iconDefinition(options: IconDefinitionOptions) {
  const { iconInfo, componentName } = options

  return through2.obj(async (chunk, enc, callback) => {
    try {
      // 收集所有变体的 SVG 内容
      const svgContents = await collectVariantSVGs(iconInfo)

      if (Object.keys(svgContents).length === 0) {
        console.warn(`Warning: No valid SVG content for icon "${iconInfo.name}"`)
        callback()

        return
      }

      // 生成 Vue 组件
      const vueComponent = iconTemplate(svgContents, iconInfo.name, componentName)

      chunk.contents = Buffer.from(vueComponent)
      callback(null, chunk)
    } catch (error) {
      console.error(`Error processing icon "${iconInfo.name}":`, error)
      callback()
    }
  })
}

/**
 * Gulp 插件：重命名文件为组件名称
 */
export function iconRename(componentName: string) {
  return rename((_p: rename.ParsedPath) => {
    return {
      dirname: '/',
      basename: componentName,
      extname: '.tsx',
    }
  })
}

/**
 * 旧版兼容：重复检测插件（已废弃，使用 DuplicateNameHandler 替代）
 * @deprecated 使用 DuplicateNameHandler 类替代
 */
export function duplicateDetection(_iconSet: Set<string>) {
  return through2.obj(function (chunk, _enc, callback) {
    // 保留旧接口以兼容，但实际重名处理已移至 DuplicateNameHandler
    callback(null, chunk)
  })
}
