// ============================================================
// 📚 types/index.ts — El "diccionario de tipos" del proyecto
// ============================================================
// ¿Por qué un archivo de tipos separado?
//
// Imagina que tienes 10 archivos que todos usan "Question".
// Sin este archivo: defines Question 10 veces (viola DRY).
// Con este archivo: defines Question UNA vez, importas en todos.
//
// Esto también demuestra:
// ✅ Interface vs Type (sabes cuándo usar cada uno)
// ✅ Union Types (difficulty, status, variant)
// ✅ Generic Types (ApiResponse<T>)
// ✅ Utility Types (Partial, Pick, Omit, Record)
// ✅ Readonly (inmutabilidad)
// ============================================================

// ============================================================
// 🗂️ DOMAIN ENTITIES
// Entidades del negocio — no saben nada de React, de la API,
// ni de la base de datos. Son TypeScript puro.
// ============================================================

/**
 * Difficulty levels — Union Type de strings literales.
 * ¿Por qué no enum? Los string literals son más ligeros en bundle
 * y más naturales al comparar con datos del JSON.
 */
export type Difficulty = "beginner" | "intermediate" | "advanced";

/**
 * Question types — Theory (conceptual) or Practical (code/output).
 */
export type QuestionType = "theory" | "practical";

/**
 * Quiz session status — State Machine states.
 */
export type SessionStatus = "idle" | "active" | "finished";

/**
 * Timer urgency — drives color changes in the UI.
 */
export type UrgencyLevel = "normal" | "warning" | "danger";

// ============================================================
// 📝 QUESTION — La entidad central de la app
// Usamos interface porque:
// → Es una forma de objeto (no union, no primitivo)
// → Podría extenderse: interface AdvancedQuestion extends Question
// ============================================================
export interface Question {
  readonly id: string; // readonly: no debe mutar después de cargar
  readonly categoryId: string;
  readonly difficulty: Difficulty;
  readonly type: QuestionType;
  readonly question: string;
  readonly options: readonly string[]; // readonly array: no .push()
  readonly correctAnswer: number; // Index into options array
  readonly explanation: string;
  readonly codeExample?: string; // Optional: not all questions have code
  readonly tags: readonly string[];
}

// ============================================================
// 📦 CATEGORY
// ============================================================
export interface Category {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly color: string;
  readonly description: string;
}

// ============================================================
// 📊 USER ANSWER — Lo que el usuario respondió
// ============================================================
export interface UserAnswer {
  readonly questionId: string;
  readonly selectedOption: number;
  readonly isCorrect: boolean;
  readonly timeSpent: number; // seconds
}

// ============================================================
// 🎮 QUIZ SESSION — El estado de una sesión activa
// ============================================================
export interface QuizSession {
  readonly categoryId: string | null;
  readonly questionIds: readonly string[];
  readonly answers: readonly UserAnswer[];
  readonly status: SessionStatus;
  readonly startTime: number | null; // Date.now() timestamp
}

// ============================================================
// 📈 CATEGORY PROGRESS — Progreso del usuario por categoría
// ============================================================
export interface CategoryProgress {
  readonly answered: number;
  readonly correct: number;
}

// ============================================================
// 📊 QUIZ STATS — Resultado calculado de una sesión
// ============================================================
export interface QuizStats {
  total: number;
  correct: number;
  wrong: number;
  accuracy: number; // 0-100
  avgTime: number; // seconds
}

// ============================================================
// 🏅 GRADE — Calificación con metadatos visuales
// ============================================================
export interface Grade {
  minScore: number;
  grade: string; // 'A+', 'A', 'B', 'C', 'D'
  label: string; // 'Outstanding!', 'Excellent!', ...
  emoji: string;
  color: string; // hex
}

// ============================================================
// 🌍 APP STATE — El estado global completo
// ============================================================
export interface AppState {
  currentSession: QuizSession;
  currentQuestionIndex: number;
  totalAnswered: number;
  totalCorrect: number;
  categoryProgress: Record<string, CategoryProgress>; // Record<K,V> Utility Type
  selectedDifficulty: Difficulty | "all";
  selectedType: QuestionType | "all";
}

