// ============================================================
// 📚 utils/helpers.ts — Pure functions con TypeScript
// ============================================================
// TypeScript agrega aquí:
// → Generics en shuffleArray<T> — funciona con cualquier tipo
// → Return types explícitos — el lector sabe qué retorna
// → Overloads (opcional, cuando una función acepta varios tipos)
// ============================================================

import type { Grade, QuizStats, UserAnswer, Difficulty } from "../types";

// ============================================================
// 🔀 SHUFFLE ARRAY — Generic Function
// <T> significa: "este array puede ser de CUALQUIER tipo,
// y el retorno será del MISMO tipo que el input".
// shuffleArray([1,2,3]) → number[]
// shuffleArray(['a','b']) → string[]
// shuffleArray(questions) → Question[]
// ============================================================
export function shuffleArray<T>(array: readonly T[]): T[] {
  const shuffled = [...array]; // copia inmutable → copia mutable
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================================
// 🏅 GET GRADE
// Return type explícito: Grade (definida en types/index.ts)
// TypeScript verifica que el objeto retornado cumpla la interface.
// ============================================================
export function getGrade(percentage: number): Grade {
  if (percentage < 0 || percentage > 100) {
    throw new RangeError(`Invalid percentage: ${percentage}. Must be 0–100.`);
  }

  const grades: Grade[] = [
    {
      minScore: 90,
      grade: "A+",
      label: "Outstanding!",
      emoji: "🏆",
      color: "#FFD700",
    },
    {
      minScore: 80,
      grade: "A",
      label: "Excellent!",
      emoji: "⭐",
      color: "#22C55E",
    },
    {
      minScore: 70,
      grade: "B",
      label: "Great job!",
      emoji: "👍",
      color: "#3B82F6",
    },
    {
      minScore: 60,
      grade: "C",
      label: "Good effort",
      emoji: "📚",
      color: "#F59E0B",
    },
    {
      minScore: 0,
      grade: "D",
      label: "Keep trying!",
      emoji: "💪",
      color: "#EF4444",
    },
  ];

  // Non-null assertion (!) porque siempre habrá un grado para 0-100
  return grades.find((g) => percentage >= g.minScore)!;
}

// ============================================================
// ⏱️ FORMAT TIME
// ============================================================
export function formatTime(totalSeconds: number): string {
  if (totalSeconds < 0) return "0s";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

// ============================================================
// 🎨 DIFFICULTY HELPERS
// Record<Difficulty, string>: TypeScript obliga a tener
// una entrada para CADA valor posible de Difficulty.
// Si agregas 'expert' a Difficulty → error aquí hasta que
// también lo agregues al Record. Exhaustive checking!
// ============================================================
export function getDifficultyColor(difficulty: Difficulty): string {
  const map: Record<Difficulty, string> = {
    beginner: "#22C55E",
    intermediate: "#F59E0B",
    advanced: "#EF4444",
  };
  return map[difficulty];
}

export function getDifficultyLabel(difficulty: Difficulty): string {
  const labels: Record<Difficulty, string> = {
    beginner: "🟢 Beginner",
    intermediate: "🟡 Intermediate",
    advanced: "🔴 Advanced",
  };
  return labels[difficulty];
}

// ============================================================
// 📊 CALCULATE STATS
// Acepta readonly UserAnswer[] (no muta el array).
// Retorna QuizStats (interface definida en types).
// ============================================================
export function calculateStats(answers: readonly UserAnswer[]): QuizStats {
  if (!answers.length) {
    return { total: 0, correct: 0, wrong: 0, accuracy: 0, avgTime: 0 };
  }
  const total = answers.length;
  const correct = answers.filter((a) => a.isCorrect).length;
  return {
    total,
    correct,
    wrong: total - correct,
    accuracy: Math.round((correct / total) * 100),
    avgTime: Math.round(answers.reduce((s, a) => s + a.timeSpent, 0) / total),
  };
}

// ============================================================
// 🔡 TRUNCATE TEXT
// ============================================================
export function truncate(text: string, maxLength = 100): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}
