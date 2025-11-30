# Design Document

## Overview

本设计采用现代 Node.js 生态的专业库来重构 Gulp 构建脚本，每个任务使用最适合的工具，实现更简洁、更强大、更易维护的代码生成系统。

## Architecture

```
scripts/
├── build-icons.ts          # 入口：使用 listr2 编排任务
├── helpers.ts              # 重构：使用 scule 替代 lodash
├── tasks/
│   ├── clean-directories.ts  # 保留
│   ├── generate-icons.ts     # 重构：tinyglobby + fast-xml-parser + p-map
│   ├── generate-index.ts     # 重构：tinyglobby
│   └── generate-demo.ts      # 重构：tinyglobby + p-map
└── templates/
    ├── icon-template.ts      # 保留
    ├── index-template.ts     # 保留
    └── demo-template.ts      # 保留
```

## Dependencies

### 新增依赖

| 库 | 版本 | 用途 | 包大小 | 选择理由 |
|----|------|------|--------|----------|
| **tinyglobby** | ^0.2.x | 文件扫描 | 15KB | 比 globby 快 2x，体积小 10x |
| **fast-xml-parser** | ^4.x | SVG 解析 | 200KB | 比 cheerio 快 100x，零依赖 |
| **scule** | ^1.x | 字符串转换 | 5KB | 专注 case 转换，类型完善 |
| **consola** | ^3.x | CLI 日志 | 50KB | 美观日志，支持多种级别 |
| **p-map** | ^7.x | 并发控制 | 5KB | 可控并发数，避免资源耗尽 |
| **listr2** | ^8.x | 任务编排 | 200KB | 漂亮的任务列表 UI，支持并行 |

**总新增：约 475KB（压缩后更小）**

### 移除依赖

| 库 | 原用途 |
|----|--------|
| `gulp` | 任务编排 |
| `gulp-concat` | 文件合并 |
| `gulp-concat-css` | CSS 合并 |
| `gulp-rename` | 文件重命名 |
| `through2` | 流转换 |
| `cheerio` | SVG 解析 |
| `lodash-es` | 工具函数 |
| `@types/gulp` | 类型定义 |
| `@types/gulp-concat` | 类型定义 |
| `@types/gulp-concat-css` | 类型定义 |
| `@types/gulp-rename` | 类型定义 |
| `@types/through2` | 类型定义 |
| `@types/lodash-es` | 类型定义 |

**总移除：13 个依赖**

### 依赖变化总结

```diff
devDependencies:
+ "consola": "^3.x"
+ "fast-xml-parser": "^4.x"
+ "listr2": "^8.x"
+ "p-map": "^7.x"
+ "scule": "^1.x"
+ "tinyglobby": "^0.2.x"
- "@types/gulp": "^4.0.18"
- "@types/gulp-concat": "^0.0.37"
- "@types/gulp-concat-css": "^1.0.2"
- "@types/gulp-rename": "^2.0.7"
- "@types/through2": "^2.0.41"
- "@types/lodash-es": "^4.17.12"
- "cheerio": "^1.1.2"
- "gulp": "^5.0.1"
- "gulp-concat": "^2.6.1"
- "gulp-concat-css": "^3.1.0"
- "gulp-rename": "^2.1.0"
- "lodash-es": "^4.17.21"
- "through2": "^4.0.2"
```

**净效果：移除 13 个，新增 6 个，净减少 7 个依赖**

## Components and Interfaces

### 1. 入口脚本 (build-icons.ts)

使用 listr2 编排任务，提供漂亮的进度 UI：

```typescript
import { Listr } from 'listr2'
import consola from 'consola'

const tasks = new Listr([
  {
    title: '🧹 清理目录',
    task: () => cleanSrc()
  },
  {
    title: '🎨 生成图标组件',
    task: () => generateIcons()
  },
  {
    title: '📦 生成索引和 Demo',
    task: (_, task) => task.newListr([
      { title: '生成索引文件', task: () => generateIndex() },
      { title: '生成 Demo 页面', task: () => generateDemo() }
    ], { concurrent: true })
  }
])

await tasks.run()
consola.success('构建完成！')
```

### 2. SVG 转换器

