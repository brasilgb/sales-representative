Atue como arquiteto e desenvolvedor sênior responsável por implementar o módulo adicional “Controle de Pragas” dentro do VetorPet existente.

IMPORTANTE

Este não será um sistema independente. O módulo deve utilizar integralmente a infraestrutura, autenticação, multitenancy, usuários, permissões, layout, componentes, banco, armazenamento, auditoria, cobrança e processo de deploy já existentes no VetorPet.

Antes de alterar qualquer arquivo:

1. Analise completamente a estrutura atual do projeto.
2. Leia README, documentação interna e AGENTS.md/CLAUDE.md, se existirem.
3. Identifique:
   - versões do Laravel, PHP, React, Inertia e banco;
   - autenticação atual;
   - estrutura de tenants/empresas;
   - usuários, roles e permissões;
   - planos, assinaturas, pagamentos e faturas;
   - componentes visuais e padrão do menu;
   - geração de PDFs;
   - exportações;
   - armazenamento de imagens;
   - auditoria e logs;
   - APIs utilizadas por aplicativos;
   - testes e processo de deploy.
4. Não crie estruturas paralelas quando existir funcionalidade equivalente.
5. Antes da implementação, apresente um relatório curto da arquitetura encontrada e dos arquivos que serão alterados.
6. Não implemente tudo de uma vez. Trabalhe por etapas pequenas, testáveis e reversíveis.

OBJETIVO

Criar um módulo adicional de Controle de Pragas integrado ao VetorPet, vendido separadamente e somado ao plano atual do cliente.

REGRA DE DISPONIBILIDADE

O módulo terá a chave:

pest_control

Somente o rootAdmin poderá contratar, ativar, suspender, cancelar ou reativar o módulo para um tenant.

Quando o módulo não estiver ativo:

- não deve aparecer no menu;
- não deve aparecer no dashboard;
- não devem aparecer permissões relacionadas;
- não devem existir atalhos, mensagens ou sugestões;
- as rotas internas devem permanecer inacessíveis;
- endpoints da API devem negar acesso;
- o aplicativo não deve receber indicação de que o módulo existe;
- usuários comuns não devem encontrar indícios do módulo.

Não basta esconder componentes no frontend. O backend deve validar o módulo ativo em todas as rotas, serviços, consultas e endpoints.

COBRANÇA

O Controle de Pragas será um adicional da assinatura atual do VetorPet.

Valores inicialmente definidos:

- mensal: R$ 30,00;
- semestral: R$ 162,00;
- anual: R$ 288,00.

Regras:

- manter uma única assinatura;
- manter um único vencimento;
- somar o adicional ao plano vigente;
- discriminar o módulo na cobrança;
- permitir cálculo proporcional quando ativado durante um ciclo;
- cancelamento remove o adicional das cobranças futuras;
- suspensão ou cancelamento não apaga os dados;
- reativação recupera todo o histórico.

Antes de implementar, verifique como o VetorPet representa planos, assinaturas, pagamentos e recursos contratados. Adapte o módulo ao modelo existente.

PERMISSÕES

A contratação pertence ao tenant, mas o acesso depende também da permissão do usuário.

Permissões iniciais:

- pest_control.access
- pest_control.dashboard.view
- pest_control.units.view
- pest_control.units.manage
- pest_control.points.view
- pest_control.points.manage
- pest_control.visits.view
- pest_control.visits.create
- pest_control.visits.edit
- pest_control.visits.approve
- pest_control.reports.view
- pest_control.reports.export
- pest_control.operators.manage
- pest_control.settings.manage

O tenant sem o módulo ativo nunca poderá acessar os recursos, mesmo que exista uma permissão atribuída ao usuário.

FUNCIONALIDADES DO PAINEL

Adicionar a área Controle de Pragas, exibida somente quando autorizada:

- Dashboard;
- Agenda de visitas;
- Estabelecimentos/unidades;
- Pontos de controle;
- Visitas técnicas;
- Técnicos/operadores;
- Produtos;
- Pragas e categorias;
- Relatórios;
- Sincronizações;
- Configurações.

