import * as Location from 'expo-location';

const CAPTURE_TIMEOUT_MS = 20000;

export type CapturedLocation = { latitude: number; longitude: number; accuracy: number | null };

export type LocationCaptureResult =
  { status: 'granted'; location: CapturedLocation } | { status: 'denied' } | { status: 'unavailable'; message: string };

/**
 * Captura localização para check-in/check-out (ver app-tecnico.md, seção
 * CHECK-IN: "se o GPS falhar, permitir nova tentativa, apresentar
 * orientação clara"). Nunca inventa coordenadas: qualquer falha aqui
 * resulta em latitude/longitude nulas, nunca um valor arbitrário.
 */
export async function captureLocation(): Promise<LocationCaptureResult> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return { status: 'denied' };
  }

  try {
    const position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      CAPTURE_TIMEOUT_MS,
    );

    return {
      status: 'granted',
      location: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      },
    };
  } catch {
    return {
      status: 'unavailable',
      message: 'Não foi possível obter sua localização. Verifique se o GPS está ativado e tente novamente.',
    };
  }
}

/**
 * Última posição conhecida, sem pedir permissão nem acionar o GPS — para
 * campos "quando disponível" que não merecem interromper o fluxo (ex.:
 * localização da assinatura). Nunca solicita permissão: só usa o que já foi
 * concedido antes.
 */
export async function getLastKnownLocation(): Promise<CapturedLocation | null> {
  const { status } = await Location.getForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  try {
    const position = await Location.getLastKnownPositionAsync();
    if (!position) return null;

    return { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy };
  } catch {
    return null;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
