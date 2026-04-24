import React from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { AlertCircle, Home, RefreshCw, ChevronRight } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-2xl border border-zinc-100 text-center space-y-8">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Something went wrong</h1>
              <p className="text-zinc-500 font-medium leading-relaxed">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-zinc-50 rounded-2xl p-4 text-left overflow-auto max-h-40 border border-zinc-100">
                <p className="text-xs font-mono text-red-600 font-bold mb-2 uppercase tracking-widest">Technical Details</p>
                <code className="text-[10px] font-mono text-zinc-600 leading-tight block">
                  {this.state.error.stack}
                </code>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 pt-4">
              <Button 
                onClick={this.handleReset}
                className="h-14 rounded-2xl bg-zinc-900 text-white font-bold hover:bg-emerald-600 transition-all shadow-xl group"
              >
                <RefreshCw className="w-5 h-5 mr-2 transition-transform group-hover:rotate-180 duration-500" />
                Retry Application
              </Button>
              
              <Link to="/">
                <Button 
                  variant="ghost"
                  className="w-full h-14 rounded-2xl text-zinc-500 font-bold hover:bg-zinc-50 transition-all"
                  onClick={() => this.setState({ hasError: false })}
                >
                  <Home className="w-5 h-5 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
            
            <div className="pt-6 border-t border-zinc-100">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-2">
                Nutriplan Systems <ChevronRight className="w-3 h-3" /> Status Operational
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
