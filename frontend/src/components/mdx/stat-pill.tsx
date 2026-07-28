import type { LucideIcon } from "lucide-react";

type StatPillProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  variant?: "default" | "accent";
};

export function StatPill({
  icon: Icon,
  label,
  value,
  variant = "default",
}: StatPillProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-background/80 px-3.5 py-1.5 text-sm shadow-sm backdrop-blur-sm">
      <Icon
        className={
          "h-4 w-4 " +
          (variant === "accent" ? "text-primary" : "text-muted-foreground")
        }
        aria-hidden
      />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </span>
  );
}
