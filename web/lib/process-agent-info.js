'use strict'

const ta = require('time-ago')

const MAX_ID_LEN = 15
const MAX_MAIN_LEN = 60

function nameAgent(info) {
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

function getMain(main) {
  if (main.length <= MAX_MAIN_LEN) return main
  return `... ${main.slice(-(MAX_MAIN_LEN - 4))}`
}

function getId(id) {
  const s = `${id}`
  if (s.length <= MAX_ID_LEN) return s
  return `${s.slice(0, MAX_ID_LEN)}...`
}

function processAgentInfo(id, info) {
  const { nodeEnv, processStart, main } = info
  return {
      id: getId(id)
    , name: nameAgent(info)
    , nodeEnv
    , processStart: ta.ago(processStart)
    , main: getMain(main)
  }
}

module.exports = processAgentInfo
