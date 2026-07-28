import type { ReactNode } from "react";
import { DetailsDisclosure } from "@/components/markdown/details-disclosure";

export function SolutionBlock({ children }: { children: ReactNode }) {
  return (
    <DetailsDisclosure summary={<span className="font-medium">Solução</span>} defaultOpen={true}>
      <div
        className={
          // Texto
          "[&>p]:mb-2 [&>p]:text-sm [&>p]:leading-relaxed [&>p]:text-foreground/90 [&>p:last-child]:mb-0 " +
          // Strong
          "[&_strong]:font-semibold [&_strong]:text-foreground"
        }
      >
        {children}
      </div>
    </DetailsDisclosure>
  );
}
