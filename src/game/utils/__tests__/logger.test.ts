import { logger } from '../logger'

describe('Logger', () => {
  beforeEach(() => {
    logger.clearLogs()
    logger.setLevel('debug')
  })

  describe('Log Levels', () => {
    it('should log debug messages when level is debug', () => {
      logger.debug('Debug message', { test: true })
      const logs = logger.getLogs({ level: 'debug' })
      expect(logs).toHaveLength(1)
      expect(logs[0].message).toBe('Debug message')
      expect(logs[0].level).toBe('debug')
    })

    it('should filter out debug messages when level is info', () => {
      logger.setLevel('info')
      logger.debug('Debug message')
      const logs = logger.getLogs({ level: 'debug' })
      expect(logs).toHaveLength(0)
    })

    it('should log all messages when level is debug', () => {
      logger.debug('Debug')
      logger.info('Info')
      logger.warn('Warning')
      logger.error('Error')
      
      const allLogs = logger.getLogs()
      expect(allLogs).toHaveLength(4)
    })
  })

  describe('Categories', () => {
    it('should filter messages by category', () => {
      logger.addCategory('game')
      logger.addCategory('rendering')
      
      logger.info('Game message', undefined, 'game')
      logger.info('Render message', undefined, 'rendering')
      logger.info('General message')
      
      const gameLogs = logger.getLogs({ category: 'game' })
      const renderLogs = logger.getLogs({ category: 'rendering' })
      
      expect(gameLogs).toHaveLength(1)
      expect(renderLogs).toHaveLength(1)
      expect(gameLogs[0].category).toBe('game')
      expect(renderLogs[0].category).toBe('rendering')
    })
  })

  describe('Performance Monitoring', () => {
    it('should track frame times', () => {
      logger.startFrame()
      // Simulate some work
      const start = Date.now()
      while (Date.now() - start < 1) {} // 1ms delay
      logger.endFrame()
      
      const avgFrameTime = logger.getAverageFrameTime()
      expect(avgFrameTime).toBeGreaterThan(0)
    })

    it('should calculate FPS correctly', () => {
      // Simulate multiple frames
      for (let i = 0; i < 5; i++) {
        logger.startFrame()
        logger.endFrame()
      }
      
      const fps = logger.getCurrentFps()
      expect(fps).toBeGreaterThan(0)
      expect(fps).toBeFinite()
    })
  })

  describe('Memory Monitoring', () => {
    it('should handle memory snapshots', () => {
      // Mock performance.memory for testing
      if ('memory' in performance) {
        const originalMemory = (performance as any).memory
        ;(performance as any).memory = {
          usedJSHeapSize: 1024 * 1024, // 1MB
          totalJSHeapSize: 2 * 1024 * 1024, // 2MB
          jsHeapSizeLimit: 100 * 1024 * 1024 // 100MB
        }
        
        logger.snapshotMemory()
        const stats = logger.getMemoryStats()
        
        expect(stats).toBeDefined()
        expect(stats?.current).toBeDefined()
        
        // Restore
        ;(performance as any).memory = originalMemory
      }
    })
  })

  describe('Log Management', () => {
    it('should limit logs to specified count', () => {
      // Add more than limit
      for (let i = 0; i < 15; i++) {
        logger.info(`Message ${i}`)
      }
      
      const logs = logger.getLogs({ limit: 10 })
      expect(logs).toHaveLength(10)
    })

    it('should export logs as formatted text', () => {
      logger.info('Test message', { data: 'value' })
      const exportText = logger.exportLogs()
      
      expect(exportText).toContain('Test message')
      expect(exportText).toContain('INFO')
    })

    it('should clear all logs', () => {
      logger.info('Test message')
      expect(logger.getLogs()).toHaveLength(1)
      
      logger.clearLogs()
      expect(logger.getLogs()).toHaveLength(0)
    })
  })

  describe('Configuration', () => {
    it('should change log level', () => {
      logger.setLevel('warn')
      expect(logger).toBeTruthy() //间接测试
      
      logger.debug('Debug')
      logger.warn('Warning')
      logger.error('Error')
      
      const logs = logger.getLogs()
      expect(logs).toHaveLength(2) // Only warn and error
    })

    it('should enable/disable console output', () => {
      logger.setConsoleOutput(false)
      logger.info('Test message')
      
      const logs = logger.getLogs()
      expect(logs).toHaveLength(1)
    })
  })
})