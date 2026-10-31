import { CareerEngine } from '../engine/CareerEngine';
import { EDUCATION_TREE } from '../engine/EducationEngine';
import { AssetManager } from './asset_manager';
import { EnergyActivityUnit, PlayerData } from '../engine/types';

export interface EnergyAllocationSummary {
  maxBaseEnergy: number;
  hardCapEnergy: number;
  mandatoryEnergy: number;
  immediateEnergySpent: number;
  optionalEnergy: number;
  totalAllocated: number;
  excessEnergy: number;
  hpPenalty: number;
  burnoutRiskPct: number;
  triggersDangerZone: boolean;
}

export class EnergySystem {
  static getYearlyActivities(player: PlayerData): EnergyActivityUnit[] {
    const units: EnergyActivityUnit[] = [];
    const vehicleDiscount = AssetManager.getTotalWorkEnergyDiscount(player);

    // 0. Serving Prison Time (เรือนจำ)
    if (player.career.prison_years_left > 0) {
      units.push(
        {
          id: 'MANDATORY_PRISON_TIME',
          title: `ต้องโทษจำคุกในเรือนจำ (เหลือโทษอีก ${player.career.prison_years_left} ปี)`,
          subtitle: 'ถูกจำกัดอิสรภาพ · ขาดรายได้ภายนอก · SAN -10',
          energyCost: 60,
          cashCost: 0,
          mandatory: true,
          category: 'MANDATORY',
          maxRepeats: 1,
        },
        {
          id: 'PRISON_VOCATIONAL_STUDY',
          title: 'เข้าห้องสมุดเรือนจำ / ฝึกวิชาชีพผู้ต้องขังชั้นดี',
          subtitle: 'INT +7 · ลดความเครียด SAN +4 · มีลุ้นลดหย่อนโทษหากประพฤติดี!',
          energyCost: 20,
          cashCost: 0,
          category: 'STUDY',
          maxRepeats: 2,
        },
        {
          id: 'PRISON_YARD_WORKOUT',
          title: 'ฝึกซ้อมร่างกายและเวทเทรนนิ่งในแดนขัง',
          subtitle: 'ทักษะกีฬา ATH +8 · HP +6',
          energyCost: 20,
          cashCost: 0,
          category: 'SPORTS',
          maxRepeats: 2,
        }
      );
      return units;
    }

    // Childhood simplified allocation (Age 0-6)
    if (player.age <= 6) {
      units.push(
        {
          id: 'CHILD_GROWTH_PLAY',
          title: 'วิ่งเล่นซุกซนและเตะบอลพลาสติกหน้าบ้าน',
          subtitle: 'HP +4 · ATH +5 · SAN +4 ต่อหน่วย',
          energyCost: 30,
          cashCost: 0,
          category: 'SPORTS',
          maxRepeats: 3,
        },
        {
          id: 'CHILD_EARLY_READING',
          title: 'ฝึกอ่านนิทาน หัดพูด และของเล่นเสริมทักษะ',
          subtitle: 'INT +5 · SAN +1 ต่อหน่วย',
          energyCost: 30,
          cashCost: 0,
          category: 'STUDY',
          maxRepeats: 3,
        },
        {
          id: 'CHILD_NEIGHBOR_FRIENDS',
          title: 'ผูกมิตรกับเพื่อนวัยเดียวกันและญาติผู้ใหญ่',
          subtitle: 'SOC +5 · SAN +3 ต่อหน่วย',
          energyCost: 25,
          cashCost: 0,
          category: 'SOCIAL',
          maxRepeats: 2,
        }
      );
      return units;
    }

    // 1. Mandatory Military Conscription
    if (player.career.conscription_years_left > 0) {
      units.push({
        id: 'MANDATORY_CONSCRIPTION',
        title: `ประจำการทหารกองประจำการ (เหลือ ${player.career.conscription_years_left} ปี)`,
        subtitle: 'เงินเดือนเบี้ยเลี้ยง 10,000 บ./เดือน · HP +10 · ATH +5 · SAN -8',
        energyCost: 65,
        cashCost: 0,
        mandatory: true,
        category: 'MANDATORY',
        maxRepeats: 1,
      });
    } else {
      const primaryJob = CareerEngine.getJobById(player.career.primary_job);
      if (primaryJob) {
        const netWorkEnergy = Math.max(25, primaryJob.energy_cost - vehicleDiscount);
        units.push({
          id: 'MANDATORY_PRIMARY_JOB',
          title: `งานหลัก: ${primaryJob.title}`,
          subtitle: primaryJob.is_illegal
            ? `[สายมืด เสี่ยงโดนบุกจับ!] ทำรายได้สูงแต่เพิ่มค่าความฉาวโฉ่`
            : vehicleDiscount > 0
            ? `บังคับทำประจำปี (ลดพลังงานเดินทาง -${vehicleDiscount} จากยานพาหนะ)`
            : 'บังคับทำประจำปีตามสัญญาจ้าง/กิจการ',
          energyCost: netWorkEnergy,
          cashCost: 0,
          mandatory: true,
          category: 'MANDATORY',
          maxRepeats: 1,
        });
      }
    }

    // 1C. Mandatory Enrolled Education
    if (player.education.is_enrolled && player.education.active_program) {
      const eduNode = EDUCATION_TREE[player.education.active_program];
      units.push({
        id: 'MANDATORY_ENROLLED_EDU',
        title: `เข้าเรียนตามหลักสูตร: ${eduNode.shortTitle}`,
        subtitle: `ชั้นปีที่ ${player.education.years_in_program + 1}/${eduNode.durationYears} · INT ตามหลักสูตร`,
        energyCost: eduNode.energyDrainYearly,
        cashCost: 0,
        mandatory: true,
        category: 'MANDATORY',
        maxRepeats: 1,
      });
    }

    // 2. Optional Active Side Job
    const sideJob = CareerEngine.getJobById(player.career.side_job);
    if (sideJob && player.career.conscription_years_left === 0) {
      units.push({
        id: 'OPT_SIDE_JOB_SHIFT',
        title: `ลุยงานเสริม: ${sideJob.title}`,
        subtitle: sideJob.is_illegal
          ? '[สายมืด] รายได้เสริมสีเทา มีโอกาสถูกตำรวจตามรวบ!'
          : 'รับรายได้เสริมเต็มปี · แลกกับความเหนื่อยสะสม',
        energyCost: sideJob.energy_cost,
        cashCost: 0,
        category: 'SIDE_WORK',
        maxRepeats: 1,
      });
    }

    // Optional Overtime / Odd Jobs Hustle
    if (player.career.conscription_years_left === 0) {
      if (player.career.primary_job) {
        units.push({
          id: 'OPT_OVERTIME_PUSH',
          title: 'ทำโอทีล่วงเวลา / ซ้อมหนักชิงแชมป์เลื่อนชั้น',
          subtitle: 'โบนัสพิเศษ +18,000~35,000 บ. · เพิ่มโอกาสเลื่อนขั้น/คว้าเหรียญทอง · SAN -4',
          energyCost: 25,
          cashCost: 0,
          category: 'SIDE_WORK',
          maxRepeats: 2,
        });
      } else if (player.age >= 15) {
        units.push({
          id: 'OPT_FREELANCE_GIGS',
          title: 'รับจ้างรายวัน / วิ่งงานพาร์ทไทม์ทั่วไป',
          subtitle: 'สร้างรายได้เสริมเฉพาะกิจ +22,000 บ. · HP -4',
          energyCost: 25,
          cashCost: 0,
          category: 'SIDE_WORK',
          maxRepeats: 2,
        });
      }
    }

    // 3. การเรียน / พัฒนาตนเอง
    units.push({
      id: 'OPT_STUDY_SELF_DEV',
      title: 'การเรียนพิเศษ / อ่านหนังสือพัฒนาตนเอง',
      subtitle: player.education.is_enrolled
        ? 'INT +6 · ดันเกรดเฉลี่ย GPA +0.25'
        : 'INT +6 · เตรียมสอบใบอนุญาตและสอบ ก.พ.',
      energyCost: 20,
      cashCost: player.age >= 18 ? 1000 : 0,
      category: 'STUDY',
      maxRepeats: 2,
    });

    // Optional ROTC (เรียน รด.)
    if (
      player.sex === 'MALE' &&
      player.age >= 15 &&
      player.age <= 20 &&
      player.education.rotc_level < 3 &&
      !player.flags.is_criminal_record &&
      player.education.is_enrolled &&
      (player.education.active_program === 'UPPER_SEC_GENERAL' ||
        player.education.active_program === 'VOCATIONAL_PVCH' ||
        player.education.active_program === 'BACHELOR_REGULAR' ||
        player.education.active_program === 'PVSS')
    ) {
      units.push({
        id: 'OPT_ROTC_TRAINING',
        title: `เรียนรักษาดินแดน (รด. ชั้นปีที่ ${player.education.rotc_level + 1}/3)`,
        subtitle: 'เรียนครบ 3 ปี ยกเว้นการจับใบดำ-ใบแดงตอนอายุ 21 ปี! · HP +3, ATH +3',
        energyCost: 15,
        cashCost: 1500,
        category: 'STUDY',
        maxRepeats: 1,
      });
    }

    // 4. การออกกำลังกายทั่วไป / พักผ่อน
    units.push({
      id: 'OPT_EXERCISE_REST',
      title: 'พักผ่อนฟื้นฟูร่างกาย / กายภาพบำบัดลดความล้า',
      subtitle: 'HP +9 · SAN +8 · ลดความฉาวโฉ่สายมืดลงเล็กน้อย',
      energyCost: 15,
      cashCost: player.age >= 18 ? 1000 : 0,
      category: 'HEALTH',
      maxRepeats: 3,
    });

    // 5. สังคม / สังสรรค์
    units.push({
      id: 'OPT_SOCIAL_CONNECT',
      title: 'เข้าสังคม / สังสรรค์สร้างคอนเนกชัน',
      subtitle: 'SOC +7 · SAN +6 (ขยายโอกาสธุรกิจ การงาน สปอนเซอร์ และคู่ครอง)',
      energyCost: 15,
      cashCost: player.age >= 18 ? 2500 : 0,
      category: 'SOCIAL',
      maxRepeats: 2,
    });

    // 6. บริหารหนี้สินเชิงรุก
    if (
      (player.finance.debt > 0 || player.finance.student_loan_debt > 0) &&
      player.finance.cash >= 5000
    ) {
      units.push({
        id: 'OPT_DEBT_PAYDOWN',
        title: 'เจรจาและนำเงินสดโปะต้นหนี้สิน',
        subtitle: 'ตัดยอดหนี้ดอกเบี้ยสูงทันที สูงสุด 50,000 บาทต่อหน่วย · SAN +5',
        energyCost: 10,
        cashCost: 0,
        category: 'FINANCE',
        maxRepeats: 2,
      });
    }

    return units;
  }

