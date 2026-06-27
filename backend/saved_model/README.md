# Fake News Detector (RoBERTa — Hybrid Dataset)

## Model
- Base: `roberta-base`
- Task: Binary text classification (FAKE / REAL)
- Val Accuracy: **86.43%**

## Training Data
- HuggingFace: `magnea/fake-news-formated`
- Kaggle: `clmentbisaillon/fake-and-real-news-dataset`
- Total samples: 40,000 (balanced)

## Hyperparameters
- learning_rate: 1e-05
- epochs: 4
- max_length: 384
- effective_batch: 32
