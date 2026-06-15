"""
MarkItDown Studio — local conversion API.

Wraps Microsoft's `markitdown` library behind a small FastAPI service so the
Next.js frontend can upload one or more files and get Markdown back, instead
of running `markitdown path-to-file.pdf -o document.md` by hand every time.

Run locally:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import os
import tempfile
import time
import traceback
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from markitdown import MarkItDown

# ---------------------------------------------------------------------------
# App + MarkItDown setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="MarkItDown Studio API",
    description="Local file -> Markdown conversion service",
    version="0.1.0",
)

# Allow the local Next.js dev server (and a same-machine production build) to
# call this API. Add/adjust origins if you host the frontend elsewhere.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# `enable_plugins=False` keeps conversions deterministic and avoids needing
# extra plugin packages. Flip to True (and `pip install markitdown-ocr`, etc.)
# if you want plugin-based converters such as OCR.
_markitdown = MarkItDown(enable_plugins=False)

# Reasonable cap so a stray huge upload doesn't hang the dev server.
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB per file


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------

class ConversionResult(BaseModel):
    filename: str
    success: bool
    markdown: str | None = None
    error: str | None = None
    char_count: int = 0
    duration_ms: int = 0


class ConvertResponse(BaseModel):
    results: list[ConversionResult]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/convert", response_model=ConvertResponse)
async def convert_files(files: list[UploadFile] = File(...)) -> ConvertResponse:
    if not files:
        raise HTTPException(status_code=400, detail="No files were uploaded.")

    results: list[ConversionResult] = []

    for upload in files:
        results.append(await _convert_single(upload))

    return ConvertResponse(results=results)


async def _convert_single(upload: UploadFile) -> ConversionResult:
    started = time.perf_counter()
    filename = upload.filename or "unnamed-file"
    suffix = Path(filename).suffix  # keep extension so MarkItDown can sniff the type

    tmp_path: str | None = None
    try:
        # Stream to a temp file so large uploads don't sit fully in memory.
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp_path = tmp.name
            size = 0
            while chunk := await upload.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_FILE_SIZE_BYTES:
                    raise ValueError(
                        f"File exceeds the {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB limit."
                    )
                tmp.write(chunk)

        conversion = _markitdown.convert(tmp_path)
        markdown_text = conversion.text_content

        return ConversionResult(
            filename=filename,
            success=True,
            markdown=markdown_text,
            char_count=len(markdown_text),
            duration_ms=int((time.perf_counter() - started) * 1000),
        )
    except Exception as exc:  # noqa: BLE001 - surface every conversion error to the UI
        return ConversionResult(
            filename=filename,
            success=False,
            error=f"{exc.__class__.__name__}: {exc}",
            duration_ms=int((time.perf_counter() - started) * 1000),
        )
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
        if os.environ.get("MARKITDOWN_DEBUG"):
            traceback.print_exc()
        await upload.close()
