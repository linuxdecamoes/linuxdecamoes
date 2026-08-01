"""
Serviço LLM via Groq API (gratuita).
Utiliza o modelo Llama 3.1 8B Instant para gerar respostas e quizzes com contexto RAG.
"""
from __future__ import annotations

from groq import Groq
from core.config import settings

SYSTEM_PROMPT = """\
Tu és um assistente especializado nos manuais LPI (Linux Professional Institute).
Responde sempre em português. Usa o contexto fornecido para dar respostas precisas.
Se o contexto não contiver informação suficiente, diz-o explicitamente.
Cita o manual/tópico de origem quando relevante."""

CHUNK_CONTEXT_TEMPLATE = """\
--- Fonte {idx}: {manual} / {topico} (secção: {secao}) ---
{texto}
--- fim ---"""


def build_context(chunks: list[dict]) -> str:
    parts = []
    for i, c in enumerate(chunks, 1):
        parts.append(
            CHUNK_CONTEXT_TEMPLATE.format(
                idx=i,
                manual=c.get("manual", "?"),
                topico=c.get("topico", "?"),
                secao=c.get("secao", "?"),
                texto=c.get("texto", "")[:2000],
            )
        )
    return "\n\n".join(parts)


def generate_response(query: str, chunks: list[dict]) -> str:
    client = Groq(api_key=settings.GROQ_API_KEY)

    context = build_context(chunks)
    user_msg = f"Contexto dos manuais LPI:\n{context}\n\nPergunta do utilizador: {query}"

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ],
        temperature=0.3,
        max_tokens=1024,
    )

    return response.choices[0].message.content


import json

QUIZ_GENERATION_SYSTEM = """Tu és um gerador de questões de certificação LPI (Linux Professional Institute).
Gera questões de múltipla escolha precisas e tecnicamente corretas.
Responde SEMPRE em português."""

QUIZ_GENERATION_TEMPLATE = """Com base nos seguintes tópicos dos manuais LPI, gera exatamente {n} questões de múltipla escolha.

Cada questão deve ter:
- Uma pergunta clara e específica
- 4 opções (A, B, C, D) — apenas uma correta
- A resposta correta (o texto exato da opção)
- Uma explicação concisa da resposta

Formato de saída — JSON array válido:
[
  {{
    "question": "Qual é a função do comando chmod?",
    "options": [
      "Alterar permissões de ficheiros",
      "Criar um novo utilizador",
      "Listar ficheiros num diretório",
      "Comprimir ficheiros"
    ],
    "correct_answer": "Alterar permissões de ficheiros",
    "explanation": "chmod (change mode) altera as permissões de acesso de ficheiros e diretórios."
  }}
]

Contexto dos manuais LPI:
{context}

Gera exatamente {n} questões. Responde APENAS com o JSON array, sem texto adicional."""


def generate_quizzes(chunks: list[dict], n: int = 5) -> list[dict]:
    """Generate quiz questions from RAG chunks using Groq."""
    context = "\n\n".join(
        f"[{c.get('manual', '')} / Tópico {c.get('topico', '')}] {c.get('texto', '')[:1500]}"
        for c in chunks[:8]
    )

    client = Groq(api_key=settings.GROQ_API_KEY)
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": QUIZ_GENERATION_SYSTEM},
            {
                "role": "user",
                "content": QUIZ_GENERATION_TEMPLATE.format(n=n, context=context),
            },
        ],
        temperature=0.4,
        max_tokens=4096,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
        if raw.endswith("```"):
            raw = raw[: -len("```")]
        raw = raw.strip()

    try:
        quizzes = json.loads(raw)
        if not isinstance(quizzes, list):
            return []
        return quizzes[:n]
    except json.JSONDecodeError:
        return []
