// import { useAuth } from "../hooks/useAuth";
// import { Zap, GitBranch, ArrowRight } from "lucide-react";

// export function Login() {
//   const { login } = useAuth();

//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center p-4">
//       <div className="max-w-md w-full">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
//             <Zap className="w-8 h-8 text-primary" />
//           </div>
//           <h1 className="text-3xl font-bold mb-2">ZoneBridge</h1>
//           <p className="text-text-muted">Peer Knowledge Network for Zone01</p>
//         </div>

//         {/* Login Card */}
//         <div className="card">
//           <h2 className="text-xl font-semibold mb-6 text-center">
//             Welcome Back
//           </h2>

//           <button
//             onClick={login}
//             className="w-full btn-primary flex items-center justify-center gap-3 py-3 text-lg"
//           >
//             <GitBranch className="w-5 h-5" />
//             Login with Gitea
//             <ArrowRight className="w-5 h-5" />
//           </button>

//           <div className="mt-6 text-center">
//             <p className="text-sm text-text-muted">
//               Use your Zone01 Gitea account to access the platform.
//             </p>
//           </div>
//         </div>

//         {/* Features */}
//         <div className="grid grid-cols-3 gap-4 mt-8">
//           <div className="text-center">
//             <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center mx-auto mb-2">
//               <Zap className="w-5 h-5 text-primary" />
//             </div>
//             <p className="text-xs text-text-muted">Share Skills</p>
//           </div>
//           <div className="text-center">
//             <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center mx-auto mb-2">
//               <Zap className="w-5 h-5 text-secondary" />
//             </div>
//             <p className="text-xs text-text-muted">Learn Together</p>
//           </div>
//           <div className="text-center">
//             <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center mx-auto mb-2">
//               <Zap className="w-5 h-5 text-accent" />
//             </div>
//             <p className="text-xs text-text-muted">Grow Faster</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useAuth } from "../hooks/useAuth";
import {
  Zap,
  GitBranch,
  ArrowRight,
  Shield,
  Radio,
  Sparkles,
} from "lucide-react";

export function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-lg shadow-primary/10 animate-glow">
            <Zap className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-glow">ZoneBridge</h1>
          <p className="text-text-muted">Peer Knowledge Network for Zone01</p>
        </div>

        {/* Login Card */}
        <div className="card-glass neon-border p-8 animate-scale">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Secure Login</h2>
          </div>

          <button
            onClick={login}
            className="w-full btn-primary flex items-center justify-center gap-3 py-3.5 text-lg group"
          >
            <GitBranch className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Login with Gitea
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-text-muted">
            <Radio className="w-4 h-4 text-success animate-pulse" />
            <span>Connected to Zone01 Kisumu</span>
          </div>

          <p className="text-xs text-text-muted text-center mt-4">
            Uses your existing Gitea account. No separate password needed.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            {
              icon: Zap,
              color: "text-primary",
              bg: "bg-primary/10",
              border: "border-primary/20",
              label: "Share Skills",
            },
            {
              icon: Sparkles,
              color: "text-secondary",
              bg: "bg-secondary/10",
              border: "border-secondary/20",
              label: "Learn Together",
            },
            {
              icon: Zap,
              color: "text-accent",
              bg: "bg-accent/10",
              border: "border-accent/20",
              label: "Grow Faster",
            },
          ].map((feature, i) => (
            <div
              key={feature.label}
              className="text-center animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
            >
              <div
                className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mx-auto mb-2 border ${feature.border}`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <p className="text-xs text-text-muted font-medium">
                {feature.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
