import React from 'react';
import { MilestoneNotification } from '../engine/types';
import { Bell, X, ArrowUpRight } from 'lucide-react';

interface MilestoneTrayProps {
  milestones: MilestoneNotification[];
  dismissedIds: string[];
  onDismiss: (id: string) => void;
  onNavigateTab: (
    tab:
      | 'TIMELINE'
      | 'ATHLETICS'
      | 'EDUCATION'
      | 'CAREER'
      | 'POLITICS'
      | 'ASSETS'
      | 'UNDERWORLD'
  ) => void;
}

const CATEGORY_LABEL: Record<MilestoneNotification['category'], string> = {
  EDUCATION: 'แจ้งเตือนเรื่องเรียน',
  CAREER: 'โอกาสทางอาชีพ',
  RETIREMENT: 'เตรียมตัววัยเกษียณ',
  FINANCE: 'แจ้งเตือนการเงิน',
  HEALTH: 'ช่วงวัยและสุขภาพ',
};

export const MilestoneTray: React.FC<MilestoneTrayProps> = ({
  milestones,
  dismissedIds,
  onDismiss,
  onNavigateTab,
}) => {
  const visible = milestones.filter((m) => !dismissedIds.includes(m.id));

  if (visible.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="หมุดหมายสำคัญที่กำลังจะมาถึง"
      className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80"
    >
      {visible.slice(0, 2).map((item) => (
        <div
          key={item.id}
          className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-opacity duration-150"
        >
          <div className="flex items-start gap-3 min-w-0">
            <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-1 shrink-0" />
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {CATEGORY_LABEL[item.category]}
                </span>
                <span aria-hidden="true">·</span>
                <span>{item.horizonLabel}</span>
              </div>

              <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                {item.title}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            {item.targetTab && item.actionLabel && (
              <button
                type="button"
                onClick={() => onNavigateTab(item.targetTab!)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-500 dark:hover:text-slate-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>{item.actionLabel}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onDismiss(item.id)}
              aria-label="ซ่อนการแจ้งเตือนนี้"
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
