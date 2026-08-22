Atue como arquiteto e desenvolvedor mobile sênior responsável por implementar no aplicativo do VetorPet o módulo de campo “Controle de Pragas”.

O aplicativo deverá consumir as APIs do módulo Laravel do VetorPet e funcionar em locais com internet instável ou totalmente offline.

ANTES DE ALTERAR O CÓDIGO

1. Analise toda a estrutura do aplicativo existente.
2. Identifique:
   - React Native puro ou Expo;
   - versão do SDK;
   - navegação;
   - autenticação;
   - armazenamento seguro;
   - banco local;
   - cliente HTTP;
   - gerenciamento de estado;
   - formulários;
   - câmera;
   - localização;
   - assinatura;
   - sincronização;
   - notificações;
   - build Android;
   - testes.
3. Reutilize os componentes, tema, sessão e arquitetura existentes.
4. Não crie outro aplicativo se o VetorPet já possuir uma base mobile adequada.
5. Não presuma bibliotecas. Primeiro confirme o que o projeto usa.
6. Apresente o diagnóstico e o plano de arquivos antes da implementação.
7. Implemente em etapas pequenas e testáveis.

REGRA DE VISIBILIDADE

O módulo possui a chave:

pest_control

Depois do login, o aplicativo deverá consultar os módulos autorizados pela API.

Se o módulo não estiver ativo para o tenant:

- não mostrar menu;
- não mostrar telas;
- não registrar rotas acessíveis;
- não mostrar mensagens de upgrade;
- não manter dados locais do módulo;
- não permitir sincronização;
- não indicar que o módulo existe.

Além do módulo ativo, o usuário precisa ter as permissões necessárias.

OBJETIVO DO APLICATIVO

Permitir que o técnico:

- consulte sua agenda;
- acesse dados da visita offline;
- faça check-in;
- capture localização;
- revise os pontos de controle;
- registre consumo e ocorrências;
- fotografe evidências;
- registre produtos e trocas;
- faça check-out;
- obtenha a assinatura do responsável;
- sincronize os dados com segurança.

TELAS INICIAIS

- Agenda de visitas;
- Detalhes da visita;
- Check-in;
- Lista de pontos;
- Inspeção do ponto;
- Ocorrências e evidências;
- Resumo da visita;
- Assinatura e aceite;
- Check-out;
- Sincronização;
- Histórico local;
- Pendências e erros.

AGENDA

Exibir:

- cliente;
- estabelecimento;
- endereço;
- horário;
- tipo de serviço;
- status;
- distância, quando disponível;
- indicador de dados baixados;
- situação da sincronização.

Permitir abrir o endereço no aplicativo de mapas instalado, sem acoplar a operação a um fornecedor específico.

CHECK-IN

Ao tocar em “Fazer check-in”:

- solicitar permissão de localização;
- capturar latitude e longitude;
- capturar precisão;
- registrar data e hora;
- gerar UUID do evento;
- vincular usuário, aparelho e visita;
- salvar imediatamente no banco local;
- enviar à API quando houver internet.

Se estiver fora do raio:

- informar a divergência;
- solicitar justificativa;
- permitir continuar;
- marcar o evento para auditoria.

Se o GPS falhar:

- permitir nova tentativa;
- apresentar orientação clara;
- permitir justificativa quando a operação não puder esperar;
- nunca inventar coordenadas.

INSPEÇÃO DOS PONTOS

Apresentar os pontos previamente cadastrados e o progresso:

- revisados;
- pendentes;
- ocorrências;
- substituições.

Para cada ponto:

- identificação;
- localização;
- categoria;
- produto;
- consumo;
- troca;
- quantidade de vivos;
- quantidade de mortos;
- condição;
- observação;
- foto;
- localização opcional;
- horário;
- justificativa quando não acessível.

Valores iniciais de consumo:

- 0;
- 0,5;
- 1;
- E.

Comportamento:

- 1 deve indicar necessidade de substituição;
- E deve indicar produto estragado e necessidade de substituição;
- campos devem se adaptar à categoria do ponto;
- preservar o preenchimento imediatamente;
- permitir navegação entre pontos sem perder dados;
- destacar pontos incompletos.

EVIDÊNCIAS

Permitir fotos de:

- infestação;
- produto;
- dispositivo;
- dano;
- ponto inacessível;
- situação do local;
- serviço concluído.

Cada foto deve manter:

- UUID;
- visita;
- ponto relacionado;
- data e hora;
- coordenadas disponíveis;
- situação do upload;
- hash ou mecanismo de integridade disponível.

Comprimir imagens adequadamente sem eliminar detalhes necessários para comprovação.

CHECK-OUT

Antes do check-out, mostrar:

