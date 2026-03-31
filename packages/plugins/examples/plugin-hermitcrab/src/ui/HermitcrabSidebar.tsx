import { useState } from "react";
import { usePluginAction, usePluginData, type PluginSidebarProps } from "@paperclipai/plugin-sdk/ui";

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

const styles = {
  container: {
    padding: "12px",
    fontFamily: "var(--font-sans, system-ui, sans-serif)",
    fontSize: "13px",
    color: "var(--foreground, #222)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    height: "100%",
  } as const,
  heading: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 600,
  } as const,
  searchRow: {
    display: "flex",
    gap: "6px",
  } as const,
  input: {
    flex: 1,
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid var(--border, #d4d4d8)",
    background: "var(--input, #fff)",
    color: "var(--foreground, #222)",
    fontSize: "13px",
    outline: "none",
  } as const,
  button: {
    padding: "6px 14px",
    borderRadius: "6px",
    border: "none",
    background: "var(--primary, #18181b)",
    color: "var(--primary-foreground, #fff)",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
  } as const,
  resultCard: {
    padding: "10px 12px",
    borderRadius: "8px",
    background: "var(--muted, #f4f4f5)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  } as const,
  resultTitle: {
    fontWeight: 600,
    fontSize: "13px",
  } as const,
  resultMeta: {
    fontSize: "11px",
    color: "var(--muted-foreground, #666)",
  } as const,
  techniqueTag: {
    display: "inline-block",
    padding: "1px 6px",
    borderRadius: "10px",
    background: "var(--accent, #e0e0e0)",
    fontSize: "10px",
    color: "var(--accent-foreground, #333)",
    marginRight: "3px",
    marginTop: "2px",
  } as const,
  principleItem: {
    fontSize: "11px",
    color: "var(--muted-foreground, #555)",
    paddingLeft: "8px",
    borderLeft: "2px solid var(--border, #d4d4d8)",
    marginTop: "2px",
  } as const,
  empty: {
    fontSize: "12px",
    color: "var(--muted-foreground, #888)",
    textAlign: "center" as const,
    padding: "20px 0",
  } as const,
  error: {
    color: "var(--destructive, #dc2626)",
    fontSize: "12px",
  } as const,
  results: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    overflowY: "auto" as const,
    flex: 1,
  } as const,
};

export function HermitcrabSidebar({ context }: PluginSidebarProps) {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [domain, setDomain] = useState("");

  const { data, loading, error } = usePluginData<SearchResult[]>(
    "hermitcrab-search",
    searchQuery ? { query: searchQuery, domain: domain || undefined, limit: 10 } : {},
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      setSearchQuery(trimmed);
    }
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Hermitcrab Search</h3>

      <form onSubmit={handleSearch} style={styles.searchRow}>
        <input
          style={styles.input}
          type="text"
          placeholder="Search skills..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? "..." : "Search"}
        </button>
      </form>

      <input
        style={{ ...styles.input, marginTop: "-4px" }}
        type="text"
        placeholder="Filter by domain (optional)"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
      />

      {error && <div style={styles.error}>Search failed: {String(error)}</div>}

      <div style={styles.results}>
        {!searchQuery && (
          <div style={styles.empty}>Enter a query to search Hermitcrab skills.</div>
        )}

        {searchQuery && !loading && data && data.length === 0 && (
          <div style={styles.empty}>No results found for "{searchQuery}".</div>
        )}

        {data &&
          data.map((result) => (
            <div key={result.skill.skill_id} style={styles.resultCard}>
              <div style={styles.resultTitle}>{result.skill.title}</div>
              <div style={styles.resultMeta}>
                {result.skill.domain} — score: {result.score.toFixed(2)}
              </div>

              {result.skill.techniques.length > 0 && (
                <div>
                  {result.skill.techniques.map((t) => (
                    <span key={t} style={styles.techniqueTag}>
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {result.matching_principles.length > 0 && (
                <div>
                  {result.matching_principles.slice(0, 3).map((p, i) => (
                    <div key={i} style={styles.principleItem}>
                      {p}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
