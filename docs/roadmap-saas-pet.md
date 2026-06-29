# Roadmap SaaS Pet B2B

Este documento orienta a evolucao do sistema para um SaaS de forca de vendas B2B para vendedores de alimentos, insumos e produtos para caes e gatos. O publico principal sao vendedores solos e equipes comerciais que visitam petshops, lojas veterinarias, agropecuarias, banho e tosa e estabelecimentos similares.

Ultima revisao: 29/06/2026.

## Situacao Atual

O produto ja possui uma base funcional que cobre as oito etapas originais. Isso nao significa que todas estejam prontas para producao: parte dos criterios ainda precisa de validacao automatizada, acabamento de UX ou integracoes externas.

Legenda:
- Implementado: fluxo principal existe no sistema.
- Parcial: fluxo principal existe, mas ha entregaveis ou criterios pendentes.
- Pendente: ainda nao ha implementacao identificada.

Resumo:
- Etapa 1 - Fundacao SaaS e dominio pet: parcial.
- Etapa 2 - Catalogo e pedidos B2B: parcial.
- Etapa 3 - Carteira, regioes e equipe: implementado.
- Etapa 4 - Agenda, visitas e roteirizacao: implementado.
- Etapa 5 - Condicoes comerciais, descontos e comissoes: parcial.
- Etapa 6 - Inteligencia comercial e recompra: parcial.
- Etapa 7 - Dashboards e relatorios: parcial.
- Etapa 8 - Planos SaaS e billing: parcial.

## Visao Do Produto

O sistema deve deixar de ser apenas um CRUD comercial generico e passar a operar como um CRM de campo especializado em vendas recorrentes para o mercado pet.

Proposta central:
- Organizar carteira de clientes B2B por vendedor, regiao e potencial.
- Facilitar pedidos recorrentes, recompra e negociacao em visita.
- Dar visibilidade para metas, comissoes, cobertura de rota e clientes inativos.
- Permitir operacao SaaS multiempresa, com planos para vendedor solo e equipes.

## Perfis De Usuario

- Dono da conta: configura empresa, plano, equipe, produtos, regioes e permissoes.
- Admin da equipe: gerencia vendedores, clientes, metas, regioes e acompanha resultados.
- Vendedor: visita clientes, registra interacoes, cria pedidos e acompanha sua carteira.
- Administrador SaaS: gerencia tenants, planos, pagamentos e suporte.

## Etapa 1 - Fundacao SaaS E Dominio Pet

Objetivo: ajustar o produto para falar a linguagem do mercado pet B2B.

Status atual:
- Clientes possuem tipo de estabelecimento, regiao, contato, WhatsApp e observacoes comerciais.
- Produtos possuem especie, categoria, marca, linha, embalagem/peso e SKU.
- Os principais menus e fluxos usam a linguagem de pedidos, equipe, carteira e visitas.
- Pendente consolidar a documentacao do modelo de dados e concluir uma revisao de consistencia da UX dos CRUDs.

Escopo:
- Revisar textos de menus, titulos e labels para o dominio pet.
- Padronizar UX interna dos CRUDs.
- Definir tipos de cliente: petshop, clinica veterinaria, agropecuaria, banho e tosa, distribuidor, outro.
- Definir categorias de produto: racao seca, racao umida, petisco, suplemento, higiene, areia, acessorio, medicamento/insumo, outro.
- Definir campos comerciais basicos por cliente.

Entregaveis:
- Cadastro de cliente com tipo de estabelecimento, regiao, contato principal, WhatsApp e observacoes comerciais.
- Cadastro de produto com especie, categoria, marca, linha, embalagem/peso e SKU.
- Documentacao inicial do modelo de dados.

Criterios de aceite:
- Um vendedor consegue cadastrar um petshop com dados comerciais relevantes.
- Um produto pode ser identificado por categoria, especie e embalagem.
- As telas principais usam linguagem coerente com vendas pet B2B.

## Etapa 2 - Catalogo E Pedidos B2B

Objetivo: transformar pedidos em um fluxo rapido para uso durante visitas.

Status atual:
- Pedido rapido revisado com cliente, catalogo, resumo de itens e resumo comercial.
- Clientes podem iniciar um novo pedido direto pela listagem.
- Tela de pedido aceita cliente pre-selecionado via `customer_id`.
- Cliente selecionado exibe perfil, regiao e preferencia de visita.
- Botao "Repetir ultimo pedido" reaproveita os itens do pedido anterior do cliente.
- Busca de pedidos passou a considerar numero do pedido, nome do cliente e CNPJ.

Escopo:
- Melhorar catalogo de produtos.
- Criar pedido rapido por cliente.
- Permitir repeticao do ultimo pedido.
- Criar resumo comercial antes do envio.
- Gerar PDF ou visual compartilhavel por WhatsApp.

