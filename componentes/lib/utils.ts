/**
 * `cn` — junta className condicional e resolve conflito de utility.
 *
 * Verbatim do shadcn-ui/ui @ ee628d75. Está aqui porque é a única peça de
 * infraestrutura que todo componente importa; divergir dela seria divergir de
 * todos os exemplos do upstream de uma vez.
 *
 * O twMerge é o que faz `<Button className="bg-secondary">` sobrescrever o
 * bg-primary da variante em vez de empilhar duas regras e deixar a ordem do
 * CSS decidir.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
