"use client";

import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const transparentTheme = EditorView.theme({
  "&": {
    backgroundColor: "transparent !important",
    fontSize: "0.875rem",
    fontFamily: "var(--font-geist-mono), monospace",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": { fontFamily: "inherit" },
  ".cm-content": { padding: "0.5rem 0" },
  ".cm-line": { padding: "0 0.625rem" },
});

export function MarkdownEditor({
  value,
  onChange,
  disabled = false,
  placeholder = "Write your article in Markdown…",
}: MarkdownEditorProps) {
  return (
    <div
      className="
        min-h-64 rounded-lg border border-input bg-transparent
        focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50
        aria-disabled:cursor-not-allowed aria-disabled:opacity-50
        transition-colors overflow-hidden
      "
      aria-disabled={disabled}
    >
      <CodeMirror
        value={value}
        extensions={[markdown(), transparentTheme]}
        onChange={onChange}
        editable={!disabled}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
        }}
      />
    </div>
  );
}
