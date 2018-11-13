'use strict'

const rootNamespace = 'ns-dash'

const ERROR = 0
const WARN  = 1
const INFO  = 2
const DEBUG = 3
const TRACE = 4

// debug module seem to not work in  VSCode extensions
function debug(prefix, level) {
  return function debugWriter(s, ...rest) {
    if (level > logger.LEVEL) return
    console.log(`${prefix}: ${s}`, ...rest)
  }
}

function logger(prefix) {
  prefix = prefix == null ? '' : `${prefix}:`
  const logWarn  = debug(`${rootNamespace}:${prefix}warn`, WARN)
  const logTrace = debug(`${rootNamespace}:${prefix}trace`, TRACE)
  const logDebug = debug(`${rootNamespace}:${prefix}debug`, DEBUG)
  const logInfo  = debug(`${rootNamespace}:${prefix}info`, INFO)
  const logError = debug(`${rootNamespace}:${prefix}error`, ERROR)

  return { logWarn, logTrace, logDebug, logInfo, logError }
}

module.exports = logger
logger.LEVEL = DEBUG
