'use strict'

const { join } = require('path')
const { readFileSync } = require('fs')

function webviewHtml(appName) {
  const webRoot = join(__dirname, '..', 'web')
  const webAppRoot = join(webRoot, appName)
  const webviewPath = join(webAppRoot, 'webview.html')
  return readFileSync(webviewPath, 'utf8')
}

module.exports = webviewHtml
