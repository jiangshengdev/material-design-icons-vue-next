# 需求文档

## 简介

本文档定义了将 Material Design Icons Vue 组件库从 3.0 版本升级到 4.0 版本的需求。此次升级涉及重大结构变化，需要支持新的图标组织方式——每个图标现在有 5 种样式变体（materialicons、materialiconsoutlined、materialiconsround、materialiconssharp、materialiconstwotone），而不是单一样式。系统需要从本地 `material-design-icons-4.0.0/src` 目录读取 SVG 文件，并为每个图标生成支持多变体的 Vue 3 TSX 组件。

## 术语表

- **图标生成器 (Icon_Generator)**: 基于 Gulp 的构建系统，将 SVG 文件转换为 Vue TSX 组件
- **图标分类 (Icon_Category)**: 图标的分类组（如 action、alert、av、communication、content、device、editor、file、hardware、image、maps、navigation、notification、places、social、toggle）
- **图标变体 (Icon_Variant)**: 每个图标的 5 种样式变化之一：filled（默认填充）、outlined（轮廓）、round（圆角）、sharp（锐角）、twotone（双色）
- **Vue组件 (Vue_Component)**: 使用 `defineComponent` 和 JSX/TSX 语法定义的 Vue 3 组件
- **SVG源文件 (SVG_Source)**: 位于 material-design-icons-4.0.0/src 目录中的源 SVG 文件
- **统一图标组件 (Unified_Icon_Component)**: 一个包含所有 5 种变体的单一 Vue 组件，通过 props 属性切换样式

## 需求

### 需求 1

**用户故事：** 作为开发者，我希望图标生成器能够从新的 4.0 目录结构读取 SVG 文件，以便使用最新的 Material Design Icons。

#### 验收标准

1. WHEN 图标生成器处理图标时 THEN 图标生成器 SHALL 从 `material-design-icons-4.0.0/src/{category}/{icon_name}/{variant}/24px.svg` 路径模式读取 SVG 文件
2. WHEN 图标生成器扫描图标时 THEN 图标生成器 SHALL 发现所有 17 个图标分类目录中的全部图标（包括 4.0 新增的 home 分类）
3. WHEN SVG 文件存在于预期路径时 THEN 图标生成器 SHALL 提取 SVG 内容用于组件生成

### 需求 2

**用户故事：** 作为开发者，我希望每个图标生成一个统一的 Vue 组件，通过 props 属性切换 5 种不同的样式变体，以便简化 API 使用。

#### 验收标准

1. WHEN 图标生成器处理一个图标时 THEN 图标生成器 SHALL 生成一个包含所有可用变体的统一图标组件
2. WHEN 统一图标组件被创建时 THEN 统一图标组件 SHALL 接受一个 `variant` prop 属性，类型为 `'filled' | 'outlined' | 'round' | 'sharp' | 'twotone'`
3. WHEN 统一图标组件的 `variant` prop 未指定时 THEN 统一图标组件 SHALL 默认使用 `'filled'` 变体
4. WHEN 用户设置 `variant` prop 为某个值时 THEN 统一图标组件 SHALL 渲染对应变体的 SVG 内容
5. WHEN 生成统一图标组件时 THEN 图标生成器 SHALL 使用命名约定 `MDI{IconName}`（例如 `MDIAccessibility`）

### 需求 3

**用户故事：** 作为开发者，我希望生成的 Vue 组件保持与之前相同的基础结构，以便使用该库的现有代码保持兼容。

#### 验收标准

1. WHEN 图标生成器创建 Vue组件时 THEN Vue组件 SHALL 使用 Vue 3 的 `defineComponent`
2. WHEN 图标生成器创建 Vue组件时 THEN Vue组件 SHALL 将 SVG 包装在 `MDIcon` 包装组件中
3. WHEN 图标生成器创建 Vue组件时 THEN Vue组件 SHALL 设置 SVG 属性 `fill="currentColor"`、`width="1em"` 和 `height="1em"`
4. WHEN 图标生成器创建 Vue组件时 THEN Vue组件 SHALL 包含遵循模式 `mdi-{icon-name}`（filled）或 `mdi-{icon-name}-{variant}`（其他变体）的 CSS 类名

### 需求 4

**用户故事：** 作为开发者，我希望生成器生成正确的索引文件，以便能够方便地导入图标。

#### 验收标准

1. WHEN 图标生成器完成一个分类的处理时 THEN 图标生成器 SHALL 在每个分类目录中创建导出所有图标组件的 `index.ts` 文件
2. WHEN 图标生成器完成所有处理时 THEN 图标生成器 SHALL 创建重新导出所有分类模块的根 `src/icons/index.ts` 文件
3. WHEN 导出组件时 THEN 图标生成器 SHALL 对每个 Vue组件使用命名导出

### 需求 5

**用户故事：** 作为开发者，我希望生成器能够优雅地处理边缘情况，以便构建过程更加健壮。

#### 验收标准

1. IF 一个图标没有全部 5 种变体可用 THEN 统一图标组件 SHALL 仅包含可用变体的 SVG 内容，并在使用不可用变体时回退到 filled 变体
2. IF SVG 文件格式错误或为空 THEN 图标生成器 SHALL 跳过该变体并记录警告信息
3. WHEN 处理以数字开头的图标名称时 THEN 图标生成器 SHALL 适当地添加组件名称前缀（例如 `3d_rotation` 变为 `MDI3DRotation`）
4. WHEN 不同分类中存在同名图标时 THEN 图标生成器 SHALL 为后续重名图标添加分类前缀以避免命名冲突
4. WHEN 用户传入无效的 variant 值时 THEN 统一图标组件 SHALL 回退到 filled 变体

### 需求 6

**用户故事：** 作为开发者，我希望生成器移除对 npm material-design-icons 包的依赖，以便项目使用本地 4.0 源文件。

#### 验收标准

1. WHEN 图标生成器运行时 THEN 图标生成器 SHALL 使用本地路径 `material-design-icons-4.0.0/src` 作为图标源
2. WHEN 项目构建时 THEN 项目 SHALL 在没有 `material-design-icons` npm 依赖的情况下正常运行

### 需求 7

**用户故事：** 作为开发者，我希望生成的组件被正确格式化，以便代码保持一致性和可读性。

#### 验收标准

1. WHEN 图标生成器输出 Vue组件文件时 THEN 图标生成器 SHALL 使用项目配置的 Prettier 格式化文件
2. WHEN 图标生成器输出索引文件时 THEN 图标生成器 SHALL 使用项目配置的 Prettier 格式化文件

### 需求 8

**用户故事：** 作为开发者，我希望组件提供良好的 TypeScript 类型支持，以便在开发时获得类型提示和检查。

#### 验收标准

1. WHEN 统一图标组件被定义时 THEN 统一图标组件 SHALL 导出 `variant` prop 的类型定义
2. WHEN 用户使用统一图标组件时 THEN TypeScript SHALL 对 `variant` prop 提供自动补全和类型检查

### 需求 9（可选）

**用户故事：** 作为开发者，我希望在 playground 中预览所有图标，以便快速浏览和查找需要的图标。

#### 验收标准

1. WHEN 用户访问 playground 页面时 THEN playground SHALL 按图标分类展示所有可用图标
2. WHEN 展示图标时 THEN playground SHALL 显示图标的名称和可视化预览
3. WHEN 用户切换变体选项时 THEN playground SHALL 更新所有图标显示为对应的变体样式
4. WHEN 用户点击某个分类时 THEN playground SHALL 展示该分类下的所有图标

