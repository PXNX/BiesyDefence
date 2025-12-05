import { logger } from '@/game/utils/logger';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: any;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | ValidationResult;
  sanitize?: (value: any) => any;
}

// Debounce utility for rapid input handling
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

export class InputValidator {
  private static instance: InputValidator;
  private validationCache = new Map<string, ValidationResult>();
  private readonly cacheExpiry = 5000; // 5 seconds

  static getInstance(): InputValidator {
    if (!InputValidator.instance) {
      InputValidator.instance = new InputValidator();
    }
    return InputValidator.instance;
  }

  // Validate tower names
  validateTowerName(name: string): ValidationResult {
    const cacheKey = `towerName_${name}`;
    const cached = this.getCachedValidation(cacheKey);
    if (cached) return cached;

    const rules: ValidationRules = {
      required: true,
      minLength: 1,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9\s\-_]+$/,
      sanitize: value => value.trim(),
    };

    const result = this.validateString(name, rules, 'Tower name');
    this.setCachedValidation(cacheKey, result);
    return result;
  }

  // Validate numeric inputs (coordinates, speeds, etc.)
  validateNumber(
    value: any,
    rules?: Partial<ValidationRules>
  ): ValidationResult {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return {
        isValid: false,
        error: 'Value must be a valid number',
      };
    }

    const validatedRules = {
      ...rules,
      min: rules?.min ?? -Infinity,
      max: rules?.max ?? Infinity,
    };

    if (numValue < validatedRules.min!) {
      return {
        isValid: false,
        error: `Value must be at least ${validatedRules.min}`,
      };
    }

    if (numValue > validatedRules.max!) {
      return {
        isValid: false,
        error: `Value must be at most ${validatedRules.max}`,
      };
    }

    return {
      isValid: true,
      sanitized: numValue,
    };
  }

  // Validate coordinates
  validateCoordinates(
    x: any,
    y: any,
    bounds?: { width: number; height: number }
  ): ValidationResult {
    const xResult = this.validateNumber(x, {
      min: 0,
      max: bounds?.width ?? Infinity,
    });

    const yResult = this.validateNumber(y, {
      min: 0,
      max: bounds?.height ?? Infinity,
    });

    if (!xResult.isValid || !yResult.isValid) {
      return {
        isValid: false,
        error: `Invalid coordinates: ${xResult.error || yResult.error}`,
      };
    }

    return {
      isValid: true,
      sanitized: { x: xResult.sanitized, y: yResult.sanitized },
    };
  }

  // Validate game state transitions
  validateGameStateTransition(
    fromState: string,
    toState: string
  ): ValidationResult {
    const validTransitions = new Map([
      ['idle', ['running', 'paused']],
      ['running', ['paused', 'lost', 'won']],
      ['paused', ['running', 'idle']],
      ['lost', ['idle']],
      ['won', ['idle']],
    ]);

    const allowed = validTransitions.get(fromState) || [];

    if (!allowed.includes(toState)) {
      logger.warn(
        'Invalid game state transition',
        {
          from: fromState,
          to: toState,
          allowed,
        },
        'input'
      );

      return {
        isValid: false,
        error: `Cannot transition from ${fromState} to ${toState}`,
      };
    }

    return { isValid: true };
  }

  // Validate tower placement
  validateTowerPlacement(
    x: number,
    y: number,
    gridSize: number,
    mapBounds: { width: number; height: number }
  ): ValidationResult {
    // Check grid alignment
    if (x % gridSize !== 0 || y % gridSize !== 0) {
      return {
        isValid: false,
        error: 'Tower must be placed on grid coordinates',
      };
    }

    // Check map bounds with margin
    const margin = gridSize / 2;
    if (
      x < margin ||
      x > mapBounds.width - margin ||
      y < margin ||
      y > mapBounds.height - margin
    ) {
      return {
        isValid: false,
        error: 'Tower placement outside map bounds',
      };
    }

    return { isValid: true };
  }

  // Sanitize user input
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>"']/g, '') // Remove potentially dangerous characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .slice(0, 100); // Limit length
  }

  // Validate and sanitize file upload (if needed)
  validateFileUpload(file: File): ValidationResult {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size exceeds 10MB limit',
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not supported',
      };
    }

    return { isValid: true };
  }

  private validateString(
    value: any,
    rules: ValidationRules,
    fieldName: string
  ): ValidationResult {
    if (typeof value !== 'string') {
      return {
        isValid: false,
        error: `${fieldName} must be a string`,
      };
    }

    const sanitized = rules.sanitize ? rules.sanitize(value) : value.trim();

    if (rules.required && (!sanitized || sanitized.length === 0)) {
      return {
        isValid: false,
        error: `${fieldName} is required`,
      };
    }

    if (rules.minLength && sanitized.length < rules.minLength) {
      return {
        isValid: false,
        error: `${fieldName} must be at least ${rules.minLength} characters`,
      };
    }

    if (rules.maxLength && sanitized.length > rules.maxLength) {
      return {
        isValid: false,
        error: `${fieldName} must be at most ${rules.maxLength} characters`,
      };
    }

    if (rules.pattern && !rules.pattern.test(sanitized)) {
      return {
        isValid: false,
        error: `${fieldName} contains invalid characters`,
      };
    }

    if (rules.custom) {
      const customResult = rules.custom(sanitized);
      if (typeof customResult === 'boolean') {
        return {
          isValid: customResult,
          error: customResult ? undefined : `${fieldName} validation failed`,
        };
      }
      return customResult;
    }

    return {
      isValid: true,
      sanitized,
    };
  }

  private getCachedValidation(key: string): ValidationResult | null {
    const cached = this.validationCache.get(key);
    if (cached) {
      const timestamp = parseInt(key.split('_')[1] || '0');
      if (Date.now() - timestamp < this.cacheExpiry) {
        return cached;
      }
      this.validationCache.delete(key);
    }
    return null;
  }

  private setCachedValidation(key: string, result: ValidationResult): void {
    if (result.isValid) {
      this.validationCache.set(key, result);

      // Cleanup old entries
      if (this.validationCache.size > 100) {
        const keys = Array.from(this.validationCache.keys());
        const oldKeys = keys.slice(0, 20);
        oldKeys.forEach(k => this.validationCache.delete(k));
      }
    }
  }

  // Clear validation cache
  clearCache(): void {
    this.validationCache.clear();
    logger.debug('Validation cache cleared', undefined, 'input');
  }
}

