"""
Endpoint de Chat IA com RAG + Groq.
POST /api/chat — recebe pergunta, pesquisa RAG, gera resposta com LLM.
"""
from __future__ import annotations

from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

from rag.service import search
from rag.llm import generate_response

router = APIRouter(tags=["chat"])


class ChatRequest(BaseModel):
    query: str
    k: int = 5


class SearchRequest(BaseModel):
    query: str
    k: int = 5


class ChunkResult(BaseModel):
    score: float
    file: str
    manual: str
    topico: str
    secao: str
    tipo: str
    texto: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[ChunkResult]


class SearchResponse(BaseModel):
    sources: list[ChunkResult]


@router.post("/search", response_model=SearchResponse)
async def search_only(req: SearchRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query não pode ser vazia")

    try:
        chunks = search(req.query, k=req.k)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na pesquisa RAG: {e}")

    return SearchResponse(sources=[ChunkResult(**c) for c in chunks])


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query não pode ser vazia")

    try:
        chunks = search(req.query, k=req.k)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na pesquisa RAG: {e}")

    if not chunks:
        raise HTTPException(status_code=404, detail="Nenhum resultado encontrado no índice")

    try:
        answer = generate_response(req.query, chunks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar resposta: {e}")

    return ChatResponse(
        answer=answer,
        sources=[ChunkResult(**c) for c in chunks],
    )
