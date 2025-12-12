import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { GameController } from '@/game/core/GameController';
import type {
  GameSnapshot,
  GameStatus,
  TowerType,
  EnemyType,
  AchievementView,
} from '@/game/core/types';
import { StatsCornerLayout } from '@/ui/components/StatsCornerLayout';
import { GameControlPanel } from '@/ui/components/GameControlPanel';
import { SpawnTicker } from '@/ui/components/SpawnTicker';
import { WavePreviewPanel } from '@/ui/components/WavePreviewPanel';
import { WaveSummaryCard } from '@/ui/components/WaveSummaryCard';
import { EnemyIntelPanel } from '@/ui/components/EnemyIntelPanel';
import { AchievementToast } from '@/ui/components/AchievementToast';
import { AchievementPanel } from '@/ui/components/AchievementPanel';
import { HUD } from '@/ui/components/HUD';
import { WaveControl } from '@/ui/components/WaveControl';
import { TowerShop } from '@/ui/components/TowerShop';
import { ModifierDisplay } from '@/ui/components/ModifierDisplay';
import { DebugPanel } from '@/ui/components/DebugPanel';
import { audioManager } from '@/game/audio/AudioManager';
import type { AudioConfig } from '@/game/audio/AudioManager';
import { ErrorBoundary } from '@/ui/components/ErrorBoundary';
import { TelemetryPanel } from '@/ui/components/TelemetryPanel';
import { TowerRadialMenu } from '@/ui/components/TowerRadialMenu';
import './ui/components/TowerRadialMenu.css';
import { TOWER_UPGRADES } from '@/game/config/upgrades';
import {
  TranslationService,
  LanguageDetector,
  type Language,
} from '@/localization';
import { useGameStore } from '@/game/store/gameStore';

import { GAME_CONFIG } from '@/game/config/gameConfig';

const initialTower: TowerType = 'indica';

type AppPhase = 'loading' | 'idle' | 'playing' | 'gameover' | 'resetting';

