import { Pressable, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth';

/**
 * Placeholder da home/agenda — só prova a volta completa do pipeline
 * (login real -> token seguro -> /api/user -> tela protegida). A agenda de
 * verdade (lista de visitas, download offline) é a Etapa 2.
 */
export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View className="flex-1 gap-4 bg-white px-6 pt-16">
      <View>
        <Text className="text-xl font-semibold text-neutral-900">Olá, {user?.name}</Text>
        <Text className="text-neutral-500">Agenda de visitas — em construção (Etapa 2 do app-tecnico.md).</Text>
      </View>

      <Pressable onPress={() => logout()} className="mb-8 mt-auto items-center rounded-lg border border-neutral-300 py-3">
        <Text className="text-base font-medium text-neutral-900">Sair</Text>
      </Pressable>
    </View>
  );
}
