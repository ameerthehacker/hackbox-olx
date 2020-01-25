const mainJs = `
import hello from './hello.js';

hello('hello world from hackbox');
`;

const helloJs = `
import { msgRenamed as msgAgain } from './msg.js';

function hello(message) {
  console.log(message);
  msgAgain(message);
}

export default hello;
`;

const msgJs = `
function msg(message) {
  alert(message);
}

export { msg as msgRenamed };
`;

export const DEV_FILES = {
  './main.js': mainJs,
  './hello.js': helloJs,
  './msg.js': msgJs
};
