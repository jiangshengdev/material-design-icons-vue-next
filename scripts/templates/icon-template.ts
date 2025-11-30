import { getClassName, IconVariant } from '../helpers'

/**
 * 生成 CSS 类名
 * - filled 变体使用 `mdi-{icon-name}`
 * - 其他变体使用 `mdi-{icon-name}-{variant}`
 * @param iconName 原始图标名称
 * @param variant 图标变体
 */
export function getCssClassName(iconName: string, variant: IconVariant): string {
  const baseClassName = getClassName(iconName)

  return variant === 'filled' ? baseClassName : `${baseClassName}-${variant}`
}

/**
 * 生成支持多变体的统一图标组件模板
 * 使用 createIconComponent 工厂函数，生成最小化的图标组件
 *
 * @param svgContents 各变体的 SVG 内容映射
 * @param iconName 原始图标名称（用于生成 CSS 类名）
 * @param componentName 组件名称（已处理重名）
 */
export function iconTemplate(
  svgContents: Partial<Record<IconVariant, string>>,
  iconName: string,
  componentName: string,
): string {
  const variants = Object.keys(svgContents) as IconVariant[]

  // 生成 SVG 映射对象条目
  const svgMapEntries = variants
    .map((variant) => {
      const svg = svgContents[variant]

      return `    ${variant}: () => (${svg})`
    })
    .join(',\n')

  // 从 iconName 提取用于 CSS 类名的名称（不带 mdi- 前缀）
  // getClassName 返回 'mdi-xxx'，我们需要 'xxx' 部分
  const cssIconName = getClassName(iconName).replace(/^mdi-/, '')

  return `import { createIconComponent } from '../../components/createIconComponent'

export const ${componentName} = createIconComponent({
  name: '${componentName}',
  iconName: '${cssIconName}',
  svgMap: {
${svgMapEntries}
  },
})
`
}
