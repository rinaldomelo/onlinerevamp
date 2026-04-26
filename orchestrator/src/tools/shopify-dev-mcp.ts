// MCP client wrapper for @shopify/dev-mcp. Activates Pattern B (per ADR-002).
//
// Status (M7): scaffold. Real MCP client lifecycle (connect/disconnect, error
// handling, reconnection) gets fleshed out when the orchestrator actually
// runs. The signatures match the Toolkit's documented tool surface.

import type { z } from "zod";

// Toolkit tool names (validated by `listAvailableShopifyDevTools()` post-init).
export const TOOLKIT_TOOLS = {
  searchShopifyDocs: "searchShopifyDocs",
  searchAdminSchema: "searchAdminSchema",
  searchStorefrontSchema: "searchStorefrontSchema",
  validateLiquid: "validateLiquid",
  validateThemeBundle: "validateThemeBundle",
  validateGraphQL: "validateGraphQL",
} as const;

export type SearchDocsInput = { query: string; maxResults?: number };
export type SearchDocsResult = {
  results: Array<{ title: string; url: string; snippet: string }>;
};

export type ValidateLiquidInput = { content: string; filePath: string };
export type ValidateLiquidResult = {
  errors: Array<{ line: number; col: number; message: string; severity: string }>;
  warnings: Array<{ line: number; col: number; message: string; severity: string }>;
};

export type ValidateBundleInput = { files: string[] };
export type ValidateBundleResult = {
  errors: Array<{ file: string; line?: number; message: string }>;
  warnings: Array<{ file: string; line?: number; message: string }>;
};

export type SearchAdminSchemaInput = { query: string };
export type SearchAdminSchemaResult = {
  types: Array<{ name: string; kind: string; description?: string; fields?: unknown }>;
};

// ─── Client lifecycle (placeholder; real impl uses @modelcontextprotocol/sdk) ──

export interface ShopifyDevMcpClient {
  searchShopifyDocs(input: SearchDocsInput): Promise<SearchDocsResult>;
  searchAdminSchema(input: SearchAdminSchemaInput): Promise<SearchAdminSchemaResult>;
  validateLiquid(input: ValidateLiquidInput): Promise<ValidateLiquidResult>;
  validateThemeBundle(input: ValidateBundleInput): Promise<ValidateBundleResult>;
  listAvailableShopifyDevTools(): Promise<string[]>;
  close(): Promise<void>;
}

// Factory to be implemented in M7 close-out / M8.
//
// Sketch:
//   import { Client } from "@modelcontextprotocol/sdk/client";
//   import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";
//   const transport = new StdioClientTransport({ command: "npx", args: ["-y", "@shopify/dev-mcp@latest"] });
//   const client = new Client({ name: "onlinerevamp-orchestrator", version: "0.1.0" }, { capabilities: {} });
//   await client.connect(transport);
//   return wrapClient(client);
export async function createShopifyDevMcpClient(): Promise<ShopifyDevMcpClient> {
  throw new Error(
    "createShopifyDevMcpClient is not implemented yet. Scaffold only — see M7 spec."
  );
}
