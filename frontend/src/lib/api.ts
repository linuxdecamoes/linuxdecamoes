const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

/* ── Users ─────────────────────────────────────────── */

export type User = {
  id: string;
  clerk_id: string;
  email: string;
  display_name: string | null;
};

export async function getUserByClerkId(clerkId: string): Promise<User> {
  return apiFetch<User>(`/api/users/${clerkId}`);
}

export async function createUser(data: {
  clerk_id: string;
  email: string;
  display_name?: string;
}): Promise<User> {
  return apiFetch<User>("/api/users/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* ── Quizzes ───────────────────────────────────────── */

export type Quiz = {
  id: string;
  topic_id: string;
  question: string;
  options: string;
  correct_answer: string;
  explanation: string | null;
};

export type QuizSubmitResult = {
  is_correct: boolean;
  next_review: string;
  interval_days: number;
};

export async function getQuizzesByTopic(
  topicId: string,
  limit = 10,
): Promise<Quiz[]> {
  return apiFetch<Quiz[]>(
    `/api/quizzes/topic/${topicId}?limit=${limit}`,
  );
}

export async function submitQuizAnswer(data: {
  clerk_id: string;
  quiz_id: string;
  answer: string;
}): Promise<QuizSubmitResult> {
  return apiFetch<QuizSubmitResult>("/api/quizzes/submit", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getDueQuizzes(
  userId: string,
  limit = 20,
): Promise<Quiz[]> {
  return apiFetch<Quiz[]>(`/api/quizzes/due/${userId}?limit=${limit}`);
}

export async function getQuizzesBySlug(
  manualCode: string,
  slug: string,
  limit = 10,
): Promise<Quiz[]> {
  return apiFetch<Quiz[]>(
    `/api/quizzes/by-slug/${manualCode}/${slug}?limit=${limit}`,
  );
}

export async function generateQuizzesForTopic(
  topicId: string,
): Promise<{ generated: number; quizzes: Quiz[] }> {
  return apiFetch(`/api/quizzes/generate/${topicId}`, {
    method: "POST",
  });
}

/* ── Chat / Search ──────────────────────────────────── */

export type ChunkResult = {
  score: number;
  file: string;
  manual: string;
  topico: string;
  secao: string;
  tipo: string;
  texto: string;
};

export type ChatResponse = {
  answer: string;
  sources: ChunkResult[];
};

export async function sendChatMessage(
  query: string,
  k = 5,
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ query, k }),
  });
}

/* ── Study ────────────────────────────────────────────── */

export type TopicProgress = {
  topic_id: string;
  topic_number: number;
  title: string;
  status: "not_started" | "in_progress" | "completed" | "locked";
  quiz_score: number | null;
  quiz_passed: boolean;
  completed_at: string | null;
};

export type ModuleProgress = {
  objective: string;
  title: string;
  topics: TopicProgress[];
};

export type ManualProgress = {
  manual_code: string;
  total_topics: number;
  completed_topics: number;
  modules: ModuleProgress[];
};

export type TopicSection = {
  secao: string;
  tipo: string;
  texto: string;
  manual: string;
  topico: string;
};

export type TopicContent = {
  topic_id: string;
  title: string;
  objective: string;
  summary: string;
  sections: TopicSection[];
};

export type CompletionResult = {
  topic_id: string;
  quiz_score: number;
  quiz_passed: boolean;
  completed_at: string;
  next_topic_unlocked: boolean;
  next_topic_id: string | null;
};

export type ManualSummary = {
  code: string;
  title: string;
  total_topics: number;
  completed_topics: number;
  modules_completed: number;
  modules_total: number;
};

export type GlobalProgress = {
  manuals: ManualSummary[];
  total_topics_completed: number;
  total_topics: number;
  streak_consecutive_days: number;
  due_quiz_count: number;
  total_quizzes_taken: number;
  total_quizzes_correct: number;
};

export async function getManualProgress(
  code: string,
  clerkId: string,
): Promise<ManualProgress> {
  return apiFetch<ManualProgress>(
    `/api/study/manuals/${code}/progress?clerk_id=${clerkId}`,
  );
}

export async function getTopicContent(
  topicId: string,
): Promise<TopicContent> {
  return apiFetch<TopicContent>(`/api/study/topics/${topicId}/content`);
}

export async function completeTopic(
  topicId: string,
  clerkId: string,
  quizScore: number,
): Promise<CompletionResult> {
  return apiFetch<CompletionResult>(
    `/api/study/topics/${topicId}/complete?clerk_id=${clerkId}`,
    {
      method: "POST",
      body: JSON.stringify({ quiz_score: quizScore }),
    },
  );
}

export async function getUserGlobalProgress(
  clerkId: string,
): Promise<GlobalProgress> {
  return apiFetch<GlobalProgress>(
    `/api/study/users/${clerkId}/progress`,
  );
}