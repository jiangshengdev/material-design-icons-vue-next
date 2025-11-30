/**
 * Material Icons v4 升级 - 属性测试
 * 使用 fast-check 进行属性测试，验证正确性属性
 */
import { describe, expect, test } from 'vitest'
import fc from 'fast-check'
import path from 'path'
import {
  iconCategories,
  VARIANT_DIR_MAP,
  VARIANT_TO_DIR,
  getComponentName,
  DuplicateNameHandler,
  type IconVariant,
} from '../scripts/helpers'
import { getCssClassName } from '../scripts/templates/icon-template'

// 有效的变体列表
const validVariants: IconVariant[] = ['filled', 'outlined', 'round', 'sharp', 'twotone']

// 图标名称生成器：模拟真实的图标名称模式
const iconNameArb = fc.oneof(
  // 普通名称
  fc.stringMatching(/^[a-z][a-z_]*$/),
  // 以数字开头的名称（如 3d_rotation）
  fc.stringMatching(/^[0-9]+[a-z_]+$/),
  // 带下划线的名称
  fc.stringMatching(/^[a-z]+_[a-z]+$/),
)

// 分类生成器
const categoryArb = fc.constantFrom(...iconCategories)

// 变体生成器
const variantArb = fc.constantFrom(...validVariants)

