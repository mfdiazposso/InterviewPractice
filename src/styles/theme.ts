// ============================================================
// 📚 styles/theme.ts — Design System con TypeScript
// ============================================================
// ¿Qué agrega TypeScript aquí?
// → typeof darkTheme: infiere el tipo exacto del objeto
// → Exportamos los tipos → autocompletado en TODOS los archivos
// → Si escribes theme.colors.TYPO → error en compilación
// ============================================================

const palette = {
  white: "#FFFFFF",
  black: "#000000",
  blue400: "#60A5FA",
  blue500: "#3B82F6",
  blue600: "#2563EB",
  blue700: "#1D4ED8",
  green400: "#4ADE80",
  green500: "#22C55E",
  green600: "#16A34A",
  red400: "#FB7185",
  red500: "#EF4444",
  red600: "#DC2626",
  amber400: "#FBBF24",
  amber500: "#F59E0B",
  purple400: "#C084FC",
  purple500: "#A855F7",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",
} as const; // 'as const' → todas las propiedades son readonly literals

export const darkTheme = {
  colors: {
    background: "#0A0E1A",
    surface: "#111827",
    surfaceElevated: "#1A2332",
    surfaceMuted: "#1F2937",
    border: "#1F2937",
    borderLight: "#374151",
    textPrimary: "#F9FAFB",
    textSecondary: "#9CA3AF",
    textMuted: "#6B7280",
    primary: palette.blue500,
    primaryLight: palette.blue400,
    primaryDark: palette.blue700,
    success: palette.green500,
    successBackground: "rgba(34, 197, 94, 0.1)",
    error: palette.red500,
    errorBackground: "rgba(239, 68, 68, 0.1)",
    warning: palette.amber500,
    warningBackground: "rgba(245, 158, 11, 0.1)",
    white: palette.white,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  typography: {
    fontSize: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 17,
      xl: 20,
      xxl: 24,
      xxxl: 30,
      display: 38,
    },
    fontWeight: {
      regular: "400" as const,
      medium: "500" as const,
      semibold: "600" as const,
      bold: "700" as const,
      extrabold: "800" as const,
    },
    lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.75 },
  },
  borderRadius: { sm: 6, md: 10, lg: 14, xl: 20, full: 9999 },
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 10,
    },
  },
} as const;

// ============================================================
// 🎯 EXPORTED TYPES — inferidos del objeto real
// typeof: TypeScript infiere el tipo exacto desde el valor.
// No duplicas la definición — el tipo ES el objeto.
// ============================================================
export type Theme = typeof darkTheme;
export type ThemeColors = typeof darkTheme.colors;
export type ThemeSpacing = typeof darkTheme.spacing;

export default darkTheme;
