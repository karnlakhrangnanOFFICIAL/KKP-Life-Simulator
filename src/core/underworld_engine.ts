import { EventChainQueue } from '../events/event_chain_queue';
import { CareerEngine } from '../engine/CareerEngine';
import {
  CrimeOperation,
  PlayerData,
  SafehouseDefinition,
  SafehouseId,
} from '../engine/types';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const SAFEHOUSE_TIERS: SafehouseDefinition[] = [
  {
    id: 'SLUM_ROOM',
    name: 'ห้องเช่าลับท้ายตรอกชานเมือง',
    tierLabel: 'ระดับ 1 · กบดานชั่วคราว',
    setupCost: 15000,
    annualUpkeep: 12000,
    arrestRiskReductionPct: 8,
    notorietyDecayYearly: 5,
    sanBonusYearly: 0,
    seizureProtectionFactor: 1.0,
    description:
      'เช่าห้องแถวเก่าไม่มีชื่อในสัญญา ใช้ซ่อนตัวหลบสายสืบเบื้องต้นและพักของร้อนระยะสั้น',
  },
  {
    id: 'PROVINCIAL_SAFEHOUSE',
    name: 'บ้านสวนกบดานต่างจังหวัด (นอมินีถือครอง)',
    tierLabel: 'ระดับ 2 · เซฟเฮาส์ภูมิภาค',
    setupCost: 65000,
    annualUpkeep: 30000,
    arrestRiskReductionPct: 16,
    notorietyDecayYearly: 10,
    sanBonusYearly: 2,
    seizureProtectionFactor: 0.85,
    description:
      'บ้านเดี่ยวกลางสวนห่างไกลสายตาผู้คน มีทางหนีทีไล่ทะลุออกถนนสายรอง ลดความเสี่ยงถูกบุกจับอย่างเห็นผล',
  },
  {
    id: 'VIP_PENTHOUSE_BUNKER',
    name: 'เพนต์เฮาส์นิรภัย & ระบบตัดสัญญาณไซเบอร์',
    tierLabel: 'ระดับ 3 · บังเกอร์ระดับเจ้าพ่อ',
    setupCost: 220000,
    annualUpkeep: 85000,
    arrestRiskReductionPct: 26,
    notorietyDecayYearly: 16,
    sanBonusYearly: 4,
    seizureProtectionFactor: 0.7,
    description:
      'ห้องลับคีย์การ์ดหลายชั้นพร้อมระบบพราง IP และตู้เซฟซ่อนเงินสด ป้องกันการแกะรอยของตำรวจไซเบอร์ได้ดีเยี่ยม',
  },
  {
    id: 'BORDER_COMPOUND',
    name: 'คฤหาสน์อิทธิพลชายแดน & ทีมบอดี้การ์ดคุ้มกัน',
    tierLabel: 'ระดับ 4 · อาณาจักรไร้ร่องรอย',
    setupCost: 650000,
    annualUpkeep: 200000,
    arrestRiskReductionPct: 38,
    notorietyDecayYearly: 24,
    sanBonusYearly: 6,
    seizureProtectionFactor: 0.5,
    description:
      'ฐานที่มั่นระดับมาเฟียพร้อมเครือข่ายสายข่าวเตือนภัยล่วงหน้าและบัญชีผ่องถ่ายทรัพย์สิน (หากพลาดถูกจับ ลดเงินสดที่โดนยึดลงครึ่งหนึ่ง!)',
  },
];

