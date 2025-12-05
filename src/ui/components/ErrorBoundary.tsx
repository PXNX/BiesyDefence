import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: string | null;
}

const initialState: ErrorBoundaryState = {
  hasError: false,
  error: null,
  info: null,
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = initialState;

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      info: null,
    };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error(
      'Error captured in ErrorBoundary:',
      error,
      info.componentStack
    );
    this.setState({
      info: info.componentStack,
    });
  }

  handleReset = () => {
    this.setState(initialState);
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>Something went wrong.</h2>
            <p>We have logged the error for investigation.</p>
            {this.state.error && (
              <p className="error-message">{this.state.error.message}</p>
            )}
            <button
              type="button"
              className="primary"
              onClick={this.handleReset}
            >
              Reset to safety
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
