import { mount } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'
import { globby } from 'globby'
import fs from 'fs'
import path from 'path'

const fsPromises = fs.promises

describe('icon', () => {
  vi.setConfig({ testTimeout: 60 * 1000 })

  test('render', async () => {
    const src = 'src/icons'
    const ext = '.tsx'
    const types = (await fsPromises.readdir(src)).sort()

    for (const type of types) {
      const typePath = path.join(src, type)
      const stats = await fsPromises.stat(typePath)

      if (!stats.isDirectory()) {
        continue
      }

      const files = (
        await globby('*' + ext, {
          cwd: typePath,
        })
      ).sort()

      for (const file of files) {
        const relativePath = path.join('..', typePath, file)
        const imported = await import(relativePath)
        const component = imported[path.basename(file, ext)]
        const wrapper = mount(component)

        expect(wrapper.html()).toMatchSnapshot()
      }
    }
  })
})
