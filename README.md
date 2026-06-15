# MarkItDown Studio

### Drop files. Get Markdown. Stay local.

A local web UI for [Microsoft's MarkItDown](https://github.com/microsoft/markitdown): drop in
PDFs, Word/Excel/PowerPoint files, HTML, images, audio, ZIPs, etc. and get clean Markdown back —
no `markitdown path-to-file.pdf -o document.md` commands needed.

```
┌────────────────────┐        ┌──────────────────────────┐
│  Next.js + Tailwind │  HTTP  │  FastAPI + markitdown     │
│  http://localhost:3000 ───▶  │  http://localhost:8000   │
└────────────────────┘        └──────────────────────────┘
```

Everything runs on your machine — files are written to a temp file, converted, and the temp file
is deleted immediately after.

## About

MarkItDown Studio is a small local web app built around Microsoft's
[MarkItDown](https://github.com/microsoft/markitdown) library. Instead of running
`markitdown file.pdf -o file.md` for every document, drag and drop one or more files into the
browser and get back clean, structured Markdown — headings, tables, and lists preserved — ready
to feed into an LLM pipeline, a notes vault, or a static site.

- **Frontend:** Next.js + Tailwind CSS, dark "3D" themed UI
- **Backend:** FastAPI service wrapping MarkItDown
- **Runs entirely locally** — files are converted in a temp file and deleted immediately after
- **Batch conversion** — queue up multiple files and convert them in one go
- **Copy or download** results as `.md` per file

## Quick Start

You'll run two processes in two terminals: the FastAPI backend on port 8000, and the Next.js
frontend on port 3000.

```bash
# Terminal 1 — backend
cd backend
py -3.12 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000`. Full details for each step are below.

## Using it

1. Drag and drop (or click to browse) — you can queue up multiple files at once.
2. Click **Convert to Markdown**.
3. Each file gets its own result card: a live Markdown preview, a **Copy** button, and a
   **.md** download button (saved as `<original-name>.md`).

