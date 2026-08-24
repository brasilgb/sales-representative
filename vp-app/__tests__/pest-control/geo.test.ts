import { distanceMeters } from '@/lib/pest-control/geo';

describe('distanceMeters', () => {
  it('é zero entre o mesmo ponto', () => {
    expect(distanceMeters(-23.5505, -46.6333, -23.5505, -46.6333)).toBe(0);
  });

  it('bate com a distância conhecida entre dois pontos de referência (~1.1km)', () => {
    // Praça da Sé -> Av. Paulista/Consolação, São Paulo — referência pública, ~1.1km.
    const distance = distanceMeters(-23.5505, -46.6333, -23.5605, -46.6333);
    expect(distance).toBeGreaterThan(1000);
    expect(distance).toBeLessThan(1200);
  });
});
