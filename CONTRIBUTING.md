# Contribuir

Repo pequeno, regra curta.

## Antes de abrir PR

```bash
npm run check
npm run smoke:consumer
npm run build
npm run audit:dependencies
```

O CI roda os dois, e o preset é verificado com `--check`: gerado desatualizado
reprova.

## Token novo

1. **É cor da marca?** Vai em `tokens/primitivos.css`, e só se existir no
   guideline. Cor que não está lá é **derivado** — vai no bloco de derivados
   com um comentário explicando por que precisou existir.
2. **É papel de interface?** (primária, superfície, foco, estado) Vai em
   `tokens/semantico.css`, referenciando primitivo. **Nunca hex aqui.**
3. **É densidade?** Vai em `admin.css` ou `portal.css`. Essas camadas mudam
   tamanho e espaçamento — **nunca cor ou forma**, que são comuns às duas
   superfícies.
4. Se o token é de texto sobre fundo, **acrescente o par em `PARES`** no
   `check-tokens.mjs`. Par que não está na lista não é verificado.

## Mudar valor existente

Diga no corpo da PR **o que muda na tela** e em quais consumidores. Token é API:
mudar `--hw-primary` repinta três frontends.

## Versão

Distribuição é por **tag git**, sem npm registry. Ao preparar algo que consumidor percebe:

1. Crie um changeset com `npm run changeset`.
2. Aplique a versão com `npm run release:version` e revise o changelog.
3. Depois do merge e da aprovação humana, crie e envie a tag `vX.Y.Z`.
4. O workflow `release` repete checks/build/audit, empacota e anexa o tarball à release.
5. **Nunca mova uma tag publicada** — ela e seu asset são o imutável que o consumidor
   tem. Errou, publica a próxima.

## Componente ou padrão novo

1. Comece pelo teste do contrato de comportamento.
2. Use apenas tokens `--hw-*`; literal visual novo começa no token, não no TSX.
3. Documente estados e teclado no Storybook.
4. Rode `npm run manifest`; edição manual do manifesto reprova no CI.
5. Padrão exige evidência de pelo menos duas features com a mesma necessidade.

## O que não entra aqui

Autenticação, dados, query client, regra de feature, ícone específico de produto
ou componente que serve apenas a um consumidor.
