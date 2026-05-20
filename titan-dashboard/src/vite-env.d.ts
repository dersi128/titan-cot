/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COT_API_URL?: string;
  readonly VITE_SEASONALITY_API_URL?: string;
  readonly VITE_USE_SEASONALITY_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
