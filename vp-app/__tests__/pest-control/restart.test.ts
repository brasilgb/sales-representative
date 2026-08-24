import * as ExpoSQLite from 'expo-sqlite';

import {
  __resetDbConnectionForTests,
  getLocalInspection,
  hasPendingCheckin,
  saveLocalInspection,
  savePendingCheckin,
} from '@/lib/pest-control/db';
import { emptyInspectionDraft } from '@/lib/pest-control/types';

// Só existe no mock de teste (__mocks__/expo-sqlite.js) — não faz parte da API real do pacote.
const __simulateAppRestart = (ExpoSQLite as unknown as { __simulateAppRestart: () => void }).__simulateAppRestart;

/**
 * Testes de encerramento inesperado (Etapa 8 do app-tecnico.md): simula o
 * app sendo morto e reaberto — descarta a conexão em cache (`getDb()`) e o
 * handle nativo (`__simulateAppRestart`, no mock de expo-sqlite), sem
 * apagar o arquivo em disco, e confirma que tudo que foi salvo antes
 * continua lá quando o app "reabre".
 */
describe('sobrevivência a encerramento inesperado', () => {
  it('um check-in salvo localmente continua pendente depois do app reabrir', async () => {
    await savePendingCheckin('visit-restart-1', {
      device_time: '2026-01-01T10:00:00Z',
      latitude: -23.5,
      longitude: -46.6,
      accuracy_meters: 5,
      justification: null,
      device_id: 'device-1',
      app_version: '1.0.0',
      offline_capture: true,
    });

    __simulateAppRestart();
    __resetDbConnectionForTests();

    expect(await hasPendingCheckin('visit-restart-1')).toBe(true);
  });

  it('um rascunho de inspeção em andamento não se perde', async () => {
    const draft = { ...emptyInspectionDraft(), notes: 'meio caminho andado quando o app fechou' };
    await saveLocalInspection('visit-restart-2', 42, draft);

    __simulateAppRestart();
    __resetDbConnectionForTests();

    const local = await getLocalInspection('visit-restart-2', 42);
    expect(local?.draft.notes).toBe('meio caminho andado quando o app fechou');
    expect(local?.syncStatus).toBe('pending');
  });

  it('mais de um ciclo de reabertura seguido continua encontrando o dado', async () => {
    await saveLocalInspection('visit-restart-3', 1, emptyInspectionDraft());

    __simulateAppRestart();
    __resetDbConnectionForTests();
    __simulateAppRestart();
    __resetDbConnectionForTests();
    __simulateAppRestart();
    __resetDbConnectionForTests();

    const local = await getLocalInspection('visit-restart-3', 1);
    expect(local).not.toBeNull();
  });
});
