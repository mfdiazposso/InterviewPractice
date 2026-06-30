// ============================================================
// 📚 context/AppContext.tsx — Context API con TypeScript real
// ============================================================
// TypeScript agrega aquí:
// → AppAction: Discriminated Union (el reducer es type-safe)
// → AppContextValue: interface del valor del contexto
// → createContext<AppContextValue | null>(null): tipo explícito
// → El reducer es (state: AppState, action: AppAction): AppState
//   TypeScript verifica CADA case del switch
// ============================================================

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  type ReactNode, // 'type' import: solo se usa en compilación
} from "react";

import type {
  AppState,
  AppAction,
  AppContextValue,
  QuizSession,
  Difficulty,
  QuestionType,
  UserAnswer,
} from "../types";

// ============================================================
// 🏗️ INITIAL STATE
// ============================================================
const initialSession: QuizSession = {
  categoryId: null,
  questionIds: [],
  answers: [],
  status: "idle",
  startTime: null,
};

const initialState: AppState = {
  currentSession: initialSession,
  currentQuestionIndex: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  categoryProgress: {},
  selectedDifficulty: "all",
  selectedType: "all",
};

// ============================================================
// ⚙️ REDUCER — Type-safe gracias a Discriminated Union
// TypeScript sabe el tipo de action.payload en cada case
// porque cada acción tiene un 'type' único.
// ============================================================
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "START_QUIZ":
      return {
        ...state,
        currentSession: {
          categoryId: action.payload.categoryId,
          questionIds: action.payload.questionIds,
          answers: [],
          status: "active",
          startTime: Date.now(),
        },
        currentQuestionIndex: 0,
      };

    case "ANSWER_QUESTION": {
      // TypeScript sabe que action.payload es UserAnswer aquí
      const answer: UserAnswer = action.payload;
      const catId = state.currentSession.categoryId ?? "";
      const prev = state.categoryProgress[catId] ?? { answered: 0, correct: 0 };

      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          answers: [...state.currentSession.answers, answer],
        },
        totalAnswered: state.totalAnswered + 1,
        totalCorrect: answer.isCorrect
          ? state.totalCorrect + 1
          : state.totalCorrect,
        categoryProgress: {
          ...state.categoryProgress,
          [catId]: {
            answered: prev.answered + 1,
            correct: answer.isCorrect ? prev.correct + 1 : prev.correct,
          },
        },
      };
    }

    case "NEXT_QUESTION":
      return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 };

    case "FINISH_QUIZ":
      return {
        ...state,
        currentSession: { ...state.currentSession, status: "finished" },
      };

    case "RESET_QUIZ":
      return {
        ...state,
        currentSession: initialSession,
        currentQuestionIndex: 0,
      };

    case "SET_DIFFICULTY":
      return { ...state, selectedDifficulty: action.payload };

    case "SET_TYPE":
      return { ...state, selectedType: action.payload };

    // TypeScript detecta si falta un case (exhaustive checking)
    default:
      return state;
  }
}

// ============================================================
// 🏭 CONTEXT
// createContext<AppContextValue | null>(null):
// → null: valor por defecto (cuando se usa fuera del Provider)
// → AppContextValue: el tipo que tendrá cuando esté dentro
// ============================================================
const AppContext = createContext<AppContextValue | null>(null);

// ============================================================
// 🎁 PROVIDER
// ============================================================
interface AppProviderProps {
  children: ReactNode; // ReactNode: cualquier cosa que React pueda renderizar
}

export function AppProvider({ children }: AppProviderProps): React.JSX.Element {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Actions — useCallback con tipos inferidos automáticamente
  const startQuiz = useCallback(
    (categoryId: string, questionIds: string[]): void => {
      dispatch({ type: "START_QUIZ", payload: { categoryId, questionIds } });
    },
    [],
  );

  const answerQuestion = useCallback(
    (
      questionId: string,
      selectedOption: number,
      isCorrect: boolean,
      timeSpent: number,
    ): void => {
      dispatch({
        type: "ANSWER_QUESTION",
        payload: { questionId, selectedOption, isCorrect, timeSpent },
      });
    },
    [],
  );

  const nextQuestion = useCallback((): void => {
    dispatch({ type: "NEXT_QUESTION" });
  }, []);

  const finishQuiz = useCallback((): void => {
    dispatch({ type: "FINISH_QUIZ" });
  }, []);

  const resetQuiz = useCallback((): void => {
    dispatch({ type: "RESET_QUIZ" });
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty | "all"): void => {
    dispatch({ type: "SET_DIFFICULTY", payload: difficulty });
  }, []);

  const setType = useCallback((type: QuestionType | "all"): void => {
    dispatch({ type: "SET_TYPE", payload: type });
  }, []);

  // useMemo: el objeto value satisface AppContextValue
  // TypeScript verifica que tenga TODOS los campos requeridos
  const value = useMemo(
    (): AppContextValue => ({
      ...state,
      // Derived state
      accuracy:
        state.totalAnswered > 0
          ? Math.round((state.totalCorrect / state.totalAnswered) * 100)
          : 0,
      sessionScore:
        state.currentSession.answers.length > 0
          ? Math.round(
              (state.currentSession.answers.filter((a) => a.isCorrect).length /
                state.currentSession.answers.length) *
                100,
            )
          : 0,
      isLastQuestion:
        state.currentQuestionIndex ===
        state.currentSession.questionIds.length - 1,
      // Actions
      startQuiz,
      answerQuestion,
      nextQuestion,
      finishQuiz,
      resetQuiz,
      setDifficulty,
      setType,
    }),
    [
      state,
      startQuiz,
      answerQuestion,
      nextQuestion,
      finishQuiz,
      resetQuiz,
      setDifficulty,
      setType,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================================
// 🪝 CUSTOM HOOK con tipo de retorno explícito
// ============================================================
export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  // Type narrowing: si es null, lanza error (fail fast)
  if (context === null) {
    throw new Error("useApp() must be used within <AppProvider>");
  }
  return context; // TypeScript sabe que ya es AppContextValue (no null)
}

export default AppContext;
