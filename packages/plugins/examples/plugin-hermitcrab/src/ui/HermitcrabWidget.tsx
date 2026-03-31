import { useState } from "react";
import { usePluginData, type PluginWidgetProps } from "@paperclipai/plugin-sdk/ui";

type StatsData = {
  total_skills: number;
  total_principles: number;
  total_channels: number;
  total_videos: number;
  total_packs: number;
  domains: string[];
};

const styles = {
  container: {
    padding: "16px",
    fontFamily: "var(--font-sans, system-ui, sans-serif)",
    fontSize: "13px",
    color: "var(--foreground, #222)",
  } as const,
  heading: {
    margin: "0 0 12px",
    fontSize: "15px",
    fontWeight: 600,
  } as const,
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginBottom: "12px",
  } as const,
  statCard: {
    padding: "10px 12px",
    borderRadius: "8px",
    background: "var(--muted, #f4f4f5)",
    textAlign: "center" as const,
  } as const,
  statValue: {
    fontSize: "22px",
    fontWeight: 700,
    lineHeight: 1.2,
    color: "var(--foreground, #111)",
  } as const,
  statLabel: {
    fontSize: "11px",
    color: "var(--muted-foreground, #666)",
    marginTop: "2px",
  } as const,
  domainList: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "4px",
    marginTop: "4px",
  } as const,
  domainTag: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "12px",
    background: "var(--accent, #e0e0e0)",
    fontSize: "11px",
    color: "var(--accent-foreground, #333)",
  } as const,
  error: {
    color: "var(--destructive, #dc2626)",
    fontSize: "12px",
  } as const,
  loading: {
    color: "var(--muted-foreground, #888)",
    fontSize: "12px",
  } as const,
};

function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

export function HermitcrabWidget({ context }: PluginWidgetProps) {
  const { data, loading, error } = usePluginData<StatsData>("hermitcrab-stats");

  return (
    <section aria-label="Hermitcrab Knowledge Base" style={styles.container}>
      <h3 style={styles.heading}>Hermitcrab Knowledge Base</h3>

      {loading && <div style={styles.loading}>Loading stats...</div>}

      {error && <div style={styles.error}>Failed to load stats: {String(error)}</div>}

      {data && (
        <>
          <div style={styles.grid}>
            <StatCard value={data.total_skills} label="Skills" />
            <StatCard value={data.total_principles} label="Principles" />
            <StatCard value={data.total_packs} label="Skill Packs" />
            <StatCard value={data.domains?.length ?? 0} label="Domains" />
          </div>

          {data.domains && data.domains.length > 0 && (
            <div>
              <div style={{ fontSize: "12px", fontWeight: 500, marginBottom: "4px" }}>
                Domains
              </div>
              <div style={styles.domainList}>
                {data.domains.map((domain) => (
                  <span key={domain} style={styles.domainTag}>
                    {domain}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
