import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { hasPestControlAccess, useAuth } from '@/lib/auth';
import { startAgendaWatch, stopAgendaWatch } from '@/lib/pest-control/agenda-watch';
import { startAutoSync, stopAutoSync } from '@/lib/pest-control/sync';

/**
 * Guarda de autenticação e de disponibilidade do módulo (Etapa 2). Sessão
 * válida sem o módulo ativo, ou sem o usuário estar cadastrado como técnico,
 * não chega nas telas internas — mas também não é redirecionada para fora
 * silenciosamente, porque o próprio login já é exclusivo deste aplicativo
 * (ver app/login.tsx): mostramos que não há acesso e deixamos sair.
 */
export default function AppLayout() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const hasAccess = hasPestControlAccess(user);

  // Sincronização automática (Etapa 7) e escuta da agenda: ligam assim que o
  // técnico está numa sessão válida com acesso ao módulo, desligam ao sair —
  // nunca rodam em segundo plano sem sessão.
  useEffect(() => {
    if (!hasAccess) return;

    startAutoSync();
    void startAgendaWatch();

    return () => {
      stopAutoSync();
      stopAgendaWatch();
    };
  }, [hasAccess]);

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

  if (!hasAccess) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-white px-6">
        <Text className="text-center text-base text-neutral-700">
          Este usuário não tem acesso ao módulo de Controle de Pragas no momento.
        </Text>
        <Pressable onPress={() => logout()} className="items-center rounded-xl border border-neutral-300 px-6 py-3">
          <Text className="text-base font-medium text-green-950">Sair</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="#f0fdf4" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
