// import { useEffect, useState } from "react";
// import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
// import { cn } from "../../lib/utils";

// export type ToastType = "success" | "error" | "warning" | "info";

// export interface Toast {
//   id: string;
//   message: string;
//   type: ToastType;
//   duration?: number;
// }

// interface ToastItemProps {
//   toast: Toast;
//   onRemove: (id: string) => void;
// }

// const icons = {
//   success: CheckCircle,
//   error: AlertCircle,
//   warning: AlertTriangle,
//   info: Info,
// };

// const styles = {
//   success: "border-success/30 bg-success/10 text-success",
//   error: "border-danger/30 bg-danger/10 text-danger",
//   warning: "border-warning/30 bg-warning/10 text-warning",
//   info: "border-secondary/30 bg-secondary/10 text-secondary",
// };

// export function ToastItem({ toast, onRemove }: ToastItemProps) {
//   const [isExiting, setIsExiting] = useState(false);
//   const Icon = icons[toast.type];

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsExiting(true);
//       setTimeout(() => onRemove(toast.id), 300);
//     }, toast.duration || 4000);

//     return () => clearTimeout(timer);
//   }, [toast.id, toast.duration, onRemove]);

//   const handleRemove = () => {
//     setIsExiting(true);
//     setTimeout(() => onRemove(toast.id), 300);
//   };

//   return (
//     <div
//       className={cn(
//         "flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg",
//         "transform transition-all duration-300 ease-out",
//         isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100",
//         styles[toast.type],
//       )}
//     >
//       <Icon className="w-5 h-5 flex-shrink-0" />
//       <p className="text-sm font-medium flex-1">{toast.message}</p>
//       <button
//         onClick={handleRemove}
//         className="p-1 rounded-md hover:bg-white/10 transition-colors"
//       >
//         <X className="w-4 h-4" />
//       </button>
//     </div>
//   );
// }

// interface ToastContainerProps {
//   toasts: Toast[];
//   onRemove: (id: string) => void;
// }

// export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
//   if (toasts.length === 0) return null;

//   return (
//     <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
//       {toasts.map((toast) => (
//         <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
//       ))}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: "border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]",
  error: "border-[#f87171]/30 bg-[#f87171]/10 text-[#f87171]",
  warning: "border-[#fbbf24]/30 bg-[#fbbf24]/10 text-[#fbbf24]",
  info: "border-[#a78bfa]/30 bg-[#a78bfa]/10 text-[#a78bfa]",
};

export function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = icons[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 200);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 border bg-[#1e1e1e]",
        "transform transition-all duration-200",
        isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100",
        styles[toast.type],
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <p className="text-xs flex-1 font-mono">{toast.message}</p>
      <button
        onClick={handleRemove}
        className="p-1 hover:bg-[#252525] transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full font-mono">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
