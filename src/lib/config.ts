// Central config. All values come from .env (see .env.example).
// Vite exposes only VITE_-prefixed vars to the browser.

function need(key: string): string {
  const v = import.meta.env[key as keyof ImportMetaEnv] as string | undefined;
  if (!v) throw new Error(`Missing env var ${key}. Copy .env.example to .env and fill it in.`);
  return v;
}

export const config = {
  // --- SDK auth (OAuth PKCE, public SPA) ---
  baseUrl: import.meta.env.VITE_UIPATH_BASE_URL || "https://cloud.uipath.com",
  orgName: need("VITE_UIPATH_ORG_NAME"),
  tenantName: need("VITE_UIPATH_TENANT_NAME"),
  clientId: need("VITE_UIPATH_CLIENT_ID"),
  redirectUri: import.meta.env.VITE_UIPATH_REDIRECT_URI || "http://localhost:5173",
  // Must match the scopes granted to the External Application in Admin Center.
  // Maestro + Data Fabric (entities) + Orchestrator tasks (Action Center gate).
  scope:
    import.meta.env.VITE_UIPATH_SCOPE ||
    "PIMS DataFabric.Schema.Read DataFabric.Data.Read DataFabric.Data.Write OR.Tasks OR.Folders.Read",

  // --- Scoping to the Exchange Recon process ---
  // Maestro APIs key off folderKey (string); Orchestrator tasks off folderId (number).
  folderKey: need("VITE_UIPATH_FOLDER_KEY"),
  folderId: Number(import.meta.env.VITE_UIPATH_FOLDER_ID ?? "0"),
  // Match the Maestro process by display name (case-insensitive contains).
  exchangeProcessName: import.meta.env.VITE_EXCHANGE_PROCESS_NAME || "Exchange",

  // Poll interval for the live queue (ms).
  pollMs: Number(import.meta.env.VITE_POLL_MS ?? "8000"),
} as const;
