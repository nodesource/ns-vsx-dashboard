'use strict'

const prettyBytes = require('pretty-bytes')

const id = x => x
const percent = x => x.toFixed(1) + '%'
const decimals2 = x => x.toFixed(2)
const ms = x => decimals2(x) + 'ms'

module.exports = {
    count: id
  , percent
  , bytes: prettyBytes
  , decimals2
  , ms
}
