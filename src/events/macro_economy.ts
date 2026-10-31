import { EconomicCycleState, JobCategory, PlayerData } from '../engine/types';

export interface EconomicCycleConfig {
  id: EconomicCycleState;
  label: string;
  description: string;
  incomeMultipliers: Record<JobCategory, number>;
  jobSecurityModifier: number;
  hpDrainGlobal: number;
  forcedSideJob?: string;
}

export const ECONOMIC_CYCLES: Record<EconomicCycleState, EconomicCycleConfig> = {
  NORMAL: {
    id: 'NORMAL',
    label: 'สภาวะเศรษฐกิจปกติ',
    description: 'เศรษฐกิจขยายตัวตามเกณฑ์เฉลี่ย รายได้และความมั่นคงในงานอยู่ในระดับมาตรฐาน',
    incomeMultipliers: {
      TRADE: 1.0,
      CORPORATE_FRONTLINE: 1.0,
      PROFESSIONAL: 1.0,
      SKILLED_SERVICES: 1.0,
      ARTS_FREELANCE: 1.0,
      GOVERNMENT: 1.0,
      POLITICS: 1.0,
      SPORTS: 1.0,
      UNDERWORLD: 1.0,
    },
    jobSecurityModifier: 0,
    hpDrainGlobal: 0,
  },
  BOOM: {
    id: 'BOOM',
    label: 'เศรษฐกิจรุ่งเรือง (Economic Boom)',
    description:
      'การค้า กีฬา และบันเทิงคึกคัก สายค้าขาย (+50%) กีฬา (+40%) บันเทิง (+80%) รายได้พุ่งสูง!',
    incomeMultipliers: {
      TRADE: 1.5,
      CORPORATE_FRONTLINE: 1.2,
      PROFESSIONAL: 1.2,
      SKILLED_SERVICES: 1.3,
      ARTS_FREELANCE: 1.8,
      GOVERNMENT: 1.0,
      POLITICS: 1.0,
      SPORTS: 1.4,
      UNDERWORLD: 1.25,
    },
    jobSecurityModifier: 0.05,
    hpDrainGlobal: 0,
  },
  RECESSION: {
    id: 'RECESSION',
    label: 'วิกฤตเศรษฐกิจถดถอย (Recession)',
    description:
      'กำลังซื้อหดตัว สปอนเซอร์กีฬาและงานกลางคืนลดลง แต่ธุรกิจทวงหนี้และสีเทากลับเฟื่องฟูท่ามกลางวิกฤต!',
    incomeMultipliers: {
      TRADE: 0.7,
      CORPORATE_FRONTLINE: 0.8,
      PROFESSIONAL: 0.8,
      SKILLED_SERVICES: 0.8,
      ARTS_FREELANCE: 0.4,
      GOVERNMENT: 1.0,
      POLITICS: 1.0,
      SPORTS: 0.75,
      UNDERWORLD: 1.2,
    },
    jobSecurityModifier: -0.2,
    hpDrainGlobal: 0,
  },
  PANDEMIC_LOCKDOWN: {
    id: 'PANDEMIC_LOCKDOWN',
    label: 'วิกฤตโรคระบาดใหญ่และล็อกดาวน์ปิดเมือง',
    description:
      'สั่งปิดสนามมวย สนามกีฬา และสถานบันเทิงชั่วคราว! สุขภาพคนลดลง (-5 HP) คนแห่วิ่งไรเดอร์ประทังชีพ',
    incomeMultipliers: {
      TRADE: 0.3,
      CORPORATE_FRONTLINE: 0.9,
      PROFESSIONAL: 0.9,
      SKILLED_SERVICES: 0.5,
      ARTS_FREELANCE: 0.0,
      GOVERNMENT: 1.0,
      POLITICS: 1.0,
      SPORTS: 0.25,
      UNDERWORLD: 0.85,
    },
    jobSecurityModifier: -0.15,
    hpDrainGlobal: 5,
    forcedSideJob: 'DELIVERY_RIDER',
  },
};

export class MacroEconomyEngine {
  static getConfig(state: EconomicCycleState): EconomicCycleConfig {
    return ECONOMIC_CYCLES[state];
  }

  static getIncomeMultiplier(state: EconomicCycleState, category: JobCategory): number {
    return ECONOMIC_CYCLES[state].incomeMultipliers[category] ?? 1.0;
  }

  static tickMacroEconomy(player: PlayerData): string | null {
    player.macro_economy.years_remaining -= 1;
    if (player.macro_economy.years_remaining > 0) {
      return null;
    }

    const roll = Math.random();
    let nextState: EconomicCycleState = 'NORMAL';
    let duration = Math.floor(Math.random() * 6) + 10;

    if (player.macro_economy.current_state !== 'NORMAL') {
      if (roll < 0.55) {
        nextState = 'NORMAL';
        duration = Math.floor(Math.random() * 5) + 8;
      } else if (roll < 0.8) {
        nextState = 'BOOM';
        duration = Math.floor(Math.random() * 5) + 6;
      } else {
        nextState = 'RECESSION';
        duration = Math.floor(Math.random() * 4) + 4;
      }
    } else {
      if (roll < 0.4) {
        nextState = 'BOOM';
        duration = Math.floor(Math.random() * 5) + 6;
      } else if (roll < 0.78) {
        nextState = 'RECESSION';
        duration = Math.floor(Math.random() * 4) + 5;
      } else {
        nextState = 'PANDEMIC_LOCKDOWN';
        duration = 3;
      }
    }

    player.macro_economy.current_state = nextState;
    player.macro_economy.years_remaining = duration;

    const cfg = ECONOMIC_CYCLES[nextState];

    if (
      nextState === 'PANDEMIC_LOCKDOWN' &&
      !player.career.side_job &&
      player.career.prison_years_left === 0 &&
      player.age >= 18 &&
      (player.career.primary_job === 'FREELANCE_VOCALIST' ||
        player.career.primary_job === 'STREET_VENDOR' ||
        player.career.primary_job === 'MUAY_THAI_FIGHTER')
    ) {
      player.career.side_job = 'DELIVERY_RIDER';
      return `[คลื่นเศรษฐกิจเปลี่ยนผ่าน -> ${cfg.label}] ${cfg.description} · คุณตัดสินใจเปิดแอปวิ่งไรเดอร์เป็นอาชีพเสริมประทังชีพระหว่างล็อกดาวน์!`;
    }

    return `[คลื่นเศรษฐกิจเปลี่ยนผ่าน -> ${cfg.label}] ${cfg.description}`;
  }
}
