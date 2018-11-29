export function unhandledCase(val: never): never {
  throw new Error(`Case ${val} went unhandled.`)
}
