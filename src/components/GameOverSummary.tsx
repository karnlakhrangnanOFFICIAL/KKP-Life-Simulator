import React, { useState } from 'react';
import { LegacyEngine } from '../core/legacy_engine';
import { CareerEngine } from '../engine/CareerEngine';
import { EDUCATION_TREE } from '../engine/EducationEngine';
import { LifeSimulatorEngine } from '../engine/LifeSimulatorEngine';
import { PlayerData } from '../engine/types';
import { RotateCcw, Download, Users } from 'lucide-react';

interface GameOverSummaryProps {
  player: PlayerData;
  onRestart: () => void;
  onContinueAsChild: (nextGenChild: PlayerData) => void;
}

export const GameOverSummary: React.FC<GameOverSummaryProps> = ({
  player,
  onRestart,
  onContinueAsChild,
}) => {
  const ending = LifeSimulatorEngine.evaluateEndingSummary(player);
  const estate = LegacyEngine.calculateEstate(player);
  const primaryJob = CareerEngine.getJobById(player.career.primary_job);
  const sideJob = CareerEngine.getJobById(player.career.side_job);
  const highestEdu = EDUCATION_TREE[player.education.current_level];

  const [childName, setChildName] = useState<string>(() =>
    LifeSimulatorEngine.getSampleRandomName()
  );

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(player, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thai-life-gen-${player.background.generation}-age-${player.age}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSpawnHeir = () => {
    const heir = LegacyEngine.createNextGenerationChild(player, childName);
    onContinueAsChild(heir);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Main Memorial Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-2">
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              บทสรุปแห่งชีวิต รุ่นที่ {player.background.generation} · พ.ศ. {player.birth_year_be} –{' '}
              {player.birth_year_be + player.age} (รวมอายุขัย {player.age} ปี)
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 text-balance">
              “{ending.title}”
            </h1>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              {player.name} — {ending.subtitle}
            </p>
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400 pt-1">
              สาเหตุการเสียชีวิต: {player.cause_of_death}
            </p>
          </div>

          <div className="sm:text-right shrink-0 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70">
            <div className="text-xs text-slate-500 dark:text-slate-400">คะแนนชีวิตรวม</div>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 font-mono-num">
              {ending.lifeScore.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Formula Breakdown Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              ที่มาของคะแนนชีวิต
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">เงินสดคงเหลือ (&times; 0.1)</span>
                <span className="font-mono-num font-semibold text-emerald-700 dark:text-emerald-400">
                  +{ending.breakdown.cashPoints.toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">มูลค่าทรัพย์สินสุทธิ (&times; 0.08)</span>
                <span className="font-mono-num font-semibold text-emerald-700 dark:text-emerald-400">
                  +{ending.breakdown.assetPoints.toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  สติปัญญาสูงสุด {player.max_stats_reached.int} (&times; 10)
                </span>
                <span className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
                  +{ending.breakdown.intPoints.toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  เสน่ห์/สังคมสูงสุด {player.max_stats_reached.soc} (&times; 10)
                </span>
                <span className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
                  +{ending.breakdown.socPoints.toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  ทักษะกีฬาสูงสุด {player.max_stats_reached.ath} &amp; แชมป์ {player.career.championship_medals} สมัย
                </span>
                <span className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
                  +{ending.breakdown.athPoints.toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  อายุขัย {player.age} ปี (&times; 50)
                </span>
                <span className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
                  +{ending.breakdown.agePoints.toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">หักหนี้สินคงค้าง (&times; 0.5)</span>
                <span className="font-mono-num font-semibold text-rose-600 dark:text-rose-400">
                  -{ending.breakdown.debtPenalty.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              สรุปเส้นทางและทรัพย์สมบัติสุดท้าย
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              <div className="py-2.5 flex justify-between gap-4">
                <span className="text-slate-600 dark:text-slate-400">วุฒิการศึกษาสูงสุด</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-right">
                  {highestEdu.shortTitle}
                </span>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <span className="text-slate-600 dark:text-slate-400">อาชีพหลักสุดท้าย</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-right">
                  {primaryJob ? primaryJob.title : 'ไม่ได้ประกอบอาชีพหลัก'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <span className="text-slate-600 dark:text-slate-400">อาชีพเสริม</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-right">
                  {sideJob ? sideJob.title : 'ไม่มี'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <span className="text-slate-600 dark:text-slate-400">เงินสด + มูลค่าทรัพย์สิน</span>
                <span className="font-mono-num font-bold text-emerald-700 dark:text-emerald-400">
                  {(estate.cashLeft + estate.assetLiquidationValue).toLocaleString()} บาท
                </span>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <span className="text-slate-600 dark:text-slate-400">หนี้สินคงค้าง (รวม กยศ.)</span>
                <span className="font-mono-num font-bold text-rose-600 dark:text-rose-400">
                  {estate.totalDebts.toLocaleString()} บาท
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* GENERATIONAL LEGACY TRANSITION PANEL */}
        {player.flags.has_children ? (
          <div className="p-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-400/70 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                  สืบทอดสายตระกูลสู่รุ่นถัดไป
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  ส่งต่อกองมรดกให้ทายาทรุ่นที่ {player.background.generation + 1}
                </h3>
              </div>
              <span className="text-xs sm:text-sm font-mono-num text-slate-700 dark:text-slate-300">
                ต้นทุนที่ลูกได้รับ: SOC {estate.inheritedSoc} · ATH {estate.inheritedAth}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-mono-num">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 font-sans">กองมรดกก่อนภาษี</div>
                <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {estate.grossEstate.toLocaleString()} บาท
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 font-sans">
                  ภาษีมรดกและค่าโอน ({estate.taxRatePct}%)
                </div>
                <div className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  -{estate.inheritanceTaxAndFees.toLocaleString()} บาท
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 font-sans">ฐานะครอบครัวของรุ่นลูก</div>
                <div className="text-base font-bold text-amber-700 dark:text-amber-400 font-sans mt-0.5">
                  {LifeSimulatorEngine.getWealthLabel(estate.nextGenWealthClass)}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="ตั้งชื่อทายาทรุ่นลูก..."
                className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleSpawnHeir}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                เล่นต่อในฐานะรุ่นลูก (รุ่นที่ {player.background.generation + 1})
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
            สายตระกูลจบลงที่รุ่นนี้เพราะยังไม่มีบุตรสืบสกุล (หากแต่งงานและมีลูกก่อนเสียชีวิต จะส่งต่อมรดกเล่นต่อในรุ่นถัดไปได้)
          </div>
        )}

        {/* Family Lineage History if Generation > 1 */}
        {player.lineage.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              ทำเนียบบรรพบุรุษของตระกูล
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {player.lineage.map((anc) => (
                <div key={anc.generation} className="py-2.5 flex items-center justify-between gap-4">
                  <span>
                    รุ่นที่ {anc.generation}: <strong>{anc.name}</strong> (อายุขัย {anc.final_age}{' '}
                    ปี · “{anc.ending_title}”)
                  </span>
                  <span className="font-mono-num text-slate-600 dark:text-slate-400">
                    ส่งต่อมรดก {anc.net_estate_passed.toLocaleString()} บ.
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standard Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            ดาวน์โหลดไฟล์ประวัติชีวิต (.json)
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold bg-slate-900 dark:bg-slate-100 hover:opacity-90 text-white dark:text-slate-950 rounded-xl transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            เริ่มสุ่มตระกูลใหม่ตั้งแต่รุ่นที่ 1
          </button>
        </div>
      </div>

      {/* Full Life Log */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          บันทึกเรื่องราวตลอดชีวิต ({player.history.length} ปี)
        </h3>
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-2">
          {player.history.map((entry, idx) => (
            <div key={`${entry.age}-${idx}`} className="py-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono-num">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  อายุ {entry.age} ปี · พ.ศ. {entry.year_be}
                </span>
                <span>
                  เงินสด {entry.cash_after.toLocaleString()} บ.
                  {entry.debt_after > 0 ? ` · หนี้รวม ${entry.debt_after.toLocaleString()} บ.` : ''}
                </span>
              </div>
              <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                {entry.headline}
              </div>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 leading-relaxed">
                {entry.details.map((d, i) => (
                  <li key={i}>— {d}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
