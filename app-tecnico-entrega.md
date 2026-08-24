# Entrega — App do Técnico (Controle de Pragas)

Resumo consolidado das 8 etapas do [app-tecnico.md](app-tecnico.md). Cobre o app móvel (`vp-app/`, Expo/React Native) e a fatia do backend Laravel exposta só para ele (`pest-control/v1`), reaproveitando integralmente o módulo Controle de Pragas já existente no painel web ([pest-control.md](pest-control.md)).

## Visão geral

- **App**: Expo Router + TypeScript + NativeWind, autenticação Sanctum já existente reaproveitada.
- **Offline-first de verdade**: toda escrita (check-in, inspeção, foto, assinatura, check-out) salva no SQLite do aparelho **antes** de qualquer tentativa de rede, e só é removida da fila local depois que o servidor confirma.
- **Backend**: nenhuma rota nova cria visitas — o app só age sobre visitas já agendadas pelo painel web. Toda a regra de negócio (raio de check-in, versionamento de assinatura, auditoria) foi **reaproveitada tal e qual** de `PestControlVisitService`, não reimplementada.
- **Isolamento**: cada endpoint móvel confere que o técnico autenticado é o dono da visita (404 caso contrário), além do isolamento por tenant já garantido pela trait `Tenantable`.

## Etapa 1 — Diagnóstico e arquitetura

Levantamento do app existente (Expo Router, auth Sanctum, `SecureStore`, `apiFetch`) e do contrato de API disponível. Decisão de arquitetura offline definida e confirmada com o usuário: **expo-sqlite** como motor local (banco real, não apenas chave-valor), por suportar bem consultas relacionais e a fila de sincronização das etapas seguintes.

## Etapa 2 — Agenda, download offline, detalhes da visita

- Backend: `AgendaController` (`GET /pest-control/v1/agenda`, `GET /pest-control/v1/agenda/{uuid}`) — agenda e detalhe completo da visita, escopados ao próprio técnico.
- `/api/user` passou a expor `active_modules`, `is_pest_control_technician` e `pest_control_permissions`.
- App: tela de Agenda (offline-first, indicador "dados baixados"), tela de Detalhes da Visita, cache local em SQLite (`agenda_visits`).
- Guarda de visibilidade do módulo em `(app)/_layout.tsx` — sem módulo ativo, sem acesso, sem indício.

## Etapa 3 — Check-in, localização, raio, justificativas

- Backend: `VisitCheckinController`, reaproveitando `PestControlVisitService::checkIn` (cálculo de distância, sinalização "fora do raio" sem bloquear).
- App: captura de GPS com timeout e retry; nunca inventa coordenadas em falha; exige justificativa quando fora do raio ou sem localização; fila local (`pending_checkins`) com reenvio automático.

## Etapa 4 — Lista e inspeção dos pontos

- Backend: `VisitInspectionController`, upsert por (visita, ponto) — reenviar o mesmo ponto atualiza, não duplica.
- App: formulário de inspeção com campos adaptados à categoria do ponto; "1"/"E" sinalizam substituição necessária; ponto "não acessível" exige justificativa; progresso (revisados/pendentes/ocorrências/substituições) na tela da visita. Persistência local (`point_inspections`) salva a cada mudança, nunca só no fim.

## Etapa 5 — Câmera, fotos, compressão, fila de upload

- Backend: `VisitMediaController`, idempotente por `uuid` gerado no aparelho; migração adicionou `uuid`, `category` e `content_hash` a `pest_control_visit_media`.
- App: captura via câmera, compressão (`expo-image-manipulator`), hash SHA-256 real do arquivo, fila local (`pending_media`) com upload em segundo plano. Evidência de um ponto só sobe depois que a inspeção do ponto está sincronizada (mesma ordem de `FUNCIONAMENTO OFFLINE`).

## Etapa 6 — Resumo, assinatura, aceite, check-out

- Backend: `VisitCheckoutController` e `VisitSignatureController`, reaproveitando `checkOut`/`sign` (nova assinatura sempre versiona, nunca sobrescreve silenciosamente).
- App: tela de Resumo (pontos revisados/pendentes/ocorrências, produtos usados, fotos, aviso de pontos obrigatórios pendentes); assinatura desenhada num canvas HTML5 dentro de uma WebView (mesma técnica do painel web); check-out com a mesma captura de localização do check-in.

