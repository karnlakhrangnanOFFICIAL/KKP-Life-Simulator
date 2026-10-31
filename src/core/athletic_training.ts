import {
  AthleticTrainingModeId,
  AthleticTrainingOption,
  PlayerData,
} from '../engine/types';
import { EnergySystem } from './energy_system';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export const ATHLETIC_TRAINING_MODES: AthleticTrainingOption[] = [
  {
    id: 'INTENSIVE_COACHING',
    title: 'โค้ชส่วนตัวเข้มข้นพิเศษ',
    englishTitle: 'Intensive Sports Coaching',
    minAge: 8,
    energyCost: 50,
    hpCost: 20, // Costs 50 Energy and 20 HP
    athGain: 18,
    socGain: 12,
    sanDelta: -2,
    riskTag: 'ภาระร่างกายสูง (หัก 20 HP)',
    paceTag: 'พัฒนาเร็วที่สุด + คอนเนกชันระดับสูง',
    description:
      'ฝึกหนักตัวต่อตัวกับโค้ชระดับชาติและวิทยาศาสตร์การกีฬา รีดศักยภาพร่างกายถึงขีดสุดเพื่อเร่งค่า ATH ก้าวกระโดด พร้อมเปิดคอนเนกชันแมวมอง สปอนเซอร์ และผู้จัดการทีม (SOC สูงมาก)',
  },
  {
    id: 'CLUB_TRAINING',
    title: 'เข้าแคมป์ฝึกซ้อมสโมสร',
    englishTitle: 'Club Training',
    minAge: 7,
    energyCost: 30,
    hpCost: 8, // Balanced energy & HP cost
    athGain: 10,
    socGain: 5,
    sanDelta: 2,
    riskTag: 'ภาระปานกลาง (หัก 8 HP)',
    paceTag: 'สมดุลทักษะสนาม & ระบบทีม',
    description:
      'ลงซ้อมระบบทีมและแท็กติกร่วมกับเพื่อนร่วมคลับกีฬา พัฒนาทักษะ ATH อย่างสม่ำเสมอ ได้เครือข่ายเพื่อนนักกีฬาและสตาฟฟ์โค้ชโดยไม่หักโหมร่างกายจนเกินไป',
  },
  {
    id: 'SOLO_PRACTICE',
    title: 'ซ้อมเดี่ยวพื้นฐานด้วยตนเอง',
    englishTitle: 'Solo Practice',
    minAge: 6,
    energyCost: 15,
    hpCost: -2, // Safer, gentle conditioning (+2 HP recovery)
    athGain: 4,
    socGain: 0,
    sanDelta: 2,
    riskTag: 'ปลอดภัย 100% (ฟื้นฟู +2 HP)',
    paceTag: 'ค่อยเป็นค่อยไป · ไม่เสี่ยงบาดเจ็บ',
    description:
      'วิ่งจ็อกกิ้ง ฝึกเบสิก และทำกายบริหารด้วยตัวเองตามจังหวะร่างกาย ปลอดภัยไร้ความเสี่ยงบาดเจ็บ แถมช่วยเสริมความฟิต HP เล็กน้อย แต่ค่า ATH จะขยับขึ้นช้าและไม่ได้คอนเนกชัน',
  },
];

export class AthleticTrainingEngine {
  static getModeById(id: AthleticTrainingModeId): AthleticTrainingOption | undefined {
    return ATHLETIC_TRAINING_MODES.find((m) => m.id === id);
  }

