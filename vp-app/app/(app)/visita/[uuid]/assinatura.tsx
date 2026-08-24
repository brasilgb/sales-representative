import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';

import { getLastKnownLocation } from '@/lib/pest-control/location';
import { SIGNATURE_PAD_HTML } from '@/lib/pest-control/signature-pad-html';
import { performSignature } from '@/lib/pest-control/signature';
import type { SignaturePayload } from '@/lib/pest-control/types';

type PadMessage = { type: 'drawing_started' } | { type: 'export'; dataUrl: string };

/**
 * Assinatura e aceite (Etapa 6 do app-tecnico.md). Canvas HTML5 dentro de
 * uma WebView (mesma técnica do painel web, só que React Native não tem
 * `<canvas>` nativo). Confirmar salva local antes de tentar enviar — nunca
 * depende de internet para "terminar" a assinatura.
 */
export default function SignatureScreen() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const router = useRouter();
  // A tipagem pública do react-native-webview não expõe injectJavaScript no ref; funciona em runtime.
  const webViewRef = useRef<WebView>(null);
  const pendingActionRef = useRef<'confirm' | null>(null);

  const [responsibleName, setResponsibleName] = useState('');
  const [responsibleRole, setResponsibleRole] = useState('');
  const [responsibleDocument, setResponsibleDocument] = useState('');
  const [complianceText, setComplianceText] = useState('Declaro que acompanhei o serviço e aceito o resultado apresentado.');
  const [notes, setNotes] = useState('');
  const [hasDrawn, setHasDrawn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleClear = useCallback(() => {
    (webViewRef.current as unknown as { injectJavaScript: (script: string) => void } | null)?.injectJavaScript(
      'window.clearSignaturePad(); true;',
    );
    setHasDrawn(false);
  }, []);

  const finishWithSignature = useCallback(
    async (dataUrl: string) => {
      if (!responsibleName.trim()) {
        setFeedback('Informe o nome do responsável.');
        return;
      }

      setSubmitting(true);
      setFeedback(null);

      const location = await getLastKnownLocation();

      const payload: SignaturePayload = {
        responsible_name: responsibleName.trim(),
        responsible_role: responsibleRole.trim() || null,
        responsible_document: responsibleDocument.trim() || null,
        signature: dataUrl,
        compliance_text: complianceText.trim() || null,
        notes: notes.trim() || null,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
      };

      const result = await performSignature(uuid, payload);
      setSubmitting(false);

      if (!result.synced) {
        setFeedback('Sem conexão agora. A assinatura foi salva no aparelho e será enviada quando houver internet.');
        setTimeout(() => router.back(), 1500);
        return;
      }

      router.back();
    },
    [uuid, responsibleName, responsibleRole, responsibleDocument, complianceText, notes, router],
  );

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const message = JSON.parse(event.nativeEvent.data) as PadMessage;

      if (message.type === 'drawing_started') {
        setHasDrawn(true);
        return;
      }

      if (message.type === 'export' && pendingActionRef.current === 'confirm') {
        pendingActionRef.current = null;
        void finishWithSignature(message.dataUrl);
      }
    },
    [finishWithSignature],
  );

  const handleConfirm = () => {
    if (!hasDrawn) {
      setFeedback('Desenhe a assinatura antes de confirmar.');
      return;
    }
    if (!responsibleName.trim()) {
      setFeedback('Informe o nome do responsável.');
      return;
    }

    setFeedback(null);
    pendingActionRef.current = 'confirm';
    (webViewRef.current as unknown as { injectJavaScript: (script: string) => void } | null)?.injectJavaScript(
      'window.exportSignaturePad(); true;',
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-white pt-16"
      contentContainerClassName="gap-4 px-6 pb-12"
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={() => router.back()}>
        <Text className="text-sm text-blue-600">‹ Resumo</Text>
      </Pressable>
      <Text className="text-xl font-semibold text-neutral-900">Assinatura e aceite</Text>

      <View className="gap-1">
        <Text className="text-sm font-medium text-neutral-700">Nome do responsável *</Text>
        <TextInput
          value={responsibleName}
          onChangeText={setResponsibleName}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900"
        />
      </View>

      <View className="gap-1">
        <Text className="text-sm font-medium text-neutral-700">Função/cargo</Text>
        <TextInput
          value={responsibleRole}
          onChangeText={setResponsibleRole}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900"
        />
      </View>

      <View className="gap-1">
        <Text className="text-sm font-medium text-neutral-700">Documento (opcional)</Text>
        <TextInput
          value={responsibleDocument}
          onChangeText={setResponsibleDocument}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900"
        />
      </View>

      <View className="gap-1">
        <Text className="text-sm font-medium text-neutral-700">Texto de conformidade</Text>
        <TextInput
          value={complianceText}
          onChangeText={setComplianceText}
          multiline
          numberOfLines={2}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900"
        />
      </View>

      <View className="gap-1">
        <Text className="text-sm font-medium text-neutral-700">Ressalvas / observações</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={2}
          placeholder="Alguma ressalva sobre o serviço?"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900"
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-medium text-neutral-700">Assinatura</Text>
        <View className="h-56 overflow-hidden rounded-lg border border-neutral-300">
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: SIGNATURE_PAD_HTML }}
            onMessage={handleMessage}
            scrollEnabled={false}
            style={{ flex: 1 }}
          />
        </View>
        <Pressable onPress={handleClear} className="items-center rounded-lg border border-neutral-300 py-2">
          <Text className="text-sm font-medium text-neutral-900">Limpar e refazer</Text>
        </Pressable>
      </View>

      {feedback ? <Text className="text-sm text-amber-700">{feedback}</Text> : null}

      <Pressable
        onPress={handleConfirm}
        disabled={submitting}
        className="items-center rounded-lg bg-neutral-900 py-3 disabled:opacity-50"
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-base font-semibold text-white">Confirmar assinatura</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
