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
  // Use a larger multiplier for strokeWidth to push the ring further out
  const radius = (size - strokeWidth * 3) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // Dynamic color based on match percentage
  const getColorClass = (p: number) => {
    if (p >= 90) return "text-emerald-500";
    if (p >= 75) return "text-blue-500";
    if (p >= 50) return "text-amber-500";
    return "text-destructive";
  };

  const colorClass = getColorClass(percentage);

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center ${colorClass}`}
      style={{ width: size, height: size }}
    >
      <svg
        className="-rotate-90 h-full w-full transform"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${percentage}% match`}
      >
        <title>{percentage}% match</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.1}
          strokeWidth={strokeWidth}
          className="transition-colors duration-500"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            animation: "progress-fill 1s ease-out forwards",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className="font-black leading-none tracking-tighter"
          style={{ fontSize: size * 0.24 }} // Further reduced from 0.26 to prevent "sticking"
        >
          {percentage}%
        </span>
        {size >= 64 && (
          <span className="mt-0.5 font-black text-[9px] uppercase tracking-widest opacity-60">
            Match
          </span>
        )}
      </div>
    </div>
  );
}