REAPROVEITAMENTO DE CADASTROS

Antes de criar novas tabelas:

- verificar se clientes, empresas, unidades, endereços e usuários existentes podem ser reutilizados;
- evitar duplicação de estabelecimentos e operadores;
- relacionar escolas, aviários, frigoríficos e demais locais ao cadastro existente;
- manter todas as informações isoladas por tenant.

ESTABELECIMENTOS E UNIDADES

Devem suportar:

- razão social/nome;
- CNPJ/CPF;
- endereço;
- responsável;
- telefone;
- latitude e longitude;
- raio permitido para check-in;
- situação ativa/inativa;
- código interno;
- observações;
- histórico de visitas;
- pontos de controle vinculados.

PONTOS DE CONTROLE

Cada estabelecimento poderá possuir pontos previamente cadastrados.

Campos iniciais:

- tenant;
- estabelecimento/unidade;
- código ou número;
- identificação/localização;
- categoria de controle;
- produto padrão;
- latitude/longitude opcional;
- fotografia opcional;
- instruções;
- ordem de exibição;
- obrigatório ou opcional;
- ativo/inativo.

Categorias identificadas nos documentos:

- roedores;
- moscas;
- insetos;
- outras categorias configuráveis.

Não fixar todas as regras diretamente no código. Preparar modelagem extensível para novos tipos de pontos e formulários.

VISITAS TÉCNICAS

Cada visita deverá possuir:

- UUID;
- tenant;
- estabelecimento;
- técnico;
- agendamento;
- tipo de serviço;
- status;
- check-in;
- localização do check-in;
- precisão do GPS;
- check-out;
- localização do check-out;
- duração;
- observações;
- resumo;
- assinatura;
- responsável que deu o aceite;
- fotos e anexos;
- versão do formulário;
- estado da sincronização;
- trilha de auditoria.

Estados iniciais:

- agendada;
- rascunho;
- em andamento;
- concluída;
- sincronizada;
- validada;
- cancelada.

INSPEÇÃO DOS PONTOS

Para cada ponto revisado, registrar:

- data e hora;
- técnico;
- ponto de controle;
- produto utilizado;
- tipo de consumo;
- valor do consumo;
- troca realizada;
- pragas encontradas;
- quantidade de vivos;
- quantidade de mortos;
- condição do dispositivo;
- observação;
- fotografia;
- localização;
- justificativa quando não inspecionado.

Legendas inicialmente identificadas:

- 0: sem consumo;
- 0,5: consumo de até meio bloco ou sachê;
- 1: consumo superior a meio bloco ou sachê, exigindo substituição;
- E: produto estragado pelo tempo, exigindo substituição.

A modelagem deverá suportar também:

- bloco;
- sachê;
- pó;
- atrativo;
- fita adesiva;
- armadilha biológica;
- armadilha adesiva;
- outros tipos futuramente cadastrados.

Não salvar somente o PDF final. Cada inspeção deve ser persistida de forma estruturada para permitir consultas e indicadores.

CHECK-IN E LOCALIZAÇÃO

O backend deve receber e validar:

- horário informado pelo aparelho;
- horário de recebimento pelo servidor;
- latitude;
- longitude;
- precisão;
- aparelho;
- versão do aplicativo;
- situação online/offline;
- distância calculada do estabelecimento;
- justificativa para divergência.

A distância fora do raio não deve necessariamente bloquear o serviço. Deve permitir justificativa e gerar uma ocorrência para auditoria.

ASSINATURA E ACEITE

Registrar:

- nome do responsável;
- função/cargo;
- documento opcional;
- assinatura capturada;
- data e hora;
- localização;
- texto de conformidade aceito;
- observações ou ressalvas;
- hash ou identificação da versão da visita assinada.

Após o aceite, alterações devem gerar nova versão e preservar o histórico anterior.

PÁGINA PÚBLICA

