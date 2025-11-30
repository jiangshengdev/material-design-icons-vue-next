# Requirements Document

## Introduction

本规范描述了对 Material Design Icons Vue 组件代码生成器的重构需求。当前生成器为每个图标生成完整的组件代码，包含大量重复的样板代码（类型定义、props、setup 逻辑等）。重构目标是提取公共代码到共享模块，使每个图标组件只包含其差异化的内容（SVG 数据），从而减少生成代码量、提高可维护性。

## Glossary

- **Icon_Generator**: 将 SVG 源文件转换为 Vue 组件的代码生成系统
- **Icon_Component**: 生成的 Vue 图标组件
- **Icon_Variant**: 图标的视觉变体类型，包括 filled、outlined、round、sharp、twotone
- **SVG_Map**: 存储各变体对应 SVG 内容的数据结构
- **Base_Component**: 包含图标组件公共逻辑的基础组件或工厂函数
- **Icon_Definition**: 每个图标特有的差异化数据（名称、SVG 内容、可用变体等）

## Requirements

### Requirement 1

**User Story:** As a developer, I want to extract common icon component logic into a shared module, so that generated icon files contain only icon-specific data.

#### Acceptance Criteria

1. WHEN the Icon_Generator generates an Icon_Component THEN the Icon_Component SHALL import shared logic from a Base_Component module instead of duplicating the logic inline
2. WHEN the Icon_Generator generates an Icon_Component THEN the Icon_Component SHALL contain only the icon-specific SVG_Map data and component name
3. WHEN the Base_Component module is updated THEN all Icon_Components SHALL reflect the changes without regeneration
4. WHEN an Icon_Component is rendered THEN the Icon_Component SHALL produce identical output to the current implementation

### Requirement 2

**User Story:** As a developer, I want the shared module to handle variant selection and fallback logic, so that this logic is not duplicated across all icon components.

#### Acceptance Criteria

1. WHEN a user specifies a variant prop THEN the Base_Component SHALL select the corresponding SVG from the SVG_Map
2. WHEN a user specifies an unavailable variant THEN the Base_Component SHALL fall back to the default variant (filled if available, otherwise the first available variant)
3. WHEN the Base_Component generates CSS class names THEN the Base_Component SHALL use the pattern "mdi-{icon-name}" for filled variant and "mdi-{icon-name}-{variant}" for other variants

### Requirement 3

**User Story:** As a developer, I want the icon definition format to be minimal and declarative, so that the generated code is easy to read and maintain.

#### Acceptance Criteria

1. WHEN the Icon_Generator creates an Icon_Definition THEN the Icon_Definition SHALL include only the component name, icon name (for CSS class), and SVG_Map
2. WHEN the Icon_Generator creates an Icon_Definition THEN the Icon_Definition SHALL NOT include duplicated type definitions or component logic
3. WHEN the Icon_Definition is serialized THEN the Icon_Definition SHALL be valid TypeScript that can be type-checked

### Requirement 4

**User Story:** As a developer, I want the refactored generator to maintain backward compatibility, so that existing code using the icon components continues to work.

#### Acceptance Criteria

1. WHEN an Icon_Component is imported THEN the Icon_Component SHALL export the same named export as before (e.g., MDIAccessibility)
2. WHEN an Icon_Component receives a variant prop THEN the Icon_Component SHALL accept the same prop types as before
3. WHEN an Icon_Component is rendered THEN the Icon_Component SHALL produce the same DOM structure and CSS classes as before

### Requirement 5

**User Story:** As a developer, I want the generated code size to be significantly reduced, so that the bundle size and repository size are smaller.

#### Acceptance Criteria

1. WHEN the Icon_Generator generates all Icon_Components THEN the total generated code size SHALL be reduced by at least 50% compared to the current implementation
2. WHEN the Icon_Generator generates an Icon_Component THEN the Icon_Component file SHALL contain fewer than 30 lines of code (excluding SVG content)