Entregaveis:
- Tela de pedido com busca por produto, quantidade, desconto e subtotal.
- Botao "repetir ultimo pedido".
- Status de pedido: rascunho, enviado, aprovado, faturado, entregue, cancelado.
- PDF/resumo do pedido com dados do cliente, vendedor e itens.

Criterios de aceite:
- O vendedor consegue montar um pedido em poucos cliques durante uma visita.
- O sistema mostra total, desconto e condicao antes de salvar/enviar.
- Um pedido anterior pode ser reutilizado como base para recompra.

## Etapa 3 - Carteira, Regioes E Equipe

Objetivo: suportar vendedores solos e equipes com distribuicao de carteira.

Status atual:
- Clientes pertencem a uma regiao.
- Vendedores recebem regioes, e a carteira do vendedor e derivada dos clientes dessas regioes.
- Cadastro e edicao de cliente trabalham somente com regiao, sem atribuicao direta a vendedor.
- Listagem de clientes permite filtrar carteira por regiao.
- Tela de vendedores abre com tabela da equipe, acao para inserir vendedor e edicao do vendedor selecionado.
- Carteira exibida por vendedor e calculada pela soma dos clientes das regioes atribuidas.
- Menu interno passou a expor "Equipe" e renomeou "Ordens de servico" para "Pedidos".
- Vendedores sem permissao gerencial continuam restritos a propria carteira e regioes atribuidas.
- Planos do tipo Vendedor individual nao exibem nem autorizam cadastro de vendedores; planos do tipo Equipe liberam a gestao da equipe.

Escopo:
- Atribuir regioes a vendedores.
- Diferenciar vendedor solo, admin de equipe e vendedor de equipe.
- Controlar permissoes por papel.

Entregaveis:
- Modulo de regioes integrado a clientes e usuarios.
- Tela de equipe com vendedores, regioes e clientes vinculados.
- Permissoes para visualizar apenas propria carteira quando aplicavel.
- Filtros por vendedor e regiao nas listagens.

Criterios de aceite:
- Um admin consegue distribuir regioes entre vendedores.
- Um vendedor ve sua propria carteira quando nao tem permissao gerencial.
- Um vendedor solo consegue usar o sistema sem precisar configurar equipe.

## Etapa 4 - Agenda, Visitas E Roteirizacao

Objetivo: registrar o trabalho de campo e melhorar cobertura da carteira.

Status atual:
- Agenda de visitas criada com listagem por dia.
- Visitas podem ser agendadas para cliente e vendedor.
- Check-in e check-out registram data, hora e geolocalizacao quando o navegador permitir.
- Visita registra resultado, motivo sem venda, proxima visita e observacoes.
- Agenda lista clientes sem visita recente por janela configuravel.
- Perfil do cliente mostra historico de visitas e ultimos pedidos.

Escopo:
- Criar agenda de visitas.
- Registrar check-in/check-out.
- Registrar resultado da visita.
- Indicar proxima visita.
- Listar clientes sem visita recente.

Entregaveis:
- Calendario ou lista de visitas por dia.
- Check-in com data, hora e opcionalmente geolocalizacao.
- Motivos de visita sem venda: sem estoque, preco, cliente fechado, sem decisor, retorno futuro, outro.
- Historico de visitas no perfil do cliente.

Criterios de aceite:
- O vendedor registra uma visita em campo.
- O gestor identifica clientes sem visita ha X dias.
- O perfil do cliente mostra historico de visitas e pedidos.

## Etapa 5 - Condicoes Comerciais, Descontos E Comissoes

Objetivo: controlar regras comerciais comuns em vendas B2B.

Status atual:
- Condicoes comerciais podem ser configuradas por regra global, cliente, regiao ou tipo de estabelecimento.
- A regra define ajuste de preco, desconto maximo, pedido minimo, prazo de pagamento e percentual de comissao.
- Pedido rapido exibe a condicao aplicada, ajusta preco dos produtos e alerta restricoes antes da finalizacao.
- Backend bloqueia desconto acima do permitido, pedido abaixo do minimo e preco divergente da condicao aplicada.
- Pedido salva condicao comercial, prazo de pagamento, percentual e valor de comissao prevista.
- Relatorio de comissoes mostra valores previstos, realizados e cancelados por periodo.

Escopo:
- Tabela de preco por cliente, regiao ou tipo de cliente.
- Desconto maximo permitido.
- Pedido minimo.
- Prazo de pagamento.
- Comissao por vendedor, produto, categoria ou marca.

Entregaveis:
- Configuracao de condicoes comerciais.
- Alerta de desconto acima do permitido.
- Relatorio de comissao prevista e realizada.
- Campo de condicao de pagamento no pedido.

