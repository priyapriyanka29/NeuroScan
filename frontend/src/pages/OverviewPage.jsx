import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Cpu,
  History,
  ScanLine,
  Server,
  Timer,
} from "lucide-react";
import { ClinicalDisclaimer } from "../components/common/Disclaimer";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { STAGE_META, STAGE_ORDER } from "../app/navigation";
import { useApp } from "../context/app-context";

function StatCard({ icon, label, value, hint, accent = "text-glow-cyan", delay = 1 }) {
  const Icon = icon;
  return (
    <div className={`card card-hover animate-fade-up stagger-${delay} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="page-title-eyebrow">{label}</div>
        <Icon size={17} className={accent} />
      </div>
      <div className="mt-3 text-2xl font-extrabold tracking-tight text-mist">{value}</div>
      <div className="mt-1 text-[0.74rem] leading-snug text-dim">{hint}</div>
    </div>
  );
}

function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function OverviewPage() {
  const { health, connection, history, analysisResult } = useApp();

  const model = health?.model;
  const classes = health?.constraints?.classes ?? STAGE_ORDER;
  const latencies = history
    .map((item) => item.metadata?.processing_time_ms)
    .filter((v) => typeof v === "number");
  const medianLatency = median(latencies);
  const gradcamCount = history.filter((item) => item.gradcam?.available).length;

  const connectionLabel =
    connection.state === "ok"
      ? "Connected"
      : connection.state === "down"
        ? "Unreachable"
        : "Checking…";

  return (
    <div className="flex flex-col gap-6">
      {/* Hero strip */}
      <section className="glass glow-ring animate-fade-up relative overflow-hidden p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-glow-violet/15 blur-[90px]"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <span className="eyebrow">
              <BrainCircuit size={13} />
              Session overview
            </span>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {analysisResult ? "Last analysis ready for review" : "Ready when you are"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-haze">
              {analysisResult
                ? `Most recent scan classified as ${analysisResult.predicted_class} with ${(
                    analysisResult.confidence * 100
                  ).toFixed(1)}% confidence.`
                : "Load a T1-weighted brain MRI to run classification and Grad-CAM explainability through the live backend."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/app/analyze" className="btn btn-primary">
              <ScanLine size={16} />
              {analysisResult ? "Analyze another scan" : "Analyze MRI scan"}
            </Link>
            <Link to="/app/history" className="btn btn-secondary">
              <History size={16} />
              History
            </Link>
          </div>
        </div>
      </section>

      {/* Real statistics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Server}
          label="API connection"
          value={connectionLabel}
          hint={
            connection.latencyMs != null
              ? `Last probe ${connection.latencyMs} ms · ${new Date(
                  connection.checkedAt
                ).toLocaleTimeString()}`
              : connection.checkedAt
                ? `Last probe ${new Date(connection.checkedAt).toLocaleTimeString()}`
                : "Probing backend…"
          }
          accent={connection.state === "ok" ? "text-emerald-300" : "text-red-300"}
          delay={1}
        />
        <StatCard
          icon={Cpu}
          label="Model status"
          value={model?.is_ready ? "Loaded" : model ? "Unavailable" : "Unknown"}
          hint={model?.status_code ? `${model.status_code} · v${health?.version ?? "—"}` : "Awaiting health probe"}
          accent={model?.is_ready ? "text-emerald-300" : "text-amber-300"}
          delay={2}
        />
        <StatCard
          icon={Activity}
          label="Session analyses"
          value={String(history.length)}
          hint={history.length ? `${gradcamCount} with Grad-CAM attached` : "No scans analysed yet"}
          delay={3}
        />
        <StatCard
          icon={Timer}
          label="Median inference"
          value={medianLatency != null ? `${medianLatency} ms` : "—"}
          hint={
            latencies.length
              ? `From ${latencies.length} completed ${latencies.length === 1 ? "request" : "requests"}`
              : "Recorded after your first successful analysis"
          }
          accent="text-violet-300"
          delay={4}
        />
      </section>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Recent activity */}
        <Card className="min-w-0 animate-fade-up stagger-3">
          <CardHeader
            icon={<History size={18} className="text-glow-cyan" />}
            title="Recent activity"
            subtitle="In-memory session log — cleared when you close the tab"
            actions={
              <Link to="/app/history" className="btn btn-secondary btn-sm">
                View all
                <ArrowRight size={14} />
              </Link>
            }
          />
          <CardBody>
            {history.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-haze">Nothing analysed in this session yet.</p>
                <Link to="/app/analyze" className="btn btn-primary btn-sm mt-4">
                  <ScanLine size={14} />
                  Start an analysis
                </Link>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {history.slice(0, 4).map((item, idx) => (
                  <li
                    key={item.timestamp || idx}
                    className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.03] px-3.5 py-3 transition hover:border-glow-cyan/40"
                  >
                    {item.original_image_base64 && (
                      <img
                        src={item.original_image_base64}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-lg bg-black object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[0.86rem] font-semibold text-mist">
                        {item.filename || `Scan #${history.length - idx}`}
                      </div>
                      <div className="text-[0.72rem] text-dim">
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : "—"}
                      </div>
                    </div>
                    <span
                      className={`badge-stage stage-${item.predicted_class} hidden px-2.5 py-1 text-[0.72rem] sm:inline-flex`}
                    >
                      {item.predicted_class}
                    </span>
                    <span className="mono text-haze">
                      {(item.confidence * 100).toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Model + classes */}
        <Card className="min-w-0 animate-fade-up stagger-4">
          <CardHeader
            icon={<BrainCircuit size={18} className="text-glow-cyan" />}
            title="Active model"
            subtitle={health ? `Service: ${health.service}` : "Waiting for backend"}
          />
          <CardBody className="space-y-4">
            <dl className="space-y-2.5 text-[0.82rem]">
              {[
                ["Architecture", model?.architecture ?? health?.constraints?.architecture ?? "—"],
                ["Input tensor", model?.input_shape ? `${model.input_shape.join(" × ")}` : "—"],
                ["Grad-CAM layer", model?.gradcam_layer ?? "—"],
                ["Weights", model?.file_exists ? "File present" : "Not found"],
              ].map(([term, value]) => (
                <div key={term} className="flex items-center justify-between gap-3">
                  <dt className="shrink-0 text-dim">{term}</dt>
                  <dd className="mono min-w-0 truncate text-right text-mist">{value}</dd>
                </div>
              ))}
            </dl>

            <div>
              <div className="page-title-eyebrow mb-2">Output classes</div>
              <div className="flex flex-wrap gap-2">
                {classes.map((cls) => (
                  <span
                    key={cls}
                    className={`badge-stage stage-${cls} px-2.5 py-1 text-[0.7rem]`}
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>

            <Link to="/app/insights" className="btn btn-secondary btn-sm w-full">
              Open model insights
              <ArrowRight size={14} />
            </Link>
          </CardBody>
        </Card>
      </div>

      <div className="animate-fade-up stagger-5">
        <ClinicalDisclaimer />
      </div>
    </div>
  );
}
