# ============================================================
# VerifyAI — Hugging Face Spaces (Docker SDK)
# Single container: React frontend (static) + FastAPI backend
# ============================================================

# ── Stage 1: Build the React frontend ───────────────────────
FROM node:20-slim AS frontend-builder

WORKDIR /frontend

# Copy frontend source
COPY frontend-only/client/package.json frontend-only/client/package-lock.json* ./
RUN npm install --ignore-scripts=false 2>/dev/null || npm install

COPY frontend-only/client/ ./

# Set API URL to same-origin (frontend and backend on same port)
ENV VITE_API_URL=""
RUN npm run build

# ── Stage 2: Build Python dependencies ──────────────────────
FROM python:3.11-slim AS backend-builder

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential && \
    rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Stage 3: Production runtime ─────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Copy Python packages from builder
COPY --from=backend-builder /install /usr/local

# Copy backend source code
COPY backend/config.py         .
COPY backend/database.py       .
COPY backend/logging_config.py .
COPY backend/main.py           .
COPY backend/routes/            ./routes/
COPY backend/services/          ./services/
COPY backend/schemas/           ./schemas/
COPY backend/models/            ./models/
COPY backend/middleware/         ./middleware/
COPY backend/utils/             ./utils/

# Copy built frontend static files
COPY --from=frontend-builder /frontend/dist ./static

# Create writable directories
RUN mkdir -p saved_model /tmp/hf_cache /data

# ── Environment variables ────────────────────────────────────
# Hugging Face model to download on first startup
ENV HF_MODEL_NAME=ta7era7med/verifyai-roberta
ENV HF_HOME=/tmp/hf_cache
ENV TRANSFORMERS_CACHE=/tmp/hf_cache

# Database stored in writable /data volume
ENV DATABASE_URL=sqlite+aiosqlite:////data/verifyai.db

# HF Spaces exposes port 7860
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
