import { useMemo, useState, type CSSProperties } from "react";

import {
  validateTenantTheme,
  type TenantThemeCandidate,
  type ThemeValidationResult,
} from "../../src/lib/theme-validation";
import "../../tokens/theme-lab.css";

type ThemeSample = {
  id: string;
  label: string;
  primaryToken: string;
  foregroundToken: string;
};

const samples: ThemeSample[] = [
  {
    id: "strong",
    label: "Acento forte aprovado",
    primaryToken: "--hw-rust-strong",
    foregroundToken: "--hw-white",
  },
  {
    id: "light",
    label: "Acento claro aprovado",
    primaryToken: "--hw-amber-tint",
    foregroundToken: "--hw-navy",
  },
  {
    id: "dark",
    label: "Acento escuro aprovado",
    primaryToken: "--hw-navy",
    foregroundToken: "--hw-white",
  },
  {
    id: "rejected",
    label: "Combinação intencionalmente rejeitada",
    primaryToken: "--hw-white",
    foregroundToken: "--hw-white",
  },
];

function resolvePrimitive(token: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}

function candidateFor(sample: ThemeSample): TenantThemeCandidate {
  const background = resolvePrimitive("--hw-white");
  return {
    primary: resolvePrimitive(sample.primaryToken),
    primaryForeground: resolvePrimitive(sample.foregroundToken),
    background,
    text: resolvePrimitive("--hw-navy"),
    focus: resolvePrimitive("--hw-orange"),
    focusAdjacentSurfaces: [{ name: "background", color: background }],
  };
}

function ratioLabel(result: ThemeValidationResult) {
  const check = result.checks.primaryForeground;
  return check ? `${check.displayRatio.toLocaleString("pt-BR")}:1` : "indisponível";
}

export function ThemeLab({ initialTheme }: { initialTheme?: TenantThemeCandidate }) {
  const initial = useMemo(
    () => initialTheme ?? candidateFor(samples[0]),
    [initialTheme]
  );
  const [applied, setApplied] = useState(initial);
  const [draftPrimary, setDraftPrimary] = useState(initial.primary);
  const [validation, setValidation] = useState(() =>
    validateTenantTheme(initial)
  );
  const [hasEdited, setHasEdited] = useState(false);
  const [previewConfirmed, setPreviewConfirmed] = useState(false);

  function inspectPrimary(primary: string) {
    setHasEdited(true);
    setDraftPrimary(primary);
    const result = validateTenantTheme({ ...applied, primary });
    setValidation(result);
    if (result.valid) setApplied((current) => ({ ...current, primary }));
  }

  function inspectSample(sample: ThemeSample) {
    const candidate = candidateFor(sample);
    const result = validateTenantTheme(candidate);
    setHasEdited(true);
    setDraftPrimary(candidate.primary);
    setValidation(result);
    if (result.valid) setApplied(candidate);
  }

  const previewStyle = {
    "--color-primary": applied.primary,
    "--color-primary-fg": applied.primaryForeground,
    "--color-background": applied.background,
    "--color-text": applied.text,
  } as CSSProperties;

  return (
    <main className="theme-lab">
      <header className="theme-lab__header">
        <p className="theme-lab__eyebrow">Protótipo de laboratório</p>
        <h1>Validação de tema do tenant</h1>
        <p>
          Confira pares semânticos antes de uma futura integração. Nenhuma
          configuração é salva ou enviada.
        </p>
      </header>

      <section className="theme-lab__editor" aria-labelledby="theme-editor-title">
        <div>
          <h2 id="theme-editor-title">Cores resolvidas</h2>
          <p>
            O preview só recebe a última combinação aprovada. O produto continua
            dono de dados, permissões, rede, persistência e regras de negócio.
          </p>
        </div>
        <label className="theme-lab__field">
          <span>Cor primária do tenant</span>
          <input
            aria-invalid={hasEdited && !validation.valid}
            onChange={(event) => inspectPrimary(event.target.value)}
            spellCheck={false}
            type="text"
            value={draftPrimary}
          />
        </label>
        <label className="theme-lab__field theme-lab__field--picker">
          <span>Seletor nativo da cor primária</span>
          <input
            aria-invalid={hasEdited && !validation.valid}
            onChange={(event) => inspectPrimary(event.target.value)}
            type="color"
            value={
              /^#[\da-f]{6}$/i.test(applied.primary)
                ? applied.primary
                : resolvePrimitive("--hw-rust-strong")
            }
          />
        </label>
        {hasEdited && validation.valid ? (
          <p className="theme-lab__result" role="status">
            Aprovada — texto sobre primária: {ratioLabel(validation)}.
          </p>
        ) : null}
        {hasEdited && !validation.valid ? (
          <div className="theme-lab__result theme-lab__result--rejected" role="alert">
            <strong>Rejeitada — o preview anterior foi preservado.</strong>
            <ul>
              {validation.failures.map((failure) => (
                <li key={`${failure.code}-${failure.field}`}>{failure.message}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <div className="theme-lab__samples" aria-label="Combinações de laboratório" role="group">
        {samples.map((sample) => (
          <button key={sample.id} onClick={() => inspectSample(sample)} type="button">
            {sample.label}
          </button>
        ))}
      </div>

      <section
        className="theme-lab__preview"
        data-testid="theme-preview"
        style={previewStyle}
      >
        <div>
          <p className="theme-lab__preview-kicker">Portal · caso móvel</p>
          <h2>Comunicação para todas as unidades</h2>
          <p>
            A identidade do domínio permanece visível sem transformar este
            laboratório em uma promessa de tema escuro para o produto inteiro.
          </p>
        </div>
        <button
          aria-pressed={previewConfirmed}
          className="theme-lab__primary-action"
          onClick={() => setPreviewConfirmed((current) => !current)}
          type="button"
        >
          Continuar para revisar todas as unidades selecionadas
        </button>
        {previewConfirmed ? (
          <p className="theme-lab__preview-confirmation" role="status">
            Prévia confirmada localmente.
          </p>
        ) : null}
      </section>
    </main>
  );
}
