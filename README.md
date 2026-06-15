# MarkItDown Studio

### Drop files. Get Markdown. Feed AI smarter.

A local web UI for [Microsoft's MarkItDown](https://github.com/microsoft/markitdown): drop in PDFs, Word/Excel/PowerPoint files, HTML, images, audio, ZIPs, etc. and get clean Markdown back — no CLI commands needed.

```
┌────────────────────┐        ┌──────────────────────────┐
│  Next.js + Tailwind │  HTTP  │  FastAPI + markitdown     │
│  http://localhost:3000 ───▶  │  http://localhost:8000   │
└────────────────────┘        └──────────────────────────┘
```

Everything runs on your machine — files are converted in a temp file, then the temp file is deleted immediately after.


## Why convert to Markdown before sending to an AI?

When you attach a raw PDF or DOCX to an AI chat, the model must first parse the binary format, extract structure, and decode metadata — burning tokens and sometimes losing layout fidelity in the process.

**Send Markdown instead:**

| Format | Approx tokens for a 10-page doc |
|---|---|
| Raw PDF (binary → base64) | ~18 000 |
| DOCX (XML bloat included) | ~12 000 |
| Clean Markdown | ~3 000–4 500 |

- ✦ **Less context used** — Markdown is plain text, no binary overhead
- ✦ **Fewer tokens consumed** — 3–6× smaller than the original file format
- ✦ **Better comprehension** — headings, tables, and lists survive the conversion cleanly
- ✦ **Portable** — paste into any model: ChatGPT, Claude, Gemini, local LLMs

> **Workflow:** Drop your PDF/DOCX here → copy the `.md` output → paste into your AI chat. Same information, fraction of the token cost.


## Features

- **Frontend:** Next.js + Tailwind CSS, dark "3D" themed UI
- **Backend:** FastAPI service wrapping MarkItDown
- **Fully local** — files never leave your machine
- **Batch conversion** — queue multiple files, convert in one click
- **Copy or download** results as `.md` per file

## Quick Start

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

Open `http://localhost:3000`. Drop a file, click **Convert to Markdown**, copy the result.
