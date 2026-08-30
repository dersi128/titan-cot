import { useState } from "react";
import type { CotWeekSnapshotRow } from "../../lib/cotAsOfSnapshot";
import { formatContractsDelta } from "../../lib/titanDmeOverview";
import { verdictAccentClass } from "../../lib/titanCotScore";
import {
  commercialIndexToneClass,
  formatCommercialIndex,
} from "../../lib/titanCotIndexSettings";
import type { Locale } from "../../i18n/TitanI18n";
import { useTitanI18n } from "../../i18n";

type CotTimeMachineProps = {
  rows: CotWeekSnapshotRow[];
  selectedDate: string | null;
  latestDate: string | null;
  onSelect: (reportDate: string | null) => void;
};

function formatChipDate(reportDate: string, locale: Locale): string {
  const date = new Date(`${reportDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return reportDate;
  return date.toLocaleDateString(locale === "cs" ? "cs-CZ" : "en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function formatTableDate(reportDate: string, locale: Locale): string {
  const date = new Date(`${reportDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return reportDate;
  return date.toLocaleDateString(locale === "cs" ? "cs-CZ" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function scoreClass(score: number): string {
  if (score > 0) return "text-emerald-400";
  if (score < 0) return "text-rose-400";
  return "text-stone-400";
}

function formatScore(score: number): string {
  return score > 0 ? `+${score}` : String(score);
}

function ScoreSparkline({
  rows,
  selectedDate,
  onSelect,
  label,
}: {
  rows: CotWeekSnapshotRow[];
  selectedDate: string | null;
  onSelect: (reportDate: string) => void;
  label: string;
}) {
  const chronological = [...rows].reverse();
  if (chronological.length < 2) return null;

  const scores = chronological.map((row) => row.score);
  const min = Math.min(...scores, 0);
  const max = Math.max(...scores, 0);
  const span = Math.max(max - min, 1);
  const w = 240;
  const h = 44;
  const padX = 6;
  const padY = 6;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const points = chronological.map((row, i) => {
    const x = padX + (i / (chronological.length - 1)) * innerW;
    const y = padY + innerH - ((row.score - min) / span) * innerH;
    return { row, x, y };
  });

  const polyline = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const zeroY = padY + innerH - ((0 - min) / span) * innerH;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-11 w-full max-w-[240px]" role="img" aria-label={label}>
      <line x1={padX} y1={zeroY} x2={w - padX} y2={zeroY} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <polyline fill="none" stroke="rgba(125,211,252,0.85)" strokeWidth="1.5" points={polyline} />
      {points.map((p) => {
        const active = p.row.reportDate === selectedDate || (selectedDate === null && p.row.isLatest);
        return (
          <circle
            key={p.row.reportDate}
            cx={p.x}
            cy={p.y}
            r={active ? 3.2 : 2.1}
            fill={p.row.score > 0 ? "#34d399" : p.row.score < 0 ? "#fb7185" : "#a8a29e"}
            stroke={active ? "#e7e5e4" : "transparent"}
            strokeWidth={active ? 1.2 : 0}
            className="cursor-pointer"
            onClick={() => onSelect(p.row.reportDate)}
          >
            <title>{`${p.row.reportDate} · ${formatScore(p.row.score)}`}</title>
          </circle>
        );
      })}
    </svg>
  );
}

export function CotTimeMachine({ rows, selectedDate, latestDate, onSelect }: CotTimeMachineProps) {
  const { t, locale } = useTitanI18n();
  const [open, setOpen] = useState(false);
  if (rows.length < 2) return null;

  const effectiveSelected = selectedDate ?? latestDate;
  const selectedRow = rows.find((row) => row.reportDate === effectiveSelected) ?? rows[0]!;
  const viewingPast = Boolean(selectedDate && selectedDate !== latestDate);

  return (
    <section className="rounded-xl border border-white/[0.07] bg-black/25 p-3 md:px-5 md:py-3">
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-start justify-between gap-3 rounded-lg text-left transition hover:bg-white/[0.03]"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="cot-time-machine-body"
          aria-label={open ? t("detail.timeMachine.collapse") : t("detail.timeMachine.expand")}
        >
          <span>
            <span className="titan-cmd-kicker block">{t("detail.timeMachine.title")}</span>
            <span className="mt-1 block text-[12px] text-stone-500">
              {open ? t("detail.timeMachine.hint") : t("detail.timeMachine.collapsedHint")}
            </span>
          </span>
          <span className="mt-0.5 shrink-0 font-mono text-xs text-stone-500" aria-hidden>
            {open ? "−" : "+"}
          </span>
        </button>
        {viewingPast ? (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="shrink-0 self-start rounded border border-sky-400/40 bg-sky-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-200 transition hover:border-sky-300/60"
          >
            {t("detail.timeMachine.backToLatest")}
          </button>
        ) : null}
      </div>

      {viewingPast ? (
        <p className="mt-3 rounded-lg border border-amber-500/25 bg-amber-950/20 px-3 py-2 text-[12px] text-amber-100/90">
          {t("detail.timeMachine.asOfBanner", {
            date: formatTableDate(selectedRow.reportDate, locale),
            score: formatScore(selectedRow.score),
          })}
        </p>
      ) : null}

      {open ? (
      <div id="cot-time-machine-body" className="mt-3 space-y-4">
      <div
        className="flex gap-1.5 overflow-x-auto pb-1"
        role="radiogroup"
        aria-label={t("detail.timeMachine.weekGroup")}
      >
        {rows.map((row) => {
          const checked = row.reportDate === effectiveSelected;
          return (
            <button
              key={row.reportDate}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onSelect(row.isLatest ? null : row.reportDate)}
              className={`min-w-[4.75rem] shrink-0 rounded-lg border px-2 py-1.5 text-left transition ${
                checked
                  ? "border-sky-400/45 bg-sky-500/15"
                  : "border-white/[0.06] bg-black/30 hover:border-white/15"
              }`}
            >
              <span className="block font-mono text-[10px] uppercase tracking-wide text-stone-500">
                {row.isLatest ? t("detail.timeMachine.latest") : formatChipDate(row.reportDate, locale)}
              </span>
              <span className={`mt-0.5 block font-mono text-[12px] font-semibold tabular-nums ${scoreClass(row.score)}`}>
                {formatScore(row.score)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <ScoreSparkline
          rows={rows}
          selectedDate={effectiveSelected}
          onSelect={(date) => {
            const row = rows.find((item) => item.reportDate === date);
            onSelect(row?.isLatest ? null : date);
          }}
          label={t("detail.timeMachine.sparkline")}
        />
        <div className="min-w-0 flex-1 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[11px]">
            <thead>
              <tr className="text-[9px] font-semibold uppercase tracking-[0.12em] text-stone-600">
                <th className="pb-2 pr-3 font-medium">{t("detail.timeMachine.colDate")}</th>
                <th className="pb-2 pr-3 font-medium">{t("detail.timeMachine.colNet")}</th>
                <th className="pb-2 pr-3 font-medium">{t("detail.timeMachine.colDelta1w")}</th>
                <th className="pb-2 pr-3 font-medium">{t("detail.timeMachine.colIndex26")}</th>
                <th className="pb-2 pr-3 font-medium">{t("detail.timeMachine.colScore")}</th>
                <th className="pb-2 font-medium">{t("detail.timeMachine.colVerdict")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const active = row.reportDate === effectiveSelected;
                return (
                  <tr
                    key={row.reportDate}
                    tabIndex={0}
                    className={`cursor-pointer border-t border-white/[0.04] ${
                      active ? "bg-sky-500/[0.08]" : "hover:bg-white/[0.03]"
                    }`}
                    onClick={() => onSelect(row.isLatest ? null : row.reportDate)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelect(row.isLatest ? null : row.reportDate);
                      }
                    }}
                  >
                    <td className="py-1.5 pr-3 font-mono text-stone-300">
                      {formatTableDate(row.reportDate, locale)}
                      {row.isLatest ? (
                        <span className="ml-1.5 text-[9px] uppercase tracking-wider text-sky-300/80">
                          {t("detail.timeMachine.now")}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-1.5 pr-3 font-mono tabular-nums text-stone-200">
                      {row.commercialNet.toLocaleString()}
                    </td>
                    <td
                      className={`py-1.5 pr-3 font-mono tabular-nums ${
                        row.weeklyChange > 0 ? "text-emerald-400" : row.weeklyChange < 0 ? "text-rose-400" : "text-stone-400"
                      }`}
                    >
                      {formatContractsDelta(row.weeklyChange)}
                    </td>
                    <td className={`py-1.5 pr-3 font-mono tabular-nums ${commercialIndexToneClass(row.index26w)}`}>
                      {formatCommercialIndex(row.index26w)}
                    </td>
                    <td className={`py-1.5 pr-3 font-mono font-semibold tabular-nums ${scoreClass(row.score)}`}>
                      {formatScore(row.score)}
                    </td>
                    <td className={`py-1.5 font-medium ${verdictAccentClass(row.verdict)}`}>{row.verdict}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      ) : null}
    </section>
  );
}
