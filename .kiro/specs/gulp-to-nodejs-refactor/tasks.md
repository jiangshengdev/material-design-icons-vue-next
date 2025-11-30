# Implementation Plan

- [x] 1. 安装新依赖并移除旧依赖
  - [x] 1.1 安装新的现代库依赖
    - 安装 tinyglobby, fast-xml-parser, scule, consola, p-map, listr2
    - 运行 `pnpm add -D tinyglobby fast-xml-parser scule consola p-map listr2`
    - _Requirements: 8.1_
  - [x] 1.2 移除 Gulp 相关依赖
    - 移除 gulp, gulp-concat, gulp-concat-css, gulp-rename, through2
    - 移除 cheerio, lodash-es 及其类型定义
    - 运行 `pnpm remove gulp gulp-concat gulp-concat-css gulp-rename through2 cheerio lodash-es @types/gulp @types/gulp-concat @types/gulp-concat-css @types/gulp-rename @types/through2 @types/lodash-es`
    - _Requirements: 8.1, 8.2_

- [x] 2. 重构 helpers.ts - 替换 lodash-es
  - [x] 2.1 使用 scule 替换 lodash-es 的字符串转换函数
    - 将 `import { camelCase, upperFirst } from 'lodash-es'` 替换为 `import { pascalCase, camelCase } from 'scule'`
    - 更新 getComponentName, getClassName, getDisplayName, getListName 函数
    - 更新 DuplicateNameHandler 中的 upperFirst 调用
    - _Requirements: 1.1, 6.2_
  - [x]* 2.2 编写属性测试验证字符串转换
    - **Property 2: Component Output Equivalence** - 验证组件名称转换一致性
    - **Validates: Requirements 1.1, 3.2, 3.3**

- [x] 3. 重构 SVG 转换 - 替换 cheerio
  - [x] 3.1 创建新的 SVG 转换模块使用 fast-xml-parser
    - 在 scripts/utils/svg-converter.ts 创建新模块
    - 实现 convertSvg 函数：设置 fill, width, height，移除 xmlns
    - 处理空文件和无效 SVG 的错误情况
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x]* 3.2 编写属性测试验证 SVG 转换
    - **Property 1: SVG Attribute Transformation**
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [x] 4. 重构 generate-icons.ts - 移除 Gulp 流
  - [x] 4.1 使用 tinyglobby 替换 gulp.src 进行文件扫描
    - 使用 `glob()` 扫描 SVG 文件
    - 保留现有的 scanCategory 和 scanAllIcons 逻辑结构
    - _Requirements: 1.3_
  - [x] 4.2 使用 p-map 实现并发控制的组件生成
    - 替换 Promise.all 为 pMap，设置 concurrency: 10
    - 实现 generateIconComponent 函数（纯 async/await）
    - 集成新的 SVG 转换模块
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 4.3 使用 consola 替换 console.log 进行日志输出
    - 使用 consola.info, consola.warn, consola.success
    - _Requirements: 1.4_
  - [x]* 4.4 编写属性测试验证变体收集
    - **Property 3: Variant Collection Completeness**
    - **Validates: Requirements 1.2**

- [x] 5. Checkpoint - 确保图标生成测试通过
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. 重构 generate-index.ts - 使用 tinyglobby
  - [x] 6.1 使用 tinyglobby 扫描组件文件
    - 替换 fs.readdir 为 glob 模式匹配
    - 保留现有的索引生成逻辑
    - _Requirements: 4.1, 4.2, 4.3_
  - [x]* 6.2 编写属性测试验证索引导出
    - **Property 4: Index Export Completeness**
    - **Validates: Requirements 4.2, 4.3**

- [x] 7. 重构 generate-demo.ts - 移除 Gulp 流
  - [x] 7.1 使用 tinyglobby 和 p-map 重写 demo 生成
    - 移除 gulp.src, gulp-concat, through2 依赖
    - 使用 glob 扫描图标，pMap 并发生成
    - 保留现有的模板生成逻辑
    - _Requirements: 5.1, 5.2, 5.3_
  - [x]* 7.2 编写属性测试验证 Demo 生成
    - **Property 6: Demo List Generation**
    - **Validates: Requirements 5.1, 5.3**

- [x] 8. 创建新入口 build-icons.ts - 使用 listr2
  - [x] 8.1 创建 scripts/build-icons.ts 使用 listr2 编排任务
    - 实现任务列表：clean → generateIcons → (generateIndex || generateDemo)
    - 配置并行执行索引和 Demo 生成
    - 添加错误处理和退出码
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [x] 8.2 更新 package.json 脚本命令
    - 将 `gulp:icon` 改为 `tsx scripts/build-icons.ts`
    - 可选：重命名为 `icons` 或 `generate`
    - _Requirements: 7.1_

- [x] 9. 清理废弃文件
  - [x] 9.1 删除 gulpfile.ts
    - _Requirements: 8.3_
  - [x] 9.2 删除 scripts/plugins 目录中的 Gulp 插件
    - 删除 icon-definition.ts, demo-definition.ts, index-definition.ts, prettier-format.ts
    - _Requirements: 8.4_

- [x] 10. Checkpoint - 确保完整构建流程正常
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. 验证重名处理功能
  - [x]* 11.1 编写属性测试验证重名处理
    - **Property 5: Duplicate Name Handling**
    - **Validates: Requirements 6.1, 6.2, 6.3**

- [x] 12. Final Checkpoint - 运行完整测试套件
  - Ensure all tests pass, ask the user if questions arise.
