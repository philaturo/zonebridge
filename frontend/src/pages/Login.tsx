import { useAuth } from "../hooks/useAuth";
import { GitBranch, ArrowRight } from "lucide-react";

export function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e5e5e5] font-mono relative overflow-hidden flex">
      {/* Background texture - organic flow field */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          opacity: 0.34,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='2400' height='1400' viewBox='0 0 2400 1400' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23ffffff' stroke-width='0.72' stroke-linecap='round'%3E%3C!-- top flowing field --%3E%3Cpath opacity='0.16' d='M-200 80C40 20 220 180 500 120S980 20 1260 120 1720 260 2140 100 2520 40 2820 180'/%3E%3Cpath opacity='0.16' d='M-200 100C40 40 220 200 500 140S980 40 1260 140 1720 280 2140 120 2520 60 2820 200'/%3E%3Cpath opacity='0.16' d='M-200 120C40 60 220 220 500 160S980 60 1260 160 1720 300 2140 140 2520 80 2820 220'/%3E%3Cpath opacity='0.16' d='M-200 140C40 80 220 240 500 180S980 80 1260 180 1720 320 2140 160 2520 100 2820 240'/%3E%3Cpath opacity='0.16' d='M-200 160C40 100 220 260 500 200S980 100 1260 200 1720 340 2140 180 2520 120 2820 260'/%3E%3Cpath opacity='0.16' d='M-200 180C40 120 220 280 500 220S980 120 1260 220 1720 360 2140 200 2520 140 2820 280'/%3E%3Cpath opacity='0.16' d='M-200 200C40 140 220 300 500 240S980 140 1260 240 1720 380 2140 220 2520 160 2820 300'/%3E%3Cpath opacity='0.16' d='M-200 220C40 160 220 320 500 260S980 160 1260 260 1720 400 2140 240 2520 180 2820 320'/%3E%3C!-- central warped contour bundle --%3E%3Cpath opacity='0.30' d='M940 -260C760 -60 760 120 920 240C1040 330 1180 420 1300 560C1420 700 1520 860 1700 1040'/%3E%3Cpath opacity='0.28' d='M960 -260C780 -40 780 140 940 260C1060 350 1200 440 1320 580C1440 720 1540 880 1720 1060'/%3E%3Cpath opacity='0.26' d='M980 -260C800 -20 800 160 960 280C1080 370 1220 460 1340 600C1460 740 1560 900 1740 1080'/%3E%3Cpath opacity='0.24' d='M1000 -260C820 0 820 180 980 300C1100 390 1240 480 1360 620C1480 760 1580 920 1760 1100'/%3E%3Cpath opacity='0.22' d='M1020 -260C840 20 840 200 1000 320C1120 410 1260 500 1380 640C1500 780 1600 940 1780 1120'/%3E%3Cpath opacity='0.20' d='M1040 -260C860 40 860 220 1020 340C1140 430 1280 520 1400 660C1520 800 1620 960 1800 1140'/%3E%3Cpath opacity='0.18' d='M1060 -260C880 60 880 240 1040 360C1160 450 1300 540 1420 680C1540 820 1640 980 1820 1160'/%3E%3Cpath opacity='0.16' d='M1080 -260C900 80 900 260 1060 380C1180 470 1320 560 1440 700C1560 840 1660 1000 1840 1180'/%3E%3Cpath opacity='0.14' d='M1100 -260C920 100 920 280 1080 400C1200 490 1340 580 1460 720C1580 860 1680 1020 1860 1200'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "contrast(170%) brightness(150%)",
        }}
      />

      {/* Left side - Info */}
      <div className="flex-1 flex flex-col justify-center px-16 relative z-10">
        <div className="mb-8">
          {/* Zone01-style logo mark */}
          <div className="w-8 h-8 border border-[#333] flex items-center justify-center mb-6">
            <span className="text-xs font-mono text-[#a78bfa]">01</span>
          </div>
        </div>

        <h1 className="text-5xl font-mono text-[#e5e5e5] mb-6 leading-tight">
          Welcome to
          <br />
          ZoneBridge!
        </h1>

        <p className="text-[#a0a0a0] text-sm font-mono mb-8 max-w-md leading-relaxed">
          ZoneBridge is the peer knowledge network for Zone01 Kisumu
          apprentices. Connect through shared skills, project post-mortems, and
          real-time mentorship.
        </p>

        <div className="space-y-3 text-sm font-mono text-[#737373]">
          <p>1) Login with your Gitea account.</p>
          <p>2) Tag yourself with skills you can help others with.</p>
          <p>3) Find peers when you're stuck, share what you've learned.</p>
        </div>

        <div className="mt-8 text-xs font-mono text-[#525252]">
          Want to know more about us?{" "}
          <span className="text-[#a78bfa] underline underline-offset-4 cursor-pointer hover:text-[#c4b5fd] transition-colors">
            contact us
          </span>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md px-8">
          <h2 className="text-2xl font-mono text-[#a78bfa] mb-8">
            Log in to resume your works
          </h2>

          <div className="space-y-6">
            {/* Gitea OAuth Button */}
            <button
              onClick={login}
              className="w-full bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#1a1a1a] font-mono text-sm py-3 px-4 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <GitBranch className="w-4 h-4" />
              LOGIN WITH GITEA
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-xs font-mono text-[#525252]">
              Uses your existing Gitea account. No separate password needed.
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#2a2a2a] text-center">
            <span className="text-xs font-mono text-[#525252]">
              New here? Join the fun!{" "}
            </span>
            <span className="text-xs font-mono text-[#a78bfa] underline underline-offset-4 cursor-pointer hover:text-[#c4b5fd] transition-colors">
              REGISTER NOW!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
