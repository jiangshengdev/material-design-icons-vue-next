import generateDemo from './scripts/tasks/generate-demo';
import generateIcons from './scripts/tasks/generate-icons';
import generateIndex from './scripts/tasks/generate-index';
import { cleanSrc } from './scripts/tasks/clean-directories';
import { parallel, series } from 'gulp';

const icon = series(
  cleanSrc,
  generateIcons,
  parallel(generateIndex, generateDemo)
);

export { icon };
