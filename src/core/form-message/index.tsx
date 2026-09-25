import * as React from "react";

import { cn } from "../../lib/cn";

/**
 * Mensagem de erro de um campo.
 *
 * Decisão da PO (23/09/2026): 14px, vermelho de erro, **sem espaçamento
 * adicional acima** — a mensagem cola no campo que a gerou, porque é o que
 * deixa claro qual campo falhou quando o formulário tem muitos.
 *
 * A escolha visual foi o `text-red-500` literal; aqui ele é o token
 * `--hw-error-text`, para que o componente não carregue cor literal. A
 * aparência é a eleita, a implementação é tokenizada.
 *
 * Não renderiza nada sem mensagem: a tela pode passar `children` direto do
 * validador sem envolver num condicional.
 */
export interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Quando ausente ou vazio, nada é renderizado. */
  children?: React.ReactNode;
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, ...props }, ref) => {
    if (children === undefined || children === null || children === "") return null;

    return (
      <p
        ref={ref}
        // `role="alert"` faz o leitor de tela anunciar o erro ao aparecer, sem
        // que o foco precise voltar ao campo.
        role="alert"
        className={cn("text-sm text-hw-error-text", className)}
        {...props}
      >
        {children}
      </p>
    );
  },
);
FormMessage.displayName = "FormMessage";

export { FormMessage };
