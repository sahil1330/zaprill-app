"use client";

/** Download the server-generated PDF. The request is what increments download_count. */
export async function downloadResumePdf(id: string): Promise<void> {
  const res = await fetch(`/api/resumes/${id}/export`, { method: "POST" });
  if (!res.ok) {
    throw new Error("Export failed");
  }
  const blob = await res.blob();
  const header = res.headers.get("Content-Disposition") ?? "";
  const match = /filename="([^"]+)"/.exec(header);
  const filename = match?.[1] || "resume.pdf";
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
