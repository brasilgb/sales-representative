# Preço Regional com Exceção por Produto — Execução

## 1. Descoberta

### Como o preço funciona hoje

O "ajuste percentual por região" **não é um campo na região**. A região (`regions`, model `Region`) só tem `name`, `description`, `status`. O ajuste percentual vem de `commercial_conditions` (model `CommercialCondition`), que é um mecanismo mais genérico de condição comercial com `scope_type` em `global | customer | region | establishment_type | campaign`, cada um carregando seu próprio `price_adjustment_percentage`, `max_discount_percentage`, `minimum_order_amount`, `minimum_order_quantity`, `payment_terms`, `commission_percentage`.

Resolução por cliente: `CommercialCondition::resolveForCustomer(Customer $customer)` busca todas as condições `active()` cujo escopo bate com o cliente (global sempre bate; `customer` bate pelo `customer_id`; `region` bate por `customer->region_id`; `establishment_type` bate pelo tipo) e escolhe a de maior prioridade: **cliente > região > tipo de estabelecimento > global**. Campanhas (`scope_type = 'campaign'`) têm uma condição própria vinculada à campanha e, quando o produto do item pertence à campanha ativa, essa condição substitui a do cliente **apenas para aquele item** — prioridade máxima, já existente.

`CommercialCondition::adjustedPrice(float $price)` aplica o percentual: `round($price * (1 + pct/100), 2)`.

### Onde o cálculo é feito hoje (duplicado em 3 lugares)

1. `app/Http/Controllers/OrderController.php@store` — cria pedido pela tela (Inertia/web).
2. `app/Http/Controllers/Api/ApiOrderController.php@store` — cria pedido pela API (app de vendas / `sales-app`).
3. `app/Services/OrderUpdateService.php@update` — usado tanto por `OrderController@update` quanto por `ApiOrderController@update` para editar pedido.

Nos três, a lógica é a mesma: escolher a condição do item (`campaign->commercialCondition` se o produto pertence à campanha ativa, senão a condição resolvida do cliente) e aplicar `adjustedPrice()` sobre `product->price`, ou usar `product->price` puro se não houver condição. **É exatamente essa duplicação que o serviço central de precificação elimina.**

O preço resolvido é sempre copiado para `order_items.price` no momento da criação (snapshot) — `OrderItem` não recalcula preço dinamicamente; pedidos existentes não seriam afetados por mudança de configuração posterior. Isso já era o comportamento e foi preservado.

### Telas administrativas relacionadas

- Produto: `resources/js/pages/app/products/{index,create-product,edit-product}.tsx` + `ProductController`.
- Região: `resources/js/pages/app/regions/{index,create-region,edit-region}.tsx` + `RegionController`.
- Condição comercial (onde hoje se cadastra o "ajuste de região"): `resources/js/pages/app/commercial-conditions/*` + `CommercialConditionController`.

### Multitenant

Todo o domínio (`Product`, `Region`, `Customer`, `CommercialCondition`, `Order`) usa a trait `Tenantable`, que aplica um `TenantScope` global (filtra automaticamente por `tenant_id` em toda query) e preenche `tenant_id` na criação a partir do usuário autenticado. Não existe auditoria genérica no app principal (só o módulo `PestControl` tem `AuditLog`, isolado e sem relação com produtos/preços/pedidos).

### Decisão: nova tabela, não reaproveitar `commercial_conditions`

`commercial_conditions` resolve **uma condição por cliente**, aplicada uniformemente a todos os produtos daquele cliente. Ela não tem `product_id` e não pode expressar "este produto específico tem um preço fixo nesta região". Forçar isso nela exigiria uma condição por combinação produto×região com `scope_type` novo e reescrever toda a prioridade cliente>região>estabelecimento>global — universo de mudança bem maior que o necessário e que colidiria com o uso já existente da tabela (negociações por cliente, campanhas). Por isso foi criada a tabela nova `product_region_prices`, dedicada exclusivamente à exceção produto×região, reaproveitando o padrão de `Tenantable`, `decimal(10,2)` para dinheiro e nomenclatura já usados no restante do projeto.

