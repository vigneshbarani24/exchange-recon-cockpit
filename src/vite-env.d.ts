/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_UIPATH_BASE_URL?: string;
  readonly VITE_UIPATH_ORG_NAME?: string;
  readonly VITE_UIPATH_TENANT_NAME?: string;
  readonly VITE_UIPATH_CLIENT_ID?: string;
  readonly VITE_UIPATH_REDIRECT_URI?: string;
  readonly VITE_UIPATH_SCOPE?: string;
  readonly VITE_UIPATH_FOLDER_KEY?: string;
  readonly VITE_UIPATH_FOLDER_ID?: string;
  readonly VITE_EXCHANGE_PROCESS_NAME?: string;
  readonly VITE_POLL_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
