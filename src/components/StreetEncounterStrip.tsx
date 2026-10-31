import React, { useState } from 'react';
import {
  DISTRICT_LABELS,
  STROLL_ENERGY_COST,
  StreetEncounterEngine,
} from '../core/street_encounter_engine';
import { CityDistrictId, PlayerData } from '../engine/types';
import { Footprints, HeartHandshake, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface StreetEncounterStripProps {
  player: PlayerData;
  onStrollDistrict: (districtId: CityDistrictId) => void;
  onTakeReaction: (encounterId: string) => void;
}

const STROLL_DESTINATIONS: { id: CityDistrictId; shortLabel: string }[] = [
  { id: 'RESIDENTIAL_SOI', shortLabel: 'ปากซอย/ตลาดนัด' },
  { id: 'BUSINESS_MARKET', shortLabel: 'ป้ายรถเมล์/ย่านงาน' },
  { id: 'ATHLETIC_CLUB', shortLabel: 'สวนสุขภาพ' },
  { id: 'COMMERCIAL_PLAZA', shortLabel: 'ย่านการค้า' },
];

export const StreetEncounterStrip: React.FC<StreetEncounterStripProps> = ({
  player,
  onStrollDistrict,
  onTakeReaction,
}) => {
  const [expandedDrawer, setExpandedDrawer] = useState<boolean>(false);

  const moveStatus = StreetEncounterEngine.canMoveInCity(player);
  if (!moveStatus.allowed) return null;

  const street =
    player.street_world ||
    StreetEncounterEngine.createInitialStreetWorld(player.background.location);
  const latest = street.recent_snippets[0] || null;
  const affinityTier = StreetEncounterEngine.getAffinityTierLabel(
    street.neighborhood_affinity
  );
  const canAffordStrollEnergy = player.stats.energy >= STROLL_ENERGY_COST;

  const formatDelta = (label: string, val: number) => {
    if (val === 0) return null;
    const sign = val > 0 ? '+' : '';
    return `${label} ${sign}${val}`;
  };

  return (
    <div
      role="region"
      aria-label="บรรยากาศริมทางและความสัมพันธ์คนในละแวกบ้าน"
      className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800"
    >
      {/* Compact Single-Row Atmospheric Bar */}
      <div className="px-5 py-4 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
              <Footprints className="w-4 h-4 shrink-0" />
              บรรยากาศริมทาง
            </span>
            {latest && (
              <>
                <span aria-hidden="true">·</span>
                <span>{latest.districtLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{latest.timeOfDayLabel}</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setExpandedDrawer((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-mono-num">
              เดินเล่นสำรวจย่าน · มิตรภาพ {street.neighborhood_affinity}/100 ({affinityTier})
            </span>
            {expandedDrawer ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {latest ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {latest.snippet}
              </p>

              {latest.reactionTaken && latest.reactionOutcomeText && (
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  ↳ {latest.reactionOutcomeText}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-mono-num text-slate-500 dark:text-slate-400">
                <span>พบตอนอายุ {latest.age} ปี</span>
                {[
                  formatDelta('ความสุข', latest.sanDelta),
                  formatDelta('มิตรภาพชุมชน', latest.localAffinityDelta),
                  formatDelta('เสน่ห์/สังคม', latest.socDelta),
                  latest.cashDelta !== 0
                    ? `เงินสด ${latest.cashDelta > 0 ? '+' : ''}${latest.cashDelta} บ.`
                    : null,
                ]
                  .filter(Boolean)
                  .map((item, idx) => (
                    <React.Fragment key={idx}>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          String(item).includes('+')
                            ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                            : 'text-rose-600 dark:text-rose-400 font-semibold'
                        }
                      >
                        {item}
                      </span>
                    </React.Fragment>
                  ))}
              </div>
            </div>

            {latest.reaction && !latest.reactionTaken && (
              <button
                type="button"
                disabled={
                  latest.reaction.cashCost > 0 &&
                  player.finance.cash < latest.reaction.cashCost
                }
                onClick={() => onTakeReaction(latest.id)}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                  latest.reaction.cashCost === 0 ||
                  player.finance.cash >= latest.reaction.cashCost
                    ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 hover:bg-amber-500 hover:text-slate-950 cursor-pointer'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{latest.reaction.promptLabel}</span>
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            ทุกครั้งที่สลับเมนูเดินทางในเมือง หรือกดปุ่ม &ldquo;เดินเล่นสำรวจย่าน&rdquo; ด้านขวาบน จะได้พบเรื่องราวผู้คนรอบตัวและสร้างความคุ้นเคยกับคนในซอย
          </p>
        )}
      </div>

      {/* Expandable Stroll Actions & Known Neighbors Drawer */}
      {expandedDrawer && (
        <div className="p-5 space-y-5 bg-slate-50/70 dark:bg-slate-950/40">
          {/* Active City Stroll Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                ออกไปเดินเล่นผ่อนคลายในย่านต่างๆ (ใช้ {STROLL_ENERGY_COST} พลังงาน/ครั้ง)
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                พลังงานคงเหลือ {player.stats.energy} แต้ม · มิตรภาพชุมชนตั้งแต่ 72 ขึ้นไป ได้โบนัสความสุข +2/ปี และช่วยเตือนภัยสายสืบ
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {STROLL_DESTINATIONS.map((dest) => (
                <button
                  key={dest.id}
                  type="button"
                  disabled={!canAffordStrollEnergy}
                  title={DISTRICT_LABELS[dest.id][player.background.location]}
                  onClick={() => onStrollDistrict(dest.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                    canAffordStrollEnergy
                      ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {dest.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Known Local Neighbors */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              คนคุ้นเคยประจำละแวกบ้าน ({street.known_locals.length} คน)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {street.known_locals.map((person) => (
                <div
                  key={person.id}
                  className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {person.name}
                    </span>
                    <span className="text-xs font-mono-num font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                      สนิท {person.affinity}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{person.role}</span>
                    <span className="font-mono-num">พบกัน {person.encounters} ครั้ง</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-transform duration-150 origin-left"
                      style={{ transform: `scaleX(${person.affinity / 100})` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {street.recent_snippets.length > 1 && (
            <div className="space-y-1.5 pt-3 border-t border-slate-200/80 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                บันทึกเหตุการณ์ริมทางก่อนหน้า
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {street.recent_snippets.slice(1, 5).map((item) => (
                  <li key={item.id}>
                    — [อายุ {item.age} · {item.districtLabel}] {item.snippet}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
