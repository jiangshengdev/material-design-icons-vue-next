import path from 'path';
import { dest, src } from 'gulp';
import materialDesignIcons from 'material-design-icons';
import {
  duplicateDetection,
  iconDefinition,
  iconRename,
} from '../plugins/icon-definition';
import prettierFormat from '../plugins/prettier-format';
import { iconCategories, svgSelector } from '../helpers';

const iconSet = new Set<string>();

function generateIcon(
  file: { path: string | string[] },
  iconCategory: string
): Promise<null> {
  return new Promise((resolve) => {
    src(file.path)
      .pipe(duplicateDetection(iconSet))
      .pipe(iconDefinition())
      .pipe(iconRename())
      .pipe(prettierFormat())
      .pipe(dest(`src/icons/${iconCategory}`))
      .on('end', () => {
        resolve(null);
      });
  });
}

export default async function generateIcons() {
  const iconPath = materialDesignIcons.STATIC_PATH;

  const processes = iconCategories.map((iconCategory) => {
    return new Promise((resolve) => {
      const svgFullSelector = path.join(iconPath, iconCategory, svgSelector);
      const subProcesses: Promise<null>[] = [];

      src(svgFullSelector)
        .on('data', (file) => {
          subProcesses.push(generateIcon(file, iconCategory));
        })
        .on('end', () => {
          Promise.all(subProcesses).then(() => {
            resolve(null);
          });
        });
    });
  });

  await Promise.all(processes);
}
