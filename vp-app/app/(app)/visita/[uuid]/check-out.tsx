import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { performCheckout } from '@/lib/pest-control/checkout';
import { getCachedVisitDetail, listLocalInspections } from '@/lib/pest-control/db';
import { captureLocation, type CapturedLocation } from '@/lib/pest-control/location';
import type { ControlPoint } from '@/lib/pest-control/types';

/**
 * Check-out (Etapa 6 do app-tecnico.md): mesma captura de localização do
 * check-in (Etapa 3), com a mesma postura sobre falha de GPS — nunca inventa
 * coordenadas. Bloqueia só quando há ponto obrigatório pendente sem
 * justificativa preenchida; fora isso, sempre é possível encerrar.
 */
export default function CheckoutScreen() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const router = useRouter();

  const [pendingRequired, setPendingRequired] = useState<ControlPoint[]>([]);
  const [capturing, setCapturing] = useState(true);
  const [location, setLocation] = useState<CapturedLocation | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [detail, inspections] = await Promise.all([getCachedVisitDetail(uuid), listLocalInspections(uuid)]);
      const points = detail?.visit.establishment.control_points ?? [];
      setPendingRequired(points.filter((point) => point.required && !inspections.has(point.id)));
    })();
  }, [uuid]);

  const attemptCapture = useCallback(async () => {
    setCapturing(true);
    setLocationDenied(false);
    setLocationError(null);

    const result = await captureLocation();

    if (result.status === 'granted') {
      setLocation(result.location);
    } else if (result.status === 'denied') {
      setLocationDenied(true);
    } else {
      setLocationError(result.message);
    }

    setCapturing(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void attemptCapture();
  }, [attemptCapture]);

  const justificationRequired = pendingRequired.length > 0 || (!location && !capturing);
  const canSubmit = !capturing && !submitting && (!justificationRequired || summary.trim().length > 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    setFeedback(null);

    const finalSummary =
      pendingRequired.length > 0
        ? `Pontos obrigatórios pendentes: ${pendingRequired.map((point) => point.code ?? point.label).join(', ')}. ${summary.trim()}`
        : summary.trim() || null;

    try {
      const result = await performCheckout(uuid, {
        device_time: new Date().toISOString(),
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        accuracy_meters: location?.accuracy ?? null,
        summary: finalSummary,
      });

      if (!result.synced) {
        setFeedback('Sem conexão agora. O check-out foi salvo no aparelho e será enviado quando houver internet.');
        setTimeout(() => router.push(`/visita/${uuid}`), 1500);
        return;
      }

      router.push(`/visita/${uuid}`);
    } catch {
      setFeedback('Não foi possível registrar o check-out. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-green-50" edges={['top', 'bottom']}>
      <ScrollView
        contentContainerClassName="grow gap-4 px-5 pb-8 pt-2"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <Pressable onPress={() => router.back()} hitSlop={8} className="min-h-10 self-start justify-center pr-4">
        <Text className="text-sm text-green-700">‹ Resumo</Text>
      </Pressable>
      <Text className="text-xl font-semibold text-green-950">Fazer check-out</Text>

      <View className="gap-2 rounded-2xl border border-green-100 bg-white p-4">
        {capturing ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator />
            <Text className="text-sm text-neutral-600">Obtendo sua localização…</Text>
          </View>
        ) : location ? (
          <View className="gap-1">
            <Text className="text-sm font-medium text-green-950">Localização capturada</Text>
            <Text className="text-xs text-neutral-500">
              Precisão: {location.accuracy != null ? `${Math.round(location.accuracy)} m` : 'desconhecida'}
            </Text>
          </View>
        ) : locationDenied ? (
          <Text className="text-sm text-red-600">
            Permissão de localização negada. Você pode continuar informando uma justificativa, mas o check-out ficará sem
            coordenadas.
          </Text>
        ) : (
          <Text className="text-sm text-red-600">{locationError}</Text>
        )}

        {!capturing && !location ? (
          <Pressable onPress={() => attemptCapture()} className="min-h-11 items-center justify-center rounded-xl border border-green-200 px-4">
            <Text className="text-sm font-medium text-green-950">Tentar novamente</Text>
          </Pressable>
        ) : null}
      </View>

      {pendingRequired.length > 0 ? (
        <View className="gap-1 rounded-xl bg-amber-50 p-3">
          <Text className="text-sm font-medium text-amber-800">
            {pendingRequired.length} ponto(s) obrigatório(s) não revisado(s). É preciso justificar para encerrar assim mesmo.
          </Text>
        </View>
      ) : null}

      <View className="gap-1">
        <Text className="text-sm font-medium text-neutral-700">
          {justificationRequired ? 'Observações / justificativa (obrigatória)' : 'Observações (opcional)'}
        </Text>
        <TextInput
          value={summary}
          onChangeText={setSummary}
          multiline
          numberOfLines={4}
          placeholder="Resumo da visita, observações gerais…"
          className="min-h-28 rounded-xl border border-green-100 bg-white px-4 py-3 text-base text-green-950"
          textAlignVertical="top"
        />
      </View>

      {feedback ? <Text className="text-sm text-amber-700">{feedback}</Text> : null}

      <Pressable
        onPress={handleSubmit}
        disabled={!canSubmit}
        className="mt-auto min-h-14 items-center justify-center rounded-2xl bg-green-600 px-5 disabled:opacity-50"
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-base font-semibold text-white">Confirmar check-out</Text>
        )}
      </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
