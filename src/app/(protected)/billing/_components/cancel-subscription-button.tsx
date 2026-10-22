"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function CancelSubscriptionButton({
  accessEndLabel,
}: {
  accessEndLabel: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function cancel() {
    setPending(true);
    try {
      const res = await fetch("/api/billing/subscription", { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Could not cancel the subscription");
      }
      toast.success(
        accessEndLabel
          ? `Plan canceled. Access continues until ${accessEndLabel}.`
          : "Plan canceled.",
      );
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not cancel the subscription",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" className="w-full sm:w-auto" />
        }
      >
        Cancel plan
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this plan?</AlertDialogTitle>
          <AlertDialogDescription>
            {accessEndLabel
              ? `Pro features stay available until ${accessEndLabel}. After that the account returns to the free plan. This does not refund the current period.`
              : "Pro features stay available through the end of the paid period. This does not refund the current period."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep plan</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() => void cancel()}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Cancel plan
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
