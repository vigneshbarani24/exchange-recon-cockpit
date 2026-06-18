import { defineConfig } from "vitest/config";

// Test-only env so config.ts (which throws on missing vars) loads under vitest.
// These are throwaway values; tests never hit a real tenant.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      VITE_UIPATH_ORG_NAME: "test-org",
      VITE_UIPATH_TENANT_NAME: "test-tenant",
      VITE_UIPATH_CLIENT_ID: "test-client",
      VITE_UIPATH_FOLDER_KEY: "test-folder",
    },
  },
});
