import { getClassName, getComponentName } from '../helpers'

export function iconTemplate(svg: string, name: string) {
  const componentName = getComponentName(name)
  const className = getClassName(name)

  return `import { defineComponent } from 'vue'
import { MDIcon } from '../../components/MDIcon'

export const ${componentName} = defineComponent(
  () => {
    return () => (
      <MDIcon class="${className}">
        {() => (${svg})}
      </MDIcon>
    )
  },
  {
    name: '${componentName}',
  }
)
`
}
