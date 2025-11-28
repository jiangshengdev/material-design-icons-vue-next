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
 * @param svgContents 各变体的 SVG 内容映射
 * @param iconName 原始图标名称（用于生成 CSS 类名）
 * @param componentName 组件名称（已处理重名）
 */
export function iconTemplate(
  svgContents: Partial<Record<IconVariant, string>>,
  iconName: string,
  componentName: string,
): string {
  const baseClassName = getClassName(iconName)
  const variants = Object.keys(svgContents) as IconVariant[]

  // 生成 SVG 映射对象
  const svgMapEntries = variants
    .map((variant) => {
      const svg = svgContents[variant]

      return `      ${variant}: () => (${svg})`
    })
    .join(',\n')

  // 确定默认变体（优先使用 filled，否则使用第一个可用变体）
  const defaultVariant = variants.includes('filled') ? 'filled' : variants[0]

  return `import { defineComponent, type PropType, type VNode } from 'vue'
import { MDIcon } from '../../components/MDIcon'

export type IconVariant = 'filled' | 'outlined' | 'round' | 'sharp' | 'twotone'

export const ${componentName} = defineComponent({
  name: '${componentName}',
  props: {
    variant: {
      type: String as PropType<IconVariant>,
      default: '${defaultVariant}',
    },
  },
  setup(props) {
    const svgMap: Partial<Record<IconVariant, () => VNode>> = {
${svgMapEntries}
    }

    const availableVariants: IconVariant[] = [${variants.map((v) => `'${v}'`).join(', ')}]

    return () => {
      // 确定要使用的变体：如果请求的变体不可用，回退到默认变体
      const requestedVariant = props.variant
      const variant = availableVariants.includes(requestedVariant)
        ? requestedVariant
        : '${defaultVariant}'

      // 生成 CSS 类名：filled 使用 mdi-{name}，其他使用 mdi-{name}-{variant}
      const className = variant === 'filled'
        ? '${baseClassName}'
        : \`${baseClassName}-\${variant}\`

      const renderSvg = svgMap[variant]

      return (
        <MDIcon class={className}>
          {renderSvg ? renderSvg() : null}
        </MDIcon>
      )
    }
  },
})
`
}
