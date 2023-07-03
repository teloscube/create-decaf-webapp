/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_URL: string;
  readonly DECAF_WEBAPP_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
