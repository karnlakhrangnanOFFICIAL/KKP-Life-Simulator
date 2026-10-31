import { AssetManager } from '../core/asset_manager';
import { EnergySystem } from '../core/energy_system';
import { StreetEncounterEngine } from '../core/street_encounter_engine';
import { UnderworldEngine } from '../core/underworld_engine';
import { EventChainQueue } from '../events/event_chain_queue';
import { ECONOMIC_CYCLES, MacroEconomyEngine } from '../events/macro_economy';
import { CareerEngine } from './CareerEngine';
import { EducationEngine, EDUCATION_TREE } from './EducationEngine';
import {
  BiologicalSex,
  BirthLocation,
  EducationLevel,
  FamilyWealth,
  LicenseId,
  PlayerData,
} from './types';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const THAI_MALE_NAMES = [
  'สมชาย ใจสู้',
  'ณัฐพงศ์ ศรีสวัสดิ์',
  'ธนกร เจริญผล',
  'กิตติพงศ์ วงศ์สุวรรณ',
  'ภูริพัฒน์ แสงทอง',
];

const THAI_FEMALE_NAMES = [
  'พิมพ์ชนก รุ่งเรือง',
  'กานดา วงศ์สุวรรณ',
  'ปวีณา แสงทอง',
  'ชนิกานต์ ศรีสวัสดิ์',
  'นภัสสร เจริญผล',
];

export interface EndingSummary {
  lifeScore: number;
  title: string;
  subtitle: string;
  breakdown: {
    cashPoints: number;
    assetPoints: number;
    intPoints: number;
    socPoints: number;
    athPoints: number;
    agePoints: number;
    debtPenalty: number;
  };
}

export class LifeSimulatorEngine {
  static getSampleRandomName(sex?: BiologicalSex): string {
    const targetSex = sex || (Math.random() < 0.5 ? 'MALE' : 'FEMALE');
    const list = targetSex === 'MALE' ? THAI_MALE_NAMES : THAI_FEMALE_NAMES;
    return list[randomInt(0, list.length - 1)];
  }

