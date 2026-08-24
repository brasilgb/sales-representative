import { Linking, Platform } from 'react-native';

import type { Establishment } from './types';

/**
 * Abre o endereço no aplicativo de mapas instalado. Android tem um esquema
 * neutro de verdade (`geo:`), que deixa o sistema escolher entre os apps
 * instalados; iOS não oferece equivalente sem depender de um app
 * específico — `maps://` é o que a plataforma disponibiliza, mesmo assim.
 */
export function addressLine(establishment: Establishment): string {
  const parts = [
    [establishment.street, establishment.number].filter(Boolean).join(', '),
    establishment.district,
    [establishment.city, establishment.state].filter(Boolean).join('/'),
  ].filter(Boolean);

  return parts.join(' - ') || 'Endereço não informado';
}

export async function openInMaps(establishment: Establishment): Promise<void> {
  const label = encodeURIComponent(establishment.name);
  const hasCoordinates = establishment.latitude != null && establishment.longitude != null;
  const query = hasCoordinates
    ? `${establishment.latitude},${establishment.longitude}`
    : encodeURIComponent(addressLine(establishment));

  const url = Platform.select({
    android: `geo:0,0?q=${query}(${label})`,
    ios: `maps://?q=${label}&ll=${hasCoordinates ? query : ''}`,
    default: `https://www.google.com/maps/search/?api=1&query=${query}`,
  });

  if (url && (await Linking.canOpenURL(url))) {
    await Linking.openURL(url);
  }
}
