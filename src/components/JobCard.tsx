"use client";

import {
  MapPin,
  Building2,
  ExternalLink,
  Wifi,
  Clock,
  DollarSign,
} from "lucide-react";
import type { JobMatch } from "@/types";
import MatchRing from "./MatchRing";
import SkillBadge from "./SkillBadge";

interface JobCardProps {
  job: JobMatch;
  rank: number;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  if (days < 60) return "1 month ago";
  return `${Math.floor(days / 30)} months ago`;
}

export default function JobCard({ job, rank }: JobCardProps) {
  const postedText = timeAgo(job.postedAt);
  const showMatched = job.matchedSkills.slice(0, 4);
  const showMissing = job.missingSkills.slice(0, 3);

  return (
    <div
      className="glass-card animate-slide-up"
      style={{
        padding: "20px",
        animationDelay: `${rank * 60}ms`,
        animationFillMode: "both",
      }}
      id={`job-card-${job.id}`}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        {/* Rank badge */}
        <div
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: 8,
            background:
              rank === 0
                ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                : rank <= 2
                  ? "rgba(99, 102, 241, 0.2)"
                  : "rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 700,
            color:
              rank === 0 ? "#fff" : rank <= 2 ? "#a5b4fc" : "var(--text-muted)",
            border: rank === 0 ? "none" : "1px solid var(--border-subtle)",
          }}
        >
          #{rank + 1}
        </div>

        {/* Title + company */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 4,
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {job.title}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "var(--text-secondary)",
              fontSize: "13px",
              flexWrap: "wrap",
            }}
          >
            <Building2 size={12} />
            <span style={{ fontWeight: 500 }}>{job.company}</span>
            <span style={{ color: "var(--text-muted)" }}>·</span>
            <MapPin size={12} />
            <span>{job.location}</span>
            {job.isRemote && (
              <>
                <span style={{ color: "var(--text-muted)" }}>·</span>
                <span
                  className="badge badge-success"
                  style={{
                    padding: "2px 6px",
                    fontSize: "11px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <Wifi size={9} /> Remote
                </span>
              </>
            )}
          </div>
        </div>

        {/* Match ring */}
        <MatchRing percentage={job.matchPercentage} size={72} />
      </div>

      {/* Meta row */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}
      >
        {job.salary && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: "12px",
              color: "#34d399",
            }}
          >
            <DollarSign size={11} /> {job.salary}
          </span>
        )}
        {job.employmentType && (
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              textTransform: "capitalize",
            }}
          >
            {job.employmentType.replace("_", " ").toLowerCase()}
          </span>
        )}
        {postedText && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: "12px",
              color: "var(--text-muted)",
              marginLeft: "auto",
            }}
          >
            <Clock size={11} /> {postedText}
          </span>
        )}
      </div>

      {/* Skills */}
      <div style={{ marginBottom: 14 }}>
        {showMatched.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                alignSelf: "center",
                flexShrink: 0,
              }}
            >
              ✅
            </span>
            {showMatched.map((s) => (
              <SkillBadge key={s} skill={s} variant="matched" size="sm" />
            ))}
            {job.matchedSkills.length > 4 && (
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  alignSelf: "center",
                }}
              >
                +{job.matchedSkills.length - 4} more
              </span>
            )}
          </div>
        )}
        {showMissing.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                alignSelf: "center",
                flexShrink: 0,
              }}
            >
              ❌
            </span>
            {showMissing.map((s) => (
              <SkillBadge key={s} skill={s} variant="missing" size="sm" />
            ))}
            {job.missingSkills.length > 3 && (
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  alignSelf: "center",
                }}
              >
                +{job.missingSkills.length - 3} gaps
              </span>
            )}
          </div>
        )}
      </div>

      {/* Apply button */}
      <a
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
        id={`apply-btn-${job.id}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--accent-primary)",
          padding: "7px 14px",
          border: "1px solid var(--border-accent)",
          borderRadius: 8,
          transition: "all 0.2s",
          background: "rgba(99, 102, 241, 0.05)",
        }}
        onMouseEnter={(e) => {
          const t = e.currentTarget;
          t.style.background = "rgba(99, 102, 241, 0.15)";
        }}
        onMouseLeave={(e) => {
          const t = e.currentTarget;
          t.style.background = "rgba(99, 102, 241, 0.05)";
        }}
      >
        <ExternalLink size={13} />
        Apply Now
      </a>
    </div>
  );
}
