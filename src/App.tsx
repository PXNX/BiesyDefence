import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { GameController } from '@/game/core/GameController'
import type { GameSnapshot, TowerType } from '@/game/core/types'
import { GameControls } from '@/ui/components/GameControls'
import { GameHUD } from '@/ui/components/GameHUD'
import { DebugPanel } from '@/ui/components/DebugPanel'
import { TowerPicker } from '@/ui/components/TowerPicker'

const initialTower: TowerType = 'indica'

function App() {
  const controllerRef = useRef<GameController | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null)
  const [selectedTower, setSelectedTower] = useState<TowerType>(initialTower)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showHowToPlay, setShowHowToPlay] = useState(false)
  const [quickWaveIndex, setQuickWaveIndex] = useState(0)

  useEffect(() => {
    const controller = new GameController()
    controllerRef.current = controller
    const unsubscribe = controller.subscribe(setSnapshot)
    if (canvasRef.current) {
      controller.setCanvas(canvasRef.current)
    }

    return () => {
      unsubscribe()
      controller.destroy()
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
  const handleReset = () => controllerRef.current?.reset()
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
        />
      </header>

      <main className="main-stage">
        <section className="tower-column">
          <TowerPicker selected={selectedTower} onSelect={handleSelectTower} feedback={feedback} />
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
              <p>– Indica towers hit hard; Sativa towers keep the line clean.</p>
              <p>– Support towers slow pests so your shooters stay on target.</p>
              <p>– Money comes from kills, lives drop if pests reach the end.</p>
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


