import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

const PLUGIN_ID = "paperclip.hermitcrab";
const PLUGIN_VERSION = "0.1.0";

const SLOT_IDS = {
  dashboardWidget: "hermitcrab-dashboard-widget",
  sidebar: "hermitcrab-sidebar",
} as const;

const EXPORT_NAMES = {
  dashboardWidget: "HermitcrabWidget",
  sidebar: "HermitcrabSidebar",
} as const;

const TOOL_NAMES = {
  search: "hermitcrab-search",
} as const;

const manifest: PaperclipPluginManifestV1 = {
  id: PLUGIN_ID,
  apiVersion: 1,
  version: PLUGIN_VERSION,
  displayName: "Hermitcrab Knowledge Base",
  description:
    "Connects Paperclip to the Hermitcrab expert knowledge base. Provides a dashboard widget with stats, a sidebar for searching skills, and an agent tool for querying expert knowledge.",
  author: "Paperclip",
  categories: ["ui", "connector"],
  capabilities: [
    "http.outbound",
    "instance.settings.register",
    "agent.tools.register",
    "ui.dashboardWidget.register",
    "ui.sidebar.register",
  ],
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui",
  },
  instanceConfigSchema: {
    type: "object",
    properties: {
      apiKey: {
        type: "string",
        title: "Hermitcrab API Key",
        description: "API key for authenticating with the Hermitcrab API (sent via X-API-Key header).",
        default: "",
      },
      baseUrl: {
        type: "string",
        title: "Hermitcrab API Base URL",
        description: "Base URL for the Hermitcrab API.",
        default: "https://api.hermitcrab.app",
      },
    },
  },
  tools: [
    {
      name: TOOL_NAMES.search,
      displayName: "Hermitcrab Search",
      description:
        "Search the Hermitcrab expert knowledge base for skills, techniques, and principles matching a query.",
      parametersSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query to find relevant skills and knowledge.",
          },
          domain: {
            type: "string",
            description: "Optional domain to filter results (e.g. 'cooking', 'woodworking').",
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return (default: 5).",
          },
        },
        required: ["query"],
      },
    },
  ],
  ui: {
    slots: [
      {
        type: "dashboardWidget",
        id: SLOT_IDS.dashboardWidget,
        displayName: "Hermitcrab Knowledge Base",
        exportName: EXPORT_NAMES.dashboardWidget,
      },
      {
        type: "sidebar",
        id: SLOT_IDS.sidebar,
        displayName: "Hermitcrab",
        exportName: EXPORT_NAMES.sidebar,
      },
    ],
  },
};

export default manifest;
