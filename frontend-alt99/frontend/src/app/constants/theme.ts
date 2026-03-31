/**
 * Design System Theme
 * 
 * Centralized design tokens for consistent styling across the application.
 * Use these tokens in components for maintainability and theming support.
 * 
 * @example
 * ```typescript
 * // In component styles
 * background: theme.colors.background.primary;
 * color: theme.colors.text.primary;
 * border-radius: theme.radius.md;
 * ```
 */

export const theme = {
  // Color Palette
  colors: {
    // Background colors
    background: {
      primary: '#0f172a',      // Main background
      secondary: '#1e293b',    // Secondary surfaces
      tertiary: 'rgba(30, 41, 59, 0.5)',  // Cards, panels
      overlay: 'rgba(0, 0, 0, 0.7)',      // Modals, overlays
    },
    
    // Text colors
    text: {
      primary: '#ffffff',
      secondary: '#e2e8f0',
      tertiary: '#94a3b8',
      muted: '#64748b',
    },
    
    // Border colors
    border: {
      default: 'rgba(148, 163, 184, 0.1)',
      subtle: 'rgba(148, 163, 184, 0.15)',
      strong: 'rgba(148, 163, 184, 0.3)',
    },
    
    // Semantic colors
    semantic: {
      primary: {
        light: 'rgba(59, 130, 246, 0.2)',
        DEFAULT: '#3b82f6',
        dark: '#2563eb',
        gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
      },
      success: {
        light: 'rgba(16, 185, 129, 0.2)',
        DEFAULT: '#10b981',
        dark: '#059669',
      },
      warning: {
        light: 'rgba(245, 158, 11, 0.2)',
        DEFAULT: '#f59e0b',
        dark: '#d97706',
      },
      danger: {
        light: 'rgba(239, 68, 68, 0.2)',
        DEFAULT: '#ef4444',
        dark: '#dc2626',
      },
      info: {
        light: 'rgba(6, 182, 212, 0.2)',
        DEFAULT: '#06b6d4',
        dark: '#0891b2',
      },
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"Fira Code", "JetBrains Mono", monospace',
    },
    fontSize: {
      xs: '11px',
      sm: '12px',
      base: '14px',
      lg: '16px',
      xl: '18px',
      '2xl': '20px',
      '3xl': '24px',
      '4xl': '28px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    },
  },
  
  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
  },
  
  // Border Radius
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 15px rgba(0, 0, 0, 0.2)',
    xl: '0 12px 25px rgba(0, 0, 0, 0.25)',
    '2xl': '0 20px 40px rgba(0, 0, 0, 0.3)',
    glow: {
      primary: '0 0 20px rgba(6, 182, 212, 0.4)',
      success: '0 0 20px rgba(16, 185, 129, 0.4)',
      danger: '0 0 20px rgba(239, 68, 68, 0.4)',
    },
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-Index Scale
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    overlay: 300,
    modal: 400,
    toast: 500,
    tooltip: 600,
  },
} as const;

/**
 * CSS Custom Properties Generator
 * Use this to generate CSS variables from the theme
 */
export function generateCssVariables(): string {
  return `
    :root {
      /* Background Colors */
      --color-bg-primary: ${theme.colors.background.primary};
      --color-bg-secondary: ${theme.colors.background.secondary};
      --color-bg-tertiary: ${theme.colors.background.tertiary};
      --color-bg-overlay: ${theme.colors.background.overlay};
      
      /* Text Colors */
      --color-text-primary: ${theme.colors.text.primary};
      --color-text-secondary: ${theme.colors.text.secondary};
      --color-text-tertiary: ${theme.colors.text.tertiary};
      --color-text-muted: ${theme.colors.text.muted};
      
      /* Border Colors */
      --color-border-default: ${theme.colors.border.default};
      --color-border-subtle: ${theme.colors.border.subtle};
      --color-border-strong: ${theme.colors.border.strong};
      
      /* Semantic Colors */
      --color-primary: ${theme.colors.semantic.primary.DEFAULT};
      --color-primary-light: ${theme.colors.semantic.primary.light};
      --color-primary-gradient: ${theme.colors.semantic.primary.gradient};
      --color-success: ${theme.colors.semantic.success.DEFAULT};
      --color-success-light: ${theme.colors.semantic.success.light};
      --color-warning: ${theme.colors.semantic.warning.DEFAULT};
      --color-warning-light: ${theme.colors.semantic.warning.light};
      --color-danger: ${theme.colors.semantic.danger.DEFAULT};
      --color-danger-light: ${theme.colors.semantic.danger.light};
      --color-info: ${theme.colors.semantic.info.DEFAULT};
      --color-info-light: ${theme.colors.semantic.info.light};
      
      /* Typography */
      --font-family-sans: ${theme.typography.fontFamily.sans};
      --font-family-mono: ${theme.typography.fontFamily.mono};
      
      /* Spacing */
      --spacing-xs: ${theme.spacing.xs};
      --spacing-sm: ${theme.spacing.sm};
      --spacing-md: ${theme.spacing.md};
      --spacing-lg: ${theme.spacing.lg};
      --spacing-xl: ${theme.spacing.xl};
      --spacing-2xl: ${theme.spacing['2xl']};
      
      /* Border Radius */
      --radius-sm: ${theme.radius.sm};
      --radius-md: ${theme.radius.md};
      --radius-lg: ${theme.radius.lg};
      --radius-xl: ${theme.radius.xl};
      --radius-2xl: ${theme.radius['2xl']};
      
      /* Shadows */
      --shadow-sm: ${theme.shadows.sm};
      --shadow-md: ${theme.shadows.md};
      --shadow-lg: ${theme.shadows.lg};
      --shadow-xl: ${theme.shadows.xl};
      --shadow-2xl: ${theme.shadows['2xl']};
      
      /* Transitions */
      --transition-fast: ${theme.transitions.fast};
      --transition-normal: ${theme.transitions.normal};
      --transition-slow: ${theme.transitions.slow};
    }
  `;
}

/**
 * Utility function to get nested theme values
 * @param path - Dot-separated path to theme value
 * @example getThemeValue('colors.background.primary')
 */
export function getThemeValue<T>(path: string): T | undefined {
  return path.split('.').reduce((obj, key) => {
    if (obj && typeof obj === 'object' && key in obj) {
      return (obj as Record<string, unknown>)[key];
    }
    return undefined;
  }, theme as unknown) as T;
}

// Export commonly used values directly for convenience
export const {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
} = theme;
