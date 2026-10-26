import { Component } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

/**
 * Guards lazy-loaded route chunks: a failed import (offline, stale build)
 * renders a recoverable state instead of a blank screen.
 */
export class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("Route failed to render:", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="mx-auto w-full max-w-lg py-20 text-center animate-fade-in">
        <div className="glow-ring mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/10 text-red-300">
          <TriangleAlert size={26} />
        </div>
        <h2 className="text-xl font-bold text-mist">This view failed to load</h2>
        <p className="mt-2 text-sm leading-relaxed text-haze">
          The route chunk could not be fetched — often a stale build or a dropped connection
          while reloading.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            <RefreshCw size={16} />
            Reload application
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => this.setState({ failed: false })}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}
