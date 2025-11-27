import generateDemo from './build/tasks/generate-demo';
import generateIcons from './build/tasks/generate-icons';
import generateIndex from './build/tasks/generate-index';
import { cleanSrc } from './build/tasks/clean-directories';
import { parallel, series } from 'gulp';

const icon = series(
  cleanSrc,
  generateIcons,
  parallel(generateIndex, generateDemo)
);

export { icon };
