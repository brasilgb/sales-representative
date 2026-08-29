// URL base da API do VetorPet (Laravel), definida em .env
// (EXPO_PUBLIC_API_URL). Variáveis EXPO_PUBLIC_* são embutidas no bundle em
// build time — não coloque segredo aqui, só a URL pública da API.
const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

// Evita URLs como `http://servidor:8000//api/...` quando a variável é
// configurada com barra no final. Em aparelho físico, a variável deve usar
// um endereço alcançável pela rede (nunca localhost).
export const API_URL = (configuredApiUrl || 'http://localhost:8000').replace(/\/+$/, '');
