"use client";

import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  Dumbbell,
  ExternalLink,
  FileText,
  Search,
  TrendingUp,
  Video,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  trackResourceLinkClicked,
  trackRoadmapItemExpanded,
} from "@/lib/analytics";
import type { RoadmapItem } from "@/types";

interface LearningRoadmapProps {
  roadmap: RoadmapItem[];
  advice?: string;
}

const PRIORITY_STYLES = {
  high: {
    bg: "bg-primary",
    border: "border-primary",
    color: "text-primary-foreground",
    label: "High Priority",
  },
  medium: {
    bg: "bg-muted",
    border: "border-border",
    color: "text-foreground",
    label: "Medium",
  },
  low: {
    bg: "bg-background",
    border: "border-border",
    color: "text-muted-foreground",
    label: "Nice To Have",
  },
};

const RESOURCE_ICONS = {
  course: Video,
  book: BookOpen,
  tutorial: FileText,
  documentation: Code2,
  practice: Dumbbell,
};

function RoadmapCard({ item, index }: { item: RoadmapItem; index: number }) {
  const [expanded, setExpanded] = useState(index < 2);
  const style = PRIORITY_STYLES[item.priority];

  return (
    <Card
      className={`overflow-hidden rounded-xl border shadow-sm transition-all ${expanded ? "border-foreground/20 bg-card" : "border-border bg-card/50"}`}
      id={`roadmap-item-${index}`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => {
          const nextExpanded = !expanded;
          setExpanded(nextExpanded);
          if (nextExpanded) {
            trackRoadmapItemExpanded({
              skill_name: item.skill,
              priority: item.priority,
              item_index: index,
            });
          }
        }}
        className="flex w-full cursor-pointer items-center gap-4 border-none bg-transparent p-5 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none"
        id={`roadmap-toggle-${index}`}
        aria-expanded={expanded}
      >
        {/* Step number */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border font-bold text-sm ${style.bg} ${style.border} ${style.color}`}
        >
          {index + 1}
        </div>

        <div className="flex-1">
          <div className="mb-1.5 flex items-center gap-3 pl-1">
            <span className="font-bold text-base text-foreground capitalize tracking-tight">
              {item.skill}
            </span>
            <span
              className={`rounded border px-2 py-0.5 font-bold text-xs uppercase tracking-widest ${style.bg} ${style.border} ${style.color}`}
            >
              {style.label}
            </span>
          </div>
          <div className="flex items-center gap-3 pl-1 font-medium text-muted-foreground text-xs">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {item.estimatedTime}
            </span>
            <span>·</span>
            <span>{item.resources.length} resources</span>
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <CardContent className="mt-1 border-border border-t px-6 pt-0 pb-6">
          {/* Why */}
          <p className="py-4 font-medium text-muted-foreground text-sm leading-relaxed">
            <span className="font-bold text-foreground">Why: </span>
            {item.why}
          </p>

          {/* Resources */}
          <div className="flex flex-col gap-2.5">
            {item.resources.map((res, i) => {
              const reactKey = `${res.name}-${i}`;
              const Icon = RESOURCE_ICONS[res.type] ?? FileText;
              const isSearch = res.url?.includes("google.com/search");

              return (
                <div
                  key={reactKey}
                  className="group flex items-center gap-3 rounded-md border border-border bg-background p-3 transition-colors hover:border-foreground/30"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border bg-muted text-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate pl-1 font-bold text-foreground text-sm">
                      {res.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 pl-1 font-medium text-[11px] text-muted-foreground">
                      <span className="uppercase tracking-wider">
                        {res.type}
                      </span>
                      {res.estimatedTime && <span>· {res.estimatedTime}</span>}
                      <span
                        className={`rounded-sm border px-1.5 py-0.5 ${res.free ? "border-border bg-muted text-foreground" : "border-border bg-background text-muted-foreground"}`}
                      >
                        {res.free ? "Free" : "Paid"}
                      </span>
                      {isSearch && (
                        <span className="flex items-center gap-1 font-bold text-accent-foreground text-xs uppercase tracking-tighter">
                          <Search className="h-2.5 w-2.5" /> Fallback
                        </span>
                      )}
                    </div>
                  </div>
                  {res.url && (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      id={`resource-link-${index}-${i}`}
                      className="flex shrink-0 items-center gap-1.5 rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      onClick={() =>
                        trackResourceLinkClicked({
                          skill_name: item.skill,
                          resource_name: res.name,
                          resource_type: res.type,
                          resource_url: res.url!,
                          is_free: res.free,
                        })
                      }
                    >
                      {isSearch ? (
                        <span className="hidden font-bold text-xs uppercase tracking-widest sm:inline">
                          Search
                        </span>
                      ) : (
                        <span className="hidden font-bold text-xs uppercase tracking-widest sm:inline">
                          Open
                        </span>
                      )}
                      {isSearch ? (
                        <Search className="h-4 w-4" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function LearningRoadmap({
  roadmap,
  advice,
}: LearningRoadmapProps) {
  if (!roadmap.length && !advice) return null;

  const sorted = [...roadmap].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="flex flex-col gap-6">
      {advice && (
        <div className="rounded-xl border border-primary/10 bg-primary/5 p-5">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-black text-primary text-xs uppercase tracking-widest">
              Strategic Guidance
            </span>
          </div>
          <p className="font-medium text-foreground text-sm leading-relaxed">
            {advice}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {sorted.map((item, idx) => (
          <RoadmapCard key={item.skill} item={item} index={idx} />
        ))}
      </div>
    </div>
  );
}
