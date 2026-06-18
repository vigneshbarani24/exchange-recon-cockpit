// Thin layer over the UiPath TypeScript SDK (v1.4.x).
// Uses the modular import pattern (smaller bundles) per the SDK docs.
import { UiPath } from "@uipath/uipath-typescript/core";
import { MaestroProcesses, ProcessInstances } from "@uipath/uipath-typescript/maestro-processes";
import { Tasks } from "@uipath/uipath-typescript/tasks";
import { Entities } from "@uipath/uipath-typescript/entities";
import { config } from "./config";

let _sdk: UiPath | null = null;

/** Build (once) and return the SDK. Caller must ensure it's initialized. */
export function getSdk(): UiPath {
  if (_sdk) return _sdk;
  _sdk = new UiPath({
    baseUrl: config.baseUrl,
    orgName: config.orgName,
    tenantName: config.tenantName,
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    scope: config.scope,
  });
  return _sdk;
}

/**
 * Drive the OAuth PKCE flow. For oauth auth, initialize() runs the interactive
 * redirect handshake; on the return leg it resolves once tokens are in place.
 * Safe to call on app load to complete a redirect, and on the login click.
 */
export async function ensureAuth(): Promise<UiPath> {
  const sdk = getSdk();
  await sdk.initialize();
  return sdk;
}

// Service factories — cheap to construct, so we make them on demand.
export const services = {
  maestro: (sdk: UiPath) => new MaestroProcesses(sdk),
  instances: (sdk: UiPath) => new ProcessInstances(sdk),
  tasks: (sdk: UiPath) => new Tasks(sdk),
  entities: (sdk: UiPath) => new Entities(sdk),
};

/** getAll() returns either a bare array or a paginated envelope across the SDK. */
export function unwrap<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object" && "items" in res) {
    return ((res as { items?: T[] }).items ?? []) as T[];
  }
  return [];
}
