/**
 * 生成根索引文件中的分类导出语句
 * @param category 分类名称
 * @returns 导出语句
 */
export function categoriesIndexTemplate(category: string) {
  return `export * from './${category}'`
}

/**
 * 生成分类索引文件中的组件导出语句
 * 使用命名导出
 * @param componentName 组件名称
 * @returns 导出语句
 */
export function categoryIndexTemplate(componentName: string) {
  return `export { ${componentName} } from './${componentName}'`
}

/**
 * 生成分类索引文件中的 IconVariant 类型导出语句
 * 只需要从第一个组件导出一次
 * @param componentName 第一个组件名称
 * @returns 类型导出语句
 */
export function iconVariantTypeExportTemplate(componentName: string) {
  return `export type { IconVariant } from './${componentName}'`
}
