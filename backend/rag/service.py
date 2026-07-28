"""
Serviço RAG — carrega índice FAISS + chunks, pesquisa por similaridade.
Dados copiados de ../rag/faiss_index/ para ./data/.
"""
from __future__ import annotations

import json
from pathlib import Path
from functools import lru_cache

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
FAISS_FILE = DATA_DIR / "lpi.index"
CHUNKS_FILE = DATA_DIR / "chunks.jsonl"
MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"


@lru_cache(maxsize=1)
def _load_model() -> SentenceTransformer:
    return SentenceTransformer(MODEL_NAME)


@lru_cache(maxsize=1)
def _load_index() -> tuple[faiss.Index, list[dict]]:
    index = faiss.read_index(str(FAISS_FILE))
    chunks = [
        json.loads(line)
        for line in CHUNKS_FILE.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    return index, chunks


def search(query: str, k: int = 5) -> list[dict]:
    model = _load_model()
    index, chunks = _load_index()

    qv = model.encode(
        [query],
        convert_to_numpy=True,
        normalize_embeddings=True,
    ).astype("float32")

    scores, idxs = index.search(qv, k)

    results = []
    for score, i in zip(scores[0], idxs[0]):
        if i < 0:
            continue
        c = chunks[i]
        results.append({
            "score": float(score),
            "file": c.get("file", ""),
            "manual": c.get("manual", ""),
            "topico": c.get("topico", ""),
            "secao": c.get("secao", ""),
            "tipo": c.get("tipo", ""),
            "texto": c.get("texto", ""),
        })
    return results
