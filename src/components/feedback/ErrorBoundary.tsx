import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button.js';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ERROR 404 Uncaught Render Error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                ERROR 404 • System Self-Healing
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Atmospheric telemetry stream re-synced.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="text-[11px] font-mono text-rose-700 bg-rose-50 p-3 rounded-2xl border border-rose-200 text-left break-all">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="default"
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Live Forecast
              </Button>

              <Button
                variant="outline"
                onClick={this.handleReset}
                className="w-full h-10 rounded-2xl border-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center gap-2 hover:bg-slate-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset Stored Cache & Reload
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
