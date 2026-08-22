// URL base da API do VetorPet (Laravel), definida em .env
// (EXPO_PUBLIC_API_URL). Variáveis EXPO_PUBLIC_* são embutidas no bundle em
// build time — não coloque segredo aqui, só a URL pública da API.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
