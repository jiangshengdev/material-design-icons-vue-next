# 实现计划

- [x] 1. 更新项目配置和辅助函数
  - [x] 1.1 更新 `scripts/helpers.ts` 中的图标分类列表，添加 `home` 分类
    - 将 `iconCategories` 数组从 16 个更新为 17 个分类
    - _Requirements: 1.2_
  - [x] 1.2 添加变体类型定义和映射常量
    - 创建 `IconVariant` 类型定义
    - 创建 `VARIANT_DIR_MAP` 和 `VARIANT_TO_DIR` 映射
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - [x] 1.3 更新 SVG 选择器路径模式
    - 修改 `svgSelector` 以适配 4.0 目录结构 `{variant}/24px.svg`
    - _Requirements: 1.1_
  - [x] 1.4 添加重名检测和处理函数
    - 实现 `handleDuplicateName` 函数处理跨分类重名
    - _Requirements: 5.3, 5.4_

- [x] 2. 重构图标生成任务
  - [x] 2.1 重写 `scripts/tasks/generate-icons.ts` 以支持新目录结构
    - 扫描 `material-design-icons-4.0.0/src/{category}/{icon_name}/` 目录
    - 收集每个图标的所有可用变体
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 2.2 编写属性测试：路径生成一致性
    - **Property 1: 路径生成一致性**
    - **Validates: Requirements 1.1**
  - [x] 2.3 更新 `scripts/plugins/icon-definition.ts` 中的 SVG 转换逻辑
    - 保持现有的 `fill`, `width`, `height` 属性转换
    - 移除 `xmlns` 属性
    - _Requirements: 3.3_
  - [x] 2.4 编写属性测试：SVG 属性转换
    - **Property 5: SVG 属性转换**
    - **Validates: Requirements 3.3**

- [x] 3. 更新组件模板
  - [x] 3.1 重写 `scripts/templates/icon-template.ts` 生成统一组件
    - 生成包含所有变体的单一组件
    - 添加 `variant` prop 定义
    - 实现变体切换逻辑
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2_
  - [x] 3.2 编写属性测试：组件命名转换一致性
    - **Property 2: 组件命名转换一致性**
    - **Validates: Requirements 2.5, 5.3**
  - [x] 3.3 编写属性测试：CSS 类名生成
    - **Property 6: CSS 类名生成**
    - **Validates: Requirements 3.4**
  - [x] 3.4 添加 CSS 类名生成逻辑
    - filled 变体使用 `mdi-{icon-name}`
    - 其他变体使用 `mdi-{icon-name}-{variant}`
    - _Requirements: 3.4_

- [x] 4. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. 实现组件运行时逻辑
  - [x] 5.1 更新 `src/components/MDIcon.tsx` 如有需要
    - 确保包装组件支持动态类名
    - _Requirements: 3.2_
  - [x] 5.2 编写属性测试：默认变体行为
    - **Property 3: 默认变体行为**
    - **Validates: Requirements 2.3, 5.4**
  - [x] 5.3 编写属性测试：变体切换正确性
    - **Property 4: 变体切换正确性**
    - **Validates: Requirements 2.4**
  - [x] 5.4 编写属性测试：缺失变体回退
    - **Property 8: 缺失变体回退**
    - **Validates: Requirements 5.1**

- [x] 6. 更新索引生成
  - [x] 6.1 更新 `scripts/tasks/generate-index.ts` 适配新组件结构
    - 生成分类索引文件
    - 生成根索引文件
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 6.2 编写属性测试：索引导出完整性
    - **Property 7: 索引导出完整性**
    - **Validates: Requirements 4.1, 4.3**
  - [x] 6.3 导出 `IconVariant` 类型定义
    - 在 `src/index.ts` 中导出类型
    - _Requirements: 8.1_

- [x] 7. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. 移除旧依赖并验证构建
  - [x] 8.1 从 `package.json` 中移除 `material-design-icons` 依赖
    - _Requirements: 6.2_
  - [x] 8.2 更新构建脚本使用本地 4.0 源文件路径
    - 修改 `generate-icons.ts` 使用 `material-design-icons-4.0.0/src`
    - _Requirements: 6.1_
  - [x] 8.3 运行完整构建流程验证
    - 执行 `pnpm run gulp:icon` 生成所有图标
    - 执行 `pnpm run build` 构建项目
    - _Requirements: 6.2, 7.1, 7.2_

- [x] 9. 更新 Playground（可选）
  - [x] 9.1 更新 `scripts/tasks/generate-demo.ts` 支持变体切换
    - 生成支持变体选择的列表组件
    - _Requirements: 9.1, 9.2_
  - [x] 9.2 更新 `scripts/templates/demo-template.ts` 模板
    - 添加变体切换 UI 元素
    - _Requirements: 9.3_
  - [x] 9.3 更新 `playground/views/IconPanes.tsx` 添加全局变体切换
    - 添加变体选择器组件
    - 实现状态管理传递变体到所有图标
    - _Requirements: 9.3, 9.4_
  - [x] 9.4 更新 `playground/app.css` 样式
    - 添加变体选择器样式
    - 优化图标展示布局
    - _Requirements: 9.2_

- [x] 10. Final Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