  static createRandomCharacter(customName?: string, explicitSex?: BiologicalSex): PlayerData {
    const sex: BiologicalSex = explicitSex || (Math.random() < 0.5 ? 'MALE' : 'FEMALE');

    const wealthRoll = Math.random();
    const family_wealth: FamilyWealth =
      wealthRoll < 0.45 ? 'POOR' : wealthRoll < 0.85 ? 'MIDDLE' : 'RICH';

    const locRoll = Math.random();
    const location: BirthLocation =
      locRoll < 0.35 ? 'BANGKOK' : locRoll < 0.78 ? 'PROVINCIAL' : 'REMOTE';

    const parent_support =
      family_wealth === 'RICH'
        ? randomInt(65, 95)
        : family_wealth === 'MIDDLE'
        ? randomInt(45, 85)
        : randomInt(25, 70);

    const startingCash =
      family_wealth === 'RICH' ? 50000 : family_wealth === 'MIDDLE' ? 8000 : 500;

    const baseInt =
      family_wealth === 'RICH'
        ? randomInt(42, 62)
        : family_wealth === 'MIDDLE'
        ? randomInt(35, 55)
        : randomInt(28, 50);

    const baseSoc = randomInt(35, 58);
    const baseAth = randomInt(32, 60);
    const luk = randomInt(1, 10);

    const name = customName?.trim() || this.getSampleRandomName(sex);
    const birth_year_be = 2545;

    const hp = randomInt(88, 100);
    const san = randomInt(85, 100);

    const player: PlayerData = {
      character_id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `char-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      name,
      sex,
      birth_year_be,
      age: 0,
      is_alive: true,
      cause_of_death: null,
      stats: {
        hp,
        san,
        int: baseInt,
        soc: baseSoc,
        ath: baseAth,
        luk,
        energy: 100,
        energy_max: 100,
      },
      max_stats_reached: {
        int: baseInt,
        soc: baseSoc,
        ath: baseAth,
        cash: startingCash,
      },
      finance: {
        cash: startingCash,
        debt: 0,
        student_loan_debt: 0,
        annual_income: 0,
        annual_expense: 0,
        credit_score: 'GOOD',
        credit_ban_years: 0,
      },
      background: {
        family_wealth,
        location,
        parent_support,
        generation: 1,
      },
      education: {
        current_level: 'NONE',
        completed_levels: [],
        active_program: null,
        years_in_program: 0,
        has_scholarship: false,
        uses_student_loan: false,
        rotc_level: 0,
        school_name: EDUCATION_TREE.NONE.sampleSchools[location],
        gpa: 0.0,
        is_enrolled: false,
      },
      career: {
        primary_job: null,
        suspended_primary_job: null,
        conscription_years_left: 0,
        prison_years_left: 0,
        notoriety: 0,
        safehouse_id: null,
        safehouse_security: 0,
        championship_medals: 0,
        side_job: null,
        job_level: 1,
        years_experience: 0,
        licenses: [],
      },
      assets: [],
      event_queue: [],
      macro_economy: {
        current_state: 'NORMAL',
        years_remaining: randomInt(8, 12),
      },
      flags: {
        has_chronic_disease: false,
        is_married: false,
        has_children: false,
        is_criminal_record: false,
        is_burnout: false,
        conscription_completed: false,
      },
      lineage: [],
      street_world: StreetEncounterEngine.createInitialStreetWorld(location),
      history: [
        {
          age: 0,
          year_be: birth_year_be,
          headline: `ลืมตาดูโลก (รุ่นที่ 1 · เพศ${sex === 'MALE' ? 'ชาย' : 'หญิง'}) ในครอบครัว${this.getWealthLabel(family_wealth)} พื้นที่${this.getLocationLabel(location)}`,
          details: [
            `เงินขวัญถุงตั้งต้น ${startingCash.toLocaleString()} บาท`,
            `ค่าพรสวรรค์เริ่มต้น: INT ${baseInt} · SOC ${baseSoc} · กีฬา ATH ${baseAth} · ดวง LUK ${luk}/10`,
          ],
          net_finance_delta: startingCash,
          hp_after: hp,
          san_after: san,
          int_after: baseInt,
          soc_after: baseSoc,
          ath_after: baseAth,
          cash_after: startingCash,
          debt_after: 0,
          economic_state: 'NORMAL',
        },
      ],
    };

    return player;
  }

  static getWealthLabel(wealth: FamilyWealth): string {
    switch (wealth) {
      case 'POOR_DEBTOR':
        return 'ลูกหนี้สืบทอดมรดกหนี้';
      case 'POOR':
        return 'ยากจน / หาเช้ากินค่ำ';
      case 'MIDDLE':
        return 'ชนชั้นกลาง';
      case 'RICH':
        return 'มีอันจะกิน / มั่งคั่ง';
      case 'WEALTHY_ELITE':
        return 'ตระกูลเศรษฐีระดับสูง (Wealthy Elite)';
    }
  }

  static getLocationLabel(loc: BirthLocation): string {
    switch (loc) {
      case 'BANGKOK':
        return 'กรุงเทพมหานคร';
      case 'PROVINCIAL':
        return 'เขตเมืองต่างจังหวัด';
      case 'REMOTE':
        return 'ชนบทห่างไกล';
    }
  }

  static calculateBaseAgeHpDecay(age: number): number {
    if (age < 15) return 0;
    if (age < 40) return randomInt(1, 3);
    if (age < 60) return randomInt(3, 7);
    return Math.round(8 + (age - 60) * 0.5);
  }

  static calculateBaseLivingExpense(player: PlayerData): number {
    if (player.age < 15) return 0;
    if (player.career.prison_years_left > 0) {
      // อยู่ในเรือนจำ รัฐเลี้ยงข้าว แต่ครอบครัวข้างนอกยังมีค่าใช้จ่ายหากแต่งงานมีลูก
      return (player.flags.is_married ? 18000 : 0) + (player.flags.has_children ? 30000 : 0);
    }
    if (player.career.conscription_years_left > 0) {
      return 18000;
    }

    const hasOwnedHousing = player.assets.some((a) => a.type === 'HOUSING');

    const locationAnnualCost: Record<BirthLocation, number> = {
      BANGKOK: hasOwnedHousing ? 60000 : 96000,
      PROVINCIAL: hasOwnedHousing ? 44000 : 66000,
      REMOTE: hasOwnedHousing ? 34000 : 48000,
    };

    let base = locationAnnualCost[player.background.location];

    if (player.age < 19 && player.education.is_enrolled) {
      const supportRatio = player.background.parent_support / 120;
      base = Math.round(base * (1 - clamp(supportRatio, 0.2, 0.85)));
    }

    if (player.flags.is_married) base += 24000;
    if (player.flags.has_children) base += 42000;
    if (player.flags.has_chronic_disease) {
      const isGov =
        player.career.primary_job === 'MILITARY_NCO' ||
        player.career.primary_job === 'MILITARY_OFFICER' ||
        player.career.primary_job === 'CIVIL_SERVANT_OFFICER';
      base += isGov ? 2000 : 15000;
    }

    return base;
  }

  static calculateThaiIncomeTax(annualGrossIncome: number, isIllegalIncome: boolean = false): number {
    if (isIllegalIncome) return 0; // รายได้สายมืดไม่ยื่นภาษีปกติ แต่แลกกับความเสี่ยงโดนยึดทรัพย์
    const netTaxable = Math.max(0, annualGrossIncome - 160000);
    if (netTaxable <= 150000) return 0;
    if (netTaxable <= 300000) return Math.round((netTaxable - 150000) * 0.05);
    if (netTaxable <= 500000) return Math.round(7500 + (netTaxable - 300000) * 0.1);
    return Math.round(27500 + (netTaxable - 500000) * 0.15);
  }

  static enrollEducation(
    player: PlayerData,
    targetLevel: EducationLevel,
    useStudentLoan: boolean = false
  ): { updated: PlayerData; message: string } {
    if (player.career.prison_years_left > 0) {
      return { updated: player, message: 'อยู่ระหว่างต้องโทษจำคุกในเรือนจำ' };
    }
    const check = EducationEngine.checkEligibility(player, targetLevel);
    if (!check.eligible) {
      return { updated: player, message: check.reason || 'คุณสมบัติไม่ผ่านเกณฑ์' };
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    const node = EDUCATION_TREE[targetLevel];
    const hasScholarship = targetLevel === 'BACHELOR_REGULAR' && next.stats.int >= 78;

    next.education.is_enrolled = true;
    next.education.active_program = targetLevel;
    next.education.years_in_program = 0;
    next.education.has_scholarship = hasScholarship;
    next.education.uses_student_loan =
      !hasScholarship && useStudentLoan && Boolean(node.supportsStudentLoan);
    next.education.school_name = node.sampleSchools[next.background.location];

    const schText = hasScholarship
      ? ' (ได้รับทุนเรียนดี ยกเว้นค่าเทอม 100%!)'
      : next.education.uses_student_loan
      ? ' (ใช้สิทธิกู้ยืม กยศ. ผ่อนชำระหลังเรียนจบ ดอกเบี้ย 1%/ปี)'
      : '';

    return {
      updated: next,
      message: `ลงทะเบียนเรียน ${node.title} ณ ${next.education.school_name} สำเร็จ${schText}`,
    };
  }

  static applyForJob(
    player: PlayerData,
    jobId: string,
    asSideJob: boolean
  ): { updated: PlayerData; message: string } {
    if (player.career.prison_years_left > 0) {
      return { updated: player, message: 'กำลังต้องโทษจำคุก ไม่สามารถสมัครงานภายนอกได้' };
    }
    if (player.career.conscription_years_left > 0) {
      return { updated: player, message: 'อยู่ระหว่างประจำการทหารเกณฑ์ ไม่สามารถสมัครงานภายนอกได้' };
    }

    const job = CareerEngine.getJobById(jobId);
    if (!job) return { updated: player, message: 'ไม่พบข้อมูลอาชีพ' };

    const hasBusinessBoost = player.assets.some(
      (a) => AssetManager.getDefinition(a.asset_id)?.buffs.business_loan_boost
    );
    const effectiveJob =
      hasBusinessBoost && job.req_capital && !job.is_illegal
        ? { ...job, req_capital: Math.round(job.req_capital * 0.75) }
        : job;

    const check = CareerEngine.checkJobRequirements(player, effectiveJob, asSideJob);
    if (!check.eligible) {
      return { updated: player, message: check.reasons.join(' · ') };
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;

    if (effectiveJob.req_capital && effectiveJob.req_capital > 0) {
      next.finance.cash -= effectiveJob.req_capital;
    }

    if (asSideJob) {
      next.career.side_job = job.job_id;
      return { updated: next, message: `เริ่มทำอาชีพเสริม: ${job.title}` };
    } else {
      next.career.primary_job = job.job_id;
      next.career.job_level = 1;
      next.career.years_experience = 0;
      return {
        updated: next,
        message: `เริ่มทำงานหลัก: ${job.title}${
          effectiveJob.req_capital
            ? ` (ลงทุนตั้งต้น ${effectiveJob.req_capital.toLocaleString()} บาท)`
            : ''
        }`,
      };
    }
  }

  static quitJob(player: PlayerData, isSideJob: boolean): { updated: PlayerData; message: string } {
    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    if (isSideJob) {
      const old = CareerEngine.getJobById(next.career.side_job);
      next.career.side_job = null;
      return { updated: next, message: `เลิกทำอาชีพเสริม (${old?.title || ''}) แล้ว` };
    }
    const old = CareerEngine.getJobById(next.career.primary_job);
    next.career.primary_job = null;
    next.career.job_level = 1;
    return { updated: next, message: `ลาออกจากงานหลัก (${old?.title || ''}) แล้ว` };
  }

  static takeLicenseCourse(
    player: PlayerData,
    licenseId: LicenseId
  ): { updated: PlayerData; passed: boolean; message: string } {
    if (player.career.prison_years_left > 0) {
      return { updated: player, passed: false, message: 'อยู่ในเรือนจำไม่สามารถสอบใบอนุญาตภายนอกได้' };
    }
    const course = CareerEngine.getLicenseById(licenseId);
    if (!course) return { updated: player, passed: false, message: 'ไม่พบหลักสูตร' };

    if (player.career.licenses.includes(licenseId)) {
      return { updated: player, passed: false, message: 'คุณมีใบอนุญาตนี้แล้ว' };
    }
    if (player.age < course.minAge) {
      return { updated: player, passed: false, message: `ต้องมีอายุอย่างน้อย ${course.minAge} ปี` };
    }
    if (
      (licenseId === 'CIVIL_EXAM_PASS' || licenseId === 'TEACHER_LICENSE') &&
      player.flags.is_criminal_record
    ) {
      return { updated: player, passed: false, message: 'ผู้มีประวัติคดีอาญาขาดคุณสมบัติสอบบรรจุราชการ' };
    }
    if (
      course.reqEducation.length > 0 &&
      !EducationEngine.hasCompletedOrHigher(player, course.reqEducation)
    ) {
      return { updated: player, passed: false, message: 'วุฒิการศึกษายังไม่ถึงเกณฑ์สมัครสอบ' };
    }
    if (course.minInt && player.stats.int < course.minInt) {
      return { updated: player, passed: false, message: `ต้องการ INT >= ${course.minInt}` };
    }
    if (course.minAth && player.stats.ath < course.minAth) {
      return { updated: player, passed: false, message: `ต้องการทักษะกีฬา ATH >= ${course.minAth}` };
    }
    if (player.stats.energy < course.energyCost) {
      return {
        updated: player,
        passed: false,
        message: `พลังงานคงเหลือในปีนี้ไม่พอสอบ (ต้องการ ${course.energyCost} Energy · เหลือ ${player.stats.energy})`,
      };
    }
    if (player.finance.cash < course.cost) {
      return {
        updated: player,
        passed: false,
        message: `เงินสดไม่พอค่าสมัคร (${course.cost.toLocaleString()} บาท)`,
      };
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    next.finance.cash -= course.cost;
    next.stats.energy = Math.max(0, next.stats.energy - course.energyCost);

    const intBonus = (next.stats.int - 50) * 0.004;
    const lukBonus = (next.stats.luk - 5) * 0.015;
    const chance = clamp(course.passRateBase + intBonus + lukBonus, 0.25, 0.98);
    const passed = Math.random() <= chance;

    if (passed) {
      next.career.licenses.push(licenseId);
      next.stats.san = clamp(next.stats.san + 6, 0, 100);
      return {
        updated: next,
        passed: true,
        message: `สอบผ่าน! ได้รับ "${course.title}" เรียบร้อยแล้ว`,
      };
    }

    next.stats.san = clamp(next.stats.san - 4, 0, 100);
    return {
      updated: next,
      passed: false,
      message: `ยังไม่ผ่านเกณฑ์การสอบ "${course.title}" ในรอบนี้ ลองเตรียมตัวสอบใหม่ปีหน้า`,
    };
  }

  static advanceYearWithAllocations(
    currentPlayer: PlayerData,
    allocations: Record<string, number>,
    eventLogText?: string
  ): PlayerData {
    const next = JSON.parse(JSON.stringify(currentPlayer)) as PlayerData;
    const details: string[] = [];

    if (eventLogText) {
      details.push(`เหตุการณ์ประจำปี: ${eventLogText}`);
    }

    if (next.pending_year_logs && next.pending_year_logs.length > 0) {
      for (const pLog of next.pending_year_logs) {
        details.push(pLog);
      }
      next.pending_year_logs = [];
    }

    const allocSummary = EnergySystem.calculateAllocationSummary(next, allocations);
    const activities = EnergySystem.getYearlyActivities(next);

    const wasBurnoutThisYear = next.flags.is_burnout;
    next.flags.is_burnout = false;
    next.stats.energy_max = 100;

    next.age += 1;
    const currentYearBE = next.birth_year_be + next.age;

    const macroShiftMsg = MacroEconomyEngine.tickMacroEconomy(next);
    if (macroShiftMsg) {
      details.push(macroShiftMsg);
    }

    // Natural athletic age decline after 33 if not training
    if (next.age >= 33) {
      const athDecay = next.age >= 45 ? 4 : 2;
      next.stats.ath = clamp(next.stats.ath - athDecay, 10, 100);
    }

    // Delayed Chain Event Queue Resolution
    const chainLogs = EventChainQueue.processYearlyEventQueue(next);
    for (const msg of chainLogs) {
      details.push(msg);
    }

    // Ambient City Commute & Local Relationships Yearly Tick
    const streetLogs = StreetEncounterEngine.processYearlyNeighborhoodTick(next);
    for (const sMsg of streetLogs) {
      details.push(sMsg);
    }

    // Auto-enroll Compulsory Thai Education if not imprisoned
    if (
      next.career.prison_years_left === 0 &&
      next.age === 7 &&
      !next.education.completed_levels.includes('PRIMARY') &&
      !next.education.is_enrolled
    ) {
      next.education.is_enrolled = true;
      next.education.active_program = 'PRIMARY';
      next.education.years_in_program = 0;
      next.education.school_name = EDUCATION_TREE.PRIMARY.sampleSchools[next.background.location];
      details.push(`เข้าเกณฑ์การศึกษาภาคบังคับ เริ่มเรียนชั้น ป.1 (${next.education.school_name})`);
    } else if (
      next.career.prison_years_left === 0 &&
      next.age === 13 &&
      next.education.completed_levels.includes('PRIMARY') &&
      !next.education.completed_levels.includes('LOWER_SEC') &&
      !next.education.is_enrolled
    ) {
      next.education.is_enrolled = true;
      next.education.active_program = 'LOWER_SEC';
      next.education.years_in_program = 0;
      next.education.school_name = EDUCATION_TREE.LOWER_SEC.sampleSchools[next.background.location];
      details.push(`เลื่อนชั้นเข้าสู่ระดับมัธยมศึกษาตอนต้น ม.1 (${next.education.school_name})`);
    }

    // Evaluate Optional Energy Allocations
    let actionIncomeBonus = 0;
    let actionExpense = 0;
    let studyFocusGpaBonus = 0;
    let workPromotionBoost = false;
    let exercisedSideJobThisYear = false;

    for (const unit of activities) {
      if (unit.mandatory) continue;
      const count = allocations[unit.id] || 0;
      if (count <= 0) continue;

      actionExpense += unit.cashCost * count;

      switch (unit.id) {
        case 'PRISON_VOCATIONAL_STUDY':
          next.stats.int = clamp(next.stats.int + 7 * count, 0, 100);
          next.stats.san = clamp(next.stats.san + 4 * count, 0, 100);
          if (next.career.prison_years_left > 1 && Math.random() < 0.25 * count) {
            next.career.prison_years_left -= 1;
            details.push('ตั้งใจเรียนในเรือนจำจนได้เลื่อนชั้นนักโทษดีเยี่ยม ลดวันต้องโทษลง 1 ปี!');
          } else {
            details.push(`ค้นคว้าตำราและฝึกอาชีพในเรือนจำ (+${7 * count} INT)`);
          }
          break;
        case 'PRISON_YARD_WORKOUT':
          next.stats.ath = clamp(next.stats.ath + 8 * count, 0, 100);
          next.stats.hp = clamp(next.stats.hp + 6 * count, 0, 100);
          details.push(`ฟิตร่างกายในลานแดนขัง (+${8 * count} ATH, +${6 * count} HP)`);
          break;
        case 'CHILD_GROWTH_PLAY':
          next.stats.hp = clamp(next.stats.hp + 4 * count, 0, 100);
          next.stats.ath = clamp(next.stats.ath + 5 * count, 0, 100);
          next.stats.san = clamp(next.stats.san + 4 * count, 0, 100);
          details.push(`วิ่งเล่นซุกซนเสริมทักษะร่างกาย (+${5 * count} ATH, +${4 * count} HP)`);
          break;
        case 'CHILD_EARLY_READING':
          next.stats.int = clamp(next.stats.int + 5 * count, 0, 100);
          next.stats.san = clamp(next.stats.san + 1 * count, 0, 100);
          details.push(`ฝึกอ่านนิทานและทักษะสมอง (+${5 * count} INT)`);
          break;
        case 'CHILD_NEIGHBOR_FRIENDS':
          next.stats.soc = clamp(next.stats.soc + 5 * count, 0, 100);
          next.stats.san = clamp(next.stats.san + 3 * count, 0, 100);
          details.push(`ผูกมิตรเพื่อนบ้าน (+${5 * count} SOC)`);
          break;
        case 'OPT_SPORTS_ACADEMY_DRILL':
          next.stats.ath = clamp(next.stats.ath + 9 * count, 0, 100);
          next.stats.hp = clamp(next.stats.hp + 5 * count, 0, 100);
          details.push(
            `เก็บตัวซ้อมกีฬาเข้มข้น (${count} หน่วย) ทักษะพุ่งทะยาน +${9 * count} ATH, +${5 * count} HP`
          );
          break;
        case 'OPT_SIDE_JOB_SHIFT':
          exercisedSideJobThisYear = true;
          break;
        case 'OPT_OVERTIME_PUSH': {
          const otEarn = randomInt(18000, 35000) * count;
          actionIncomeBonus += otEarn;
          next.stats.san = clamp(next.stats.san - 4 * count, 0, 100);
          workPromotionBoost = true;
          details.push(`ทุ่มเททำผลงาน/ซ้อมชิงแชมป์พิเศษ (+${otEarn.toLocaleString()} บาท)`);
          break;
        }
        case 'OPT_FREELANCE_GIGS': {
          const gigEarn = 22000 * count;
          actionIncomeBonus += gigEarn;
          next.stats.hp = clamp(next.stats.hp - 4 * count, 0, 100);
          details.push(`รับจ้างพาร์ทไทม์รายวัน (+${gigEarn.toLocaleString()} บาท)`);
          break;
        }
        case 'OPT_STUDY_SELF_DEV':
          next.stats.int = clamp(next.stats.int + 6 * count, 0, 100);
          studyFocusGpaBonus += 0.25 * count;
          details.push(`พัฒนาตนเองและทบทวนตำรา (+${6 * count} INT)`);
          break;
        case 'OPT_ROTC_TRAINING':
          next.education.rotc_level = Math.min(3, next.education.rotc_level + 1);
          next.stats.hp = clamp(next.stats.hp + 3, 0, 100);
          next.stats.ath = clamp(next.stats.ath + 3, 0, 100);
          if (next.education.rotc_level === 3) {
            next.flags.conscription_completed = true;
            details.push(
              'สำเร็จการฝึกนักศึกษาวิชาทหาร (รด. ชั้นปีที่ 3) ยกเว้นการจับใบดำ-ใบแดงตอนอายุ 21 ปี!'
            );
          } else {
            details.push(`ผ่านการฝึกวิชาทหาร รด. ชั้นปีที่ ${next.education.rotc_level}/3`);
          }
          break;
        case 'OPT_EXERCISE_REST':
          next.stats.hp = clamp(next.stats.hp + 9 * count, 0, 100);
          next.stats.san = clamp(next.stats.san + 8 * count, 0, 100);
          if (next.career.notoriety > 0) {
            next.career.notoriety = Math.max(0, next.career.notoriety - 3 * count);
          }
          details.push(`พักผ่อนและกายภาพบำบัด (+${9 * count} HP, +${8 * count} SAN)`);
          break;
        case 'OPT_SOCIAL_CONNECT':
          next.stats.soc = clamp(next.stats.soc + 7 * count, 0, 100);
          next.stats.san = clamp(next.stats.san + 6 * count, 0, 100);
          details.push(`เข้าสังคมขยายคอนเนกชัน (+${7 * count} SOC, +${6 * count} SAN)`);
          break;
        case 'OPT_DEBT_PAYDOWN': {
          const maxBudget = Math.min(next.finance.cash, 50000 * count);
          if (maxBudget > 0) {
            const payHighDebt = Math.min(next.finance.debt, maxBudget);
            next.finance.cash -= payHighDebt;
            next.finance.debt -= payHighDebt;
            const remBudget = maxBudget - payHighDebt;
            if (remBudget > 0 && next.finance.student_loan_debt > 0) {
              const paySl = Math.min(next.finance.student_loan_debt, remBudget);
              next.finance.cash -= paySl;
              next.finance.student_loan_debt -= paySl;
            }
            next.stats.san = clamp(next.stats.san + 5 * count, 0, 100);
            details.push(`นำเงินสดตัดต้นหนี้สินได้รวม ${maxBudget.toLocaleString()} บาท`);
          }
          break;
        }
      }
    }

    // Overwork & Burnout Penalty Evaluation
    if (allocSummary.excessEnergy > 0) {
      next.stats.hp = clamp(next.stats.hp - allocSummary.hpPenalty, 0, 100);
      details.push(
        `ฝืนใช้พลังงานเกินขีดจำกัด (+${allocSummary.excessEnergy} Excess Energy) ร่างกายสึกหรอ -${allocSummary.hpPenalty} HP`
      );

      if (allocSummary.triggersDangerZone && Math.random() * 100 < allocSummary.burnoutRiskPct) {
        if (Math.random() < 0.45 && next.career.prison_years_left === 0) {
          const erFee = 18000;
          next.finance.cash -= erFee;
          if (next.finance.cash < 0) {
            next.finance.debt += Math.abs(next.finance.cash);
            next.finance.cash = 0;
          }
          next.stats.hp = clamp(next.stats.hp - 25, 0, 100);
          details.push(
            `[HOSPITALIZED!] โหมหนักเกินขีดอันตราย วูบส่งห้องฉุกเฉิน หักค่ารักษา ${erFee.toLocaleString()} บาท และ -25 HP!`
          );
        } else {
          next.flags.is_burnout = true;
          next.stats.energy_max = 70;
          next.stats.san = clamp(next.stats.san - 15, 0, 100);
          details.push(
            `[ติดสถานะ BURNOUT!] ภาวะไฟมอดทำให้ปีถัดไปเพดานพลังงานลดเหลือ 70/100 (-15 SAN)`
          );
        }
      }
    }

    // Education Progress
    let tuitionCost = 0;
    if (
      next.career.prison_years_left === 0 &&
      next.education.is_enrolled &&
      next.education.active_program
    ) {
      const prog = next.education.active_program;
      const node = EDUCATION_TREE[prog];

      if (
        next.education.uses_student_loan &&
        node.supportsStudentLoan &&
        !next.education.has_scholarship
      ) {
        next.finance.student_loan_debt += node.annualTuition;
        details.push(
          `กู้ยืมค่าเทอม กยศ. ประจำปี +${node.annualTuition.toLocaleString()} บาท`
        );
      } else {
        tuitionCost = EducationEngine.calculateAnnualTuition(next, prog);
      }

      const yearlyInt = Math.max(
        2,
        Math.round(node.intGainYearly / Math.max(1, node.durationYears > 3 ? 2.2 : 1.8))
      );
      const yearlySoc = Math.max(1, Math.round(node.socGainYearly / 2));

      next.stats.int = clamp(next.stats.int + yearlyInt, 0, 100);
      next.stats.soc = clamp(next.stats.soc + yearlySoc, 0, 100);
      next.stats.san = clamp(next.stats.san + node.sanDeltaYearly, 0, 100);
      next.education.years_in_program += 1;
      next.education.gpa = EducationEngine.computeGPA(next.stats.int, studyFocusGpaBonus);

      if (next.education.years_in_program >= node.durationYears) {
        next.education.current_level = prog;
        if (!next.education.completed_levels.includes(prog)) {
          next.education.completed_levels.push(prog);
        }
        next.education.is_enrolled = false;
        next.education.active_program = null;
        next.education.years_in_program = 0;
        next.education.has_scholarship = false;
        next.education.uses_student_loan = false;
        next.stats.san = clamp(next.stats.san + 10, 0, 100);
        details.push(
          `สำเร็จการศึกษา "${node.title}" ด้วยเกรดเฉลี่ยสะสม ${next.education.gpa.toFixed(2)}!`
        );
      } else {
        details.push(
          `กำลังศึกษา ${node.shortTitle} ชั้นปีที่ ${next.education.years_in_program}/${node.durationYears} (GPA ${next.education.gpa.toFixed(2)})`
        );
      }
    }

    // Prison Sentence OR Conscription OR Career & Safehouse Execution
    let jobGrossIncome = 0;
    let jobHpDrain = 0;
    let jobSanDrain = 0;
    let safehouseUpkeepExpense = 0;
    let hasIllegalJobIncome = false;
    const econState = next.macro_economy.current_state;
    const econCfg = ECONOMIC_CYCLES[econState];

    // Safehouse passive cooling & upkeep registration (before arrest rolls so active hideout protects player)
    const activeSafehouse =
      next.career.prison_years_left === 0
        ? UnderworldEngine.getSafehouseById(next.career.safehouse_id)
        : null;
    if (activeSafehouse) {
      safehouseUpkeepExpense = activeSafehouse.annualUpkeep;
      if (next.career.notoriety > 0) {
        next.career.notoriety = Math.max(
          0,
          next.career.notoriety - activeSafehouse.notorietyDecayYearly
        );
      }
      if (activeSafehouse.sanBonusYearly > 0) {
        next.stats.san = clamp(next.stats.san + activeSafehouse.sanBonusYearly, 0, 100);
      }
      details.push(
        `กบดานและดูแลเซฟเฮาส์ "${activeSafehouse.name}" (-${activeSafehouse.annualUpkeep.toLocaleString()} บ./ปี · ลดความร้อนแรงหมายจับ -${activeSafehouse.notorietyDecayYearly})`
      );
    }

    if (next.career.prison_years_left > 0) {
      // Serving prison sentence
      jobSanDrain += 10;
      next.career.prison_years_left -= 1;
      if (next.career.prison_years_left === 0) {
        next.stats.san = clamp(next.stats.san + 12, 0, 100);
        details.push(
          'พ้นโทษได้รับการปล่อยตัวออกจากเรือนจำ! เริ่มต้นชีวิตใหม่ภายใต้อิสรภาพอีกครั้ง (มีประวัติคดีติดตัว แต่ยังทำธุรกิจ ค้าขาย ช่าง นักกีฬา หรือกลับเข้าสายมืดได้)'
        );
      } else {
        details.push(
          `ใช้ชีวิตหลังกำแพงเรือนจำ (เหลือโทษจำคุกอีก ${next.career.prison_years_left} ปี)`
        );
      }
    } else if (next.career.conscription_years_left > 0) {
      jobGrossIncome += 120000;
      next.stats.hp = clamp(next.stats.hp + 10, 0, 100);
      next.stats.ath = clamp(next.stats.ath + 5, 0, 100);
      jobSanDrain += 8;
      next.career.conscription_years_left -= 1;

      if (next.career.conscription_years_left === 0) {
        details.push('ปลดประจำการทหารกองประจำการ! ได้รับสมุดประจำตัวทหารกองหนุน');
        if (next.career.suspended_primary_job) {
          next.career.primary_job = next.career.suspended_primary_job;
          next.career.suspended_primary_job = null;
          const resumedJob = CareerEngine.getJobById(next.career.primary_job);
          details.push(`กลับเข้าทำงานประจำเดิมในตำแหน่ง "${resumedJob?.title || ''}"`);
        }
      } else {
        details.push('ฝึกวินัยในค่ายทหารกองประจำการ (รับเงินเดือน 10,000 บ./เดือน)');
      }
    } else {
      const arrestEval = UnderworldEngine.calculateAnnualArrestRisk(next);
      const primaryJob = CareerEngine.getJobById(next.career.primary_job);

      if (primaryJob) {
        // Check Athlete Max Age Mandatory Retirement ("แขวนนวม / แขวนสตั๊ด")
        if (primaryJob.max_age && next.age > primaryJob.max_age) {
          const farewellBonus = primaryJob.base_salary_monthly * 4;
          actionIncomeBonus += farewellBonus;
          next.career.primary_job = null;
          next.career.job_level = 1;
          details.push(
            `[ถึงวัยแขวนสนาม!] อายุครบเกณฑ์รีไทร์ของ "${primaryJob.title}" อำลาสังเวียนพร้อมเงินขวัญถุงแมตช์อำลา ${farewellBonus.toLocaleString()} บาท (สามารถสอบใบโค้ชกีฬาเพื่อคุมทีมต่อได้!)`
          );
        } else if (
          // Check Police Raid Bust for Illegal Underworld Primary Jobs (factored with Safehouse Shield!)
          primaryJob.is_illegal &&
          Math.random() * 100 < arrestEval.totalRiskPct
        ) {
          const sentence = primaryJob.prison_sentence_years || 3;
          const hadProtectedVault = next.career.safehouse_id === 'BORDER_COMPOUND';
          UnderworldEngine.incarceratePlayer(next, sentence, 0.45);
          details.push(
            `[ตำรวจบุกทลายเครือข่าย!] คุณถูกจับกุมขณะทำอาชีพ "${primaryJob.title}" (โอกาสพลาด ${arrestEval.totalRiskPct}%) ศาลพิพากษาจำคุก ${sentence} ปี${
              hadProtectedVault
                ? ' (ระบบผ่องถ่ายทรัพย์สินคฤหาสน์ชายแดนช่วยรักษาเงินสดไว้ได้ครึ่งหนึ่ง!)'
                : ' และยึดทรัพย์ของกลาง!'
            }`
          );
        } else if (
          primaryJob.category !== 'GOVERNMENT' &&
          !primaryJob.is_illegal &&
          econCfg.jobSecurityModifier < 0 &&
          Math.random() < Math.abs(econCfg.jobSecurityModifier) * 0.65
        ) {
          const severance = primaryJob.base_salary_monthly * 3;
          actionIncomeBonus += severance;
          next.career.primary_job = null;
          next.career.job_level = 1;
          next.stats.san = clamp(next.stats.san - 18, 0, 100);
          details.push(
            `[ผลกระทบ${econCfg.label}] กิจการลดขนาดเลิกจ้างพนักงาน! ได้รับเงินชดเชย ${severance.toLocaleString()} บาท (-18 SAN)`
          );
        } else {
          if (primaryJob.category === 'GOVERNMENT' && next.age === 60) {
            const pensionLumpSum = next.career.years_experience * 22000;
            actionIncomeBonus += pensionLumpSum;
            details.push(
              `เกษียณอายุราชการในตำแหน่ง "${primaryJob.title}" รับบำเหน็จก้อนใหญ่ ${pensionLumpSum.toLocaleString()} บาท!`
            );
          }

          if (primaryJob.category === 'GOVERNMENT' && next.age > 60) {
            const annualPension = Math.round(primaryJob.base_salary_monthly * 12 * 0.6);
            jobGrossIncome += annualPension;
            details.push(`รับเงินบำนาญข้าราชการหลังเกษียณ ${annualPension.toLocaleString()} บาท/ปี`);
          } else {
            const rawMonthly = CareerEngine.calculateMonthlyJobIncome(next, primaryJob, false);
            const econMult = MacroEconomyEngine.getIncomeMultiplier(econState, primaryJob.category);
            const adjustedMonthly = Math.round(rawMonthly * econMult);

            jobGrossIncome += adjustedMonthly * 12;
            jobHpDrain += primaryJob.hp_drain_yearly;
            jobSanDrain += primaryJob.san_drain_yearly;
            next.career.years_experience += 1;

            if (primaryJob.is_illegal) {
              hasIllegalJobIncome = true;
              const heatAdded =
                primaryJob.job_id === 'MAFIA_KINGPIN'
                  ? 14
                  : primaryJob.job_id === 'SYNDICATE_BOSS'
                  ? 12
                  : 9;
              next.career.notoriety = clamp(next.career.notoriety + heatAdded, 0, 100);
              if (next.career.safehouse_id) {
                const secWear = 8 + Math.round(next.career.notoriety * 0.12);
                next.career.safehouse_security = clamp(
                  next.career.safehouse_security - secWear,
                  0,
                  100
                );
                if (next.career.safehouse_security < 35) {
                  details.push(
                    `[เตือนภัยแหล่งกบดาน!] สายสืบเริ่มระแคะระคายพิกัดเซฟเฮาส์ (ความลับเหลือ ${next.career.safehouse_security}%) ควรย้ายจุดกบดานด่วน!`
                  );
                }
              }
            }

            // Athlete Championship Tournament Roll
            if (primaryJob.category === 'SPORTS' && primaryJob.job_id !== 'HEAD_SPORTS_COACH') {
              const medalChance = (next.stats.ath - 40) * 0.6 + (workPromotionBoost ? 20 : 0);
              if (Math.random() * 100 < medalChance) {
                const prizePool =
                  primaryJob.job_id === 'NATIONAL_STAR_ATHLETE' ? 250000 : 45000;
                actionIncomeBonus += prizePool;
                next.career.championship_medals += 1;
                next.stats.soc = clamp(next.stats.soc + 6, 0, 100);
                details.push(
                  `[คว้าแชมป์ทัวร์นาเมนต์!] ฟอร์มร้อนแรงคว้าเหรียญแชมป์สมัยที่ ${next.career.championship_medals} รับเงินรางวัลอัดฉีด +${prizePool.toLocaleString()} บาท!`
                );
              }
            }

            const promoChance = workPromotionBoost ? 0.48 : 0.28;
            if (next.career.years_experience % 3 === 0 && Math.random() < promoChance) {
              if (primaryJob.promotion_job_id) {
                const promoJob = CareerEngine.getJobById(primaryJob.promotion_job_id);
                if (promoJob) {
                  const checkPromo = CareerEngine.checkJobRequirements(next, promoJob, false);
                  if (checkPromo.eligible) {
                    if (promoJob.req_capital && promoJob.req_capital > 0) {
                      next.finance.cash = Math.max(0, next.finance.cash - promoJob.req_capital);
                    }
                    next.career.primary_job = promoJob.job_id;
                    next.career.job_level = 1;
                    next.stats.san = clamp(next.stats.san + 10, 0, 100);
                    details.push(`ก้าวหน้าในสายอาชีพ! ไต่เต้าขึ้นเป็น "${promoJob.title}"!`);
                  } else {
                    next.career.job_level = Math.min(6, next.career.job_level + 1);
                    details.push(`ปรับฐานรายได้งานหลักเป็นระดับขั้นที่ ${next.career.job_level}`);
                  }
                }
              } else if (next.career.job_level < 6) {
                next.career.job_level += 1;
                details.push(`ผลงานโดดเด่น ปรับระดับรายได้งานหลักเป็นขั้นที่ ${next.career.job_level}`);
              }
            }
          }
        }
      } else if (arrestEval.manhuntRiskPct > 0) {
        // Active Police Manhunt even when unemployed if Notoriety >= 40!
        if (Math.random() * 100 < arrestEval.totalRiskPct) {
          const sentence = arrestEval.expectedSentenceYears;
          UnderworldEngine.incarceratePlayer(next, sentence, 0.35);
          details.push(
            `[ชุดสืบสวนตามรวบตัวจากหมายจับค้างเก่า!] แม้ไม่ได้ทำงานสายมืดในปีนี้ แต่ระดับความฉาวโฉ่สูงทำให้ถูกแกะรอยจับกุม จำคุก ${sentence} ปี!`
          );
        } else if (next.career.safehouse_id) {
          next.career.safehouse_security = clamp(next.career.safehouse_security - 8, 0, 100);
        }
      }

      // Side Job Execution (including Illegal Side Job Bust Risk mitigated by Safehouse!)
      const sideJob = CareerEngine.getJobById(next.career.side_job);
      if (sideJob && exercisedSideJobThisYear && next.career.prison_years_left === 0) {
        const { shieldPct } = UnderworldEngine.getEffectiveSafehouseShield(next);
        const sideArrestChance = sideJob.arrest_risk_base_pct
          ? clamp(
              Math.round(
                sideJob.arrest_risk_base_pct * 0.75 +
                  next.career.notoriety * 0.15 -
                  shieldPct * 0.5
              ),
              3,
              75
            )
          : 0;
        if (sideJob.is_illegal && Math.random() * 100 < sideArrestChance) {
          const sentence = sideJob.prison_sentence_years || 2;
          UnderworldEngine.incarceratePlayer(next, sentence, 0.3);
          details.push(
            `[โดนล่อซื้อจับกุม!] พลาดท่าถูกจับจากงานเสริมสายมืด (${sideJob.title}) ศาลสั่งจำคุก ${sentence} ปี!`
          );
        } else {
          const sideMonthly = CareerEngine.calculateMonthlyJobIncome(next, sideJob, true);
          const sideMult = MacroEconomyEngine.getIncomeMultiplier(econState, sideJob.category);
          const sideAnnual = Math.round(sideMonthly * 12 * sideMult);
          jobGrossIncome += sideAnnual;
          jobHpDrain += Math.round(sideJob.hp_drain_yearly * 0.65);
          jobSanDrain += sideJob.san_drain_yearly;
          if (sideJob.is_illegal) {
            next.career.notoriety = clamp(next.career.notoriety + 6, 0, 100);
          }
          details.push(`ลุยงานเสริม (${sideJob.title}) รับรายได้ +${sideAnnual.toLocaleString()} บาท`);
        }
      }
    }

    if (next.age >= 60 && next.career.prison_years_left === 0) {
      const allowanceMonthly = next.age >= 80 ? 800 : next.age >= 70 ? 700 : 600;
      actionIncomeBonus += allowanceMonthly * 12;
    }

    const totalAnnualIncome = jobGrossIncome + actionIncomeBonus;
    const baseLivingExpense = this.calculateBaseLivingExpense(next);
    const incomeTax = this.calculateThaiIncomeTax(totalAnnualIncome, hasIllegalJobIncome);

    let studentLoanInstallment = 0;
    if (
      !next.education.is_enrolled &&
      next.career.prison_years_left === 0 &&
      next.finance.student_loan_debt > 0 &&
      totalAnnualIncome >= 144000
    ) {
      next.finance.student_loan_debt = Math.round(next.finance.student_loan_debt * 1.01);
      studentLoanInstallment = Math.min(next.finance.student_loan_debt, 12000);
      next.finance.student_loan_debt -= studentLoanInstallment;
      details.push(
        `หักชำระหนี้ กยศ. รายปี ${studentLoanInstallment.toLocaleString()} บาท`
      );
    }

    if (next.finance.debt > 0) {
      const interestRate = next.finance.debt > 200000 ? 0.14 : 0.09;
      const interestAmount = Math.round(next.finance.debt * interestRate);
      next.finance.debt += interestAmount;
      details.push(
        `ดอกเบี้ยหนี้สะสม (${Math.round(interestRate * 100)}%/ปี) เพิ่มยอดหนี้อีก +${interestAmount.toLocaleString()} บาท`
      );
    }

    const cashBeforeAssets = next.finance.cash;
    const baseExpensesTotal =
      baseLivingExpense +
      tuitionCost +
      actionExpense +
      safehouseUpkeepExpense +
      incomeTax +
      studentLoanInstallment;
    next.finance.cash += totalAnnualIncome - baseExpensesTotal;

    if (next.finance.cash < 0) {
      const deficit = Math.abs(next.finance.cash);
      next.finance.cash = 0;
      next.finance.debt += deficit;
      details.push(`เงินสดไม่พอจ่ายค่าใช้จ่าย ต้องกู้ยืมเพิ่มเป็นหนี้สะสม +${deficit.toLocaleString()} บาท`);
      if (next.career.safehouse_id) {
        const lostHideout = UnderworldEngine.getSafehouseById(next.career.safehouse_id);
        next.career.safehouse_id = null;
        next.career.safehouse_security = 0;
        details.push(
          `[ขาดสภาพคล่องจ่ายค่าเซฟเฮาส์!] ลูกน้องเฝ้าจุดแยกย้ายหนี แหล่งกบดาน "${lostHideout?.name || ''}" ถูกยกเลิกทันที!`
        );
      }
    }

    // Assets & Repossession (runs even while in prison if player has unpaid mortgages!)
    const assetOut = AssetManager.processYearlyAssets(next);
    for (const aLog of assetOut.logs) {
      details.push(aLog);
    }

    const totalAssetOutflow = Math.max(
      0,
      cashBeforeAssets + totalAnnualIncome - baseExpensesTotal - next.finance.cash
    );
    next.finance.annual_income = totalAnnualIncome;
    next.finance.annual_expense = baseExpensesTotal + totalAssetOutflow;
    const annualNetDelta = totalAnnualIncome - next.finance.annual_expense;

    const baseAgeDecay = this.calculateBaseAgeHpDecay(next.age);
    const chronicDrain = next.flags.has_chronic_disease ? 4 : 0;
    const debtStressSan = next.finance.debt > 150000 ? 6 : next.finance.debt > 30000 ? 3 : 0;
    const stressFactorHp = next.stats.san < 30 ? 4 : 0;

    const totalHpDrain =
      baseAgeDecay + jobHpDrain + chronicDrain + stressFactorHp + econCfg.hpDrainGlobal;
    const totalSanDrain = jobSanDrain + debtStressSan;

    next.stats.hp = clamp(next.stats.hp - totalHpDrain, 0, 100);
    next.stats.san = clamp(next.stats.san - totalSanDrain, 0, 100);

    next.stats.energy = next.flags.is_burnout ? 70 : 100;
    if (wasBurnoutThisYear && !next.flags.is_burnout) {
      details.push('ฟื้นตัวจากภาวะ Burnout เพดานพลังงานกลับมาเป็น 100 แต้ม');
    }

    next.max_stats_reached.int = Math.max(next.max_stats_reached.int, next.stats.int);
    next.max_stats_reached.soc = Math.max(next.max_stats_reached.soc, next.stats.soc);
    next.max_stats_reached.ath = Math.max(next.max_stats_reached.ath, next.stats.ath);
    next.max_stats_reached.cash = Math.max(next.max_stats_reached.cash, next.finance.cash);

    if (next.stats.hp <= 0) {
      next.is_alive = false;
      next.stats.hp = 0;
      next.cause_of_death =
        next.career.prison_years_left > 0
          ? 'เสียชีวิตจากอาการเจ็บป่วยภายในเรือนจำ'
          : next.flags.has_chronic_disease
          ? 'เสียชีวิตจากภาวะแทรกซ้อนของโรคประจำตัวและร่างกายล้มเหลว'
          : 'เสียชีวิตจากการโหมงานหนักและความเสื่อมโทรมของร่างกายถึงขีดสุด';
      details.push(`วาระสุดท้าย: ${next.cause_of_death}`);
    } else if (next.stats.san <= 0) {
      next.is_alive = false;
      next.stats.san = 0;
      next.cause_of_death = 'ภาวะตรอมใจและหมดไฟขั้นรุนแรง (Severe Burnout & Mental Collapse)';
      details.push(`วาระสุดท้าย: ${next.cause_of_death}`);
    } else if (next.age >= 100) {
      next.is_alive = false;
      next.cause_of_death = 'เสียชีวิตอย่างสงบตามอายุขัยธรรมชาติ (ศตวรรษชน 100 ปี)';
      details.push(`วาระสุดท้าย: ${next.cause_of_death}`);
    }

    const activePrimaryAfter = CareerEngine.getJobById(next.career.primary_job);
    const headline = !next.is_alive
      ? `สิ้นสุดการเดินทางของชีวิต (รุ่นที่ ${next.background.generation}) ในวัย ${next.age} ปี`
      : next.career.prison_years_left > 0
      ? `วัย ${next.age} ปี · ต้องโทษจำคุกในเรือนจำ (เหลือ ${next.career.prison_years_left} ปี)`
      : next.career.conscription_years_left > 0
      ? `วัย ${next.age} ปี · ประจำการทหารกองประจำการ`
      : activePrimaryAfter
      ? `วัย ${next.age} ปี · ประกอบอาชีพ${activePrimaryAfter.title}`
      : next.education.is_enrolled && next.education.active_program
      ? `วัย ${next.age} ปี · กำลังศึกษา${EDUCATION_TREE[next.education.active_program].shortTitle}`
      : `วัย ${next.age} ปี · ใช้ชีวิตตามจังหวะเส้นทางของตนเอง`;

    next.history.unshift({
      age: next.age,
      year_be: currentYearBE,
      headline,
      details,
      net_finance_delta: annualNetDelta,
      hp_after: next.stats.hp,
      san_after: next.stats.san,
      int_after: next.stats.int,
      soc_after: next.stats.soc,
      ath_after: next.stats.ath,
      cash_after: next.finance.cash,
      debt_after: next.finance.debt + next.finance.student_loan_debt,
      economic_state: econState,
    });

    return next;
  }

  static evaluateEndingSummary(player: PlayerData): EndingSummary {
    const assetValue = AssetManager.getNetAssetLiquidationValue(player);
    const cashPoints = Math.round(player.finance.cash * 0.1);
    const assetPoints = Math.round(assetValue * 0.08);
    const intPoints = Math.round(player.max_stats_reached.int * 10);
    const socPoints = Math.round(player.max_stats_reached.soc * 10);
    const athPoints = Math.round(player.max_stats_reached.ath * 10 + player.career.championship_medals * 250);
    const agePoints = Math.round(player.age * 50);
    const debtPenalty = Math.round(
      (player.finance.debt + player.finance.student_loan_debt) * 0.5
    );

    const lifeScore =
      cashPoints + assetPoints + intPoints + socPoints + athPoints + agePoints - debtPenalty;

    let title = 'สามัญชนคนสู้ชีวิตใต้ฟ้าเมืองไทย';
    let subtitle = 'ผ่านร้อนผ่านหนาว ล้มลุกคลุกคลานและทิ้งเรื่องราวไว้ในความทรงจำ';

    if (player.career.primary_job === 'MAFIA_KINGPIN') {
      title = 'จอมอิทธิพลเหนือกฎหมาย ตำนานมาเฟียเงามืด';
      subtitle = 'ไต่เต้าจากตรอกมืดสู่จุดสูงสุดของโลกใต้ดิน กุมอำนาจและทรัพย์สินมหาศาลโดยไม่ถูกโค่นล้ม';
    } else if (
      player.career.primary_job === 'SYNDICATE_BOSS' ||
      (player.flags.is_criminal_record && player.finance.cash >= 5000000)
    ) {
      title = 'เจ้าพ่อเงามืดผู้กุมอาณาจักรสีเทา';
      subtitle = 'เดินบนเส้นด้ายแห่งความเสี่ยงและกฎหมาย สร้างความมั่งคั่งมหาศาลจากโลกใต้ดิน';
    } else if (player.career.championship_medals >= 3) {
      title = 'ตำนานฮีโร่นักกีฬาเหรียญทองขวัญใจคนไทย';
      subtitle = `จารึกชื่อในประวัติศาสตร์วงการกีฬาด้วยผลงานแชมป์ ${player.career.championship_medals} สมัย!`;
    } else if (
      player.flags.is_criminal_record &&
      player.career.prison_years_left === 0 &&
      (player.career.primary_job === 'BARBER_SHOP_OWNER' || player.career.primary_job === 'SME_OWNER') &&
      player.finance.cash >= 300000
    ) {
      title = 'อดีตคนคุกกลับใจ สู่เถ้าแก่ผู้สร้างตัวสุจริต';
      subtitle = 'ก้าวข้ามตราบาปในอดีต ลุกขึ้นสร้างอาชีพด้วยสองมือจนกลับมาเป็นที่ยอมรับอีกครั้ง';
    } else if (player.career.prison_years_left > 0) {
      title = 'ปิดฉากชีวิตหลังกำแพงลูกกรงเหล็ก';
      subtitle = 'บทเรียนราคาแพงของทางลัดสีเทาที่แลกมาด้วยอิสรภาพจนวาระสุดท้าย';
    } else if (
      (player.career.primary_job === 'MILITARY_NCO' ||
        player.career.primary_job === 'MILITARY_OFFICER') &&
      player.age >= 60
    ) {
      title = 'นายทหารผู้รับใช้ชาติจนเกษียณ';
      subtitle = 'ยืนหยัดในระเบียบวินัยและเกียรติยศจนถึงวัยเกษียณอายุราชการ';
    } else if (
      (player.career.primary_job === 'RETAIL_STAFF' ||
        player.career.primary_job === 'RETAIL_STORE_MANAGER') &&
      player.career.side_job === 'FREELANCE_VOCALIST'
    ) {
      title = 'ยอดนักสู้ 7-Eleven สายดนตรี';
      subtitle = 'กลางวันยืนเครื่องคิดเงิน กลางคืนจับไมค์ร้องเพลงด้วยหัวใจไม่ยอมแพ้';
    } else if (player.finance.debt > 1000000) {
      title = 'ตำนานลูกหนี้ผู้สู้ชีวิตแต่ชีวิตสู้กลับ';
      subtitle = 'แบกรับภาระหนี้หลักล้านฝ่ามรสุมเศรษฐกิจไทยอย่างโชกโชน';
    } else if (
      player.education.current_level === 'NON_FORMAL_KSN' &&
      player.finance.cash + assetValue > 5000000
    ) {
      title = 'เศรษฐีสร้างตัว วุฒิ กศน.';
      subtitle = 'พิสูจน์ให้โลกเห็นว่าใบปริญญาไม่ใช่กรอบจำกัดความมั่งคั่ง';
    } else if (player.career.primary_job === 'HEAD_SPORTS_COACH') {
      title = 'ยอดโค้ชผู้ปั้นดาวรุ่งประดับวงการกีฬาไทย';
      subtitle = 'ส่งต่อจิตวิญญาณนักสู้จากสนามแข่งขันสู่การสร้างนักกีฬารุ่นใหม่';
    } else if (player.age >= 90) {
      title = 'ร่มโพธิ์ร่มไทรผู้ผ่านกาลเวลาเกือบศตวรรษ';
      subtitle = 'รักษาสุขภาพกายและใจได้อย่างสมดุลจนอายุยืนยาว';
    }

    return {
      lifeScore,
      title,
      subtitle,
      breakdown: {
        cashPoints,
        assetPoints,
        intPoints,
        socPoints,
        athPoints,
        agePoints,
        debtPenalty,
      },
    };
  }
}
