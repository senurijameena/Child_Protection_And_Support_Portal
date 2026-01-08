import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Container, Alert, Button } from 'react-bootstrap';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Container className="mt-5">
          <Alert variant="danger">
            <Alert.Heading>Something went wrong!</Alert.Heading>
            <p>{this.state.error && this.state.error.toString()}</p>
            {this.state.errorInfo && (
              <details style={{ whiteSpace: 'pre-wrap' }}>
                {this.state.errorInfo.componentStack}
              </details>
            )}
            <Button
              variant="primary"
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.href = '/';
              }}
            >
              Go to Home
            </Button>
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

