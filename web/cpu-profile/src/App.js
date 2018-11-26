/* global flamegraph */

class App {
  constructor() {
    this._onselected = null
    this._root = document.getElementById('app')
    this._subscribeClicks()
  }

  addProfile(processedProfile) {
    this._renderSvg(processedProfile)
  }

  _renderSvg(processedProfile) {
    const svg = flamegraph.svg(processedProfile, { imagewidth: window.innerWidth })
    this._root.innerHTML = svg
  }

  _subscribeClicks(root) {
    // structure of svg nodes is as follows
    // <g>
    //  <title>
    //  <rect>
    //  <text>
    // </g>
    this._root.addEventListener('click', e => {
      const node = e.target
      const g = node.parentElement
      if (g.tagName !== 'g') return
      e.stopPropagation()
      e.preventDefault()
      const fn = g.dataset.funcname
      this._onselected(fn)
    })
  }

  set onselected(value) {
    this._onselected = value
  }
}

const app = new App()

function handleVscodeMessage(msg) {
  const { command } = msg
  switch (command) {
    case 'add-profile': {
      app.addProfile(msg.profile)
      break
    }
  }
}

function connectVscode() {
  /* global acquireVsCodeApi */
  // @ts-ignore
  const vscode = acquireVsCodeApi()
  const { postMessage } = vscode
  app.onselected = fn => postMessage({ event: 'frame-selected', fn })
  window.addEventListener('message', msg => handleVscodeMessage(msg.data))

  vscode.postMessage({ event: 'ready' })
}

// @ts-ignore
const runningInVscode = typeof acquireVsCodeApi === 'function'
if (runningInVscode) {
  window.addEventListener('load', connectVscode)
} else {
  runInBrowserTests()
}

//
// Tests
//
function runInBrowserTests() {}
/*
  // @ts-ignore
  function init() {
    const profile = require('../../../tmp/cpu-profile.json')
    app.addProfile(profile)
    app.onselected = fn => console.log('selected', fn)
  }
  init()
}
*/
