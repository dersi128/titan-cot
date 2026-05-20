import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };

type State = { hasError: boolean; message: string };

export class TitanAppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message || "Unknown error" };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error("[TITAN] App render failed", err, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#030303] p-6">
          <div className="max-w-lg rounded-xl border border-rose-500/35 bg-rose-950/30 px-6 py-5 text-sm text-rose-100/90">
            <p className="font-display text-base font-semibold text-rose-200">TITAN dashboard failed to load</p>
            <p className="mt-2 font-mono text-xs text-rose-200/70">{this.state.message}</p>
            <button
              type="button"
              className="mt-4 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-300 hover:bg-white/10"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
