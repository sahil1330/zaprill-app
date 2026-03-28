"use client";

import { useEffect, useRef } from "react";

interface MatchRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

function getColor(pct: number): string {
  if (pct >= 75) return "#10b981"; // green
  if (pct >= 50) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

function getGlowColor(pct: number): string {
  if (pct >= 75) return "rgba(16, 185, 129, 0.4)";
  if (pct >= 50) return "rgba(245, 158, 11, 0.4)";
  return "rgba(239, 68, 68, 0.4)";
}

export default function MatchRing({
  percentage,
  size = 80,
  strokeWidth = 7,
  showLabel = true,
}: MatchRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getColor(percentage);
  const glowColor = getGlowColor(percentage);
  const dashOffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;
    circle.style.strokeDashoffset = `${circumference}`;
    const raf = requestAnimationFrame(() => {
      circle.style.transition =
        "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)";
      circle.style.strokeDashoffset = `${dashOffset}`;
    });
    return () => cancelAnimationFrame(raf);
  }, [circumference, dashOffset]);

  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
        />
      </svg>
      {showLabel && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: size < 72 ? "13px" : "16px",
              fontWeight: 700,
              color,
            }}
          >
            {percentage}%
          </span>
          {size >= 72 && (
            <span
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                marginTop: 1,
              }}
            >
              match
            </span>
          )}
        </div>
      )}
    </div>
  );
}
