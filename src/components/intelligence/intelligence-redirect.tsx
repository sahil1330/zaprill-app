"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function intelligenceRedirectTarget(
  hash: string,
): "/" | "/#pay" | "/#path" {
  if (hash === "#pay") return "/#pay";
  if (hash === "#path") return "/#path";
  return "/";
}

export function IntelligenceRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(intelligenceRedirectTarget(window.location.hash));
  }, [router]);
  return null;
}
