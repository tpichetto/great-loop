// Test script to validate Swagger spec generation
import { swaggerSpec } from './src/swagger.js';

console.log('Swagger spec generated successfully!');
console.log(`Total paths: ${Object.keys(swaggerSpec.paths).length}`);
console.log('\nPaths:');
Object.keys(swaggerSpec.paths).forEach((path) => {
  const methods = Object.keys(swaggerSpec.paths[path]);
  console.log(`  ${path}: ${methods.join(', ')}`);
});

console.log('\nSchemas:');
Object.keys(swaggerSpec.components.schemas).forEach((schema) => {
  console.log(`  - ${schema}`);
});
