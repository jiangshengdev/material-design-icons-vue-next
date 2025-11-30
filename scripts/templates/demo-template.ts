import { getComponentName, getDisplayName, getListName } from '../helpers'
import { upperFirst } from 'scule'

export function itemTemplate(_category: string, fileName: string) {
  const componentName = getComponentName(fileName)

  return `<li>
  <MDI.${componentName} variant={props.variant} />
  <span class="icon-name">${getDisplayName(fileName)}</span>
</li>`
}

export function listTemplate(category: string, items: string) {
  const listName = getListName(category)

  return `import { defineComponent, type PropType } from 'vue';
import * as MDI from '@/index';
import type { IconVariant } from '@/index';

export default defineComponent({
  name: '${listName}',
  props: {
    variant: {
      type: String as PropType<IconVariant>,
      default: 'filled',
    },
  },
  setup(props) {
    return () => (<div class="icon-pane">
  <div class="icon-category">${upperFirst(category)}</div>
  <ul>${items}</ul>
</div>);
  },
});
`
}

export function indexTemplate(category: string) {
  const listName = getListName(category)

  return `import ${listName} from './${listName}';
export { ${listName} };
`
}

export function paneTemplate(category: string) {
  const listName = getListName(category)

  return `<panes.${listName} variant={variant.value} />`
}

export function panesTemplate(content: string) {
  return `import { defineComponent, ref } from 'vue';
import * as panes from './icons';
import type { IconVariant } from '@/index';

const VARIANTS: IconVariant[] = ['filled', 'outlined', 'round', 'sharp', 'twotone'];

export default defineComponent({
  name: 'IconPanes',
  setup() {
    const variant = ref<IconVariant>('filled');

    const handleVariantChange = (newVariant: IconVariant) => {
      variant.value = newVariant;
    };

    return () => (
      <div class="icon-panes">
        <div class="variant-selector">
          <span class="variant-label">变体样式：</span>
          <div class="variant-buttons">
            {VARIANTS.map((v) => (
              <button
                key={v}
                class={['variant-btn', { active: variant.value === v }]}
                onClick={() => handleVariantChange(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div class="icon-content">
          ${content}
        </div>
      </div>
    );
  },
});
`
}
