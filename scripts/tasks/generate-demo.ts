import { format, iconCategories, svgSelector } from '../helpers';
import { dest, src } from 'gulp';
import cancat from 'gulp-concat';
import prettierFormat from '../plugins/prettier-format';
import {
  itemDefinition,
  listDefinition,
  listRename,
} from '../plugins/demo-definition';
import {
  indexTemplate,
  panesTemplate,
  paneTemplate,
} from '../templates/demo-template';
import fs from 'fs';
import path from 'path';
import materialDesignIcons from 'material-design-icons';

async function list() {
  const iconPath = materialDesignIcons.STATIC_PATH;

  const processes = iconCategories.map((iconCategory) => {
    return new Promise((resolve) => {
      const svgFullSelector = path.join(iconPath, iconCategory, svgSelector);

      src(svgFullSelector)
        .pipe(itemDefinition(iconCategory))
        .pipe(cancat(`${iconCategory}.tsx`))
        .pipe(listDefinition(iconCategory))
        .pipe(prettierFormat())
        .pipe(listRename())
        .pipe(dest('src/views/icons'))
        .on('end', resolve);
    });
  });

  await Promise.all(processes);
}

async function index() {
  const indexContent = iconCategories
    .map((category) => {
      return indexTemplate(category);
    })
    .join('\n')
    .concat('\n');

  fs.writeFileSync(
    path.join(__dirname, '../../src/views/icons/index.ts'),
    await format(indexContent)
  );
}

async function panes() {
  const panesContent = iconCategories
    .map((iconCategory) => {
      return paneTemplate(iconCategory);
    })
    .join('\n');
  const demo = panesTemplate(panesContent);

  fs.writeFileSync(
    path.join(__dirname, '../../src/views/IconPanes.tsx'),
    await format(demo)
  );
}

export default async function generateDemo() {
  await list();
  await index();
  await panes();
}
