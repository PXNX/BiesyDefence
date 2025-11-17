import React, { Component, ErrorInfo, ReactNode } from 'react'
import { logger } from '@/game/utils/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  name?: string
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private readonly maxRetries = 3

  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error with structured logging
    logger.error('React Error Boundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundaryName: this.props.name || 'Unknown',
      retryCount: this.retryCount
    }, 'error')

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // In development, log additional debugging info
    if (import.meta.env.DEV) {
      console.group(`🚨 Error Boundary (${this.props.name || 'Unknown'})`)
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.groupEnd()
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      logger.info('Retrying component after error', {
        componentName: this.props.name || 'Unknown',
        retryCount: this.retryCount
      }, 'error')
      
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined
      })
    }
  }

  private handleReload = () => {
    logger.warn('Reloading page due to component error', {
      componentName: this.props.name || 'Unknown',
      retryCount: this.retryCount
    }, 'error')
    
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      const canRetry = this.retryCount < this.maxRetries

      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>
              {this.props.name ? `The "${this.props.name}" component encountered an error.` 
                               : 'A component encountered an error.'}
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Technical Details (Development Only)</summary>
                <div className="error-technical">
                  <h4>Error Message:</h4>
                  <pre>{this.state.error.message}</pre>
                  
                  {this.state.error.stack && (
                    <>
                      <h4>Stack Trace:</h4>
                      <pre>{this.state.error.stack}</pre>
                    </>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <>
                      <h4>Component Stack:</h4>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <div className="error-actions">
              {canRetry && (
                <button 
                  onClick={this.handleRetry}
                  className="retry-button"
                >
                  Try Again ({this.maxRetries - this.retryCount} tries left)
                </button>
              )}
              
              <button 
                onClick={this.handleReload}
                className="reload-button"
              >
                Reload Page
              </button>
            </div>

            {this.retryCount >= this.maxRetries && (
              <div className="max-retries-reached">
                <p>Maximum retry attempts reached. Please reload the page.</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for easy error boundary wrapping
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  )

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithErrorBoundaryComponent
}

// Hook for error reporting
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const reportError = React.useCallback((error: Error, context?: string) => {
    logger.error('Manual error report', {
      message: error.message,
      stack: error.stack,
      context
    }, 'error')
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { reportError, resetError }
}

// Global error handler setup
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      reason: event.reason,
      type: 'promise_rejection'
    }, 'error')
    
    // In development, log to console as well
    if (import.meta.env.DEV) {
      console.error('Unhandled promise rejection:', event.reason)
    }
  })

  // Handle general JavaScript errors
  window.addEventListener('error', (event) => {
    logger.error('Global JavaScript error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    }, 'error')
  })

  logger.info('Global error handlers setup completed', undefined, 'error')
}

// Error recovery utilities
export class ErrorRecovery {
  private static recoveryStrategies = new Map<string, () => void>()

  static registerStrategy(name: string, recoveryFn: () => void) {
    this.recoveryStrategies.set(name, recoveryFn)
    logger.debug('Error recovery strategy registered', { name }, 'error')
  }

  static executeStrategy(name: string): boolean {
    const strategy = this.recoveryStrategies.get(name)
    if (strategy) {
      try {
        strategy()
        logger.info('Error recovery strategy executed', { name }, 'error')
        return true
      } catch (recoveryError) {
        logger.error('Error recovery strategy failed', { 
          name, 
          recoveryError: recoveryError.message 
        }, 'error')
        return false
      }
    }
    return false
  }

  static getRegisteredStrategies(): string[] {
    return Array.from(this.recoveryStrategies.keys())
  }
}

// Initialize error recovery strategies for game components
ErrorRecovery.registerStrategy('gameController', () => {
  // Reset game state if GameController fails
  const gameContainer = document.getElementById('game-container')
  if (gameContainer) {
    gameContainer.innerHTML = '<div class="game-recovery">Game is recovering...</div>'
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }
})

ErrorRecovery.registerStrategy('rendering', () => {
  // Clear canvas and force re-render if rendering fails
  const canvas = document.querySelector('canvas')
  if (canvas) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }
})

export default ErrorBoundary