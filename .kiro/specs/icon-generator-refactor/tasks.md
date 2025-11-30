# Implementation Plan

- [x] 1. Create the shared icon component factory
  - [x] 1.1 Create `createIconComponent` factory function in `src/components/createIconComponent.tsx`
    - Export `IconVariant` type, `SvgMap` type, and `IconDefinition` interface
    - Implement factory function with variant selection, fallback logic, and CSS class generation
    - _Requirements: 1.1, 2.1, 2.2, 2.3_
  - [x]* 1.2 Write property test for variant selection (Property 4)
    - **Property 4: Valid variant selection**
    - **Validates: Requirements 2.1**
  - [x]* 1.3 Write property test for invalid variant fallback (Property 5)
    - **Property 5: Invalid variant fallback**
    - **Validates: Requirements 2.2**
  - [x]* 1.4 Write property test for CSS class name pattern (Property 6)
    - **Property 6: CSS class name pattern**
    - **Validates: Requirements 2.3**

- [x] 2. Update the icon template generator
  - [x] 2.1 Refactor `scripts/templates/icon-template.ts` to generate minimal icon components
    - Generate import statement for `createIconComponent`
    - Generate `createIconComponent` call with `name`, `iconName`, and `svgMap`
    - Remove inline type definitions and component logic
    - _Requirements: 1.2, 3.1, 3.2_
  - [x]* 2.2 Write property test for generated file structure (Property 1 & 2)
    - **Property 1: Generated files use shared imports without duplicated logic**
    - **Property 2: Generated files contain only minimal icon-specific data**
    - **Validates: Requirements 1.1, 1.2, 3.1, 3.2**
  - [x]* 2.3 Write property test for generated file line count (Property 8)
    - **Property 8: Generated file line count**
    - **Validates: Requirements 5.2**

- [x] 3. Update exports and ensure backward compatibility
  - [x] 3.1 Update `src/components/index.ts` to export `createIconComponent` and related types
    - Export `IconVariant`, `SvgMap`, `IconDefinition`, and `createIconComponent`
    - _Requirements: 4.1, 4.2_
  - [x]* 3.2 Write property test for export name consistency (Property 7)
    - **Property 7: Export name consistency**
    - **Validates: Requirements 4.1**

- [x] 4. Regenerate all icon components
  - [x] 4.1 Run the icon generator to regenerate all icon components with the new template
    - Execute `pnpm generate:icons` or equivalent command
    - Verify all icons are generated successfully
    - _Requirements: 1.1, 1.2, 3.1_
  - [x]* 4.2 Write property test for render output equivalence (Property 3)
    - **Property 3: Render output equivalence**
    - **Validates: Requirements 1.4, 4.3**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Verify code size reduction
  - [x] 6.1 Measure and compare total generated code size before and after refactoring
    - Calculate total file size of `src/icons/**/*.tsx`
    - Verify at least 50% reduction in code size
    - _Requirements: 5.1_

- [x] 7. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
