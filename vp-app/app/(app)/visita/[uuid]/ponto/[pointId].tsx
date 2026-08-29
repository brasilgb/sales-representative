import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PhotoEvidenceSection } from '@/components/pest-control/PhotoEvidenceSection';
import { getCachedVisitDetail, getLocalInspection } from '@/lib/pest-control/db';
import { resolveConflictKeepLocal, resolveConflictUseServer, saveAndSyncInspection } from '@/lib/pest-control/inspections';
import { captureLocation } from '@/lib/pest-control/location';
import {
  emptyInspectionDraft,
  type ConsumptionCode,
  type ControlPoint,
  type InspectionDraft,
  type LookupOption,
  type MediaCategory,
  type PestSpecies,
  type Product,
  type ServerInspection,
} from '@/lib/pest-control/types';

const CONSUMPTION_LABELS: Record<ConsumptionCode, string> = { '0': '0', '0.5': '0,5', '1': '1', E: 'E' };

// Categorias de evidência relevantes num ponto (ver app-tecnico.md, seção
// EVIDÊNCIAS) — "situação do local" e "serviço concluído" são da visita
// como um todo, ficam na tela da visita.
const POINT_PHOTO_CATEGORIES: { value: MediaCategory; label: string }[] = [
  { value: 'infestacao', label: 'Infestação' },
  { value: 'produto', label: 'Produto' },
  { value: 'dispositivo', label: 'Dispositivo' },
  { value: 'dano', label: 'Dano' },
  { value: 'ponto_inacessivel', label: 'Ponto inacessível' },
];

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (next: number) => void }) {
  return (
    <View className="flex-1 items-center gap-1">
      <Text className="text-xs text-neutral-500">{label}</Text>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => onChange(Math.max(0, value - 1))}
          className="h-8 w-8 items-center justify-center rounded-full border border-neutral-300"
        >
          <Text className="text-base text-green-950">−</Text>
        </Pressable>
        <Text className="w-6 text-center text-base font-medium text-green-950">{value}</Text>
        <Pressable
          onPress={() => onChange(value + 1)}
          className="h-8 w-8 items-center justify-center rounded-full border border-neutral-300"
        >
          <Text className="text-base text-green-950">+</Text>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Inspeção do ponto (Etapas 4 e 5 do app-tecnico.md): campos se adaptam à
 * categoria, preenchimento é salvo localmente a cada mudança (nunca só no
 * fim), a navegação entre pontos nunca perde dado, e fotos entram na fila
 * de upload independente do resto do formulário.
 */
export default function PointInspectionScreen() {
  const { uuid, pointId } = useLocalSearchParams<{ uuid: string; pointId: string }>();
  const router = useRouter();
  const pointIdNumber = Number(pointId);

  const [point, setPoint] = useState<ControlPoint | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [species, setSpecies] = useState<PestSpecies[]>([]);
  const [consumptionTypes, setConsumptionTypes] = useState<LookupOption[]>([]);
  const [deviceConditions, setDeviceConditions] = useState<string[]>([]);
  const [draft, setDraft] = useState<InspectionDraft>(emptyInspectionDraft());
  const [loading, setLoading] = useState(true);
  const [capturingLocation, setCapturingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [conflictServer, setConflictServer] = useState<ServerInspection | null>(null);
  const [resolvingConflict, setResolvingConflict] = useState(false);
  const draftRef = useRef(draft);
  // TextInput não controlado (defaultValue): guardamos o texto mais recente aqui para persistir no onBlur.
  const notesTextRef = useRef('');
  const reasonTextRef = useRef('');

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const persist = useCallback(
    (partial: Partial<InspectionDraft>) => {
      setDraft((prev) => {
        const next = { ...prev, ...partial };
        saveAndSyncInspection(uuid, pointIdNumber, next).then((result) => {
          if (!result.synced && result.conflict) {
            void getLocalInspection(uuid, pointIdNumber).then((local) => setConflictServer(local?.conflictServer ?? null));
          }
        });
        return next;
      });
    },
    [uuid, pointIdNumber],
  );

  useEffect(() => {
    (async () => {
      const detail = await getCachedVisitDetail(uuid);
      const foundPoint = detail?.visit.establishment.control_points.find((item) => item.id === pointIdNumber) ?? null;
      const local = await getLocalInspection(uuid, pointIdNumber);

      setPoint(foundPoint);
      setProducts(detail?.products ?? []);
      setSpecies(detail?.species ?? []);
      setConsumptionTypes(detail?.consumption_types ?? []);
      setDeviceConditions(detail?.device_conditions ?? []);
      const loadedDraft = local?.draft ?? emptyInspectionDraft();
      setDraft(loadedDraft);
      setConflictServer(local?.syncStatus === 'conflict' ? local.conflictServer : null);
      notesTextRef.current = loadedDraft.notes ?? '';
      reasonTextRef.current = loadedDraft.not_inspected_reason ?? '';
      setLoading(false);
    })();
  }, [uuid, pointIdNumber]);

  // Rede de segurança: se o técnico sair da tela sem tocar em "Concluir ponto", o rascunho atual não se perde.
  useEffect(() => {
    return () => {
      void saveAndSyncInspection(uuid, pointIdNumber, draftRef.current);
    };
  }, [uuid, pointIdNumber]);

  const captureOptionalLocation = async () => {
    setCapturingLocation(true);
    const result = await captureLocation();
    if (result.status === 'granted') {
      persist({ latitude: result.location.latitude, longitude: result.location.longitude });
    }
    setCapturingLocation(false);
  };

  const setConsumptionCode = (code: ConsumptionCode) => {
    const requiresReplacement = code === '1' || code === 'E';
    persist({ consumption_code: code, replaced: requiresReplacement ? true : draft.replaced });
  };

  const setSpeciesCount = (speciesId: number, field: 'live_count' | 'dead_count', value: number) => {
    const others = draft.species.filter((entry) => entry.species_id !== speciesId);
    const current = draft.species.find((entry) => entry.species_id === speciesId) ?? {
      species_id: speciesId,
      live_count: 0,
      dead_count: 0,
    };
    const updated = { ...current, [field]: value };
    const next = updated.live_count > 0 || updated.dead_count > 0 ? [...others, updated] : others;
    persist({ species: next });
  };

  const handleKeepLocal = async () => {
    setResolvingConflict(true);
    const result = await resolveConflictKeepLocal(uuid, pointIdNumber);
    setResolvingConflict(false);

    if (result.synced) {
      setConflictServer(null);
      setFeedback(null);
      return;
    }

    if (result.conflict) {
      const local = await getLocalInspection(uuid, pointIdNumber);
      setConflictServer(local?.conflictServer ?? null);
      setFeedback('O servidor mudou de novo enquanto você decidia. Revise e tente de novo.');
      return;
    }

    setFeedback(result.reason);
  };

  const handleUseServer = async () => {
    setResolvingConflict(true);
    await resolveConflictUseServer(uuid, pointIdNumber);
    const local = await getLocalInspection(uuid, pointIdNumber);
    setResolvingConflict(false);
    setConflictServer(null);

    if (local) {
      setDraft(local.draft);
      notesTextRef.current = local.draft.notes ?? '';
      reasonTextRef.current = local.draft.not_inspected_reason ?? '';
    }
  };

  const handleFinish = async () => {
    // Garante o texto mais recente mesmo se o campo ainda estiver em foco (sem blur disparado).
    const finalDraft: InspectionDraft = { ...draft, notes: notesTextRef.current, not_inspected_reason: reasonTextRef.current };

    if (finalDraft.not_inspected && !finalDraft.not_inspected_reason?.trim()) {
      setFeedback('Informe a justificativa para o ponto não acessado.');
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const result = await saveAndSyncInspection(uuid, pointIdNumber, finalDraft);
    setSubmitting(false);

    if (!result.synced) {
      setFeedback('Sem conexão agora. O ponto foi salvo no aparelho e será enviado quando houver internet.');
      setTimeout(() => router.back(), 1200);
      return;
    }

    router.back();
  };

  if (loading || !point) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  const showsConsumption = point.category_key === 'roedores' || point.default_product_id != null;
  const relevantSpecies = species.filter((item) => item.category_key === point.category_key);
  const speciesToShow = relevantSpecies.length > 0 ? relevantSpecies : species;

  return (
    <SafeAreaView className="flex-1 bg-green-50" edges={['top', 'bottom']}>
    <ScrollView
      contentContainerClassName="gap-4 px-5 pb-8 pt-2"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} hitSlop={8} className="min-h-10 self-start justify-center pr-4">
        <Text className="text-sm text-green-700">‹ Pontos de controle</Text>
      </Pressable>
      <View>
        <Text className="text-xl font-semibold text-green-950">{point.code ?? point.label}</Text>
        <Text className="text-sm text-neutral-600">{point.label}</Text>
      </View>

      {conflictServer ? (
        <View className="gap-2 rounded-xl border border-red-300 bg-red-50 p-4">
          <Text className="text-sm font-semibold text-red-800">
            Este ponto foi alterado por outra origem (painel web ou outro aparelho) antes deste envio.
          </Text>
          <Text className="text-xs text-red-700">
            Servidor: consumo {conflictServer.consumption_code ?? '—'}, {conflictServer.live_count} vivo(s) /{' '}
            {conflictServer.dead_count} morto(s)
            {conflictServer.notes ? ` — "${conflictServer.notes}"` : ''}.
          </Text>
          <Text className="text-xs text-red-700">
            Aparelho: consumo {draft.consumption_code ?? '—'}, {draft.live_count} vivo(s) / {draft.dead_count} morto(s)
            {draft.notes ? ` — "${draft.notes}"` : ''}.
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleUseServer}
              disabled={resolvingConflict}
              className="flex-1 items-center rounded-xl border border-red-400 py-2 disabled:opacity-50"
            >
              <Text className="text-sm font-medium text-red-800">Usar dados do servidor</Text>
            </Pressable>
            <Pressable
              onPress={handleKeepLocal}
              disabled={resolvingConflict}
              className="flex-1 items-center rounded-xl bg-red-700 py-2 disabled:opacity-50"
            >
              <Text className="text-sm font-medium text-white">Manter dados do aparelho</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View className="flex-row items-center justify-between rounded-2xl border border-green-100 bg-white p-4">
        <Text className="text-base font-medium text-green-950">Ponto não acessível</Text>
        <Switch value={draft.not_inspected} onValueChange={(value) => persist({ not_inspected: value })} />
      </View>

      {draft.not_inspected ? (
        <View className="gap-1">
          <Text className="text-sm font-medium text-neutral-700">Justificativa (obrigatória)</Text>
          <TextInput
            defaultValue={draft.not_inspected_reason ?? ''}
            onChangeText={(text) => (reasonTextRef.current = text)}
            onBlur={() => persist({ not_inspected_reason: reasonTextRef.current })}
            multiline
            numberOfLines={3}
            placeholder="Explique por que o ponto não pôde ser inspecionado…"
            className="rounded-xl border border-neutral-300 px-3 py-2 text-base text-green-950"
          />
        </View>
      ) : (
        <>
          {showsConsumption ? (
            <View className="gap-2">
              <Text className="text-sm font-medium text-neutral-700">Consumo</Text>
              <View className="flex-row gap-2">
                {(Object.keys(CONSUMPTION_LABELS) as ConsumptionCode[]).map((code) => (
                  <Pressable
                    key={code}
                    onPress={() => setConsumptionCode(code)}
                    className={`flex-1 items-center rounded-xl border py-2 ${draft.consumption_code === code ? 'border-green-700 bg-green-600' : 'border-neutral-300'}`}
                  >
                    <Text className={draft.consumption_code === code ? 'font-medium text-white' : 'text-green-950'}>
                      {CONSUMPTION_LABELS[code]}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {draft.consumption_code === '1' || draft.consumption_code === 'E' ? (
                <Text className="text-xs font-medium text-amber-700">
                  {draft.consumption_code === 'E' ? 'Produto estragado — substituição necessária.' : 'Substituição necessária.'}
                </Text>
              ) : null}

              {consumptionTypes.length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  {consumptionTypes.map((type) => (
                    <Pressable
                      key={type.key}
                      onPress={() => persist({ consumption_type: type.key })}
                      className={`rounded-full border px-3 py-1 ${draft.consumption_type === type.key ? 'border-green-700 bg-green-600' : 'border-neutral-300'}`}
                    >
                      <Text
                        className={`text-xs ${draft.consumption_type === type.key ? 'font-medium text-white' : 'text-green-950'}`}
                      >
                        {type.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              {products.length > 0 ? (
                <View className="gap-1">
                  <Text className="text-xs text-neutral-500">Produto</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {products.map((product) => (
                      <Pressable
                        key={product.id}
                        onPress={() => persist({ product_id: product.id })}
                        className={`rounded-full border px-3 py-1 ${draft.product_id === product.id ? 'border-green-700 bg-green-600' : 'border-neutral-300'}`}
                      >
                        <Text
                          className={`text-xs ${draft.product_id === product.id ? 'font-medium text-white' : 'text-green-950'}`}
                        >
                          {product.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}

          <View className="flex-row items-center justify-between rounded-2xl border border-green-100 bg-white p-4">
            <Text className="text-base font-medium text-green-950">Troca do dispositivo/isca</Text>
            <Switch value={draft.replaced} onValueChange={(value) => persist({ replaced: value })} />
          </View>

          {deviceConditions.length > 0 ? (
            <View className="gap-1">
              <Text className="text-sm font-medium text-neutral-700">Condição do dispositivo</Text>
              <View className="flex-row flex-wrap gap-2">
                {deviceConditions.map((condition) => (
                  <Pressable
                    key={condition}
                    onPress={() => persist({ device_condition: condition })}
                    className={`rounded-full border px-3 py-1 ${draft.device_condition === condition ? 'border-green-700 bg-green-600' : 'border-neutral-300'}`}
                  >
                    <Text
                      className={`text-xs ${draft.device_condition === condition ? 'font-medium text-white' : 'text-green-950'}`}
                    >
                      {condition}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <View className="flex-row gap-4 rounded-2xl border border-green-100 bg-white p-4">
            <Stepper label="Vivos" value={draft.live_count} onChange={(value) => persist({ live_count: value })} />
            <Stepper label="Mortos" value={draft.dead_count} onChange={(value) => persist({ dead_count: value })} />
          </View>

          {speciesToShow.length > 0 ? (
            <View className="gap-2">
              <Text className="text-sm font-medium text-neutral-700">Pragas encontradas</Text>
              {speciesToShow.map((item) => {
                const current = draft.species.find((entry) => entry.species_id === item.id);
                return (
                  <View key={item.id} className="flex-row items-center justify-between rounded-xl border border-green-100 bg-white p-3">
                    <Text className="flex-1 text-sm text-green-950">{item.name}</Text>
                    <Stepper
                      label="Vivos"
                      value={current?.live_count ?? 0}
                      onChange={(value) => setSpeciesCount(item.id, 'live_count', value)}
                    />
                    <Stepper
                      label="Mortos"
                      value={current?.dead_count ?? 0}
                      onChange={(value) => setSpeciesCount(item.id, 'dead_count', value)}
                    />
                  </View>
                );
              })}
            </View>
          ) : null}

          <View className="gap-1">
            <Text className="text-sm font-medium text-neutral-700">Observação</Text>
            <TextInput
              defaultValue={draft.notes ?? ''}
              onChangeText={(text) => (notesTextRef.current = text)}
              onBlur={() => persist({ notes: notesTextRef.current })}
              multiline
              numberOfLines={3}
              placeholder="Observações sobre o ponto…"
              className="rounded-xl border border-neutral-300 px-3 py-2 text-base text-green-950"
            />
          </View>
        </>
      )}

      <View className="gap-1 rounded-2xl border border-green-100 bg-white p-4">
        <Text className="text-sm font-medium text-green-950">Localização (opcional)</Text>
        {draft.latitude != null && draft.longitude != null ? (
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-neutral-500">Capturada</Text>
            <Pressable onPress={() => persist({ latitude: null, longitude: null })}>
              <Text className="text-xs text-red-600">Remover</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={captureOptionalLocation}
            disabled={capturingLocation}
            className="min-h-11 items-center justify-center rounded-xl border border-green-200 px-4"
          >
            <Text className="text-sm font-medium text-green-950">
              {capturingLocation ? 'Capturando…' : 'Capturar localização'}
            </Text>
          </Pressable>
        )}
      </View>

      <PhotoEvidenceSection
        visitUuid={uuid}
        pointId={pointIdNumber}
        categories={POINT_PHOTO_CATEGORIES}
        latitude={draft.latitude}
        longitude={draft.longitude}
      />

      {feedback ? <Text className="text-sm text-amber-700">{feedback}</Text> : null}

      <Pressable
        onPress={handleFinish}
        disabled={submitting || !!conflictServer}
        className="min-h-14 items-center justify-center rounded-2xl bg-green-600 px-5 disabled:opacity-50"
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-base font-semibold text-white">
            {conflictServer ? 'Resolva o conflito para continuar' : 'Concluir ponto'}
          </Text>
        )}
      </Pressable>
    </ScrollView>
    </SafeAreaView>
  );
}
