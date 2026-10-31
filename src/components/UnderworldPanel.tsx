import React, { useState } from 'react';
import {
  CRIME_OPERATIONS,
  SAFEHOUSE_TIERS,
  UnderworldEngine,
} from '../core/underworld_engine';
import { CAREER_MATRIX, CareerEngine } from '../engine/CareerEngine';
import { PlayerData, SafehouseId } from '../engine/types';
import {
  ShieldAlert,
  Skull,
  Flame,
  Lock,
  EyeOff,
  Home,
  RefreshCw,
  LogOut,
  ArrowRight,
} from 'lucide-react';

interface UnderworldPanelProps {
  player: PlayerData;
  onExecuteOperation: (opId: string) => void;
  onBribeReduceNotoriety: () => void;
  onAcquireSafehouse: (safehouseId: SafehouseId) => void;
  onRelocateSafehouse: () => void;
  onAbandonSafehouse: () => void;
  onLayLow: () => void;
  onApplyJob: (jobId: string, asSideJob: boolean) => void;
  onQuitJob: (isSideJob: boolean) => void;
}

type UnderworldSubTab = 'CAREER_LADDER' | 'SAFEHOUSES' | 'OPERATIONS';

export const UnderworldPanel: React.FC<UnderworldPanelProps> = ({
  player,
  onExecuteOperation,
  onBribeReduceNotoriety,
  onAcquireSafehouse,
  onRelocateSafehouse,
  onAbandonSafehouse,
  onLayLow,
  onApplyJob,
  onQuitJob,
}) => {
  const [subTab, setSubTab] = useState<UnderworldSubTab>('CAREER_LADDER');

  const arrestBreakdown = UnderworldEngine.calculateAnnualArrestRisk(player);
  const safehouseState = UnderworldEngine.getEffectiveSafehouseShield(player);
  const activeSafehouse = safehouseState.safehouse;
  const relocateCost = activeSafehouse ? Math.round(activeSafehouse.setupCost * 0.35) : 0;

  const canClearHeat =
    player.career.prison_years_left === 0 &&
    player.career.notoriety >= 15 &&
    player.finance.cash >= 35000;

  const canLayLow =
    player.career.prison_years_left === 0 &&
    player.career.notoriety > 0 &&
    player.stats.energy >= 25 &&
    (Boolean(activeSafehouse) || player.finance.cash >= 8000);

  const canRelocate =
    player.career.prison_years_left === 0 &&
    Boolean(activeSafehouse) &&
    (player.career.safehouse_security < 90 || player.career.notoriety >= 15) &&
    player.finance.cash >= relocateCost;

  const underworldJobs = CAREER_MATRIX.filter((j) => j.category === 'UNDERWORLD');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Skull className="w-5 h-5 text-rose-500 shrink-0" />
          <span>เส้นทางสายมืด ความเสี่ยงหมายจับ และแหล่งกบดาน</span>
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
          เงินไวแลกมาด้วยความเสี่ยงติดคุก: ยิ่งตำแหน่งใหญ่หรือรับงานสีเทาบ่อย ค่าหมายจับจะยิ่งพุ่งสูง ควรจัดตั้ง <strong>แหล่งกบดาน</strong> หรือกดซ่อนตัวเพื่อลดโอกาสถูกตำรวจบุกรวบรายปี
        </p>
      </div>

      {/* Top Tactical Command Strip: Live Arrest Risk & Active Safehouse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Police Hunt & Annual Arrest Risk */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between gap-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
              <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{arrestBreakdown.wantedStatusLabel}</span>
              </span>
              <span className="font-mono-num font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                ระดับหมายจับ {player.career.notoriety}/100
              </span>
            </div>

            <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full transition-transform duration-150 origin-left ${
                  player.career.notoriety >= 60
                    ? 'bg-rose-500'
                    : player.career.notoriety >= 30
                    ? 'bg-amber-500'
                    : 'bg-slate-500'
                }`}
                style={{ transform: `scaleX(${player.career.notoriety / 100})` }}
              />
            </div>

            <div className="pt-1 flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                โอกาสถูกตำรวจบุกจับในปีนี้:
              </span>
              <span
                className={`text-xl font-bold font-mono-num ${
                  arrestBreakdown.totalRiskPct >= 30
                    ? 'text-rose-600 dark:text-rose-400'
                    : arrestBreakdown.totalRiskPct > 0
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {arrestBreakdown.totalRiskPct}% / ปี
              </span>
            </div>

            {arrestBreakdown.hasActiveThreat ? (
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-mono-num leading-relaxed">
                ฐานงาน/หมายจับ +{arrestBreakdown.jobRiskPct + arrestBreakdown.manhuntRiskPct}% · ข่าวฉาว +
                {arrestBreakdown.notorietyRiskPct}% · เซฟเฮาส์ -{arrestBreakdown.safehouseShieldPct}% · ไหวพริบ/ดวง -
                {arrestBreakdown.statMitigationPct}%
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                ปลอดภัย: ไม่ได้ทำงานสายมืดและค่าหมายจับยังไม่ถึงเกณฑ์ถูกไล่ล่า (ต่ำกว่า 40)
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/70 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!canLayLow}
              onClick={onLayLow}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                canLayLow
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 hover:opacity-90 cursor-pointer'
                  : 'bg-slate-200/70 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>
                กบดานซ่อนตัว (-25 พลังงาน{activeSafehouse ? '' : ' · 8,000 บ.'})
              </span>
            </button>

            <button
              type="button"
              disabled={!canClearHeat}
              onClick={onBribeReduceNotoriety}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                canClearHeat
                  ? 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              จ่ายเงินกลบร่องรอย (-20 หมายจับ · 35,000 บ.)
            </button>
          </div>
        </div>

        {/* Card 2: Active Hideout / Safehouse Status */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between gap-4">
          {activeSafehouse ? (
            <>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Home className="w-4 h-4 shrink-0" />
                    <span>แหล่งกบดานปัจจุบัน</span>
                  </span>
                  <span className="font-mono-num text-slate-600 dark:text-slate-400">
                    ค่าดูแล {activeSafehouse.annualUpkeep.toLocaleString()} บ./ปี
                  </span>
                </div>

                <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {activeSafehouse.name}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-mono-num">
                    <span className="text-slate-600 dark:text-slate-400 font-sans">
                      ความลับพิกัดเซฟเฮาส์:
                    </span>
                    <span
                      className={
                        safehouseState.compromised
                          ? 'text-rose-600 dark:text-rose-400 font-bold'
                          : 'text-emerald-700 dark:text-emerald-400 font-bold'
                      }
                    >
                      {player.career.safehouse_security}% · ลดโอกาสถูกจับ -{safehouseState.shieldPct}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full transition-transform duration-150 origin-left ${
                        safehouseState.compromised ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ transform: `scaleX(${player.career.safehouse_security / 100})` }}
                    />
                  </div>
                </div>

                {safehouseState.compromised ? (
                  <p className="text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400">
                    คำเตือน: สายสืบเริ่มรู้พิกัดแล้ว! ประสิทธิภาพพรางตัวลดลงครึ่งหนึ่ง ควรรีบกดย้ายจุดกบดานทันที
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    ลดค่าหมายจับให้อัตโนมัติ -{activeSafehouse.notorietyDecayYearly}/ปี
                    {activeSafehouse.seizureProtectionFactor < 1
                      ? ` · ปกป้องเงินสดไม่ให้ถูกยึด ${Math.round(
                          (1 - activeSafehouse.seizureProtectionFactor) * 100
                        )}%`
                      : ''}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/70 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={!canRelocate}
                  onClick={onRelocateSafehouse}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    canRelocate
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ย้ายจุดกบดาน ({relocateCost.toLocaleString()} บ.)</span>
                </button>

                <button
                  type="button"
                  onClick={onAbandonSafehouse}
                  className="px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-950/40 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  ยกเลิกเซฟเฮาส์
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col justify-between h-full gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  ยังไม่มีแหล่งกบดาน (ไม่มีเกราะพรางตัว)
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                  พักอาศัยแบบเปิดเผย เสี่ยงโดนตำรวจบุกจับเต็มอัตรา
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  หากเริ่มทำงานสายมืดหรือมีค่าหมายจับสะสม แนะนำให้เช่าห้องลับหรือสร้างเซฟเฮาส์เพื่อลดโอกาสถูกบุกจับและช่วยลดหมายจับทุกปี
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setSubTab('SAFEHOUSES')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-slate-900 dark:bg-slate-700 text-white hover:opacity-90 rounded-lg transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>เลือกจัดตั้งแหล่งกบดาน</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Criminal Record Notice */}
      {player.flags.is_criminal_record && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-400/60 text-sm text-rose-900 dark:text-rose-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong>คุณมีประวัติอาชญากรรมติดตัว:</strong> ไม่สามารถสอบ ก.พ. รับราชการ หรือสมัครบริษัทเอกชนที่ตรวจประวัติอาชญากรรมได้ แต่ยังเติบโตในสายมืด หรือกลับใจไปทำอาชีพอิสระ ค้าขาย เจ้าของกิจการ และนักกีฬาได้
          </div>
        </div>
      )}

      {/* Sub-navigation Segmented Control */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => setSubTab('CAREER_LADDER')}
          className={`flex-1 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            subTab === 'CAREER_LADDER'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          อาชีพสายมืด ({underworldJobs.length} ระดับ)
        </button>
        <button
          type="button"
          onClick={() => setSubTab('SAFEHOUSES')}
          className={`flex-1 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            subTab === 'SAFEHOUSES'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          แหล่งกบดาน ({SAFEHOUSE_TIERS.length} ระดับ)
        </button>
        <button
          type="button"
          onClick={() => setSubTab('OPERATIONS')}
          className={`flex-1 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            subTab === 'OPERATIONS'
              ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          งานเสี่ยงคุกเฉพาะกิจ ({CRIME_OPERATIONS.length})
        </button>
      </div>

      {/* SUB-TAB 1: UNDERWORLD CAREER LADDER */}
      {subTab === 'CAREER_LADDER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {underworldJobs.map((job) => {
            const isPrimary = player.career.primary_job === job.job_id;
            const isSide = player.career.side_job === job.job_id;
            const primaryCheck = CareerEngine.checkJobRequirements(player, job, false);
            const sideCheck = CareerEngine.checkJobRequirements(player, job, true);
            const nextPromo = job.promotion_job_id
              ? CareerEngine.getJobById(job.promotion_job_id)
              : null;

            const netJobRisk = Math.max(
              2,
              Math.min(
                85,
                (job.arrest_risk_base_pct || 15) +
                  Math.round(player.career.notoriety * 0.25) -
                  safehouseState.shieldPct -
                  Math.max(
                    0,
                    Math.round(Math.max(0, player.stats.int - 50) * 0.12 + player.stats.luk * 1.2)
                  )
              )
            );

            return (
              <div
                key={job.job_id}
                className={`p-5 rounded-xl border flex flex-col justify-between gap-4 ${
                  isPrimary || isSide
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-500/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {job.categoryLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>อายุ {job.min_age}+ ปี</span>
                    {job.req_capital && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-num">
                          เงินทุน {job.req_capital.toLocaleString()} บ.
                        </span>
                      </>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {job.title}
                  </h4>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm font-mono-num">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ~{job.base_salary_monthly.toLocaleString()} บ./เดือน
                    </span>
                    <span aria-hidden="true" className="text-slate-400">
                      ·
                    </span>
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">
                      เสี่ยงจับสุทธิ ~{netJobRisk}%/ปี (โทษคุก {job.prison_sentence_years} ปี)
                    </span>
                  </div>

                  {nextPromo && (
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                      <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>เลื่อนขั้นต่อไป: {nextPromo.title}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  {isPrimary ? (
                    <>
                      <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
                        ทำเป็นงานหลักอยู่ (ระดับ {player.career.job_level})
                      </span>
                      <button
                        type="button"
                        onClick={() => onQuitJob(false)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>วางมือ</span>
                      </button>
                    </>
                  ) : isSide ? (
                    <>
                      <span className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-400">
                        รับเป็นงานเสริมอยู่
                      </span>
                      <button
                        type="button"
                        onClick={() => onQuitJob(true)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>เลิกทำ</span>
                      </button>
                    </>
                  ) : !primaryCheck.eligible && !sideCheck.eligible ? (
                    <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>{primaryCheck.reasons[0]}</span>
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 ml-auto">
                      {primaryCheck.eligible && (
                        <button
                          type="button"
                          onClick={() => onApplyJob(job.job_id, false)}
                          className="px-3.5 py-2 text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          เข้าสังกัดเต็มตัว
                        </button>
                      )}
                      {job.can_be_side_job && sideCheck.eligible && (
                        <button
                          type="button"
                          onClick={() => onApplyJob(job.job_id, true)}
                          className="px-3.5 py-2 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          รับเป็นงานเสริม
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 2: SAFEHOUSES & HIDEOUT MANAGEMENT */}
      {subTab === 'SAFEHOUSES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAFEHOUSE_TIERS.map((sh) => {
            const isOwned = player.career.safehouse_id === sh.id;
            const canAfford =
              player.career.prison_years_left === 0 &&
              !isOwned &&
              player.finance.cash >= sh.setupCost;

            return (
              <div
                key={sh.id}
                className={`p-5 rounded-xl border flex flex-col justify-between gap-4 ${
                  isOwned
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                    <span className="font-sans font-semibold text-emerald-700 dark:text-emerald-400">
                      {sh.tierLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>ค่าจัดตั้ง {sh.setupCost.toLocaleString()} บ.</span>
                    <span aria-hidden="true">·</span>
                    <span>ค่าดูแล {sh.annualUpkeep.toLocaleString()} บ./ปี</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {sh.name}
                  </h4>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {sh.description}
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm font-mono-num text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ลดโอกาสถูกจับ -{sh.arrestRiskReductionPct}%
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>ลดหมายจับ -{sh.notorietyDecayYearly}/ปี</span>
                    {sh.sanBonusYearly > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>ความสุข +{sh.sanBonusYearly}/ปี</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {isOwned ? (
                    <span className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      ใช้งานอยู่ (ความลับพิกัด {player.career.safehouse_security}%)
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onAcquireSafehouse(sh.id)}
                      className={`ml-auto px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                        canAfford
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {player.finance.cash < sh.setupCost
                        ? `ขาดเงินสด ${(sh.setupCost - player.finance.cash).toLocaleString()} บ.`
                        : 'จัดตั้งแหล่งกบดานนี้'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 3: IMMEDIATE HIGH-RISK CRIME OPERATIONS */}
      {subTab === 'OPERATIONS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CRIME_OPERATIONS.map((op) => {
            const check = UnderworldEngine.checkOperationEligibility(player, op);
            const effectiveRisk = UnderworldEngine.calculateOperationArrestRisk(player, op);

            return (
              <div
                key={op.id}
                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                    <span>ใช้พลังงาน {op.energyCost} แต้ม</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">
                      โอกาสโดนรวบ ~{effectiveRisk}% (โทษคุก {op.prisonYears} ปี)
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {op.title}
                  </h4>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {op.description}
                  </p>

                  <div className="pt-1 text-sm font-mono-num font-bold text-emerald-700 dark:text-emerald-400">
                    เงินส่วนแบ่ง: {op.rewardMin.toLocaleString()} – {op.rewardMax.toLocaleString()} บาท
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono-num">
                    พลังงานคงเหลือ {player.stats.energy} แต้ม
                  </span>

                  {check.eligible ? (
                    <button
                      type="button"
                      onClick={() => onExecuteOperation(op.id)}
                      className="px-4 py-2 text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      ลงมือทันที
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>{check.reason}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
