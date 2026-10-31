import React, { useEffect, useRef, useState } from 'react';
import { ConditionalEvent } from '../engine/types';
import { soundFX } from '../engine/sound';
import { AlertOctagon, ArrowRight, Landmark, Volume2, X } from 'lucide-react';

export type PriorityToastCategory = 'CRITICAL' | 'MILESTONE_THAI';

export interface PriorityToastItem {
  id: string;
  eventId: string;
  category: PriorityToastCategory;
  title: string;
  description: string;
  age: number;
  yearBe: number;
}

export function isPriorityToastCategory(
  category: ConditionalEvent['category']
): category is PriorityToastCategory {
  return category === 'CRITICAL' || category === 'MILESTONE_THAI';
}

interface PriorityEventToastProps {
  toasts: PriorityToastItem[];
  soundMuted: boolean;
  onDismiss: (toastId: string) => void;
  onFocusEvent: (toastId: string) => void;
}

const AUTO_DISMISS_MS = 7500;

interface SingleToastCardProps {
  item: PriorityToastItem;
  soundMuted: boolean;
  onDismiss: (toastId: string) => void;
  onFocusEvent: (toastId: string) => void;
}

const SingleToastCard: React.FC<SingleToastCardProps> = ({
  item,
  soundMuted,
  onDismiss,
  onFocusEvent,
}) => {
  const [paused, setPaused] = useState(false);
  const remainingRef = useRef<number>(AUTO_DISMISS_MS);
  const lastStartRef = useRef<number>(Date.now());

  useEffect(() => {
    if (paused) return;

    lastStartRef.current = Date.now();
    const timer = window.setTimeout(() => {
      onDismiss(item.id);
    }, remainingRef.current);

    return () => {
      window.clearTimeout(timer);
      const elapsed = Date.now() - lastStartRef.current;
      remainingRef.current = Math.max(250, remainingRef.current - elapsed);
    };
  }, [paused, item.id, onDismiss]);

  const isCritical = item.category === 'CRITICAL';

  const handleReplayCue = () => {
    if (isCritical) {
      soundFX.playCriticalToastCue();
    } else {
      soundFX.playThaiMilestoneToastCue();
    }
  };

  return (
    <div
      role="alert"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`priority-toast-card priority-toast-enter pointer-events-auto rounded-2xl p-5 shadow-xl border space-y-3.5 ${
        isCritical
          ? 'bg-rose-950 text-rose-50 border-rose-500/80'
          : 'bg-indigo-950 text-amber-50 border-amber-400/80'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {isCritical ? (
            <AlertOctagon className="w-5 h-5 text-rose-300 mt-0.5 shrink-0" />
          ) : (
            <Landmark className="w-5 h-5 text-amber-300 mt-0.5 shrink-0" />
          )}

          <div className="space-y-1 min-w-0">
            {/* Unboxed Clean Typography Metadata (Zero-Pill Compliance) */}
            <div
              className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold ${
                isCritical ? 'text-rose-300' : 'text-amber-300'
              }`}
            >
              <span>{isCritical ? 'เหตุวิกฤตฉุกเฉิน' : 'หมุดหมายชีวิตไทย'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num">อายุ {item.age} ปี</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num">พ.ศ. {item.yearBe}</span>
            </div>

            <h4 className="text-sm sm:text-base font-bold leading-snug text-white">
              {item.title}
            </h4>

            <p
              className={`text-xs sm:text-sm leading-relaxed line-clamp-2 ${
                isCritical ? 'text-rose-100/90' : 'text-indigo-100/90'
              }`}
            >
              {item.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(item.id)}
          aria-label="ปิดการแจ้งเตือน"
          className={`p-2 -mr-1 -mt-1 rounded-lg transition-colors shrink-0 cursor-pointer ${
            isCritical
              ? 'text-rose-300 hover:text-white hover:bg-rose-900/80'
              : 'text-indigo-200 hover:text-white hover:bg-indigo-900/80'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        {!soundMuted ? (
          <button
            type="button"
            onClick={handleReplayCue}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isCritical
                ? 'text-rose-200 hover:text-white hover:bg-rose-900/70'
                : 'text-amber-200 hover:text-white hover:bg-indigo-900/80'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 shrink-0" />
            <span>ฟังสัญญาณเสียงอีกครั้ง</span>
          </button>
        ) : (
          <span
            className={`text-xs ${isCritical ? 'text-rose-300/80' : 'text-indigo-200/80'}`}
          >
            ปิดเสียงเอฟเฟกต์อยู่
          </span>
        )}

        <button
          type="button"
          onClick={() => onFocusEvent(item.id)}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            isCritical
              ? 'bg-rose-500 hover:bg-rose-400 text-white'
              : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
          }`}
        >
          <span>{isCritical ? 'รับมือเหตุวิกฤต' : 'ตัดสินใจหมุดหมาย'}</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </div>

      {/* Compositor-Only Auto-Dismiss Progress Indicator */}
      <div
        className={`h-1 rounded-full overflow-hidden ${
          isCritical ? 'bg-rose-900/80' : 'bg-indigo-900/80'
        }`}
      >
        <div
          className={`h-full w-full priority-toast-timer ${
            isCritical ? 'bg-rose-400' : 'bg-amber-400'
          }`}
        />
      </div>
    </div>
  );
};

export const PriorityEventToast: React.FC<PriorityEventToastProps> = ({
  toasts,
  soundMuted,
  onDismiss,
  onFocusEvent,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      aria-atomic="false"
      className="fixed bottom-5 right-5 z-40 w-[calc(100vw-2.5rem)] max-w-md pointer-events-none flex flex-col gap-3"
    >
      {toasts.slice(-2).map((item) => (
        <SingleToastCard
          key={item.id}
          item={item}
          soundMuted={soundMuted}
          onDismiss={onDismiss}
          onFocusEvent={onFocusEvent}
        />
      ))}
    </div>
  );
};