export const CRIME_OPERATIONS: CrimeOperation[] = [
  {
    id: 'ILLEGAL_STREET_BETTING',
    title: 'ปล่อยของรายย่อย / เดินโพยพนันตามซุ้ม',
    minAge: 14,
    energyCost: 15,
    rewardMin: 14000,
    rewardMax: 48000,
    baseArrestChancePct: 14,
    prisonYears: 1,
    notorietyGain: 9,
    description: 'งานร้อนหาเงินสดรายสัปดาห์ โอกาสได้เงินไวแต่เสี่ยงโดนสายลับล่อซื้อจับกุมจำคุก 1 ปี',
  },
  {
    id: 'MULE_ACCOUNT_BROKER',
    title: 'รวบรวมซิมผี-บัญชีม้าส่งเครือข่ายสีเทา',
    minAge: 17,
    energyCost: 20,
    minSoc: 40,
    rewardMin: 42000,
    rewardMax: 98000,
    baseArrestChancePct: 22,
    prisonYears: 3,
    notorietyGain: 18,
    description: 'ผลตอบแทนหลักหมื่นปลายๆ แต่ทิ้งร่องรอยดิจิทัลไว้ให้ตำรวจไซเบอร์ออกหมายจับย้อนหลังได้!',
  },
  {
    id: 'SMUGGLING_CONTRABAND',
    title: 'คุ้มกันขบวนขนของเถื่อนข้ามจังหวัดยามวิกาล',
    minAge: 18,
    energyCost: 25,
    minAth: 45,
    rewardMin: 90000,
    rewardMax: 210000,
    baseArrestChancePct: 27,
    prisonYears: 4,
    notorietyGain: 24,
    description: 'งานระดับสมุนเจ้าพ่อ ต้องอาศัยความอึดและแหล่งกบดานพักของเพื่อหลบด่านตรวจสกัด (โทษจำคุก 4 ปี)',
  },
  {
    id: 'CYBER_SCAM_SYNDICATE_HEIST',
    title: 'ดีลฟอกเงินหมื่นล้าน & ฮุบส่วนแบ่งนายทุนมืด',
    minAge: 21,
    energyCost: 35,
    minInt: 65,
    rewardMin: 260000,
    rewardMax: 780000,
    baseArrestChancePct: 34,
    prisonYears: 6,
    notorietyGain: 35,
    description: 'เดิมพันสูงสุดของโลกใต้ดิน ทำสำเร็จรวยข้ามคืน แต่ถ้าไร้แหล่งกบดานคุ้มกันมีสิทธิ์โดนรวบจำคุก 6 ปี!',
  },
];

export interface AnnualArrestRiskBreakdown {
  hasActiveThreat: boolean;
  totalRiskPct: number;
  jobRiskPct: number;
  manhuntRiskPct: number;
  notorietyRiskPct: number;
  safehouseShieldPct: number;
  statMitigationPct: number;
  expectedSentenceYears: number;
  wantedStatusLabel: string;
}

export class UnderworldEngine {
  static getSafehouseById(id: SafehouseId | null | undefined): SafehouseDefinition | null {
    if (!id) return null;
    return SAFEHOUSE_TIERS.find((s) => s.id === id) || null;
  }

  static getEffectiveSafehouseShield(player: PlayerData): {
    shieldPct: number;
    compromised: boolean;
    safehouse: SafehouseDefinition | null;
  } {
    const safehouse = this.getSafehouseById(player.career.safehouse_id);
    if (!safehouse) {
      return { shieldPct: 0, compromised: false, safehouse: null };
    }
    const compromised = player.career.safehouse_security < 35;
    const shieldPct = compromised
      ? Math.round(safehouse.arrestRiskReductionPct * 0.45)
      : safehouse.arrestRiskReductionPct;
    return { shieldPct, compromised, safehouse };
  }

  static getWantedStatusLabel(notoriety: number): string {
    if (notoriety >= 75) return 'หมายจับแดง! ชุดเฉพาะกิจไล่ล่าระดับประเทศ';
    if (notoriety >= 45) return 'ผู้ต้องสงสัยคดีสำคัญ ตำรวจกำลังแกะรอย';
    if (notoriety >= 20) return 'อยู่ในแฟ้มเฝ้าระวังของสายสืบ';
    return 'โปรไฟล์สะอาด / ไร้หมายจับเร่งด่วน';
  }

