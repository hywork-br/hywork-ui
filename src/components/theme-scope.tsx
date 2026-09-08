import * as React from "react";
import { defaultScopedTheme, resolveScopedThemeUpdate, type ScopedThemeCandidate } from "../lib/scoped-theme";

type ScopeState = ReturnType<typeof resolveScopedThemeUpdate>;
const ThemeContext = React.createContext<ScopeState | null>(null);
// Opposite valid foreground/background pairs can cross through unreadable
// intermediate colors. Scoped colors switch atomically; structural motion stays.
const colorMotion = { "--hw-duration-color": "var(--hw-duration-none)" } as React.CSSProperties;

/** Read-only validation and applied state for a local theme editor or portal.
 * Outside a scope, components retain their existing CSS/default behavior.
 */
export function useThemeScope() {
  return React.useContext(ThemeContext);
}

/** Apply the logical parent's validated variables directly to a body portal.
 * Layout styles remain compatible; DS token overrides must go through theme validation.
 */
export function useScopedPortalStyle(style?: React.CSSProperties): React.CSSProperties | undefined {
  const scope = useThemeScope();
  if (!scope) return style;
  if (style && Object.keys(style).some((key) => key.startsWith("--hw-"))) {
    throw new Error("Scoped portal style cannot override design-system tokens; use a validated theme.");
  }
  return { ...style, ...scope.tokens, ...colorMotion };
}

export interface ThemeScopeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  theme?: ScopedThemeCandidate;
}

export const ThemeScope = React.forwardRef<HTMLDivElement, ThemeScopeProps>(function ThemeScope(
  { theme = defaultScopedTheme, children, ...props }, ref,
) {
  if ("style" in props && props.style !== undefined) {
    throw new Error("ThemeScope does not accept inline style overrides; use a validated theme.");
  }
  const key = JSON.stringify(theme);
  const [snapshot, setSnapshot] = React.useState(() => ({ key, state: resolveScopedThemeUpdate(theme) }));
  let state = snapshot.state;
  if (snapshot.key !== key) {
    // Adjust this component's state before React commits children. An effect
    // would briefly paint an obsolete theme and update open portals too late.
    state = resolveScopedThemeUpdate(theme, snapshot.state.applied);
    setSnapshot({ key, state });
  }
  return <ThemeContext.Provider value={state}>
    <div {...props} ref={ref} style={{ ...state.tokens, ...colorMotion, backgroundColor: state.applied.background, color: state.applied.text }}>
      {children}
    </div>
  </ThemeContext.Provider>;
});