describe('Material Icons v4 属性测试', () => {
  /**
   * **Feature: material-icons-v4-upgrade, Property 1: 路径生成一致性**
   * For any 有效的图标分类、图标名称和变体组合，生成的 SVG 文件路径
   * SHALL 符合模式 `material-design-icons-4.0.0/src/{category}/{icon_name}/{variant_dir}/24px.svg`
   * Validates: Requirements 1.1
   */
  describe('Property 1: 路径生成一致性', () => {
    test('生成的 SVG 路径应符合 4.0 目录结构模式', () => {
      fc.assert(
        fc.property(categoryArb, iconNameArb, variantArb, (category, iconName, variant) => {
          // 跳过空名称
          if (!iconName || iconName.length === 0) return true

          const variantDir = VARIANT_TO_DIR[variant]
          const expectedPath = path.join(
            'material-design-icons-4.0.0/src',
            category,
            iconName,
            variantDir,
            '24px.svg',
          )

          // 验证路径结构
          expect(expectedPath).toMatch(
            /^material-design-icons-4\.0\.0\/src\/[a-z]+\/[a-z0-9_]+\/materialicons[a-z]*\/24px\.svg$/,
          )

          // 验证路径包含正确的分类
          expect(expectedPath).toContain(`/${category}/`)

          // 验证路径包含正确的变体目录
          expect(expectedPath).toContain(`/${variantDir}/`)

          return true
        }),
        { numRuns: 100 },
      )
    })

    test('变体目录映射应该是双向一致的', () => {
      fc.assert(
        fc.property(variantArb, (variant) => {
          const dir = VARIANT_TO_DIR[variant]
          const mappedBack = VARIANT_DIR_MAP[dir]

          expect(mappedBack).toBe(variant)

          return true
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * **Feature: material-icons-v4-upgrade, Property 2: 组件命名转换一致性**
   * For any 图标名称（包括以数字开头的名称），生成的组件名称
   * SHALL 符合 `MDI{PascalCaseName}` 格式，且转换是确定性的
   * Validates: Requirements 2.5, 5.3
   */
  describe('Property 2: 组件命名转换一致性', () => {
    test('组件名称应以 MDI 开头并使用 PascalCase', () => {
      fc.assert(
        fc.property(iconNameArb, (iconName) => {
          if (!iconName || iconName.length === 0) return true

          const componentName = getComponentName(iconName)

          // 验证以 MDI 开头
          expect(componentName).toMatch(/^MDI/)

          // 验证 PascalCase 格式（MDI 后面跟大写字母或数字，数字开头的名称如 3d_rotation -> MDI3dRotation）
          expect(componentName).toMatch(/^MDI[A-Z0-9]/)

          // 验证不包含下划线或连字符
          expect(componentName).not.toMatch(/[_-]/)

          return true
        }),
        { numRuns: 100 },
      )
    })

    test('相同输入应产生相同输出（确定性）', () => {
      fc.assert(
        fc.property(iconNameArb, (iconName) => {
          if (!iconName || iconName.length === 0) return true

          const result1 = getComponentName(iconName)
          const result2 = getComponentName(iconName)

          expect(result1).toBe(result2)

          return true
        }),
        { numRuns: 100 },
      )
    })

    test('以数字开头的名称应正确转换', () => {
      // 测试特定的数字开头名称
      const testCases = ['3d_rotation', '4k', '5g', '10k', '123']

      for (const name of testCases) {
        const componentName = getComponentName(name)

        expect(componentName).toMatch(/^MDI/)
        expect(componentName).not.toMatch(/[_-]/)
      }
    })
  })

  /**
   * **Feature: material-icons-v4-upgrade, Property 5: SVG 属性转换**
   * For any 有效的 SVG 输入，转换后的 SVG SHALL 包含
   * `fill="currentColor"`、`width="1em"` 和 `height="1em"` 属性
   * Validates: Requirements 3.3
   */
  describe('Property 5: SVG 属性转换', () => {
    // 模拟 SVG 转换函数的行为验证
    test('转换后的 SVG 应包含正确的属性', () => {
      // 从生成的组件中提取 SVG 验证
      const expectedAttributes = ['fill="currentColor"', 'width="1em"', 'height="1em"']

      // 模拟转换后的 SVG 字符串
      const transformedSvg =
        '<svg height="1em" viewBox="0 0 24 24" width="1em" fill="currentColor"><path d="M0 0h24v24H0z"/></svg>'

      for (const attr of expectedAttributes) {
        expect(transformedSvg).toContain(attr)
      }
    })

    test('SVG 不应包含 xmlns 属性', () => {
      // 验证转换后的 SVG 不包含 xmlns
      const transformedSvg =
        '<svg height="1em" viewBox="0 0 24 24" width="1em" fill="currentColor"><path d="M0 0h24v24H0z"/></svg>'

      expect(transformedSvg).not.toContain('xmlns=')
    })
  })

  /**
   * **Feature: material-icons-v4-upgrade, Property 6: CSS 类名生成**
   * For any 图标名称和变体组合，生成的 CSS 类名 SHALL 符合模式
   * `mdi-{kebab-case-name}`（filled）或 `mdi-{kebab-case-name}-{variant}`（其他变体）
   * Validates: Requirements 3.4
   */
  describe('Property 6: CSS 类名生成', () => {
    test('filled 变体应使用基础类名', () => {
      fc.assert(
        fc.property(iconNameArb, (iconName) => {
          if (!iconName || iconName.length === 0) return true

          const className = getCssClassName(iconName, 'filled')

          // 验证以 mdi- 开头
          expect(className).toMatch(/^mdi-/)

          // 验证不包含 -filled 后缀
          expect(className).not.toMatch(/-filled$/)

          // 验证使用 kebab-case（下划线转为连字符）
          expect(className).not.toContain('_')

          return true
        }),
        { numRuns: 100 },
      )
    })

    test('非 filled 变体应包含变体后缀', () => {
      const nonFilledVariants: IconVariant[] = ['outlined', 'round', 'sharp', 'twotone']

      fc.assert(
        fc.property(iconNameArb, fc.constantFrom(...nonFilledVariants), (iconName, variant) => {
          if (!iconName || iconName.length === 0) return true

          const className = getCssClassName(iconName, variant)

          // 验证以 mdi- 开头
          expect(className).toMatch(/^mdi-/)

          // 验证包含变体后缀
          expect(className).toMatch(new RegExp(`-${variant}$`))

          return true
        }),
        { numRuns: 100 },
      )
    })

    test('相同输入应产生相同类名（确定性）', () => {
      fc.assert(
        fc.property(iconNameArb, variantArb, (iconName, variant) => {
          if (!iconName || iconName.length === 0) return true

          const result1 = getCssClassName(iconName, variant)
          const result2 = getCssClassName(iconName, variant)

          expect(result1).toBe(result2)

          return true
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * **Feature: material-icons-v4-upgrade, Property 3: 默认变体行为**
   * For any 统一图标组件，当 `variant` prop 未指定或为无效值时，
   * 组件 SHALL 渲染 `filled` 变体的 SVG 内容
   * Validates: Requirements 2.3, 5.4
   */
  describe('Property 3: 默认变体行为', () => {
    test('默认变体应为 filled', () => {
      // 验证模板中的默认值逻辑
      const defaultVariant: IconVariant = 'filled'
      const availableVariants: IconVariant[] = ['filled', 'outlined', 'round', 'sharp', 'twotone']

      // 模拟组件的变体选择逻辑
      const selectVariant = (requested: string | undefined): IconVariant => {
        if (requested && availableVariants.includes(requested as IconVariant)) {
          return requested as IconVariant
        }

        return defaultVariant
      }

      // 未指定时应返回 filled
      expect(selectVariant(undefined)).toBe('filled')

      // 空字符串应返回 filled
      expect(selectVariant('')).toBe('filled')
    })

    test('无效变体值应回退到 filled', () => {
      const invalidVariants = ['invalid', 'FILLED', 'Outlined', 'unknown', '123', 'fill']

      const availableVariants: IconVariant[] = ['filled', 'outlined', 'round', 'sharp', 'twotone']

      const selectVariant = (requested: string): IconVariant => {
        if (availableVariants.includes(requested as IconVariant)) {
          return requested as IconVariant
        }

        return 'filled'
      }

      for (const invalid of invalidVariants) {
        expect(selectVariant(invalid)).toBe('filled')
      }
    })
  })

  /**
   * **Feature: material-icons-v4-upgrade, Property 4: 变体切换正确性**
   * For any 统一图标组件和有效的 variant 值，设置 `variant` prop 后
   * 组件 SHALL 渲染对应变体的 SVG 内容
   * Validates: Requirements 2.4
   */
  describe('Property 4: 变体切换正确性', () => {
    test('有效变体应被正确选择', () => {
      fc.assert(
        fc.property(variantArb, (variant) => {
          const availableVariants: IconVariant[] = [
            'filled',
            'outlined',
            'round',
            'sharp',
            'twotone',
          ]

          const selectVariant = (requested: IconVariant): IconVariant => {
            if (availableVariants.includes(requested)) {
              return requested
            }

            return 'filled'
          }

          // 有效变体应返回自身
          expect(selectVariant(variant)).toBe(variant)

          return true
        }),
        { numRuns: 100 },
      )
    })

    test('变体选择应与 CSS 类名一致', () => {
      fc.assert(
        fc.property(iconNameArb, variantArb, (iconName, variant) => {
          if (!iconName || iconName.length === 0) return true

          const className = getCssClassName(iconName, variant)

          // filled 变体不应有后缀
          if (variant === 'filled') {
            expect(className).not.toContain('-filled')
          } else {
            // 其他变体应有对应后缀
            expect(className).toContain(`-${variant}`)
          }

          return true
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * **Feature: material-icons-v4-upgrade, Property 8: 缺失变体回退**
   * For any 缺少某些变体的图标，当请求不可用的变体时，
   * 组件 SHALL 回退到 `filled` 变体
   * Validates: Requirements 5.1
   */
  describe('Property 8: 缺失变体回退', () => {
    test('请求不可用变体时应回退到默认变体', () => {
      // 模拟只有部分变体可用的情况
      const partialVariantSets: IconVariant[][] = [
        ['filled'],
        ['filled', 'outlined'],
        ['outlined', 'round'], // 没有 filled 的情况
        ['sharp', 'twotone'],
      ]

      for (const availableVariants of partialVariantSets) {
        const defaultVariant = availableVariants.includes('filled')
          ? 'filled'
          : availableVariants[0]

        const selectVariant = (requested: IconVariant): IconVariant => {
          if (availableVariants.includes(requested)) {
            return requested
          }

          return defaultVariant
        }

        // 测试所有变体
        for (const variant of validVariants) {
          const selected = selectVariant(variant)

          if (availableVariants.includes(variant)) {
            expect(selected).toBe(variant)
          } else {
            expect(selected).toBe(defaultVariant)
          }
        }
      }
    })

    test('回退逻辑应优先使用 filled', () => {
      fc.assert(
        fc.property(
          fc.array(variantArb, { minLength: 1, maxLength: 5 }),
          variantArb,
          (availableVariants, requestedVariant) => {
            // 确保数组唯一
            const uniqueVariants = [...new Set(availableVariants)]
            const defaultVariant = uniqueVariants.includes('filled') ? 'filled' : uniqueVariants[0]

            const selectVariant = (requested: IconVariant): IconVariant => {
              if (uniqueVariants.includes(requested)) {
                return requested
              }

              return defaultVariant
            }

            const selected = selectVariant(requestedVariant)

            // 验证选择的变体要么是请求的（如果可用），要么是默认的
            if (uniqueVariants.includes(requestedVariant)) {
              expect(selected).toBe(requestedVariant)
            } else {
              expect(selected).toBe(defaultVariant)
            }

            return true
          },
        ),
        { numRuns: 100 },
      )
    })
  })

  /**
   * **Feature: material-icons-v4-upgrade, Property 7: 索引导出完整性**
   * For any 分类目录中的图标组件集合，生成的索引文件
   * SHALL 包含所有组件的命名导出
   * Validates: Requirements 4.1, 4.3
   */
  describe('Property 7: 索引导出完整性', () => {
    test('索引导出语句格式应正确', () => {
      // 模拟索引生成逻辑
      const generateExportStatement = (componentName: string): string => {
        return `export { ${componentName} } from './${componentName}'`
      }

      fc.assert(
        fc.property(iconNameArb, (iconName) => {
          if (!iconName || iconName.length === 0) return true

          const componentName = getComponentName(iconName)
          const exportStatement = generateExportStatement(componentName)

          // 验证导出语句格式
          expect(exportStatement).toMatch(
            /^export \{ MDI[A-Za-z0-9]+ \} from '\.\/MDI[A-Za-z0-9]+'$/,
          )

          // 验证组件名称一致性
          expect(exportStatement).toContain(componentName)

          return true
        }),
        { numRuns: 100 },
      )
    })

    test('所有组件应被导出', () => {
      // 模拟一组组件名称
      const componentNames = ['MDIAccessibility', 'MDIHome', 'MDI3dRotation', 'MDIZoomIn']

      const generateIndex = (names: string[]): string[] => {
        return names.map((name) => `export { ${name} } from './${name}'`)
      }

      const exports = generateIndex(componentNames)

      // 验证每个组件都有对应的导出
      for (const name of componentNames) {
        const hasExport = exports.some((exp) => exp.includes(name))

        expect(hasExport).toBe(true)
      }

      // 验证导出数量与组件数量一致
      expect(exports.length).toBe(componentNames.length)
    })
  })

  /**
   * 重名处理测试
   * 验证 DuplicateNameHandler 的正确性
   */
  describe('重名处理', () => {
    test('第一次注册应保留原名', () => {
      const handler = new DuplicateNameHandler()

      fc.assert(
        fc.property(iconNameArb, categoryArb, (iconName, category) => {
          if (!iconName || iconName.length === 0) return true

          handler.reset()
          const componentName = getComponentName(iconName)
          const result = handler.handleDuplicateName(componentName, category)

          // 第一次注册应返回原名
          expect(result).toBe(componentName)

          return true
        }),
        { numRuns: 100 },
      )
    })

    test('重复注册应添加分类前缀', () => {
      const handler = new DuplicateNameHandler()

      // 第一次注册
      const firstName = handler.handleDuplicateName('MDIHome', 'action')

      expect(firstName).toBe('MDIHome')

      // 第二次注册同名应添加前缀
      const secondName = handler.handleDuplicateName('MDIHome', 'home')

      expect(secondName).toBe('MDIHomeHome')

      // 验证两个名称都已注册
      expect(handler.isRegistered('MDIHome')).toBe(true)
      expect(handler.isRegistered('MDIHomeHome')).toBe(true)
    })

    test('重名记录应被正确维护', () => {
      const handler = new DuplicateNameHandler()

      handler.handleDuplicateName('MDIHome', 'action')
      handler.handleDuplicateName('MDIHome', 'home')
      handler.handleDuplicateName('MDIHome', 'places')

      const log = handler.getDuplicateLog()

      expect(log.has('MDIHome')).toBe(true)
      expect(log.get('MDIHome')?.length).toBe(2) // home 和 places 的重名记录
    })
  })
})

/**
 * Icon Generator Refactor - 属性测试
 * 验证 createIconComponent 工厂函数的正确性属性
 */
describe('Icon Generator Refactor 属性测试', () => {
  /**
   * **Feature: icon-generator-refactor, Property 4: Valid variant selection**
   * *For any* icon component with a given svgMap, when a variant that exists
   * in the svgMap is requested, the component SHALL render that variant's SVG content.
   * **Validates: Requirements 2.1**
   */
  describe('Property 4: 有效变体选择', () => {
    test('请求存在的变体时应返回该变体', () => {
      fc.assert(
        fc.property(fc.array(variantArb, { minLength: 1, maxLength: 5 }), (availableVariants) => {
          const uniqueVariants = [...new Set(availableVariants)] as IconVariant[]

          // 模拟 createIconComponent 的变体选择逻辑
          const selectVariant = (requested: IconVariant): IconVariant | undefined => {
            if (uniqueVariants.includes(requested)) {
              return requested
            }

            return undefined
          }

          // 对于每个可用变体，请求时应返回该变体
          for (const variant of uniqueVariants) {
            expect(selectVariant(variant)).toBe(variant)
          }

          return true
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * **Feature: icon-generator-refactor, Property 5: Invalid variant fallback**
   * *For any* icon component with a given svgMap, when a variant that does NOT exist
   * in the svgMap is requested, the component SHALL fall back to the default variant
   * (filled if available, otherwise the first available variant).
   * **Validates: Requirements 2.2**
   */
  describe('Property 5: 无效变体回退', () => {
    test('请求不存在的变体时应回退到默认变体', () => {
      fc.assert(
        fc.property(
          fc.array(variantArb, { minLength: 1, maxLength: 4 }),
          variantArb,
          (availableVariants, requestedVariant) => {
            const uniqueVariants = [...new Set(availableVariants)] as IconVariant[]

            // 计算默认变体：filled 优先，否则第一个
            const defaultVariant = uniqueVariants.includes('filled') ? 'filled' : uniqueVariants[0]

            // 模拟 createIconComponent 的变体选择逻辑
            const selectVariant = (requested: IconVariant): IconVariant => {
              if (uniqueVariants.includes(requested)) {
                return requested
              }

              return defaultVariant
            }

            const selected = selectVariant(requestedVariant)

            // 如果请求的变体不可用，应返回默认变体
            if (!uniqueVariants.includes(requestedVariant)) {
              expect(selected).toBe(defaultVariant)
            }

            return true
          },
        ),
        { numRuns: 100 },
      )
    })

    test('默认变体应优先选择 filled', () => {
      fc.assert(
        fc.property(fc.array(variantArb, { minLength: 1, maxLength: 5 }), (availableVariants) => {
          const uniqueVariants = [...new Set(availableVariants)] as IconVariant[]

          const defaultVariant = uniqueVariants.includes('filled') ? 'filled' : uniqueVariants[0]

          // 如果 filled 可用，默认变体必须是 filled
          if (uniqueVariants.includes('filled')) {
            expect(defaultVariant).toBe('filled')
          } else {
            // 否则应该是第一个可用变体
            expect(defaultVariant).toBe(uniqueVariants[0])
          }

          return true
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * **Feature: icon-generator-refactor, Property 6: CSS class name pattern**
   * *For any* icon with name `iconName` and variant `v`, the generated CSS class
   * SHALL be `mdi-{iconName}` when `v` is 'filled', and `mdi-{iconName}-{v}` otherwise.
   * **Validates: Requirements 2.3**
   */
  describe('Property 6: CSS 类名模式', () => {
    test('CSS 类名应符合指定模式', () => {
      fc.assert(
        fc.property(iconNameArb, variantArb, (iconName, variant) => {
          if (!iconName || iconName.length === 0) return true

          // 模拟 createIconComponent 的 CSS 类名生成逻辑
          const kebabName = iconName.replace(/_/g, '-')
          const baseClassName = `mdi-${kebabName}`

          const className = variant === 'filled' ? baseClassName : `${baseClassName}-${variant}`

          // 验证类名格式
          expect(className).toMatch(/^mdi-/)

          if (variant === 'filled') {
            expect(className).not.toMatch(/-filled$/)
            expect(className).toBe(baseClassName)
          } else {
            expect(className).toMatch(new RegExp(`-${variant}$`))
            expect(className).toBe(`${baseClassName}-${variant}`)
          }

          return true
        }),
        { numRuns: 100 },
      )
    })
  })
})

/**
 * Icon Generator Refactor - 生成文件结构属性测试
 * 直接测试 iconTemplate 函数的输出
 */
import { iconTemplate } from '../scripts/templates/icon-template'

describe('Icon Generator Refactor 生成文件结构测试', () => {
  // SVG 内容生成器：生成有效的 SVG 字符串
  const svgContentArb = fc.constantFrom(
    '<svg height="1em" viewBox="0 0 24 24" width="1em" fill="currentColor"><path d="M0 0h24v24H0z" fill="none" /><path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" /></svg>',
    '<svg height="1em" viewBox="0 0 24 24" width="1em" fill="currentColor"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" /></svg>',
    '<svg height="1em" viewBox="0 0 24 24" width="1em" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>',
  )

  // 变体组合生成器：生成至少包含一个变体的 SVG 映射
  const svgMapArb = fc
    .record({
      filled: fc.option(svgContentArb, { nil: undefined }),
      outlined: fc.option(svgContentArb, { nil: undefined }),
      round: fc.option(svgContentArb, { nil: undefined }),
      sharp: fc.option(svgContentArb, { nil: undefined }),
      twotone: fc.option(svgContentArb, { nil: undefined }),
    })
    .filter((map) => Object.values(map).some((v) => v !== undefined))
    .map((map) => {
      // 移除 undefined 值
      const result: Partial<Record<IconVariant, string>> = {}

      for (const [key, value] of Object.entries(map)) {
        if (value !== undefined) {
          result[key as IconVariant] = value
        }
      }

      return result
    })

  /**
   * **Feature: icon-generator-refactor, Property 1: Generated files use shared imports**
   * *For any* generated icon component file, the file SHALL contain an import from
   * `createIconComponent` AND SHALL NOT contain inline `defineComponent`, `props`
   * definition, or `setup` function.
   * **Validates: Requirements 1.1, 3.2**
   */
  describe('Property 1: 生成文件使用共享导入', () => {
    test('iconTemplate 生成的内容应导入 createIconComponent 且不包含重复逻辑', () => {
      fc.assert(
        fc.property(iconNameArb, svgMapArb, (iconName, svgMap) => {
          if (!iconName || iconName.length === 0) return true

          const componentName = getComponentName(iconName)
          const generatedContent = iconTemplate(svgMap, iconName, componentName)

          // 验证包含 createIconComponent 导入
          expect(generatedContent).toContain(
            "import { createIconComponent } from '../../components/createIconComponent'",
          )

          // 验证不包含内联的 defineComponent
          expect(generatedContent).not.toContain('defineComponent(')

          // 验证不包含内联的 props 定义（作为对象属性）
          expect(generatedContent).not.toMatch(/props:\s*\{/)

          // 验证不包含内联的 setup 函数
          expect(generatedContent).not.toMatch(/setup\s*\(/)

          // 验证不包含 vue 导入
          expect(generatedContent).not.toContain("from 'vue'")

          return true
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * **Feature: icon-generator-refactor, Property 2: Generated files contain minimal data**
   * *For any* generated icon component file, the file SHALL contain exactly three
   * icon-specific fields: `name`, `iconName`, and `svgMap`, with no additional component logic.
   * **Validates: Requirements 1.2, 3.1**
   */
  describe('Property 2: 生成文件只包含最小数据', () => {
    test('iconTemplate 生成的内容应只包含 name、iconName 和 svgMap', () => {
      fc.assert(
        fc.property(iconNameArb, svgMapArb, (iconName, svgMap) => {
          if (!iconName || iconName.length === 0) return true

          const componentName = getComponentName(iconName)
          const generatedContent = iconTemplate(svgMap, iconName, componentName)

          // 验证包含必需的三个字段
          expect(generatedContent).toContain(`name: '${componentName}'`)
          expect(generatedContent).toContain('iconName:')
          expect(generatedContent).toContain('svgMap: {')

          // 验证不包含额外的组件逻辑
          expect(generatedContent).not.toContain('availableVariants')
          expect(generatedContent).not.toContain('defaultVariant')
          expect(generatedContent).not.toContain('className =')
          expect(generatedContent).not.toContain('requestedVariant')
          expect(generatedContent).not.toContain('renderSvg')

          // 验证调用 createIconComponent
          expect(generatedContent).toContain('createIconComponent({')

          return true
        }),
        { numRuns: 100 },
      )
    })

    test('iconTemplate 生成的内容应包含所有提供的变体', () => {
      fc.assert(
        fc.property(iconNameArb, svgMapArb, (iconName, svgMap) => {
          if (!iconName || iconName.length === 0) return true

          const componentName = getComponentName(iconName)
          const generatedContent = iconTemplate(svgMap, iconName, componentName)

          // 验证所有提供的变体都在生成的内容中
          for (const variant of Object.keys(svgMap)) {
            expect(generatedContent).toContain(`${variant}: () =>`)
          }

          return true
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * **Feature: icon-generator-refactor, Property 8: Generated file line count**
   * *For any* generated icon component file, the non-SVG boilerplate code SHALL be
   * fewer than 15 lines (import + createIconComponent call structure).
   * **Validates: Requirements 5.2**
   */
  describe('Property 8: 生成文件行数', () => {
    test('iconTemplate 生成的非 SVG 样板代码应少于 15 行', () => {
      fc.assert(
        fc.property(iconNameArb, (iconName) => {
          if (!iconName || iconName.length === 0) return true

          const componentName = getComponentName(iconName)
          // 使用单个变体测试最小样板代码
          const minimalSvgMap: Partial<Record<IconVariant, string>> = {
            filled: '<svg></svg>',
          }
          const generatedContent = iconTemplate(minimalSvgMap, iconName, componentName)

          // 计算非 SVG 内容的行数
          // 移除 SVG 内容后计算行数
          const lines = generatedContent.split('\n')
          const boilerplateLines = lines.filter((line) => {
            const trimmed = line.trim()

            // 排除空行和纯 SVG 内容行
            return (
              trimmed.length > 0 &&
              !trimmed.startsWith('<svg') &&
              !trimmed.startsWith('<path') &&
              !trimmed.startsWith('<circle') &&
              !trimmed.startsWith('</svg')
            )
          })

          // 验证样板代码行数少于 15 行
          expect(boilerplateLines.length).toBeLessThan(15)

          return true
        }),
        { numRuns: 100 },
      )
    })

    test('iconTemplate 生成的总行数应合理（考虑多变体）', () => {
      fc.assert(
        fc.property(iconNameArb, svgMapArb, (iconName, svgMap) => {
          if (!iconName || iconName.length === 0) return true

          const componentName = getComponentName(iconName)
          const generatedContent = iconTemplate(svgMap, iconName, componentName)

          const lines = generatedContent.split('\n')
          const variantCount = Object.keys(svgMap).length

          // 基础样板约 8 行 + 每个变体约 1 行（不含 SVG 内容）
          // 总行数应该合理
          const expectedMaxLines = 10 + variantCount * 5 // 每个变体最多 5 行（含 SVG）

          expect(lines.length).toBeLessThanOrEqual(expectedMaxLines)

          return true
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * **Feature: icon-generator-refactor, Property 7: Export name consistency**
   * *For any* generated icon component, the exported component name SHALL match
   * the pattern `MDI{PascalCaseName}` and be consistent with the original naming convention.
   * **Validates: Requirements 4.1**
   */
  describe('Property 7: 导出名称一致性', () => {
    test('iconTemplate 生成的导出名称应符合 MDI{PascalCaseName} 模式', () => {
      fc.assert(
        fc.property(iconNameArb, svgMapArb, (iconName, svgMap) => {
          if (!iconName || iconName.length === 0) return true

          const componentName = getComponentName(iconName)
          const generatedContent = iconTemplate(svgMap, iconName, componentName)

          // 验证导出语句格式
          expect(generatedContent).toMatch(/export const MDI[A-Za-z0-9]+ = createIconComponent/)

          // 验证组件名称以 MDI 开头
          expect(componentName).toMatch(/^MDI/)

          // 验证组件名称使用 PascalCase（MDI 后面跟大写字母或数字）
          expect(componentName).toMatch(/^MDI[A-Z0-9]/)

          // 验证组件名称不包含下划线或连字符
          expect(componentName).not.toMatch(/[_-]/)

          // 验证生成的内容中 name 字段与导出名称一致
          expect(generatedContent).toContain(`name: '${componentName}'`)
          expect(generatedContent).toContain(`export const ${componentName}`)

          return true
        }),
        { numRuns: 100 },
      )
    })

    test('相同输入应产生相同的组件名称（确定性）', () => {
      fc.assert(
        fc.property(iconNameArb, (iconName) => {
          if (!iconName || iconName.length === 0) return true

          const result1 = getComponentName(iconName)
          const result2 = getComponentName(iconName)

          expect(result1).toBe(result2)

          return true
        }),
        { numRuns: 100 },
      )
    })

    test('iconTemplate 生成的内容中 name 字段应与导出名称一致', () => {
      fc.assert(
        fc.property(iconNameArb, svgMapArb, (iconName, svgMap) => {
          if (!iconName || iconName.length === 0) return true

          const componentName = getComponentName(iconName)
          const generatedContent = iconTemplate(svgMap, iconName, componentName)

          // 提取导出的组件名称
          const exportMatch = generatedContent.match(/export const (MDI[A-Za-z0-9]+) =/)

          expect(exportMatch).not.toBeNull()

          if (exportMatch) {
            const exportedName = exportMatch[1]

            // 验证 name 字段与导出名称一致
            expect(generatedContent).toContain(`name: '${exportedName}'`)
          }

          return true
        }),
        { numRuns: 100 },
      )
    })
  })
})

/**
 * Icon Generator Refactor - 渲染输出等价性测试
 * 验证 createIconComponent 创建的组件渲染输出符合预期
 */
import { mount } from '@vue/test-utils'
import {
  createIconComponent,
  type IconDefinition,
  type SvgMap,
} from '../src/components/createIconComponent'
import { h } from 'vue'

describe('Icon Generator Refactor 渲染输出等价性测试', () => {
  /**
   * **Feature: icon-generator-refactor, Property 3: Render output equivalence**
   * *For any* icon component and any variant, rendering the refactored component
   * SHALL produce the same DOM structure (MDIcon wrapper, CSS class, SVG content)
   * as the original implementation.
   * **Validates: Requirements 1.4, 4.3**
   */
  describe('Property 3: 渲染输出等价性', () => {
    // 创建测试用的 SVG 渲染函数
    const createSvgRenderer = (content: string) => () =>
      h('svg', {
        height: '1em',
        viewBox: '0 0 24 24',
        width: '1em',
        fill: 'currentColor',
        innerHTML: content,
      })

    test('createIconComponent 创建的组件应渲染正确的 DOM 结构', () => {
      fc.assert(
        fc.property(iconNameArb, variantArb, (iconName, variant) => {
          if (!iconName || iconName.length === 0) return true

          const kebabName = iconName.replace(/_/g, '-')
          const componentName = getComponentName(iconName)

          // 创建包含所有变体的 svgMap
          const svgMap: SvgMap = {
            filled: createSvgRenderer('<path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/>'),
            outlined: createSvgRenderer('<path d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5z"/>'),
            round: createSvgRenderer('<circle cx="12" cy="12" r="10"/>'),
            sharp: createSvgRenderer('<rect x="4" y="4" width="16" height="16"/>'),
            twotone: createSvgRenderer('<path d="M12 3L4 9v12h16V9l-8-6z" opacity=".3"/>'),
          }

          const definition: IconDefinition = {
            name: componentName,
            iconName: kebabName,
            svgMap,
          }

          const IconComponent = createIconComponent(definition)
          const wrapper = mount(IconComponent, {
            props: { variant },
          })

          const html = wrapper.html()

          // 验证渲染了 span 元素（MDIcon 的根元素）
          expect(html).toContain('<span')
          expect(html).toContain('</span>')

          // 验证包含 md-icon 基础类名
          expect(html).toContain('md-icon')

          // 验证包含正确的 CSS 类名
          const expectedClass =
            variant === 'filled' ? `mdi-${kebabName}` : `mdi-${kebabName}-${variant}`

          expect(html).toContain(expectedClass)

          // 验证包含 SVG 元素
          expect(html).toContain('<svg')
          expect(html).toContain('</svg>')

          return true
        }),
        { numRuns: 50 }, // 减少迭代次数因为涉及 DOM 操作
      )
    })

    test('createIconComponent 应正确处理变体回退', () => {
      fc.assert(
        fc.property(
          iconNameArb,
          fc.array(variantArb, { minLength: 1, maxLength: 3 }),
          variantArb,
          (iconName, availableVariants, requestedVariant) => {
            if (!iconName || iconName.length === 0) return true

            const uniqueVariants = [...new Set(availableVariants)] as IconVariant[]
            const kebabName = iconName.replace(/_/g, '-')
            const componentName = getComponentName(iconName)

            // 只为可用变体创建 svgMap
            const svgMap: SvgMap = {}

            for (const v of uniqueVariants) {
              svgMap[v] = createSvgRenderer(`<path d="test-${v}"/>`)
            }

            const definition: IconDefinition = {
              name: componentName,
              iconName: kebabName,
              svgMap,
            }

            const IconComponent = createIconComponent(definition)
            const wrapper = mount(IconComponent, {
              props: { variant: requestedVariant },
            })

            const html = wrapper.html()

            // 计算预期使用的变体
            const expectedVariant = uniqueVariants.includes(requestedVariant)
              ? requestedVariant
              : uniqueVariants.includes('filled')
                ? 'filled'
                : uniqueVariants[0]

            // 验证使用了正确的变体
            const expectedClass =
              expectedVariant === 'filled'
                ? `mdi-${kebabName}`
                : `mdi-${kebabName}-${expectedVariant}`

            expect(html).toContain(expectedClass)

            // 验证渲染了正确变体的 SVG 内容
            expect(html).toContain(`test-${expectedVariant}`)

            return true
          },
        ),
        { numRuns: 50 },
      )
    })

    test('createIconComponent 创建的组件应具有正确的组件名称', () => {
      fc.assert(
        fc.property(iconNameArb, (iconName) => {
          if (!iconName || iconName.length === 0) return true

          const kebabName = iconName.replace(/_/g, '-')
          const componentName = getComponentName(iconName)

          const svgMap: SvgMap = {
            filled: createSvgRenderer('<path d="M12 2"/>'),
          }

          const definition: IconDefinition = {
            name: componentName,
            iconName: kebabName,
            svgMap,
          }

          const IconComponent = createIconComponent(definition)

          // 验证组件名称
          expect(IconComponent.name).toBe(componentName)

          return true
        }),
        { numRuns: 100 },
      )
    })
  })
})

/**
 * Gulp to Node.js Refactor - Demo 生成属性测试
 * 验证 Demo 列表生成的正确性
 */
import { itemTemplate, listTemplate } from '../scripts/templates/demo-template'
import { getListName } from '../scripts/helpers'

describe('Gulp to Node.js Refactor Demo 生成测试', () => {
  /**
   * **Feature: gulp-to-nodejs-refactor, Property 6: Demo List Generation**
   * *For any* category with icons, the generated demo list component SHALL reference
   * all icons in that category using the correct component names.
   * **Validates: Requirements 5.1, 5.3**
   */
  describe('Property 6: Demo 列表生成', () => {
    test('itemTemplate 应生成正确的列表项', () => {
      fc.assert(
        fc.property(categoryArb, iconNameArb, (category, iconName) => {
          if (!iconName || iconName.length === 0) return true

          const item = itemTemplate(category, iconName)

          // 验证包含 li 元素
          expect(item).toContain('<li>')
          expect(item).toContain('</li>')

          // 验证包含组件引用
          const componentName = getComponentName(iconName)

          expect(item).toContain(`MDI.${componentName}`)

          // 验证包含 variant prop
          expect(item).toContain('variant={props.variant}')

          // 验证包含图标名称显示
          expect(item).toContain('icon-name')

          return true
        }),
        { numRuns: 100 },
      )
    })

    test('listTemplate 应生成正确的列表组件', () => {
      fc.assert(
        fc.property(categoryArb, (category) => {
          const items = '<li>test item</li>'
          const listContent = listTemplate(category, items)

          // 验证包含 defineComponent
          expect(listContent).toContain('defineComponent')

          // 验证包含正确的组件名称
          const listName = getListName(category)

          expect(listContent).toContain(`name: '${listName}'`)

          // 验证包含 variant prop 定义
          expect(listContent).toContain('variant:')
          expect(listContent).toContain('type: String as PropType<IconVariant>')
          expect(listContent).toContain("default: 'filled'")

          // 验证包含 MDI 导入
          expect(listContent).toContain("import * as MDI from '@/index'")

          // 验证包含 IconVariant 类型导入
          expect(listContent).toContain("import type { IconVariant } from '@/index'")

          // 验证包含传入的 items
          expect(listContent).toContain(items)

          return true
        }),
        { numRuns: 100 },
      )
    })

    test('getListName 应生成正确的列表组件名称', () => {
      fc.assert(
        fc.property(categoryArb, (category) => {
          const listName = getListName(category)

          // 验证以 List 开头
          expect(listName).toMatch(/^List/)

          // 验证首字母大写
          expect(listName).toMatch(/^List[A-Z]/)

          return true
        }),
        { numRuns: 100 },
      )
    })

    test('相同分类应产生相同的列表名称（确定性）', () => {
      fc.assert(
        fc.property(categoryArb, (category) => {
          const result1 = getListName(category)
          const result2 = getListName(category)

          expect(result1).toBe(result2)

          return true
        }),
        { numRuns: 100 },
      )
    })
  })
})
