import React from 'react';

interface StageArtworkProps {
  age: number;
  birthYearBe?: number;
  variant?: 'hero' | 'stage';
}

export const StageArtwork: React.FC<StageArtworkProps> = ({
  age,
  birthYearBe = 2545,
  variant = 'stage',
}) => {
  if (variant === 'hero') {
    return (
      <div className="relative w-full h-full min-h-[320px] overflow-hidden rounded-2xl bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-end p-6 sm:p-8">
        <svg
          className="absolute inset-0 w-full h-full object-cover"
          viewBox="0 0 800 450"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="thaiSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#1e1b4b" />
              <stop offset="84%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="groundFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.12" />
              <stop offset="55%" stopColor="#0f172a" stopOpacity="0.58" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <rect width="800" height="450" fill="url(#thaiSky)" />
          {/* Warm dusk sun */}
          <circle cx="575" cy="215" r="74" fill="#fbbf24" fillOpacity="0.26" />
          <circle cx="575" cy="215" r="44" fill="#fde68a" fillOpacity="0.48" />

          {/* Distant Bangkok shophouses & skyline */}
          <path
            d="M0 320 L0 190 L75 190 L75 215 L145 215 L145 160 L210 160 L210 230 L280 230 L280 175 L350 175 L350 245 L430 245 L430 205 L495 205 L495 260 L585 260 L585 195 L665 195 L665 225 L740 225 L740 180 L800 180 L800 320 Z"
            fill="#1e293b"
          />

          {/* Traditional Thai gable & temple spire silhouette */}
          <path d="M375 245 L395 138 L415 245 Z" fill="#0f172a" />
          <path d="M362 245 L395 205 L428 245 Z" fill="#1e293b" />

          {/* Foreground wooden shophouses & warm windows */}
          <rect x="30" y="220" width="110" height="140" fill="#0f172a" />
          <rect x="48" y="242" width="26" height="34" rx="2" fill="#f59e0b" fillOpacity="0.75" />
          <rect x="88" y="242" width="26" height="34" rx="2" fill="#fbbf24" fillOpacity="0.55" />

          <rect x="640" y="210" width="130" height="150" fill="#0f172a" />
          <rect x="662" y="236" width="30" height="36" rx="2" fill="#f59e0b" fillOpacity="0.7" />
          <rect x="708" y="236" width="30" height="36" rx="2" fill="#fde68a" fillOpacity="0.5" />

          {/* Thai utility poles & overhead cables */}
          <rect x="192" y="135" width="6" height="225" fill="#020617" />
          <rect x="180" y="150" width="30" height="4" fill="#020617" />
          <rect x="602" y="145" width="6" height="215" fill="#020617" />
          <rect x="590" y="160" width="30" height="4" fill="#020617" />

          <path
            d="M0 165 Q195 195 605 162 T800 175"
            stroke="#020617"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M0 175 Q195 208 605 172 T800 186"
            stroke="#020617"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Street food vendor cart glow */}
          <rect
            x="465"
            y="295"
            width="68"
            height="42"
            rx="4"
            fill="#1e293b"
            stroke="#f59e0b"
            strokeWidth="1.5"
          />
          <circle cx="482" cy="342" r="10" fill="#020617" stroke="#64748b" strokeWidth="2" />
          <circle cx="518" cy="342" r="10" fill="#020617" stroke="#64748b" strokeWidth="2" />
          <circle cx="499" cy="285" r="5" fill="#fef08a" />

          {/* Road surface & scrim */}
          <rect x="0" y="340" width="800" height="110" fill="#020617" />
          <rect width="800" height="450" fill="url(#groundFade)" />
        </svg>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="text-xs sm:text-sm text-amber-300 font-medium tracking-wide">
            เกมจำลองชีวิตคนไทยแบบทีละปี · ตั้งแต่วันเกิดจนถึงรุ่นลูกหลาน
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-snug text-balance">
            ต้นทุนตอนเกิดอาจสุ่มมาไม่เท่ากัน แต่ทุกการเลือกในแต่ละปีคือคนกำหนดตอนจบ
          </h1>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            แบ่งพลังงาน 100 แต้มต่อปี เลือกเรียนสายสามัญ อาชีวะ หรือ กศน. ปั้นตัวสู่อาชีพสุจริต นักกีฬาทีมชาติ หรือสายมืด ผ่อนบ้านผ่อนรถ และส่งต่อมรดกให้ทายาทรุ่นถัดไป
          </p>
        </div>
      </div>
    );
  }

  const stageInfo =
    age <= 6
      ? {
          label: 'วัยเด็กเล็ก (0–6 ปี)',
          sub: 'เติบโตในครอบครัว สะสมพื้นฐานร่างกายและพัฒนาการ',
          accent: '#0284c7',
        }
      : age <= 15
      ? {
          label: 'วัยเรียนภาคบังคับ (7–15 ปี)',
          sub: 'ประถมถึง ม.ต้น ก่อนเลือกสายเรียนตอนอายุ 16 ปี',
          accent: '#d97706',
        }
      : age <= 24
      ? {
          label: 'วัยรุ่นและหัวเลี้ยวหัวต่อ (16–24 ปี)',
          sub: 'เลือกสายเรียน ลุ้นเกณฑ์ทหาร และเริ่มก้าวแรกสู่อาชีพ',
          accent: '#ea580c',
        }
      : age < 60
      ? {
          label: 'วัยทำงานสร้างฐานะ (25–59 ปี)',
          sub: 'ปั้นรายได้ ผ่อนทรัพย์สิน สร้างครอบครัว และรับมือเศรษฐกิจ',
          accent: '#059669',
        }
      : {
          label: 'วัยเกษียณและบั้นปลาย (60+ ปี)',
          sub: 'ดูแลสุขภาพกายใจและเตรียมส่งต่อมรดกให้ลูกหลาน',
          accent: '#7c3aed',
        };

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-y border-slate-100 dark:border-slate-800">
      <div className="min-w-0 space-y-0.5">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-num">
          ช่วงชีวิตปัจจุบัน · พ.ศ. {birthYearBe + age}
        </div>
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {stageInfo.label}
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {stageInfo.sub}
        </div>
      </div>
      <svg className="w-11 h-11 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
        <rect
          x="4"
          y="4"
          width="40"
          height="40"
          rx="12"
          fill={stageInfo.accent}
          fillOpacity="0.12"
        />
        <circle cx="24" cy="19" r="7" stroke={stageInfo.accent} strokeWidth="2.2" fill="none" />
        <path
          d="M12 36 C12 29.5 36 29.5 36 36"
          stroke={stageInfo.accent}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};
