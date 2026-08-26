import type { Character, Dataset, Group } from "./types";

export const API_BASE = "https://dattebayo-api.onrender.com";

/** Aviso de "servidor hibernando" entra depois disso. */
export const SLOW_AFTER_MS = 4500;

/**
 * O plano gratuito do Render hiberna: a primeira requisicao pode levar 10-40s.
 * Damos folga de 90s antes de desistir, senao o abort mata justamente a
 * chamada que estava acordando o servidor.
 */
const TIMEOUT_MS = 90_000;

async function getList<T>(path: string, key: string, signal?: AbortSignal): Promise<T[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new Error("timeout")), TIMEOUT_MS);
  const onAbort = () => ctrl.abort(signal?.reason);
  signal?.addEventListener("abort", onAbort, { once: true });
  try {
    const res = await fetch(API_BASE + path, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as Record<string, unknown>;
    const list = json[key];
    return Array.isArray(list) ? (list as T[]) : [];
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

/**
 * As oito chamadas em paralelo, uma unica vez no mount. Depois disso busca,
 * filtro e ordenacao sao todos em memoria — nenhuma requisicao nova.
 */
export async function fetchDataset(signal?: AbortSignal): Promise<Dataset> {
  const [characters, villages, clans, teams, kekkei, tailed, akatsuki, kara] = await Promise.all([
    getList<Character>("/characters?page=1&limit=1500", "characters", signal),
    getList<Group>("/villages?limit=100", "villages", signal),
    getList<Group>("/clans?limit=100", "clans", signal),
    getList<Group>("/teams?limit=300", "teams", signal),
    getList<Group>("/kekkei-genkai?limit=100", "kekkei-genkai", signal),
    getList<Character>("/tailed-beasts?limit=50", "tailed-beasts", signal),
    getList<Character>("/akatsuki?limit=100", "akatsuki", signal),
    getList<Character>("/kara?limit=100", "kara", signal),
  ]);
  return { characters, villages, clans, teams, kekkei, tailed, akatsuki, kara };
}

export function loadErrorMessage(err: unknown): string {
  const detail = err instanceof Error ? err.message : String(err);
  return (
    `O servidor da API não respondeu (${detail}). ` +
    "Ele hiberna quando fica sem uso — tente de novo em alguns segundos."
  );
}
