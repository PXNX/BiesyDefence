export interface AudioConfig {
  masterVolume: number
  sfxVolume: number
  musicVolume: number
  muted: boolean
}

export interface SoundEffect {
  name: string
  buffer: AudioBuffer
  volume: number
  pitch?: number
}

export class AudioManager {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private musicGain: GainNode | null = null
  private soundEffects: Map<string, AudioBuffer> = new Map()
  private currentMusic: AudioBufferSourceNode | null = null
  private config: AudioConfig = {
    masterVolume: 1.0,
    sfxVolume: 0.8,
    musicVolume: 0.6,
    muted: false
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Web Audio Context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Create gain nodes for audio routing
      this.masterGain = this.audioContext.createGain()
      this.sfxGain = this.audioContext.createGain()
      this.musicGain = this.audioContext.createGain()
      
      // Connect audio graph
      this.sfxGain.connect(this.masterGain)
      this.musicGain.connect(this.masterGain)
      this.masterGain.connect(this.audioContext.destination)
      
      // Apply initial volume settings
      this.updateVolume()
      
      // Resume context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
      
      // Load sound effects
      await this.loadAllSoundEffects()
      
      console.log('AudioManager initialized successfully')
    } catch (error) {
      console.warn('AudioManager initialization failed:', error)
      // Graceful fallback - continue without audio
      this.config.muted = true
    }
  }

  private updateVolume(): void {
    if (!this.masterGain || !this.sfxGain || !this.musicGain) return
    
    const masterVolume = this.config.muted ? 0 : this.config.masterVolume
    
    this.masterGain.gain.setValueAtTime(masterVolume, this.audioContext!.currentTime)
    this.sfxGain.gain.setValueAtTime(this.config.sfxVolume, this.audioContext!.currentTime)
    this.musicGain.gain.setValueAtTime(this.config.musicVolume, this.audioContext!.currentTime)
  }

  private async loadAllSoundEffects(): Promise<void> {
    const soundFiles = [
      'tower-shoot-indica',
      'tower-shoot-sativa', 
      'tower-shoot-support',
      'enemy-hit',
      'enemy-death',
      'wave-start',
      'wave-complete',
      'tower-place',
      'tower-upgrade',
      'game-over',
      'victory'
    ]

    const loadPromises = soundFiles.map(name => this.loadSoundEffect(name))
    await Promise.all(loadPromises)
  }

  private async loadSoundEffect(name: string): Promise<void> {
    if (!this.audioContext) return
    
    try {
      // Generate procedural sound effects instead of loading files
      const buffer = this.generateSoundEffect(name)
      if (buffer) {
        this.soundEffects.set(name, buffer)
      }
    } catch (error) {
      console.warn(`Failed to load sound effect: ${name}`, error)
    }
  }

  private generateSoundEffect(name: string): AudioBuffer | null {
    if (!this.audioContext) return null
    
    const duration = 0.3 // Most effects are short
    const sampleRate = this.audioContext.sampleRate
    const length = Math.floor(duration * sampleRate)
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)
    
    // Generate procedural sound effects based on name
    switch (name) {
      case 'tower-shoot-indica':
        // Deep, heavy shooting sound for indica tower
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freq = 200 - (t * 100) // Decreasing frequency
          const envelope = Math.exp(-t * 8) // Quick decay
          data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3
        }
        break
        
      case 'tower-shoot-sativa':
        // High, sharp shooting sound for sativa tower
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freq = 600 + (t * 200) // Slight frequency increase
          const envelope = Math.exp(-t * 6) // Medium decay
          const wave = Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(2 * Math.PI * freq * 2 * t)
          data[i] = wave * envelope * 0.2
        }
        break
        
      case 'tower-shoot-support':
        // Energy/beam sound for support tower
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freq = 400 + Math.sin(t * 50) * 100 // Wobbling frequency
          const envelope = Math.exp(-t * 4) // Slow decay
          const wave = Math.sin(2 * Math.PI * freq * t) * 0.5 + Math.sin(2 * Math.PI * freq * 0.5 * t) * 0.5
          data[i] = wave * envelope * 0.25
        }
        break
        
      case 'enemy-hit':
        // Impact/thud sound
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freq = 150 + Math.random() * 50 // Slight variation
          const envelope = Math.exp(-t * 15) // Very quick decay
          const noise = (Math.random() - 0.5) * 0.5
          const tone = Math.sin(2 * Math.PI * freq * t) * 0.7
          data[i] = (tone + noise) * envelope * 0.4
        }
        break
        
      case 'enemy-death':
        // Destruction sound
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freq = 300 - (t * 200) // Dramatic drop
          const envelope = Math.exp(-t * 3) // Medium decay
          const noise = (Math.random() - 0.5) * 0.8
          const tone = Math.sin(2 * Math.PI * freq * t) * 0.4
          data[i] = (tone + noise) * envelope * 0.5
        }
        break
        
      case 'wave-start':
        // Alert/challenge sound
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freq = 220 + Math.sin(t * 8) * 20 // Subtle warble
          const envelope = Math.exp(-t * 2) // Slow decay
          const wave = Math.sin(2 * Math.PI * freq * t) + 0.5 * Math.sin(2 * Math.PI * freq * 3 * t)
          data[i] = wave * envelope * 0.3
        }
        break
        
      case 'wave-complete':
        // Success sound
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freq1 = 440 // A4
          const freq2 = 554.37 // C#5
          const freq3 = 659.25 // E5
          const envelope = Math.exp(-t * 1.5) // Long decay
          const wave = Math.sin(2 * Math.PI * freq1 * t) + 0.7 * Math.sin(2 * Math.PI * freq2 * t) + 0.5 * Math.sin(2 * Math.PI * freq3 * t)
          data[i] = wave * envelope * 0.2
        }
        break
        
      case 'tower-place':
        // Satisfying placement sound
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freq = 800 - (t * 400) // Descending tone
          const envelope = Math.exp(-t * 4) // Medium decay
          const wave = Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(2 * Math.PI * freq * 2 * t)
          data[i] = wave * envelope * 0.25
        }
        break
        
      case 'tower-upgrade':
        // Enhancement sound
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freq = 600 + Math.sin(t * 20) * 100 // Gentle wobble
          const envelope = Math.exp(-t * 3) // Medium decay
          const wave = Math.sin(2 * Math.PI * freq * t) + 0.4 * Math.sin(2 * Math.PI * freq * 1.5 * t)
          data[i] = wave * envelope * 0.3
        }
        break
        
      case 'game-over':
        // Game over sound
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freq = 200 - (t * 50) // Slow descent
          const envelope = Math.exp(-t * 0.8) // Very slow decay
          const wave = Math.sin(2 * Math.PI * freq * t) + 0.5 * Math.sin(2 * Math.PI * freq * 0.5 * t)
          data[i] = wave * envelope * 0.4
        }
        break
        
      case 'victory':
        // Victory fanfare
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          const freqs = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
          const envelope = Math.exp(-t * 1.2) // Long decay
          const wave = freqs.reduce((sum, freq, index) => {
            return sum + Math.sin(2 * Math.PI * freq * t) * (1 - index * 0.2)
          }, 0) / freqs.length
          data[i] = wave * envelope * 0.3
        }
        break
        
      default:
        // Fallback: simple beep
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate
          data[i] = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 10) * 0.2
        }
        break
    }
    
    return buffer
  }

  playSoundEffect(name: string, volume: number = 1.0, pitch: number = 1.0): void {
    if (!this.audioContext || !this.sfxGain || this.config.muted) return
    
    const buffer = this.soundEffects.get(name)
    if (!buffer) return
    
    try {
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()
      
      source.buffer = buffer
      source.playbackRate.value = pitch
      gainNode.gain.value = volume
      
      source.connect(gainNode)
      gainNode.connect(this.sfxGain)
      
      source.start()
      
      // Clean up after sound finishes
      source.onended = () => {
        source.disconnect()
        gainNode.disconnect()
      }
    } catch (error) {
      console.warn(`Failed to play sound effect: ${name}`, error)
    }
  }

  playMusic(name: string, loop: boolean = true): void {
    if (!this.audioContext || !this.musicGain || this.config.muted) return
    
    this.stopMusic()
    
    const buffer = this.soundEffects.get(name)
    if (!buffer) return
    
    try {
      this.currentMusic = this.audioContext.createBufferSource()
      this.currentMusic.buffer = buffer
      this.currentMusic.loop = loop
      this.currentMusic.connect(this.musicGain)
      this.currentMusic.start()
    } catch (error) {
      console.warn(`Failed to play music: ${name}`, error)
    }
  }

  stopMusic(): void {
    if (this.currentMusic) {
      try {
        this.currentMusic.stop()
        this.currentMusic.disconnect()
      } catch (error) {
        // Ignore errors when stopping already finished sounds
      }
      this.currentMusic = null
    }
  }

  setMasterVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(1, volume))
    this.updateVolume()
  }

  setSfxVolume(volume: number): void {
    this.config.sfxVolume = Math.max(0, Math.min(1, volume))
    this.updateVolume()
  }

  setMusicVolume(volume: number): void {
    this.config.musicVolume = Math.max(0, Math.min(1, volume))
    this.updateVolume()
  }

  setMuted(muted: boolean): void {
    this.config.muted = muted
    this.updateVolume()
  }

  getConfig(): AudioConfig {
    return { ...this.config }
  }

  destroy(): void {
    this.stopMusic()
    
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    
    this.soundEffects.clear()
  }
}

// Singleton instance
export const audioManager = new AudioManager()