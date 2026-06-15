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
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000`. Full details for each step are below.

## 1. Backend (FastAPI + MarkItDown)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

This starts the API at `http://localhost:8000`. Check it's alive:

```bash
curl http://localhost:8000/api/health
# {"status": "ok"}
```

`POST /api/convert` accepts one or more files (`multipart/form-data`, field name `files`) and
returns Markdown for each:

```bash
curl -s -X POST http://localhost:8000/api/convert \
  -F "files=@report.pdf" \
  -F "files=@notes.docx"
```

### Heavier formats

`requirements.txt` installs `markitdown[all]`, which covers every built-in converter (including
audio/YouTube transcription, which pulls in larger ML dependencies). If you only care about
office docs and PDFs, edit `requirements.txt` to use a smaller extras set, e.g.:

```
markitdown[pdf,docx,pptx,xlsx,outlook]==0.1.6
```

## 2. Frontend (Next.js + Tailwind)

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The page checks `/api/health` on load and shows an "api
connected" / "api offline" badge in the top right, so you'll know immediately if the backend
isn't running.

If your API runs on a different host/port, copy `.env.local.example` to `.env.local` and adjust
`NEXT_PUBLIC_API_BASE`.

> Note: `next/font` fetches Space Grotesk, Inter, and JetBrains Mono from Google Fonts the first
> time you build/run. You'll need an internet connection for that initial fetch (fonts are then
> cached locally by Next.js).

## 3. Using it

1. Drag and drop (or click to browse) — you can queue up multiple files at once.
2. Click **Convert to Markdown**.
3. Each file gets its own result card: a live Markdown preview, a **Copy** button, and a
   **.md** download button (saved as `<original-name>.md`).

## Project layout

```
backend/
  main.py            FastAPI app — /api/health and /api/convert
  requirements.txt
frontend/
  app/
    layout.tsx       Fonts + global dark backdrop
    page.tsx         Page layout: hero, dropzone, results
    globals.css      Theme tokens, glass panels, 3D/grid backdrop
  components/
    FormatStack3D.tsx  Signature 3D "many formats -> one format" hero visual
    Dropzone.tsx       Drag/drop + file queue
    ResultPanel.tsx    Per-file Markdown preview, copy & download
  lib/
    api.ts           Backend API client
```

## Production build (optional)

```bash
# backend
uvicorn main:app --host 0.0.0.0 --port 8000

# frontend
npm run build && npm run start
```
