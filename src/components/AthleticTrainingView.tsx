import React from 'react';
import {
  ATHLETIC_TRAINING_MODES,
  AthleticTrainingEngine,
} from '../core/athletic_training';
import { EnergySystem } from '../core/energy_system';
import { AthleticTrainingModeId, PlayerData } from '../engine/types';
import {
  Dumbbell,
  Flame,
  Users,
  ShieldCheck,
  Trophy,
  ArrowUpRight,
  AlertTriangle,
  HeartPulse,
  Zap,
} from 'lucide-react';

interface AthleticTrainingViewProps {
  player: PlayerData;
  onExecuteTraining: (modeId: AthleticTrainingModeId) => void;
  onNavigateCareer: () => void;
}

export const AthleticTrainingView: React.FC<AthleticTrainingViewProps> = ({
  player,
  onExecuteTraining,
  onNavigateCareer,
}) => {
  const tierInfo = AthleticTrainingEngine.getAthleteTierInfo(player.stats.ath);
  const ageCurve = AthleticTrainingEngine.getAgeEfficiencyMultiplier(player.age);
  const allocSummary = EnergySystem.calculateAllocationSummary(player, {});

  const trainingLogsThisYear = (player.pending_year_logs || []).filter((entry) =>
    entry.startsWith('ฝึกซ้อมโปรแกรม')
  );

  const careerMilestones = [
    {
      id: 'MUAY_THAI_FIGHTER',
      title: 'นักมวยไทยเดินสาย / เวทีมาตรฐาน',
      requirementText: 'อายุ 13–35 ปี · ทักษะกีฬา ATH ≥ 45 · สุขภาพ HP ≥ 60',
      unlocked:
        player.age >= 13 &&
        player.age <= 35 &&
        player.stats.ath >= 45 &&
        player.stats.hp >= 60,
      salaryLabel: 'รายได้เริ่มต้น 18,000 บ./เดือน + เงินอัดฉีดแชมป์',
    },
    {
      id: 'THAI_LEAGUE_PLAYER',
      title: 'นักกีฬาสโมสรอาชีพ (ไทยลีก / สโมสรชั้นนำ)',
      requirementText: 'อายุ 16–37 ปี · ทักษะกีฬา ATH ≥ 65 · สุขภาพ HP ≥ 70',
      unlocked:
        player.age >= 16 &&
        player.age <= 37 &&
        player.stats.ath >= 65 &&
        player.stats.hp >= 70,
      salaryLabel: 'รายได้เริ่มต้น 42,000 บ./เดือน + โบนัสทัวร์นาเมนต์',
    },
    {
      id: 'NATIONAL_STAR_ATHLETE',
      title: 'ซูเปอร์สตาร์ทีมชาติ / แชมป์โลกขวัญใจมหาชน',
      requirementText: 'อายุ 18–36 ปี · ATH ≥ 85 · เสน่ห์/สังคม SOC ≥ 55 · HP ≥ 70',
      unlocked:
        player.age >= 18 &&
        player.age <= 36 &&
        player.stats.ath >= 85 &&
        player.stats.soc >= 55 &&
        player.stats.hp >= 70,
      salaryLabel: 'รายได้เริ่มต้น 135,000 บ./เดือน + พรีเซนเตอร์ & เหรียญทอง',
    },
    {
      id: 'HEAD_SPORTS_COACH',
      title: 'หัวหน้าผู้ฝึกสอนสโมสร / เจ้าของค่ายกีฬา',
      requirementText: 'อายุ 26+ ปี · ATH ≥ 65 · SOC ≥ 50 · มีใบอนุญาตโค้ชกีฬาอาชีพ',
      unlocked:
        player.age >= 26 &&
        player.stats.ath >= 65 &&
        player.stats.soc >= 50 &&
        player.career.licenses.includes('SPORTS_COACH_CERT'),
      salaryLabel: 'รายได้เริ่มต้น 58,000 บ./เดือน (ทำได้ยาวไม่ต้องแขวนสตั๊ด)',
    },
  ];

  const getModeIcon = (id: AthleticTrainingModeId) => {
    switch (id) {
      case 'INTENSIVE_COACHING':
        return <Flame className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'CLUB_TRAINING':
        return <Users className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'SOLO_PRACTICE':
        return <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Athlete Readiness Dashboard */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                ศูนย์ฝึกซ้อมกีฬา
              </span>
              <span aria-hidden="true">·</span>
              <span>ประสิทธิภาพการซ้อมตามวัย {Math.round(ageCurve.multiplier * 100)}%</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-amber-500 shrink-0" />
              เลือกโปรแกรมฝึกซ้อมเพื่อปั้นตัวสู่นักกีฬาอาชีพ
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
              เลือกระดับความหนักให้เหมาะกับพลังงานและสภาพร่างกาย: <strong>โค้ชส่วนตัวเข้มข้น</strong> เร่งทั้งฝีมือและสายสัมพันธ์แมวมองแต่เปลืองแรงและเจ็บตัวง่าย ส่วน <strong>ซ้อมเดี่ยว</strong> ใช้แรงน้อยและช่วยฟื้นฟูสุขภาพอย่างปลอดภัย
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateCareer}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-500 dark:hover:text-slate-950 text-slate-800 dark:text-slate-100 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>ดูงานสายนักกีฬา</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Core Athlete Vital Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-400">ทักษะกีฬา (ATH)</span>
              <span className="font-mono-num text-sm font-bold text-amber-700 dark:text-amber-400">
                {player.stats.ath} / 100
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-transform duration-150 origin-left"
                style={{ transform: `scaleX(${player.stats.ath / 100})` }}
              />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
              {tierInfo.rankLabel}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-400">คอนเนกชันแมวมอง (SOC)</span>
              <span className="font-mono-num text-sm font-bold text-sky-700 dark:text-sky-400">
                {player.stats.soc} / 100
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-transform duration-150 origin-left"
                style={{ transform: `scaleX(${player.stats.soc / 100})` }}
              />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {player.stats.soc >= 55
                ? 'ผ่านเกณฑ์รับงานพรีเซนเตอร์/ทีมชาติ'
                : 'ต้องการ SOC 55+ สำหรับทีมชาติ'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-500" />
                สุขภาพร่างกาย (HP)
              </span>
              <span
                className={`font-mono-num text-sm font-bold ${
                  player.stats.hp <= 25
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {player.stats.hp} / 100
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-transform duration-150 origin-left ${
                  player.stats.hp <= 25 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ transform: `scaleX(${player.stats.hp / 100})` }}
              />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {player.stats.hp > 20
                ? 'ร่างกายพร้อมรับโปรแกรมฝึกหนัก'
                : 'ร่างกายอ่อนล้า แนะนำซ้อมเดี่ยว'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                พลังงานคงเหลือปีนี้
              </span>
              <span className="font-mono-num text-sm font-bold text-slate-900 dark:text-slate-100">
                {player.stats.energy} / {allocSummary.maxBaseEnergy}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-transform duration-150 origin-left"
                style={{
                  transform: `scaleX(${Math.min(
                    1,
                    player.stats.energy / allocSummary.maxBaseEnergy
                  )})`,
                }}
              />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-mono-num">
              ใช้รวมแล้ว {allocSummary.totalAllocated}/{allocSummary.hardCapEnergy} แต้ม
            </div>
          </div>
        </div>

        {/* Age Curve & Next Target Banner */}
        <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="text-slate-700 dark:text-slate-300">
            <span className="font-semibold">{ageCurve.phaseLabel}:</span> {ageCurve.advisory}
          </div>
          <div className="font-mono-num font-medium text-amber-700 dark:text-amber-400 shrink-0">
            {tierInfo.nextTargetLabel}
          </div>
        </div>
      </div>

      {/* 3 Training Regimens Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {ATHLETIC_TRAINING_MODES.map((mode) => {
          const check = AthleticTrainingEngine.checkEligibility(player, mode);
          const scaledAthGain = Math.max(2, Math.round(mode.athGain * ageCurve.multiplier));
          const isIntensive = mode.id === 'INTENSIVE_COACHING';

          return (
            <div
              key={mode.id}
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border flex flex-col justify-between gap-5 transition-colors ${
                isIntensive
                  ? 'border-amber-500/70 dark:border-amber-500/60'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {mode.paceTag}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>อายุขั้นต่ำ {mode.minAge} ปี</span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {getModeIcon(mode.id)}
                    <span>{mode.title}</span>
                  </h4>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {mode.description}
                  </p>
                </div>

                {/* Resource Costs vs Stat Gains Ledger */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-b border-slate-100 dark:border-slate-800 text-sm font-mono-num">
                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="font-sans text-slate-600 dark:text-slate-400">
                      ใช้พลังงาน
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      -{mode.energyCost} แต้ม
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="font-sans text-slate-600 dark:text-slate-400">
                      ผลต่อสุขภาพกาย (HP)
                    </span>
                    <span
                      className={`font-bold ${
                        mode.hpCost > 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {mode.hpCost > 0
                        ? `-${mode.hpCost} HP`
                        : `+${Math.abs(mode.hpCost)} HP (ปลอดภัย)`}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="font-sans text-slate-600 dark:text-slate-400">
                      ทักษะกีฬาที่ได้รับ (ATH)
                    </span>
                    <span className="font-bold text-amber-700 dark:text-amber-400">
                      +{scaledAthGain} ATH
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="font-sans text-slate-600 dark:text-slate-400">
                      คอนเนกชันแมวมอง (SOC)
                    </span>
                    <span
                      className={`font-bold ${
                        mode.socGain > 0
                          ? 'text-sky-700 dark:text-sky-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {mode.socGain > 0 ? `+${mode.socGain} SOC` : '+0 SOC'}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="font-sans text-slate-600 dark:text-slate-400">
                      ความสุขใจ (SAN)
                    </span>
                    <span
                      className={`font-semibold ${
                        mode.sanDelta >= 0
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {mode.sanDelta >= 0 ? `+${mode.sanDelta} SAN` : `${mode.sanDelta} SAN`}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  ระดับความเสี่ยง: {mode.riskTag}
                </div>
              </div>

              <div className="space-y-2.5">
                {!check.eligible && check.reason && (
                  <div className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 flex items-start gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{check.reason}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!check.eligible}
                  onClick={() => onExecuteTraining(mode.id)}
                  className={`w-full py-3 px-4 text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                    check.eligible
                      ? isIntensive
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                        : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 cursor-pointer'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  ซ้อมโปรแกรมนี้ (-{mode.energyCost} พลังงาน)
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completed Training Sessions This Year */}
      {trainingLogsThisYear.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-bold text-slate-900 dark:text-slate-100">
              รายการซ้อมที่ทำไปแล้วในปีนี้ ({trainingLogsThisYear.length} ครั้ง)
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              บันทึกเข้าสู่ประวัติชีวิตอัตโนมัติเมื่อกดจบปี
            </span>
          </div>
          <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
            {trainingLogsThisYear.map((log, index) => (
              <li key={index}>— {log}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Pro Sports Career Unlock Matrix */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="space-y-1">
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
            เป้าหมายปลดล็อกอาชีพสายนักกีฬาและโค้ช
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            เมื่อฝึกจนค่าสถานะถึงเกณฑ์ด้านล่าง กดไปที่แท็บ &ldquo;หางาน &amp; อาชีพ&rdquo; เพื่อเซ็นสัญญาเป็นนักกีฬาอาชีพได้ทันที
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {careerMilestones.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                item.unlocked
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/60'
                  : 'bg-slate-50/60 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {item.title}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-mono-num">
                  {item.requirementText}
                </div>
                <div className="text-xs sm:text-sm text-amber-800 dark:text-amber-400 font-mono-num font-medium">
                  {item.salaryLabel}
                </div>
              </div>

              <span
                className={`text-xs font-bold whitespace-nowrap shrink-0 ${
                  item.unlocked
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {item.unlocked ? 'สมัครได้แล้ว' : 'ยังไม่ถึงเกณฑ์'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
