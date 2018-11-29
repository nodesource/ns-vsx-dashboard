'use strict'

import * as ta from 'time-ago'
import { IToolkitAgentInfo } from 'toolkit-zmq';

const MAX_ID_LEN = 15
const MAX_MAIN_LEN = 60

function nameAgent(info: IToolkitAgentInfo) {
  if (info == null) return 'n/a'
  const { app, tags, pid } = info
  if (app !== 'untitled application') {
    return `${app} [${pid}]`
  }
  if (tags.length > 0) {
    return `${tags.join(':')} [${pid}]`
  }
  return `[${pid}]`
}

function getMain(main: string) {
  if (main.length <= MAX_MAIN_LEN) return main
  return `... ${main.slice(-(MAX_MAIN_LEN - 4))}`
}

function getId(id: string) {
  const s = `${id}`
  if (s.length <= MAX_ID_LEN) return s
  return `${s.slice(0, MAX_ID_LEN)}...`
}

export interface IProcessedAgentInfo {
  id: string
  name: string
  nodeEnv: string
  processStart: string
  main: string
}

export default function processAgentInfo(id: string, info: IToolkitAgentInfo) {
  const { nodeEnv, processStart, main } = info
  return {
      id: getId(id)
    , name: nameAgent(info)
    , nodeEnv
    , processStart: ta.ago(processStart)
    , main: getMain(main)
  }
}

