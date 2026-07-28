"use client"

import * as React from "react"
import { Accordion } from "@base-ui/react/accordion"
import { ChevronDown } from "lucide-react"
import { accentClasses, type Manual, type ManualTopic } from "@/lib/manuals"
import { TopicRow } from "./topic-row"

type TopicAccordionProps = {
  manual: Manual
}

function topicGroup(topic: ManualTopic): string {
  if (topic.objective) return topic.objective
  const match = /^(\d{3})/.exec(topic.slug)
  return match ? match[1] : "outros"
}

function groupTitle(group: string, topics: ManualTopic[], objectiveTitles?: Record<string, string>): string {
  if (objectiveTitles?.[group]) return `${group} · ${objectiveTitles[group]}`
  const first = topics[0]
  const match = /^(\d{3}\.\d+)/.exec(first.title)
  if (match) return `${group} · ${first.title.replace(match[1], "").trim() || first.title}`
  return `Tópico ${group}`
}

export function TopicAccordion({ manual }: TopicAccordionProps) {
  const accent = accentClasses[manual.accent]

  const grouped = React.useMemo(() => {
    const map = new Map<string, ManualTopic[]>()
    for (const topic of manual.topics) {
      const group = topicGroup(topic)
      const list = map.get(group) ?? []
      list.push(topic)
      map.set(group, list)
    }
    return Array.from(map.entries())
  }, [manual.topics])

  // Sempre abrir o primeiro grupo (defaultOpenTopic foi removido: o `value`
  // do Accordion.Item é o código de grupo de 3 dígitos, nunca o slug do
  // tópico, pelo que a prop antiga nunca fazia match).
  const defaultValue = grouped[0] ? [topicGroup(grouped[0][1][0])] : []

  return (
    <Accordion.Root multiple defaultValue={defaultValue} className="space-y-3">
      {grouped.map(([group, topics]) => {
        const globalStartIndex = manual.topics.indexOf(topics[0])
        return (
          <Accordion.Item
            key={group}
            value={group}
            className="glass-card overflow-hidden rounded-2xl"
          >
            <Accordion.Header>
              <Accordion.Trigger className="group flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-semibold text-foreground hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-7 items-center rounded-md px-2 text-xs font-bold ${accent.badge}`}
                  >
                    {group}
                  </span>
                  <span>{groupTitle(group, topics, manual.objectiveTitles)}</span>
                </span>
                <ChevronDown
                  className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[panel-open]:rotate-180"
                  aria-hidden
                />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel className="px-2 pb-2">
              <ul className="space-y-0.5">
                {topics.map((topic, i) => (
                  <li key={topic.slug}>
                    <TopicRow
                      topic={topic}
                      index={globalStartIndex + i}
                      manualCode={manual.code}
                      accent={manual.accent}
                    />
                  </li>
                ))}
              </ul>
            </Accordion.Panel>
          </Accordion.Item>
        )
      })}
    </Accordion.Root>
  )
}
