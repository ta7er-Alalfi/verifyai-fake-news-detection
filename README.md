---
title: VerifyAI - Fake News Detection
emoji: 🔍
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: true
license: mit
---

# VerifyAI — Fake News Detection

Graduation project: End-to-end fake news detection using a fine-tuned RoBERTa model with a hybrid heuristic pipeline.

**Live Demo:** [https://huggingface.co/spaces/ta7era7med/verifyai](https://huggingface.co/spaces/ta7era7med/verifyai)

**Model:** [ta7era7med/verifyai-roberta](https://huggingface.co/ta7era7med/verifyai-roberta)

---

## Features

- 🤖 **RoBERTa-based classification** — Fine-tuned on fake/real news datasets (~97.8% accuracy)
- 🔬 **Hybrid heuristic pipeline** — Detects clickbait, conspiracy framing, miracle cures, and sensationalism
- 💬 **AI Chatbot** — Powered by Google Gemini for media literacy Q&A
- 📊 **Dashboard** — Track prediction history and confidence trends
- 🔐 **User Authentication** — JWT-based login/register

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/predict` | Single article prediction |
| POST | `/predict/batch` | Batch (up to 10) |
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| POST | `/chat` | AI chatbot |
| GET | `/recommendations` | Personalized recommendations |
| GET | `/health` | Health check |

---

## Tech Stack

- **Model:** `roberta-base` fine-tuned (HuggingFace Transformers)
- **Backend:** FastAPI + Uvicorn
- **Frontend:** React 18 + Vite + Tailwind CSS + Radix UI
- **Training:** PyTorch + HuggingFace Trainer API
