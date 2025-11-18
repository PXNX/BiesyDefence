import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { GameController } from '@/game/core/GameController'
import type { GameSnapshot, TowerType } from '@/game/core/types'
import { GameControls } from '@/ui/components/GameControls'
import { GameHUD } from '@/ui/components/GameHUD'
import { DebugPanel } from '@/ui/components/DebugPanel'
import { TowerPicker } from '@/ui/components/TowerPicker'
import { audioManager } from '@/game/audio/AudioManager'
import type { AudioConfig } from '@/game/audio/AudioManager'

const initialTower: TowerType = 'indica'

function App() {
  const controllerRef = useRef<GameController | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null)
  const [selectedTower, setSelectedTower] = useState<TowerType>(initialTower)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showHowToPlay, setShowHowToPlay] = useState(false)
  const [quickWaveIndex, setQuickWaveIndex] = useState(0)
  const [audioConfig, setAudioConfig] = useState<AudioConfig>({
    masterVolume: 1.0,
    sfxVolume: 0.8,
    musicVolume: 0.6,
    muted: false
  })

  useEffect(() => {
    const initializeAudio = async () => {
      await audioManager.initialize()
      setAudioConfig(audioManager.getConfig())
    }
    initializeAudio()

    const controller = new GameController()
    controllerRef.current = controller
    const unsubscribe = controller.subscribe(setSnapshot)
    if (canvasRef.current) {
      controller.setCanvas(canvasRef.current)
    }

    return () => {
      unsubscribe()
      controller.destroy()
      audioManager.destroy()
    }
  }, [])

  useEffect(() => {
    if (!snapshot) {
      return
    }

    const maxIndex = Math.max(snapshot.wave.total - 1, 0)
    setQuickWaveIndex((prev) => Math.min(prev, maxIndex))
  }, [snapshot?.wave.total])

  useEffect(() => {
    controllerRef.current?.setPreviewTowerType(selectedTower)
  }, [selectedTower])

  const handleCanvasClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const controller = controllerRef.current
    if (!controller) {
      return
    }

    const result = controller.placeTowerFromScreen(event.clientX, event.clientY, selectedTower)
    setFeedback(result.message)
  }

  const handleCanvasMove = (event: MouseEvent<HTMLCanvasElement>) => {
    controllerRef.current?.updateHover(event.clientX, event.clientY)
  }

  const handleCanvasLeave = () => {
    controllerRef.current?.clearHover()
  }

  const handleSelectTower = (type: TowerType) => {
    setSelectedTower(type)
    setFeedback(null)
  }

  const handleStart = () => controllerRef.current?.start()
  const handlePause = () => controllerRef.current?.pause()
  const handleReset = () => controllerRef.current?.resetGame()
  const handleSpeedChange = (speed: number) => {
    controllerRef.current?.setGameSpeed(speed)
    setFeedback(`Game speed set to ${speed}x`)
  }
  const handleNextWave = () => {
    const controller = controllerRef.current
    if (!controller) {
      return
    }

    const started = controller.beginNextWave()
    if (started) {
      setFeedback('Next wave deployed.')
    } else {
      setFeedback('Wave not ready yet.')
    }
  }

  const handleToggleRanges = () => {
    controllerRef.current?.toggleShowRanges()
  }

  const handleToggleHitboxes = () => {
    controllerRef.current?.toggleShowHitboxes()
  }

  const handleSetQuickWave = (index: number) => {
    setQuickWaveIndex(index)
  }

  const handleQuickStartWave = () => {
    const controller = controllerRef.current
    if (!controller) {
      return
    }

    controller.quickSetWave(quickWaveIndex)
    setFeedback(`Wave ${quickWaveIndex + 1} loaded.`)
  }

  const handleToggleHowToPlay = () => {
    setShowHowToPlay((prev) => !prev)
  }

  // Audio control handlers
  const handleMasterVolumeChange = (volume: number) => {
    audioManager.setMasterVolume(volume)
    setAudioConfig(audioManager.getConfig())
  }

  const handleSfxVolumeChange = (volume: number) => {
    audioManager.setSfxVolume(volume)
    setAudioConfig(audioManager.getConfig())
  }

  const handleMusicVolumeChange = (volume: number) => {
    audioManager.setMusicVolume(volume)
    setAudioConfig(audioManager.getConfig())
  }

  const handleToggleMute = () => {
    audioManager.setMuted(!audioConfig.muted)
    setAudioConfig(audioManager.getConfig())
  }

  // Keyboard shortcuts and accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault()
          if (snapshot?.status === 'running') {
            handlePause()
          } else {
            handleStart()
          }
          break
        case 'KeyR':
          event.preventDefault()
          handleReset()
          break
        case 'KeyN':
          event.preventDefault()
          if (snapshot?.nextWaveAvailable) {
            handleNextWave()
          }
          break
        case 'Digit1':
          event.preventDefault()
          handleSpeedChange(1)
          break
        case 'Digit2':
          event.preventDefault()
          handleSpeedChange(2)
          break
        case 'Digit3':
          event.preventDefault()
          handleSpeedChange(4)
          break
        case 'Escape':
          event.preventDefault()
          // Cancel tower selection (reset to first available tower)
          handleSelectTower('indica')
          setFeedback('Tower selection cancelled')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [snapshot, handleStart, handlePause, handleReset, handleNextWave, handleSpeedChange])

  // Handle custom reset event from HUD overlays
  useEffect(() => {
    const handleResetGame = () => {
      handleRetry()
    }

    window.addEventListener('resetGame', handleResetGame)
    return () => window.removeEventListener('resetGame', handleResetGame)
  }, [handleRetry])

  const handleRetry = () => {
    const controller = controllerRef.current
    if (!controller) {
      return
    }

    controller.reset()
    controller.start()
    setFeedback('Resetting the loop...')
  }

  const showStartOverlay = snapshot?.status === 'idle'
  const showGameOverOverlay =
    snapshot?.status === 'won' || snapshot?.status === 'lost'

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Cannabis Cultivation Defense</p>
          <h1>Phased Bio-Defense</h1>
          <p className="subtitle">Alpha prototype - Phase 1+2 build</p>
        </div>
        <GameHUD snapshot={snapshot} />
        <GameControls
          status={snapshot?.status ?? 'idle'}
          onStart={handleStart}
          onPause={handlePause}
          onNextWave={handleNextWave}
          onReset={handleReset}
          nextWaveAvailable={snapshot?.nextWaveAvailable ?? false}
          gameSpeed={snapshot?.gameSpeed ?? 1}
          onSpeedChange={handleSpeedChange}
          audioConfig={audioConfig}
          onMasterVolumeChange={handleMasterVolumeChange}
          onSfxVolumeChange={handleSfxVolumeChange}
          onMusicVolumeChange={handleMusicVolumeChange}
          onToggleMute={handleToggleMute}
        />
      </header>

      <main className="main-stage">
        <section className="tower-column">
          <TowerPicker
            selected={selectedTower}
            onSelect={handleSelectTower}
            feedback={feedback}
            currentMoney={snapshot?.money ?? 0}
          />
          <DebugPanel
            showRanges={snapshot?.showRanges ?? false}
            showHitboxes={snapshot?.showHitboxes ?? false}
            fps={snapshot?.fps ?? 0}
            currentWave={snapshot?.wave.current ?? 1}
            totalWaves={snapshot?.wave.total ?? 1}
            quickWaveIndex={quickWaveIndex}
            onToggleRanges={handleToggleRanges}
            onToggleHitboxes={handleToggleHitboxes}
            onSetQuickWave={handleSetQuickWave}
            onQuickStartWave={handleQuickStartWave}
          />
        </section>

        <section className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMove}
            onMouseLeave={handleCanvasLeave}
          />
        </section>
      </main>

      <div className={`overlay-panel start-overlay ${showStartOverlay ? 'visible' : ''}`}>
        <div className="overlay-card">
          <p className="eyebrow">Seed the Defense</p>
          <h2>Play the prototype loop</h2>
          <p className="overlay-subtext">
            Place towers, control the tempo, and push waves back. Deploy towers tactically before
            releasing each wave.
          </p>
          <div className="overlay-actions">
            <button className="primary" onClick={handleStart}>
              Play
            </button>
            <button className="ghost" onClick={handleToggleHowToPlay}>
              {showHowToPlay ? 'Hide tips' : 'How to play'}
            </button>
          </div>
          {showHowToPlay && (
            <div className="how-to-panel">
              <h4>🎮 How to Play</h4>
              <div className="how-to-section">
                <h5>🏗️ Tower Strategy</h5>
                <p>• <strong>Indica:</strong> Heavy damage, slow fire rate - best for tough enemies</p>
                <p>• <strong>Sativa:</strong> Fast fire rate, lower damage - keeps enemies at bay</p>
                <p>• <strong>Support:</strong> Slows enemies down, no direct damage - pairs with shooters</p>
              </div>
              <div className="how-to-section">
                <h5>💰 Economy & Survival</h5>
                <p>• Earn money by defeating enemies</p>
                <p>• Lose lives when enemies reach the end</p>
                <p>• Build strategically before starting waves</p>
              </div>
              <div className="how-to-section">
                <h5>⌨️ Keyboard Shortcuts</h5>
                <p>• <strong>Space:</strong> Start/Pause game</p>
                <p>• <strong>1, 2, 3:</strong> Change game speed (1x, 2x, 4x)</p>
                <p>• <strong>N:</strong> Start next wave</p>
                <p>• <strong>R:</strong> Reset game</p>
                <p>• <strong>Esc:</strong> Cancel tower selection</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`overlay-panel gameover-overlay ${showGameOverOverlay ? 'visible' : ''}`}>
        <div className="overlay-card">
          <p className="eyebrow">{snapshot?.status === 'won' ? 'Trophy' : 'Warning'}</p>
          <h2>{snapshot?.status === 'won' ? 'Garden Secured' : 'Garden Lost'}</h2>
          <p className="overlay-subtext">
            {snapshot?.status === 'won'
              ? 'You stood strong through the planned waves. Restart to test balance.'
              : 'The path was breached. Reset the prototype when you are ready to retry.'}
          </p>
          <button className="primary" onClick={handleRetry}>
            Retry
          </button>
        </div>
      </div>
    </div>
  )
}

export default App


