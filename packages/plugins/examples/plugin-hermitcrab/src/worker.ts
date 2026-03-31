import {
  definePlugin,
  runWorker,
  type PluginContext,
  type ToolResult,
} from "@paperclipai/plugin-sdk";

const PLUGIN_NAME = "hermitcrab";
const BASE_URL_DEFAULT = "https://api.hermitcrab.app";

type HermitcrabConfig = {
  apiKey?: string;
  baseUrl?: string;
};

type StatsResponse = {
  total_skills: number;
  total_principles: number;
  total_channels: number;
  total_videos: number;
  total_packs: number;
  domains: string[];
};

type SearchResult = {
  skill: {
    skill_id: string;
    title: string;
    domain: string;
    techniques: string[];
  };
  score: number;
  matching_principles: string[];
};

async function getConfig(ctx: PluginContext): Promise<HermitcrabConfig> {
  const config = await ctx.config.get();
  return {
    apiKey: "",
    baseUrl: BASE_URL_DEFAULT,
    ...(config as HermitcrabConfig),
  };
}

function apiHeaders(apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }
  return headers;
}

async function fetchStats(config: HermitcrabConfig): Promise<StatsResponse> {
  const baseUrl = config.baseUrl || BASE_URL_DEFAULT;
  const response = await fetch(`${baseUrl}/v1/admin/stats`, {
    method: "GET",
    headers: apiHeaders(config.apiKey ?? ""),
  });
  if (!response.ok) {
    throw new Error(`Hermitcrab stats request failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as StatsResponse;
}

async function searchSkills(
  config: HermitcrabConfig,
  query: string,
  domain?: string,
  limit?: number,
): Promise<SearchResult[]> {
  const baseUrl = config.baseUrl || BASE_URL_DEFAULT;
  const body: Record<string, unknown> = { query };
  if (domain) body.domain = domain;
  if (limit) body.limit = limit;

  const response = await fetch(`${baseUrl}/v1/search`, {
    method: "POST",
    headers: apiHeaders(config.apiKey ?? ""),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Hermitcrab search request failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as SearchResult[];
}

const plugin = definePlugin({
  async setup(ctx) {
    ctx.logger.info(`${PLUGIN_NAME} plugin setup complete`);

    // Register data handlers for UI components
    ctx.data.register("hermitcrab-stats", async () => {
      const config = await getConfig(ctx);
      return await fetchStats(config);
    });

    ctx.data.register("hermitcrab-search", async (params) => {
      const config = await getConfig(ctx);
      const query = typeof params.query === "string" ? params.query : "";
      const domain = typeof params.domain === "string" ? params.domain : undefined;
      const limit = typeof params.limit === "number" ? params.limit : 10;
      if (!query) return [];
      return await searchSkills(config, query, domain, limit);
    });

    // Register agent tool handler
    ctx.tools.register(
      "hermitcrab-search",
      {
        displayName: "Hermitcrab Search",
        description:
          "Search the Hermitcrab expert knowledge base for skills, techniques, and principles.",
        parametersSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query to find relevant skills and knowledge.",
            },
            domain: {
              type: "string",
              description: "Optional domain to filter results.",
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return (default: 5).",
            },
          },
          required: ["query"],
        },
      },
      async (params): Promise<ToolResult> => {
        const payload = params as { query?: string; domain?: string; limit?: number };
        if (!payload.query) {
          return { error: "query is required" };
        }
        try {
          const config = await getConfig(ctx);
          const results = await searchSkills(
            config,
            payload.query,
            payload.domain,
            payload.limit ?? 5,
          );
          if (results.length === 0) {
            return {
              content: `No Hermitcrab results found for "${payload.query}".`,
              data: { query: payload.query, results: [] },
            };
          }
          const summary = results
            .map(
              (r, i) =>
                `${i + 1}. ${r.skill.title} [${r.skill.domain}] (score: ${r.score.toFixed(2)}) — techniques: ${r.skill.techniques.join(", ")}`,
            )
            .join("\n");
          return {
            content: `Found ${results.length} Hermitcrab result(s) for "${payload.query}":\n${summary}`,
            data: { query: payload.query, results },
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { error: `Hermitcrab search failed: ${message}` };
        }
      },
    );
  },

  async onHealth() {
    return { status: "ok", message: "Hermitcrab plugin ready" };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
