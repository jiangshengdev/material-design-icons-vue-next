# 项目级 AI 指南

- 中文输出：文档、注释、机器人回复统一使用中文。

## 架构与源码布局

- `src/index.ts` 只重新导出 `MDIcon` 与 `src/icons/**` 下的全部图标；这一目录是由 `scripts/tasks` 中的 Gulp 流水线基于本地 `material-design-icons-4.0.0/src` 目录生成的构建产物（每个图标对应一个支持多变体的 Vue 3 TSX 组件）。若需更改组件形态，请修改 `scripts/templates` 中的模板而非直接批量改动生成文件。
- 所有 TSX 都依赖自定义的 `vueJsxCompat` 工厂（`src/vue-jsx-compat.ts`）以及轻量包装组件 `MDIcon`（`src/components/MDIcon.tsx`）。新增组件时务必保留 `vueJsxCompat` 引入并确保 `tsconfig.json` 的 `jsxFactory` 与之匹配。
- `src/views/**/*` 下的演示界面同样通过生成流程得到；`IconPanes.tsx` 将 `src/views/icons` 导出的各分类列表拼接呈现，重新生成图标时可视为一次性产物。

## 构建与生成流程

- 执行 `pnpm run gulp:icon` 会清理 `src/icons`/`playground/views/icons`，将本地 `material-design-icons-4.0.0/src` 目录中的 SVG 转成支持 5 种变体（filled、outlined、round、sharp、twotone）的 TSX 组件（`generate-icons`），并重建分类索引与演示面板（`generate-index`、`generate-demo`）。
- `yarn gulp:style` 负责将 `src/index.css` 级联输出到 `dist/index.css`。`yarn gulp:lib` 会清空 `dist`/`temp`，串行运行 DTS 打包（`rollup-dts.ts`）、API Extractor（`api-extractor.ts` + `api-extractor.json`）以及通过 esbuild 生成的 ESM/CJS 包（`bundle-script.ts`）。`yarn build` 依次执行上述三个 gulp 任务。
- 临时声明文件位于 `temp/`，仅供 API Extractor 使用，不要手工修改。

## 本地开发

- 通过 `yarn dev`（HTTPS 模式的 Vite）预览 `src/App.tsx` 实现的演示站点；演示列表完全来自生成脚本，若图标异常请重新运行 `yarn gulp:icon`。
- 样式仅集中在 `src/index.css` 与 `src/app.css`，`style.ts` 只是简单拼接，不涉及 CSS Modules 或 PostCSS。

## 测试与质量

- 快照测试位于 `tests/icon.test.ts` 及 `tests/__snapshots__`；测试通过 `globby` 动态导入所有图标组件并用 `@vue/test-utils` 挂载。改动模板或 SVG 处理后请运行 `npx jest tests/icon.test.ts`（更新快照使用 `npx jest -u tests/icon.test.ts`）。
- Jest 通过 `jest.config.js` 配置 `ts-jest`，无 Babel 转换，TypeScript 变换需保持与 `ts-jest` 兼容。

## 代码约定

- 生成的图标组件名称来自 `build/helpers.ts` 的 `MDI<Name>` 规则（`MDI` 前缀 + PascalCase），并在 `<MDIcon class="mdi-snake-case-name">` 内嵌套 SVG。自定义模板或插件时务必保持该结构，以保证 `mdi-*` 选择器仍然有效。
- SVG 处理在 `build/plugins/icon-definition.ts` 中完成：强制 `fill="currentColor"`、`width/height=1em`，并移除 `xmlns`。若需新属性，应改动插件而非逐个编辑组件。
- Prettier 配置在 `.prettierrc`，Gulp 通过自定义插件 `prettierFormat` 统一格式化；请使用 `yarn prettier` 而勿手动调格式。

## 外部依赖与注意事项

- 图标源文件位于本地 `material-design-icons-4.0.0/src` 目录，不再依赖 npm 包 `material-design-icons`。
- 类型定义依赖 `@microsoft/api-extractor`；新增导出时务必确保通过 `src/index.ts` 暴露，否则会在 `dist/index.d.ts` 中被丢弃。
- 项目默认使用 Vue 3 运行时 JSX；若想在 `src/icons` 内换用 `<template>` SFC，需要同步调整构建脚本、esbuild 配置与 `tsconfig`。
