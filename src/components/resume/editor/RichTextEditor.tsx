"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, Redo, Strikethrough, Undo } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Minimal mode hides the toolbar for inline usage (e.g. single-line bullets) */
  minimal?: boolean;
  className?: string;
}

/**
 * RichTextEditor — Tiptap-powered rich text field.
 * Supports bold, italic, strikethrough, and bullet lists.
 * For resume summaries and descriptions.
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  minimal = false,
  className = "",
}: RichTextEditorProps) {
  const isUpdatingRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false, // resume fields don't need headings
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[80px] px-3 py-2",
      },
    },
    onUpdate: ({ editor: ed }) => {
      isUpdatingRef.current = true;
      const html = ed.getHTML();
      // Don't emit <p></p> as content
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Sync external value changes (e.g. AI-generated summary)
  useEffect(() => {
    if (editor && !isUpdatingRef.current && editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
    isUpdatingRef.current = false;
  }, [value, editor]);

  if (!editor) return null;

  if (minimal) {
    return (
      <div
        className={`border border-input rounded-lg overflow-hidden bg-background ${className}`}
      >
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div
      className={`border border-input rounded-lg overflow-hidden bg-background ${className}`}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-7 w-7 p-0 ${editor.isActive("bold") ? "bg-accent text-accent-foreground" : ""}`}
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-7 w-7 p-0 ${editor.isActive("italic") ? "bg-accent text-accent-foreground" : ""}`}
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`h-7 w-7 p-0 ${editor.isActive("strike") ? "bg-accent text-accent-foreground" : ""}`}
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-7 w-7 p-0 ${editor.isActive("bulletList") ? "bg-accent text-accent-foreground" : ""}`}
        >
          <List className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-7 w-7 p-0"
        >
          <Undo className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-7 w-7 p-0"
        >
          <Redo className="h-3.5 w-3.5" />
        </Button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
