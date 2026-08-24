jest.mock('expo-location', () => ({
  Accuracy: { High: 4 },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
}));

import * as Location from 'expo-location';

import { captureLocation, getLastKnownLocation } from '@/lib/pest-control/location';

/**
 * Testes de GPS indisponível (Etapa 8 do app-tecnico.md): em nenhum cenário
 * de falha o app pode inventar coordenadas — latitude/longitude precisam
 * sair nulas, nunca um valor arbitrário (ver app-tecnico.md, seção CHECK-IN).
 */
describe('captureLocation: nunca inventa coordenadas quando o GPS falha', () => {
  afterEach(() => jest.clearAllMocks());

  it('permissão negada: devolve "denied", sem coordenadas', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const result = await captureLocation();

    expect(result.status).toBe('denied');
    expect(result).not.toHaveProperty('location');
  });

  it('GPS indisponível/timeout: devolve "unavailable" com mensagem clara, sem coordenadas', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('Location request failed'));

    const result = await captureLocation();

    expect(result.status).toBe('unavailable');
    if (result.status === 'unavailable') {
      expect(result.message).toMatch(/GPS/i);
    }
  });

  it('sucesso: devolve latitude/longitude/precisão reais do dispositivo', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: -23.55, longitude: -46.63, accuracy: 12 },
    });

    const result = await captureLocation();

    expect(result.status).toBe('granted');
    if (result.status === 'granted') {
      expect(result.location).toEqual({ latitude: -23.55, longitude: -46.63, accuracy: 12 });
    }
  });
});

describe('getLastKnownLocation: nunca pede permissão, só usa o que já existe', () => {
  afterEach(() => jest.clearAllMocks());

  it('sem permissão concedida antes: devolve null, sem solicitar nada', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });

    const result = await getLastKnownLocation();

    expect(result).toBeNull();
    expect(Location.getLastKnownPositionAsync).not.toHaveBeenCalled();
  });

  it('sem posição conhecida ainda: devolve null em vez de travar esperando um fix novo', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getLastKnownPositionAsync as jest.Mock).mockResolvedValue(null);

    const result = await getLastKnownLocation();

    expect(result).toBeNull();
  });
});