## 2. Decisão arquitetural sobre prioridade (confirmada com o usuário)

O spec descreve só 3 níveis (especial produto×região > % de região > base), mas o sistema real tem também condição de cliente, tipo de estabelecimento, global e campanha. Confirmado com o usuário: **o preço especial produto×região tem prioridade sobre qualquer condição comercial resolvida** (cliente, região, tipo de estabelecimento, global), pois "vale só para a região a que pertence, mas nela vence tudo". A única exceção mantida foi **campanha ativa**, que já tinha prioridade máxima antes desta mudança (é o equivalente ao "Promoção" do roadmap futuro da seção 15 do escopo, que o próprio spec já prevê ficar acima do preço especial produto×região) — não desativar promoções ativas é o comportamento menos arriscado e o mais alinhado ao próprio roadmap do spec. **Ponto para revisão**: se o usuário quiser que o preço especial também vença uma campanha ativa para aquele produto, é uma mudança pequena e localizada (bastaria não zerar `$itemRegion` quando o item pertence à campanha nos 3 pontos de integração).

## 3. Migrations

`database/migrations/2026_09_05_000001_create_product_region_prices_table.php` — cria `product_region_prices`:

```
id
tenant_id   FK nullable -> tenants, cascadeOnDelete   (padrão Tenantable)
product_id  FK -> products, cascadeOnDelete
region_id   FK -> regions, cascadeOnDelete
special_price  decimal(10,2)
is_active   boolean default true
valid_from  timestamp nullable
valid_until timestamp nullable
timestamps

unique(tenant_id, product_id, region_id)
```

`special_price` é `decimal(10,2)` (nunca float), igual ao padrão de `products.price` e `commercial_conditions.*_percentage`. A combinação é única por tenant: existe no máximo um registro de exceção por produto+região — ativar/desativar/reprogramar validade é feito por `update` no mesmo registro (não há histórico multi-linha, ver "pontos de revisão" abaixo).

Migration executada em desenvolvimento (`php artisan migrate --force`), sem erros.

## 4. Backend

### Model `App\Models\ProductRegionPrice`

`Tenantable`; casts (`special_price` decimal:2, `is_active` boolean, `valid_from`/`valid_until` datetime); `scopeActive()` (is_active + janela de validade); `isCurrentlyValid()`. Relações `Product::regionPrices()` e `Region::productPrices()` adicionadas.

### Serviço central — `App\Services\Pricing\RegionalPriceResolver`

Único ponto de cálculo de preço regional do sistema (nenhum outro lugar recalcula):

- `resolve(Product $product, Region $region): array` — visão administrativa (produto×região "pura", sem cliente): retorna `basePrice`, `regionPercentage`, `calculatedRegionalPrice`, `specialPrice`, `effectivePrice`, `source` (`base | regional_percentage | special_region_price`). Usado nas telas de produto e de região.
- `effectivePriceForSale(Product $product, ?Region $region, ?CommercialCondition $condition): float` — usado na venda/pedido: se existir preço especial ativo para produto+região, ele vence (nenhum percentual aplicado sobre ele); senão aplica a condição já resolvida pelo fluxo existente (cliente/região/estabelecimento/global), ou o preço base se não houver condição.
- `activeSpecialPrice(int $productId, int $regionId): ?ProductRegionPrice` — helper único de consulta reaproveitado pelos dois métodos acima.

### Integração nos 3 pontos que calculavam preço (agora delegam ao serviço)

- `OrderController@store`
- `Api\ApiOrderController@store`
- `OrderUpdateService@update` (injeção via construtor, resolvido pelo `app(OrderUpdateService::class)` já usado nos controllers)

Em todos, a região usada é a do cliente (`$customer->region`); para itens de campanha ativa, a região é `null` (não busca preço especial), preservando a prioridade de campanha citada acima.

### CRUD da exceção

