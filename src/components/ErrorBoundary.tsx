"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (reset: () => void) => ReactNode;
  title?: string;
  description?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught error:", error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback(this.reset);
    }

    const title = this.props.title ?? "Something went wrong";
    const description =
      this.props.description ?? "An error occurred while loading this content.";

    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-kenya-red/10 p-3">
          <svg
            className="h-8 w-8 text-kenya-red"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-9.45 1.41A7 7 0 1112 19a7 7 0 01-9.45-1.59z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-kenya-white mb-2">{title}</h2>
        <p className="text-sm text-kenya-white/60 mb-6 max-w-md">{description}</p>
        <button
          onClick={this.reset}
          className="px-6 py-2.5 bg-kenya-green text-kenya-black font-bold rounded-lg hover:bg-kenya-green/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
}
