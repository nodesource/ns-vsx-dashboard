'use strict'

const rootNamespace = 'ns-dash'

// debug module seem to not work in  VSCode extensions
function debug(prefix) {
  return function debugWriter(s, ...rest) {
    console.log(`${prefix}: ${s}`, ...rest)
  }
}

function logger(prefix) {
  prefix = prefix == null ? '' : `${prefix}:`
  const logWarn  = debug(`${rootNamespace}:${prefix}warn`)
  const logTrace = debug(`${rootNamespace}:${prefix}trace`)
  const logDebug = debug(`${rootNamespace}:${prefix}debug`)
  const logInfo  = debug(`${rootNamespace}:${prefix}info`)
  const logError = debug(`${rootNamespace}:${prefix}error`)

  return { logWarn, logTrace, logDebug, logInfo, logError }
}

module.exports = logger
