declare module 'flamegraph' {
  namespace flamegraph {
    interface ICPUProfile {}
    interface IProcessedCPUProfile {}
    function processCpuProfile(profile: ICPUProfile): IProcessedCPUProfile
  }
  export = flamegraph
}
