import type { Character } from "../api/types";

export interface QuizQuestion {
  targetId: number;
  /** Quatro ids distintos, ja embaralhados. */
  optionIds: number[];
}

/**
 * Sorteia uma pergunta a partir do elenco reconhecivel (com imagem, com vila e
 * com mais de 4 jutsu). O `guard` evita laco infinito se o pool for pequeno e
 * o sorteio insistir em repetir o mesmo personagem.
 */
export function drawQuestion(pool: Character[]): QuizQuestion | null {
  if (pool.length < 4) return null;

  const pick = () => pool[Math.floor(Math.random() * pool.length)];
  const target = pick();
  const options: Character[] = [target];

  let guard = 0;
  while (options.length < 4 && guard++ < 200) {
    const candidate = pick();
    if (!options.some((o) => o.id === candidate.id)) options.push(candidate);
  }

  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return { targetId: target.id, optionIds: options.map((o) => o.id) };
}