// ============================================================
// 🎬 ACTIONS — Discriminated Union para el Reducer
// ============================================================
// Discriminated Union: TypeScript puede inferir el tipo del
// payload basándose en el valor de 'type'.
// Es más seguro que tener payload: any.
// ============================================================
export type AppAction =
  | {
      type: "START_QUIZ";
      payload: { categoryId: string; questionIds: string[] };
    }
  | { type: "ANSWER_QUESTION"; payload: UserAnswer }
  | { type: "NEXT_QUESTION" }
  | { type: "FINISH_QUIZ" }
  | { type: "RESET_QUIZ" }
  | { type: "SET_DIFFICULTY"; payload: Difficulty | "all" }
  | { type: "SET_TYPE"; payload: QuestionType | "all" };

// ============================================================
// 🎯 CONTEXT VALUE — Lo que el contexto expone
// Extends AppState: hereda todos los campos del estado,
// más los derivados y las actions.
// ============================================================
export interface AppContextValue extends AppState {
  // Derived state (computed, not stored)
  accuracy: number;
  sessionScore: number;
  isLastQuestion: boolean;

  // Actions (functions)
  startQuiz: (categoryId: string, questionIds: string[]) => void;
  answerQuestion: (
    questionId: string,
    selectedOption: number,
    isCorrect: boolean,
    timeSpent: number,
  ) => void;
  nextQuestion: () => void;
  finishQuiz: () => void;
  resetQuiz: () => void;
  setDifficulty: (difficulty: Difficulty | "all") => void;
  setType: (type: QuestionType | "all") => void;
}

// ============================================================
// 🔧 HOOK RETURN TYPES
// Tipar el return de los hooks es buena práctica:
// → El consumidor sabe exactamente qué recibe
// → TypeScript puede detectar usos incorrectos
// ============================================================
export interface UseQuizReturn {
  isQuizIdle: boolean;
  isQuizActive: boolean;
  isQuizFinished: boolean;
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  questionsAnswered: number;
  questionsTotal: number;
  progress: number; // 0-1
  selectedAnswer: number | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  sessionScore: number;
  availableQuestionsCount: number;
  handleStartQuiz: () => void;
  handleSelectAnswer: (index: number) => void;
  handleNextQuestion: () => void;
  startQuestionTimer: () => void;
}

export interface UseTimerReturn {
  seconds: number;
  percentage: number;
  formatted: string; // 'MM:SS'
  urgencyLevel: UrgencyLevel;
  isRunning: boolean;
  isComplete: boolean;
  start: () => void;
  pause: () => void;
  reset: (newSeconds?: number) => void;
  restart: () => void;
}

// ============================================================
// 🧭 NAVIGATION TYPES
// React Navigation necesita que tipemos los parámetros de cada ruta.
// ParamList: un Record donde la clave es el nombre de la ruta
// y el valor son los parámetros que recibe.
// ============================================================
export type RootStackParamList = {
  Home: undefined; // undefined = no params
  Quiz: {
    category: Category;
    difficulty?: Difficulty | "all";
    type?: QuestionType | "all";
    questionCount?: number;
  };
  Result: {
    category: Category;
  };
};

// ============================================================
// 🏭 COMPONENT PROPS — Tipado de props de componentes
// ============================================================
export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: object;
  textStyle?: object;
}

export interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export interface BadgeProps {
  label: string;
  variant?:
    | "default"
    | "primary"
    | "success"
    | "error"
    | "warning"
    | Difficulty;
  emoji?: string;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
}

export interface QuestionCardProps {
  question: Question;
  selectedAnswer: number | null;
  isAnswered: boolean;
  onSelectAnswer: (index: number) => void;
  onMount?: () => void;
}

export interface AnswerOptionProps {
  index: number;
  text: string;
  isSelected: boolean;
  isCorrect: boolean;
  isAnswered: boolean;
  onPress: () => void;
}

// ============================================================
// 🛠️ UTILITY TYPES — Demostrando conocimiento de TypeScript
// ============================================================

/**
 * Makes specific keys of T required.
 * Custom Utility Type: combinación de Required + Pick + Omit
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Makes all properties of T deeply readonly.
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Generic API response wrapper.
 * Generics en acción: misma estructura para cualquier tipo de dato.
 */
export interface ApiResponse<TData> {
  data: TData | null;
  error: string | null;
  loading: boolean;
}

// ============================================================
// 📦 JSON DATA SHAPE — La forma del questions.json
// ============================================================
export interface QuestionsData {
  categories: Category[];
  questions: Question[];
}
