"use client"

import * as React from "react"
import { Collapsible } from "@base-ui/react/collapsible"
import { ChevronDown } from "lucide-react"

type DetailsDisclosureProps = {
  summary: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

export function DetailsDisclosure({
  summary,
  children,
  defaultOpen = false,
}: DetailsDisclosureProps) {
  return (
    <Collapsible.Root
      defaultOpen={defaultOpen}
      className="my-3 overflow-hidden rounded-xl border border-border/40 bg-background/80 shadow-sm backdrop-blur-sm"
    >
      <Collapsible.Trigger className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/40 transition-colors">
        <span className="flex-1">{summary}</span>
        <ChevronDown
          className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[panel-open]:rotate-180"
          aria-hidden
        />
      </Collapsible.Trigger>
      <Collapsible.Panel className="px-4 pb-4 pt-1">
        {children}
      </Collapsible.Panel>
    </Collapsible.Root>
  )
}