Criterios de aceite:
- Um pedido respeita regras comerciais configuradas.
- O gestor consegue ver comissoes por periodo.
- O vendedor visualiza restricoes comerciais durante a negociacao.

## Etapa 6 - Inteligencia Comercial E Recompra

Objetivo: aumentar recorrencia e reduzir clientes esquecidos.

Status atual:
- Painel de inteligencia lista clientes sem compra ha 30, 45 e 60 dias.
- Sugestoes de recompra usam o ultimo pedido do cliente como base objetiva.
- Relatorio de mix por cliente mostra produtos comprados e oportunidades do catalogo ainda nao compradas.
- Campanhas comerciais podem ser criadas por produto, marca, categoria ou regiao.
- Painel acompanha aderencia de campanhas por pedidos, clientes impactados e faturamento no periodo.

Escopo:
- Identificar clientes inativos.
- Sugerir recompra baseada no historico.
- Apontar produtos que o cliente ainda nao compra.
- Criar campanhas comerciais.

Entregaveis:
- Dashboard de clientes sem compra ha 30, 45 e 60 dias.
- Sugestao de pedido baseada no ultimo pedido ou media historica.
- Relatorio de mix por cliente.
- Campanhas por produto, marca, categoria ou regiao.

Criterios de aceite:
- O sistema lista clientes com risco de inatividade.
- O vendedor recebe sugestoes objetivas de recompra.
- O gestor consegue acompanhar aderencia a campanhas.

## Etapa 7 - Dashboards E Relatorios

Objetivo: dar visibilidade gerencial para vendedor solo e equipes.

Status atual:
- Dashboard principal passou a aceitar filtros por periodo, vendedor, regiao e categoria.
- KPIs exibem vendas, ticket medio, pedidos, clientes ativos, clientes inativos e flex.
- Gestor visualiza ranking de vendedores por vendas, pedidos e ticket medio.
- Dashboard mostra produtos mais vendidos e quebras por status, regiao, marca e categoria.
- Pedidos recentes respeitam os filtros aplicados.
- Relatorio CSV exporta os pedidos filtrados do dashboard.

Escopo:
- Vendas por periodo.
- Ticket medio.
- Produtos mais vendidos.
- Clientes ativos e inativos.
- Ranking de vendedores.
- Pedidos por status.
- Vendas por regiao, marca e categoria.

Entregaveis:
- Dashboard do vendedor.
- Dashboard do gestor.
- Relatorios exportaveis.
- Filtros por periodo, vendedor, regiao e categoria.

Criterios de aceite:
- O vendedor acompanha sua meta e sua carteira.
- O gestor compara desempenho entre vendedores.
- Os principais indicadores podem ser filtrados por periodo.

## Etapa 8 - Planos SaaS E Billing

Objetivo: preparar comercializacao como SaaS.

Status atual:
- Planos SaaS nao possuem limites quantitativos; as permissoes estruturais sao derivadas do tipo de conta.
- Existem dois tipos de plano: Vendedor individual e Equipe, e o root admin pode cadastrar ofertas dentro desses tipos.
- Cada nivel possui valores mensal, trimestral e semestral configuraveis.
- Tela de assinatura mostra plano e periodo atuais, vencimento e troca de plano para o dono da conta.
- Cadastro publico permite escolher somente Vendedor individual ou Equipe, sem expor valores; ao fim do trial, a assinatura solicita a escolha do plano e do ciclo mensal, trimestral ou semestral. O fluxo sempre cria a empresa com seu usuario proprietario e nao permite criar root admin.
- Toda nova empresa inicia com 14 dias gratuitos registrados em `trial_ends_at`, independentemente do plano e periodo escolhidos; telefone e WhatsApp sao obrigatorios no cadastro.
- Dados cadastrais sao mantidos em Configuracoes > Dados da empresa, sem uma etapa separada de onboarding.
- Middleware bloqueia acesso operacional quando assinatura esta vencida, inativa ou inadimplente.
- Cadastro de vendedores e recursos de regioes respeitam o tipo Individual ou Equipe.
- Gestao de vendedores segue CRUD em telas separadas: tabela paginada, cadastro e edicao; a conta individual acessa diretamente Meu usuario.
- Recursos Pro como condicoes comerciais, comissoes, inteligencia e campanhas respeitam habilitacao do plano.
- Root admin cadastra e edita nome, descricao, tipo de conta e os tres valores de cada plano; trial de 14 dias e permissoes estruturais sao aplicados automaticamente.
- Menu Configuracoes separa Meu usuario, Dados da empresa e Outras configuracoes; permite foto do usuario e logotipo da empresa, enquanto a ultima tela concentra licenca e aparencia do sistema.
- Saldo Flex e unico por empresa; geracao soma credito, desconto consome apenas o saldo disponivel e cancelamento ou exclusao estorna a movimentacao.
- Pedidos validam no servidor preco ajustado, desconto maximo, pedido minimo, prazo, comissao e total dos itens; a prioridade das condicoes comerciais possui cobertura automatizada.
- Cobranca de assinatura via Pix Mercado Pago gera QR Code e copia-e-cola; a licenca so e ativada por webhook assinado e idempotente apos status aprovado.

