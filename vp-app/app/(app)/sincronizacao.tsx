import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listAllPendingForReview, listCachedAgenda, type PendingReviewItem, type PendingReviewKind } from '@/lib/pest-control/db';
import { onSyncStatusChange, syncNow, type SyncStatus } from '@/lib/pest-control/sync';

const KIND_LABELS: Record<PendingReviewKind, string> = {
  checkin: 'Check-in',
  inspection: 'Inspeção de ponto',
  conflict: 'Conflito — precisa de decisão',
  checkout: 'Check-out',
  signature: 'Assinatura',
  media: 'Foto',
};

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
}

/**
 * Sincronização e Pendências/Erros (Etapa 7 do app-tecnico.md) — as duas
 * telas do roteiro juntas numa só: o estado da sincronização automática e a
 * lista do que ainda não foi confirmado pelo servidor, com o motivo quando
 * uma tentativa falhou. "Histórico local" (dados já sincronizados) fica
 * para uma etapa futura — aqui o foco é só o que ainda precisa de atenção.
 */
export default function SyncScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<SyncStatus>({ isOnline: true, lastRunAt: null, lastSyncedCount: 0, pendingCount: 0 });
  const [items, setItems] = useState<PendingReviewItem[]>([]);
  const [establishmentNames, setEstablishmentNames] = useState<Map<string, string>>(new Map());
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [pending, agenda] = await Promise.all([listAllPendingForReview(), listCachedAgenda()]);
    setItems(pending);
    setEstablishmentNames(new Map(agenda.map((visit) => [visit.uuid, visit.establishment.name])));
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  useFocusEffect(
    useCallback(() => {
      return onSyncStatusChange(setStatus);
    }, []),
  );

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncError(null);

    try {
      await syncNow();
      await load();
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Não foi possível sincronizar agora.');
    } finally {
      setSyncing(false);
    }
  };

  const goToItem = (item: PendingReviewItem) => {
    if (item.pointId != null) {
      router.push(`/visita/${item.visitUuid}/ponto/${item.pointId}`);
    } else {
      router.push(`/visita/${item.visitUuid}`);
    }
  };

  const conflictCount = items.filter((item) => item.kind === 'conflict').length;

  return (
    <SafeAreaView className="flex-1 bg-green-50" edges={['top', 'bottom']}>
      <View className="gap-1 px-5 pb-4 pt-2">
        <Pressable onPress={() => router.back()} hitSlop={8} className="min-h-10 self-start justify-center pr-4">
          <Text className="text-sm text-green-700">‹ Agenda</Text>
        </Pressable>
        <Text className="text-xl font-semibold text-green-950">Sincronização</Text>
      </View>

      <View className="mx-5 mb-4 gap-2 rounded-2xl border border-green-100 bg-white p-4">
        <View className="flex-row items-center gap-2">
          <View className={`h-2.5 w-2.5 rounded-full ${status.isOnline ? 'bg-green-600' : 'bg-red-600'}`} />
          <Text className="text-sm text-neutral-700">{status.isOnline ? 'Conectado' : 'Sem conexão'}</Text>
        </View>
        <Text className="text-xs text-neutral-500">
          {status.lastRunAt
            ? `Última tentativa: ${formatDateTime(status.lastRunAt)}`
            : 'Ainda não tentou sincronizar nesta sessão.'}
        </Text>
        <Text className="text-xs text-neutral-500">{items.length} pendência(s) no aparelho.</Text>
        {conflictCount > 0 ? (
          <Text className="text-xs font-medium text-red-600">
            {conflictCount} conflito(s) esperando sua decisão — não são reenviados sozinhos.
          </Text>
        ) : null}
        {syncError ? (
          <View className="rounded-xl border border-red-100 bg-red-50 p-3">
            <Text className="text-xs leading-5 text-red-700">{syncError}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleSyncNow}
          disabled={syncing}
          className="mt-2 min-h-12 items-center justify-center rounded-xl bg-green-600 px-4 disabled:opacity-50"
        >
          {syncing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white">Sincronizar agora</Text>
          )}
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.kind}-${item.visitUuid}-${item.pointId ?? 'x'}-${index}`}
        contentContainerClassName="gap-2 px-5 pb-8"
        ListEmptyComponent={
          !loading ? <Text className="mt-8 text-center text-neutral-500">Tudo sincronizado. Nenhuma pendência.</Text> : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => goToItem(item)}
            className={`gap-2 rounded-2xl border bg-white p-4 ${item.kind === 'conflict' ? 'border-red-300 bg-red-50' : 'border-green-100'}`}
          >
            <View className="flex-row items-center justify-between">
              <Text className={`text-sm font-semibold ${item.kind === 'conflict' ? 'text-red-800' : 'text-green-950'}`}>
                {KIND_LABELS[item.kind]}
              </Text>
              <Text className="text-xs text-neutral-500">{formatDateTime(item.updatedAt)}</Text>
            </View>
            <Text className="text-sm text-neutral-600">{establishmentNames.get(item.visitUuid) ?? 'Visita'}</Text>
            {item.lastError ? <Text className="text-xs text-amber-700">Erro: {item.lastError}</Text> : null}
            <Text className="text-xs text-green-700">Ver e resolver ›</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
