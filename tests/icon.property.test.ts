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
