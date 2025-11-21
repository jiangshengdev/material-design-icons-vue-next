import { build } from 'esbuild';
import { transformExportsToIndividual } from '../helpers';

export async function bundleScript(cb: () => void) {
  try {
    // 构建 ESM 格式
    await build({
      entryPoints: ['./src/index.ts'],
      format: 'esm',
      outfile: './dist/index.esm.js',
      sourcemap: 'external',
      bundle: true,
      target: 'es6',
      external: ['vue'],
      jsxFactory: 'vueJsxCompat',
    });

    // 将大型 export 语句转换为独立的 export 语句，以便 Vite 正确识别
    await transformExportsToIndividual('./dist/index.esm.js');

    // 构建 CJS 格式
    await build({
      entryPoints: ['./src/index.ts'],
      format: 'cjs',
      outfile: './dist/index.js',
      sourcemap: 'external',
      bundle: true,
      target: 'es6',
      external: ['vue'],
      jsxFactory: 'vueJsxCompat',
    });

    cb();
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}
