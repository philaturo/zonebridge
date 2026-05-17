import { cn } from "../../lib/utils";

interface AnimatedCounterProps {
  value: number | string;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({
  value,
  className,
  prefix = "",
  suffix = "",
}: AnimatedCounterProps) {
  const targetValue = typeof value === "string" ? parseInt(value) || 0 : value;

  return (
    <span className={cn("tabular-nums font-mono", className)}>
      {prefix}
      {targetValue}
      {suffix}
    </span>
  );
}
