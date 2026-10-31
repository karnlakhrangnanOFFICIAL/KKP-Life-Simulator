import React from 'react';
import { EnergySystem } from '../core/energy_system';
import { PlayerData } from '../engine/types';
import { Minus, Plus, AlertTriangle, Zap, Dumbbell, ArrowUpRight } from 'lucide-react';

interface EnergyPlannerViewProps {
  player: PlayerData;
  allocations: Record<string, number>;
  onChangeAllocation: (unitId: string, nextCount: number) => void;
  onResetAllocations: () => void;
  onExecuteYear: () => void;
  onOpenAthletics?: () => void;
}

export const EnergyPlannerView: React.FC<EnergyPlannerViewProps> = ({
  player,
  allocations,
  onChangeAllocation,
  onResetAllocations,
  onExecuteYear,
  onOpenAthletics,
}) => {
  const activities = EnergySystem.getYearlyActivities(player);
  const summary = EnergySystem.calculateAllocationSummary(player, allocations);

  const mandatoryUnits = activities.filter((u) => u.mandatory);
  const optionalUnits = activities.filter((u) => !u.mandatory);

  const ratioNormal = Math.min(1, summary.totalAllocated / summary.maxBaseEnergy);
  const isOverworked = summary.excessEnergy > 0;
  const freeSafeEnergy = Math.max(0, summary.maxBaseEnergy - summary.totalAllocated);

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
      {/* Header & Clear Energy Budget Meter */}
      <div className="space-y-3.5 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              วางแผนการใช้ชีวิตประจำปี · อายุ {player.age} &rarr; {player.age + 1} ปี
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              แบ่งพลังงานทำกิจกรรมในรอบปีนี้
            </h3>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono-num">
            <div>
              <span className="text-xs font-sans text-slate-500 dark:text-slate-400 mr-1.5">
                ใช้ไปแล้ว
              </span>
              <span
                className={`text-2xl font-bold ${
                  summary.triggersDangerZone
                    ? 'text-rose-600 dark:text-rose-400'
                    : isOverworked
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {summary.totalAllocated}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                /{summary.maxBaseEnergy} แต้ม
              </span>
            </div>

            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>

            <span
              className={`text-sm font-semibold ${
                isOverworked
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {isOverworked
                ? `ฝืนเกินเกณฑ์ +${summary.excessEnergy} แต้ม`
                : `เหลือว่างแบบปลอดภัย ${freeSafeEnergy} แต้ม`}
            </span>
          </div>
        </div>

        {/* Energy Progress Bar */}
        <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-transform duration-150 origin-left ${
              summary.triggersDangerZone
                ? 'bg-rose-500'
                : isOverworked
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ transform: `scaleX(${ratioNormal})` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>
            เกณฑ์สุขภาพดีไม่เกิน {summary.maxBaseEnergy} แต้ม (ฝืนร่างกายได้สูงสุดไม่เกิน{' '}
            {summary.hardCapEnergy} แต้ม)
          </span>
          <span>ไม่ต้องใช้พลังงานให้เต็ม 100 แต้มก็กดจบปีได้ทันที</span>
        </div>

        {/* Overwork & Burnout Warning */}
        {isOverworked && (
          <div
            className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
              summary.triggersDangerZone
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-400/70 text-rose-900 dark:text-rose-200'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-400/70 text-amber-900 dark:text-amber-200'
            }`}
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold">
                {summary.triggersDangerZone
                  ? 'คำเตือนขีดอันตราย: โหมงานหนักเกินขีดจำกัด เสี่ยงล้มป่วยเข้าโรงพยาบาลหรือไฟมอด (Burnout)!'
                  : 'คำเตือน: คุณจัดตารางเกินงบพลังงานปกติ ร่างกายจะอ่อนล้าลงเมื่อจบปี'}
              </div>
              <div className="text-xs sm:text-sm font-mono-num">
                ใช้เกินมา +{summary.excessEnergy} แต้ม · สุขภาพกายลดลง -{summary.hpPenalty} HP
                {summary.triggersDangerZone
                  ? ` · โอกาสวูบเข้า รพ. / ติดสถานะไฟมอด ${summary.burnoutRiskPct}%`
                  : ''}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 1: Mandatory Duties & Already Spent Energy */}
      {(mandatoryUnits.length > 0 || summary.immediateEnergySpent > 0) && (
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            1. หน้าที่หลักประจำปี (หักพลังงานอัตโนมัติ)
          </div>
          <div className="space-y-2">
            {mandatoryUnits.map((unit) => (
              <div
                key={unit.id}
                className="px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                    {unit.title}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {unit.subtitle}
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-mono-num font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap shrink-0">
                  ใช้ {unit.energyCost} แต้ม
                </div>
              </div>
            ))}

            {summary.immediateEnergySpent > 0 && (
              <div className="px-4 py-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-400/50 flex items-center justify-between gap-4">
                <div className="min-w-0 space-y-0.5">
                  <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                    พลังงานที่ใช้ทำกิจกรรมพิเศษไปแล้วในปีนี้ (ซ้อมกีฬา / เดินเล่น / สอบใบอนุญาต)
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    ค่าสถานะอัปเดตให้ทันทีแล้ว และจะสรุปรวมในบันทึกท้ายปี
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-mono-num font-semibold text-amber-800 dark:text-amber-400 whitespace-nowrap shrink-0">
                  ใช้แล้ว {summary.immediateEnergySpent} แต้ม
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shortcut Banner to Athletic Training */}
      {onOpenAthletics &&
        player.age >= 6 &&
        player.career.prison_years_left === 0 &&
        player.career.conscription_years_left === 0 && (
          <div className="px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <Dumbbell className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="space-y-0.5 min-w-0">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  อยากปั้นตัวเป็นนักกีฬาอาชีพหรือทีมชาติ?
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-mono-num">
                  ทักษะกีฬาปัจจุบัน ATH {player.stats.ath}/100 · เข้าไปเลือกโปรแกรมซ้อมโค้ชส่วนตัว สโมสร หรือซ้อมเดี่ยวได้ทันที
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenAthletics}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold border border-amber-500/80 text-amber-800 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>ไปที่ศูนย์ฝึกกีฬา</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        )}

      {/* Section 2: Optional Activities */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            2. กิจกรรมเสริมหลังเลิกเรียน/เลิกงาน (กดปุ่ม + เพื่อเพิ่มจำนวนครั้ง)
          </span>
          {summary.optionalEnergy > 0 && (
            <button
              type="button"
              onClick={onResetAllocations}
              className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline cursor-pointer whitespace-nowrap shrink-0"
            >
              ล้างที่เลือกทั้งหมด
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {optionalUnits.map((unit) => {
            const count = allocations[unit.id] || 0;
            const canAdd =
              count < unit.maxRepeats &&
              summary.totalAllocated + unit.energyCost <= summary.hardCapEnergy;

            return (
              <div
                key={unit.id}
                className={`p-4 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                  count > 0
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500/60'
                    : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                    {unit.title}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {unit.subtitle}
                    {unit.cashCost > 0
                      ? ` · ใช้เงิน ${unit.cashCost.toLocaleString()} บาท/ครั้ง`
                      : ''}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <span className="text-xs sm:text-sm font-mono-num font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {unit.energyCost} แต้ม/ครั้ง
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={count <= 0}
                      onClick={() => onChangeAllocation(unit.id, count - 1)}
                      aria-label={`ลด ${unit.title}`}
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                        count > 0
                          ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                          : 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-8 text-center text-base font-bold font-mono-num text-slate-900 dark:text-slate-100">
                      {count}
                    </span>

                    <button
                      type="button"
                      disabled={!canAdd}
                      onClick={() => onChangeAllocation(unit.id, count + 1)}
                      aria-label={`เพิ่ม ${unit.title}`}
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                        canAdd
                          ? 'border-amber-500 bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500 hover:text-slate-950 cursor-pointer'
                          : 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary End-of-Year Action Bar */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          เคล็ดลับ: กดปุ่ม <span className="font-mono-num font-semibold">Enter</span> บนคีย์บอร์ดเพื่อข้ามไปปีถัดไปได้ทันที
        </div>

        <button
          type="button"
          onClick={onExecuteYear}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
        >
          <Zap className="w-4 h-4" />
          <span>จบปีที่ {player.age} &rarr; ก้าวสู่อายุ {player.age + 1} ปี</span>
        </button>
      </div>
    </div>
  );
};
