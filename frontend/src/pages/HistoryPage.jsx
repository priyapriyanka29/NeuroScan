import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Download,
  Eye,
  Filter,
  History as HistoryIcon,
  ScanEye,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { STAGE_ORDER, stageColor } from "../app/navigation";
import { useApp } from "../context/app-context";

export function HistoryPage() {
  const navigate = useNavigate();
  const { history, clearHistory, selectFromHistory, exportHistory, addToast } = useApp();

  const [query, setQuery] = useState("");
  const [activeClass, setActiveClass] = useState("all");

  const availableClasses = useMemo(() => {
    const present = new Set(history.map((item) => item.predicted_class));
    return STAGE_ORDER.filter((cls) => present.has(cls));
  }, [history]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return history.filter((item) => {
      const matchesQuery =
        !q ||
        (item.filename ?? "").toLowerCase().includes(q) ||
        (item.predicted_class ?? "").toLowerCase().includes(q);
      const matchesClass = activeClass === "all" || item.predicted_class === activeClass;
      return matchesQuery && matchesClass;
    });
  }, [history, query, activeClass]);

  const openResult = (item) => {
    selectFromHistory(item);
    navigate("/app/results");
  };

  const openExplanation = (item) => {
    selectFromHistory(item);
    navigate("/app/gradcam");
  };

  const handleExport = () => {
    const url = exportHistory();
    addToast({
      type: "success",
      title: "Session exported",
      message: `JSON report written for ${history.length} record${history.length === 1 ? "" : "s"}.`,
    });
    return url;
  };

  const hasFilters = query.trim() !== "" || activeClass !== "all";

  return (
    <div className="flex flex-col gap-6">
      <Card className="animate-fade-up">
        <CardHeader
          icon={<HistoryIcon size={18} className="text-glow-cyan" />}
          title="Analysis history"
          subtitle="In-memory session log — records live only in this browser tab and vanish on reload"
          actions={
            history.length > 0 && (
              <div className="flex flex-wrap gap-2.5">
                <button className="btn btn-secondary btn-sm" onClick={handleExport}>
                  <Download size={14} />
                  Export JSON
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Clear ${history.length} session record${history.length === 1 ? "" : "s"}? This cannot be undone.`
                      )
                    ) {
                      clearHistory();
                    }
                  }}
                >
                  <Trash2 size={14} />
                  Clear history
                </button>
              </div>
            )
          }
        />

        <CardBody>
          {history.length === 0 ? (
            <EmptyState
              icon={<HistoryIcon size={26} />}
              title="No scans analysed yet"
              description="Every scan you analyse in this session is logged here with its label, confidence and timestamp. The log is not uploaded anywhere."
              action={
                <Link to="/app/analyze" className="btn btn-primary">
                  <ScanEye size={16} />
                  Analyze a scan
                </Link>
              }
            />
          ) : (
            <>
              {/* Search + filter */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-dim"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by file name or class…"
                    aria-label="Search analysis history"
                    className="w-full rounded-xl border border-line bg-white/[0.04] py-2.5 pr-3 pl-9 text-sm text-mist placeholder:text-dim focus:border-glow-cyan/50 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[0.72rem] text-dim">
                    <Filter size={13} />
                    Class
                  </span>
                  {["all", ...availableClasses].map((cls) => (
                    <button
                      key={cls}
                      onClick={() => setActiveClass(cls)}
                      aria-pressed={activeClass === cls}
                      className={`rounded-lg border px-2.5 py-1.5 text-[0.7rem] font-semibold transition ${
                        activeClass === cls
                          ? "border-glow-cyan/60 bg-glow-cyan/15 text-glow-cyan"
                          : "border-line bg-white/[0.03] text-haze hover:border-white/25 hover:text-mist"
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[0.74rem] text-dim">
                <span>
                  Showing {filtered.length} of {history.length} record
                  {history.length === 1 ? "" : "s"}
                </span>
                {hasFilters && (
                  <button
                    className="inline-flex items-center gap-1 text-glow-cyan hover:underline"
                    onClick={() => {
                      setQuery("");
                      setActiveClass("all");
                    }}
                  >
                    <X size={12} />
                    Reset filters
                  </button>
                )}
              </div>

              {/* Rows */}
              {filtered.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center">
                  <p className="text-sm text-haze">No records match the current filters.</p>
                  <button
                    className="btn btn-secondary btn-sm mt-4"
                    onClick={() => {
                      setQuery("");
                      setActiveClass("all");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <ul className="mt-4 space-y-2.5">
                  {filtered.map((item, idx) => {
                    const id = item.timestamp || `${item.filename}-${idx}`;
                    return (
                      <li
                        key={id}
                        className="group flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/[0.03] px-3.5 py-3 transition hover:border-glow-cyan/40 hover:bg-white/[0.05]"
                      >
                        {item.original_image_base64 ? (
                          <img
                            src={item.original_image_base64}
                            alt={`Thumbnail for ${item.filename ?? "scan"}`}
                            className="h-12 w-12 shrink-0 rounded-lg bg-black object-cover"
                          />
                        ) : (
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/5 text-dim">
                            <ScanEye size={18} />
                          </span>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[0.88rem] font-semibold text-mist">
                            {item.filename || `Scan #${history.length - idx}`}
                          </div>
                          <div className="text-[0.72rem] text-dim">
                            {item.timestamp ? new Date(item.timestamp).toLocaleString() : "timestamp unavailable"}
                            {item.metadata?.processing_time_ms != null &&
                              ` · ${item.metadata.processing_time_ms} ms`}
                          </div>
                        </div>

                        <span
                          className={`badge-stage stage-${item.predicted_class} px-2.5 py-1 text-[0.72rem]`}
                          style={{ borderColor: `${stageColor(item.predicted_class)}55` }}
                        >
                          {item.predicted_class}
                        </span>

                        <span className="mono w-16 text-right text-haze">
                          {(item.confidence * 100).toFixed(1)}%
                        </span>

                        <div className="flex gap-2">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openResult(item)}
                            title="Open full result"
                          >
                            <Eye size={13} />
                            <span className="hidden sm:inline">Inspect</span>
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openExplanation(item)}
                            title="Open Grad-CAM explanation"
                            disabled={!item.gradcam?.available}
                          >
                            <ScanEye size={13} />
                            <span className="hidden sm:inline">Explain</span>
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </CardBody>
      </Card>

      <Card className="animate-fade-up stagger-1 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl text-[0.8rem] leading-relaxed text-dim">
            <strong className="text-mist">Where this data lives:</strong> the log is a frontend
            session array — nothing is written to the backend, to local storage or to a database.
            Reloading the tab clears it by design, which keeps identifiable scan data from
            lingering on shared machines. Use <strong className="text-mist">Export JSON</strong> if
            you need to keep a copy.
          </div>
        </div>
      </Card>
    </div>
  );
}
