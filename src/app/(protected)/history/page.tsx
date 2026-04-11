"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Zap, Target, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

type HistoryItem = {
  id: string;
  createdAt: string;
  resumeName: string | null;
  resumeLocation: string | null;
  topMatchScore: number | null;
  totalJobsFound: number | null;
};

export default function HistoryPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/");
      return;
    }

    if (session?.user) {
      fetch("/api/analysis-history")
        .then((res) => res.json())
        .then((data) => {
          if (data.history) {
            setHistory(data.history);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [session, isPending, router]);

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
        <span className="font-bold text-lg">Loading history...</span>
      </div>
    );
  }
  console.log("user: ", session?.user);
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar
        showBack
        backHref="/"
        backLabel="Home"
        user={
          session?.user
            ? {
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
              }
            : null
        }
      />

      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight mb-3">
            Your Journey
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Review your past career analysis runs and track improvements.
          </p>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20 border border-border rounded-xl bg-card shadow-sm">
            <div className="w-16 h-16 bg-muted/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target className="h-8 w-8 text-foreground" />
            </div>
            <h2 className="text-2xl font-black mb-2">No past history found</h2>
            <p className="text-muted-foreground mb-6 font-medium">
              Head to the home page to start your first analysis!
            </p>
            <Button onClick={() => router.push("/")} className="font-bold">
              Start Analysis
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:border-foreground/50 transition-colors shadow-sm cursor-pointer"
                onClick={() => router.push(`/analyze?id=${item.id}`)}
              >
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg font-black tracking-tight line-clamp-1">
                      {item.resumeName || "Anonymous"}
                    </CardTitle>
                    <span className="text-xs font-bold text-muted-foreground bg-background px-2 py-1 rounded border border-border">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {item.resumeLocation && (
                    <div className="flex items-center text-xs font-bold text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3" />
                      {item.resumeLocation}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase font-black tracking-wider text-muted-foreground mb-1">
                        Top Match
                      </span>
                      <div className="flex items-center text-xl font-black text-foreground">
                        {item.topMatchScore}%{" "}
                        <Zap className="ml-1.5 h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                    </div>
                    <div className="flex flex-col border-l border-border pl-4">
                      <span className="text-xs uppercase font-black tracking-wider text-muted-foreground mb-1">
                        Jobs Found
                      </span>
                      <span className="text-xl font-black text-foreground">
                        {item.totalJobsFound || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
