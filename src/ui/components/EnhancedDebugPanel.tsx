import React, { memo, useCallback, useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { logger } from '@/game/utils/logger'
import { getPoolStats } from '@/game/utils/enhancedPool'
import { enemySpatialGrid } from '@/game/utils/spatialGrid'

interface EnhancedDebugPanelProps {
  showRanges: boolean
  showHitboxes: boolean
  fps: number
  currentWave: number
  totalWaves: number
  quickWaveIndex: number
  onToggleRanges: () => void
  onToggleHitboxes: () => void
  onSetQuickWave: (index: number) => void
  onQuickStartWave: () => void
  // Enhanced performance monitoring props
  renderTime?: number
  entityCount?: {
    enemies: number
    towers: number
    projectiles: number
    particles: number
  }
  memoryUsage?: {
    used: string
    delta: string
    trend: string
  }
  poolStats?: {
    projectilePoolSize: number
    particlePoolSize: number
    efficiency: number
  }
  spatialGridStats?: {
    cellCount: number
    entityCount: number
    avgEntitiesPerCell: number
  }
}

interface PerformanceMetric {
  name: string
  value: string | number
  status: 'good' | 'warning' | 'critical'
  description: string
}

export const EnhancedDebugPanel = memo(function EnhancedDebugPanel({
  showRanges,
  showHitboxes,
  fps,
  currentWave,
  totalWaves,
  quickWaveIndex,
  onToggleRanges,
  onToggleHitboxes,
  onSetQuickWave,
  onQuickStartWave,
  renderTime = 0,
  entityCount = { enemies: 0, towers: 0, projectiles: 0, particles: 0 },
  memoryUsage,
  poolStats,
  spatialGridStats
}: EnhancedDebugPanelProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'performance' | 'memory' | 'logs'>('basic')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [logLevel, setLogLevel] = useState<'debug' | 'info' | 'warn' | 'error'>('info')

  // Performance metrics calculation
  const performanceMetrics: PerformanceMetric[] = [
    {
      name: 'FPS',
      value: fps.toFixed(1),
      status: fps >= 55 ? 'good' : fps >= 30 ? 'warning' : 'critical',
      description: 'Frames per second - aim for 60+'
    },
    {
      name: 'Render Time',
      value: `${renderTime.toFixed(2)}ms`,
      status: renderTime < 16.67 ? 'good' : renderTime < 33 ? 'warning' : 'critical',
      description: 'Time to render a frame'
    },
    {
      name: 'Total Entities',
      value: entityCount.enemies + entityCount.towers + entityCount.projectiles + entityCount.particles,
      status: (entityCount.enemies + entityCount.towers + entityCount.projectiles + entityCount.particles) < 100 ? 'good' : 'warning',
      description: 'Total active game entities'
    },
    {
      name: 'Memory Usage',
      value: memoryUsage?.used || 'N/A',
      status: 'good', // Will be calculated based on memory delta
      description: 'Current memory usage'
    }
  ]

  const handleRangeChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    onSetQuickWave(Number(event.target.value) - 1)
  }, [onSetQuickWave])

  const handleLogLevelChange = useCallback((level: 'debug' | 'info' | 'warn' | 'error') => {
    setLogLevel(level)
    logger.setLevel(level)
  }, [])

  const exportLogs = useCallback(() => {
    const logs = logger.getLogs({ level: logLevel, limit: 1000 })
    const logText = logs.map(log => {
      const time = new Date(log.timestamp).toISOString()
      const category = log.category ? `[${log.category}]` : ''
      return `${time} ${log.level.toUpperCase()} ${category} ${log.message}`
    }).join('\n')
    
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `biesydefence-logs-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [logLevel])

  const clearLogs = useCallback(() => {
    logger.clearLogs()
  }, [])

  const forceGarbageCollection = useCallback(() => {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc()
      logger.info('Manual garbage collection triggered', undefined, 'performance')
    }
  }, [])

  // Auto-refresh metrics
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // This will trigger a re-render with updated stats
      logger.debug('Auto-refreshing debug panel metrics', undefined, 'performance')
    }, 1000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  // Only render in development mode
  if (import.meta.env.DEV !== true) {
    return null
  }

  const fpsLabel = Number.isFinite(fps) ? fps : 0

  return (
    <div className="enhanced-debug-panel">
      <div className="debug-header">
        <h3>🔧 Enhanced Debug Panel</h3>
        <div className="header-controls">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto Refresh
          </label>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="debug-tabs">
        {[
          { key: 'basic', label: 'Basic', icon: '🎮' },
          { key: 'performance', label: 'Performance', icon: '⚡' },
          { key: 'memory', label: 'Memory', icon: '💾' },
          { key: 'logs', label: 'Logs', icon: '📋' }
        ].map(tab => (
          <button
            key={tab.key}
            className={`debug-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key as any)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Basic Tab */}
      {activeTab === 'basic' && (
        <div className="debug-section">
          <div className="dev-mode-warning">
            <strong>⚠️ Development Mode Only</strong>
          </div>
          
          <div className="debug-row">
            <span>Debug FPS</span>
            <strong className={`fps-display ${performanceMetrics[0].status}`}>
              {fpsLabel.toFixed(1)}
            </strong>
          </div>
          
          <div className="debug-row">
            <span>Wave</span>
            <strong>
              {currentWave} / {totalWaves}
            </strong>
          </div>

          <div className="debug-row toggle-row">
            <button className={`toggle ${showRanges ? 'active' : ''}`} onClick={onToggleRanges}>
              Tower ranges
            </button>
            <button className={`toggle ${showHitboxes ? 'active' : ''}`} onClick={onToggleHitboxes}>
              Hitboxes
            </button>
          </div>

          <label className="quick-wave-label">
            Quick wave jump
            <input
              type="range"
              min={1}
              max={Math.max(totalWaves, 1)}
              value={quickWaveIndex + 1}
              onChange={handleRangeChange}
            />
          </label>
          
          <button className="ghost" onClick={onQuickStartWave}>
            Jump to wave {quickWaveIndex + 1}
          </button>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="debug-section">
          <h4>Performance Metrics</h4>
          
          <div className="performance-grid">
            {performanceMetrics.map(metric => (
              <div key={metric.name} className={`performance-metric ${metric.status}`}>
                <div className="metric-name">{metric.name}</div>
                <div className="metric-value">{metric.value}</div>
                <div className="metric-description">{metric.description}</div>
              </div>
            ))}
          </div>

          <div className="entity-breakdown">
            <h5>Entity Breakdown</h5>
            <div className="entity-stats">
              <div>Enemies: {entityCount.enemies}</div>
              <div>Towers: {entityCount.towers}</div>
              <div>Projectiles: {entityCount.projectiles}</div>
              <div>Particles: {entityCount.particles}</div>
            </div>
          </div>

          {spatialGridStats && (
            <div className="spatial-grid-stats">
              <h5>Spatial Grid</h5>
              <div className="grid-stats">
                <div>Cells: {spatialGridStats.cellCount}</div>
                <div>Entities: {spatialGridStats.entityCount}</div>
                <div>Avg/Cell: {spatialGridStats.avgEntitiesPerCell}</div>
              </div>
            </div>
          )}

          <div className="performance-actions">
            <button onClick={forceGarbageCollection} className="ghost">
              Force GC
            </button>
            <button 
              onClick={() => logger.snapshotMemory()} 
              className="ghost"
            >
              Memory Snapshot
            </button>
          </div>
        </div>
      )}

      {/* Memory Tab */}
      {activeTab === 'memory' && (
        <div className="debug-section">
          <h4>Memory & Pool Statistics</h4>
          
          {memoryUsage && (
            <div className="memory-stats">
              <div className="memory-item">
                <span>Current Usage:</span>
                <strong>{memoryUsage.used}</strong>
              </div>
              <div className="memory-item">
                <span>Delta:</span>
                <strong className={memoryUsage.trend === 'increasing' ? 'warning' : 'good'}>
                  {memoryUsage.delta}
                </strong>
              </div>
              <div className="memory-item">
                <span>Trend:</span>
                <strong>{memoryUsage.trend}</strong>
              </div>
            </div>
          )}

          {poolStats && (
            <div className="pool-stats">
              <h5>Object Pools</h5>
              <div className="pool-item">
                <span>Projectile Pool:</span>
                <strong>{poolStats.projectilePoolSize}</strong>
              </div>
              <div className="pool-item">
                <span>Particle Pool:</span>
                <strong>{poolStats.particlePoolSize}</strong>
              </div>
              <div className="pool-item">
                <span>Pool Efficiency:</span>
                <strong>{Math.round(poolStats.efficiency * 100)}%</strong>
              </div>
            </div>
          )}

          <div className="memory-actions">
            <button onClick={() => logger.getMemoryStats()} className="ghost">
              Update Memory Stats
            </button>
            <button onClick={forceGarbageCollection} className="ghost">
              Force Garbage Collection
            </button>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="debug-section">
          <h4>Debug Logs</h4>
          
          <div className="log-controls">
            <label>
              Log Level:
              <select 
                value={logLevel} 
                onChange={(e) => handleLogLevelChange(e.target.value as any)}
              >
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
              </select>
            </label>
            
            <div className="log-actions">
              <button onClick={exportLogs} className="ghost">
                Export Logs
              </button>
              <button onClick={clearLogs} className="ghost">
                Clear Logs
              </button>
            </div>
          </div>

          <div className="log-display">
            <div className="log-header">
              <span>Recent Logs (last 50 entries)</span>
            </div>
            <div className="log-entries">
              {logger.getLogs({ level: logLevel, limit: 50 }).map((log, index) => (
                <div key={index} className={`log-entry ${log.level}`}>
                  <span className="log-time">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="log-level">{log.level.toUpperCase()}</span>
                  {log.category && (
                    <span className="log-category">[{log.category}]</span>
                  )}
                  <span className="log-message">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default EnhancedDebugPanel