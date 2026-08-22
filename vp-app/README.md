# vp-app — VetorPet Técnico

Aplicativo móvel do VetorPet para o módulo **Controle de Pragas**: agenda,
check-in/check-out, inspeção de pontos, evidências e assinatura do técnico
em campo, com suporte a uso offline (ver [`app-tecnico.md`](../app-tecnico.md)).

Consome a mesma API Laravel do painel web (`routes/api.php`), com o mesmo
usuário/tenant e autenticação via token (Sanctum) — não é uma base própria
de dados, é o mesmo backend do VetorPet.

## Stack

- **Expo SDK 57** + **TypeScript** (`expo-router`, file-based routing)
- **NativeWind v4** + **Tailwind CSS 3** (classes utilitárias em componentes RN)
- **expo-secure-store** para o token de sessão (Keychain/Keystore, nunca AsyncStorage puro)
- Sem cliente HTTP externo por enquanto: `lib/api.ts` é um wrapper fino sobre `fetch`
  (revisar quando a fila de sincronização offline ficar mais complexa — Etapa 7)

## Rodando localmente

```bash
cd vp-app
cp .env.example .env   # ajuste EXPO_PUBLIC_API_URL para o IP da sua máquina na rede local
npm install
npm start
```

Abra no Expo Go (ou `npm run android`/`npm run ios` com um build de desenvolvimento).
Use o IP da máquina rodando o `php artisan serve`/Docker do VetorPet, não
`localhost`: o emulador/aparelho físico não enxerga esse host.

## Scripts

- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — `expo lint` (eslint-config-expo)
- `npm run format` / `npm run format:check` — Prettier (+ ordenação de classes Tailwind)

## Estrutura

```
app/
  _layout.tsx        # layout raiz: AuthProvider, SafeAreaProvider, Stack
  login.tsx           # tela de login (fora do grupo autenticado)
  (app)/
    _layout.tsx        # guarda de autenticação do grupo logado
    index.tsx           # home/agenda (placeholder — Etapa 2)
lib/
  api.ts               # cliente HTTP (fetch) + ApiError tipado
  auth.tsx              # AuthContext: login/logout, restauração de sessão, token
  storage.ts             # wrapper do expo-secure-store
  config.ts               # EXPO_PUBLIC_API_URL
```

## Estado atual (Etapa 1 do app-tecnico.md)

Diagnóstico: não havia base mobile anterior no VetorPet — este projeto nasce
do zero, reaproveitando integralmente a API/autenticação/multitenancy já
existentes no backend Laravel.

Implementado nesta etapa: projeto Expo configurado (TS + NativeWind +
ESLint + Prettier), login real contra `POST /api/login`, token salvo em
armazenamento seguro, restauração de sessão ao abrir o app (`GET /api/user`),
logout, e uma tela protegida mínima — o pipeline completo ponta a ponta,
sem nenhuma tela de negócio do módulo ainda.

**Pendência de contrato de API** (a resolver no backend antes da Etapa 2):
`GET /api/user` ainda não informa os módulos ativos do tenant nem as
permissões finas do Controle de Pragas do usuário logado — hoje isso só
existe nas props do Inertia (`auth.activeModules`, `auth.pestControlPermissions`)
para o painel web. O app precisa do mesmo dado por API para decidir se
mostra ou esconde o módulo (ver regra de visibilidade do `app-tecnico.md`).
