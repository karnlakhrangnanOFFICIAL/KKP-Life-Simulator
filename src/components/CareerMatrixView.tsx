import React, { useState } from 'react';
import { CAREER_MATRIX, CareerEngine, LICENSE_COURSES } from '../engine/CareerEngine';
import { LicenseId, PlayerData } from '../engine/types';
import { Award, Briefcase, Check, LogOut } from 'lucide-react';

interface CareerMatrixViewProps {
  player: PlayerData;
  onApplyJob: (jobId: string, asSideJob: boolean) => void;
  onQuitJob: (isSideJob: boolean) => void;
  onTakeLicense: (licenseId: LicenseId) => void;
}

export const CareerMatrixView: React.FC<CareerMatrixViewProps> = ({
  player,
  onApplyJob,
  onQuitJob,
  onTakeLicense,
}) => {
  const [filterMode, setFilterMode] = useState<
    'ALL' | 'ELIGIBLE' | 'SPORTS' | 'UNDERWORLD' | 'LICENSES'
  >('ALL');

  const primaryJobObj = CareerEngine.getJobById(player.career.primary_job);
  const sideJobObj = CareerEngine.getJobById(player.career.side_job);

  const eligibleCount = CAREER_MATRIX.filter(
    (job) =>
      CareerEngine.checkJobRequirements(player, job, false).eligible ||
      CareerEngine.checkJobRequirements(player, job, true).eligible
  ).length;

  const filteredJobs = CAREER_MATRIX.filter((job) => {
    if (filterMode === 'ELIGIBLE') {
      return (
        CareerEngine.checkJobRequirements(player, job, false).eligible ||
        CareerEngine.checkJobRequirements(player, job, true).eligible
      );
    }
    if (filterMode === 'SPORTS') {
      return job.category === 'SPORTS';
    }
    if (filterMode === 'UNDERWORLD') {
      return job.category === 'UNDERWORLD';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            หางาน สมัครนักกีฬาอาชีพ และสอบใบอนุญาตวิชาชีพ
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            กดตัวกรอง &ldquo;สมัครได้ตอนนี้&rdquo; เพื่อดูงานที่คุณผ่านเกณฑ์แล้วทันที หรือสอบใบอนุญาตเพื่อปลดล็อกอาชีพเงินเดือนสูง
          </p>
        </div>

        {/* Interactive segmented filter control */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start">
          <button
            type="button"
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filterMode === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            ทุกอาชีพ ({CAREER_MATRIX.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('ELIGIBLE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filterMode === 'ELIGIBLE'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            สมัครได้ตอนนี้ ({eligibleCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('SPORTS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filterMode === 'SPORTS'
                ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            สายนักกีฬา
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('UNDERWORLD')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filterMode === 'UNDERWORLD'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            สายมืด
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('LICENSES')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filterMode === 'LICENSES'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            สอบใบอนุญาต ({player.career.licenses.length}/{LICENSE_COURSES.length})
          </button>
        </div>
      </div>

      {/* Current Employment Status Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              อาชีพหลักปัจจุบัน
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              {primaryJobObj
                ? `${primaryJobObj.title} (ระดับ ${player.career.job_level})`
                : 'ว่างงาน / ยังไม่ได้ทำงานหลัก'}
            </div>
            {primaryJobObj && (
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-mono-num">
                ฐานรายได้ ~{primaryJobObj.base_salary_monthly.toLocaleString()} บ./เดือน · อายุงาน{' '}
                {player.career.years_experience} ปี
              </div>
            )}
          </div>
          {primaryJobObj && (
            <button
              type="button"
              onClick={() => onQuitJob(false)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-950/40 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              ลาออก
            </button>
          )}
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              อาชีพเสริมนอกเวลา
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              {sideJobObj ? sideJobObj.title : 'ไม่มีอาชีพเสริม'}
            </div>
            {sideJobObj && (
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-mono-num">
                รายได้เสริม ~{Math.round(sideJobObj.base_salary_monthly * 0.55).toLocaleString()}{' '}
                บ./เดือน
              </div>
            )}
          </div>
          {sideJobObj && (
            <button
              type="button"
              onClick={() => onQuitJob(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-950/40 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              เลิกทำ
            </button>
          )}
        </div>
      </div>

      {/* Licenses View */}
      {filterMode === 'LICENSES' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LICENSE_COURSES.map((lic) => {
            const owned = player.career.licenses.includes(lic.id);
            const blockedByRecord =
              player.flags.is_criminal_record &&
              (lic.id === 'CIVIL_EXAM_PASS' || lic.id === 'TEACHER_LICENSE');
            const canAfford =
              player.career.prison_years_left === 0 &&
              !blockedByRecord &&
              player.age >= lic.minAge &&
              player.finance.cash >= lic.cost &&
              player.stats.energy >= lic.energyCost &&
              (!lic.minInt || player.stats.int >= lic.minInt) &&
              (!lic.minAth || player.stats.ath >= lic.minAth);

            return (
              <div
                key={lic.id}
                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                    อายุ {lic.minAge}+ ปี
                    {lic.minInt ? ` · สติปัญญา INT ≥ ${lic.minInt}` : ''}
                    {lic.minAth ? ` · ทักษะกีฬา ATH ≥ ${lic.minAth}` : ''} · ค่าสมัคร{' '}
                    {lic.cost.toLocaleString()} บ. · ใช้พลังงาน {lic.energyCost} แต้ม
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {lic.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {lic.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono-num">
                    โอกาสสอบผ่านพื้นฐาน {Math.round(lic.passRateBase * 100)}%
                  </span>
                  {owned ? (
                    <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                      <Check className="w-4 h-4" />
                      สอบผ่านแล้ว
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onTakeLicense(lic.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Award className="w-4 h-4" />
                      สมัครสอบทันที
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Jobs Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.length === 0 ? (
            <div className="col-span-full p-8 text-center rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
              ยังไม่มีอาชีพที่ผ่านเกณฑ์ในขณะนี้ ลองเรียนต่อ ฝึกซ้อมเพิ่มค่าสถานะ หรือรอจนอายุถึงเกณฑ์แรงงาน
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isCurrentPrimary = player.career.primary_job === job.job_id;
              const isCurrentSide = player.career.side_job === job.job_id;
              const primaryCheck = CareerEngine.checkJobRequirements(player, job, false);
              const sideCheck = CareerEngine.checkJobRequirements(player, job, true);
              const anyEligible = primaryCheck.eligible || sideCheck.eligible;

              return (
                <div
                  key={job.job_id}
                  className={`p-5 rounded-xl border flex flex-col justify-between gap-4 ${
                    isCurrentPrimary || isCurrentSide
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/60'
                      : anyEligible
                      ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
                      : 'bg-slate-50/40 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                      <span
                        className={
                          job.is_illegal
                            ? 'font-semibold text-rose-600 dark:text-rose-400'
                            : job.category === 'SPORTS'
                            ? 'font-semibold text-amber-700 dark:text-amber-400'
                            : 'font-medium text-slate-700 dark:text-slate-300'
                        }
                      >
                        {job.categoryLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        อายุ {job.min_age}
                        {job.max_age ? `–${job.max_age}` : '+'} ปี
                      </span>
                      {job.req_stats.ath && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>ทักษะกีฬา ATH &ge; {job.req_stats.ath}</span>
                        </>
                      )}
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

                    <div className="pt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-mono-num">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        ~{job.base_salary_monthly.toLocaleString()} บ./เดือน
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>เหนื่อยกาย -{job.hp_drain_yearly} HP/ปี</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {job.san_drain_yearly < 0
                          ? `ความสุข +${Math.abs(job.san_drain_yearly)}/ปี`
                          : `ความเครียด -${job.san_drain_yearly}/ปี`}
                      </span>
                      {job.is_illegal && job.arrest_risk_base_pct && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            เสี่ยงคุก {job.arrest_risk_base_pct}%/ปี (โทษ {job.prison_sentence_years} ปี)
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    {isCurrentPrimary ? (
                      <span className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        กำลังทำเป็นอาชีพหลักอยู่
                      </span>
                    ) : isCurrentSide ? (
                      <span className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        กำลังทำเป็นอาชีพเสริมอยู่
                      </span>
                    ) : !anyEligible ? (
                      <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        ยังไม่ผ่านเกณฑ์: {primaryCheck.reasons[0]}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2 ml-auto">
                        {primaryCheck.eligible && (
                          <button
                            type="button"
                            onClick={() => onApplyJob(job.job_id, false)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 hover:opacity-90 rounded-lg transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <Briefcase className="w-3.5 h-3.5" />
                            สมัครเป็นงานหลัก
                          </button>
                        )}
                        {job.can_be_side_job && sideCheck.eligible && !isCurrentPrimary && (
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
            })
          )}
        </div>
      )}
    </div>
  );
};