  /**
   * Computes live annual police raid / arrest probability from illegal careers + high notoriety manhunts,
   * mitigated by the player's active Safehouse shield, INT, and LUK.
   */
  static calculateAnnualArrestRisk(player: PlayerData): AnnualArrestRiskBreakdown {
    const wantedStatusLabel = this.getWantedStatusLabel(player.career.notoriety);

    if (player.career.prison_years_left > 0) {
      return {
        hasActiveThreat: false,
        totalRiskPct: 0,
        jobRiskPct: 0,
        manhuntRiskPct: 0,
        notorietyRiskPct: 0,
        safehouseShieldPct: 0,
        statMitigationPct: 0,
        expectedSentenceYears: 0,
        wantedStatusLabel: 'กำลังรับโทษอยู่ในเรือนจำ',
      };
    }

    const primaryJob = CareerEngine.getJobById(player.career.primary_job);
    const sideJob = CareerEngine.getJobById(player.career.side_job);

    const primaryRisk =
      primaryJob?.is_illegal && primaryJob.arrest_risk_base_pct
        ? primaryJob.arrest_risk_base_pct
        : 0;
    const sideRisk =
      sideJob?.is_illegal && sideJob.arrest_risk_base_pct
        ? Math.round(sideJob.arrest_risk_base_pct * 0.5)
        : 0;
    const jobRiskPct = primaryRisk + sideRisk;

    // Even if unemployed or in a front job, Notoriety >= 40 triggers an active police manhunt!
    const manhuntRiskPct =
      jobRiskPct === 0 && player.career.notoriety >= 40
        ? Math.round((player.career.notoriety - 35) * 0.38)
        : 0;

    if (jobRiskPct === 0 && manhuntRiskPct === 0) {
      const { shieldPct } = this.getEffectiveSafehouseShield(player);
      return {
        hasActiveThreat: false,
        totalRiskPct: 0,
        jobRiskPct: 0,
        manhuntRiskPct: 0,
        notorietyRiskPct: 0,
        safehouseShieldPct: shieldPct,
        statMitigationPct: 0,
        expectedSentenceYears: 0,
        wantedStatusLabel,
      };
    }

    const notorietyRiskPct = Math.round(player.career.notoriety * 0.25);
    const { shieldPct: safehouseShieldPct } = this.getEffectiveSafehouseShield(player);
    const localAffinity = player.street_world?.neighborhood_affinity ?? 50;
    const localTipoffMod =
      localAffinity >= 75 ? 4 : localAffinity >= 60 ? 2 : localAffinity <= 24 ? -2 : 0;
    const statMitigationPct = Math.max(
      0,
      Math.round(
        Math.max(0, player.stats.int - 50) * 0.12 + player.stats.luk * 1.2 + localTipoffMod
      )
    );

    const totalRiskPct = clamp(
      jobRiskPct + manhuntRiskPct + notorietyRiskPct - safehouseShieldPct - statMitigationPct,
      2,
      85
    );

    const expectedSentenceYears = primaryJob?.is_illegal
      ? primaryJob.prison_sentence_years || 3
      : sideJob?.is_illegal
      ? sideJob.prison_sentence_years || 2
      : player.career.notoriety >= 75
      ? 5
      : 3;

    return {
      hasActiveThreat: true,
      totalRiskPct,
      jobRiskPct,
      manhuntRiskPct,
      notorietyRiskPct,
      safehouseShieldPct,
      statMitigationPct,
      expectedSentenceYears,
      wantedStatusLabel,
    };
  }

  static calculateOperationArrestRisk(player: PlayerData, op: CrimeOperation): number {
    const notorietyPenalty = player.career.notoriety * 0.25;
    const { shieldPct } = this.getEffectiveSafehouseShield(player);
    const hideoutMitigation = shieldPct * 0.65;
    const skillMitigation = (player.stats.int - 50) * 0.12 + (player.stats.luk - 5) * 1.6;

    return clamp(
      Math.round(op.baseArrestChancePct + notorietyPenalty - hideoutMitigation - skillMitigation),
      3,
      85
    );
  }

  static checkOperationEligibility(
    player: PlayerData,
    op: CrimeOperation
  ): { eligible: boolean; reason?: string } {
    if (player.career.prison_years_left > 0) {
      return { eligible: false, reason: 'กำลังถูกคุมขังอยู่ในเรือนจำ' };
    }
    if (player.career.conscription_years_left > 0) {
      return { eligible: false, reason: 'อยู่ระหว่างประจำการในค่ายทหาร' };
    }
    if (player.age < op.minAge) {
      return { eligible: false, reason: `อายุขั้นต่ำ ${op.minAge} ปี` };
    }
    if (op.minInt && player.stats.int < op.minInt) {
      return { eligible: false, reason: `ต้องการ INT >= ${op.minInt}` };
    }
    if (op.minSoc && player.stats.soc < op.minSoc) {
      return { eligible: false, reason: `ต้องการ SOC >= ${op.minSoc}` };
    }
    if (op.minAth && player.stats.ath < op.minAth) {
      return { eligible: false, reason: `ต้องการ ATH >= ${op.minAth}` };
    }
    if (player.stats.energy < op.energyCost) {
      return { eligible: false, reason: `พลังงานไม่พอ (ต้องการ ${op.energyCost} แต้ม)` };
    }
    return { eligible: true };
  }