Escopo:
- Planos por tipo de conta e ciclo de pagamento.
- Controle de assinatura.
- Bloqueio por inadimplencia ou plano expirado.

Sugestao de planos:
- Vendedor unico: 1 vendedor, clientes, produtos, pedidos e agenda simples.
- Equipe: multiplos vendedores, regioes, metas e permissoes.
- Periodos disponiveis para ambos: mensal, trimestral e semestral.

Entregaveis:
- Tela de escolha/gestao de plano.
- Configuracao da empresa centralizada na tela Dados da empresa.
- Valores mensal, trimestral e semestral por plano.
- Tela de assinatura bloqueada/expirada.

Criterios de aceite:
- Uma nova empresa consegue iniciar uso sem configuracao manual do suporte.
- O sistema respeita as permissoes do tipo de conta.
- O admin SaaS consegue gerenciar tenants e assinaturas.

## Backlog Tecnico Transversal

- [ ] Auditar o isolamento multi-tenant em controllers, relacionamentos, rotas e API. Em andamento: clientes, produtos e pedidos revisados.
- [x] Criar testes de Feature para isolamento entre tenants usando o banco MySQL exclusivo de testes.
- [ ] Criar testes de Feature para clientes, produtos, pedidos, visitas e permissoes.
- [ ] Criar testes para permissoes por tipo de plano, trial e bloqueio de assinatura.
- [ ] Padronizar autorizacao por policies ou gates, reduzindo verificacoes dispersas nos controllers.
- [ ] Criar factories e seeds com dados realistas do mercado pet.
- [ ] Revisar responsividade mobile dos fluxos usados em campo.
- [ ] Implementar importacao CSV/Excel de clientes e produtos.
- [ ] Implementar auditoria de alteracoes em pedidos, clientes, condicoes comerciais e precos.
- [ ] Avaliar integracoes futuras: ERP, emissao fiscal, WhatsApp, mapas e gateways de pagamento.

## Pendencias Funcionais Identificadas

- [ ] Definir e implementar metas comerciais por vendedor e periodo.
- [ ] Permitir comissao por produto, categoria ou marca, alem da regra comercial geral.
- [ ] Evoluir a sugestao de recompra para usar media e frequencia do historico.
- [ ] Concluir o fluxo compartilhavel do pedido por WhatsApp.
- [ ] Ampliar exportacoes alem do CSV de pedidos do dashboard.
- [x] Centralizar as informacoes cadastrais em Dados da empresa, sem bloqueio de onboarding.
- [x] Integrar cobranca Pix Mercado Pago e ativacao por webhook assinado.
- [ ] Definir se o MVP controla estoque real ou somente catalogo e preco.
- [ ] Definir se o envio de pedidos sera apenas interno ou integrado a cliente, fornecedor ou ERP.

## Proximo Ciclo Recomendado - Confiabilidade Do MVP

Objetivo: tornar os fluxos ja implementados seguros para validacao com os primeiros usuarios.

Prioridade 1 - Seguranca e isolamento:
- Auditar todas as consultas multi-tenant, inclusive API e rotas com model binding.
- Garantir que um tenant nunca visualize ou altere dados de outro tenant.
- Cobrir os cenarios com testes automatizados.

Prioridade 2 - Fluxos comerciais criticos:
- Testar criacao e repeticao de pedido, descontos, pedido minimo e calculo de comissao.
- Testar carteira por regiao, permissoes de vendedor e operacoes de visita.
- Testar permissoes por tipo de conta, trial e bloqueios de assinatura.

Prioridade 3 - Operacao piloto:
- Criar seeds demonstrativos do mercado pet.
- Revisar as telas de pedido, cliente, agenda e check-in em dispositivos moveis.
- Documentar configuracao inicial e roteiro de homologacao.

Prioridade 4 - Fechamento das lacunas do MVP:
- Implementar metas comerciais.
- Concluir compartilhamento de pedido.
- Decidir o escopo de estoque e integracoes antes de expandir o dominio.

## Criterio Para Encerrar O Proximo Ciclo

- Suite automatizada cobrindo os fluxos comerciais e SaaS criticos.
- Isolamento multi-tenant validado por testes negativos.
- Jornada principal utilizavel em celular sem bloqueios de layout.
- Ambiente demonstrativo populado com dados coerentes do mercado pet.
- Checklist de homologacao executado para dono da conta, admin e vendedor.