- `App\Http\Requests\ProductRegionPriceRequest` — valida `region_id` (existe e pertence ao tenant do usuário + único por produto/tenant, ignorando o registro atual em updates), `special_price` (`numeric`, `min:0` — impede negativo), `is_active`, `valid_from`/`valid_until` (`after_or_equal:valid_from`).
- `App\Http\Controllers\ProductRegionPriceController` — `store` / `update` / `destroy`, autorização igual à de produtos (`canManageTeam()`), com checagem extra de que o `regionPrice` pertence ao `product` da rota.
- Rotas em `routes/app.php` (mesmo grupo/prefixo `app.` dos demais recursos):
  - `POST   /products/{product}/region-prices`
  - `PATCH  /products/{product}/region-prices/{regionPrice}`
  - `DELETE /products/{product}/region-prices/{regionPrice}`

Isolamento de tenant garantido em duas camadas: o `{product}` do binding de rota já é filtrado pelo `TenantScope` (produto de outro tenant → 404) e o `region_id` do payload é validado contra `tenant_id` do usuário autenticado (região de outro tenant → 422 com erro de validação).

### `ProductController::show` e `RegionController::edit`

- `ProductController::show` monta, para cada região ativa, o resultado de `RegionalPriceResolver::resolve()` + os dados do registro de exceção (se existir), e passa como prop `regionPrices` para a tela do produto.
- `RegionController::edit` passa a receber busca (`q`) e pagina (15) os produtos, cada um já resolvido para aquela região via `RegionalPriceResolver::resolve()`, como prop `productPrices` (visão somente leitura, conforme pedido no escopo).

## 5. Frontend

- `resources/js/pages/app/products/edit-product.tsx`: nova seção "Preços por região" (tabela Região | Ajuste | Calculado | Preço especial | Preço efetivo | Ações). Cada linha permite adicionar/editar (preço especial, ativo, validade opcional) ou remover a exceção daquela região, com confirmação de exclusão. Quando o preço especial está em uso, aparece um badge "Preço especial" ao lado do preço efetivo, deixando visualmente claro quando ele está substituindo a regra regional.
- `resources/js/pages/app/regions/edit-region.tsx`: nova seção "Produtos desta região" — tabela paginada e pesquisável (Produto | Base | Calculado | Especial | Final), somente leitura (edição continua pelo cadastro do produto, conforme pedido para não ampliar escopo com edição em massa).

Ambas seguem os componentes/convenções já usados no projeto (`Table`, `Badge`, `AlertDialog`, `Switch`, `AppPagination`, `maskMoney`, `route()`), sem introduzir bibliotecas novas.

## 6. Regra de resolução de preço (resumo final)

```
1. Campanha ativa para o produto           -> mantém comportamento já existente, sem alterações
2. Preço especial Produto×Região ativo     -> vence cliente, região, tipo de estabelecimento e global
3. Condição comercial resolvida do cliente -> percentual aplicado sobre o preço base
4. Nenhuma condição                        -> preço base
```

Validade do preço especial: `is_active = true` E (`valid_from` nulo OU `<= agora`) E (`valid_until` nulo OU `>= agora`); fora disso, cai automaticamente para o passo 3.

## 7. Testes executados

Novo arquivo `tests/Feature/ProductRegionPriceTest.php`, cobrindo os 10 casos pedidos no escopo + 1 teste de ponta a ponta do critério de aceite (seção 17) com snapshot de pedido (seção 11):

1. Produto sem região → preço base.
2. Região +5% sem especial → 100 → 105.
3. Região +5% com especial 102,90 → usa 102,90 (inclusive vencendo uma condição comercial de outro escopo, cenário confirmado com o usuário).
4. Mesmo produto em duas regiões → cada uma resolve independentemente.
5. Especial desativado → volta ao percentual.
6. Especial expirado (`valid_until` passado) e ainda não iniciado (`valid_from` futuro) → volta ao percentual.
7. Região sem percentual cadastrado → preço base.
8. Arredondamento monetário (79,99 × 1,05 = 83,9895 → 83,99).
9. Preço especial negativo → rejeitado na validação (`special_price`).
10. Vínculo com região de outro tenant → rejeitado na validação; produto de outro tenant → 404 (route binding).
11. (Extra, ponta a ponta) Criação de pedido pela rota real: produto com especial na região do cliente usa o especial; o mesmo produto num pedido de cliente de outra região usa o percentual normal; e remover o preço especial depois não altera o item do pedido já criado.

