# Handoff para engenharia — hywork-plataform

Decisão do Vitor em 17/09/2026: a engenharia começa pelo `hywork-plataform`,
mantendo o design que está em produção e substituindo implementações locais por
componentes do design system. Builder será uma etapa posterior.

## O que está entregue

- Pacote [v0.6.2](https://github.com/hywork-br/hywork-ui/releases/tag/v0.6.2),
  publicado em 16/09/2026, commit `1c63b39178ef17e767878bdac1a16e6776ec676e`.
- [CI desse commit](https://github.com/hywork-br/hywork-ui/actions/runs/35104986826)
  aprovado: tokens, manifesto, tipos, testes, builds, instalação em consumidor,
  dependências, contratos Chromium/Firefox e comparação visual Linux.
- [Storybook](https://hywork-ui-storybook.vercel.app) e
  [Experiments](https://hywork-experiments.vercel.app) com metadata conferido em
  17/09/2026: versão 0.6.2, commit acima e `artifactSha256`
  `b3e1abdac472880e3e5e9a2890aa265cf001d3be77bf03262e4570c7f8bc1005` iguais.
  Esse valor identifica o artefato da demonstração; não deve ser presumido como
  checksum de outro tarball, inclusive o asset do GitHub Release.
- APIs e status em [manifest.json](../manifest.json), contratos em
  [specs/components](../specs/components) e [mapa de imports](import-map.md).

Essas provas são do pacote e das demonstrações. Não comprovam o fluxo integrado,
a aparência do produto atual nem uma migração já publicada. Em 17/09, a leitura
do `package.json` da branch padrão remota de Platform e Builder não encontrou
`@hywork/ui` nas dependências; isso não é um censo de imports nem leitura de deploy.

## Preservação visual é o aceite

A referência é a tela de produção capturada para o fluxo escolhido. Preservar
layout, hierarquia, tipografia, densidade, ações, navegação e marca do cliente.
Uma melhoria perceptível de design ou interação deve ser apresentada e aprovada
explicitamente; não entra embutida na troca de imports.

Experiments é uma proposta separada de evolução de jornadas. Não copiar sua
navegação, modo de foco ou composição de página como requisito desta migração.
O Storybook demonstra como a API do DS se comporta; a comparação com produção
determina o que precisa de compatibilidade ou de decisão de produto.

Os tokens estão `stable`; as famílias core estão `beta`; há componentes,
utilities e seis padrões `draft`. Consulte o status de cada export. Comece pelos
componentes `beta`; API `draft` exige avaliação explícita dos responsáveis antes
de entrar no produto e não muda de status só porque está publicada.

## Primeiro PR do Platform

1. Definir uma feature existente e delimitada, suas rotas e estados. O handoff
   é dirigido a Rick (engenharia) e Luh (produto); registrar os responsáveis
   efetivos e o aceite na PR, sem presumir aprovação a partir deste documento.
2. Registrar o commit do consumidor, capturar a tela atual em desktop/mobile e
   medir imports com `audit-adoption`. Preservar dados e tema para o antes/depois.
3. Instalar a tag e versionar o lockfile:

   ```bash
   npm install "github:hywork-br/hywork-ui#v0.6.2"
   ```

4. Carregar o tema uma única vez, disponibilizar Montserrat e marcar a superfície
   correta (`admin` ou `portal`). Aplicar o contrato de white-label quando houver
   tema de tenant; testar a cascata com o CSS existente. Ver
   [README](../README.md#usar) e [validação de tema](../governance/theme-validation.md).
5. Migrar Button/Field e os demais componentes necessários ao fluxo; mapear props,
   estados e aparência antes de remover a implementação local. Não trocar o shell
   inteiro como parte implícita do piloto.
6. Executar typecheck, build e testes do comportamento afetado no consumidor;
   verificar teclado, foco, validação, loading, vazio, erro/retry e permissões
   aplicáveis. Comparar screenshots posteriores à última edição com o baseline.
7. Registrar exceções e diferenças aprovadas; colher aceite técnico e de
   produto/design. Só expandir a adoção depois do piloto aprovado.

## Pontos de compatibilidade já conhecidos

- O Button local do Platform usa `variant="default"` e `size="default"`;
  a API do DS usa `primary` e `md`. Nomes semelhantes não garantem equivalência.
- No checkout Platform examinado em 17/09, o botão padrão declara `h-10`;
  o DS declara `--hw-control-height: 36px` no admin desktop e 44px no mobile/toque.
  Confira a altura computada no fluxo: uma troca direta pode alterar a densidade.
- Variantes locais como `link`, `success`, `warning`, `error` e `info` não são
  variantes homônimas do Button do DS. Identifique a intenção; não as descarte ou
  converta todas para `primary` sem avaliação.
- `--hw-*` pertence ao DS; `--color-*` pertence à aplicação/tenant. Não sobrescrever
  esses namespaces para forçar paridade. Se a API não preserva um caso necessário,
  registrar a lacuna e corrigir no owner adequado antes de expandir a migração.
- Autenticação, dados, permissões, persistência e regras de negócio permanecem
  no Platform. Adaptadores locais podem mapear a API legada sem criar uma segunda
  implementação visual do componente.

Fontes dos exemplos: `hywork-plataform/src/components/ui/button.tsx` e
`@hywork/ui/src/components/button.tsx`, `tokens/componentes.css`, `tokens/admin.css`.
Revalidar no commit selecionado pela engenharia; estes exemplos não substituem
a captura do produto vivo.

## Critério de conclusão

O primeiro fluxo está pronto quando consome a tag fixada, passa nos gates do
Platform, preserva comportamento e visual comprovados e tem diferenças e
exceções aprovadas pelos responsáveis. Remover cópias apenas quando não houver
imports no escopo migrado. Usar [checklist](october-checklist.md) e
[scorecard](consumer-scorecard.md) na PR.

O dashboard de 01/09 e os planos datados são históricos. A preparação anterior
previa outubro; esta decisão estabelece Platform primeiro e deixa o cronograma
com a engenharia. O handoff não autoriza agentes a migrar, mergear ou publicar
produtos sem uma tarefa atribuída. A atualização documental também não altera
a tag v0.6.2: os documentos dentro dela permanecem na revisão da release.
