# Accordion

`Accordion` organiza configurações ou conteúdo secundário em painéis expansíveis com uma gramática compartilhada. `type="single"` mantém uma seção aberta; `type="multiple"` permite comparar seções. Em modo single, `collapsible` controla se o painel aberto pode ser fechado sem abrir outro.

`AccordionItem` recebe um `value` estável. `AccordionTrigger` é um botão nativo com `aria-expanded` e `aria-controls`; `AccordionContent` é uma região nomeada por `aria-labelledby`. Etapas futuras não devem ficar escondidas atrás dele quando isso impedir descoberta ou foco por teclado.

O componente não cria campos, regras de negócio, persistência ou chamadas de rede. O estado pode ser controlado ou inicializado por `defaultValue`; `onValueChange` informa a nova string ou lista de strings. Itens desabilitados continuam visíveis e não podem ser abertos.

## Propósito

Revelar conteúdo secundário com uma interação previsível e preservando contexto de teclado e leitor de tela.

## Quando usar e quando evitar

Use para grupos de configurações e detalhes longos. Evite esconder uma ação primária ou informação necessária para decidir.

## Anatomia e slots

`Accordion` envolve `AccordionItem`, `AccordionTrigger` e `AccordionContent`; cada item precisa de um `value` estável.

## API e defaults

O padrão é `type="single"`, `collapsible=false` e estado não controlado por `defaultValue`. `value` torna o estado controlado.

## Variantes e estados

Suporta modo single/multiple, item desabilitado e estados `open`/`closed` expostos para estilo.

## Tokens consumidos

Usa tokens de superfície, borda, texto e foco compartilhados pelos controles em `tokens/componentes.css`.

## Admin, portal e mobile

Conserva a mesma hierarquia visual no admin e no portal; o conteúdo ocupa uma coluna em mobile.

## Teclado, foco e acessibilidade

O trigger é botão nativo, mantém `aria-expanded`, `aria-controls`, região nomeada e foco visível.

## Composição e erros comuns

Não coloque campos obrigatórios sem indicação fora do painel nem faça o consumidor duplicar o toggle no `onClick`.

## Proveniência, status, owner e migração

Contrato draft, owner Hywork Product Design + Hywork Frontend; adoção prevista para a wave 2 após validação nos consumidores.
