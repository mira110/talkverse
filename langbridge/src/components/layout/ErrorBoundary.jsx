import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-4 text-2xl font-black">
            ⚡
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Lesson Arena Refreshed</h2>
          <p className="text-slate-400 text-sm max-w-sm mb-6">
            Something needed a quick restart. Tap below to jump right back into the action!
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
            >
              Resume Game
            </button>
            <button
              onClick={() => {
                window.location.href = "/dashboard";
              }}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
            >
              Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
