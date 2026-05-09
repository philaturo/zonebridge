import { useAuth } from "../hooks/useAuth";
import { Zap, Github, ArrowRight } from "lucide-react";

export function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">ZoneBridge</h1>
          <p className="text-text-muted">Peer Knowledge Network for Zone01</p>
        </div>

        {/* Login Card */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Welcome Back
          </h2>

          <button
            onClick={login}
            className="w-full btn-primary flex items-center justify-center gap-3 py-3 text-lg"
          >
            <Github className="w-5 h-5" />
            Login with Gitea
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Use your Zone01 Gitea account to access the platform.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="text-center">
            <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-text-muted">Share Skills</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-xs text-text-muted">Learn Together</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <p className="text-xs text-text-muted">Grow Faster</p>
          </div>
        </div>
      </div>
    </div>
  );
}
