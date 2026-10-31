import React from 'react';
import { EDUCATION_TREE, EducationEngine } from '../engine/EducationEngine';
import { EducationLevel, PlayerData } from '../engine/types';
import { Check, Lock, GraduationCap } from 'lucide-react';

interface EducationTreeViewProps {
  player: PlayerData;
  onEnroll: (level: EducationLevel, useStudentLoan: boolean) => void;
}

export const EducationTreeView: React.FC<EducationTreeViewProps> = ({ player, onEnroll }) => {
  const renderNodeCard = (level: EducationLevel) => {
    const node = EDUCATION_TREE[level];
    const isCompleted = player.education.completed_levels.includes(level);
    const isCurrentActive =
      player.education.is_enrolled && player.education.active_program === level;
    const check = EducationEngine.checkEligibility(player, level);
    const canEnroll =
      check.eligible && level !== 'PRIMARY' && level !== 'LOWER_SEC' && level !== 'NONE';
    const scholarship = level === 'BACHELOR_REGULAR' && player.stats.int >= 78;
    const isCadetAcademy = level === 'MILITARY_CADET';

    return (
      <div
        key={level}
        className={`p-5 rounded-xl border transition-colors flex flex-col justify-between gap-4 ${
          isCurrentActive
            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-500/70'
            : isCompleted
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/50'
            : canEnroll
            ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
            : 'bg-slate-50/50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono-num">
            <span>เรียน {node.durationYears} ปี</span>
            <span aria-hidden="true">·</span>
            <span>
              อายุ {node.minAge}
              {node.maxAge ? `–${node.maxAge}` : '+'} ปี
            </span>
            {node.minInt > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>สติปัญญา INT &ge; {node.minInt}</span>
              </>
            )}
            {node.minAth && (
              <>
                <span aria-hidden="true">·</span>
                <span>ร่างกาย ATH &ge; {node.minAth}</span>
              </>
            )}
            {node.minHp && (
              <>
                <span aria-hidden="true">·</span>
                <span>สุขภาพ HP &ge; {node.minHp}</span>
              </>
            )}
          </div>

          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {node.title}
          </h4>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {node.description}
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-mono-num">
            <span
              className={`font-semibold ${
                node.annualStipend
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {node.annualStipend
                ? `เรียนฟรีทุนกองทัพ · รับเบี้ยเลี้ยง ${node.annualStipend.toLocaleString()} บ./ปี`
                : node.annualTuition === 0
                ? 'เรียนฟรี'
                : `ค่าเทอม ${node.annualTuition.toLocaleString()} บ./ปี`}
            </span>
            <span aria-hidden="true">·</span>
            <span>ใช้พลังงาน {node.energyDrainYearly} แต้ม/ปี</span>
            <span aria-hidden="true">·</span>
            <span className="font-sans">
              {node.allowsFullTimeWork ? 'ทำงานประจำควบคู่ได้' : 'เรียนเต็มเวลา'}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
              <Check className="w-4 h-4" />
              สำเร็จการศึกษาแล้ว
            </span>
          ) : isCurrentActive ? (
            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-400 whitespace-nowrap font-mono-num">
              <GraduationCap className="w-4 h-4" />
              กำลังเรียนปีที่ {player.education.years_in_program}/{node.durationYears}
              {player.education.uses_student_loan ? ' (กู้ กยศ.)' : ''}
            </span>
          ) : canEnroll ? (
            <div className="flex flex-wrap items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => onEnroll(level, false)}
                className="px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isCadetAcademy
                  ? 'สอบเข้าเตรียมทหาร (ทุนฟรี!)'
                  : scholarship
                  ? 'สมัครเรียน (ได้ทุนเรียนดีฟรี!)'
                  : 'สมัครเรียน (จ่ายเงินสด)'}
              </button>
              {!scholarship && node.supportsStudentLoan && (
                <button
                  type="button"
                  onClick={() => onEnroll(level, true)}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  กู้ กยศ. เรียน
                </button>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>{check.reason || 'ยังไม่ถึงเกณฑ์สมัคร'}</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            เส้นทางการศึกษาไทย โรงเรียนทหาร และกองทุนกู้ยืม กยศ.
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
            หลังจบ ม.3 สามารถเลือกสอบเข้าโรงเรียนเตรียมทหาร–นายร้อย (เรียนฟรีทุนกองทัพ จบติดยศร้อยตรีทันที) หรือเรียนต่อสายสามัญ สายอาชีพ (ปวช./ปวส.) และ กศน. พร้อมสิทธิ์ยื่นกู้ กยศ.
          </p>
        </div>

        {player.sex === 'MALE' && (
          <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono-num shrink-0">
            วิชาทหาร (รด.): ปีที่ {player.education.rotc_level}/3{' '}
            {player.education.rotc_level >= 3 ? '(ไม่ต้องเกณฑ์ทหารแล้ว)' : ''}
          </div>
        )}
      </div>

      {/* Stage 1: Compulsory */}
      <div className="space-y-3">
        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
          ขั้นที่ 1: การศึกษาภาคบังคับ (อายุ 7–15 ปี · เข้าเรียนอัตโนมัติ)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderNodeCard('PRIMARY')}
          {renderNodeCard('LOWER_SEC')}
        </div>
      </div>

      {/* Stage 2: Post M.3 Tracks */}
      <div className="space-y-3">
        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
          ขั้นที่ 2: ทางแยกหลังจบ ม.3 (สายในระบบเรียน รด. ได้ · สาย กศน. ทำงานประจำควบได้)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderNodeCard('UPPER_SEC_GENERAL')}
          {renderNodeCard('VOCATIONAL_PVCH')}
          {renderNodeCard('NON_FORMAL_KSN')}
        </div>
      </div>

      {/* Special Military Academy Track */}
      <div className="space-y-3">
        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
          เส้นทางพิเศษสายทหารอาชีพ: โรงเรียนเตรียมทหาร – โรงเรียนนายร้อยเหล่าทัพ (รับอายุ 15–18 ปี · เรียนจบติดดาวนายร้อยอัตโนมัติ)
        </div>
        <div className="grid grid-cols-1 gap-4">
          {renderNodeCard('MILITARY_CADET')}
        </div>
      </div>

      {/* Stage 3: Higher Education & Elite Overseas */}
      <div className="space-y-3">
        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
          ขั้นที่ 3: ปวส. ปริญญาตรี และปริญญาต่างประเทศ
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderNodeCard('PVSS')}
          {renderNodeCard('BACHELOR_REGULAR')}
          {renderNodeCard('BACHELOR_SPECIAL')}
          {renderNodeCard('OVERSEAS_DEGREE')}
        </div>
      </div>
    </div>
  );
};
