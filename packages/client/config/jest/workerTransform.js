'use strict';

module.exports = {
  process(src, filename) {
    return `module.exports = {
      __esModule: true,
      default: class Worker {
        constructor() {
          this.URL = "${filename}";
        }
      }
    }`;
  }
};
