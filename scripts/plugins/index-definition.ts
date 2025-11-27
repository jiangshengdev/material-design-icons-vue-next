import through2 from 'through2';
import { categoryIndexTemplate } from '../templates/index-template';

export function indexDefinition() {
  return through2.obj(async (chunk, enc, callback) => {
    const fileName = chunk.stem;

    chunk.contents = Buffer.from(categoryIndexTemplate(fileName));
    callback(null, chunk);
  });
}
