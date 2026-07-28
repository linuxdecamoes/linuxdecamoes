import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  Lightbulb,
} from "lucide-react";

export type CalloutType = "note" | "tip" | "warning" | "danger";

type CalloutProps = {
  type?: CalloutType;
  title?: string;
  icon?: LucideIcon;
  children: ReactNode;
};

// Label PT-PT preenchido por defeito a partir do tipo (preserva o
// marcador original do Vault: Nota/Dica/Aviso/Perigo).
const typeLabel: Record<CalloutType, string> = {
  note: "Nota",
  tip: "Dica",
  warning: "Aviso",
  danger: "Perigo",
};

// classNames estáticas por tipo (Norma 01 — zero oklch inline).
const typeClasses: Record<CalloutType, string> = {
  note: "bg-callout-note-bg border-l-callout-note",
  tip: "bg-callout-tip-bg border-l-callout-tip",
  warning: "bg-callout-warning-bg border-l-callout-warning",
  danger: "bg-callout-danger-bg border-l-callout-danger",
};

const typeIcon: Record<CalloutType, LucideIcon> = {
  note: Info,
  tip: Lightbulb,
  warning: AlertTriangle,
  danger: AlertOctagon,
};

const typeIconClass: Record<CalloutType, string> = {
  note: "bg-background/70 text-callout-note",
  tip: "bg-background/70 text-callout-tip",
  warning: "bg-background/70 text-callout-warning",
  danger: "bg-background/70 text-callout-danger",
};

export function Callout({
  type = "note",
  title,
  icon,
  children,
}: CalloutProps) {
  const Icon = icon ?? typeIcon[type];

  return (
    <aside
      className={
        "relative my-8 flex gap-4 overflow-hidden rounded-xl border-l-4 p-5 shadow-sm backdrop-blur-sm " +
        typeClasses[type]
      }
    >
      <span
        className={
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm " +
          typeIconClass[type]
        }
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 [&>p]:mb-2 [&>p]:text-sm [&>p]:leading-relaxed [&>p]:text-foreground [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ul]:list-disc [&>ul]:space-y-1 [&>ul]:pl-5 [&>ul]:text-sm [&>ul]:text-foreground [&>ul:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-foreground [&_code]:rounded [&_code]:border [&_code]:border-border [&_code]:bg-background/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-foreground">
        <p className="mb-1 text-base font-bold text-foreground">
          {title ?? typeLabel[type]}
        </p>
        {children}
      </div>
    </aside>
  );
}
