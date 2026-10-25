"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface AtsIconProps {
  className?: string;
  animated?: boolean;
  /** "brand" = primary on light surfaces; "inherit" = follows parent text color (e.g. white on buttons) */
  variant?: "brand" | "inherit";
}

/**
 * ATS icon — document with animated scan beam (Applicant Tracking System metaphor).
 */
export default function AtsIcon({
  className = "h-6 w-6",
  animated = true,
  variant = "brand",
}: AtsIconProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        variant === "brand" ? "text-primary" : "text-current",
        className,
      )}
      aria-hidden="true"
    >
      {/* Document body */}
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
        className="fill-current/15 stroke-current"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v6h6"
        className="stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Text lines */}
      <path
        d="M8 13h8M8 16h5"
        className="stroke-current opacity-60"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Scan beam */}
      {shouldAnimate ? (
        <motion.line
          x1="4"
          y1="10"
          x2="20"
          y2="10"
          className="stroke-current"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ y1: [8, 18, 8], y2: [8, 18, 8] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : (
        <line
          x1="4"
          y1="12"
          x2="20"
          y2="12"
          className="stroke-current"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
      {/* Check badge — parsed successfully */}
      {variant === "brand" ? (
        <>
          <circle
            cx="18"
            cy="18"
            r="4"
            className="fill-current stroke-background"
            strokeWidth="1.5"
          />
          <path
            d="M16.5 18l1 1 2-2"
            className="stroke-background"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <circle
            cx="18"
            cy="18"
            r="4"
            className="fill-current/25 stroke-current"
            strokeWidth="1.5"
          />
          <path
            d="M16.5 18l1 1 2-2"
            className="stroke-current"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}
