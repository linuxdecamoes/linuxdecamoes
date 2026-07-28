"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ModuleProgress } from "@/lib/api";
import { accentClasses, type Accent } from "@/lib/manuals";

type StudyRoadmapProps = {
  modules: ModuleProgress[];
  manualCode: string;
  accent: Accent;
};

export function StudyRoadmap({ modules, manualCode, accent }: StudyRoadmapProps) {
  const pathname = usePathname();
  const classes = accentClasses[accent];

  return (
    <nav className="space-y-6">
      {modules.map((mod) => (
        <div key={mod.objective}>
          <h3 className={`text-sm font-bold mb-2 ${classes.strong}`}>
            {mod.objective} — {mod.title}
          </h3>
          <ul className="space-y-1">
            {mod.topics.map((t) => {
              const isActive = pathname.includes(t.topic_id);
              const icon = t.status === "completed" ? "✅"
                : t.status === "locked" ? "🔒"
                : t.status === "in_progress" ? "🔵"
                : "⚪";

              const isClickable = t.status !== "locked";

              return (
                <li key={t.topic_id}>
                  {isClickable ? (
                    <Link
                      href={`/dashboard/study/${manualCode}/${t.topic_id}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                        isActive
                          ? `${classes.soft} ${classes.strong} font-semibold`
                          : "hover:bg-muted"
                      }`}
                    >
                      <span>{icon}</span>
                      <span className="truncate">{t.title}</span>
                      {t.quiz_passed && t.quiz_score !== null && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {Math.round(t.quiz_score)}%
                        </span>
                      )}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground opacity-50 cursor-not-allowed">
                      <span>{icon}</span>
                      <span className="truncate">{t.title}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
