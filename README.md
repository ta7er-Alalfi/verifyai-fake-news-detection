# VerifyAI — Fake News Detection

Graduation project: End-to-end fake news detection using RoBERTa + TF-IDF baseline.

---

## Project Structure

```
fake-news-detection/
├── backend/
│   ├── main.py              # FastAPI server
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/           # Home, Analyze, About
│   │   └── components/      # Navbar, ResultCard, ConfidenceBar
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── models/
│   └── fake_news_roberta_training.ipynb   # Full training notebook
└── README.md
```

---

## Quick Start

### 1. Train the model (Google Colab T4)
```
Open models/fake_news_roberta_training.ipynb in Colab
Runtime → Change runtime type → T4 GPU
Run All
Download saved_model.zip when done
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt

# Put your saved_model/ folder here
cp -r /path/to/saved_model ./saved_model

uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Docker (optional)
```bash
cd backend
docker build -t fakenews-api .
docker run -p 8000:8000 -v $(pwd)/saved_model:/app/saved_model fakenews-api
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/predict` | Single article prediction |
| POST | `/predict/batch` | Batch (up to 10) |
| GET | `/health` | Health check |
| GET | `/model/info` | Model metadata |

### Example request
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"title": "NASA confirms new discovery", "text": "Scientists at NASA confirmed..."}'
```

### Example response
```json
{
  "label": "REAL",
  "confidence": 0.9812,
  "prob_fake": 0.0188,
  "prob_real": 0.9812,
  "model_used": "roberta-base",
  "latency_ms": 142.3
}
```

---

## Model

| | TF-IDF + LR | RoBERTa |
|---|---|---|
| Accuracy | ~92% | ~97.8% |
| F1 | ~0.92 | ~0.978 |
| Latency | <5ms | <200ms |
| Params | 20K features | 125M |

**Training data:** HuggingFace `magnea/fake-news-formated` + Kaggle `clmentbisaillon/fake-and-real-news-dataset`

---

## Tech Stack

- **Model:** `roberta-base` (HuggingFace Transformers)
- **Backend:** FastAPI + Uvicorn
- **Frontend:** React 18 + Vite + Recharts
- **Training:** PyTorch + HuggingFace Trainer API
