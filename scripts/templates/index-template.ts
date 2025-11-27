export function categoriesIndexTemplate(category: string) {
  return `export * from './${category}';`;
}

export function categoryIndexTemplate(componentName: string) {
  return `import { ${componentName} } from './${componentName}';
export { ${componentName} };
`;
}
