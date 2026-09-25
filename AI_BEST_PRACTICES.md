# Melhores Práticas (IA)

Como um agente deve escrever código neste repositório.

## Antes de escrever

1. **Leia [DOMAIN_MODEL.md](DOMAIN_MODEL.md).** O padrão visual provavelmente já
   foi decidido pela PO. Divergir exige decisão registrada — não é escolha de
   quem implementa.
2. **Confira [INDEX.md](INDEX.md).** O componente pode já existir em `core/`,
   `platform/` ou `builder/`.
3. **Classifique o componente**: primitiva, padrão ou domínio. Domínio não entra
   aqui ([AGENTS.md](AGENTS.md) §2).
4. **Encontre dois exemplos existentes** do padrão que vai seguir e imite-os.

## A ordem de escrita

**Story primeiro, componente depois.** Se a story fica confusa de escrever, a API
está errada — descobrir isso ali custa uma hora; descobrir depois de dez telas
migradas custa a refatoração inteira.

```
1. <nome>.stories.tsx    todos os estados previstos
2. index.tsx             a implementação que a story pede
3. <nome>.test.tsx       comportamento, foco, acessibilidade
```

## Composição, não acumulação de props

Um padrão recebe slots, não quinze props opcionais:

```tsx
// ✅ composição
<FilterBar onClear={clear}>
  <FilterBar.Search value={q} onChange={setQ} />
  <FilterBar.Select label="Status" options={opts} value={s} onChange={setS} />
</FilterBar>

// ❌ props acumuladas — foi assim que uma tela chegou a 12 props
<FilterBar nameFilter={} emailFilter={} statusFilter={} onNameChange={} ... />
```

**Se a API passa de ~8 props, a anatomia está errada.** Volte à story.

## Regras duras

| Regra | Por quê |
|---|---|
| Nenhuma cor literal em componente | quebra o tema do cliente; use token semântico |
| Nenhum acesso a serviço, contexto de auth ou API | componente genérico recebe tudo por props |
| Responsividade dentro do componente | se a página decidir, a divergência volta |
| `cn()` para compor classes | `tailwind-merge` resolve conflito de utilitário |
| Variantes por `cva`, não por `if` de className | mantém a matriz de variantes legível |
| `forwardRef` em tudo que embrulha elemento nativo | composição com Radix e formulários depende disso |

## Acessibilidade

Não é etapa final — é parte da definição de pronto:

- foco visível em todo elemento interativo, com `focus-visible`
- navegação por teclado completa: Tab, Shift+Tab, Escape, setas onde couber
- rótulo acessível em todo controle (`aria-label` quando não há texto visível)
- `prefers-reduced-motion` respeitado em qualquer transição
- contraste mínimo de 4,5:1 em texto — o `addon-a11y` roda axe em cada story

Hierarquia de heading não salta níveis dentro de um componente.

## Testes

| Tipo | O que cobre | Onde |
|---|---|---|
| Vitest | comportamento, estados, foco | `<nome>.test.tsx`, ao lado do componente |
| Playwright | interação real nos dois navegadores | `tests/browser/` |
| axe | contraste e semântica, por story | automático via addon |

Uma verificação nova deve **reprovar uma mutação representativa**. Teste que
passa com o componente quebrado não é teste.

## Ao alterar um componente existente

1. Preserve a API pública. Ruptura vai no [CHANGELOG.md](CHANGELOG.md) com a versão.
2. Atualize a story com o novo estado.
3. Se mudou aparência, registre a diferença — mudança visual deliberada precisa
   ficar rastreável.
4. Nunca altere snapshot de procedência para fazer teste passar.

## O que nunca fazer

- Criar componente que conhece tenant, workspace ou colaborador.
- Copiar um componente do consumidor sem passar pela classificação de §2.
- Subir um componente na primeira vez que ele é necessário (regra do segundo consumidor).
- Editar apenas a saída de uma transformação sem alterar a transformação.
- Declarar cobertura de produto a partir do catálogo verde.
