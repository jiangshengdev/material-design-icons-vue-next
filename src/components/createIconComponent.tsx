import { defineComponent, type PropType, type VNode } from 'vue'
import { MDIcon } from './MDIcon'

/**
 * 图标变体类型
 */
export type IconVariant = 'filled' | 'outlined' | 'round' | 'sharp' | 'twotone'

/**
 * SVG 内容映射类型
 * 键为变体类型，值为返回 VNode 的函数（延迟渲染以优化性能）
 */
export type SvgMap = Partial<Record<IconVariant, () => VNode>>

/**
 * 图标定义接口
 */
export interface IconDefinition {
  /** Vue 组件名称，如 'MDIAccessibility' */
  name: string
  /** 图标名称，用于生成 CSS 类名，如 'accessibility' */
  iconName: string
  /** 各变体对应的 SVG 渲染函数映射 */
  svgMap: SvgMap
}

/**
 * 创建图标组件的工厂函数
 *
 * @param definition - 图标定义对象
 * @returns Vue 组件
 */
export function createIconComponent(definition: IconDefinition) {
  const { name, iconName, svgMap } = definition
  const availableVariants = Object.keys(svgMap) as IconVariant[]
  const defaultVariant: IconVariant = availableVariants.includes('filled')
    ? 'filled'
    : (availableVariants[0] ?? 'filled')
  const baseClassName = `mdi-${iconName}`

  return defineComponent({
    name,
    props: {
      variant: {
        type: String as PropType<IconVariant>,
        default: defaultVariant,
      },
    },
    setup(props) {
      return () => {
        const requestedVariant = props.variant
        const variant: IconVariant = availableVariants.includes(requestedVariant)
          ? requestedVariant
          : defaultVariant

        const className = variant === 'filled' ? baseClassName : `${baseClassName}-${variant}`

        const renderSvg = svgMap[variant]

        return <MDIcon class={className}>{renderSvg ? renderSvg() : null}</MDIcon>
      }
    },
  })
}
