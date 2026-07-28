import type { MDXComponents } from "mdx/types";
import { CopyButton } from "@/components/markdown/copy-button";
import { Callout, ExerciseCard, DistributionCard } from "@/components/mdx";

function TerminalPre({ children }: { children?: React.ReactNode }) {
  const codeText =
    typeof children === "object" &&
    children !== null &&
    "props" in children &&
    typeof (children as { props?: { children?: string } }).props?.children ===
      "string"
      ? ((children as { props: { children: string } }).props.children as string)
      : "";

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border border-white/10 bg-terminal-bg shadow-lg">
      <div className="flex items-center gap-2 border-b border-white/10 bg-terminal-bar px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-terminal-dot-red opacity-80" />
        <span className="h-3 w-3 rounded-full bg-terminal-dot-amber opacity-80" />
        <span className="h-3 w-3 rounded-full bg-terminal-dot-green opacity-80" />
        <span className="ml-2 flex-1 text-center font-mono text-xs text-white/40">
          bash
        </span>
        <CopyButton
          value={codeText}
          label="Copiar"
          copiedLabel="Copiado!"
          className="text-white/40 hover:bg-white/10 hover:text-white"
        />
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono text-[13px] text-terminal-text">
          {codeText.split("\n").map((line, i) => {
            const trimmed = line.trimStart();
            const isComment = trimmed.startsWith("# ");
            const isCommand = trimmed.startsWith("$ ") || trimmed === "$";
            return (
              <span key={i} className="block">
                {isComment ? (
                  <span className="text-terminal-comment">{line}</span>
                ) : isCommand ? (
                  <>
                    <span className="text-terminal-prompt">$ </span>
                    <span className="text-terminal-text">{line.slice(2)}</span>
                  </>
                ) : (
                  <span className="text-terminal-text">{line}</span>
                )}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}

function TerminalCode({ children }: { children?: React.ReactNode }) {
  return (
    <code className="rounded-md border border-border bg-muted/70 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
      {children}
    </code>
  );
}

const mdxProse = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="mt-8 mb-6 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
      {children}
    </h1>
  ),
  h2: ({ children, id }: { children?: React.ReactNode; id?: string }) => (
    <h2
      id={id}
      className="group relative mt-16 mb-6 flex items-baseline gap-3 border-b border-border pb-3 text-2xl font-bold tracking-tight text-foreground lg:text-3xl"
    >
      <span
        className="absolute -left-4 top-0 hidden h-full w-1 rounded-full bg-gradient-to-b from-primary to-transparent opacity-70 sm:block"
        aria-hidden
      />
      {children}
    </h2>
  ),
  h3: ({ children, id }: { children?: React.ReactNode; id?: string }) => (
    <h3
      id={id}
      className="mt-10 mb-4 border-l-2 border-primary/40 pl-4 text-xl font-bold text-foreground lg:text-2xl"
    >
      {children}
    </h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-4 text-base leading-[1.75] text-foreground/90">
      {children}
    </p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-5 list-disc space-y-2.5 pl-6 text-foreground/90 marker:text-primary/50">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-5 list-decimal space-y-2.5 pl-6 text-foreground/90 marker:text-primary/50">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-8 rounded-r-xl border-l-4 border-primary bg-primary/5 py-4 pl-5 pr-4 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  a: ({
    children,
    href,
  }: {
    children?: React.ReactNode;
    href?: string;
  }) => (
    <a
      href={href}
      className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-bold text-foreground">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic text-muted-foreground">{children}</em>
  ),
  hr: () => (
    <div className="my-12 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <table className="my-6 w-full border-collapse overflow-hidden rounded-lg border border-border text-sm">
      {children}
    </table>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-table-header-bg">{children}</thead>
  ),
  tbody: ({ children }: { children?: React.ReactNode }) => (
    <tbody>{children}</tbody>
  ),
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="border-b border-border/60 transition-colors hover:bg-muted/40">
      {children}
    </tr>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border-b border-border px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-foreground">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border-b border-border/50 px-3 py-2.5 text-muted-foreground">
      {children}
    </td>
  ),
  code: TerminalCode,
  pre: TerminalPre,
} as const;

export function useMDXComponents(): MDXComponents {
  return { ...mdxProse, Callout, ExerciseCard, DistributionCard };
}
