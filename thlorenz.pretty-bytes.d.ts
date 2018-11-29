declare module '@thlorenz/pretty-bytes' {
  function PrettyBytes(number: number, options?: PrettyBytes.PrettyBytesOptions): string;
  export default PrettyBytes;
  namespace PrettyBytes {
    interface PrettyBytesOptions {
      signed?: boolean;
      locale?: boolean | string;
    }
  }
}
