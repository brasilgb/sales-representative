import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { performCheckin } from '@/lib/pest-control/checkin';
import { getCachedVisitDetail } from '@/lib/pest-control/db';
import { getDeviceId } from '@/lib/pest-control/device';
import { distanceMeters } from '@/lib/pest-control/geo';
import { captureLocation, type CapturedLocation } from '@/lib/pest-control/location';
import type { Establishment } from '@/lib/pest-control/types';

/**
 * Fazer check-in (Etapa 3 do app-tecnico.md): captura localização, avisa
 * divergência de raio pedindo justificativa, e nunca bloqueia por falha de
 * GPS — permite justificar e seguir sem inventar coordenadas.
 */
export default function CheckinScreen() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const router = useRouter();

  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [capturing, setCapturing] = useState(true);
  const [location, setLocation] = useState<CapturedLocation | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [justification, setJustification] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const detail = await getCachedVisitDetail(uuid);
      setEstablishment(detail?.visit.establishment ?? null);
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

  const distance =
    location && establishment?.latitude != null && establishment?.longitude != null
      ? distanceMeters(location.latitude, location.longitude, Number(establishment.latitude), Number(establishment.longitude))
      : null;
  const radius = establishment?.checkin_radius_meters ?? null;
  const outOfRange = distance !== null && radius !== null && distance > radius;
  const noLocation = !location && !capturing;
  const justificationRequired = outOfRange || noLocation;
  const canSubmit = !capturing && !submitting && (!justificationRequired || justification.trim().length > 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        device_time: new Date().toISOString(),
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        accuracy_meters: location?.accuracy ?? null,
        justification: justification.trim() || null,
        device_id: await getDeviceId(),
        app_version: Constants.expoConfig?.version ?? '0.0.0',
        offline_capture: false,
      };

      const result = await performCheckin(uuid, payload);

      if (!result.synced) {
        // Já está salvo no aparelho (ver performCheckin) — o app tenta de novo sozinho no próximo refresh da agenda.
        setSubmitError('Sem conexão agora. O check-in foi salvo no aparelho e será enviado assim que houver internet.');
        setTimeout(() => router.back(), 1500);
        return;
      }

      router.back();
    } catch {
      setSubmitError('Não foi possível registrar o check-in. Tente novamente.');
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
        <Text className="text-sm text-green-700">‹ Voltar</Text>
      </Pressable>
      <Text className="text-xl font-semibold text-green-950">Fazer check-in</Text>
      <Text className="text-sm text-neutral-600">{establishment?.name}</Text>

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
            {distance !== null ? (
              <Text className={`text-sm ${outOfRange ? 'text-amber-700' : 'text-green-700'}`}>
                {outOfRange
                  ? `Você está a ${Math.round(distance)} m do estabelecimento (raio permitido: ${radius} m).`
                  : `Dentro do raio do estabelecimento (${Math.round(distance)} m).`}
              </Text>
            ) : null}
          </View>
        ) : locationDenied ? (
          <Text className="text-sm text-red-600">
            Permissão de localização negada. Você pode continuar informando uma justificativa, mas o check-in ficará sem
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

      {justificationRequired ? (
        <View className="gap-1">
          <Text className="text-sm font-medium text-neutral-700">
            {outOfRange
              ? 'Justificativa (obrigatória: fora do raio do estabelecimento)'
              : 'Justificativa (obrigatória: sem localização)'}
          </Text>
          <TextInput
            value={justification}
            onChangeText={setJustification}
            multiline
            numberOfLines={3}
            placeholder="Explique o motivo…"
            className="min-h-24 rounded-xl border border-green-100 bg-white px-4 py-3 text-base text-green-950"
            textAlignVertical="top"
          />
        </View>
      ) : null}

      {submitError ? <Text className="text-sm text-amber-700">{submitError}</Text> : null}

      <Pressable
        onPress={handleSubmit}
        disabled={!canSubmit}
        className="mt-auto min-h-14 items-center justify-center rounded-2xl bg-green-600 px-5 disabled:opacity-50"
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-base font-semibold text-white">Confirmar check-in</Text>
        )}
      </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
