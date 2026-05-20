import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };

type State = { hasError: boolean; message: string };

export class TitanDetailErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message || "Unknown error" };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error("[TITAN] Market detail render failed", err, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-[1600px] px-4 py-8">
          <div className="rounded-xl border border-rose-500/35 bg-rose-950/30 px-5 py-4 text-sm text-rose-100/90">
            <p className="font-semibold text-rose-200">This market view failed to render.</p>
            <p className="mt-2 font-mono text-xs text-rose-200/70">{this.state.message}</p>
            <p className="mt-3 text-xs text-stone-500">
              Open the browser console (F12) for the full stack trace. Partial or invalid COT rows from the API can
              cause this if the UI assumed every numeric field is present.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
