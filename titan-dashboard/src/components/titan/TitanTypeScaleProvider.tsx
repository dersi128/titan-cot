import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyTitanTypeScale,
  parseTitanTypeScale,
  TITAN_TYPE_DEFAULT,
  TITAN_TYPE_STORAGE_KEY,
  type TitanTypeScaleId,
} from "../../lib/titanTypeScale";

function readStoredScale(): TitanTypeScaleId {
  try {
    return parseTitanTypeScale(localStorage.getItem(TITAN_TYPE_STORAGE_KEY)) ?? TITAN_TYPE_DEFAULT;
  } catch {
    return TITAN_TYPE_DEFAULT;
  }
}

type TitanTypeScaleContextValue = {
  scale: TitanTypeScaleId;
  setScale: (scale: TitanTypeScaleId) => void;
};

const TitanTypeScaleContext = createContext<TitanTypeScaleContextValue | null>(null);

export function TitanTypeScaleProvider({ children }: { children: ReactNode }) {
  const [scale, setScaleState] = useState<TitanTypeScaleId>(readStoredScale);

  const setScale = useCallback((next: TitanTypeScaleId) => {
    setScaleState(next);
    applyTitanTypeScale(next);
    try {
      localStorage.setItem(TITAN_TYPE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    applyTitanTypeScale(scale);
  }, [scale]);

  const value = useMemo(() => ({ scale, setScale }), [scale, setScale]);

  return <TitanTypeScaleContext.Provider value={value}>{children}</TitanTypeScaleContext.Provider>;
}

export function useTitanTypeScale() {
  const ctx = useContext(TitanTypeScaleContext);
  if (!ctx) {
    throw new Error("useTitanTypeScale must be used within TitanTypeScaleProvider");
  }
  return ctx;
}