Resultado: `php artisan test` — **200 passed (1429 assertions)**, suite completa (incluindo os 11 novos testes), sem nenhuma regressão nos testes já existentes (`CommercialConditionUniquenessTest`, `TenantIsolationTest`, `ProductStockAdjustmentTest`, etc.).

`vendor/bin/pint --dirty --test` → passou. `npx tsc --noEmit` → sem erros. `npm run build` → build concluído com sucesso (assets de build gerados foram restaurados ao estado original do git depois da verificação, para não sujar o diff com hashes de arquivos que não mudaram de conteúdo fonte).

`npx eslint` nos dois arquivos `.tsx` alterados aponta erros de `no-explicit-any`, mas isso já é pré-existente no projeto: rodando o mesmo lint no `git stash` (código antes desta mudança) os mesmos 2 arquivos já tinham 13 erros de `any`; o projeto inteiro (`npx eslint .`) já falha hoje com 601 problemas na `main`, sem relação com esta feature. As poucas ocorrências novas de `any` introduzidas seguem exatamente o mesmo padrão já usado nesses componentes (ex.: `export default function CreateProduct({ product }: any)`), não uma regressão de qualidade nova.

## 8. Resultado final

Funcionalidade implementada conforme o critério de aceite da seção 17: um produto com preço base R$100 numa região com +5% mostra R$105 por padrão; ao cadastrar um preço especial de R$103,50 para aquele produto/região, o sistema passa a usar R$103,50 **somente** para aquela combinação — outros produtos da mesma região continuam em +5%, e o mesmo produto em outra região continua obedecendo à regra dessa região. Comportamento validado tanto no serviço isoladamente quanto no fluxo real de criação de pedido.

Nenhum preço existente foi alterado automaticamente; nenhum pedido/venda já registrado é afetado (snapshot preservado); nenhuma exceção é criada para registros antigos (tabela nova, vazia até o operador cadastrar).

## 9. Arquivos alterados

**Novos:**
- `database/migrations/2026_09_05_000001_create_product_region_prices_table.php`
- `app/Models/ProductRegionPrice.php`
- `app/Services/Pricing/RegionalPriceResolver.php`
- `app/Http/Requests/ProductRegionPriceRequest.php`
- `app/Http/Controllers/ProductRegionPriceController.php`
- `tests/Feature/ProductRegionPriceTest.php`
- `executed.md` (este arquivo)

**Modificados:**
- `app/Models/Product.php` (relação `regionPrices()`)
- `app/Models/Region.php` (relação `productPrices()`)
- `app/Http/Controllers/OrderController.php` (usa o resolver no `store`)
- `app/Http/Controllers/Api/ApiOrderController.php` (usa o resolver no `store`)
- `app/Services/OrderUpdateService.php` (usa o resolver no `update`)
- `app/Http/Controllers/ProductController.php` (`show` expõe `regionPrices`)
- `app/Http/Controllers/RegionController.php` (`edit` expõe `productPrices` paginado/pesquisável)
- `routes/app.php` (rotas de `products.region-prices.*`)
- `resources/js/pages/app/products/edit-product.tsx` (seção "Preços por região")
- `resources/js/pages/app/regions/edit-region.tsx` (seção "Produtos desta região")

## 10.1 Ajuste pós-entrega (UX do formulário de cadastro)

Após a primeira entrega, foi reportado que a tela do produto não deixava claro onde ficavam os campos de região e preço especial. Diagnóstico: o backend estava correto (confirmado consultando o payload Inertia real de `app.products.show` com dados de teste — o `regionPrices` chegava com `region_id`, `specialPrice`, `effectivePrice` e `source` certos), mas a interface só mostrava uma tabela com uma linha por região, e o campo de valor só aparecia ao clicar no lápis daquela linha — sem nenhum `<select>` de região visível, que era o pedido original.

