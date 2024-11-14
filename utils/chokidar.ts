import chokidar from 'chokidar'

const watcher = (routesPath: string) =>
  chokidar.watch(routesPath, {
    ignored: /(^|[\/\\])\../, // Ignore hidden files and directories
    persistent: true, // Keep watching until explicitly stopped
    ignoreInitial: true // Skip initial "add" events for existing files
  })

export default watcher