  static calculateAllocationSummary(
    player: PlayerData,
    allocations: Record<string, number>
  ): EnergyAllocationSummary {
    const activities = this.getYearlyActivities(player);
    const maxBaseEnergy = player.flags.is_burnout ? 70 : 100;
    const hardCapEnergy = player.flags.is_burnout ? 120 : 150;
    const immediateEnergySpent = Math.max(0, maxBaseEnergy - player.stats.energy);

    let mandatoryEnergy = 0;
    let optionalEnergy = 0;

    for (const act of activities) {
      if (act.mandatory) {
        mandatoryEnergy += act.energyCost;
      } else {
        const count = allocations[act.id] || 0;
        optionalEnergy += count * act.energyCost;
      }
    }

    const totalAllocated = mandatoryEnergy + immediateEnergySpent + optionalEnergy;
    const excessEnergy = Math.max(0, totalAllocated - maxBaseEnergy);
    const hpPenalty = Math.round(excessEnergy * 1.5);
    const burnoutRiskPct = Math.min(100, excessEnergy * 2);
    const triggersDangerZone = excessEnergy > 20;

    return {
      maxBaseEnergy,
      hardCapEnergy,
      mandatoryEnergy,
      immediateEnergySpent,
      optionalEnergy,
      totalAllocated,
      excessEnergy,
      hpPenalty,
      burnoutRiskPct,
      triggersDangerZone,
    };
  }
}
