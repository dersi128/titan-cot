/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
  readonly VITE_COT_API_URL?: string;
  readonly VITE_SEASONALITY_API_URL?: string;
  readonly VITE_USE_SEASONALITY_API?: string;
  readonly VITE_OHLC_PROVIDER?: string;
  readonly VITE_DEV_BYPASS_AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
