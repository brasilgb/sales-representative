<?php

/*
|--------------------------------------------------------------------------
| Módulos adicionais
|--------------------------------------------------------------------------
|
| Catálogo dos módulos que podem ser contratados por tenant, somados à
| assinatura vigente. Cada entrada define o rótulo exibido no painel e os
| valores por ciclo de cobrança (em meses: 1 = mensal, 6 = semestral,
| 12 = anual), alinhados aos ciclos já suportados pelos planos do VetorPet.
|
*/

return [

    'pest_control' => [
        'label' => 'Controle de Pragas',
        'prices' => [
            1 => 30.00,
            6 => 162.00,
            12 => 288.00,
        ],
    ],

];