使用 fast-xml-parser 替代 cheerio：

```typescript
import { XMLParser, XMLBuilder } from 'fast-xml-parser'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
})

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
})

async function convertSvg(svgPath: string): Promise<string | null> {
  const xml = await readFile(svgPath, 'utf-8')
  const parsed = parser.parse(xml)
  
  // 修改属性
  parsed.svg['@_fill'] = 'currentColor'
  parsed.svg['@_width'] = '1em'
  parsed.svg['@_height'] = '1em'
  delete parsed.svg['@_xmlns']
  
  return builder.build(parsed)
}
```

### 3. 文件扫描

使用 tinyglobby 替代 gulp.src：

```typescript
import { glob } from 'tinyglobby'

const svgFiles = await glob('material-design-icons-4.0.0/src/**/24px.svg')
```

### 4. 并发控制

使用 p-map 替代 Promise.all，控制并发数：

```typescript
import pMap from 'p-map'

await pMap(icons, async (icon) => {
  await generateIconComponent(icon)
}, { concurrency: 10 })  // 限制并发数，避免文件句柄耗尽
```

### 5. 字符串转换

使用 scule 替代 lodash-es：

```typescript
import { pascalCase, camelCase } from 'scule'

function getComponentName(name: string): string {
  return 'MDI' + pascalCase(name)
}
```

## Data Models

### IconInfo（保留）

```typescript
interface IconInfo {
  category: string
  name: string
  variants: Partial<Record<IconVariant, string>>
}
```

### TaskContext（新增）

```typescript
interface TaskContext {
  iconsGenerated: number
  categoriesProcessed: number
  duplicates: Map<string, string[]>
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: SVG Attribute Transformation

*For any* valid SVG input string, the converted output SHALL contain `fill="currentColor"`, `width="1em"`, `height="1em"`, and SHALL NOT contain `xmlns` attribute.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 2: Component Output Equivalence

*For any* icon name and SVG content map, the generated component code SHALL contain an import from `createIconComponent`, include `name`, `iconName`, and `svgMap` fields, and SHALL NOT contain inline `defineComponent`, `props`, or `setup` definitions.

**Validates: Requirements 1.1, 3.2, 3.3**

### Property 3: Variant Collection Completeness

*For any* icon with multiple variants, the generated component's `svgMap` SHALL contain entries for all provided variants, and each entry SHALL be a function returning the corresponding SVG content.

**Validates: Requirements 1.2**

### Property 4: Index Export Completeness

*For any* list of component names in a category, the generated index file SHALL contain a named export statement for each component name.

**Validates: Requirements 4.2, 4.3**

### Property 5: Duplicate Name Handling

*For any* sequence of component name registrations, the first registration of a name SHALL return the original name, and subsequent registrations of the same name SHALL return a modified name with category prefix.

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 6: Demo List Generation

*For any* category with icons, the generated demo list component SHALL reference all icons in that category using the correct component names.

**Validates: Requirements 5.1, 5.3**

## Error Handling

使用 consola 提供统一的日志输出：

```typescript
import consola from 'consola'

// 信息
consola.info('扫描分类:', category)

// 警告
consola.warn('空 SVG 文件:', svgPath)

// 错误
consola.error('构建失败:', error)

// 成功
consola.success('生成完成:', count, '个组件')
```

## Testing Strategy

### 单元测试

使用 Vitest 进行单元测试：

- `convertSvg()` - 测试 SVG 属性转换（使用 fast-xml-parser）
- `iconTemplate()` - 测试组件代码生成
- `DuplicateNameHandler` - 测试重名处理
- 字符串转换函数 - 测试 scule 集成

### 属性测试

使用 fast-check 进行属性测试，验证 6 个正确性属性：

- 每个属性测试配置 100 次迭代
- 测试文件标注对应的属性编号和需求引用

**测试文件结构：**

```
tests/
├── icon.property.test.ts      # 已有，需更新 SVG 转换测试
├── icon.test.ts               # 已有，快照测试
└── build-scripts.test.ts      # 新增，构建脚本测试
```

### 集成测试

- 运行完整构建流程
- 对比重构前后的生成结果
- 验证 listr2 任务编排正确性
