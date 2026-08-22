import * as SecureStore from 'expo-secure-store';

// Token de sessão (Sanctum personal access token) guardado no armazenamento
// seguro do aparelho (Keychain/Keystore), nunca em AsyncStorage puro.
const TOKEN_KEY = 'vp_auth_token';

export const tokenStorage = {
  get: (): Promise<string | null> => SecureStore.getItemAsync(TOKEN_KEY),
  set: (token: string): Promise<void> => SecureStore.setItemAsync(TOKEN_KEY, token),
  clear: (): Promise<void> => SecureStore.deleteItemAsync(TOKEN_KEY),
};
