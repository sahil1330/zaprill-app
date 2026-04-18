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
  Video,
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
}

const PRIORITY_STYLES = {
  high: {
    bg: "bg-foreground",
    border: "border-foreground",
    color: "text-background",
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
      className={`overflow-hidden transition-all rounded-xl shadow-sm border ${expanded ? "border-foreground/20 bg-card" : "border-border bg-card/50"}`}
      id={`roadmap-item-${index}`}
    >
      {/* Header */}
      <button
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
        className="w-full p-5 flex items-center gap-4 bg-transparent border-none cursor-pointer text-left hover:bg-muted/30 transition-colors focus-visible:outline-none"
        id={`roadmap-toggle-${index}`}
        aria-expanded={expanded}
      >
        {/* Step number */}
        <div
          className={`w-9 h-9 rounded-sm shrink-0 flex items-center justify-center text-sm font-bold border ${style.bg} ${style.border} ${style.color}`}
        >
          {index + 1}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1.5 pl-1">
            <span className="text-base font-bold text-foreground capitalize tracking-tight">
              {item.skill}
            </span>
            <span
              className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${style.bg} ${style.border} ${style.color}`}
            >
              {style.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground pl-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {item.estimatedTime}
            </span>
            <span>·</span>
            <span>{item.resources.length} resources</span>
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <CardContent className="px-6 pb-6 pt-0 border-t border-border mt-1">
          {/* Why */}
          <p className="text-sm font-medium text-muted-foreground leading-relaxed py-4">
            <span className="font-bold text-foreground">Why: </span>
            {item.why}
          </p>

          {/* Resources */}
          <div className="flex flex-col gap-2.5">
            {item.resources.map((res, i) => {
              const Icon = RESOURCE_ICONS[res.type] ?? FileText;
              const isSearch = res.url?.includes("google.com/search");

              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-md bg-background border border-border group hover:border-foreground/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded shrink-0 bg-muted flex items-center justify-center text-foreground border border-border">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate pl-1">
                      {res.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground mt-0.5 pl-1">
                      <span className="uppercase tracking-wider">
                        {res.type}
                      </span>
                      {res.estimatedTime && <span>· {res.estimatedTime}</span>}
                      <span
                        className={`px-1.5 py-0.5 rounded-sm border ${res.free ? "bg-muted text-foreground border-border" : "bg-background border-border text-muted-foreground"}`}
                      >
                        {res.free ? "Free" : "Paid"}
                      </span>
                      {isSearch && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tighter">
                          <Search className="w-2.5 h-2.5" /> Fallback
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
                      className="text-muted-foreground transition-colors shrink-0 p-2 hover:text-foreground hover:bg-muted rounded flex items-center gap-1.5"
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
                        <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">
                          Search
                        </span>
                      ) : (
                        <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">
                          Open
                        </span>
                      )}
                      {isSearch ? (
                        <Search className="w-4 h-4" />
                      ) : (
                        <ExternalLink className="w-4 h-4" />
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

export default function LearningRoadmap({ roadmap }: LearningRoadmapProps) {
  if (!roadmap.length) return null;

  const sorted = [...roadmap].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((item, idx) => (
        <RoadmapCard key={item.skill} item={item} index={idx} />
      ))}
    </div>
  );
}
