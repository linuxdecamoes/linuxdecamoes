---
titulo: "Splash Screen Animado — Loading Screen com Logo SVG"
projeto: Linux de Camões
data_criacao: 2026-08-01
estado: aprovado
idioma: PT-PT
---

# Splash Screen Animado — Design Spec

## 1. Visão Geral

Loading screen (splash) animado que aparece **uma vez por sessão de browser**
na entrada do site. Exibe o logo SVG `linuxdecamoes_bk.svg` com animação
cinematográfica (combo: fade-in → reveal progressivo do logo → glow
ring → nome do projeto desliza → fade-out). Duração total ~2.5s.

## 2. Requisitos

| # | Requisito | Fonte |
|---|-----------|-------|
| R1 | Aparece só na 1ª visita por sessão (sessionStorage) | Utilizador |
| R2 | Animação "combo cinematográfico" (~2.5s) | Utilizador |
| R3 | Fundo sólido neutro (`--background` do site) | Utilizador |
| R4 | Zero novas dependências (ADR-001: CSS puro + SVG inline) | Projeto |
| R5 | Tokens OKLCH, zero cores inline em `.tsx` (Norma 01) | Projeto |
| R6 | Respeitar `prefers-reduced-motion` | Acessibilidade |
| R7 | Sem FOUC (flash of unstyled content) na 1ª vista | UX |
| R8 | Sem flash do splash para utilizadores que regressam | UX |

## 3. Decisões de Design

### 3.1 Abordagem: Client Component no root layout + SVG inline

- `<SplashScreen>` (Client Component) montado no `layout.tsx` raiz.
- SVG inline no componente → CSS pode animar elementos individuais (`.splash-disc`,
  `.splash-tier-1`…`4`).
- Gate via `sessionStorage` (`ldc:splash-shown`).

Motivo: usar `<img>` não permite animar paths individuais. Usar `loading.tsx`
não suporta o gate "uma vez por sessão".

### 3.2 Anti-flash (script inline no `<head>`)

Script *blocking* no `<head>` antes de qualquer React:

```
<script>
  (function(){
    if(sessionStorage.getItem('ldc:splash-shown')==='1'){
      document.documentElement.setAttribute('data-splash','skip');
    }
  })();
</script>
```

CSS: `html[data-splash="skip"] .splash-overlay { display: none; }`.

Resultado: utilizadores que regressam na mesma sessão **nunca vêem o overlay**
(escondido antes do 1º paint). Novos visitantes têm overlay server-rendered
no 1º paint (sem FOUC).

### 3.3 SVG inline: agrupamento em 4 tiers

O SVG original tem ~14 paths preenchidos. Para um "draw" fluido sem expor
complexidade excessiva, os paths interiores são agrupados em 4 tiers de
reveal sequencial (stagger 0.15s).

## 4. Timeline de Animação

Todas as animações via `@keyframes` CSS. Ativadas por classes condicionais
no JSX (`animate-splash-stage-1` … `animate-splash-stage-5`).

| Fase | Tempo | Descrição | Keyframe CSS |
|------|-------|-----------|--------------|
| 1 | 0.0–0.4s | Overlay bg fade-in + logo container scale-in (0.85→1) | `fadeIn`, `pop-in` (existentes) |
| 2 | 0.3–1.8s | "Draw": 4 tiers de paths revelam em stagger | **Novo:** `splash-draw` |
| 3 | 1.6–2.0s | Glow ring expande (scale 1→1.4) + fade-out | **Novo:** `splash-glow` |
| 4 | 1.9–2.3s | Nome "Linux de Camões" slide-up + fade-in | **Novo:** `splash-name` |
| 5 | 2.4–2.8s | Overlay inteiro fade-out + unmount | `fadeOut` |

### Novo token OKLCH

