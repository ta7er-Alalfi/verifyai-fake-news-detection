# ── Stage 1: Build dependencies ──────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# System packages needed to compile some Python wheels
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Stage 2: Runtime image ───────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Copy installed Python packages from builder
COPY --from=builder /install /usr/local

# Copy the ENTIRE backend project (all packages the app imports)
COPY config.py        .
COPY database.py      .
COPY logging_config.py .
COPY main.py          .
COPY routes/          ./routes/
COPY services/        ./services/
COPY schemas/         ./schemas/
COPY models/          ./models/
COPY middleware/       ./middleware/
COPY utils/           ./utils/

# Create an empty saved_model dir (HF will download model at runtime)
RUN mkdir -p saved_model

# Hugging Face cache directory (writable on Render)
ENV HF_HOME=/tmp/hf_cache
ENV TRANSFORMERS_CACHE=/tmp/hf_cache

# Default port (Render injects $PORT at runtime)
EXPOSE 8000

# Start command — Render overrides the port via $PORT env var
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
