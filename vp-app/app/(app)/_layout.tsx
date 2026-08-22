import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/lib/auth';

/**
 * Guarda de autenticação do grupo "logado". A checagem de módulo ativo
 * (pest_control) e permissões do técnico entra aqui na Etapa 2 — hoje só
 * garante que ninguém sem sessão válida chega nas telas internas.
 */
export default function AppLayout() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
