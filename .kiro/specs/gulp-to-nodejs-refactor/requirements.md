# Requirements Document

## Introduction

本功能将项目中的 Gulp 构建脚本重构为纯 Node.js 实现。当前项目使用 Gulp 5.x 进行图标组件的生成任务，包括 SVG 转换、Vue 组件生成、索引文件生成和 Demo 页面生成。重构目标是移除 Gulp 及其相关依赖，使用现代 Node.js async/await 模式实现相同功能，提升代码可读性、可调试性和类型安全性。

## Glossary

- **Icon_Generator**: 图标生成系统，负责将 SVG 文件转换为 Vue 组件
- **SVG_Converter**: SVG 转换模块，负责修改 SVG 属性（fill、width、height）
- **Component_Template**: 组件模板生成器，生成 Vue TSX 组件代码
- **Index_Generator**: 索引生成器，生成分类和根级别的导出文件
- **Demo_Generator**: Demo 生成器，生成 playground 展示页面
- **Duplicate_Handler**: 重名处理器，处理跨分类的图标重名问题

## Requirements

### Requirement 1

**User Story:** As a developer, I want to generate icon components using pure Node.js scripts, so that I can maintain the codebase without understanding Gulp stream concepts.

#### Acceptance Criteria

1. WHEN the Icon_Generator processes an SVG file THEN the Icon_Generator SHALL produce a Vue TSX component with identical content to the current Gulp-based output
2. WHEN the Icon_Generator encounters multiple icon variants THEN the Icon_Generator SHALL collect all variants into a single unified component
3. WHEN the Icon_Generator processes all categories THEN the Icon_Generator SHALL generate components in parallel using Promise.all for each category
4. WHEN the Icon_Generator completes THEN the Icon_Generator SHALL output progress logs for each category processed

### Requirement 2

**User Story:** As a developer, I want SVG files to be converted with correct attributes, so that icons render properly in the browser.

#### Acceptance Criteria

1. WHEN the SVG_Converter processes an SVG file THEN the SVG_Converter SHALL set the fill attribute to "currentColor"
2. WHEN the SVG_Converter processes an SVG file THEN the SVG_Converter SHALL set width and height attributes to "1em"
3. WHEN the SVG_Converter processes an SVG file THEN the SVG_Converter SHALL remove the xmlns attribute
4. WHEN the SVG_Converter encounters an empty or invalid SVG file THEN the SVG_Converter SHALL return null and log a warning

### Requirement 3

**User Story:** As a developer, I want generated components to be properly formatted, so that the codebase maintains consistent style.

#### Acceptance Criteria

1. WHEN the Component_Template generates a component THEN the Component_Template SHALL format the output using Prettier with project configuration
2. WHEN the Component_Template generates a component THEN the Component_Template SHALL import createIconComponent from the shared module
3. WHEN the Component_Template generates a component THEN the Component_Template SHALL include only name, iconName, and svgMap fields

### Requirement 4

**User Story:** As a developer, I want index files to be generated automatically, so that all components are properly exported.

#### Acceptance Criteria

1. WHEN the Index_Generator processes a category THEN the Index_Generator SHALL scan the directory for all .tsx component files
2. WHEN the Index_Generator generates a category index THEN the Index_Generator SHALL create named exports for each component
3. WHEN the Index_Generator generates the root index THEN the Index_Generator SHALL re-export all category modules
4. WHEN the Index_Generator completes THEN the Index_Generator SHALL format all generated files using Prettier

### Requirement 5

**User Story:** As a developer, I want demo pages to be generated automatically, so that I can preview all icons in the playground.

#### Acceptance Criteria

1. WHEN the Demo_Generator processes a category THEN the Demo_Generator SHALL create a list component displaying all icons
2. WHEN the Demo_Generator generates the IconPanes component THEN the Demo_Generator SHALL include variant selector functionality
3. WHEN the Demo_Generator completes THEN the Demo_Generator SHALL generate index.ts exporting all list components

### Requirement 6

**User Story:** As a developer, I want duplicate icon names to be handled automatically, so that there are no naming conflicts across categories.

#### Acceptance Criteria

1. WHEN the Duplicate_Handler encounters a new component name THEN the Duplicate_Handler SHALL register and return the original name
2. WHEN the Duplicate_Handler encounters a duplicate name THEN the Duplicate_Handler SHALL append the category prefix and return the modified name
3. WHEN the Duplicate_Handler completes processing THEN the Duplicate_Handler SHALL provide a log of all renamed components

### Requirement 7

**User Story:** As a developer, I want to run the icon generation with a single command, so that the build process is simple and straightforward.

#### Acceptance Criteria

1. WHEN a developer runs the build command THEN the build script SHALL execute clean, generate icons, generate index, and generate demo in sequence
2. WHEN the clean step executes THEN the build script SHALL remove src/icons and playground/views/icons directories
3. WHEN all steps complete successfully THEN the build script SHALL output a success message with timing information
4. IF any step fails THEN the build script SHALL output an error message and exit with non-zero code

### Requirement 8

**User Story:** As a developer, I want to remove Gulp dependencies from the project, so that the dependency footprint is reduced.

#### Acceptance Criteria

1. WHEN the refactoring is complete THEN the package.json SHALL NOT contain gulp, gulp-concat, gulp-rename, or through2 dependencies
2. WHEN the refactoring is complete THEN the package.json SHALL NOT contain @types/gulp, @types/through2, or related type definitions
3. WHEN the refactoring is complete THEN the gulpfile.ts SHALL be removed from the project
4. WHEN the refactoring is complete THEN the scripts/plugins directory SHALL contain only necessary utility modules
