import type { HTMLAttributes, SetupContext, VNodeProps } from 'vue'

const MDIconImpl = {
  name: 'MDIcon',
  setup(_prop: object, { slots }: SetupContext) {
    return () => {
      return <span class="md-icon">{slots.default?.()}</span>
    }
  },
}

export const MDIcon = MDIconImpl as unknown as {
  new (): {
    $props: VNodeProps & HTMLAttributes
  }
}
