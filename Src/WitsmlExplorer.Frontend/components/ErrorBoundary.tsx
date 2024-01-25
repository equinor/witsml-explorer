import React, { Component, ReactNode } from "react";
import { colors } from "styles/Colors";

interface ErrorBoundaryProps {
  FallbackComponent: React.ComponentType<{ error: Error }>;
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public render() {
    if (this.state.hasError) {
      return <this.props.FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
}

const ErrorFallback = ({ error }: ErrorFallbackProps): React.ReactElement => {
  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <div
        style={{
          maxHeight: "200px",
          overflow: "auto",
          marginBottom: "16px",
          border: "1px solid #ccc",
          padding: "8px"
        }}
      >
        <p style={{ color: colors.interactive.dangerResting }}>
          {error?.message}
        </p>
      </div>
      <p>
        Please report this issue on{" "}
        <a href="https://github.com/equinor/witsml-explorer/issues/new?labels=bug&template=bug-report---.md">
          GitHub
        </a>{" "}
        to help us investigate and fix it.
      </p>
    </div>
  );
};

export { ErrorBoundary, ErrorFallback };
