import { useId, useState } from "react";
import { Button, Field, Label, Input, InlineNotice, Select, ThemeScope, defaultScopedTheme, resolveScopedThemeUpdate, parseOpaqueCssColor, type ScopedThemeCandidate, type TenantThemeCandidate } from "../../src";
import colors from "../../tokens/resolved-colors.json";
import "../../tokens/theme-lab.css";

const samples = [
  { id: "strong", label: "Acento forte aprovado", theme: { ...defaultScopedTheme, primary: colors["--hw-rust-text"], primaryHover: colors["--hw-rust-strong"] } },
  { id: "light", label: "Acento claro aprovado", theme: { ...defaultScopedTheme, primary: colors["--hw-amber-tint"], primaryHover: colors["--hw-peach"], primaryForeground: colors["--hw-navy"] } },
  { id: "dark", label: "Acento escuro aprovado", theme: { ...defaultScopedTheme, primary: colors["--hw-navy"] } },
  { id: "rejected", label: "Combinação intencionalmente rejeitada", theme: { ...defaultScopedTheme, primary: colors["--hw-white"] } },
];

/** Explicit compatibility for existing callers of the numerical utility.
 * Required component adjacency checks never come from the caller's list.
 */
function initialCandidate(theme?: TenantThemeCandidate | ScopedThemeCandidate): ScopedThemeCandidate {
  if (!theme) return samples[0].theme;
  if (!("focusAdjacentSurfaces" in theme)) return theme;
  return { ...defaultScopedTheme, primary: theme.primary, primaryHover: theme.primary,
    primaryForeground: theme.primaryForeground, background: theme.background,
    surface: theme.background, text: theme.text, focus: theme.focus };
}

function pickerValue(color: string) {
  const parsed = parseOpaqueCssColor(color);
  if (!parsed.ok) return defaultScopedTheme.primary;
  return "#" + [parsed.value.red, parsed.value.green, parsed.value.blue].map((channel) => channel.toString(16).padStart(2, "0")).join("");
}

function PreviewControls({ primary = false, title, themeKey = "fixed" }: { primary?: boolean; title: string; themeKey?: string }) {
  const id = useId();
  const [confirmedTheme, setConfirmedTheme] = useState<string>();
  const confirmed = confirmedTheme === themeKey;
  const [audience, setAudience] = useState("all");
  return <section className="theme-lab__preview" aria-labelledby={id + "-title"}>
    <h2 id={id + "-title"}>{title}</h2>
    <Field><Label htmlFor={id + "-name"}>Comunicado</Label><Input id={id + "-name"} value="Comunicação para todas as unidades" readOnly /></Field>
    <Field><Label htmlFor={id + "-audience"}>Público</Label><Select id={id + "-audience"} ariaLabel={"Público · " + title} value={audience} onValueChange={setAudience} options={[{ value: "all", label: "Todas as unidades" }, { value: "selected", label: "Unidades selecionadas" }]} /></Field>
    <Button aria-pressed={confirmed} className="theme-lab__primary-action" onClick={() => setConfirmedTheme(confirmed ? undefined : themeKey)}>
      {primary ? "Continuar para revisar todas as unidades selecionadas" : "Confirmar exemplo · " + title}
    </Button>
    {confirmed ? <p role="status">{primary ? "Prévia confirmada localmente." : "Exemplo confirmado · " + title}</p> : null}
  </section>;
}

export function ThemeLab({ initialTheme }: { initialTheme?: TenantThemeCandidate | ScopedThemeCandidate }) {
  const id = useId();
  const [state, setState] = useState(() => ({ ...resolveScopedThemeUpdate(initialCandidate(initialTheme)), revision: 0 }));
  const [draftPrimary, setDraftPrimary] = useState(() => initialCandidate(initialTheme).primary);
  const [edited, setEdited] = useState(false);
  const invalid = !state.validation.valid;
  const primaryCheck = state.validation.checks.find((check) => check.foreground === "primaryForeground" && check.background === "primary");
  const failures = state.validation.failures.map((failure) => failure.field === "primaryForeground/primary"
    ? "Texto do botão sobre cor primária: contraste mínimo de 4,5:1 não atendido."
    : failure.message.replaceAll("4.5:1", "4,5:1"));

  function inspect(theme: ScopedThemeCandidate) {
    setEdited(true);
    setDraftPrimary(theme.primary);
    setState((current) => {
      const next = resolveScopedThemeUpdate(theme, current.applied);
      const changed = JSON.stringify(next.applied) !== JSON.stringify(current.applied);
      return { ...next, revision: current.revision + (changed ? 1 : 0) };
    });
  }

  return <main className="theme-lab">
    <header className="theme-lab__header">
      <p className="theme-lab__eyebrow">Protótipo de laboratório</p>
      <h1>Um sistema, diferentes identidades</h1>
      <p>Compare temas nos componentes reais. Nenhuma configuração é salva ou enviada.</p>
    </header>
    <section className="theme-lab__editor" aria-labelledby={id + "-editor"}>
      <div><h2 id={id + "-editor"}>Cores do workspace</h2><p>A prévia mantém o último tema válido. O padrão e o segundo workspace ficam independentes.</p></div>
      <Field><Label htmlFor={id + "-primary"}>Cor primária do tenant</Label><Input id={id + "-primary"} aria-describedby={invalid ? id + "-feedback" : undefined} aria-invalid={invalid} onChange={(event) => inspect({ ...state.applied, primary: event.target.value })} spellCheck={false} value={draftPrimary} /></Field>
      <Field className="theme-lab__picker"><Label htmlFor={id + "-picker"}>Seletor nativo da cor primária</Label><Input id={id + "-picker"} aria-describedby={invalid ? id + "-feedback" : undefined} aria-invalid={invalid} onChange={(event) => inspect({ ...state.applied, primary: event.target.value })} type="color" value={pickerValue(state.applied.primary)} /></Field>
      {invalid ? <div className="theme-lab__result" id={id + "-feedback"}><InlineNotice announcement="assertive" severity="error" title="Rejeitada — a prévia segura foi preservada." description={<ul>{failures.map((message, index) => <li key={index + "-" + message}>{message}</li>)}</ul>} /></div>
        : edited ? <div className="theme-lab__result"><InlineNotice title={"Aprovada — texto sobre primária: " + primaryCheck?.ratio?.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + ":1."} /></div> : null}
    </section>
    <div className="theme-lab__samples" aria-label="Combinações de laboratório" role="group">{samples.map((sample) => <Button key={sample.id} variant="outline" onClick={() => inspect(sample.theme)}>{sample.label}</Button>)}</div>
    <ThemeScope theme={state.applied} data-testid="theme-preview"><PreviewControls primary title="Tema em edição" themeKey={String(state.revision)} /></ThemeScope>
    <div className="theme-lab__comparison">
      <PreviewControls title="Padrão Hywork" />
      <ThemeScope theme={samples[2].theme} data-testid="theme-independent"><PreviewControls title="Outro workspace" /></ThemeScope>
    </div>
    <p className="theme-lab__footnote">Validação de papéis suportados pelo design system. Não implica tema escuro para todo o produto nem migração de consumidores.</p>
  </main>;
}
