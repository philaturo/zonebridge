// import { cn } from "../../lib/utils";

// interface SkeletonProps {
//   className?: string;
//   variant?: "text" | "circular" | "rectangular" | "card";
//   lines?: number;
// }

// export function Skeleton({
//   className,
//   variant = "text",
//   lines = 1,
// }: SkeletonProps) {
//   const baseClasses = "skeleton animate-pulse";

//   const variants = {
//     text: "h-4 w-full rounded-md",
//     circular: "rounded-full",
//     rectangular: "rounded-lg",
//     card: "h-32 w-full rounded-xl",
//   };

//   if (lines > 1) {
//     return (
//       <div className={cn("space-y-3", className)}>
//         {Array.from({ length: lines }).map((_, i) => (
//           <div
//             key={i}
//             className={cn(baseClasses, variants[variant])}
//             style={{ width: i === lines - 1 ? "75%" : "100%" }}
//           />
//         ))}
//       </div>
//     );
//   }

//   return <div className={cn(baseClasses, variants[variant], className)} />;
// }

// export function SkeletonCard() {
//   return (
//     <div className="card-glass p-6 space-y-4">
//       <div className="flex items-start justify-between">
//         <Skeleton variant="circular" className="w-10 h-10" />
//         <Skeleton className="h-5 w-16" />
//       </div>
//       <Skeleton className="h-6 w-3/4" />
//       <Skeleton lines={2} />
//       <div className="flex items-center gap-2 pt-2">
//         <Skeleton variant="circular" className="w-4 h-4" />
//         <Skeleton className="h-4 w-20" />
//       </div>
//     </div>
//   );
// }

// export function SkeletonStats() {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//       {Array.from({ length: 4 }).map((_, i) => (
//         <div key={i} className="card-glass p-6 space-y-4">
//           <div className="flex items-center justify-between">
//             <Skeleton variant="circular" className="w-12 h-12" />
//             <Skeleton className="h-5 w-5" />
//           </div>
//           <Skeleton className="h-8 w-16" />
//           <Skeleton className="h-4 w-24" />
//         </div>
//       ))}
//     </div>
//   );
// }

// export function SkeletonActivity() {
//   return (
//     <div className="space-y-4">
//       {Array.from({ length: 5 }).map((_, i) => (
//         <div key={i} className="flex items-start gap-3 p-3">
//           <Skeleton variant="circular" className="w-8 h-8 flex-shrink-0" />
//           <div className="flex-1 space-y-2">
//             <Skeleton className="h-4 w-3/4" />
//             <Skeleton className="h-3 w-1/3" />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  lines?: number;
}

export function Skeleton({
  className,
  variant = "text",
  lines = 1,
}: SkeletonProps) {
  const baseClasses = "bg-[#2a2a2a]";

  const variants = {
    text: "h-3 w-full",
    circular: "w-8 h-8",
    rectangular: "h-20 w-full",
    card: "h-32 w-full",
  };

  if (lines > 1) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, variants[variant])}
            style={{ width: i === lines - 1 ? "75%" : "100%" }}
          />
        ))}
      </div>
    );
  }

  return <div className={cn(baseClasses, variants[variant], className)} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-5 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton variant="circular" className="w-8 h-8" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton lines={2} />
      <div className="flex items-center gap-2 pt-2">
        <Skeleton variant="circular" className="w-3 h-3" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-[#1e1e1e] border border-[#2a2a2a] p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton variant="circular" className="w-8 h-8" />
            <Skeleton className="h-3 w-5" />
          </div>
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonActivity() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3">
          <Skeleton variant="circular" className="w-8 h-8 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
