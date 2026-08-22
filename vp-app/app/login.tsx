import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';

import { ApiError, useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sessão já restaurada/ativa: nada a fazer aqui, a home cuida do resto.
  if (!isLoading && isAuthenticated) {
    return <Redirect href="/" />;
  }

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    try {
      await login(email.trim(), password);
    } catch (caught) {
      if (caught instanceof ApiError) {
        const firstFieldError = caught.errors ? Object.values(caught.errors)[0]?.[0] : undefined;
        setError(firstFieldError ?? caught.message);
      } else {
        setError('Não foi possível entrar. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white">
      <View className="flex-1 justify-center gap-4 px-6">
        <View className="mb-6">
          <Text className="text-2xl font-semibold text-neutral-900">VetorPet</Text>
          <Text className="text-base text-neutral-500">Controle de Pragas — acesso do técnico</Text>
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-neutral-700">E-mail</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            editable={!submitting}
            className="rounded-lg border border-neutral-300 px-3 py-3 text-base text-neutral-900"
          />
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-neutral-700">Senha</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            editable={!submitting}
            className="rounded-lg border border-neutral-300 px-3 py-3 text-base text-neutral-900"
          />
        </View>

        {error ? <Text className="text-sm text-red-600">{error}</Text> : null}

        <Pressable
          onPress={handleSubmit}
          disabled={submitting || !email || !password}
          className="mt-2 items-center rounded-lg bg-neutral-900 py-3 disabled:opacity-50"
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-semibold text-white">Entrar</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