- total de pontos;
- pontos revisados;
- pontos pendentes;
- ocorrências;
- trocas;
- produtos utilizados;
- fotos;
- observações.

Não concluir se houver pontos obrigatórios pendentes, salvo com justificativa.

No check-out registrar:

- data e hora;
- localização;
- precisão;
- duração da visita;
- UUID;
- situação online/offline.

ASSINATURA DO RESPONSÁVEL

Apresentar o resumo antes da assinatura.

Registrar:

- nome;
- função/cargo;
- documento opcional;
- ressalvas;
- aceite do texto de conformidade;
- assinatura desenhada na tela;
- data e hora;
- localização;
- versão da visita aceita.

A pessoa deve poder limpar e refazer a assinatura antes de confirmar.

Depois da confirmação:

- bloquear alterações silenciosas;
- qualquer correção posterior deverá gerar nova versão;
- mostrar confirmação de que o registro foi salvo;
- não depender de internet para concluir a assinatura.

FUNCIONAMENTO OFFLINE

O aplicativo deverá funcionar offline durante toda a visita.

Armazenar localmente:

- agenda baixada;
- estabelecimentos;
- pontos;
- produtos;
- formulário;
- check-in;
- inspeções;
- fotos;
- check-out;
- assinatura;
- eventos de auditoria.

Cada operação deve possuir UUID.

A interface deve mostrar claramente:

- salvo no aparelho;
- aguardando sincronização;
- sincronizando;
- sincronizado;
- conflito;
- erro que exige intervenção.

SINCRONIZAÇÃO

A sincronização deverá:

- ser idempotente;
- retomar após interrupções;
- enviar primeiro dados estruturados;
- enviar fotos separadamente;
- confirmar recebimento no servidor;
- não excluir dados locais antes da confirmação;
- utilizar retentativas com backoff;
- impedir visitas duplicadas;
- registrar erros compreensíveis;
- permitir tentativa manual;
- sincronizar automaticamente quando a internet retornar.

Ordem sugerida:

1. visita e check-in;
2. inspeções;
3. ocorrências;
4. check-out;
5. assinatura;
6. fotos;
7. confirmação final.

Não utilizar “última gravação vence” silenciosamente. Conflitos precisam ser registrados e apresentados para resolução.

LOCALIZAÇÃO E PRIVACIDADE

Capturar localização somente em eventos necessários:

- check-in;
- check-out;
- pontos configurados;
- fotos/evidências, quando permitido.

Não implementar rastreamento contínuo do técnico fora da execução da visita.

Registrar a precisão do GPS. Uma coordenada sem precisão não deve ser tratada como comprovação absoluta.

SEGURANÇA

- tokens em armazenamento seguro;
- nenhum segredo fixo no aplicativo;
- isolamento por tenant validado pela API;
- dados locais protegidos conforme os recursos da plataforma;
- limpeza segura da sessão;
- remoção dos dados locais conforme política definida;
- validação dos arquivos enviados;
- nenhuma confiança exclusiva no relógio do aparelho;
- registrar horário do aparelho e horário do servidor.

ETAPAS DE IMPLEMENTAÇÃO

Etapa 1:
- diagnóstico do aplicativo;
- definição da arquitetura offline;
- contrato de API;
- modelos locais e estados de sincronização.

Etapa 2:
- controle de disponibilidade do módulo;
- agenda;
- download offline;
- detalhes da visita.

Etapa 3:
- check-in;
- localização;
- validação de raio;
- justificativas.

Etapa 4:
- lista e inspeção dos pontos;
- consumo;
- trocas;
- ocorrências;
- progresso;
- persistência local.

Etapa 5:
- câmera;
- fotos;
- compressão;
- fila de uploads.

Etapa 6:
- resumo;
- assinatura;
- aceite;
- check-out.

Etapa 7:
- sincronização automática;
- retentativas;
- conflitos;
- indicadores e recuperação de erros.

Etapa 8:
- testes offline/online;
- testes de encerramento inesperado;
- testes com GPS indisponível;
- testes de duplicidade;
- testes em aparelho Android real;
- build de homologação.

CRITÉRIOS DE CONCLUSÃO

- módulo invisível sem contratação;
- autenticação compartilhada com VetorPet;
- agenda disponível offline;
- check-in/check-out com localização;
- inspeção de todos os pontos;
- fotos associadas corretamente;
- assinatura offline;
- sincronização idempotente;
- recuperação após interrupções;
- ausência de duplicidades;
- erros apresentados claramente;
- build Android aprovado;
- testes e documentação concluídos.

Ao final de cada etapa:

1. Informe os arquivos criados e alterados.
2. Execute testes, lint, typecheck e build aplicáveis.
3. Relate os resultados.
4. Registre decisões e pendências.
5. Não avance para mudanças estruturais sem apresentar o estado atual.