const navi = require('./navigate.js')

if (typeof wx !== 'undefined') {
  wx = Object.assign(wx, navi)
}