Correção em `resources/js/pages/app/products/edit-product.tsx`: adicionado um formulário fixo "Adicionar preço especial", acima da tabela, com um `<select>` de região (listando só as regiões que ainda não têm exceção cadastrada) e o campo "Preço especial (R$)" (mais validade opcional). A tabela abaixo continua mostrando o resumo de todas as regiões e permite editar/remover uma exceção já existente pelo ícone de lápis/lixeira. Validado via `tsc --noEmit`, recompilação pelo Vite (módulo servido sem erro pelo dev server) e reexecução dos testes/Pint — tudo passando.

## 10.2 Segundo ajuste pós-entrega (checkbox + prioridade sobre campanha)

Pedido do usuário: (1) a interface deveria ser um **checkbox "Aplicar preço especial"** que revela o select de região + o campo de valor (em vez do formulário sempre visível), presente **tanto na tela de inserção quanto na de edição** do produto; e (2) confirmado explicitamente: o preço especial deve substituir **todas** as regras, inclusive uma **campanha promocional ativa** — não só condição comercial de cliente/região/estabelecimento/global como decidido antes.

**Mudança de prioridade** (revoga a decisão registrada em 10 — ponto 1 abaixo foi resolvido): nos três pontos de cálculo (`OrderController@store`, `Api\ApiOrderController@store`, `OrderUpdateService@update`), a região do cliente agora é sempre passada ao resolver, mesmo para itens de campanha — antes, um item de campanha não considerava preço especial (região `null`), preservando a prioridade da campanha; agora `RegionalPriceResolver::effectivePriceForSale()` verifica o preço especial primeiro em qualquer caso, e só cai para a condição resolvida (que pode ser a de campanha) quando não há especial ativo. Documentação do serviço atualizada para refletir a nova prioridade: **especial > (campanha | cliente | região | tipo de estabelecimento | global) > base**.

**Interface**: em `edit-product.tsx`, o formulário "Adicionar preço especial" agora fica atrás de um `Checkbox` "Aplicar preço especial" (só aparece o select de região + input de valor quando marcado). Em `create-product.tsx` (tela de inserção), foi adicionado o mesmo padrão — checkbox, select de região (nova prop `regions`, agora enviada por `ProductController::create()`) e campo de valor — permitindo já cadastrar um preço especial no momento da criação do produto. `ProductRequest` ganhou os campos opcionais `apply_special_price`, `special_price_region_id`, `special_price_value`, `special_price_valid_from/until` (obrigatórios apenas quando o checkbox é marcado); `ProductController::store()` cria o `ProductRegionPrice` correspondente logo após salvar o produto.

Testes adicionados/ajustados em `tests/Feature/ProductRegionPriceTest.php`: preço especial vencendo uma campanha ativa (unitário no resolver + pedido real fim a fim), preço especial aplicado já na criação do produto, e rejeição de checkbox marcado sem preencher região/valor. Suite completa após o ajuste: **203 passed (1444 assertions)**, Pint e `tsc --noEmit` limpos. Validado também via requisições reais contra o servidor de desenvolvimento (login, `GET /app/products/create` retornando a prop `regions`, `POST /app/products` com o checkbox aplicado gerando o `ProductRegionPrice` esperado) usando um tenant temporário criado e removido só para o teste, sem tocar em dados reais do usuário.

## 10.3 Terceiro ajuste pós-entrega (máscara de moeda)

Pedido: aplicar máscara de moeda ao campo de preço especial. Reaproveitado o mesmo padrão já usado no campo "Preço" do produto (`maskMoney` para exibição com vírgula/milhar, `maskMoneyDot` normalizando o valor digitado para o formato decimal com ponto que a API espera), aplicado nos três campos de preço especial: formulário "Adicionar preço especial" e formulário de edição de linha em `edit-product.tsx`, e o campo da tela de criação em `create-product.tsx`. Ajuste adicional necessário: ao pré-carregar o valor de uma exceção já existente para edição, o valor agora é normalizado com `.toFixed(2)` antes de entrar na máscara — sem isso, um valor como `102.9` (sem o zero final, como o PHP/JSON representa o float) seria corrompido pela máscara (viraria `10,29`). Validado com `tsc --noEmit` (precisou de um `?? ''` para compatibilizar o retorno `string | undefined` de `maskMoneyDot` com o estado local), Pint e a suíte de testes — sem regressão.

