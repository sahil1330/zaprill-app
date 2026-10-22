import { Filter, RefreshCw, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import {
  LocationCombobox,
  locationMatchesCity,
} from "@/components/LocationCombobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  trackFilterApplied,
  trackFilterPanelOpen,
  trackLocationSearch,
} from "@/lib/analytics";
import type { JobMatch } from "@/types";
import type { ResumeData } from "@/types/resume";
import type { FilterState } from "./types";

interface JobFiltersProps {
  filterState: FilterState;
  setFilterState: Dispatch<SetStateAction<FilterState>>;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  isSearchingLocation: boolean;
  resume: ResumeData | null;
  jobs: JobMatch[];
  runAnalysis: (resume: ResumeData, locationOverride?: string) => void;
}

export function JobFilters({
  filterState,
  setFilterState,
  showFilters,
  setShowFilters,
  isSearchingLocation,
  resume,
  jobs,
  runAnalysis,
}: JobFiltersProps) {
  const { searchTitle, searchLoc, workType, empType, minMatch, requireSalary } =
    filterState;

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => {
    setFilterState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-black text-base text-foreground uppercase tracking-wider">
          Advanced Filters
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (!showFilters) trackFilterPanelOpen();
            setShowFilters(!showFilters);
          }}
          className="font-bold text-sm"
        >
          <Filter className="mr-2 h-4 w-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {showFilters && (
        <div className="grid animate-fade-in grid-cols-1 gap-6 border-border/50 border-t pt-2 md:grid-cols-2 lg:grid-cols-3">
          {/* Text Filters */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="job-filter-title"
                className="font-bold text-muted-foreground text-xs uppercase tracking-wider"
              >
                Search Title
              </label>
              <Input
                id="job-filter-title"
                placeholder="e.g. Frontend Engineer"
                value={searchTitle}
                onChange={(e) => {
                  updateFilter("searchTitle", e.target.value);
                  if (e.target.value) {
                    trackFilterApplied({
                      filter_type: "title",
                      filter_value: e.target.value,
                    });
                  }
                }}
                className="border-border bg-background font-medium"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="job-filter-city"
                className="font-bold text-muted-foreground text-xs uppercase tracking-wider"
              >
                City (India)
              </label>
              <LocationCombobox
                id="job-filter-city"
                value={searchLoc}
                onChange={(city) => {
                  updateFilter("searchLoc", city);
                  // If the chosen city isn't in the existing results, trigger a new search
                  if (city && resume) {
                    const hasJobsInCity = jobs.some((j) =>
                      locationMatchesCity(j.location, city),
                    );
                    if (!hasJobsInCity) {
                      trackLocationSearch({
                        city,
                        triggered_by: "combobox_change",
                      });
                      runAnalysis(resume, city);
                    }
                  }
                  trackFilterApplied({
                    filter_type: "location",
                    filter_value: city,
                  });
                }}
                disabled={isSearchingLocation}
              />
              {searchLoc && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-9 w-full font-bold"
                  disabled={isSearchingLocation}
                  onClick={() => {
                    if (resume) {
                      trackLocationSearch({
                        city: searchLoc,
                        triggered_by: "search_button",
                      });
                      runAnalysis(resume, searchLoc);
                    }
                  }}
                >
                  {isSearchingLocation ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    `Search jobs in ${searchLoc}`
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Dropdown Filters */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="job-filter-workspace"
                className="font-bold text-muted-foreground text-xs uppercase tracking-wider"
              >
                Workspace
              </label>
              <Select
                value={workType}
                onValueChange={(v) => {
                  updateFilter("workType", v || "any");
                  trackFilterApplied({
                    filter_type: "work_type",
                    filter_value: v || "any",
                  });
                }}
              >
                <SelectTrigger
                  id="job-filter-workspace"
                  className="border-border bg-background font-bold"
                >
                  <SelectValue placeholder="Any Workspace" />
                </SelectTrigger>
                <SelectContent className="font-bold">
                  <SelectItem value="any">Any Workspace</SelectItem>
                  <SelectItem value="remote">Remote Only</SelectItem>
                  <SelectItem value="onsite">Onsite Only</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="job-filter-employment"
                className="font-bold text-muted-foreground text-xs uppercase tracking-wider"
              >
                Employment Type
              </label>
              <Select
                value={empType}
                onValueChange={(v) => {
                  updateFilter("empType", v || "any");
                  trackFilterApplied({
                    filter_type: "employment_type",
                    filter_value: v || "any",
                  });
                }}
              >
                <SelectTrigger
                  id="job-filter-employment"
                  className="border-border bg-background font-bold"
                >
                  <SelectValue placeholder="Any Type" />
                </SelectTrigger>
                <SelectContent className="font-bold">
                  <SelectItem value="any">Any Type</SelectItem>
                  <SelectItem value="fulltime">Full-Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="parttime">Part-Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Slider and Range Filters */}
          <div className="space-y-6 pt-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="job-filter-match"
                  className="font-bold text-muted-foreground text-xs uppercase tracking-wider"
                >
                  Min Match Score
                </label>
                <span className="font-black text-foreground text-sm">
                  {minMatch[0]}%
                </span>
              </div>
              <Slider
                id="job-filter-match"
                defaultValue={[0]}
                max={100}
                step={5}
                value={minMatch}
                onValueChange={(v) => {
                  const valArr = Array.isArray(v) ? v : [v];
                  updateFilter("minMatch", valArr);
                  trackFilterApplied({
                    filter_type: "min_match",
                    filter_value: valArr[0],
                  });
                }}
                className="my-4"
              />
            </div>
            <div className="flex items-center justify-between rounded border border-border bg-background p-3">
              <label
                htmlFor="job-filter-salary"
                className="font-bold text-foreground text-sm"
              >
                Require Salary Details
              </label>
              <Switch
                id="job-filter-salary"
                checked={requireSalary}
                onCheckedChange={(v) => {
                  updateFilter("requireSalary", v);
                  trackFilterApplied({
                    filter_type: "require_salary",
                    filter_value: v,
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Badges */}
      {(searchTitle ||
        searchLoc ||
        workType !== "any" ||
        empType !== "any" ||
        minMatch[0] > 0 ||
        requireSalary) &&
        showFilters && (
          <div className="mt-5 flex flex-wrap items-center gap-2 border-border/50 border-t pt-5">
            <span className="mr-2 font-bold text-muted-foreground text-xs">
              Active:
            </span>
            {searchTitle && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 font-bold"
              >
                Title: &apos;{searchTitle}&apos;{" "}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("searchTitle", "")}
                />
              </Badge>
            )}
            {searchLoc && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 font-bold"
              >
                Location: &apos;{searchLoc}&apos;{" "}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("searchLoc", "")}
                />
              </Badge>
            )}
            {workType !== "any" && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 font-bold capitalize"
              >
                {workType}{" "}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("workType", "any")}
                />
              </Badge>
            )}
            {empType !== "any" && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 font-bold capitalize"
              >
                {empType.replace("time", "-time")}{" "}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("empType", "any")}
                />
              </Badge>
            )}
            {minMatch[0] > 0 && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 font-bold"
              >
                &gt;{minMatch[0]}% Match{" "}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("minMatch", [0])}
                />
              </Badge>
            )}
            {requireSalary && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 font-bold"
              >
                Has Salary{" "}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter("requireSalary", false)}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-6 font-bold text-xs"
              onClick={() => {
                setFilterState({
                  searchTitle: "",
                  searchLoc: "",
                  workType: "any",
                  empType: "any",
                  minMatch: [0],
                  requireSalary: false,
                });
              }}
            >
              Clear All
            </Button>
          </div>
        )}
    </div>
  );
}
