import { camelCase, upperFirst } from 'lodash';
import prettier, { Options } from 'prettier';
import path from 'path';
import fs from 'fs';

const fsPromises = fs.promises;
const prettierConfigPath = '../.prettierrc';

export const iconCategories = [
  'action',
  'alert',
  'av',
  'communication',
  'content',
  'device',
  'editor',
  'file',
  'hardware',
  'image',
  'maps',
  'navigation',
  'notification',
  'places',
  'social',
  'toggle',
];

export const svgSelector = 'svg/production/**{_24px,_26x24px}.svg';

function nameNormalize(name: string) {
  return name.replace(/ic_(.+)(_24px|_26x24px)/, '$1');
}

export function getComponentName(name: string) {
  return 'MDI' + upperFirst(camelCase(nameNormalize(name)));
}

export function getClassName(name: string) {
  return 'mdi-' + nameNormalize(name).replace(/_/g, '-');
}

export function getDisplayName(name: string) {
  return upperFirst(nameNormalize(name).replace(/_/g, ' '));
}

export function getListName(name: string) {
  return `List${upperFirst(name)}`;
}

export async function format(
  content: string,
  userOptions: Options = { parser: 'typescript' }
) {
  const defaultOptionBuffer = await fsPromises.readFile(
    path.resolve(__dirname, prettierConfigPath)
  );
  const defaultOptions = JSON.parse(defaultOptionBuffer.toString());
  const options = Object.assign({}, defaultOptions, userOptions);
  return await prettier.format(content, options);
}
