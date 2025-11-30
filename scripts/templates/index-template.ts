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
 * 注意：重构后 IconVariant 类型从 createIconComponent 模块导出，
 * 图标组件不再导出此类型，因此此函数已废弃
 * @deprecated IconVariant 现在从 src/components/createIconComponent 导出
 * @param _componentName 第一个组件名称（已废弃，不再使用）
 * @returns 空字符串
 */
export function iconVariantTypeExportTemplate(_componentName: string) {
  return ''
}
