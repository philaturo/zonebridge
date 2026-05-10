import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // With cookie auth, we just redirect to home.
    // The cookie was already set by the backend before this page loaded.
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Zap className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Authenticating...</h1>
        <p className="text-text-muted">Setting up your session</p>
      </div>
    </div>
  );
}
