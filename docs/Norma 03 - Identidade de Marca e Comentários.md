---
tipo: norma
titulo: "Norma 03 — Identidade de Marca e Comentários em PT-PT"
projeto: Linux de Camões
data_criacao: 2026-07-17
estado: aprovado
aplica_se_a: todo o repositório (frontend, backend, docs, mockups)
fonte_de_verdade: este ficheiro + docs/README.md
relaciona: [README, Norma 01 - Sistema de Tokens e Cores, Norma 02 - Layout Bento e Grelha]
---

# 🏷️ Norma 03 — Identidade de Marca e Comentários em PT-PT

Esta norma fixa **dois** padrões do projeto: (1) a identidade de marca/naming e
(2) o idioma dos comentários de código. O projeto **Linux de Camões** é open
source e vocacionado para a comunidade lusófona — a coerência do nome e o
português europeu (PT-PT) são obrigações, não ornamentos.

---

## Parte A — Identidade de Marca (Naming)

### A1 — Nome canónico: "Linux de Camões"
O nome de produto público — e **único** nome visível ao utilizador — é
**Linux de Camões**. Aparece, sem exceções, em:

- Header (cabeçalho) e footer;
- Metadata do browser (`<title>`, `description`, Open Graph);
- Saudações e cópias da UI (ex.: greeting do chat IA);
- Mockups e material de apresentação.

### A2 — Identidade técnica: `linuxdecamoes`
O identificador do repositório / pasta / package é `linuxdecamoes` (slug).
**Não** é um nome de produto — nunca aparece na UI. Mantém-se como está.

### A3 — Codename "KubeAI" extinto
O antigo codename interno **"KubeAI" foi extinto** (2026-07-17). **Proibido**
introduzir "KubeAI" em novo código, UI, docs ou commits. A verificação (secção
A6) tem de devolver **zero** ocorrências de `KubeAI`.

### A4 — Monograma: "L"
O logo/marca usa o monograma **"L"** (de **L**inux) dentro do bloco `bg-primary`.
Nas páginas de autenticação o monograma é `L` a `text-lg`; no header é `L` bold.

### A5 — Exceção documentada: identificador de base de dados
O nome da base de dados e do utilizador de BD é `kubeai`
(`backend/core/config.py` → `DATABASE_URL = "...kubeai:kubeai@.../kubeai"`). Este
é um **identificador de infraestrutura**, não branding: não é visível ao
utilizador e alterá-lo exige migração da BD + docker-compose. **Mantém-se**
enquanto exceção até uma migração planeada o reconsiderar.

> Qualquer **nova** exceção a A1/A3 tem de constar nesta secção (A5) com
> justificação.

### A6 — Verificação do naming
```powershell
# Deve devolver ZERO ocorrências (A5 é a única exceção admitida, em DATABASE_URL)
cmd /c "rg -n ""KubeAI|kubai"" --glob !**/node_modules/**"
```

---

## Parte B — Comentários de código em PT-PT

### B1 — PT-PT é o idioma dos comentários
Todos os comentários de código (`//`, `/* */`, `#`, `<!-- -->`, docstrings,
JSX `{/* */}`) são escritos em **português europeu (PT-PT)**. Aplica-se a
`.tsx`, `.ts`, `.js`, `.py`, `.css`, `.html`, `.jsonc`, etc.

> Exceção legítima: identificadores técnicos standard da linguagem/framework
> (ex.: `"use client"`, diretivas `@apply`, palavras-chave). Não se traduzem.

### B2 — Quando comentar
- **Comente o PORQUÊ, não o O QUÊ.** O código diz o que faz; o comentário explica
  a razão, a decisão, a advertência ou o contexto (open source = leitor externo).
- **Cabeçalhos de secção** em ficheiros longos (ex.: `{/* Hero */}`,
  `{/* Bento Grid */}`, `# --- Configuração ---`).
- **Mocks / TODOs / débitico técnico** sinalizados (`// TODO(...):`, `// MOCK:`,
  com contexto).
- **Lógica não óbvia**, valores-limite, trade-offs.

### B3 — Quando NÃO comentar
- Código auto-explicativo (`i = 0; // inicializa i`).
- Comentários que apenas repetem o nome da função.
- Código comentado (morto) — apagar, o histórico fica no git.

### B4 — Estilo
- Frases completas, pontuadas, em PT-PT (evitar gerúndios brasileiros; usar
  infinitivo: "Regista o comando" ≠ "Registrando o comando").
- Breves. Se um comentário precisa de um parágrafo, considerar extrair para a
  documentação do vault (`docs/`).

### B5 — Documentação externa também em PT-PT
Toda a documentação do vault (`docs/`, ficheiros `00–04` da raiz, `AGENTS.md`) é
em PT-PT. Especificações técnicas geradas por ferramentas (ex.: `docs/superpowers/`)
podem manter o idioma original enquanto artefactos históricos, mas o nome de
marca segue a Parte A.

---

## Histórico

| Data | Evento |
|------|--------|
| 2026-07-17 | Norma criada. Naming unificado: "KubeAI" extinto da UI e dos docs; "Linux de Camões" é o nome canónico; monograma K→L. Norma PT-PT estabelecida. |
