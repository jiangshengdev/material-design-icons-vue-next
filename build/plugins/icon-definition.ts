import type { Page } from 'playwright';
import through2 from 'through2';
import { iconTemplate } from '../templates/icon-template';
import { getComponentName } from '../helpers';
import rename from 'gulp-rename';

async function svgConvert(page: Page, xml: string): Promise<string> {
  return await page.evaluate((xml) => {
    const wrap = document.createElement('div');
    wrap.innerHTML = xml;
    const svg = wrap.querySelector('svg');

    svg?.setAttribute('fill', 'currentColor');
    svg?.setAttribute('width', '1em');
    svg?.setAttribute('height', '1em');
    svg?.removeAttribute('xmlns');

    return wrap.innerHTML;
  }, xml);
}

export function iconDefinition(page: Page) {
  return through2.obj(async (chunk, enc, callback) => {
    const fileName = chunk.stem;
    const xml = chunk.contents.toString(enc);
    const inlineXML = await svgConvert(page, xml);
    const vueComponent = iconTemplate(inlineXML, fileName);
    chunk.contents = Buffer.from(vueComponent);
    callback(null, chunk);
  });
}

export function duplicateDetection(iconSet: Set<string>) {
  return through2.obj(function (chunk, enc, callback) {
    const fileName = chunk.stem;
    const componentName = getComponentName(fileName);

    if (iconSet.has(componentName)) {
      console.log(`Duplicate: ${componentName}`);
      this.emit('end');

      return;
    }

    iconSet.add(componentName);
    callback(null, chunk);
  });
}

export function iconRename() {
  return rename((p: rename.ParsedPath) => {
    const baseName = p.basename;

    if (!baseName) {
      return;
    }

    const componentName = `${getComponentName(baseName)}`;

    return {
      dirname: '/',
      basename: componentName,
      extname: '.tsx',
    };
  });
}
