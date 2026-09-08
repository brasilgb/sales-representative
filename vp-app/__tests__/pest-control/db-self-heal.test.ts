import * as ExpoSQLite from 'expo-sqlite';

import { getLocalInspection, saveLocalInspection } from '@/lib/pest-control/db';
import { emptyInspectionDraft } from '@/lib/pest-control/types';

/**
 * Regressão do bug relatado em produção: ao clicar em "resolver conflito", o
 * app ficava preso em "carregando" com o erro nativo do Android
 * "NativeDatabase.prepareAsync ... Cannot convert provided JavaScriptObject
 * to the SharedObject, because it doesn't contain valid id" (handle nativo
 * do SQLite invalidado no meio da sessão). `getDb()` (ver db.ts) agora
 * reconhece esse erro e reabre a conexão sozinho, tentando a mesma chamada
 * mais uma vez — este teste força exatamente esse erro numa única chamada e
 * confirma que a operação ainda assim é concluída com sucesso.
 */
describe('autorrecuperação de handle nativo do SQLite inválido', () => {
  it('reabre a conexão e repete a chamada quando um método falha com o erro de handle inválido', async () => {
    await saveLocalInspection('visit-self-heal-1', 1, {
      ...emptyInspectionDraft(),
      notes: 'antes do handle nativo invalidar',
    });

    const db = await ExpoSQLite.openDatabaseAsync('pest_control.db');
    const original = db.getFirstAsync.bind(db);
    let calls = 0;

    db.getFirstAsync = ((...args: Parameters<typeof original>) => {
      calls += 1;
      if (calls === 1) {
        return Promise.reject(
          new Error(
            "Call to function 'NativeDatabase.prepareAsync' has been rejected.\n" +
              "→ Caused by: Cannot convert provided JavaScriptObject to the SharedObject, because it doesn't contain valid id",
          ),
        );
      }
      return original(...args);
    }) as typeof db.getFirstAsync;

    try {
      const local = await getLocalInspection('visit-self-heal-1', 1);

      expect(local?.draft.notes).toBe('antes do handle nativo invalidar');
      expect(calls).toBeGreaterThanOrEqual(2);
    } finally {
      db.getFirstAsync = original;
    }
  });

  it('propaga o erro normalmente quando ele não é o de handle nativo inválido', async () => {
    const db = await ExpoSQLite.openDatabaseAsync('pest_control.db');
    const original = db.getFirstAsync.bind(db);

    db.getFirstAsync = (() => Promise.reject(new Error('Falha de disco genérica.'))) as typeof db.getFirstAsync;

    try {
      await expect(getLocalInspection('visit-self-heal-2', 1)).rejects.toThrow('Falha de disco genérica.');
    } finally {
      db.getFirstAsync = original;
    }
  });
});
