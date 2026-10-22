"use client";

import { format } from "date-fns";
import {
  ChevronRight,
  Clock,
  Inbox,
  Loader2,
  Mail,
  RefreshCcw,
  Search,
  Send,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { HtmlContent } from "@/components/html-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

function EmailSkeleton() {
  return (
    <div className="divide-y rounded-md border">
      {["s1", "s2", "s3", "s4", "s5"].map((slot) => (
        <div key={slot} className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-[160px]" />
              <Skeleton className="h-3 w-[60px]" />
            </div>
            <Skeleton className="h-3 w-[240px]" />
            <Skeleton className="h-3 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmailsContent() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<"sent" | "received">("sent");
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/emails?type=${type}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setEmails(json.data || json);
    } catch (e: any) {
      toast.error(e.message || "Failed to load emails");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  return (
    <>
      <div className="flex items-center justify-between">
        <Tabs
          defaultValue="sent"
          onValueChange={(v) => setType(v as any)}
          className="w-full"
        >
          <div className="mb-6 flex items-center justify-between">
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <Send className="h-4 w-4" /> Sent
              </TabsTrigger>
              <TabsTrigger value="received" className="flex items-center gap-2">
                <Inbox className="h-4 w-4" /> Received
              </TabsTrigger>
            </TabsList>
            <Button
              onClick={fetchEmails}
              variant="outline"
              size="icon"
              disabled={loading}
            >
              <RefreshCcw
                className={cn("h-4 w-4", loading && "animate-spin")}
              />
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-0">
              <div className="mb-4 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search emails..."
                    className="w-full pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <EmailSkeleton />
              ) : emails.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <Mail className="mb-4 h-12 w-12 text-muted-foreground opacity-20" />
                  <h3 className="font-semibold text-lg">No emails found</h3>
                  <p className="text-muted-foreground">
                    Try switching tabs or adjusting filters.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  {emails.map((email, i) => {
                    const reactKey = email.id || `email-${i}`;
                    return (
                      <button
                        type="button"
                        key={reactKey}
                        onClick={() => setSelectedEmail(email)}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-4 bg-transparent p-4 text-left font-inherit transition-colors hover:bg-muted/50",
                          i !== emails.length - 1 && "border-b",
                        )}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {type === "sent" ? (
                            <Send className="h-5 w-5" />
                          ) : (
                            <Inbox className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center justify-between">
                            <p className="truncate font-semibold text-sm">
                              {type === "sent"
                                ? email.to?.[0] || "No recipient"
                                : email.from}
                            </p>
                            <p className="shrink-0 text-muted-foreground text-xs">
                              {format(
                                new Date(email.created_at || email.receivedAt),
                                "MMM dd, HH:mm",
                              )}
                            </p>
                          </div>
                          <p className="truncate text-foreground/80 text-sm">
                            {email.subject || "(No subject)"}
                          </p>
                          <p className="line-clamp-1 truncate text-muted-foreground text-xs">
                            {email.text ||
                              email.body?.substring(0, 100) ||
                              "No preview available"}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs>
      </div>

      {/* Email View Dialog */}
      <Dialog
        open={!!selectedEmail}
        onOpenChange={() => setSelectedEmail(null)}
      >
        <DialogContent className="flex h-[80vh] flex-col p-0 sm:max-w-3xl">
          <DialogHeader className="p-6 pb-2">
            <div className="mb-4 flex items-center justify-between">
              <Badge variant={type === "sent" ? "default" : "secondary"}>
                {type === "sent" ? "Sent" : "Received"}
              </Badge>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Clock className="h-3 w-3" />
                {selectedEmail &&
                  format(
                    new Date(
                      selectedEmail.created_at || selectedEmail.receivedAt,
                    ),
                    "PPPP p",
                  )}
              </div>
            </div>
            <DialogTitle className="text-xl">
              {selectedEmail?.subject || "(No subject)"}
            </DialogTitle>
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-12 font-medium text-muted-foreground">
                  From:
                </span>
                <span>{selectedEmail?.from}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 font-medium text-muted-foreground">
                  To:
                </span>
                <span>
                  {type === "sent"
                    ? selectedEmail?.to?.join(", ")
                    : selectedEmail?.to}
                </span>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden border-t">
            <ScrollArea className="h-full p-6">
              {selectedEmail?.html ? (
                <HtmlContent
                  className="prose prose-sm dark:prose-invert max-w-none"
                  html={selectedEmail.html}
                />
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {selectedEmail?.text || "No content"}
                </pre>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
