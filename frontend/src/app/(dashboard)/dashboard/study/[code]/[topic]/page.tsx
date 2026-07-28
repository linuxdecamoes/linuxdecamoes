"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  getTopicContent,
  getQuizzesByTopic,
  completeTopic,
  type TopicContent as TopicContentType,
  type Quiz,
} from "@/lib/api";
import { TopicContent } from "@/components/study/topic-content";
import { TopicQuiz } from "@/components/study/topic-quiz";

export default function TopicStudyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const topicId = params.topic as string;
  const code = params.code as string;

  const [content, setContent] = useState<TopicContentType | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    if (!topicId) return;
    let cancelled = false;
    Promise.all([
      getTopicContent(topicId).catch(() => null),
      getQuizzesByTopic(topicId, 5).catch(() => []),
    ]).then(([c, q]) => {
      if (!cancelled) {
        setContent(c);
        setQuizzes(q);
        setLoaded(true);
      }
    });
    return () => { cancelled = true; };
  }, [topicId]);

  const handlePass = async (score: number) => {
    if (!user?.id) return;
    try {
      await completeTopic(topicId, user.id, score);
    } catch {
      // Silently fail — progress may already be saved
    }
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">A carregar conteúdo...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1560px] px-4 md:px-8 xl:px-12 py-8">
      <div className="mb-4">
        <button
          onClick={() => router.push(`/dashboard/study/${code}`)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Voltar ao percurso
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main content */}
        <main className="lg:col-span-8">
          {content ? (
            <TopicContent content={content} />
          ) : (
            <div className="bg-cream rounded-2xl shadow-bento p-8 text-center">
              <p className="text-muted-foreground">Sem conteúdo disponível.</p>
            </div>
          )}
        </main>

        {/* Sidebar — Quiz */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24">
            {!showQuiz ? (
              <button
                onClick={() => setShowQuiz(true)}
                className="w-full px-6 py-3 rounded-xl bg-cta text-cta-foreground font-semibold text-sm"
              >
                Iniciar Quiz ({quizzes.length} perguntas)
              </button>
            ) : (
              <TopicQuiz
                quizzes={quizzes}
                userId={user?.id ?? ""}
                onPass={handlePass}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
