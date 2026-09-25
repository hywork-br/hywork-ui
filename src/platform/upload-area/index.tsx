"use client";

import * as React from "react";
import { UploadCloud } from "lucide-react";

import { cn } from "../../lib/cn";

/**
 * Área de envio de arquivo.
 *
 * Decisão da PO (23/09/2026): borda tracejada de 2px, raio 16, **ícone à
 * esquerda e texto à direita** — horizontal, não a caixa alta e centralizada
 * que as telas vinham desenhando cada uma do seu jeito.
 *
 * O componente não faz upload: recebe os arquivos escolhidos e devolve. Quem
 * envia, valida tamanho e mostra progresso é a tela, que sabe para onde vai.
 */
export interface UploadAreaProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Chamado com os arquivos escolhidos, por clique ou por arrastar. */
  onSelect: (files: File[]) => void;
  /** Frase principal. */
  title: string;
  /** Linha de apoio — formatos aceitos, tamanho máximo. */
  description?: string;
  /** Filtro do seletor de arquivos, no formato do atributo `accept`. */
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  /** Ícone à esquerda; o padrão é a nuvem de envio. */
  icon?: React.ReactNode;
}

const UploadArea = React.forwardRef<HTMLDivElement, UploadAreaProps>(
  (
    {
      onSelect,
      title,
      description,
      accept,
      multiple = false,
      disabled = false,
      icon,
      className,
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [arrastando, setArrastando] = React.useState(false);

    const escolher = (lista: FileList | null) => {
      if (!lista || lista.length === 0) return;
      onSelect(Array.from(lista));
    };

    return (
      <div
        ref={ref}
        // Continua um alvo de teclado: `button` daria semântica de ação única e
        // o arrastar-e-soltar deixaria de fazer sentido no mesmo elemento.
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (disabled || (event.key !== "Enter" && event.key !== " ")) return;
          event.preventDefault();
          inputRef.current?.click();
        }}
        onDragOver={(event) => {
          if (disabled) return;
          event.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(event) => {
          if (disabled) return;
          event.preventDefault();
          setArrastando(false);
          escolher(event.dataTransfer.files);
        }}
        className={cn(
          "flex items-center gap-4 rounded-2xl border-2 border-dashed border-border p-4 text-left transition-colors",
          !disabled && "cursor-pointer hover:border-primary/50 hover:bg-muted/40",
          arrastando && "border-primary bg-primary/5",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
        {...props}
      >
        <div className="text-muted-foreground [&>svg]:h-8 [&>svg]:w-8" aria-hidden="true">
          {icon ?? <UploadCloud />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          onChange={(event) => {
            escolher(event.target.files);
            // Permite escolher o mesmo arquivo duas vezes seguidas.
            event.target.value = "";
          }}
        />
      </div>
    );
  },
);
UploadArea.displayName = "UploadArea";

export { UploadArea };
