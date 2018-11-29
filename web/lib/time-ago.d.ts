declare module 'time-ago' {
  namespace timeago {
    function ago(x: Date): string
    function today(): string
    function timefriendly(x: string): number
  }
  export = timeago
}
