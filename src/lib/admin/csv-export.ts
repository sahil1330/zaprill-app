"use client";

/**
 * Converts an array of objects to a CSV string and triggers a browser download.
 */
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // 1. Add headers
  csvRows.push(headers.join(","));

  // 2. Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      const escaped = String(val === null || val === undefined ? "" : val)
        .replace(/"/g, '""') // Escape double quotes
        .replace(/\n/g, " "); // Replace newlines with spaces for single-line CSV rows

      // Wrap in double quotes if it contains a comma or quote
      if (escaped.includes(",") || escaped.includes('"')) {
        return `"${escaped}"`;
      }
      return escaped;
    });
    csvRows.push(values.join(","));
  }

  // 3. Create blob and download
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
