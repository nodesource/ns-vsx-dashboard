import { readFileSync } from 'fs'
import { join } from 'path'

export default function webviewHtml(appName: string): string {
  const webRoot = join(__dirname, '..', 'web')
  const webAppRoot = join(webRoot, appName)
  const webviewPath = join(webAppRoot, 'webview.html')
  return readFileSync(webviewPath, 'utf8')
}
