# Contribuir

Repo pequeno, regra curta.

## Antes de abrir PR

```bash
npm run check    # silencioso = ok
npm run preset   # se mexeu em semantico.css: regenera as duas pontes
```

O CI roda o `check`, e as duas pontes são verificadas com `--check`: gerado
desatualizado reprova. **São duas** — o preset do v3 e o tema do v4 saem da mesma
fonte, e regenerar só uma é como a ponte do v4 ficou 34 tokens atrás da
semântica sem ninguém notar.

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

Distribuição é por **tag git**, sem npm. Ao mergear algo que consumidor percebe:

1. Escreva no `CHANGELOG.md`.
2. `git tag -a vX.Y.Z -m "..."` e `git push origin vX.Y.Z`.
3. **Nunca mova uma tag publicada** — ela é o único imutável que o consumidor
   tem. Errou, publica a próxima.

## O que NÃO entra aqui

Componente React (ainda não — ver o plano de design system), ícone, e qualquer
coisa específica de um produto. Se serve só a um consumidor, mora nele.
