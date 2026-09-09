# Contratos executáveis do catálogo

`component-contracts.json` distingue `storyContract: "play"` de `"smoke"`.
Smoke significa renderização coberta pelo runner e axe, não interação inventada.
As dez famílias core previamente render-only permanecem smoke; Button e Field
mantêm play. As sete novas famílias draft e a utility de tema exigem play: mudar
apenas o rótulo para smoke reprova o gate. Isso não promove nenhum status.

O gate usa o parser CSF instalado do Storybook (`storybook/internal/csf-tools`).
O subconjunto suportado para play é CSF3 com objeto de story, função inline
(`async` opcional, arrow/function/method) própria ou herdada do objeto meta.
Uma propriedade própria, inclusive `play: undefined`, sobrepõe a do meta.
As chaves simples `play` e `"play"` são equivalentes. O gate resolve a última
propriedade top-level correspondente no AST validado (ordem de execução), sem
usar as annotations parciais do parser para decidir ownership. Meta só fornece
play quando não há essa propriedade própria na story, mesmo se seu valor é undefined.
Generators (inclusive async), getters/setters, chaves computadas/expressões de
propriedade, spreads de story, spreads de meta usados para herança, funções importadas ou
expressões dinâmicas não são resolvidos: o gate falha fechado com diagnóstico.
Para adotar outra sintaxe, estenda o helper com prova de resolução e regressão;
não substitua isso por regex nem por busca textual de `play` no arquivo.
Uma chave computada pode sobrepor play mesmo quando o parser não a registra;
por isso as propriedades do objeto são validadas antes de resolver a herança.
Generators não executam o corpo ao serem chamados e não são plays suportados.

Presença callable não prova a qualidade da interação. O runner oficial executa
as stories em Chromium e Firefox com axe; testes nativos verificam os caminhos
de teclado e reduced motion. Revisão humana continua avaliando asserções reais.

Specs de utility têm título, conteúdo e todos os exports registrados documentados;
famílias mantêm o contrato de dez seções. O teste de mutação executa o CLI real em
cópias temporárias, exige RED na perda e GREEN na restauração. Ele remove apenas
`NODE_TEST_CONTEXT` do ambiente filho e verifica que o catálogo foi executado:
herdar esse marcador pode fazer Node pular silenciosamente um runner aninhado.
