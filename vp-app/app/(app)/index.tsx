import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { fetchAgenda, fetchVisitDetail } from '@/lib/pest-control/api';
import {
  getCachedVisitDetail,
  listCachedAgenda,
  listConflictedInspections,
  listPendingCheckins,
  listPendingCheckouts,
  listPendingSignatures,
  replaceAgenda,
  saveVisitDetail,
} from '@/lib/pest-control/db';
import { seedInspectionsFromVisitDetail } from '@/lib/pest-control/inspections';
import { addressLine, openInMaps } from '@/lib/pest-control/maps';
import { syncNow } from '@/lib/pest-control/sync';
import type { AgendaVisit } from '@/lib/pest-control/types';

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendada',
  draft: 'Rascunho',
  in_progress: 'Em andamento',
  completed: 'Concluída',
  synced: 'Sincronizada',
  validated: 'Validada',
  canceled: 'Cancelada',
};

function formatScheduledAt(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
}

/** Agenda de visitas do técnico (Etapa 2 do app-tecnico.md): lista offline-first e download por visita. */
export default function AgendaScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [visits, setVisits] = useState<AgendaVisit[]>([]);
  const [downloadedUuids, setDownloadedUuids] = useState<Set<string>>(new Set());
  const [pendingSyncUuids, setPendingSyncUuids] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingUuid, setDownloadingUuid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDownloadedFlags = useCallback(async (list: AgendaVisit[]) => {
    const flags = await Promise.all(
      list.map(async (visit) => [visit.uuid, (await getCachedVisitDetail(visit.uuid)) !== null] as const),
    );
    setDownloadedUuids(new Set(flags.filter(([, downloaded]) => downloaded).map(([uuid]) => uuid)));
  }, []);

  const loadPendingSyncFlags = useCallback(async () => {
    const [checkins, checkouts, signatures, conflicts] = await Promise.all([
      listPendingCheckins(),
      listPendingCheckouts(),
      listPendingSignatures(),
      listConflictedInspections(),
    ]);
    const uuids = [...checkins, ...checkouts, ...signatures, ...conflicts].map((item) => item.visitUuid);
    setPendingSyncUuids(new Set(uuids));
  }, []);

  // Mostra o que já está no aparelho imediatamente, sem esperar a rede.
  useEffect(() => {
    (async () => {
      const cached = await listCachedAgenda();
      setVisits(cached);
      await loadDownloadedFlags(cached);
      await loadPendingSyncFlags();
    })();
  }, [loadDownloadedFlags, loadPendingSyncFlags]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    // Reenvia tudo o que foi feito offline antes de buscar a agenda nova
    // (mesmo agendador da sincronização automática — ver lib/pest-control/sync.ts).
    await syncNow();
    await loadPendingSyncFlags();

    try {
      const page = await fetchAgenda();
      await replaceAgenda(page.data);
      setVisits(page.data);
      await loadDownloadedFlags(page.data);
    } catch {
      // Sem internet ou servidor indisponível: fica com o que já tinha em cache.
      setError('Não foi possível atualizar a agenda agora. Mostrando os dados salvos no aparelho.');
    } finally {
      setRefreshing(false);
    }
  }, [loadDownloadedFlags, loadPendingSyncFlags]);

  useEffect(() => {
    // Busca inicial na rede ao abrir a agenda; a tela já mostrou o cache local acima.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const downloadDetail = useCallback(async (visit: AgendaVisit) => {
    setDownloadingUuid(visit.uuid);

    try {
      const detail = await fetchVisitDetail(visit.uuid);
      await saveVisitDetail(visit.uuid, detail);
      await seedInspectionsFromVisitDetail(visit.uuid, detail);
      setDownloadedUuids((prev) => new Set(prev).add(visit.uuid));
    } catch {
      setError('Não foi possível baixar os dados desta visita. Tente novamente com internet disponível.');
    } finally {
      setDownloadingUuid(null);
    }
  }, []);

  return (
    <View className="flex-1 bg-white pt-16">
      <View className="flex-row items-center justify-between px-6 pb-4">
        <View>
          <Text className="text-xl font-semibold text-neutral-900">Olá, {user?.name}</Text>
          <Text className="text-neutral-500">Agenda de visitas</Text>
        </View>
        <View className="flex-row gap-2">
          <Pressable onPress={() => router.push('/sincronizacao')} className="rounded-lg border border-neutral-300 px-4 py-2">
            <Text className="text-sm font-medium text-neutral-900">Sincronização</Text>
          </Pressable>
          <Pressable onPress={() => logout()} className="rounded-lg border border-neutral-300 px-4 py-2">
            <Text className="text-sm font-medium text-neutral-900">Sair</Text>
          </Pressable>
        </View>
      </View>

      {error ? (
        <View className="mx-6 mb-3 rounded-lg bg-amber-50 p-3">
          <Text className="text-sm text-amber-800">{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={visits}
        keyExtractor={(visit) => visit.uuid}
        contentContainerClassName="gap-3 px-6 pb-8"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListEmptyComponent={
          !refreshing ? <Text className="mt-8 text-center text-neutral-500">Nenhuma visita agendada.</Text> : null
        }
        renderItem={({ item }) => {
          const downloaded = downloadedUuids.has(item.uuid);
          const downloading = downloadingUuid === item.uuid;
          const pendingSync = pendingSyncUuids.has(item.uuid);

          return (
            <Pressable
              onPress={() => router.push(`/visita/${item.uuid}`)}
              className="gap-2 rounded-xl border border-neutral-200 p-4"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-neutral-900">{item.establishment.name}</Text>
                <Text className="text-xs font-medium uppercase text-neutral-500">
                  {STATUS_LABELS[item.status] ?? item.status}
                </Text>
              </View>

              <Pressable onPress={() => openInMaps(item.establishment)}>
                <Text className="text-sm text-blue-600 underline">{addressLine(item.establishment)}</Text>
              </Pressable>

              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-neutral-600">
                  {formatScheduledAt(item.scheduled_at)} · {item.service_type}
                </Text>
                <Text className="text-xs text-neutral-500">{downloaded ? 'Dados baixados' : 'Não baixado'}</Text>
              </View>

              {pendingSync ? (
                <Text className="text-xs font-medium uppercase text-amber-700">Dados aguardando sincronização</Text>
              ) : null}

              {!downloaded ? (
                <Pressable
                  onPress={() => downloadDetail(item)}
                  disabled={downloading}
                  className="items-center rounded-lg bg-neutral-900 py-2 disabled:opacity-50"
                >
                  <Text className="text-sm font-medium text-white">{downloading ? 'Baixando…' : 'Baixar para uso offline'}</Text>
                </Pressable>
              ) : null}
            </Pressable>
          );
        }}
      />
    </View>
  );
}
