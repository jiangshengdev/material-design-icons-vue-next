# Copilot 指南

## 通用规则

- 中文输出：文档、注释、机器人回复统一使用中文。

## 架构

- 包入口 `src/index.ts` 会再次导出 `src/components` 内的工厂函数以及 `src/icons` 下的全部生成图标，所以把每个图标文件视为基于 `createIconComponent` 与 `MDIcon` 的数据声明即可。
- `createIconComponent`（`src/components/createIconComponent.tsx`）统一处理变体选择、CSS 类名和 `md-icon` 包装；单个图标文件只保留 name、iconName、svgMap 这些声明式字段。
- 源 SVG 位于 `material-design-icons-4.0.0/src/{category}/{icon}/{variant}/24px.svg`，生成脚本直接读取；更新素材时务必保持该目录结构不变。
- `playground/` 下的演示使用生成的 `playground/views/IconPanes.tsx`，通过 `@` 别名加载发布包，若需 UI 调整应改 `scripts/templates` 中的模板再重新生成。

## 图标生成流程

- 当 SVG、模板或辅助函数变动时运行 `pnpm icons`（参见 `scripts/build-icons.ts`）；该命令会清理 `src/icons` 与 `playground/views/icons`，重建组件、分类索引、根索引以及 Demo 面板。
- `scripts/tasks/generate-icons.ts` 负责按分类与变体扫描、调用 `DuplicateNameHandler` 处理重名、用 `scripts/utils/svg-converter.ts` 规范化 SVG，并通过 `icon-template` 生成 PascalCase 的 `MDI*` 组件；禁止手动修改 `src/icons/**`。
- `scripts/tasks/generate-index.ts` 和 `scripts/tasks/generate-demo.ts` 都依赖 `scripts/helpers.ts` 的 `iconCategories`；新增 Material 类别时必须同步扩展此列表以保持导出和 Demo 一致。
- 生成器统一调用 `scripts/helpers.format`，该函数读取 `.prettierrc.json`；若发现格式异常，应修正配置而不是事后手动格式化。

## 构建与工具

- 库构建通过 `tsdown`（`tsdown.config.ts`，启用 `fromVite: true` 复用 Vite 解析）；用 `pnpm build` 产出 `dist/`，用 `pnpm dev` 进入监视模式。
- Playground 与库开发分离：`pnpm play` 仅运行 `playground` 的 Vite 开发服，`pnpm play:build` 先执行 `pnpm type-check` 再 `vite build`（借助 run-parallel）。
- `pnpm prepublishOnly` 已串联 `icons` 与 `build`，发布流程依赖其幂等性，谨慎改动。
- Lint 先跑 `oxlint`（`-D correctness`），再跑 ESLint（`pnpm lint`）；优先修复 oxlint 报错，后者默认信任其自动修复。

## 测试与质量

- 单测/性质测试位于 `src/components/__tests__`；`pnpm test:unit` 会用 Vitest + fast-check 并动态导入所有图标进行快照，所以用 `vitest run src/components/__tests__/icon.property.test.ts -t "..."` 限定范围可节省时间。
- `e2e/vue.spec.ts` 倚赖 playground 服务器；`pnpm test:e2e` 在本地启动 `pnpm play`，CI 则根据 `playwright.config.ts` 先跑 `pnpm preview`，在 CI 手动运行时需先构建。
- 只有在重新生成图标后才能更新快照，否则 `src/components/__tests__/__snapshots__/icon.test.ts.snap` 会与 `src/icons/**` 不一致。

## 代码约定

- 图标组件名统一以 `MDI` 开头，使用 `getComponentName` 生成的 PascalCase；跨分类重名由 `DuplicateNameHandler` 添加分类前缀，新增工具函数要遵循此逻辑。
- CSS 类名遵循 `mdi-{kebab}`（filled）或 `mdi-{kebab}-{variant}`；`MDIcon` 已添加 `md-icon`，若需要额外包装请在其基础上扩展而非覆盖。
- `scripts/templates/*.ts` 是生成代码与 Demo 标记的唯一真相源；修改组件结构先改模板再执行 `pnpm icons`。
- 除生成脚本（运行在 Node 环境需相对路径）外都使用指向 `src/` 的 `@` 别名；两者混用会破坏 tsdown 和 Vitest 的引用解析。
