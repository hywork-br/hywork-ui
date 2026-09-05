import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Banner,
  Button,
  Checkbox,
  DialogActions,
  InlineNotice,
  Toast,
} from "../../src";

const items = [
  { id: "welcome", name: "Boas-vindas" },
  { id: "culture", name: "Cultura" },
  { id: "benefits", name: "Benefícios" },
];
export interface RecoveryDemoProps {
  onDelete?: () => Promise<void>;
  /** Return only failed IDs after acknowledgement. This fixture simulates otherwise. */
  onPublish?: (ids: string[]) => Promise<string[]>;
}
export function RecoveryDemo({ onDelete, onPublish }: RecoveryDemoProps) {
  const [draft, setDraft] = React.useState("Boas-vindas à Hywork");
  const [offline, setOffline] = React.useState(false),
    [permission, setPermission] = React.useState(true),
    [conflict, setConflict] = React.useState(false);
  const [archived, setArchived] = React.useState(false),
    [deleted, setDeleted] = React.useState(false);
  const [open, setOpen] = React.useState(false),
    [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [failed, setFailed] = React.useState<string[]>([]),
    [published, setPublished] = React.useState<string[]>([]);
  const lock = React.useRef(false),
    cancel = React.useRef<HTMLButtonElement>(null);
  const draftRef = React.useRef<HTMLTextAreaElement>(null);
  const allowed = permission && !offline && !pending;
  const editable = allowed && !deleted && !archived;
  async function remove() {
    if (!editable || lock.current) return;
    lock.current = true;
    setPending(true);
    setMessage("");
    try {
      await (onDelete ? onDelete() : Promise.resolve());
      setDeleted(true);
      setOpen(false);
      setMessage("Item excluído");
    } catch {
      setMessage(
        "Não foi possível excluir. O item foi preservado. Tente novamente."
      );
    } finally {
      lock.current = false;
      setPending(false);
    }
  }
  async function publish(ids: string[]) {
    if (!allowed || lock.current) return;
    lock.current = true;
    setPending(true);
    setMessage("");
    try {
      const result = onPublish
        ? await onPublish(ids)
        : published.length
        ? []
        : ["culture"];
      const failures = ids.filter((id) => result.includes(id));
      const successes = Array.from(
        new Set([...published, ...ids.filter((id) => !failures.includes(id))])
      );
      setPublished(successes);
      setFailed(failures);
      setMessage(
        `${successes.length} de 3 itens publicados${
          failures.length
            ? `. Falhou: ${items
                .filter((item) => failures.includes(item.id))
                .map((item) => item.name)
                .join(", ")}`
            : ""
        }`
      );
    } catch {
      setFailed(ids);
      setMessage(
        `Falha ao publicar: ${items
          .filter((item) => ids.includes(item.id))
          .map((item) => item.name)
          .join(", ")}. Tente novamente.`
      );
    } finally {
      lock.current = false;
      setPending(false);
    }
  }
  return (
    <main className="hw-recovery-demo">
      <header>
        <h1>Feedback e recuperação</h1>
        <p>
          Ambiente simulado · dados em memória, sem envio a serviços. Recarregar
          reinicia o rascunho.
        </p>
      </header>
      <fieldset className="hw-recovery-demo__scenarios" disabled={pending}>
        <legend>Condições simuladas</legend>
        <label>
          <Checkbox
            checked={offline}
            onChange={(event) => setOffline(event.target.checked)}
          />
          Simular offline
        </label>
        <label>
          <Checkbox
            checked={permission}
            onChange={(event) => setPermission(event.target.checked)}
          />
          Permissão de edição
        </label>
        <label>
          <Checkbox
            checked={conflict}
            onChange={(event) => setConflict(event.target.checked)}
          />
          Simular conflito
        </label>
      </fieldset>
      {!permission && (
        <Banner
          severity="warning"
          title="Sua permissão de edição foi removida"
          description="O rascunho continua disponível para leitura. Solicite acesso ao administrador."
        />
      )}
      {offline && (
        <Banner
          severity="warning"
          title="Você está offline"
          description="Seu rascunho está preservado nesta página. Reconecte para salvar."
        />
      )}
      <label className="hw-recovery-demo__draft">
        Rascunho
        <textarea
          ref={draftRef}
          value={draft}
          readOnly={!editable}
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      {conflict && (
        <InlineNotice
          severity="warning"
          title="Outra versão foi salva"
          description="Versão remota simulada: Boas-vindas atualizadas. Escolha explicitamente qual texto usar antes de salvar."
          announcement="off"
        />
      )}
      {conflict && (
        <div className="hw-recovery-demo__actions">
          <Button
            variant="secondary"
            disabled={!editable}
            onClick={() => {
              setConflict(false);
              setMessage(
                "Seu rascunho foi mantido. Salve para confirmar a versão."
              );
            }}
          >
            Manter meu rascunho
          </Button>
          <Button
            variant="quiet"
            disabled={!editable}
            onClick={() => {
              setDraft("Boas-vindas atualizadas");
              setConflict(false);
              setMessage(
                "Versão remota carregada no rascunho. Salve para confirmar."
              );
            }}
          >
            Usar versão remota
          </Button>
        </div>
      )}
      <div className="hw-recovery-demo__actions">
        <Button
          disabled={!editable || conflict}
          onClick={() => {
            if (editable && !conflict)
              setMessage("Rascunho salvo na simulação");
          }}
        >
          Salvar
        </Button>
        <Button
          variant="quiet"
          disabled={!editable}
          onClick={() => {
            if (editable) {
              setArchived(true);
              setMessage("Item arquivado");
            }
          }}
        >
          Arquivar
        </Button>
        <AlertDialog
          open={open}
          onOpenChange={(value) => {
            if (!lock.current) {
              if (value) setMessage("");
              setOpen(value);
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <Button variant="quiet" disabled={!editable}>
              Excluir permanentemente
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            onCloseAutoFocus={(event) => {
              if (deleted) {
                event.preventDefault();
                draftRef.current?.focus();
              }
            }}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              cancel.current?.focus();
            }}
            onEscapeKeyDown={(event) => {
              if (lock.current) event.preventDefault();
            }}
            onPointerDownOutside={(event) => event.preventDefault()}
            onInteractOutside={(event) => event.preventDefault()}
          >
            <AlertDialogTitle>
              Excluir este item definitivamente?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta exclusão simulada remove 1 item. Não será possível desfazer.
            </AlertDialogDescription>
            <DialogActions>
              <Button
                ref={cancel}
                variant="outline"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                loading={pending}
                disabled={!editable}
                onClick={remove}
              >
                Excluir definitivamente
              </Button>
            </DialogActions>
            {message && <InlineNotice title={message} severity="error" />}
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <section>
        <h2>Publicação em lote</h2>
        <p>
          3 itens simulados: Boas-vindas, Cultura e Benefícios. A primeira
          tentativa simula falha em Cultura.
        </p>
        <Button
          variant="secondary"
          disabled={!allowed || published.length > 0 || failed.length > 0}
          loading={pending && !open}
          onClick={() => publish(items.map((item) => item.id))}
        >
          Publicar 3 itens
        </Button>
      </section>
      {message && !open && (
        <Toast
          title={message}
          severity={failed.length ? "warning" : "info"}
          onDismiss={() => setMessage("")}
          action={
            archived && !deleted && message === "Item arquivado"
              ? {
                  label: "Desfazer",
                  disabled: !allowed,
                  onClick: () => {
                    if (allowed) {
                      setArchived(false);
                      setMessage("Arquivamento desfeito");
                    }
                  },
                }
              : failed.length
              ? {
                  label: `Tentar novamente ${failed.length} ${
                    failed.length === 1 ? "item" : "itens"
                  }`,
                  disabled: !allowed,
                  onClick: () => publish(failed),
                }
              : undefined
          }
        />
      )}
      {!message && failed.length > 0 && !open && (
        <InlineNotice
          announcement="off"
          severity="warning"
          title={`Pendentes: ${items
            .filter((item) => failed.includes(item.id))
            .map((item) => item.name)
            .join(", ")}`}
          action={{
            label: `Tentar novamente ${failed.length} ${
              failed.length === 1 ? "item" : "itens"
            }`,
            disabled: !allowed,
            onClick: () => publish(failed),
          }}
        />
      )}
      {archived && message !== "Item arquivado" && (
        <Button
          variant="quiet"
          disabled={!allowed}
          onClick={() => {
            if (allowed) {
              setArchived(false);
              setMessage("Arquivamento desfeito");
            }
          }}
        >
          Desfazer arquivamento
        </Button>
      )}
    </main>
  );
}
