const statusServico = [
    { value: "1", label: "Ordem Aberta" },
    { value: "2", label: "Ordem Fechada" },
    { value: "3", label: "Orçamento Gerado" },
    { value: "4", label: "Orçamento Aprovado" },
    { value: "5", label: "Executando reparo" },
    { value: "6", label: "(CA)Serviço concluído" },
    { value: "7", label: "(CN)Serviço concluído" },
    { value: "8", label: "Entregue ao cliente" },
];

const rolesUser = [
    { value: '1', label: "Administrador" },
    { value: '2', label: "Usuário" },
    { value: '3', label: "Técnico" },
];

const statusUser = [
    { value: 'active', label: "Ativo" },
    { value: 'inactive', label: "Inativo" },
];

const movimentosProdutos = [
    { value: '1', label: "Entrada" },
    { value: '2', label: "Saída" },
];

const unidadesProdutos = [
    { value: '1', label: "Unidade" },
    { value: '2', label: "Caixa" },
    { value: '3', label: "Metros" },
    { value: '4', label: "Kg" },
    { value: '5', label: "Litros" },
];

const tiposProdutos = [
    { value: '1', label: "Novo" },
    { value: '2', label: "Usado" },
    { value: '3', label: "Seminovo" },
    { value: '4', label: "Remanufaturado" },
];

const statusAgenda = [
    { value: '1', label: "Aberta" },
    { value: '2', label: "Em atendimento" },
    { value: '3', label: "Fechada" },
];

const statusMessage = [
    { value: '1', label: "Não lida" },
    { value: '2', label: "Lida" },
];

const statusOrcamento = [
    { value: '1', label: "Ordem Aberta" },
    { value: '3', label: "Orçamento Gerado" },
    { value: '4', label: "Orçamento Aprovado" },
];

const statusSaas = [
    { value: '1', label: "Ativo" },
    { value: '2', label: "Inativo" },
    { value: '3', label: "Trial" },
    { value: '5', label: "Pausado" },
    { value: '6', label: "Vence em 5D" }
];

export {
    statusServico,
    statusUser,
    rolesUser,
    movimentosProdutos,
    unidadesProdutos,
    tiposProdutos,
    statusAgenda,
    statusMessage,
    statusOrcamento,
    statusSaas
};