  static executeCrimeOperation(
    player: PlayerData,
    opId: string
  ): { updated: PlayerData; arrested: boolean; message: string } {
    const op = CRIME_OPERATIONS.find((o) => o.id === opId);
    if (!op) return { updated: player, arrested: false, message: 'ไม่พบข้อมูลงานสายมืด' };

    const check = this.checkOperationEligibility(player, op);
    if (!check.eligible) {
      return { updated: player, arrested: false, message: check.reason || 'ทำรายการไม่ได้' };
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    next.stats.energy = Math.max(0, next.stats.energy - op.energyCost);

    const effectiveArrestPct = this.calculateOperationArrestRisk(next, op);
    const roll = Math.random() * 100;

    if (roll < effectiveArrestPct) {
      this.incarceratePlayer(next, op.prisonYears, 0.35);
      return {
        updated: next,
        arrested: true,
        message: `[พลาดท่าถูกตำรวจบุกรวบคาหนังคาเขา!] ศาลพิพากษาจำคุก ${op.prisonYears} ปี แหล่งกบดานถูกทลาย และติดประวัติอาชญากรรมถาวร!`,
      };
    }

    const payout = randomInt(op.rewardMin, op.rewardMax);
    next.finance.cash += payout;
    next.career.notoriety = clamp(next.career.notoriety + op.notorietyGain, 0, 100);
    next.stats.san = clamp(next.stats.san - 6, 0, 100);

    // Using a safehouse for active crime slightly wears down its location secrecy
    if (next.career.safehouse_id) {
      next.career.safehouse_security = clamp(next.career.safehouse_security - 10, 0, 100);
    }

    if (
      op.notorietyGain >= 15 &&
      Math.random() < 0.32 &&
      !next.event_queue.some((q) => q.event_chain_id === 'POLICE_WARRANT_TRACE')
    ) {
      EventChainQueue.scheduleChainEvent(next, {
        queue_id: `POLICE_TRACE_${next.age}`,
        trigger_age: next.age + 2,
        event_chain_id: 'POLICE_WARRANT_TRACE',
        title: 'ตำรวจขยายผลเส้นทางการเงินจากงานสีเทาในอดีต',
        payload: {
          prison_years: Math.max(1, op.prisonYears - 1),
        },
      });
    }

    return {
      updated: next,
      arrested: false,
      message: `[งานสำเร็จ!] ฟันเงินสดสีเทาเข้ากระเป๋า +${payout.toLocaleString()} บาท (ระดับหมายจับสะสม ${next.career.notoriety}/100)`,
    };
  }

  /**
   * Rent or establish a new Safehouse / Hideout to shelter from police raids.
   */
  static acquireSafehouse(
    player: PlayerData,
    safehouseId: SafehouseId
  ): { updated: PlayerData; success: boolean; message: string } {
    if (player.career.prison_years_left > 0) {
      return { updated: player, success: false, message: 'อยู่ในเรือนจำไม่สามารถจัดหาแหล่งกบดานได้' };
    }
    const def = this.getSafehouseById(safehouseId);
    if (!def) return { updated: player, success: false, message: 'ไม่พบข้อมูลแหล่งกบดาน' };

    if (player.career.safehouse_id === safehouseId) {
      return { updated: player, success: false, message: 'คุณกบดานอยู่ที่นี่อยู่แล้ว' };
    }
    if (player.finance.cash < def.setupCost) {
      return {
        updated: player,
        success: false,
        message: `เงินสดไม่พอค่าจัดตั้งแหล่งกบดาน (${def.setupCost.toLocaleString()} บาท)`,
      };
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    next.finance.cash -= def.setupCost;
    next.career.safehouse_id = safehouseId;
    next.career.safehouse_security = 100;
    next.career.notoriety = Math.max(0, next.career.notoriety - 6);

    return {
      updated: next,
      success: true,
      message: `เปิดใช้งานแหล่งกบดาน "${def.name}" สำเร็จ! ลดความเสี่ยงถูกจับกุม -${def.arrestRiskReductionPct}% และพรางตัวเต็ม 100%`,
    };
  }

  /**
   * Relocate / fortify the current safehouse when police scouts start Compromising its coordinates.
   */
  static relocateSafehouse(
    player: PlayerData
  ): { updated: PlayerData; success: boolean; message: string } {
    const def = this.getSafehouseById(player.career.safehouse_id);
    if (!def) {
      return { updated: player, success: false, message: 'ยังไม่มีแหล่งกบดานที่เปิดใช้งานอยู่' };
    }
    const relocateCost = Math.round(def.setupCost * 0.35);
    if (player.finance.cash < relocateCost) {
      return {
        updated: player,
        success: false,
        message: `เงินสดไม่พอค่าย้ายจุดและตัดร่องรอย (${relocateCost.toLocaleString()} บาท)`,
      };
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    next.finance.cash -= relocateCost;
    next.career.safehouse_security = 100;
    next.career.notoriety = Math.max(0, next.career.notoriety - 12);

    return {
      updated: next,
      success: true,
      message: `ย้ายจุดเซฟเฮาส์และล้างร่องรอยสำเร็จ! ความลับพิกัดกลับมาเต็ม 100% และลดระดับหมายจับ -12`,
    };
  }

  /**
   * Abandon current safehouse to stop paying annual upkeep.
   */
  static abandonSafehouse(player: PlayerData): { updated: PlayerData; message: string } {
    const def = this.getSafehouseById(player.career.safehouse_id);
    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    next.career.safehouse_id = null;
    next.career.safehouse_security = 0;
    return {
      updated: next,
      message: `ยกเลิกแหล่งกบดาน "${def?.name || ''}" แล้ว (ประหยัดค่าดูแลรายปี แต่ไม่มีเกราะคุ้มกันหมายจับ)`,
    };
  }

  /**
   * Spend 25 Energy immediately to go dark inside the hideout ("เก็บตัวกบดานซ่อนตัวจากตำรวจ"),
   * significantly dropping Notoriety heat and boosting hideout security.
   */
  static layLowInHideout(
    player: PlayerData
  ): { updated: PlayerData; success: boolean; message: string } {
    if (player.career.prison_years_left > 0) {
      return { updated: player, success: false, message: 'อยู่ในเรือนจำแล้ว' };
    }
    const energyRequired = 25;
    if (player.stats.energy < energyRequired) {
      return {
        updated: player,
        success: false,
        message: `ต้องการพลังงาน ${energyRequired} แต้มในการเก็บตัวกบดาน`,
      };
    }

    const def = this.getSafehouseById(player.career.safehouse_id);
    const motelFee = def ? 0 : 8000;
    if (!def && player.finance.cash < motelFee) {
      return {
        updated: player,
        success: false,
        message: `ไม่มีแหล่งกบดานส่วนตัว ต้องใช้เงินสด ${motelFee.toLocaleString()} บาทเช่ารีสอร์ตหลบซ่อนชั่วคราว`,
      };
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    next.stats.energy = Math.max(0, next.stats.energy - energyRequired);
    if (motelFee > 0) {
      next.finance.cash -= motelFee;
    }

    const heatDrop = def ? 16 + Math.round(def.notorietyDecayYearly * 0.75) : 14;
    next.career.notoriety = Math.max(0, next.career.notoriety - heatDrop);
    if (def) {
      next.career.safehouse_security = clamp(next.career.safehouse_security + 20, 0, 100);
    }

    return {
      updated: next,
      success: true,
      message: def
        ? `ปิดเครื่องมือสื่อสารเก็บตัวเงียบใน "${def.name}" สำเร็จ! ระดับหมายจับลดฮวบ -${heatDrop} หน่วย (เหลือ ${next.career.notoriety}/100)`
        : `หลบไปเช่าที่พักต่างจังหวัดซ่อนตัวชั่วคราว (-${motelFee.toLocaleString()} บ.) ลดความฉาวโฉ่ลง -${heatDrop} หน่วย`,
    };
  }

  /**
   * Applies prison sentence, criminal record, safehouse seizure, job dismissal, school expulsion, and cash confiscation.
   */
  static incarceratePlayer(
    player: PlayerData,
    sentenceYears: number,
    confiscationRatio: number = 0.3
  ): void {
    const safehouse = this.getSafehouseById(player.career.safehouse_id);
    const protectionFactor = safehouse ? safehouse.seizureProtectionFactor : 1.0;
    const effectiveRatio = confiscationRatio * protectionFactor;

    player.flags.is_criminal_record = true;
    player.career.prison_years_left += sentenceYears;
    player.career.notoriety = Math.max(10, Math.round(player.career.notoriety * 0.45));

    // Police raid compromises and seizes the active hideout
    player.career.safehouse_id = null;
    player.career.safehouse_security = 0;

    const seized = Math.round(player.finance.cash * effectiveRatio);
    player.finance.cash = Math.max(0, player.finance.cash - seized);

    player.career.primary_job = null;
    player.career.side_job = null;
    player.career.job_level = 1;
    if (player.education.is_enrolled) {
      player.education.is_enrolled = false;
      player.education.active_program = null;
      player.education.years_in_program = 0;
    }

    player.stats.san = clamp(player.stats.san - 25, 0, 100);
    player.stats.soc = clamp(player.stats.soc - 20, 0, 100);
  }
}
