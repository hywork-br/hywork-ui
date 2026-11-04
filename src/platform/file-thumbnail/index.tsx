"use client";

import * as React from "react";
import { FileText, Image as ImageIcon, Paperclip, Video, type LucideIcon } from "lucide-react";

import { Skeleton } from "../../core/skeleton";
import { cn } from "../../lib/cn";

/**
 * Um arquivo como miniatura clicável: a imagem, ou o ícone do tipo, com o nome e
 * o tamanho embaixo. Nasceu para a evidência do PDI do DHO (HCK-360: "Incluir a
 * evidência como miniatura"), mas não sabe o que é evidência: recebe nome, tipo e
 * URL, e avisa por `onOpen`. Quem busca a URL e abre o arquivo é a tela.
 *
 * O `mime` decide a forma. Imagem espera num esqueleto com `loading` ou enquanto
 * não há `src` (a URL pode ser assinada e chegar depois); se a imagem falhar, cai
 * no ícone e tenta de novo quando o `src` mudar. `loading={false}` sem `src` diz
 * que a URL não vem: fica o ícone, em vez de um esqueleto eterno. PDF, vídeo e os
 * demais tipos mostram só o ícone e ignoram `src` e `loading`.
 *
 * O visual é proposta e aguarda o aval da PO: quadro de 4:3 e `object-cover`
 * (como a foto das evidências de Campanhas), nome em 14px medium e tamanho em
 * 12px (como o `FileUploadZone` de Bases de dados).
 */
// `name` do HTML é o do controle de formulário; aqui é o nome do arquivo. O clique
// é sempre `onOpen`, e o botão nunca envia formulário.
export interface FileThumbnailProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "name" | "onClick" | "type"> {
  /** Nome do arquivo. É o texto visível e o nome acessível, a menos que venha `aria-label`. */
  name: string;
  /** Tipo do arquivo (`image/png`, `application/pdf`, `video/mp4`…). */
  mime: string;
  /** URL da imagem. Só vale para imagem; sem ela, a imagem espera. */
  src?: string;
  /** Tamanho já formatado pela tela ("1,2 MB"). */
  sizeLabel?: string;
  /** A tela está buscando a URL. `false` sem `src`: a URL não vem, e fica o ícone. */
  loading?: boolean;
  /** Clique, Enter ou Espaço. */
  onOpen: () => void;
}

type FileKind = "image" | "pdf" | "video" | "other";

const icons: Record<FileKind, LucideIcon> = {
  image: ImageIcon,
  pdf: FileText,
  video: Video,
  other: Paperclip,
};

function fileKind(mime: string): FileKind {
  // Sem parâmetros: `application/pdf; charset=binary` continua sendo PDF.
  const tipo = mime.split(";")[0].trim().toLowerCase();
  if (tipo.startsWith("image/")) return "image";
  if (tipo === "application/pdf") return "pdf";
  if (tipo.startsWith("video/")) return "video";
  return "other";
}

const FileThumbnail = React.forwardRef<HTMLButtonElement, FileThumbnailProps>(
  ({ name, mime, src, sizeLabel, loading, onOpen, className, "aria-label": ariaLabel, ...props }, ref) => {
    const sizeId = React.useId();
    const imagem = React.useRef<HTMLImageElement>(null);
    // Guardam o `src` a que se referem: um `src` novo (a URL assinada renovada)
    // recomeça sozinho, sem efeito para limpar o estado.
    const [carregada, setCarregada] = React.useState<string>();
    const [falhou, setFalhou] = React.useState<string>();

    const kind = fileKind(mime);
    const esperando = kind === "image" && (loading ?? !src);
    const comImagem = kind === "image" && !esperando && !!src && falhou !== src;
    const preview = esperando || (comImagem && carregada !== src) ? "loading" : comImagem ? "image" : "icon";
    const Icon = icons[kind];

    // A imagem que veio do servidor pode terminar antes da hidratação, e aí os
    // eventos `load` e `error` já passaram: sem isto, o esqueleto não sairia.
    React.useEffect(() => {
      const img = imagem.current;
      if (!src || !img?.complete) return;
      if (img.naturalWidth > 0) setCarregada(src);
      else setFalhou(src);
    }, [src, comImagem]);

    return (
      <button
        ref={ref}
        type="button"
        onClick={onOpen}
        aria-label={ariaLabel ?? name}
        aria-describedby={sizeLabel ? sizeId : undefined}
        aria-busy={preview === "loading" || undefined}
        data-kind={kind}
        data-preview={preview}
        className={cn(
          "flex w-40 min-w-0 max-w-full flex-col overflow-hidden rounded-md border border-border bg-card text-left text-card-foreground ring-offset-background transition-colors motion-reduce:!transition-none hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      >
        <span className="relative flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden bg-muted">
          {preview === "loading" && <Skeleton className="absolute inset-0 rounded-none" />}
          {comImagem && (
            <img
              ref={imagem}
              src={src}
              // Decorativa: o nome acessível do botão já diz qual é o arquivo.
              alt=""
              onLoad={() => setCarregada(src)}
              onError={() => setFalhou(src)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {preview === "icon" && <Icon aria-hidden="true" className="h-8 w-8 text-muted-foreground" />}
        </span>
        <span className="flex w-full min-w-0 flex-col gap-0.5 px-3 py-2">
          {/* `aria-label` esconde este texto do leitor de tela; o `title` mostra o nome inteiro a quem usa o mouse. */}
          <span title={name} className="block truncate text-sm font-medium">
            {name}
          </span>
          {sizeLabel && (
            <span id={sizeId} className="block truncate text-xs text-muted-foreground">
              {sizeLabel}
            </span>
          )}
        </span>
      </button>
    );
  },
);
FileThumbnail.displayName = "FileThumbnail";

export { FileThumbnail };
