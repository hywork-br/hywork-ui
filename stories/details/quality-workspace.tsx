import { useId, useRef, useState } from "react";
import { Check, MousePointer2 } from "lucide-react";
import { Button, ContentCell, DateCell, Field, FieldError, FieldHint, Input, Label, NumberCell, PersonCell, StatusCell } from "../../src";
import { CollectionDemo, type CollectionEditorProps } from "../collections/collection-demo";
import { PilotMotionScope, PilotSaveNotice } from "../pilots/motion";
import "./details.css";

// Deliberately local and immediate: no network, persistence or synthetic delay.
const saveLocalFixture = async (_title: string) => {};
export function QualityWorkspace({ saveFixture = saveLocalFixture }: {
  saveFixture?: (title: string) => Promise<void>;
}) {
  return <main className="hw-quality-workspace">
    <PilotMotionScope enabled>
      <CollectionDemo renderEditor={(props) => <FixtureEditor key={props.content.id} {...props} saveFixture={saveFixture} />} />
    </PilotMotionScope>
  </main>;
}

function FixtureEditor({ content, onSave, onClose, saveFixture }: CollectionEditorProps & {
  saveFixture: (title: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(content.title);
  const [state, setState] = useState<"idle" | "pending" | "failed" | "saved">("idle");
  const [failNext, setFailNext] = useState(false);
  const pending = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const dirty = title !== content.title;
  return <section className="hw-quality-editor" aria-label="Edição local do conteúdo">
    <div>
      <h2>Editar título</h2>
      <p>Ajuste o título e confira a alteração na coleção.</p>
      <small>Exemplo local. Não publica conteúdo.</small>
    </div>
    <form onSubmit={async (event) => {
      event.preventDefault();
      if (pending.current || !title.trim()) return;
      pending.current = true;
      setState("pending");
      try {
        if (failNext) { setFailNext(false); throw new Error("Local fixture failure"); }
        await saveFixture(title.trim());
        onSave(title.trim());
        setTitle(title.trim());
        setState("saved");
      } catch {
        setState("failed");
      } finally {
        pending.current = false;
        inputRef.current?.focus();
      }
    }}>
      <Field>
        <Label htmlFor={id}>Título do conteúdo</Label>
        <Input id={id} ref={inputRef} autoFocus value={title} readOnly={state === "pending"}
          invalid={state === "failed"} aria-describedby={`${id}-hint${state === "failed" ? ` ${id}-error` : ""}`}
          onChange={(event) => { setTitle(event.target.value); setState("idle"); }} />
        <FieldHint id={`${id}-hint`}>O título permanece visível na tabela, mesmo quando ocupa mais de uma linha.</FieldHint>
        {state === "failed" && <FieldError id={`${id}-error`}>Não foi possível salvar. Seu título continua aqui; tente novamente.</FieldError>}
      </Field>
      <div className="hw-quality-editor__actions">
        <Button type="submit" loading={state === "pending"} disabled={!title.trim()}>{state === "failed" ? "Tentar novamente" : "Salvar título"}</Button>
        <Button variant="quiet" disabled={state === "pending"} onClick={onClose}>{dirty ? "Descartar alterações e fechar" : "Fechar edição"}</Button>
      </div>
      <PilotSaveNotice notice={state === "pending" ? "Salvando título…" : state === "saved" ? "Título salvo na demonstração local." : ""} saved={state === "saved"} />
      <details className="hw-collection-disclosure hw-quality-fixture-control">
        <summary>Cenário de demonstração</summary>
        <label className="hw-collection-check"><input className="hw-choice" type="checkbox" checked={failNext} disabled={state === "pending"} onChange={(event) => setFailNext(event.target.checked)} />Falhar próximo salvamento local</label>
      </details>
    </form>
  </section>;
}

export function DetailSpecimens() {
  const [selected, setSelected] = useState(false);
  const [value, setValue] = useState("");
  return <main className="hw-detail-specimens">
    <header><h1>Detalhes que orientam a operação</h1><p>Critérios aprovados e contraexemplos estáticos. A comparação usa o mesmo domínio de Conteúdos.</p></header>
    <section aria-label="Comparação de detalhes" className="hw-detail-comparison">
      <div className="hw-detail-comparison__head"><h2>Aprovado</h2><h2>Contraexemplo · não usar</h2></div>
      <article><div><h3>Hierarquia e quebra</h3><ContentCell title="Boas-vindas às pessoas que começam uma nova história com a nossa equipe" metadata="Comunicação interna • Guia de integração para todas as unidades e equipes." /></div><div><h3>Hierarquia achatada</h3><p className="hw-detail-bad-truncate">Boas-vindas às pessoas que começam uma nova história com a nossa equipe</p><p className="hw-detail-bad-weight">Comunicação interna • Guia de integração</p><p className="hw-detail-explanation">Título cortado e metadados com o mesmo peso: a identidade se perde.</p></div></article>
      <article><div><h3>Alinhamento e ausência</h3><dl className="hw-detail-values"><dt>Autor</dt><dd><PersonCell /></dd><dt>Publicação</dt><dd><DateCell value="2026-09-03" /></dd><dt>Visualizações</dt><dd><NumberCell value={1280} /></dd><dt>Visualizações</dt><dd><NumberCell value={37} /></dd></dl></div><div><h3>Vazio ambíguo</h3><div className="hw-detail-bad-values"><p>Autor:</p><p>3/9/26</p><p>1280</p><p>37</p></div><p className="hw-detail-explanation">Ausência não é zero. Datas e números precisam de formato e alinhamento consistentes.</p></div></article>
      <article><div><h3>Alvo e estado explícitos</h3><Button variant="quiet" aria-pressed={selected} onClick={() => setSelected(!selected)}><Check aria-hidden="true" />{selected ? "Selecionado" : "Selecionar conteúdo"}</Button><p><StatusCell label={selected ? "Selecionado" : "Disponível"} tone={selected ? "info" : "neutral"} /></p><p className="hw-detail-explanation">Passe o ponteiro e use Tab: hover é superfície neutra; seleção tem texto; foco tem anel laranja.</p></div><div><h3>Alvo pequeno, estado só por cor</h3><span className="hw-detail-bad-target" aria-hidden="true"><MousePointer2 /></span><p className="hw-detail-explanation">Contraexemplo inerte. Não deve entrar na ordem de foco nem fingir ser uma ação.</p></div></article>
      <article><div><h3>Erro e indisponibilidade</h3><Field><Label htmlFor="detail-required">Título obrigatório</Label><Input id="detail-required" value={value} onChange={(event) => setValue(event.target.value)} invalid={!value.trim()} aria-describedby="detail-required-error" />{!value.trim() && <FieldError id="detail-required-error">Informe o título para continuar.</FieldError>}</Field><Button variant="quiet" disabled title="Publicação fora do escopo deste laboratório">Publicar · indisponível no laboratório</Button></div><div><h3>Erro sem recuperação</h3><p className="hw-detail-bad-truncate">Erro</p><p className="hw-detail-explanation">Uma mensagem genérica não identifica o campo nem explica como seguir.</p></div></article>
    </section>
  </main>;
}