function App() {
  const controllerRef = useRef<GameController | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startOverlayRef = useRef<HTMLDivElement | null>(null);
  const gameOverOverlayRef = useRef<HTMLDivElement | null>(null);
  const translationService = useMemo(
    () => TranslationService.getInstance(),
    []
  );
  const languageDetector = useMemo(() => LanguageDetector.getInstance(), []);

  // Use store instead of local state
  const snapshot = useGameStore(state => state);
  const selectedTower = useGameStore(state => state.selectedTowerId) as TowerType | null;
  const feedback = useGameStore(state => state.feedback);
  const setFeedback = useGameStore(state => state.setFeedback);
  const setSelectedTower = useGameStore(state => state.setSelectedTower);
  const updateSnapshot = useGameStore(state => state.updateSnapshot);

  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [quickWaveIndex, setQuickWaveIndex] = useState(0);
  const [audioConfig, setAudioConfig] = useState<AudioConfig>({
    masterVolume: 1.0,
    sfxVolume: 0.8,
    musicVolume: 0.6,
    muted: false,
  });
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [audioContextUnlocked, setAudioContextUnlocked] = useState(false);
  const snapshotStatus = snapshot?.status;
  const [appPhase, setAppPhase] = useState<AppPhase>('loading');
  const [resetPending, setResetPending] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string | null>(null);
  const prevStatusRef = useRef<GameStatus | null>(null);
  const announcementTimerRef = useRef<number | null>(null);
  const [showTelemetryPanel, setShowTelemetryPanel] = useState(true);
  const [showAchievementPanel, setShowAchievementPanel] = useState(false);
  const [achievementToasts, setAchievementToasts] = useState<AchievementView[]>(
    []
  );
  const [language, setLanguage] = useState<Language>(
    translationService.getCurrentLanguage()
  );
  const languageOptions = translationService.getSupportedLanguages();

  const t = useCallback(
    (key: string, fallback: string) => translationService.t(key, { fallback }),
    [translationService, language]
  );

  useEffect(() => {
    const detected = languageDetector.detectUserPreferences();
    translationService.setLanguage(detected.language);
    setLanguage(detected.language);
    const unsubscribe = translationService.subscribe(lang => setLanguage(lang));
    return () => unsubscribe();
  }, [languageDetector, translationService]);

  useEffect(() => {
    const initializeAudio = async () => {
      await audioManager.initialize();
      setAudioConfig(audioManager.getConfig());
      setIsAudioReady(true);
    };
    initializeAudio();

    const controller = new GameController();
    controllerRef.current = controller;

    if (canvasRef.current) {
      controller.setCanvas(canvasRef.current);
    }

    return () => {
      controller.destroy();
      audioManager.destroy();
    };
  }, []);

  const unlockAudioContext = useCallback(async () => {
    if (audioContextUnlocked) {
      return;
    }

    try {
      await audioManager.resumeOnGesture();
      setAudioContextUnlocked(true);
    } catch (error) {
      console.warn('Audio context resume failed', error);
    }
  }, [audioContextUnlocked]);

  useEffect(() => {
    if (!snapshot) {
      return;
    }

    const maxIndex = Math.max(snapshot.wave.total - 1, 0);
    setQuickWaveIndex(prev => Math.min(prev, maxIndex));
  }, [snapshot?.wave.total]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timer = window.setTimeout(() => {
      setFeedback(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    controllerRef.current?.setPreviewTowerType(selectedTower);
  }, [selectedTower]);

  const attemptTowerUpgrade = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    const result = controller.upgradeHoveredTower();
    setFeedback(result.message);
    if (result.success) {
      audioManager.playSoundEffect('tower-upgrade');
    }
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'u') {
        attemptTowerUpgrade();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [attemptTowerUpgrade]);

  useEffect(() => {
    if (!snapshotStatus || !isAudioReady) {
      setAppPhase('loading');
      return;
    }

    if (resetPending) {
      setAppPhase('resetting');
      return;
    }

    if (snapshotStatus === 'won' || snapshotStatus === 'lost') {
      setAppPhase('gameover');
      return;
    }

    if (snapshotStatus === 'running' || snapshotStatus === 'paused') {
      setAppPhase('playing');
      return;
    }

    setAppPhase('idle');
  }, [snapshotStatus, isAudioReady, resetPending]);

  useEffect(() => {
    if (!resetPending || !snapshotStatus) {
      return;
    }

    if (snapshotStatus === 'idle' || snapshotStatus === 'running') {
      setResetPending(false);
    }
  }, [resetPending, snapshotStatus]);

  useEffect(() => {
    if (!snapshot) {
      prevStatusRef.current = null;
      setLiveAnnouncement(null);
      return;
    }

    const previousStatus = prevStatusRef.current;
    const currentStatus = snapshot.status;

    if (previousStatus === currentStatus) {
      return;
    }

    prevStatusRef.current = currentStatus;

    let message: string | null = null;
    const currentPreview = snapshot.wavePreview?.[0];
    if (currentStatus === 'won') {
      message = 'Victory! The prototype loop is cleared.';
    } else if (currentStatus === 'lost') {
      message = 'Game over! Reset to defend again.';
    } else if (currentStatus === 'running' && previousStatus !== 'running') {
      const warningText =
        currentPreview && currentPreview.warnings.length > 0
          ? ` - ${currentPreview.warnings.join(' · ')}`
          : '';
      message = `Wave ${snapshot.wave.current} launched${warningText}.`;
    }

    if (!message) {
      return;
    }

    setLiveAnnouncement(message);
    if (announcementTimerRef.current) {
      window.clearTimeout(announcementTimerRef.current);
    }

    announcementTimerRef.current = window.setTimeout(() => {
      setLiveAnnouncement(null);
      announcementTimerRef.current = null;
    }, 4000);

    return () => {
      if (announcementTimerRef.current) {
        window.clearTimeout(announcementTimerRef.current);
        announcementTimerRef.current = null;
      }
    };
  }, [snapshot]);

  useEffect(() => {
    if (
      !snapshot?.achievementNotifications ||
      snapshot.achievementNotifications.length === 0
    ) {
      return;
    }

    setAchievementToasts(prev => {
      const existing = new Set(prev.map(a => a.id));
      const fresh = snapshot.achievementNotifications!.filter(
        item => !existing.has(item.id)
      );
      fresh.forEach(item => {
        window.setTimeout(() => {
          setAchievementToasts(current =>
            current.filter(t => t.id !== item.id)
          );
        }, 4200);
      });
      return [...prev, ...fresh];
    });
  }, [snapshot?.achievementNotifications]);

  const dismissToast = useCallback((id: string) => {
    setAchievementToasts(prev => prev.filter(item => item.id !== id));
  }, []);

  useEffect(() => {
    return () => {
      if (announcementTimerRef.current) {
        window.clearTimeout(announcementTimerRef.current);
      }
    };
  }, []);

  const handleCanvasClick = (event: MouseEvent<HTMLCanvasElement>) => {
    void unlockAudioContext();
    const controller = controllerRef.current;
    if (!controller) {
      return;
    }

    if (controller.consumePlacementSuppression()) {
      return;
    }

    const selection = controller.selectTowerAtScreen(
      event.clientX,
      event.clientY
    );
    if (selection.hitTower) {
      setFeedback(selection.message);
      return;
    }

    if (!selectedTower) {
      setFeedback('Select a tower to build.');
      return;
    }

    const result = controller.placeTowerFromScreen(
      event.clientX,
      event.clientY,
      selectedTower
    );
    setFeedback(result.message);
  };

  const handleCanvasContextMenu = (event: MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const controller = controllerRef.current;
    controller?.setPreviewTowerType(null);
    controller?.clearSelection();
    controller?.clearHover();
    setSelectedTower(null);
    setFeedback('Tower selection cancelled');
  };

  const handleSelectTower = (type: TowerType) => {
    setSelectedTower(type);
    setFeedback(null);
  };

  const handleStart = useCallback(async () => {
    await unlockAudioContext();
    controllerRef.current?.start();
  }, [unlockAudioContext]);
  const handlePause = useCallback(() => controllerRef.current?.pause(), []);
  const handleReset = useCallback(async () => {
    await unlockAudioContext();
    setResetPending(true);
    setAppPhase('resetting');
    controllerRef.current?.resetGame();
  }, [setResetPending, setAppPhase, unlockAudioContext]);
  const handleSpeedChange = useCallback(
    (speed: number) => {
      controllerRef.current?.setGameSpeed(speed);
      setFeedback(`Game speed set to ${speed}x`);
    },
    [setFeedback]
  );
  const handleNextWave = useCallback(async () => {
    await unlockAudioContext();
    const controller = controllerRef.current;
    if (!controller) {
      return;
    }
    controller.beginNextWave();
  }, [unlockAudioContext]);

  const handleSetQuickWave = (index: number) => {
    setQuickWaveIndex(index);
  };

  const handleQuickStartWave = () => {
    void unlockAudioContext();
    const controller = controllerRef.current;
    if (!controller) {
      return;
    }

    controller.quickSetWave(quickWaveIndex);
    setFeedback(`Wave ${quickWaveIndex + 1} loaded.`);
  };

  const handleToggleHowToPlay = () => {
    setShowHowToPlay(prev => !prev);
  };
  const handleToggleTelemetry = useCallback(() => {
    setShowTelemetryPanel(prev => !prev);
  }, []);

  const handleToggleAutoWave = useCallback((enabled: boolean) => {
    const controller = controllerRef.current;
    if (!controller) return;
    controller.setAutoWave(enabled);
  }, []);

  const handleToggleRanges = useCallback(() => {
    controllerRef.current?.toggleShowRanges();
  }, []);

  const handleToggleHitboxes = useCallback(() => {
    controllerRef.current?.toggleShowHitboxes();
  }, []);

  const handleUpgradeLevel = useCallback((towerId: string) => {
    const controller = controllerRef.current;
    if (!controller) return;
    const result = controller.upgradeTowerLevel(towerId);
    setFeedback(result.message);
    if (result.success) {
      audioManager.playSoundEffect('tower-upgrade');
    }
  }, []);

  const handleBuyPerk = useCallback((towerId: string, perkId: string) => {
    const controller = controllerRef.current;
    if (!controller) return;
    const result = controller.buyTowerPerk(towerId, perkId);
    setFeedback(result.message);
    if (result.success) {
      audioManager.playSoundEffect('tower-upgrade');
    }
  }, []);

  // Hotkeys: Core upgrade (1/2/3), Branch A (Q/W), Branch B (E/R)
  const tryUpgradeHotkey = useCallback(
    (action: 'core' | 'branchA' | 'branchB') => {
      const controller = controllerRef.current;
      const targetTower = snapshot?.hoverTower;
      if (!controller || !targetTower) return;

      if (action === 'core') {
        const result = controller.upgradeTowerLevel(targetTower.id);
        setFeedback(result.message);
        if (result.success) audioManager.playSoundEffect('tower-upgrade');
        return;
      }

      const plan = TOWER_UPGRADES[targetTower.type];
      const owned = new Set(targetTower.upgradeState?.perks ?? []);
      const branchId = action === 'branchA' ? 'A' : 'B';
      const nextPerk = plan?.perks.filter(
        p => p.branch === branchId && !owned.has(p.id)
      )[0];
      if (!nextPerk) {
        setFeedback(`Keine Perks mehr in Branch ${branchId}.`);
        return;
      }
      const result = controller.buyTowerPerk(targetTower.id, nextPerk.id);
      setFeedback(result.message);
      if (result.success) audioManager.playSoundEffect('tower-upgrade');
    },
    [snapshot]
  );

  // Audio control handlers
  const handleMasterVolumeChange = (volume: number) => {
    void unlockAudioContext();
    audioManager.setMasterVolume(volume);
    setAudioConfig(audioManager.getConfig());
  };

  const handleSfxVolumeChange = (volume: number) => {
    void unlockAudioContext();
    audioManager.setSfxVolume(volume);
    setAudioConfig(audioManager.getConfig());
  };

  const handleMusicVolumeChange = (volume: number) => {
    void unlockAudioContext();
    audioManager.setMusicVolume(volume);
    setAudioConfig(audioManager.getConfig());
  };

  const handleToggleMute = () => {
    void unlockAudioContext();
    audioManager.setMuted(!audioConfig.muted);
    setAudioConfig(audioManager.getConfig());
  };

  const handleLanguageChange = (lang: Language) => {
    translationService.setLanguage(lang);
    setLanguage(lang);
  };

  const handleRetry = useCallback(async () => {
    await unlockAudioContext();
    const controller = controllerRef.current;
    if (!controller) {
      return;
    }

    setResetPending(true);
    setAppPhase('resetting');

    controller.resetGame();
    controller.start();
    setFeedback('Resetting the loop...');
  }, [setFeedback, setAppPhase, setResetPending, unlockAudioContext]);

  const showStartOverlay = snapshotStatus === 'idle' && appPhase === 'idle';
  const showGameOverOverlay =
    snapshot?.status === 'won' || snapshot?.status === 'lost';
  const isAppBusy = appPhase === 'loading' || appPhase === 'resetting';
  const waveLabel = snapshot
    ? `${snapshot.wave.current}/${snapshot.wave.total}`
    : '--/--';
  const nextWaveTypes: EnemyType[] =
    snapshot?.wavePreview?.[0]?.composition.map(c => c.type as EnemyType) ?? [];
  const hasIntel =
    (snapshot?.wavePreview?.length ?? 0) > 0 ||
    nextWaveTypes.length > 0 ||
    Boolean(snapshot?.lastWaveSummary);
  const canvasStatusMessage = !isAudioReady
    ? t('app.loading_audio', 'Loading audio...')
    : appPhase === 'resetting'
      ? t('app.resetting', 'Resetting the prototype...')
      : !snapshot
        ? t('app.preparing_map', 'Preparing the battle map...')
        : undefined;
  const isCanvasBusy = Boolean(canvasStatusMessage);

  // Keyboard shortcuts and accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.code) {
        case 'Space': {
          event.preventDefault();
          if (snapshot?.status === 'running') {
            handlePause();
          } else {
            handleStart();
          }
          break;
        }
        case 'KeyR': {
          event.preventDefault();
          if (snapshot?.hoverTower) {
            tryUpgradeHotkey('branchB');
          } else {
            handleReset();
          }
          break;
        }
        case 'KeyN': {
          event.preventDefault();
          if (snapshot?.nextWaveAvailable) {
            handleNextWave();
          }
          break;
        }
        case 'KeyT': {
          event.preventDefault();
          handleToggleTelemetry();
          break;
        }
        case 'KeyQ':
        case 'KeyW': {
          event.preventDefault();
          tryUpgradeHotkey('branchA');
          break;
        }
        case 'KeyE': {
          event.preventDefault();
          tryUpgradeHotkey('branchB');
          break;
        }
        case 'Digit1':
        case 'Digit2':
        case 'Digit3': {
          event.preventDefault();
          if (snapshot?.hoverTower) {
            tryUpgradeHotkey('core');
          } else {
            const speed =
              event.code === 'Digit1' ? 1 : event.code === 'Digit2' ? 2 : 4;
            handleSpeedChange(speed);
          }
          break;
        }
        case 'Escape': {
          event.preventDefault();
          if (showGameOverOverlay) {
            handleRetry();
          } else {
            controllerRef.current?.setPreviewTowerType(null);
            controllerRef.current?.clearHover();
            setSelectedTower(null);
            setFeedback('Tower selection cancelled');
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    snapshot,
    handleStart,
    handlePause,
    handleReset,
    handleNextWave,
    handleSpeedChange,
    handleRetry,
    handleToggleTelemetry,
    showGameOverOverlay,
    tryUpgradeHotkey,
  ]);

  useEffect(() => {
    const activeOverlay = showStartOverlay
      ? startOverlayRef.current
      : showGameOverOverlay
        ? gameOverOverlayRef.current
        : null;

    if (!activeOverlay) {
      return;
    }

    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(
      activeOverlay.querySelectorAll<HTMLElement>(focusableSelectors)
    );
    const firstElement = focusableElements[0] ?? activeOverlay;
    const lastElement =
      focusableElements[focusableElements.length - 1] ?? activeOverlay;

    firstElement?.focus();

    const handleTrap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      if (focusableElements.length === 0) {
        return;
      }

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    activeOverlay.addEventListener('keydown', handleTrap);
    return () => {
      activeOverlay.removeEventListener('keydown', handleTrap);
    };
  }, [showStartOverlay, showGameOverOverlay]);

  return (
    <ErrorBoundary onReset={handleRetry}>
      <div className="app-shell">
        <div
          className="sr-live"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {liveAnnouncement ?? ''}
        </div>
        <main className="game-stage">
          <section className="canvas-column">
            <section className="canvas-scene">
              <section className="canvas-wrapper" aria-busy={isCanvasBusy}>
                {canvasStatusMessage && (
                  <div
                    className="canvas-loading"
                    role="status"
                    aria-live="polite"
                  >
                    <span className="spinner" aria-hidden="true" />
                    <span>{canvasStatusMessage}</span>
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  onContextMenu={handleCanvasContextMenu}
                />
              </section>
              <div className="hud-overlay">
                <HUD />
                <StatsCornerLayout />
                {snapshot &&
                  snapshot.nextSpawnCountdown !== null &&
                  snapshot.nextSpawnDelay !== null && <SpawnTicker />}
              </div>
              {snapshot?.hoverTower && snapshot.hoverTower.screenPosition && (
                <TowerRadialMenu
                  hoverTower={snapshot.hoverTower}
                  money={snapshot.money}
                  onUpgradeLevel={handleUpgradeLevel}
                  onBuyPerk={handleBuyPerk}
                />
              )}
              {snapshot && (
                <aside
                  className="side-dock-panel"
                  aria-label="Controls and towers"
                >
                  <GameControlPanel
                    onSpeedChange={handleSpeedChange}
                    onPauseToggle={handlePause}
                    audioConfig={audioConfig}
                    onToggleMute={handleToggleMute}
                    onMasterVolumeChange={handleMasterVolumeChange}
                    t={t}
                  />
                  <WaveControl
                    onStart={handleStart}
                    onPause={handlePause}
                    onNext={handleNextWave}
                    onToggleAutoWave={handleToggleAutoWave}
                  />
                  <TowerShop onSelect={handleSelectTower} />
                  <TelemetryPanel
                    telemetry={snapshot.telemetry}
                    warnings={snapshot.balanceWarnings ?? []}
                    visible={showTelemetryPanel}
                    onToggle={handleToggleTelemetry}
                  />
                  <ModifierDisplay />
                  {GAME_CONFIG.debug.enableDebugPanels && (
                    <DebugPanel
                      quickWaveIndex={quickWaveIndex}
                      onSetQuickWave={handleSetQuickWave}
                      onQuickStartWave={handleQuickStartWave}
                      onToggleRanges={handleToggleRanges}
                      onToggleHitboxes={handleToggleHitboxes}
                    />
                  )}
                </aside>
              )}
              <div className="info-bar-shell">
                <div
                  className="info-bar"
                  role="status"
                  aria-label="Resource summary"
                >
                  {hasIntel && (
                    <div className="meta-pill intel-trigger">
                      <button
                        type="button"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        {t('app.wave_intel', 'Wave Intel')}
                      </button>
                      <div className="intel-popover">
                        {snapshot?.wavePreview &&
                          snapshot.wavePreview.length > 0 && (
                            <WavePreviewPanel preview={snapshot.wavePreview} />
                          )}
                        {nextWaveTypes.length > 0 && (
                          <EnemyIntelPanel types={nextWaveTypes} />
                        )}
                        {snapshot?.lastWaveSummary && (
                          <WaveSummaryCard summary={snapshot.lastWaveSummary} />
                        )}
                      </div>
                    </div>
                  )}
                  <div className="meta-pill">
                    <span>{t('app.money', 'Money')}</span>
                    <strong>${snapshot?.money ?? 0}</strong>
                  </div>
                  <div className="meta-pill">
                    <span>{t('app.lives', 'Lives')}</span>
                    <strong>{snapshot?.lives ?? 0}</strong>
                  </div>
                  <div className="meta-pill">
                    <span>{t('app.wave', 'Wave')}</span>
                    <strong>{waveLabel}</strong>
                  </div>
                  <div className="meta-pill">
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => setShowAchievementPanel(prev => !prev)}
                    >
                      {t('app.achievements', 'Achievements')}
                    </button>
                  </div>
                  <div className="meta-pill">
                    <label className="language-label" htmlFor="language-select">
                      {t('app.language', 'Language')}
                    </label>
                    <select
                      id="language-select"
                      value={language}
                      onChange={e =>
                        handleLanguageChange(e.target.value as Language)
                      }
                    >
                      {languageOptions.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.nativeName || lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>
          </section>
        </main>
        <div
          className={`overlay-panel start-overlay ${showStartOverlay ? 'visible' : ''}`}
          aria-hidden={!showStartOverlay}
        >
          <div
            ref={startOverlayRef}
            className="overlay-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="start-overlay-title"
            aria-describedby="start-overlay-desc"
            tabIndex={-1}
          >
            <p className="eyebrow">
              {t('app.start_eyebrow', 'Seed the Defense')}
            </p>
            <h2 id="start-overlay-title">
              {t('app.start_title', 'Play the prototype loop')}
            </h2>
            <p id="start-overlay-desc" className="overlay-subtext">
              {t(
                'app.start_desc',
                'Place towers, control the tempo, and push waves back. Deploy towers tactically before releasing each wave.'
              )}
            </p>
            <div className="overlay-actions">
              <button className="primary" onClick={handleStart}>
                {t('app.play', 'Play')}
              </button>
              <button className="ghost" onClick={handleToggleHowToPlay}>
                {showHowToPlay
                  ? t('app.hide_tips', 'Hide tips')
                  : t('app.how_to_play', 'How to play')}
              </button>
            </div>
            {showHowToPlay && (
              <div className="how-to-panel">
                <h4>{t('app.how_to_play', 'How to play')}</h4>
                <div className="how-to-section">
                  <h5>{t('app.how_to_play_towers', 'Tower Strategy')}</h5>
                  <p>
                    - <strong>Indica:</strong>{' '}
                    {t(
                      'app.how_to_play_indica',
                      'Heavy damage, slow fire rate - best for tough enemies'
                    )}
                  </p>
                  <p>
                    - <strong>Sativa:</strong>{' '}
                    {t(
                      'app.how_to_play_sativa',
                      'Fast fire rate, lower damage - keeps enemies at bay'
                    )}
                  </p>
                  <p>
                    - <strong>Support:</strong>{' '}
                    {t(
                      'app.how_to_play_support',
                      'Slows enemies down, no direct damage - pairs with shooters'
                    )}
                  </p>
                </div>
                <div className="how-to-section">
                  <h5>{t('app.how_to_play_economy', 'Economy & Survival')}</h5>
                  <p>
                    -{' '}
                    {t(
                      'app.how_to_play_money',
                      'Earn money by defeating enemies'
                    )}
                  </p>
                  <p>
                    -{' '}
                    {t(
                      'app.how_to_play_lives',
                      'Lose lives when enemies reach the end'
                    )}
                  </p>
                  <p>
                    -{' '}
                    {t(
                      'app.how_to_play_build',
                      'Build strategically before starting waves'
                    )}
                  </p>
                </div>
                <div className="how-to-section">
                  <h5>{t('app.how_to_play_keys', 'Keyboard Shortcuts')}</h5>
                  <p>
                    - <strong>Space:</strong>{' '}
                    {t('app.shortcut_space', 'Start/Pause game')}
                  </p>
                  <p>
                    - <strong>1, 2, 3:</strong>{' '}
                    {t('app.shortcut_speed', 'Change game speed (1x, 2x, 4x)')}
                  </p>
                  <p>
                    - <strong>N:</strong>{' '}
                    {t('app.shortcut_next_wave', 'Start next wave')}
                  </p>
                  <p>
                    - <strong>R:</strong>{' '}
                    {t('app.shortcut_reset', 'Reset game')}
                  </p>
                  <p>
                    - <strong>Esc:</strong>{' '}
                    {t('app.shortcut_cancel', 'Cancel tower selection')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`overlay-panel gameover-overlay ${showGameOverOverlay ? 'visible' : ''}`}
          aria-hidden={!showGameOverOverlay}
        >
          <div
            ref={gameOverOverlayRef}
            className="overlay-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gameover-overlay-title"
            aria-describedby="gameover-overlay-desc"
            tabIndex={-1}
          >
            <p className="eyebrow">
              {snapshot?.status === 'won'
                ? t('app.trophy', 'Trophy')
                : t('app.warning', 'Warning')}
            </p>
            <h2 id="gameover-overlay-title">
              {snapshot?.status === 'won'
                ? t('app.garden_secured', 'Garden Secured')
                : t('app.garden_lost', 'Garden Lost')}
            </h2>
            <p id="gameover-overlay-desc" className="overlay-subtext">
              {snapshot?.status === 'won'
                ? t(
                  'app.gameover_win_desc',
                  'You stood strong through the planned waves. Restart to test balance.'
                )
                : t(
                  'app.gameover_loss_desc',
                  'The path was breached. Reset the prototype when you are ready to retry.'
                )}
            </p>
            <button className="primary" onClick={handleRetry}>
              {t('app.retry', 'Retry')}
            </button>
          </div>
        </div>
        <AchievementToast items={achievementToasts} onDismiss={dismissToast} />
        {snapshot && (
          <AchievementPanel
            achievements={snapshot.achievements ?? []}
            visible={showAchievementPanel}
            onClose={() => setShowAchievementPanel(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
