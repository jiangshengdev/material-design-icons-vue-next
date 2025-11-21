import { HTMLAttributes, SetupContext, VNodeProps } from 'vue';
import { VueComponentProps } from '../types/vue-component';
import { vueJsxCompat } from '../vue-jsx-compat';

export interface MDIconProps {}

let MDIconImpl = {
  name: 'MDIcon',
  setup(prop: MDIconProps, { slots }: SetupContext) {
    return () => {
      return <span class="md-icon">{slots.default?.()}</span>;
    };
  },
};

export const MDIcon = MDIconImpl as unknown as {
  new (): {
    $props: VNodeProps & MDIconProps & HTMLAttributes & VueComponentProps;
  };
};