  static getAthleteTierInfo(ath: number): {
    rankLabel: string;
    nextTargetLabel: string;
  } {
    if (ath >= 85) {
      return {
        rankLabel: 'ซูเปอร์สตาร์ระดับทีมชาติ (World-Class / National Star)',
        nextTargetLabel: 'ถึงเกณฑ์สูงสุดของสายกีฬาอาชีพแล้ว รักษาความฟิตเพื่อกวาดแชมป์!',
      };
    }
    if (ath >= 65) {
      return {
        rankLabel: 'นักกีฬาสโมสรอาชีพ (Pro Club / Coach Eligible)',
        nextTargetLabel: `อีก ${85 - ath} แต้ม ATH เพื่อปลดล็อกระดับซูเปอร์สตาร์ทีมชาติ (85+)`,
      };
    }
    if (ath >= 45) {
      return {
        rankLabel: 'นักกีฬาดาวรุ่ง / นักมวยอาชีพ (Semi-Pro Fighter)',
        nextTargetLabel: `อีก ${65 - ath} แต้ม ATH เพื่อปลดล็อกนักกีฬาสโมสรไทยลีก & สอบใบโค้ช (65+)`,
      };
    }
    return {
      rankLabel: 'เยาวชน / มือสมัครเล่น (Amateur)',
      nextTargetLabel: `อีก ${45 - ath} แต้ม ATH เพื่อปลดล็อกอาชีพนักมวยไทยเดินสาย (45+)`,
    };
  }

  static getAgeEfficiencyMultiplier(age: number): {
    multiplier: number;
    phaseLabel: string;
    advisory: string;
  } {
    if (age <= 26) {
      return {
        multiplier: 1.0,
        phaseLabel: 'ช่วงวัยทองของการพัฒนากล้ามเนื้อ (Golden Growth Window)',
        advisory: 'ร่างกายตอบสนองต่อการฝึกซ้อมเต็ม 100% เหมาะกับการเร่งปั้น ATH สู่ระดับท็อป',
      };
    }
    if (age <= 34) {
      return {
        multiplier: 0.9,
        phaseLabel: 'ช่วงจุดพีคและรักษามาตรฐานอาชีพ (Prime Peak)',
        advisory: 'ประสบการณ์สูงแต่ต้องระวังการใช้ HP เกินตัวก่อนลงแข่งขัน',
      };
    }
    return {
      multiplier: 0.7,
      phaseLabel: 'ช่วงวัยเก๋า ประคองสภาพร่างกาย (Veteran Conditioning)',
      advisory: 'อัตราการเพิ่ม ATH ช้าลงตามวัย (70%) แนะนำซ้อมประคองหรือเตรียมสอบใบโค้ชกีฬา',
    };
  }

  static checkEligibility(
    player: PlayerData,
    mode: AthleticTrainingOption
  ): { eligible: boolean; reason?: string } {
    if (player.career.prison_years_left > 0) {
      return {
        eligible: false,
        reason: 'อยู่ในเรือนจำ (ใช้ตารางฝึกในลานแดนขังแทน)',
      };
    }
    if (player.career.conscription_years_left > 0) {
      return {
        eligible: false,
        reason: 'อยู่ระหว่างฝึกประจำการในค่ายทหาร',
      };
    }
    if (player.age < mode.minAge) {
      return {
        eligible: false,
        reason: `ต้องมีอายุอย่างน้อย ${mode.minAge} ปี`,
      };
    }
    if (player.stats.energy < mode.energyCost) {
      return {
        eligible: false,
        reason: `พลังงานไม่พอ (ต้องการ ${mode.energyCost} Energy · เหลือ ${player.stats.energy})`,
      };
    }
    const allocSummary = EnergySystem.calculateAllocationSummary(player, {});
    if (allocSummary.totalAllocated + mode.energyCost > allocSummary.hardCapEnergy) {
      return {
        eligible: false,
        reason: `เกินเพดานฝืนร่างกายสูงสุดประจำปี (${allocSummary.hardCapEnergy} Energy เมื่อรวมงานหลัก/เรียน)`,
      };
    }
    // Safety threshold: player must survive the HP drain with at least 1 HP remaining
    if (mode.hpCost > 0 && player.stats.hp <= mode.hpCost) {
      return {
        eligible: false,
        reason: `ร่างกายบอบช้ำเกินไป (ต้องการ HP มากกว่า ${mode.hpCost} เพื่อความปลอดภัย)`,
      };
    }

    return { eligible: true };
  }

