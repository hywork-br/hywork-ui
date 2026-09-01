# Avatar

## Propósito

Representar uma pessoa com foto e fallback determinístico por iniciais.

## Quando usar e quando evitar

Use quando identidade pessoal ajuda a leitura. Evite avatar decorativo, imagem sem nome ou foto como única identificação.

## Anatomia e slots

Raiz, imagem opcional e fallback de até duas iniciais.

## API e defaults

`name` obrigatório, `src` e `alt` opcionais, `size="md"`; tamanhos sm/md/lg.

## Variantes e estados

Imagem carregada, imagem quebrada, fallback e três tamanhos.

## Tokens consumidos

Superfície accent, foreground, borda, tipografia e escala de tamanho.

## Admin, portal e mobile

Mesmas proporções nas superfícies; escolha do tamanho depende da hierarquia, não do viewport.

## Teclado, foco e acessibilidade

Imagem usa alt com nome; fallback expõe `role="img"` e nome acessível enquanto oculta as iniciais duplicadas.

## Composição e erros comuns

Combine com nome textual em listas críticas. Não transformar Avatar em controle sem um botão/link externo.

## Proveniência, status, owner e migração

Derivado dos avatares dos dois consumidores. Status beta; owners Product Design + Frontend; onda 2 de outubro.
