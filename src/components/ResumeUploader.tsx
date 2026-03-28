"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";

interface ResumeUploaderProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

export default function ResumeUploader({
  onUpload,
  disabled,
}: ResumeUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      setSelectedFile(file);
      onUpload(file);
    },
    [onUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSet(file);
    },
    [validateAndSet],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div style={{ width: "100%" }}>
      <div
        className={`upload-zone ${isDragging ? "drag-over" : ""}`}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          padding: "48px 32px",
          textAlign: "center",
          position: "relative",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload resume file"
        onKeyDown={(e) =>
          e.key === "Enter" && !disabled && inputRef.current?.click()
        }
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleChange}
          style={{ display: "none" }}
          id="resume-file-input"
          disabled={disabled}
        />

        {selectedFile ? (
          <div
            className="animate-fade-in"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              <CheckCircle size={28} color="#10b981" />
            </div>
            <div>
              <p
                style={{
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  fontSize: "15px",
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  justifyContent: "center",
                }}
              >
                <FileText size={16} color="#a5b4fc" />
                {selectedFile.name}
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                {formatSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={removeFile}
              className="btn-ghost"
              id="remove-resume-btn"
              style={{ fontSize: "13px", padding: "7px 14px" }}
            >
              <X size={14} /> Remove
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              className="animate-float"
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(99, 102, 241, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(99, 102, 241, 0.25)",
              }}
            >
              <Upload size={30} color="#a5b4fc" />
            </div>
            <div>
              <p
                style={{
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  fontSize: "16px",
                  marginBottom: 6,
                }}
              >
                Drop your resume here
              </p>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                or{" "}
                <span
                  style={{ color: "var(--accent-primary)", fontWeight: 500 }}
                >
                  click to browse
                </span>
              </p>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "12px",
                  marginTop: 8,
                }}
              >
                PDF, DOC, DOCX, or TXT · Max 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div
          className="animate-fade-in"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 12,
            padding: "10px 14px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: 8,
            color: "#f87171",
            fontSize: "13px",
          }}
        >
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
}
