"use client";

import { useState, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

interface ResumeUploaderProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

export default function ResumeUploader({
  onUpload,
  disabled,
}: ResumeUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const ACCEPTED = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const validateAndSet = useCallback(
    (file: File) => {
      setError(null);
      if (
        !ACCEPTED.includes(file.type) &&
        !file.name.match(/\.(pdf|doc|docx|txt)$/i)
      ) {
        setError("Please upload a PDF, DOC, DOCX, or TXT file");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("File size exceeds 10MB limit");
        return;
      }
      onUpload(file);
    },
    [onUpload]
  );

  return (
    <div className={`w-full ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <FileUpload
        onChange={(files) => {
          if (files && files.length > 0) {
            validateAndSet(files[0]);
          }
        }}
      />
      {error && (
        <div className="flex items-center gap-2 mt-3 p-3 bg-destructive/10 border border-destructive/25 rounded-md text-destructive text-sm font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
