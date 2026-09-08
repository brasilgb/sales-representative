/**
 * Executa `worker` para cada item de `items` com um número limitado de
 * execuções simultâneas. Usado nas filas de sincronização (Etapa 7): enviar
 * um item de cada vez em série soma a latência de rede vezes o total de
 * itens (visível sobretudo com várias fotos pendentes); enviar todos de uma
 * vez sobrecarrega uma conexão móvel fraca em campo. Cada worker só depende
 * do próprio item (ver comentários em cada fila), então a ordem de conclusão
 * não importa.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function runNext(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index]);
    }
  }

  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workerCount }, runNext));

  return results;
}