Criar uma página pública de comprovação por token ou QR Code.

Exemplo:

/comprovante/{token}

Exibir somente informações autorizadas:

- estabelecimento;
- data;
- empresa prestadora;
- técnico;
- tipo de serviço;
- situação;
- número do comprovante;
- resumo;
- validação da autenticidade.

O token deve ser:

- aleatório;
- não sequencial;
- revogável;
- protegido contra enumeração.

Registrar data e hora das verificações públicas sem coletar dados pessoais desnecessários.

RELATÓRIOS

Implementar:

- relatório individual da visita em PDF;
- planilha de controle semelhante aos modelos enviados;
- relatório por período;
- histórico por estabelecimento;
- histórico por ponto;
- ocorrências;
- consumo;
- trocas;
- capturas;
- produtividade por técnico;
- pontos não revisados;
- exportação CSV;
- exportação XLSX.

Filtros:

- período;
- estabelecimento;
- unidade;
- técnico;
- categoria;
- produto;
- status;
- ocorrência.

APIS PARA O APLICATIVO

Criar endpoints versionados para:

- autenticação;
- módulos autorizados;
- perfil do técnico;
- agenda;
- estabelecimentos;
- pontos;
- produtos;
- download dos dados para uso offline;
- check-in;
- envio das inspeções;
- fotos;
- assinatura;
- check-out;
- sincronização;
- consulta da situação da sincronização.

Requisitos:

- UUID criado no dispositivo;
- idempotência;
- prevenção de duplicidade;
- sincronização incremental;
- controle de versão;
- paginação;
- validação por tenant;
- autorização por usuário;
- registro de conflitos;
- respostas apropriadas para operação offline.

SEGURANÇA

Toda consulta deve aplicar isolamento por tenant no servidor.

Também implementar:

- validação de arquivos;
- limites para imagens;
- autorização por policy/middleware;
- proteção de dados da assinatura;
- logs sem exposição de informações sensíveis;
- rate limiting nos endpoints públicos;
- auditoria das ações administrativas;
- proteção contra IDOR;
- testes de tentativa de acesso entre tenants.

ETAPAS DE IMPLEMENTAÇÃO

Etapa 1:
- diagnóstico da arquitetura atual;
- proposta de integração;
- identificação dos componentes reaproveitáveis.

Etapa 2:
- estrutura genérica de módulos adicionais;
- ativação pelo rootAdmin;
- integração com assinatura e cobrança;
- middleware/policies de acesso;
- testes de invisibilidade e bloqueio.

Etapa 3:
- migrations e models;
- estabelecimentos/unidades;
- pontos, produtos e categorias;
- permissões e auditoria.

Etapa 4:
- agenda e visitas;
- inspeções;
- check-in/check-out;
- localização;
- evidências;
- assinatura e aceite.

Etapa 5:
- APIs móveis versionadas;
- idempotência;
- sincronização;
- upload de fotos;
- tratamento de conflitos.

Etapa 6:
- dashboards;
- relatórios;
- PDF;
- CSV/XLSX;
- página pública e QR Code.

Etapa 7:
- testes completos;
- testes multitenant;
- testes de permissões;
- documentação da API;
- documentação de implantação.

CRITÉRIOS DE CONCLUSÃO

- módulo invisível para tenant não contratado;
- ativação exclusiva pelo rootAdmin;
- cobrança somada ao plano existente;
- isolamento completo por tenant;
- permissões internas funcionando;
- APIs documentadas;
- visitas e inspeções persistidas;
- check-in/check-out com localização;
- assinatura vinculada à versão da visita;
- PDFs e exportações funcionando;
- página pública validando o comprovante;
- testes, lint, typecheck e build aprovados conforme o projeto.

Ao final de cada etapa:

1. Informe arquivos criados e alterados.
2. Explique as decisões.
3. Execute os testes aplicáveis.
4. Informe resultados e pendências.
5. Aguarde autorização antes de iniciar uma etapa estruturalmente diferente.