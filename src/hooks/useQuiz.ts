// ============================================================
// 📚 hooks/useQuiz.ts — Custom Hook con TypeScript
// ============================================================
// TypeScript agrega:
// → Parámetros tipados: categoryId: string
// → Options con interface
// → Return type: UseQuizReturn (definido en types)
// ============================================================

import { useState, useCallback, useMemo } from "react";
import { useApp } from "../context/AppContext";
import questionsData from "../data/questions.json";
import { shuffleArray } from "../utils/helpers";
import type {
  Question,
  Difficulty,
  QuestionType,
  UseQuizReturn,
} from "../types";

// ============================================================
// Interface para las opciones del hook
// ============================================================
interface UseQuizOptions {
  questionCount?: number;
  difficulty?: Difficulty | "all";
  type?: QuestionType | "all";
}

export function useQuiz(
  categoryId: string,
  options: UseQuizOptions = {},
): UseQuizReturn {
  const { questionCount = 10, difficulty = "all", type = "all" } = options;

  const {
    currentSession,
    currentQuestionIndex,
    startQuiz,
    answerQuestion,
    nextQuestion,
    finishQuiz,
    isLastQuestion,
    sessionScore,
  } = useApp();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [answerTime, setAnswerTime] = useState<number | null>(null);

  // useMemo con tipos inferidos — availableQuestions: Question[]
  const availableQuestions = useMemo((): Question[] => {
    // Type assertion: TypeScript no puede inferir el tipo del JSON import
    let filtered = questionsData.questions as Question[];

    if (categoryId !== "all") {
      filtered = filtered.filter((q) => q.categoryId === categoryId);
    }
    if (difficulty !== "all") {
      filtered = filtered.filter((q) => q.difficulty === difficulty);
    }
    if (type !== "all") {
      filtered = filtered.filter((q) => q.type === type);
    }
    return filtered;
  }, [categoryId, difficulty, type]);

  const currentQuestion = useMemo((): Question | null => {
    if (!currentSession.questionIds.length) return null;
    const id = currentSession.questionIds[currentQuestionIndex];
    return (
      (questionsData.questions as Question[]).find((q) => q.id === id) ?? null
    );
  }, [currentSession.questionIds, currentQuestionIndex]);

  const handleStartQuiz = useCallback((): void => {
    if (!availableQuestions.length) return;
    const ids = shuffleArray(availableQuestions)
      .slice(0, Math.min(questionCount, availableQuestions.length))
      .map((q) => q.id);
    startQuiz(categoryId, ids);
  }, [availableQuestions, questionCount, categoryId, startQuiz]);

  const handleSelectAnswer = useCallback(
    (optionIndex: number): void => {
      if (isAnswered || !currentQuestion) return;
      const isCorrect = optionIndex === currentQuestion.correctAnswer;
      const timeSpent = answerTime
        ? Math.round((Date.now() - answerTime) / 1000)
        : 0;
      setSelectedAnswer(optionIndex);
      setIsAnswered(true);
      answerQuestion(currentQuestion.id, optionIndex, isCorrect, timeSpent);
    },
    [isAnswered, currentQuestion, answerTime, answerQuestion],
  );

  const handleNextQuestion = useCallback((): void => {
    if (isLastQuestion) {
      finishQuiz();
    } else {
      nextQuestion();
      setSelectedAnswer(null);
      setIsAnswered(false);
      setAnswerTime(Date.now());
    }
  }, [isLastQuestion, finishQuiz, nextQuestion]);

  const startQuestionTimer = useCallback((): void => {
    setAnswerTime(Date.now());
  }, []);

  // Derived: isCorrect es boolean | null (null = not answered yet)
  const isCorrect: boolean | null =
    selectedAnswer !== null
      ? selectedAnswer === currentQuestion?.correctAnswer
      : null;

  return {
    isQuizIdle: currentSession.status === "idle",
    isQuizActive: currentSession.status === "active",
    isQuizFinished: currentSession.status === "finished",
    currentQuestion,
    currentQuestionIndex,
    questionsAnswered: currentSession.answers.length,
    questionsTotal: currentSession.questionIds.length,
    progress:
      currentSession.questionIds.length > 0
        ? (currentQuestionIndex + 1) / currentSession.questionIds.length
        : 0,
    selectedAnswer,
    isAnswered,
    isCorrect,
    sessionScore,
    availableQuestionsCount: availableQuestions.length,
    handleStartQuiz,
    handleSelectAnswer,
    handleNextQuestion,
    startQuestionTimer,
  };
}
