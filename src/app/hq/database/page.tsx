"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Database, FileJson, Loader2, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { exportToCSV } from "@/lib/admin/csv-export";
import { cn } from "@/lib/utils";

export default function DatabasePage() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  // Fetch table list on mount
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await fetch("/api/admin/db");
        const json = await res.json();
        setTables(json);
        if (json.length > 0) setSelectedTable(json[0]);
      } catch (e) {
        toast.error("Failed to load tables");
      }
    };
    fetchTables();
  }, []);

  // Fetch table data when selected table or page changes
  useEffect(() => {
    if (!selectedTable) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/db?table=${selectedTable}&page=${page}`,
        );
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setData(json.data);
        setTotal(json.total);
      } catch (e: any) {
        toast.error(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedTable, page]);

  const handleExport = async () => {
    if (!selectedTable) return;
    setExporting(true);
    const toastId = toast.loading(`Exporting ${selectedTable}...`);
    try {
      const res = await fetch(
        `/api/admin/db?table=${selectedTable}&export=true`,
      );
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      exportToCSV(
        json.data,
        `zaprill_${selectedTable}_${format(new Date(), "yyyy-MM-dd")}`,
      );
      toast.success("CSV exported successfully", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Export failed", { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  // Dynamically generate columns based on the data keys
  const columns: ColumnDef<any>[] =
    data.length > 0
      ? Object.keys(data[0]).map((key) => ({
          accessorKey: key,
          header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
          cell: ({ row }) => {
            const value = row.getValue(key);
            if (value === null || value === undefined)
              return (
                <span className="text-muted-foreground italic text-xs">
                  null
                </span>
              );
            if (typeof value === "object")
              return (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRow(row.original)}
                  className="h-6 px-2 text-[10px]"
                >
                  <FileJson className="mr-1 h-3 w-3" /> View JSON
                </Button>
              );
            if (typeof value === "boolean") return value ? "True" : "False";
            const str = String(value);
            return (
              <span className="truncate max-w-[200px]" title={str}>
                {str}
              </span>
            );
          },
        }))
      : [];

  return (
    <div className="flex flex-col gap-6 min-w-0 w-full">
      {/* Page title — no right-side controls, no justify-between */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Database Explorer</h1>
        <p className="text-muted-foreground">
          Introspect and manage your database records.
        </p>
      </div>

      <Card className="min-w-0">
        {/* All controls live in the CardHeader — always visible, never scrolled away */}
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap py-3">
          <div>
            <CardTitle className="capitalize">
              {selectedTable || "No table selected"}
            </CardTitle>
            <CardDescription>
              Displaying {data.length} of {total} records.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Select
              value={selectedTable || ""}
              onValueChange={(val) => {
                setSelectedTable(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <Database className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                {tables.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedTable(selectedTable)}
              disabled={loading}
            >
              <RefreshCcw
                className={cn("h-4 w-4", loading && "animate-spin")}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={data}
                onExport={handleExport}
              />
            )}
          </div>
        </CardContent>

        {/* Server-side pagination footer */}
        {!loading &&
          total > 0 &&
          (() => {
            const totalPages = Math.ceil(total / 50);
            const getPageRange = (current: number, total: number) => {
              if (total <= 7)
                return Array.from({ length: total }, (_, i) => i + 1);
              if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
              if (current >= total - 3)
                return [
                  1,
                  "...",
                  total - 4,
                  total - 3,
                  total - 2,
                  total - 1,
                  total,
                ];
              return [
                1,
                "...",
                current - 1,
                current,
                current + 1,
                "...",
                total,
              ];
            };
            const pageRange = getPageRange(page, totalPages);

            return totalPages > 1 ? (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} &middot; {total} total records
                </p>
                <Pagination className="mx-0 w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        aria-disabled={page <= 1}
                        className={
                          page <= 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {pageRange.map((p, i) =>
                      p === "..." ? (
                        <PaginationItem key={`e-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={p}>
                          <PaginationLink
                            isActive={p === page}
                            onClick={() => setPage(p as number)}
                            className="cursor-pointer"
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        aria-disabled={page >= totalPages}
                        className={
                          page >= totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            ) : null;
          })()}
      </Card>

      {/* JSON Viewer Sheet */}
      <Sheet open={!!selectedRow} onOpenChange={() => setSelectedRow(null)}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Row Data</SheetTitle>
            <SheetDescription>
              Full JSON representation of the selected record.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)] mt-4 rounded-md border bg-muted p-4">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(selectedRow, null, 2)}
            </pre>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
