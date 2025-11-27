import { load } from 'cheerio';
import through2 from 'through2';
import { iconTemplate } from '../templates/icon-template';
import { getComponentName } from '../helpers';
import rename from 'gulp-rename';

async function svgConvert(xml: string): Promise<string> {
  const $ = load(xml, { xmlMode: true });
  const svg = $('svg').first();

  if (svg.length) {
    svg.attr('fill', 'currentColor');
    svg.attr('width', '1em');
    svg.attr('height', '1em');
    svg.removeAttr('xmlns');
  }

  return $.root().html() ?? '';
}

export function iconDefinition() {
  return through2.obj(async (chunk, enc, callback) => {
    const fileName = chunk.stem;
    const xml = chunk.contents.toString(enc);
    const inlineXML = await svgConvert(xml);
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
