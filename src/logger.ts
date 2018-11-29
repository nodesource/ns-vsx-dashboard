const rootNamespace = 'ns-dash'

const ERROR = 0
const WARN = 1
const INFO = 2
const DEBUG = 3
const TRACE = 4

export const loggerConfig = {
  LEVEL: DEBUG
}

export interface ILogger {
  logWarn: Function,
  logTrace: Function,
  logDebug: Function,
  logInfo: Function,
  logError: Function
}

// debug module seem to not work in  VSCode extensions
function debug(prefix: string, level: number) {
  return function debugWriter(s: any, ...rest: any[]) {
    if (level > loggerConfig.LEVEL) return
    // @ts-ignore (any[] needs SymbolIterator)
    console.log(`${prefix}: ${s}`, ...rest)
  }
}

export default function logger(prefix: string): ILogger {
  prefix = prefix == null ? '' : `${prefix}:`
  const logWarn = debug(`${rootNamespace}:${prefix}warn`, WARN)
  const logTrace = debug(`${rootNamespace}:${prefix}trace`, TRACE)
  const logDebug = debug(`${rootNamespace}:${prefix}debug`, DEBUG)
  const logInfo = debug(`${rootNamespace}:${prefix}info`, INFO)
  const logError = debug(`${rootNamespace}:${prefix}error`, ERROR)

  return { logWarn, logTrace, logDebug, logInfo, logError }
}