  static executeTraining(
    player: PlayerData,
    modeId: AthleticTrainingModeId
  ): {
    updated: PlayerData;
    success: boolean;
    athDelta: number;
    socDelta: number;
    hpDelta: number;
    message: string;
  } {
    const mode = this.getModeById(modeId);
    if (!mode) {
      return {
        updated: player,
        success: false,
        athDelta: 0,
        socDelta: 0,
        hpDelta: 0,
        message: 'ไม่พบรูปแบบการฝึกซ้อมกีฬา',
      };
    }

    const check = this.checkEligibility(player, mode);
    if (!check.eligible) {
      return {
        updated: player,
        success: false,
        athDelta: 0,
        socDelta: 0,
        hpDelta: 0,
        message: check.reason || 'ไม่สามารถฝึกซ้อมได้ในขณะนี้',
      };
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    const { multiplier } = this.getAgeEfficiencyMultiplier(next.age);

    // Deduct exact Energy and apply exact HP delta
    next.stats.energy = Math.max(0, next.stats.energy - mode.energyCost);
    const hpDelta = -mode.hpCost; // e.g., -20 for Intensive, -8 for Club, +2 for Solo

    let athGain = Math.max(2, Math.round(mode.athGain * multiplier));
    let socGain = mode.socGain;
    let bonusNote = '';

    // Breakthrough / Networking moments for Intensive & Club training
    if (mode.id === 'INTENSIVE_COACHING' && Math.random() < 0.22) {
      athGain += 3;
      socGain += 3;
      bonusNote = ' [โค้ชทึ่งในพัฒนาการ! แนะนำตัวคุณให้แมวมองทีมชาติรู้จัก +3 ATH, +3 SOC]';
    } else if (mode.id === 'CLUB_TRAINING' && Math.random() < 0.15) {
      athGain += 2;
      socGain += 2;
      bonusNote = ' [โชว์ฟอร์มเด่นในการลงทีมซ้อม! สตาฟฟ์สโมสรประทับใจ +2 ATH, +2 SOC]';
    }

    const prevAth = next.stats.ath;
    const prevSoc = next.stats.soc;
    const prevHp = next.stats.hp;

    next.stats.hp = clamp(next.stats.hp + hpDelta, 1, 100);
    next.stats.ath = clamp(next.stats.ath + athGain, 0, 100);
    next.stats.soc = clamp(next.stats.soc + socGain, 0, 100);
    next.stats.san = clamp(next.stats.san + mode.sanDelta, 0, 100);

    next.max_stats_reached.ath = Math.max(next.max_stats_reached.ath, next.stats.ath);
    next.max_stats_reached.soc = Math.max(next.max_stats_reached.soc, next.stats.soc);

    const actualAthDelta = next.stats.ath - prevAth;
    const actualSocDelta = next.stats.soc - prevSoc;
    const actualHpDelta = next.stats.hp - prevHp;

    const logEntry = `ฝึกซ้อมโปรแกรม "${mode.title} (${mode.englishTitle})" ใช้ ${mode.energyCost} Energy · ${
      actualHpDelta >= 0 ? `ฟื้นฟู +${actualHpDelta} HP` : `หัก ${actualHpDelta} HP`
    } -> พัฒนาทักษะกีฬา +${actualAthDelta} ATH${
      actualSocDelta > 0 ? `, คอนเนกชันวงการกีฬา +${actualSocDelta} SOC` : ''
    }${bonusNote}`;

    if (!next.pending_year_logs) {
      next.pending_year_logs = [];
    }
    next.pending_year_logs.push(logEntry);

    return {
      updated: next,
      success: true,
      athDelta: actualAthDelta,
      socDelta: actualSocDelta,
      hpDelta: actualHpDelta,
      message: `${logEntry}`,
    };
  }
}
