import { fmtDate, formatTierMetric } from '../lib/helpers.js';

/**
 * Progress toward the next tier, exactly as the loyalty platform reports it.
 *
 * Every number here — the goal, the current value, the percentage, the date the
 * qualification period rolls over — comes from the platform. The app formats
 * them and nothing more, so a threshold changed in the console shows up here
 * without a release.
 *
 * Shared between the home screen and the digital card screen; a member at the
 * top tier (or barred from the next one by anything but spend) renders nothing.
 */
export default function TierProgressCard({ progress }) {
  if (!progress?.nextTierName) return null;

  const condition = progress.nextTierCurrentProgress?.[0];
  const eligible = progress.nextTierEligible !== false;
  const pct = Math.max(0, Math.min(100, progress.currentProgress ?? 0));

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm">
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[12px] font-bold text-gray-800">
            {eligible
              ? `${formatTierMetric(
                  condition?.attribute,
                  Math.max(0, (condition?.valueGoal ?? 0) - (condition?.currentValue ?? 0)),
                )} to ${progress.nextTierName}`
              : `${progress.nextTierName} — members only`}
          </p>
          {eligible && condition && (
            <p className="text-[11px] font-semibold text-gray-400">
              {formatTierMetric(condition.attribute, condition.currentValue)} /{' '}
              {formatTierMetric(condition.attribute, condition.valueGoal)}
            </p>
          )}
        </div>

        {eligible ? (
          <>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            {progress.nextRecalculationAt && (
              <p className="mt-1.5 text-[10.5px] text-gray-400">
                Qualifying period resets {fmtDate(progress.nextRecalculationAt)}
              </p>
            )}
          </>
        ) : (
          <p className="mt-1 text-[11px] leading-snug text-gray-500">
            {progress.nextTierName} is open to NTUC union members automatically, or on
            reaching the spend threshold.
          </p>
        )}
      </div>
    </div>
  );
}