// Rapid interaction debouncing
export class InteractionDebouncer {
  private interactionCounts = new Map<string, number>();
  private lastInteractionTime = new Map<string, number>();
  private readonly thresholds = {
    click: 10, // 10 clicks per time window
    keypress: 50, // 50 keypresses per time window
    mousemove: 100, // 100 mouse moves per time window
  };
  private readonly timeWindow = 1000; // 1 second

  isRapidInteraction(type: string): boolean {
    const now = Date.now();
    const lastTime = this.lastInteractionTime.get(type) || 0;
    const count = this.interactionCounts.get(type) || 0;

    if (now - lastTime > this.timeWindow) {
      // Reset counter for new time window
      this.interactionCounts.set(type, 1);
      this.lastInteractionTime.set(type, now);
      return false;
    }

    const newCount = count + 1;
    this.interactionCounts.set(type, newCount);

    const threshold =
      this.thresholds[type as keyof typeof this.thresholds] || 20;
    const isRapid = newCount > threshold;

    if (isRapid) {
      logger.warn(
        'Rapid interaction detected',
        {
          type,
          count: newCount,
          threshold,
          timeWindow: this.timeWindow,
        },
        'input'
      );
    }

    return isRapid;
  }

  reset(type?: string): void {
    if (type) {
      this.interactionCounts.delete(type);
      this.lastInteractionTime.delete(type);
    } else {
      this.interactionCounts.clear();
      this.lastInteractionTime.clear();
    }
  }
}

// Global instances
export const inputValidator = InputValidator.getInstance();
export const interactionDebouncer = new InteractionDebouncer();

// Input sanitization for canvas interactions
export function sanitizeCanvasCoordinates(
  event: MouseEvent | TouchEvent
): { x: number; y: number } | null {
  const canvas = event.currentTarget as HTMLCanvasElement;
  if (!canvas) return null;

  const rect = canvas.getBoundingClientRect();
  let clientX: number, clientY: number;

  if ('touches' in event) {
    if (event.touches.length === 0) return null;
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }

  const x = clientX - rect.left;
  const y = clientY - rect.top;

  // Sanitize coordinates
  const sanitizedX = Math.max(0, Math.min(x, rect.width));
  const sanitizedY = Math.max(0, Math.min(y, rect.height));

  return { x: sanitizedX, y: sanitizedY };
}

// Game-specific validation helpers
export const GameValidation = {
  validateWaveNumber(waveNumber: number): ValidationResult {
    return inputValidator.validateNumber(waveNumber, {
      min: 1,
      max: 1000,
    });
  },

  validateTowerType(towerType: string): ValidationResult {
    const validTypes = [
      'indica',
      'sativa',
      'support',
      'sniper',
      'flamethrower',
      'chain',
    ];
    const isValid = validTypes.includes(towerType);

    return {
      isValid,
      error: isValid ? undefined : `Invalid tower type: ${towerType}`,
      sanitized: isValid ? towerType : undefined,
    };
  },

  validateGameSpeed(speed: number): ValidationResult {
    return inputValidator.validateNumber(speed, {
      min: 0.25,
      max: 8,
    });
  },
};

export default inputValidator;
