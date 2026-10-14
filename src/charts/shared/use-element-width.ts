"use client";

import * as React from "react";

// useLayoutEffect warns during server rendering; the width only exists in the browser.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/**
 * Largura do contêiner, acompanhada por `ResizeObserver`. Com `fixed`, a
 * largura é essa e nada é observado — o modo de impressão, em que o
 * observador não mede.
 *
 * Medir aqui, e não no `ResponsiveContainer` do recharts, deixa o próprio
 * componente decidir o que muda com a largura: a coluna de rótulos, o raio do
 * radar, a quebra dos nomes.
 */
export function useElementWidth<T extends HTMLElement>(fixed?: number) {
  const ref = React.useRef<T>(null);
  const [measured, setMeasured] = React.useState(0);

  useIsomorphicLayoutEffect(() => {
    if (fixed !== undefined) return;
    const element = ref.current;
    if (!element) return;
    setMeasured(Math.floor(element.getBoundingClientRect().width));
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setMeasured(Math.floor(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [fixed]);

  return [ref, fixed ?? measured] as const;
}
