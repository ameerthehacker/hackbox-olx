const mainJs = `
import hello from './hello.js';

hello('hello world from hackbox');
`;

const helloJs = `
import msg from './msg.js';

function hello(message) {
  console.log(message);
  msg(message);
}

export default hello;
`;

const msgJs = `
function msg(message) {
  alert(message);
}

export default msg;
`;

export const DEV_FILES = {
  './main.js': mainJs,
  './hello.js': helloJs,
  './msg.js': msgJs
};
