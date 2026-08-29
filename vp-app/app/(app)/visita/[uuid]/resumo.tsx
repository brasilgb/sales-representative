import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCachedVisitDetail, type LocalInspection, listLocalInspections, listMediaForVisit } from '@/lib/pest-control/db';
import type { Product, VisitDetail } from '@/lib/pest-control/types';

function StatRow({
  label,
  value,
  className = 'text-green-950',
}: {
  label: string;
  value: number | string;
  className?: string;
}) {
  return (
    <View className="flex-row items-center justify-between border-b border-neutral-100 py-2">
      <Text className="text-sm text-neutral-600">{label}</Text>
      <Text className={`text-sm font-medium ${className}`}>{value}</Text>
    </View>
  );
}

/**
 * Resumo da visita (Etapa 6): o que o app-tecnico.md pede mostrar antes do
 * check-out, e também a etapa que antecede a assinatura. Só leitura — o
 * texto geral da visita (campo `summary`) é preenchido na tela de check-out,
 * que é quem de fato envia esse campo.
 */
export default function VisitSummaryScreen() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const router = useRouter();

  const [detail, setDetail] = useState<VisitDetail | null>(null);
  const [localInspections, setLocalInspections] = useState<Map<number, LocalInspection>>(new Map());
  const [photoCount, setPhotoCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [cached, inspections, media] = await Promise.all([
      getCachedVisitDetail(uuid),
      listLocalInspections(uuid),
      listMediaForVisit(uuid),
    ]);

    setDetail(cached);
    setLocalInspections(inspections);
    setPhotoCount(media.length);
    setLoading(false);
  }, [uuid]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (loading || !detail) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  const { visit } = detail;
  const points = visit.establishment.control_points;
  const reviewed = points.filter((point) => localInspections.has(point.id));
  const occurrences = points.filter((point) => localInspections.get(point.id)?.draft.not_inspected);
  const replacements = points.filter((point) => localInspections.get(point.id)?.draft.replaced);
  const pendingRequired = points.filter((point) => point.required && !localInspections.has(point.id));

  const productIdsUsed = new Set(
    Array.from(localInspections.values())
      .map((item) => item.draft.product_id)
      .filter((id): id is number => id != null),
  );
  const productsUsed = detail.products.filter((product: Product) => productIdsUsed.has(product.id));

  const alreadySigned = visit.signatures.some((signature) => !signature.superseded);

  return (
    <SafeAreaView className="flex-1 bg-green-50" edges={['top', 'bottom']}>
    <ScrollView
      contentContainerClassName="gap-4 px-5 pb-8 pt-2"
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} hitSlop={8} className="min-h-10 self-start justify-center pr-4">
        <Text className="text-sm text-green-700">‹ Visita</Text>
      </Pressable>
      <Text className="text-xl font-semibold text-green-950">Resumo da visita</Text>
      <Text className="text-sm text-neutral-600">{visit.establishment.name}</Text>

      <View className="rounded-2xl border border-green-100 bg-white p-4">
        <StatRow label="Total de pontos" value={points.length} />
        <StatRow label="Pontos revisados" value={reviewed.length} />
        <StatRow label="Pontos pendentes" value={points.length - reviewed.length} />
        <StatRow label="Ocorrências (não acessados)" value={occurrences.length} className="text-red-600" />
        <StatRow label="Trocas de dispositivo/isca" value={replacements.length} className="text-amber-700" />
        <StatRow label="Fotos anexadas" value={photoCount} />
      </View>

      {productsUsed.length > 0 ? (
        <View className="gap-1">
          <Text className="text-sm font-medium text-neutral-700">Produtos utilizados</Text>
          {productsUsed.map((product) => (
            <Text key={product.id} className="text-sm text-neutral-600">
              • {product.name}
            </Text>
          ))}
        </View>
      ) : null}

      {pendingRequired.length > 0 ? (
        <View className="gap-1 rounded-xl bg-amber-50 p-3">
          <Text className="text-sm font-medium text-amber-800">
            {pendingRequired.length} ponto(s) obrigatório(s) ainda não revisado(s):
          </Text>
          {pendingRequired.map((point) => (
            <Text key={point.id} className="text-sm text-amber-800">
              • {point.code ?? point.label}
            </Text>
          ))}
          <Text className="text-xs text-amber-700">
            É possível encerrar mesmo assim, mas o check-out vai pedir uma justificativa.
          </Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => router.push(`/visita/${uuid}/assinatura`)}
        className="min-h-14 items-center justify-center rounded-2xl border border-green-600 bg-white px-4"
      >
        <Text className="text-base font-medium text-green-950">
          {alreadySigned ? 'Assinar novamente' : 'Coletar assinatura e aceite'}
        </Text>
      </Pressable>

      {alreadySigned ? <Text className="text-center text-xs text-green-700">Assinatura já registrada.</Text> : null}

      <Pressable
        onPress={() => router.push(`/visita/${uuid}/check-out`)}
        className="min-h-14 items-center justify-center rounded-2xl bg-green-600 px-4"
      >
        <Text className="text-base font-semibold text-white">Fazer check-out</Text>
      </Pressable>
    </ScrollView>
    </SafeAreaView>
  );
}
