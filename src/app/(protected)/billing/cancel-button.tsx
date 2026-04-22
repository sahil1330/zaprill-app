"use client";

import { Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CancelSubscriptionButton({
  subscriptionId,
}: {
  subscriptionId: string;
}) {
  const [isCanceling, setIsCanceling] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    setIsCanceling(true);
    try {
      const res = await fetch("/api/billing/subscription", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to cancel subscription");
      } else {
        toast.success("Subscription canceled successfully");
        setOpen(false);
        router.refresh();
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <XCircle className="w-4 h-4 mr-2" />
            Cancel Plan
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Subscription?</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your subscription? You will continue
            to have access to pro features until the end of your current billing
            period.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isCanceling}
          >
            Keep Subscription
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isCanceling}
          >
            {isCanceling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Yes, Cancel Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
