// Mock de teste para expo-sqlite (Etapa 8 do app-tecnico.md): usa o módulo
// nativo `node:sqlite` do Node, então os testes rodam contra um SQLite de
// verdade — as mesmas instruções SQL de lib/pest-control/db.ts, não uma
// reimplementação. Cada arquivo de teste ganha um diretório temporário
// próprio (gerado uma vez, no carregamento do módulo), então testes em
// paralelo nunca disputam o mesmo arquivo.
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const os = require('os');
const path = require('path');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'expo-sqlite-mock-'));
const openDatabases = new Map();

function filePathFor(name) {
  return path.join(tempDir, name);
}

function normalizeParams(args) {
  if (args.length === 1 && Array.isArray(args[0])) return args[0];
  return args;
}

class MockDatabase {
  constructor(sqliteDb) {
    this._db = sqliteDb;
  }

  async execAsync(sql) {
    this._db.exec(sql);
  }

  async runAsync(sql, ...args) {
    const params = normalizeParams(args);
    return this._db.prepare(sql).run(...params);
  }

  async getAllAsync(sql, ...args) {
    const params = normalizeParams(args);
    return this._db.prepare(sql).all(...params);
  }

  async getFirstAsync(sql, ...args) {
    const params = normalizeParams(args);
    const row = this._db.prepare(sql).get(...params);
    return row ?? null;
  }

  async withTransactionAsync(callback) {
    this._db.exec('BEGIN');
    try {
      await callback();
      this._db.exec('COMMIT');
    } catch (error) {
      this._db.exec('ROLLBACK');
      throw error;
    }
  }
}

async function openDatabaseAsync(name) {
  const existing = openDatabases.get(name);
  if (existing) return existing;

  const wrapped = new MockDatabase(new DatabaseSync(filePathFor(name)));
  openDatabases.set(name, wrapped);

  return wrapped;
}

/**
 * Só para teste, não existe na API real: fecha o handle em memória sem
 * apagar o arquivo em disco — simula o app sendo encerrado e reaberto
 * (Etapa 8: "testes de encerramento inesperado"). A próxima
 * `openDatabaseAsync` com o mesmo nome reabre o mesmo arquivo.
 */
function __simulateAppRestart() {
  for (const db of openDatabases.values()) db._db.close();
  openDatabases.clear();
}

module.exports = { openDatabaseAsync, __simulateAppRestart };