## 10.4 Quarto ajuste pós-entrega (preço especial na listagem)

Pedido: na tabela inicial de produtos (`app.products.index`), quando houver preço especial ativo, ele deve ser mostrado. Como essa listagem não tem contexto de cliente/região (é a visão geral do catálogo, não uma venda), o preço base é mantido como referência, mas agora exibido riscado quando existe ao menos um preço especial ativo, com o(s) preço(s) especial(is) destacado(s) logo abaixo, um por região (um produto pode ter mais de um preço especial ativo, um por região).

Backend (`ProductController::index`): eager load de `regionPrices` já filtrado pelo escopo `active()` (respeitando `is_active` e a janela de validade) com a região carregada; a listagem passa a expor `special_prices: [{region_id, region_name, special_price}]` por produto (vazio quando não há exceção ativa).

Frontend (`resources/js/pages/app/products/index.tsx`): a coluna "Preço" mostra só o preço base quando não há especial; quando há, mostra o preço base riscado e, abaixo, cada preço especial ativo com um badge indicando a região.

Teste adicionado (`the products listing shows active special prices per region`) cobrindo: produto com dois preços especiais ativos (em regiões diferentes), produto com preço especial desativado (não deve aparecer) e produto sem nenhuma exceção. Suite completa após o ajuste: **204 passed (1449 assertions)**. Validado também com requisição real (login + `GET /app/products`) contra um tenant temporário removido logo em seguida.

## 10.5 Quinto ajuste pós-entrega (checkbox "Tempo indeterminado")

Pedido: adicionar um checkbox "tempo indeterminado" para o caso (raro, mas já suportado) de o preço especial não ter data de expiração. Isso já era possível deixando "Válido de"/"Válido até" em branco (a regra de negócio — seção 12 do escopo — já trata `valid_from`/`valid_until` nulos como "sem limite"), mas agora fica explícito na interface.

Adicionado nos três formulários que lidam com validade (formulário "Adicionar preço especial" e formulário de editar uma exceção existente, em `edit-product.tsx`; e o formulário da tela de criação do produto, em `create-product.tsx`): um checkbox **"Tempo indeterminado (sem data de expiração)"**, marcado por padrão. Quando marcado, os campos "Válido de"/"Válido até" ficam ocultos e são limpos (enviados como `null`); quando desmarcado, os campos aparecem para definir a janela de validade. No formulário de edição de uma exceção já existente, o checkbox inicia marcado ou desmarcado de acordo com o que já está salvo (se `valid_from`/`valid_until` já estavam vazios, começa marcado). Só interface — nenhuma mudança de backend foi necessária, já que a regra de "sem validade = sempre válido" já existia.

Validado com `tsc --noEmit`, Pint, suíte completa (**204 passed**, sem regressão) e recompilação pelo Vite dos três arquivos alterados.

## 10. Pontos que precisam de revisão

1. ~~**Prioridade sobre campanha**~~ — resolvido em 10.2: confirmado que o preço especial vence também campanha ativa; implementado e testado.
2. **Sem histórico multi-linha**: `product_region_prices` guarda um único registro vigente por produto/região (editado in-place); não existe uma tabela de histórico de alterações de preço especial, porque o app principal não tem um padrão de auditoria genérico hoje (só o módulo de Controle de Pragas tem `AuditLog`, isolado). A seção 16 do escopo ("se o VetorPet já possuir auditoria") portanto não se aplica; se for necessário auditar quem mudou o quê e quando, é um novo componente de auditoria a ser desenhado — não implementado nesta etapa para não expandir escopo.
3. **Lint do frontend**: `npx eslint .` já falhava antes desta mudança (601 problemas na `main`); não foi escopo desta tarefa arrumar o lint do projeto, só evitar piorar o padrão nos arquivos tocados (que já usavam `any` amplamente).
