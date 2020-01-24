const mainJs = `
import hello from './hello.js';

// hello();
console.log('hi');
`;

const helloJs = `
export function hello() {
  console.log('hello world from hackbox');
}
`;

export const DEV_FILES = {
  './main.js': mainJs,
  './hellp.js': helloJs
};
