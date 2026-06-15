"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2, Wand2, Circle } from "lucide-react";
import FormatStack3D from "@/components/FormatStack3D";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { API_BASE, convertFiles, type ConversionResult } from "@/lib/api";

type Status = "idle" | "converting" | "done" | "error";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendUp, setBackendUp] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/health`)
      .then((res) => {
        if (!cancelled) setBackendUp(res.ok);
      })
      .catch(() => {
        if (!cancelled) setBackendUp(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function addFiles(incoming: File[]) {
    setFiles((prev) => [...prev, ...incoming]);
    setResults([]);
    setStatus("idle");
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function clearAll() {
    setFiles([]);
    setResults([]);
    setStatus("idle");
    setErrorMessage(null);
  }

  async function handleConvert() {
    if (files.length === 0) return;
    setStatus("converting");
    setErrorMessage(null);
    try {
      const data = await convertFiles(files);
      setResults(data);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-16 px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      {/* Top bar */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan/10 font-display text-sm font-bold text-cyan">
            M↓
          </span>
          <span className="font-display text-sm font-medium tracking-wide text-ink2">
            MarkItDown Studio
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-[11px] text-muted">
          <Circle
            size={8}
            className={
              backendUp === null
                ? "fill-muted text-muted"
                : backendUp
                ? "fill-cyan text-cyan animate-pulse-glow"
                : "fill-rose-400 text-rose-400"
            }
          />
          {backendUp === null ? "checking api…" : backendUp ? "api connected" : "api offline"}
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col gap-10 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col gap-5">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan/80">
            local · fastapi + markitdown
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight text-ink2 sm:text-5xl">
            Every file format
            <br />
            becomes <span className="text-cyan">one format</span>.
          </h1>
          <p className="max-w-md font-body text-sm leading-relaxed text-muted sm:text-base">
            Drop in PDFs, Word docs, spreadsheets, slide decks, images, audio or HTML — MarkItDown
            converts each one to clean Markdown, right here on your machine. No CLI commands, no
            cloud upload.
          </p>
        </div>
        <div className="flex-1">
          <FormatStack3D />
        </div>
      </section>

      {/* Converter */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink2">Convert files</h2>
          {files.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              disabled={status === "converting"}
              className="flex items-center gap-1.5 font-mono text-[11px] text-muted transition-colors hover:text-rose-300 disabled:opacity-50"
            >
              <Trash2 size={12} />
              clear all
            </button>
          )}
        </div>

        <Dropzone files={files} onAdd={addFiles} onRemove={removeFile} disabled={status === "converting"} />

        <button
          type="button"
          onClick={handleConvert}
          disabled={files.length === 0 || status === "converting"}
          className="shadow-glow flex items-center justify-center gap-2 rounded-2xl bg-cyan px-5 py-3 font-display text-sm font-semibold text-ink transition-transform enabled:hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-surface2 disabled:text-muted disabled:shadow-none"
        >
          {status === "converting" ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Converting {files.length} file{files.length === 1 ? "" : "s"}…
            </>
          ) : (
            <>
              <Wand2 size={16} />
              Convert to Markdown
            </>
          )}
        </button>

        {backendUp === false && (
          <p className="rounded-xl border border-rose-400/30 bg-rose-400/5 px-4 py-3 font-mono text-xs text-rose-300">
            Can&apos;t reach the API at {API_BASE}. Start it with{" "}
            <code className="text-rose-200">uvicorn main:app --reload --port 8000</code> from the
            backend folder.
          </p>
        )}

        {status === "error" && errorMessage && (
          <p className="rounded-xl border border-rose-400/30 bg-rose-400/5 px-4 py-3 font-mono text-xs text-rose-300">
            {errorMessage}
          </p>
        )}
      </section>

      {/* Results */}
      {results.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-medium text-ink2">Output</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((result, i) => (
              <ResultPanel key={`${result.filename}-${i}`} result={result} />
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-line pt-6 font-mono text-[11px] text-muted">
        Runs fully locally — files never leave this machine. Frontend on :3000, API on :8000.
      </footer>
    </main>
  );
}
