import { defineComponent, type SlotsType } from 'vue'

export const MDIcon = defineComponent(
  (_, { slots, attrs }) => {
    return () => {
      // 合并基础类名 md-icon 与外部传入的类名
      const baseClass = 'md-icon'
      const externalClass = attrs.class as string | undefined
      const combinedClass = externalClass ? `${baseClass} ${externalClass}` : baseClass

      return <span class={combinedClass}>{slots.default?.()}</span>
    }
  },
  {
    name: 'MDIcon',
    // 允许 class 属性透传到组件内部
    inheritAttrs: false,
    slots: Object as SlotsType<{
      default: () => unknown
    }>,
  },
)