## Etapa 7 — Sincronização automática, retentativas, conflitos, erros

- Backend: detecção de conflito nas inspeções — o app manda o `updated_at` que conhecia; se o servidor tiver algo mais novo, devolve 409 em vez de aplicar "última gravação vence" silenciosamente.
- App: agendador central (`sync.ts`) com backoff (15s → até 5min) e reenvio automático quando a internet volta (`@react-native-community/netinfo`); tela **Sincronização** unificando status de conexão, pendências e erros com tentativa manual; banner de conflito na tela do ponto com as duas resoluções (manter local / usar servidor).

## Etapa 8 — Testes e build de homologação

- **Suite Jest criada do zero** (33 testes, SQLite real via `node:sqlite`) cobrindo duplicidade, offline/online, conflito, GPS indisponível e encerramento inesperado.
- **Dois bugs reais achados e corrigidos** durante os testes: upsert faltando em `saveLocalMedia`; cache de detalhe da visita não refletia check-in/check-out sincronizado (achado *ao vivo*, num Android físico).
- **Teste em aparelho real** (Galaxy A55, Android 16): projeto nativo regenerado (`expo prebuild --clean`, estava desatualizado desde a Etapa 2), build debug instalada, fluxo completo validado ao vivo — login, agenda, download, check-in com GPS real — e conferido diretamente no banco do Laravel.
- **Build de homologação**: APK debug gerado e instalado com sucesso. Pendência real: keystore de release ainda não configurado (decisão do usuário, não algo a inventar).

## Testes automatizados (estado final)

| Suite | Resultado |
|---|---|
| Backend (`php artisan test`) | 184 passed, 1337 assertions |
| Mobile (`npx jest`) | 33 passed |
| `npm run typecheck` / `lint` / `format:check` | limpos |
| Pint (arquivos tocados) | passed |

## Arquivos-chave

**Backend** — `app/Http/Controllers/Api/PestControl/` (Agenda, VisitCheckin, VisitInspection, VisitMedia, VisitSignature, VisitCheckout), `routes/api.php` (grupo `pest-control/v1`), migrações de `pest_control_technicians` e dos campos novos de `pest_control_visit_media`.

**Mobile** — `vp-app/lib/pest-control/` (db.ts, api.ts, checkin/checkout/inspections/media/signature/sync.ts, photo.ts, location.ts), `vp-app/app/(app)/visita/[uuid]/` (index, check-in, ponto/[pointId], resumo, assinatura, check-out), `vp-app/app/(app)/sincronizacao.tsx`, `vp-app/components/pest-control/PhotoEvidenceSection.tsx`, `vp-app/__tests__/pest-control/` + `vp-app/__mocks__/expo-sqlite.js`.

## Pendências gerais

- Keystore de assinatura de release (produção) — decisão do usuário.
- Assinatura digital não tem idempotência por uuid (só check-in, inspeção e foto têm) — risco aceito e documentado, mesma classe de risco desde a Etapa 3.
- Detecção de conflito implementada só para inspeções (o único canal com risco real de dois escritores — painel web + app). Check-in/check-out/assinatura continuam "salva local, tenta enviar", sem detecção de conflito própria.
- Tela "Histórico local" (listada no roteiro, fora do escopo explícito da Etapa 7) não foi construída.
- Cobertura de câmera/compressão (`photo.ts`/`media.ts`) não tem teste Jest dedicado — validada no teste em aparelho real, não por unit test.

## Critérios de conclusão do app-tecnico.md

| Critério | Status |
|---|---|
| Módulo invisível sem contratação | ✅ |
| Autenticação compartilhada com VetorPet | ✅ |
| Agenda disponível offline | ✅ |
| Check-in/check-out com localização | ✅ |
| Inspeção de todos os pontos | ✅ |
| Fotos associadas corretamente | ✅ |
| Assinatura offline | ✅ |
| Sincronização idempotente | ✅ (exceto assinatura, ver pendências) |
| Recuperação após interrupções | ✅ |
| Ausência de duplicidades | ✅ |
| Erros apresentados claramente | ✅ |
| Build Android aprovado | ✅ (debug, testado em aparelho real) |
| Testes e documentação concluídos | ✅ |