```css
:root {
  --splash-glow: oklch(0.55 0.20 260 / 0.3); /* primary com alpha */
}
```

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  .splash-tier-1, .splash-tier-2, .splash-tier-3, .splash-tier-4,
  .splash-stage-2, .splash-stage-3, .splash-stage-4 {
    animation: none;
    opacity: 1;
    transform: none;
  }
  /* Mostra logo + nome instantaneamente, 400ms hold, fade-out */
}
```

## 5. Arquitetura de Ficheiros

| Ficheiro | Ação | Descrição |
|----------|------|-----------|
| `frontend/src/components/splash-screen.tsx` | **Novo** | Client Component com SVG inline |
| `frontend/src/app/layout.tsx` | **Editar** | Script anti-flash no `<head>` + `<SplashScreen />` antes de `{children}` |
| `frontend/src/app/globals.css` | **Editar** | Novos keyframes (`splash-draw`, `splash-glow`, `splash-name`, `fadeOut`) + utilitários de timing/stagger |
| `docs/superpowers/specs/2026-08-01-splash-screen-design.md` | **Novo** | Este documento |

## 6. Componente `<SplashScreen>`

### 6.1 Props

Nenhuma. Autónomo (lê/escreve sessionStorage internamente).

### 6.2 Estado

```
visible: boolean (default true para SSR)
```

### 6.3 Ciclo de vida

1. **Server render:** overlay renderizado (cobre 1º paint).
2. **Script inline:** se `sessionStorage` marcado → `html[data-splash="skip"]`
   → CSS esconde overlay antes do paint. Utilizador que regressa nunca vê nada.
3. **useEffect mount:** se `sessionStorage` **não** marcado → inicia timeline.
   Se **já** marcado → `setVisible(false)` (redundante com CSS, confirmação).
4. **onAnimationEnd** (+ `setTimeout(3000)` safety) → `setVisible(false)` +
   `sessionStorage.setItem('ldc:splash-shown', '1')`.

### 6.4 JSX (estrutura conceptual)

```tsx
{visible && (
  <div className="splash-overlay fixed inset-0 z-[9999]" role="presentation" aria-hidden="true">
    <div className="splash-bg" />  {/* fundo solid --background */}
    <div className="splash-content flex flex-col items-center justify-center h-full">
      <div className="splash-logo relative">
        {/* SVG inline */}
        <svg viewBox="0 0 1586.42 1586.42">
          <circle className="splash-disc" />       {/* disco preto */}
          <g className="splash-tier-1">...</g>     {/* tier 1 paths */}
          <g className="splash-tier-2">...</g>     {/* tier 2 paths */}
          <g className="splash-tier-3">...</g>     {/* tier 3 paths */}
          <g className="splash-tier-4">...</g>     {/* tier 4 paths */}
        </svg>
        <div className="splash-glow-ring" />       {/* anel glow animado */}
      </div>
      <p className="splash-name">Linux de Camões</p>
    </div>
  </div>
)}
```

## 7. Acessibilidade

| Regra | Implementação |
|-------|---------------|
| `prefers-reduced-motion` | Animações desligadas; logo+nome instantâneo, hold 400ms, fade-out |
| Overlay decorativo | `role="presentation"`, `aria-hidden="true"` |
| Sem captura de foco | Não usa `aria-modal`, não captura `tabindex` |
| Bloqueio de interação | `pointer-events: auto` durante animação (2.5s); aceitável para splash 1ª visita |

## 8. Edge Cases

| Caso | Tratamento |
|------|------------|
| SSR (sessionStorage ausente) | Script inline corre no `<head>` antes do React; componente usa `useEffect` para ler |
| `onAnimationEnd` não dispara | `setTimeout(3000)` safety force-unmount |
| Browser sem sessionStorage | Try/catch no acesso → fallback: mostra splash sempre (sem gate) |
| Utilizador recarrega durante splash | Splash mostra novamente (ainda não marcou sessionStorage); só marca no fim |
| Vários tabs na mesma sessão | sessionStorage é por tab → cada tab mostra o seu splash (normal) |

## 9. Restrições Cumpridas

- [x] ADR-001: zero deps runtime (CSS keyframes + SVG inline)
- [x] Norma 01: zero cores inline em `.tsx` (tudo `var(--*)`)
- [x] Abordagem A: CSS puro + SVG inline
- [x] PT-PT em todo o conteúdo
- [x] Novo token OKLCH: `--splash-glow` em `:root` + `@theme inline`
