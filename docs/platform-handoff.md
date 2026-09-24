# Handoff para engenharia — Platform

> ## ⚠️ SUPERSEDIDO — ver [CROSS_STACK_CONVENTIONS.md](CROSS_STACK_CONVENTIONS.md)
>
> Este documento descreve a entrega inicial (v0.7.0), quando o escopo era apenas
> o `hywork-plataform`. Desde 23/09/2026 o repositório atende **dois**
> consumidores e a estrutura mudou para `core` / `platform` / `builder`.
>
> **Use [CROSS_STACK_CONVENTIONS.md](CROSS_STACK_CONVENTIONS.md)** para instalação, migração e ciclo de versão.
> Mantido como registro da extração original.

## O que está disponível

28 famílias genéricas, tokens e preset Tailwind 3. Fonte técnica: Platform
`85a66bafd8020697f694366e1937c6379d8663fc`, consultada em 17/09/2026.
Esta revisão remota não foi identificada como o deploy de produção.

O pacote não migra nenhuma tela automaticamente. O primeiro lote serve para começar
a adoção controlada, não para declarar o produto inteiro pronto.

## Instalar e configurar

Depois de gerar e verificar o pacote desta revisão:

```sh
npm ci
npm run build:lib
npm pack
# No consumidor, instalar o tarball aprovado e versionar o lockfile.
npm install /caminho/hywork-ui-0.7.0.tgz
```

Não usar um tag 0.7.0 antes de sua publicação. Registrar o SHA e o hash do tarball no PR.

```js
// tailwind.config.cjs — adaptar a configuração existente, não substituir a aplicação.
module.exports = {
  presets: [require("@hywork/ui/tailwind/platform-preset.cjs")],
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@hywork/ui/dist/**/*.js",
  ],
};
```

Importar `@hywork/ui/tokens/platform.css` no CSS global.
Manter o CSS base/input do produto e a carga da Montserrat existente.
O pacote não injeta reset nem baixa fonte. O preset usa `--font-montserrat`.
Variáveis da aplicação como `--primary` e `--primary-foreground` prevalecem sobre
os defaults `--hw-*`; não as sobrescrever numa feature.

Se o consumidor redefine as mesmas chaves em `theme.extend`, essas definições podem
vencer o preset. Remover duplicações somente após verificar o CSS resultante e o tenant.
O tarball distribui JS, declarações, tokens, preset e docs; não o catálogo nem a referência.

## Migrar

Trocar imports locais pelas APIs de `@hywork/ui` sem renomear props em massa.
`Button` mantém `variant="default"` e `size="default"`; `Input` mantém os handlers.
Subcomponentes compostos são exportados individualmente. Não há adapter universal
de outras versões do pacote.

Correção explícita da extração: o Slider agora renderiza seu thumb também com
`defaultValue` e encaminha `aria-label`/`aria-labelledby` ao elemento interativo.
Na referência isso só funcionava com `value` e o nome ficava no container.
O catálogo compara o uso controlado e testa a correção separadamente.

Outras diferenças intencionais: contraste de texto em variantes de estado e na
caption; headings de CardTitle/AlertTitle em h2; viewport do ScrollArea focável;
animações/transições dos componentes respeitam movimento reduzido. São correções
da biblioteca, não alterações já aplicadas no produto.

Para cada fluxo: captura anterior, migração, tipos/build, teclado/foco, loading,
disabled, erro e submissão real; captura posterior com os mesmos dados, largura e tema.
Conferir foco de retorno dos portais, contraste e área de toque.

## Limitações explícitas

- `Input.focusColor` legado monta classes dinamicamente; valores não incluídos pelo
  Tailwind não geram CSS. Não tratá-lo como API arbitrária de cor: usar tema/tokens e
  conferir o resultado. A extração preserva a assinatura, não corrige o produto silenciosamente.
- Modo escuro é referência técnica, **não superfície liberada para adoção**.
  O Input herdado ainda usa fundo branco com texto do tema, incompatível em escuro.
  A auditoria de acessibilidade desta entrega cobre claro e tema de cliente em base
  clara; o comparativo escuro não é aprovação para ativá-lo.
- Mobile preserva a geometria-base para comparação. O alvo de toque de 44px e
  texto de campo de 16px devem ser aplicados na composição móvel antes de liberar
  um fluxo de toque; os defaults administrativos de 40px/14px não os substituem.
- Componentes do domínio e wrappers específicos continuam no Platform.
- Nenhuma alteração, instalação ou publicação do consumidor integra esta entrega.
