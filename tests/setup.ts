import '@testing-library/jest-dom'

// Mock performance.now for testing
const originalPerformanceNow = global.performance.now
global.performance.now = jest.fn(() => 1000)

// Mock canvas context for testing
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  arc: jest.fn(),
  ellipse: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  scale: jest.fn(),
  translate: jest.fn(),
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  })),
  setTransform: jest.fn(),
  setLineDash: jest.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  globalAlpha: 1,
  shadowColor: '',
  shadowBlur: 0,
  font: '',
  textAlign: ''
}) as any)

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  callback(1000)
  return 1
})
global.cancelAnimationFrame = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
global.sessionStorage = localStorageMock

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

// Mock document methods
document.createElement = jest.fn((tag) => {
  const element = {
    getBoundingClientRect: jest.fn(() => ({
      left: 0,
      top: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100
    })),
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    style: {},
    className: '',
    innerHTML: '',
    textContent: '',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getContext: jest.fn(() => ({} as CanvasRenderingContext2D)),
    width: 100,
    height: 100,
    clientWidth: 100,
    clientHeight: 100
  }
  return element as any
})

// Mock getComputedStyle
global.getComputedStyle = jest.fn(() => ({
  getPropertyValue: jest.fn(() => '')
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

// Mock AudioContext
global.AudioContext = jest.fn(() => ({
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    gain: { value: 1 }
  })),
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 440 }
  })),
  destination: {}
}))

// Suppress console warnings/errors during tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  console.error = jest.fn()
  console.warn = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})

// Custom Jest matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      }
    }
  },

  toHaveBeenCalledWithArray(received: any, expected: any[]) {
    const call = received.mock.calls.find((call: any[]) => {
      return JSON.stringify(call) === JSON.stringify(expected)
    })
    const pass = !!call
    if (pass) {
      return {
        message: () => `expected function not to have been called with ${JSON.stringify(expected)}`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected function to have been called with ${JSON.stringify(expected)}`,
        pass: false,
      }
    }
  }
})

// Setup test utilities
global.testUtils = {
  mockVector2: (x: number = 0, y: number = 0) => ({ x, y }),
  mockGameState: () => ({
    status: 'idle' as const,
    resources: { money: 100, lives: 20 },
    enemies: [],
    towers: [],
    projectiles: [],
    particles: [],
    map: {
      worldWidth: 800,
      worldHeight: 600,
      tileSize: 40,
      tileLookup: new Map(),
      path: []
    },
    waves: [],
    currentWaveIndex: 0,
    wavePhase: 'idle' as const,
    path: []
  }),
  mockEnemy: (overrides: Partial<any> = {}) => ({
    id: 'enemy-1',
    position: { x: 0, y: 0 },
    health: 100,
    maxHealth: 100,
    speed: 1,
    pathIndex: 0,
    isDead: false,
    reachedGoal: false,
    slowEffects: [],
    speedMultiplier: 1,
    stats: {
      type: 'basic',
      radius: 10,
      color: '#ff0000'
    },
    rewardClaimed: false,
    ...overrides
  }),
  mockTower: (overrides: Partial<any> = {}) => ({
    id: 'tower-1',
    type: 'indica' as const,
    position: { x: 100, y: 100 },
    gridKey: '2:2',
    range: 80,
    fireRate: 1,
    damage: 50,
    projectileSpeed: 200,
    cooldown: 0,
    color: '#00ff00',
    cost: 50,
    ...overrides
  }),
  createMockCanvas: () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    // Mock canvas methods
    jest.spyOn(canvas, 'getContext').mockReturnValue(ctx)
    jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 0
    })
    
    return { canvas, ctx }
  }
}

// TypeScript declarations for custom globals
declare global {
  var testUtils: {
    mockVector2: (x?: number, y?: number) => { x: number; y: number }
    mockGameState: () => any
    mockEnemy: (overrides?: Partial<any>) => any
    mockTower: (overrides?: Partial<any>) => any
    createMockCanvas: () => { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }
  }
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R
      toHaveBeenCalledWithArray(expected: any[]): R
    }
  }
}

export {}