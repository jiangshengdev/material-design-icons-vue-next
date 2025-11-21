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

/**
 * 将 esbuild 生成的大型 export { ... } 语句转换为独立的 export 语句
 * 这样可以确保 Vite 能够正确识别 ESM 格式
 */
export async function transformExportsToIndividual(
  filePath: string
): Promise<void> {
  const content = await fsPromises.readFile(filePath, 'utf-8');

  // 查找 export { ... } 语句的起始位置
  const exportMatch = content.match(/^export\s*\{/m);
  if (!exportMatch || !exportMatch.index) {
    console.log('No export statement found, skipping transformation');
    return;
  }

  const beforeExport = content.substring(0, exportMatch.index);
  const afterExportStart = content.substring(exportMatch.index);

  // 提取 export { ... } 中的所有导出项
  const exportBlockMatch = afterExportStart.match(
    /^export\s*\{([^}]+)\};?\s*$/ms
  );
  if (!exportBlockMatch) {
    console.log('Could not parse export statement, skipping transformation');
    return;
  }

  const exportsContent = exportBlockMatch[1];

  // 将导出项分割成单独的名称
  const exportNames = exportsContent
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  // 生成独立的 export 语句
  const individualExports = exportNames
    .map((name) => `export { ${name} };`)
    .join('\n');

  // 重新组合文件内容
  const newContent = beforeExport + individualExports + '\n';

  // 写回文件
  await fsPromises.writeFile(filePath, newContent, 'utf-8');

  console.log(
    `Transformed ${exportNames.length} exports to individual statements in ${path.basename(filePath)}`
  );
}
