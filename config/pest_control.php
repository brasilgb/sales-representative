<?php

/*
|--------------------------------------------------------------------------
| Controle de Pragas — configuração de domínio
|--------------------------------------------------------------------------
|
| Permissões finas do módulo (concedidas por usuário, ver
| App\Services\PestControl\PestControlPermissions) e listas padrão semeadas
| para cada tenant na contratação (ver App\Services\PestControl\PestControlProvisioner).
| Isso é modelagem, não regra fixa: cada tenant pode editar/estender suas
| próprias categorias, tipos de consumo e pragas depois da semeadura inicial.
|
*/

return [

    'permissions' => [
        'pest_control.access' => 'Acessar o módulo',
        'pest_control.dashboard.view' => 'Ver dashboard',
        'pest_control.units.view' => 'Ver estabelecimentos',
        'pest_control.units.manage' => 'Gerenciar estabelecimentos',
        'pest_control.points.view' => 'Ver pontos de controle',
        'pest_control.points.manage' => 'Gerenciar pontos de controle',
        'pest_control.visits.view' => 'Ver visitas',
        'pest_control.visits.create' => 'Criar visitas',
        'pest_control.visits.edit' => 'Editar visitas',
        'pest_control.visits.approve' => 'Aprovar visitas',
        'pest_control.reports.view' => 'Ver relatórios',
        'pest_control.reports.export' => 'Exportar relatórios',
        'pest_control.operators.manage' => 'Gerenciar técnicos/operadores',
        'pest_control.settings.manage' => 'Gerenciar configurações do módulo',
    ],

    'default_point_categories' => [
        ['key' => 'roedores', 'name' => 'Roedores'],
        ['key' => 'moscas', 'name' => 'Moscas'],
        ['key' => 'insetos', 'name' => 'Insetos'],
    ],

    'default_consumption_types' => [
        ['key' => 'bloco', 'name' => 'Bloco'],
        ['key' => 'sache', 'name' => 'Sachê'],
        ['key' => 'po', 'name' => 'Pó'],
        ['key' => 'atrativo', 'name' => 'Atrativo'],
        ['key' => 'fita_adesiva', 'name' => 'Fita adesiva'],
        ['key' => 'armadilha_biologica', 'name' => 'Armadilha biológica'],
        ['key' => 'armadilha_adesiva', 'name' => 'Armadilha adesiva'],
    ],

    /*
    |----------------------------------------------------------------------
    | Visitas técnicas (Etapa 4)
    |----------------------------------------------------------------------
    |
    | Sugestões exibidas nos formulários de agenda/inspeção. Diferente das
    | categorias de ponto e tipos de consumo, não são semeadas por tenant
    | (não têm cadastro próprio ainda): são só uma lista de apoio no
    | frontend, e o campo aceita qualquer texto livre.
    |
    */

    'default_service_types' => [
        'Manutenção',
        'Dedetização',
        'Desratização',
        'Instalação',
        'Inspeção',
        'Outros',
    ],

    'default_device_conditions' => [
        'Íntegro',
        'Danificado',
        'Ausente',
        'Sujo',
        'Substituído',
    ],

];
