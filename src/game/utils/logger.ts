export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: number
  data?: any
  category?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000
  private currentLevel: LogLevel = 'info'
  private enableConsole = true
  private categories: Set<string> = new Set()

  // Performance monitoring
  private frameTimeStart = 0
  private frameTimes: number[] = []
  private maxFrameTimeHistory = 60

  // Memory monitoring
  private memorySnapshots: { timestamp: number; used: number }[] = []
  private maxMemorySnapshots = 120

  setLevel(level: LogLevel): void {
    this.currentLevel = level
  }

  setConsoleOutput(enabled: boolean): void {
    this.enableConsole = enabled
  }

  addCategory(category: string): void {
    this.categories.add(category)
  }

  removeCategory(category: string): void {
    this.categories.delete(category)
  }

  debug(message: string, data?: any, category?: string): void {
    if (this.shouldLog('debug', category)) {
      this.log('debug', message, data, category)
    }
  }

  info(message: string, data?: any, category?: string): void {
    if (this.shouldLog('info', category)) {
      this.log('info', message, data, category)
    }
  }

  warn(message: string, data?: any, category?: string): void {
    if (this.shouldLog('warn', category)) {
      this.log('warn', message, data, category)
    }
  }

  error(message: string, data?: any, category?: string): void {
    if (this.shouldLog('error', category)) {
      this.log('error', message, data, category)
    }
  }

  private shouldLog(level: LogLevel, category?: string): boolean {
    const levelOrder = { debug: 0, info: 1, warn: 2, error: 3 }
    const currentLevelOrder = levelOrder[this.currentLevel]
    const messageLevelOrder = levelOrder[level]

    // Check if level should be logged
    if (messageLevelOrder < currentLevelOrder) {
      return false
    }

    // Check if category is enabled
    if (category && this.categories.size > 0 && !this.categories.has(category)) {
      return false
    }

    return true
  }

  private log(level: LogLevel, message: string, data?: any, category?: string): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: performance.now(),
      data,
      category
    }

    this.logs.push(entry)

    // Maintain max log limit
    if (this.logs.length > this.maxLogs) {
      this.logs.splice(0, this.logs.length - this.maxLogs)
    }

    // Console output for development
    if (this.enableConsole && import.meta.env.DEV) {
      const timestamp = new Date(entry.timestamp).toLocaleTimeString()
      const categoryPrefix = category ? `[${category}]` : ''
      const consoleMessage = `${timestamp} ${categoryPrefix} ${message}`

      switch (level) {
        case 'debug':
          console.debug(consoleMessage, data || '')
          break
        case 'info':
          console.info(consoleMessage, data || '')
          break
        case 'warn':
          console.warn(consoleMessage, data || '')
          break
        case 'error':
          console.error(consoleMessage, data || '')
          break
      }
    }
  }

  // Performance monitoring methods
  startFrame(): void {
    this.frameTimeStart = performance.now()
  }

  endFrame(): void {
    const frameTime = performance.now() - this.frameTimeStart
    this.frameTimes.push(frameTime)

    if (this.frameTimes.length > this.maxFrameTimeHistory) {
      this.frameTimes.splice(0, this.frameTimes.length - this.maxFrameTimeHistory)
    }

    this.debug('Frame time', { frameTime: frameTime.toFixed(2) }, 'performance')
  }

  getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0
    return this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length
  }

  getCurrentFps(): number {
    const avgFrameTime = this.getAverageFrameTime()
    return avgFrameTime > 0 ? 1000 / avgFrameTime : 0
  }

  // Memory monitoring
  snapshotMemory(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.memorySnapshots.push({
        timestamp: performance.now(),
        used: memory.usedJSHeapSize
      })

      if (this.memorySnapshots.length > this.maxMemorySnapshots) {
        this.memorySnapshots.splice(0, this.memorySnapshots.length - this.maxMemorySnapshots)
      }

      this.debug('Memory snapshot', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
      }, 'performance')
    }
  }

  getMemoryStats() {
    if (this.memorySnapshots.length === 0) return null

    const latest = this.memorySnapshots[this.memorySnapshots.length - 1]
    const oldest = this.memorySnapshots[0]
    const memoryDelta = latest.used - oldest.used

    return {
      current: `${(latest.used / 1024 / 1024).toFixed(2)}MB`,
      delta: `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`,
      snapshots: this.memorySnapshots.length,
      trend: memoryDelta > 0 ? 'increasing' : memoryDelta < 0 ? 'decreasing' : 'stable'
    }
  }

  // Log management
  getLogs(filter?: { level?: LogLevel; category?: string; limit?: number }): LogEntry[] {
    let filtered = [...this.logs]

    if (filter?.level) {
      filtered = filtered.filter(log => log.level === filter.level)
    }

    if (filter?.category) {
      filtered = filtered.filter(log => log.category === filter.category)
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit)
    }

    return filtered
  }

  clearLogs(): void {
    this.logs = []
  }

  exportLogs(): string {
    return this.logs.map(log => {
      const time = new Date(log.timestamp).toISOString()
      const category = log.category ? `[${log.category}]` : ''
      return `${time} ${log.level.toUpperCase()} ${category} ${log.message}${log.data ? ` ${JSON.stringify(log.data)}` : ''}`
    }).join('\n')
  }
}

// Global logger instance
export const logger = new Logger()

// Namespaced logger factory for consistency with older imports
export const createLogger = (category?: string): Logger => {
  const scoped = new Logger()
  if (category) {
    scoped.addCategory(category)
  }
  return scoped
}

// Development environment setup
if (import.meta.env.DEV) {
  logger.setLevel('debug')
  logger.addCategory('performance')
  logger.addCategory('game')
  logger.addCategory('rendering')
  logger.addCategory('input')
  logger.setConsoleOutput(true)

  // Periodic memory snapshots in development
  setInterval(() => {
    logger.snapshotMemory()
  }, 10000) // Every 10 seconds
} else {
  logger.setLevel('info')
  logger.setConsoleOutput(false)
}

export default logger
