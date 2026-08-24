const EARTH_RADIUS_METERS = 6371000;

/**
 * Mesma fórmula de Haversine do backend (ver App\Services\PestControl\PestControlGeo),
 * usada aqui só para orientar o técnico antes de enviar o check-in — quem
 * decide oficialmente se está fora do raio é sempre o servidor.
 */
export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLng = ((lng2 - lng1) * Math.PI) / 180;

  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}
