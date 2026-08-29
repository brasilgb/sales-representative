import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import { listMediaForVisit } from '@/lib/pest-control/db';
import { captureAndQueueMedia } from '@/lib/pest-control/media';
import type { MediaCategory } from '@/lib/pest-control/types';

type Props = {
  visitUuid: string;
  /** null = evidência geral da visita; um id = evidência de um ponto específico. */
  pointId: number | null;
  categories: { value: MediaCategory; label: string }[];
  latitude?: number | null;
  longitude?: number | null;
};

/**
 * Câmera, compressão e fila de upload (Etapa 5 do app-tecnico.md). Reaproveitada
 * na tela do ponto (evidências ligadas a um ponto) e na tela da visita
 * (situação do local, serviço concluído).
 */
export function PhotoEvidenceSection({ visitUuid, pointId, categories, latitude = null, longitude = null }: Props) {
  const [media, setMedia] = useState<Awaited<ReturnType<typeof listMediaForVisit>>>([]);
  const [capturingCategory, setCapturingCategory] = useState<MediaCategory | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const all = await listMediaForVisit(visitUuid);
    setMedia(all.filter((item) => item.pointId === pointId));
  }, [visitUuid, pointId]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const handleCapture = async (category: MediaCategory) => {
    setCapturingCategory(category);
    setError(null);

    const result = await captureAndQueueMedia({ visitUuid, pointId, category, latitude, longitude });
    setCapturingCategory(null);

    if (result.status === 'denied') {
      setError('Permissão da câmera negada. Ative nas configurações do aparelho para anexar fotos.');
      return;
    }
    if (result.status === 'canceled') return;

    await reload();
  };

  return (
    <View className="gap-2">
      <View>
        <Text className="text-sm font-semibold text-green-950">Evidências fotográficas</Text>
        <Text className="text-xs text-neutral-500">Registre imagens importantes da visita.</Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {categories.map((category) => (
          <Pressable
            key={category.value}
            onPress={() => handleCapture(category.value)}
            disabled={capturingCategory !== null}
            className="min-h-10 justify-center rounded-xl border border-green-200 bg-white px-3 disabled:opacity-50"
          >
            <Text className="text-xs text-green-950">
              {capturingCategory === category.value ? 'Abrindo câmera…' : `📷 ${category.label}`}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text className="text-xs text-red-600">{error}</Text> : null}

      {media.length > 0 ? (
        <ScrollView horizontal contentContainerClassName="gap-3">
          {media.map((item) => (
            <View key={item.uuid} className="items-center gap-1">
              <Image
                source={{ uri: item.syncStatus === 'uploaded' && item.serverUrl ? item.serverUrl : item.localUri }}
                className="h-20 w-20 rounded-xl bg-green-50"
              />
              <Text className={`text-[10px] ${item.syncStatus === 'uploaded' ? 'text-green-700' : 'text-amber-700'}`}>
                {item.syncStatus === 'uploaded' ? 'Enviada' : 'Aguardando envio'}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}
