import { getClassName, getComponentName } from '../helpers'

export function iconTemplate(svg: string, name: string) {
  const componentName = getComponentName(name)
  const className = getClassName(name)

  return `import type { VNodeProps } from 'vue';
import { MDIcon } from '../../components/MDIcon';

let ${componentName}Impl = {
  name: '${componentName}',
  setup() {
    return () => {
      return (
        <MDIcon class="${className}">
          {() => (${svg})}
        </MDIcon>
      );
    };
  },
};

export const ${componentName} = (${componentName}Impl as unknown) as {
  new (): {
    $props: VNodeProps;
  }
}
`
}
