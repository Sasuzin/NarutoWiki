import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SLOW_AFTER_MS, fetchDataset, loadErrorMessage } from "../api/client";
import type { Dataset } from "../api/types";
import { Dex } from "../data/dex";

export type ApiStatus = "loading" | "error" | "ready";

interface State {
  data: Dataset | null;
  error: string;
  loading: boolean;
  /** Liga em 4,5s e troca a mensagem: o servidor gratuito estava hibernando. */
  slow: boolean;
}

const INITIAL: State = { data: null, error: "", loading: true, slow: false };

/** Uma unica carga no boot; `reload` refaz as oito chamadas. */
export function useDataset() {
  const [state, setState] = useState<State>(INITIAL);
  const [attempt, setAttempt] = useState(0);
  const slowTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ data: null, error: "", loading: true, slow: false });
    slowTimer.current = window.setTimeout(() => {
      setState((s) => (s.loading ? { ...s, slow: true } : s));
    }, SLOW_AFTER_MS);

    fetchDataset(ctrl.signal)
      .then((data) => setState({ data, error: "", loading: false, slow: false }))
      .catch((err: unknown) => {
        if (ctrl.signal.aborted) return;
        setState({ data: null, error: loadErrorMessage(err), loading: false, slow: false });
      })
      .finally(() => window.clearTimeout(slowTimer.current));

    return () => {
      ctrl.abort();
      window.clearTimeout(slowTimer.current);
    };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  // O indice e caro: so reconstroi quando o dataset troca de verdade.
  const dex = useMemo(() => (state.data ? new Dex(state.data) : null), [state.data]);

  const status: ApiStatus = state.loading ? "loading" : state.error ? "error" : "ready";

  return { dex, status, error: state.error, loading: state.loading, slow: state.slow, reload };
}
