# Feedback e recuperação

Status: draft, fixture de setembro de 2026. Nenhuma migração de produto.

`InlineNotice`, `Banner` e `Toast` são composições controladas do pacote. Não
fazem rede, não mantêm fila, não excluem dados e não removem mensagens por tempo.
O consumidor controla presença, callbacks e confirmação do resultado. `action`
recebe `label`, `onClick`, `disabled` e `pending`; `onDismiss` apenas solicita
remoção. `severity` aceita info/success/warning/error e não define urgência.

| Contexto                            | Composição e texto PT-BR                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Problema no campo ou seção          | InlineNotice: “Revise o período. A data final precisa vir depois da inicial.”                           |
| Estado que afeta o contexto inteiro | Banner: “Você está offline. Seu rascunho está preservado nesta página. Reconecte para salvar.”          |
| Resultado confirmado                | Toast: “3 de 3 itens publicados.”                                                                       |
| Resultado parcial                   | Toast: “2 de 3 itens publicados. Falhou: Cultura.” Ação: “Tentar novamente 1 item”.                     |
| Sem permissão                       | Banner: “Sua permissão de edição foi removida. Solicite acesso ao administrador.”                       |
| Conflito                            | InlineNotice: “Outra versão foi salva.” Ações explícitas: “Manter meu rascunho” / “Usar versão remota”. |
| Carregamento                        | “Salvando alterações…”; botão com pending, largura estável e nova execução bloqueada.                   |
| Vazio inicial                       | “Nenhum conteúdo criado.” Ofereça “Criar conteúdo” somente com permissão e implementação.               |
| Busca vazia                         | “Nenhum resultado para este filtro.” Ação: “Limpar filtros”.                                            |
| Erro recuperável                    | “Não foi possível salvar. Seu rascunho foi preservado.” Ação: “Tentar novamente”.                       |

Indique objeto, escopo e contagem: “Excluir 1 item definitivamente?” em vez de
“Tem certeza?”. Arquivamento reversível oferece Desfazer; exclusão permanente
usa confirmação, impacto explícito e foco inicial em Cancelar. Enquanto pendente,
bloqueie confirmação duplicada, cancelamento e fechamento por Escape ou fora.
Só feche com sucesso após acknowledgement. Falha mantém contexto e retry.
Quando o acionador desaparece ou fica desabilitado, devolva foco a um destino
persistente. A aplicação continua responsável por autorização no servidor e por
idempotência; desabilitar botões não é uma barreira de segurança.

Um evento tem um único dono de anúncio. `announcement="polite"` usa status para
resultados rotineiros; `assertive` usa alert apenas quando a pessoa precisa saber
imediatamente. `off` é conteúdo estático ou duplicação visual de um anúncio
feito em outro lugar. Não repita a mesma mensagem em toast, inline e contador
vivos. O título e a descrição compõem um anúncio atômico; ícones são decorativos.
Severity comunica também por texto/ícone, nunca só cor. Mensagens existentes no
HTML inicial podem não ser anunciadas: consumidores que exigem essa garantia
devem montar primeiro uma região vazia e atualizar seu conteúdo. Testes DOM não
substituem validação com leitor de tela. Não autoexpirar ações de recuperação.

`RecoveryDemo` é exclusivamente Storybook/teste: rascunho, offline, permissões,
conflito, arquivo e lote vivem em memória. Recarregar perde esse estado. “Salvar”
confirma apenas a gravação simulada; não promete persistência em servidor. Exclusão
e lote aceitam callbacks assíncronos para comprovar pending, falha e confirmação;
na ausência deles a fixture responde imediatamente, sem timers. A simulação de
lote falha em Cultura na primeira tentativa e repete somente IDs falhos. A versão
remota apresentada também é simulada; escolher a versão local preserva o texto e
a gravação exige outra ação explícita. Condições simuladas ficam bloqueadas durante
uma operação; um produto real precisa tratar revogação e conflito no servidor.
