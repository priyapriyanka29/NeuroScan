import { useMemo, useState } from "react";
import {
  Building2,
  ExternalLink,
  MapPin,
  MessageSquareQuote,
  Search,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { Alert } from "../ui/Alert";
import { EmptyState } from "../ui/EmptyState";
import {
  DIRECTORY_SOURCES,
  REFERRAL_BY_STAGE,
  countByRegion,
  filterDoctors,
} from "../../data/doctors";
import { STAGE_META } from "../../app/navigation";

const REGION_TABS = [
  { id: "all", label: "All regions" },
  { id: "bangalore", label: "Bengaluru" },
  { id: "india", label: "Rest of India" },
];

const SPECIALTY_TABS = [
  { id: "all", label: "Any specialty" },
  { id: "Neurology", label: "Neurology" },
  { id: "Psychiatry", label: "Psychiatry" },
];

const EVIDENCE = {
  listed: {
    label: "Dementia listed",
    className: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  },
  adjacent: {
    label: "Specialist, dementia focus not confirmed",
    className: "border-amber-400/35 bg-amber-400/10 text-amber-200",
  },
};

function Chip({ active, onClick, children, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg border px-3 py-1.5 text-[0.72rem] font-semibold transition ${
        active
          ? "border-glow-cyan/50 bg-glow-cyan/15 text-glow-cyan"
          : "border-line bg-white/[0.03] text-haze hover:border-white/20 hover:text-mist"
      }`}
    >
      {children}
      {count != null && <span className="ml-1.5 opacity-60">{count}</span>}
    </button>
  );
}

function DoctorCard({ doctor }) {
  const evidence = EVIDENCE[doctor.evidence] ?? EVIDENCE.adjacent;

  return (
    <li className="group flex flex-col gap-3 rounded-2xl border border-line bg-white/[0.03] p-4 transition hover:border-glow-cyan/35 hover:bg-white/[0.055]">
      <div className="min-w-0">
        <h4 className="text-[0.95rem] font-bold text-mist">{doctor.name}</h4>
        <p className="mono mt-0.5 text-[0.68rem] leading-relaxed text-dim">
          {doctor.quals ?? doctor.qualsNote}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.75rem] text-haze">
        <span className="inline-flex items-center gap-1.5">
          <Stethoscope size={13} className="shrink-0 text-glow-cyan" />
          {doctor.specialty}
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <Building2 size={13} className="shrink-0 text-violet-300" />
          <span className="truncate">{doctor.institution}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={13} className="shrink-0 text-glow-teal" />
          {doctor.city}
        </span>
      </div>

      <p className="text-[0.75rem] leading-relaxed text-dim">{doctor.evidenceNote}</p>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
        <span
          title={`Evidence flag: ${doctor.evidence}`}
          className={`rounded border px-2 py-0.5 text-[0.62rem] font-semibold tracking-wide uppercase ${evidence.className}`}
        >
          {evidence.label}
        </span>
        <a
          href={doctor.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[0.7rem] font-semibold text-haze transition hover:border-glow-cyan/50 hover:text-glow-cyan focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow-cyan"
        >
          Open {doctor.source}
          <ExternalLink size={12} />
        </a>
      </div>
    </li>
  );
}

/**
 * Post-prediction referral panel: stage-appropriate guidance plus a sourced
 * directory of real, publicly listed specialists. Deliberately issues no
 * medication and no fabricated contact details.
 */
export function DoctorDirectory({ predictedClass }) {
  const [region, setRegion] = useState("all");
  const [specialty, setSpecialty] = useState("all");
  const [query, setQuery] = useState("");

  const stage = STAGE_META[predictedClass];
  const referral = REFERRAL_BY_STAGE[predictedClass] ?? REFERRAL_BY_STAGE.NonDemented;
  const matches = useMemo(
    () => filterDoctors({ region, specialty, query }),
    [region, specialty, query]
  );

  const hasQuery = query.trim().length > 0;

  return (
    <Card className="animate-fade-up stagger-4">
      <CardHeader
        icon={<Stethoscope size={18} className="text-glow-teal" />}
        title="Consult a specialist"
        subtitle="Referral guidance for this result, plus publicly listed clinicians to approach"
        actions={
          <span className="badge badge-offline whitespace-nowrap">
            {matches.length} of {countByRegion("all")} shown
          </span>
        }
      />

      <CardBody className="space-y-5">
        {/* ---- Stage-based guidance, not a prescription ---- */}
        <div className="space-y-3.5">
          <Alert tone={referral.tone} title={`Suggested next step — ${referral.urgency}`}>
            <p>
              For a <strong className="text-mist">{stage?.label ?? predictedClass}</strong>{" "}
              result, discuss a referral to a{" "}
              <strong className="text-mist">{referral.specialist}</strong>.
            </p>
            <p className="mt-1.5">{referral.summary}</p>
          </Alert>

          <div className="rounded-2xl border border-line bg-white/[0.03] p-4">
            <div className="mb-2.5 flex items-center gap-2 text-[0.78rem] font-bold text-mist">
              <MessageSquareQuote size={15} className="text-glow-cyan" />
              Worth raising at that visit
            </div>
            <ul className="space-y-2">
              {referral.questions.map((q) => (
                <li
                  key={q}
                  className="flex gap-2.5 text-[0.79rem] leading-relaxed text-haze"
                >
                  <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-glow-cyan/70" />
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---- Directory controls ---- */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {REGION_TABS.map((tab) => (
              <Chip
                key={tab.id}
                active={region === tab.id}
                onClick={() => setRegion(tab.id)}
                count={tab.id === "all" ? undefined : countByRegion(tab.id)}
              >
                {tab.label}
              </Chip>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {SPECIALTY_TABS.map((tab) => (
              <Chip
                key={tab.id}
                active={specialty === tab.id}
                onClick={() => setSpecialty(tab.id)}
              >
                {tab.label}
              </Chip>
            ))}

            <label className="relative ml-auto min-w-[13rem] flex-1 sm:max-w-xs">
              <span className="sr-only">Search doctors by name, hospital or city</span>
              <Search
                size={14}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-dim"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, hospital, city…"
                className="w-full rounded-lg border border-line bg-white/[0.03] py-2 pr-3 pl-8 text-[0.78rem] text-mist placeholder:text-dim focus:border-glow-cyan/50 focus:outline-none"
              />
            </label>
          </div>
        </div>

        {/* ---- Results ---- */}
        {matches.length > 0 ? (
          <ul className="grid gap-3.5 sm:grid-cols-2">
            {matches.map((d) => (
              <DoctorCard key={d.id} doctor={d} />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<Search size={26} />}
            title="No matching doctors"
            description={
              hasQuery
                ? `Nothing in the directory matches “${query.trim()}” with the current filters.`
                : "No entries match the selected filters."
            }
          />
        )}

        {/* ---- Honest provenance ---- */}
        <div className="flex items-start gap-2.5 rounded-2xl border border-line bg-white/[0.03] p-3.5">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-glow-teal" />
          <p className="text-[0.75rem] leading-relaxed text-dim">
            Compiled {DIRECTORY_SOURCES.retrieved} from{" "}
            {DIRECTORY_SOURCES.note.toLowerCase()} Every entry links to its source page so you can
            confirm current appointments. This is signposting only —{" "}
            <strong className="text-haze">
              NeuroScan does not issue prescriptions, does not endorse these clinicians, and cannot
              refer you
            </strong>
            . Credentials, availability and fees must be confirmed directly with the institution.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
