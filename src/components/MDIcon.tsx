import { defineComponent, type SlotsType } from 'vue'

export const MDIcon = defineComponent(
  (_, { slots }) => {
    return () => <span class="md-icon">{slots.default?.()}</span>
  },
  {
    name: 'MDIcon',
    slots: Object as SlotsType<{
      default: () => unknown
    }>,
  },
)
