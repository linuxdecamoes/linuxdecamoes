/**
 * remark-callout — transforma blockquotes GFM-alert (`> [!type]`) em
 * `<Callout type="type">` no MDX. Tipos validos: note|tip|warning|danger.
 *
 * Build-time only (remark plugin) — nao viola ADR-001.
 * Caso-limite: blockquote sem marcador valido -> passa adiante (blockquote normal).
 *
 * Ficheiro .mjs (JavaScript ESM puro, sem tipos TS) para poder ser carregado via
 * import() do mdx-js-loader tanto em Node 20 (Docker) como em Node 22+ (host).
 */

const CALLOUT_RE = /^\[!(note|tip|warning|danger)\][ \t]*/i;

function paragraphText(p) {
  if (!p.children) return "";
  return p.children
    .map((c) => (c.type === "text" ? (c.value ?? "") : ""))
    .join("");
}

/** Remove o marcador `[!type]` do primeiro text node do paragrafo. */
function stripMarker(p) {
  const first = p.children?.find((c) => c.type === "text");
  if (!first || typeof first.value !== "string") return;
  first.value = first.value.replace(CALLOUT_RE, "");
  if (first.value === "") {
    // Remove o text node vazio para nao gerar espaco extra.
    if (p.children) {
      p.children = p.children.filter((c) => c !== first);
    }
  }
}

function transform(node) {
  if (!node.children) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.type === "blockquote" && child.children && child.children[0]) {
      const firstPara = child.children[0];
      if (firstPara.type === "paragraph") {
        const match = paragraphText(firstPara).match(CALLOUT_RE);
        if (match) {
          const type = match[1].toLowerCase();
          stripMarker(firstPara);
          node.children[i] = {
            type: "mdxJsxFlowElement",
            name: "Callout",
            attributes: [
              { type: "mdxJsxAttribute", name: "type", value: type },
            ],
            children: child.children,
          };
        }
      }
    }
    transform(child);
  }
}

export function remarkCallout() {
  return (tree) => {
    transform(tree);
  };
}

export default remarkCallout;
