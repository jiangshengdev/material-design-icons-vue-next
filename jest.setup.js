// Polyfill for setImmediate in jsdom environment
if (typeof setImmediate === 'undefined') {
  global.setImmediate = (callback, ...args) => {
    return setTimeout(callback, 0, ...args);
  };
  global.clearImmediate = (id) => {
    clearTimeout(id);
  };
}
