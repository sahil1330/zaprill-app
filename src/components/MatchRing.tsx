"use client";

interface MatchRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export default function MatchRing({
  percentage,
  size = 64,
  strokeWidth = 4,
}: MatchRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        className="w-full h-full -rotate-90 transform"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
          className="transition-colors duration-500"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--foreground)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="square"
          className="transition-all duration-1000 ease-out"
          style={{
            animation: "progress-fill 1s ease-out forwards",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className="font-bold text-foreground leading-none"
          style={{ fontSize: size * 0.3 }}
        >
          {percentage}%
        </span>
        {size >= 64 && (
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
            Match
          </span>
        )}
      </div>
    </div>
  );
}
