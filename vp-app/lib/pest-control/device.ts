import * as SecureStore from 'expo-secure-store';

// Identificador de instalação, não de hardware: gerado uma vez e guardado no
// armazenamento seguro do aparelho, só para vincular check-in/check-out e
// futuras evidências (Etapas 4+) ao mesmo dispositivo (ver campo `device_id`
// em App\Models\PestControl\Visit).
const DEVICE_ID_KEY = 'vp_pest_control_device_id';

function randomId(): string {
  const bytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  return bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function getDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) return existing;

  const generated = randomId();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, generated);

  return generated;
}
