import { mount } from '@vue/test-utils';
import globby from 'globby';
import fs from 'fs';
import path from 'path';

const fsPromises = fs.promises;

describe('icon', () => {
  jest.setTimeout(60 * 1000);

  test('render', async () => {
    let src = 'src/icons';
    let ext = '.tsx';
    let types = (await fsPromises.readdir(src)).sort();

    for (const type of types) {
      let typePath = path.join(src, type);
      let stats = await fsPromises.stat(typePath);

      if (!stats.isDirectory()) {
        continue;
      }

      let files = (
        await globby('*' + ext, {
          cwd: typePath,
        })
      ).sort();

      for (const file of files) {
        let relativePath = path.join('..', typePath, file);
        let imported = await import(relativePath);
        let component = imported[path.basename(file, ext)];
        let wrapper = mount(component);
        expect(wrapper.html()).toMatchSnapshot();
      }
    }
  });
});
