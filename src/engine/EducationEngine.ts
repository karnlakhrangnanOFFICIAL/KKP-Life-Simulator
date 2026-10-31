import { EducationLevel, EducationNode, PlayerData } from './types';

export const EDUCATION_TREE: Record<EducationLevel, EducationNode> = {
  NONE: {
    id: 'NONE',
    title: 'วัยทารก / ก่อนวัยเรียน',
    shortTitle: 'ก่อนวัยเรียน',
    track: 'COMPULSORY',
    minAge: 0,
    durationYears: 0,
    prereqLevels: [],
    minInt: 0,
    annualTuition: 0,
    energyDrainYearly: 0,
    intGainYearly: 2,
    socGainYearly: 2,
    sanDeltaYearly: 2,
    allowsFullTimeWork: false,
    description: 'ช่วงวัยเด็กเล็กก่อนเข้าเกณฑ์การศึกษาภาคบังคับ',
    sampleSchools: {
      BANGKOK: 'ศูนย์พัฒนาเด็กเล็กชุมชนกรุงเทพฯ',
      PROVINCIAL: 'ศูนย์เด็กเล็กเทศบาลประจำจังหวัด',
      REMOTE: 'อบต. ศูนย์เด็กเล็กหมู่บ้าน',
    },
  },
  PRIMARY: {
    id: 'PRIMARY',
    title: 'ประถมศึกษา (ป.1 - ป.6)',
    shortTitle: 'ป.6 (ประถม)',
    track: 'COMPULSORY',
    minAge: 7,
    durationYears: 6,
    prereqLevels: [],
    minInt: 0,
    annualTuition: 3000,
    energyDrainYearly: 25,
    intGainYearly: 5,
    socGainYearly: 3,
    sanDeltaYearly: 1,
    allowsFullTimeWork: false,
    description: 'การศึกษาภาคบังคับระดับประถม 6 ปี สร้างพื้นฐานการอ่านเขียนคำนวณ',
    sampleSchools: {
      BANGKOK: 'โรงเรียนวัดแถวบ้าน / โรงเรียนสังกัด กทม.',
      PROVINCIAL: 'โรงเรียนอนุบาลประจำจังหวัด',
      REMOTE: 'โรงเรียนบ้านดอยพัฒนา (สพฐ.)',
    },
  },
  LOWER_SEC: {
    id: 'LOWER_SEC',
    title: 'มัธยมศึกษาตอนต้น (ม.1 - ม.3)',
    shortTitle: 'ม.3 (ม.ต้น)',
    track: 'COMPULSORY',
    minAge: 13,
    durationYears: 3,
    prereqLevels: ['PRIMARY'],
    minInt: 0,
    annualTuition: 5000,
    energyDrainYearly: 30,
    intGainYearly: 8,
    socGainYearly: 4,
    sanDeltaYearly: 2,
    allowsFullTimeWork: false,
    description: 'การศึกษาภาคบังคับระดับ ม.ต้น จุดเปลี่ยนสำคัญก่อนเลือกสายสามัญ สายอาชีพ หรือ กศน.',
    sampleSchools: {
      BANGKOK: 'โรงเรียนมัธยมเขตกรุงเทพฯ',
      PROVINCIAL: 'โรงเรียนประจำอำเภอ',
      REMOTE: 'โรงเรียนขยายโอกาสทางการศึกษา',
    },
  },
  UPPER_SEC_GENERAL: {
    id: 'UPPER_SEC_GENERAL',
    title: 'มัธยมศึกษาตอนปลาย สายสามัญ (ม.4 - ม.6)',
    shortTitle: 'ม.6 (สายสามัญ)',
    track: 'TRACK_A_FORMAL',
    minAge: 15,
    durationYears: 3,
    prereqLevels: ['LOWER_SEC'],
    minInt: 40,
    annualTuition: 12000,
    energyDrainYearly: 35,
    intGainYearly: 15,
    socGainYearly: 4,
    sanDeltaYearly: -3,
    allowsFullTimeWork: false,
    supportsStudentLoan: true,
    description: 'ทางเลือก A (ในระบบ): เน้นวิชาการเข้มข้น เรียน รด. ได้ และเตรียมสอบเข้ามหาวิทยาลัย',
    sampleSchools: {
      BANGKOK: 'โรงเรียนเตรียมอุดม / มัธยมสามัญ กทม.',
      PROVINCIAL: 'โรงเรียนประจำจังหวัด (สายวิทย์-ศิลป์)',
      REMOTE: 'โรงเรียนมัธยมประจำอำเภอ',
    },
  },
  VOCATIONAL_PVCH: {
    id: 'VOCATIONAL_PVCH',
    title: 'ประกาศนียบัตรวิชาชีพ (ปวช. 3 ปี สายอาชีพ)',
    shortTitle: 'ปวช. (สายอาชีพ)',
    track: 'TRACK_A_FORMAL',
    minAge: 15,
    durationYears: 3,
    prereqLevels: ['LOWER_SEC'],
    minInt: 0,
    annualTuition: 10000,
    energyDrainYearly: 35,
    intGainYearly: 8,
    socGainYearly: 10,
    sanDeltaYearly: 0,
    allowsFullTimeWork: false,
    supportsStudentLoan: true,
    description: 'ทางเลือก A (ในระบบ): เน้นทักษะปฏิบัติจริง เรียน รด. ได้ ปลดล็อกสายช่าง/บริการ',
    sampleSchools: {
      BANGKOK: 'วิทยาลัยเทคนิค / พาณิชยการในกรุงเทพฯ',
      PROVINCIAL: 'วิทยาลัยเทคนิคประจำจังหวัด',
      REMOTE: 'วิทยาลัยการอาชีพประจำอำเภอ',
    },
  },
  NON_FORMAL_KSN: {
    id: 'NON_FORMAL_KSN',
    title: 'กศน. มัธยมปลาย (สกร. นอกระบบ 2 ปี)',
    shortTitle: 'กศน. ม.ปลาย',
    track: 'TRACK_B_NON_FORMAL',
    minAge: 15,
    durationYears: 2,
    prereqLevels: ['LOWER_SEC'],
    minInt: 0,
    annualTuition: 1500,
    energyDrainYearly: 15,
    intGainYearly: 6,
    socGainYearly: 5,
    sanDeltaYearly: 1,
    allowsFullTimeWork: true,
    description: 'ทางเลือก B (นอกระบบ): ใช้พลังงานน้อยมาก (15 Energy) ทำงานประจำควบคู่ได้',
    sampleSchools: {
      BANGKOK: 'ศกร. (กศน.) เขตกรุงเทพมหานคร',
      PROVINCIAL: 'กศน. อำเภอเมือง',
      REMOTE: 'กศน. ตำบล',
    },
  },
  MILITARY_CADET: {
    id: 'MILITARY_CADET',
    title: 'โรงเรียนเตรียมทหาร – โรงเรียนนายร้อยเหล่าทัพ (หลักสูตรต่อเนื่อง 6 ปี)',
    shortTitle: 'รร.เตรียมทหาร-นายร้อย',
    track: 'HIGHER',
    minAge: 15,
    maxAge: 18,
    durationYears: 6,
    prereqLevels: ['LOWER_SEC'],
    minInt: 55,
    minAth: 45,
    minHp: 70,
    blocksCriminalRecord: true,
    annualTuition: 0,
    annualStipend: 36000,
    energyDrainYearly: 45,
    intGainYearly: 28,
    socGainYearly: 16,
    athGainYearly: 6,
    hpGainYearly: 4,
    sanDeltaYearly: -2,
    allowsFullTimeWork: false,
    supportsStudentLoan: false,
    description:
      'สอบคัดเลือกหลังจบ ม.3 (อายุ 15–18 ปี) เรียนฟรีทุนกองทัพพร้อมรับเบี้ยเลี้ยง 36,000 บ./ปี จบหลักสูตรได้วุฒิเทียบเท่า ป.ตรี พ้นภาระเกณฑ์ทหาร และบรรจุติดดาวเป็นนายร้อยทันที!',
    sampleSchools: {
      BANGKOK: 'รร.เตรียมทหาร (นครนายก) ต่อ รร.นายร้อย จปร.',
      PROVINCIAL: 'รร.เตรียมทหาร ต่อ รร.นายเรือ / รร.นายเรืออากาศ',
      REMOTE: 'รร.เตรียมทหาร (โควตาช้างเผือกภูมิภาค) ต่อ รร.นายร้อย',
    },
  },
  PVSS: {
    id: 'PVSS',
    title: 'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส. 2 ปี)',
    shortTitle: 'ปวส. (เทคนิคชั้นสูง)',
    track: 'HIGHER',
    minAge: 18,
    durationYears: 2,
    prereqLevels: ['VOCATIONAL_PVCH', 'UPPER_SEC_GENERAL'],
    minInt: 0,
    annualTuition: 18000,
    energyDrainYearly: 35,
    intGainYearly: 10,
    socGainYearly: 8,
    sanDeltaYearly: 0,
    allowsFullTimeWork: false,
    supportsStudentLoan: true,
    description: 'สายวิชาชีพชั้นสูง 2 ปี กู้ กยศ. ได้ และใช้ลดหย่อนเกณฑ์ทหารเหลือ 1 ปี',
    sampleSchools: {
      BANGKOK: 'สถาบันเทคโนโลยีราชมงคล / วิทยาลัยเทคนิค',
      PROVINCIAL: 'วิทยาลัยเทคนิคชั้นสูงประจำจังหวัด',
      REMOTE: 'วิทยาลัยการอาชีพภูมิภาค',
    },
  },
  BACHELOR_REGULAR: {
    id: 'BACHELOR_REGULAR',
    title: 'ปริญญาตรี ภาคปกติ (4 ปี)',
    shortTitle: 'ป.ตรี (ภาคปกติ)',
    track: 'HIGHER',
    minAge: 18,
    durationYears: 4,
    prereqLevels: ['UPPER_SEC_GENERAL', 'VOCATIONAL_PVCH'],
    minInt: 50,
    annualTuition: 50000,
    energyDrainYearly: 45,
    intGainYearly: 25,
    socGainYearly: 8,
    sanDeltaYearly: -4,
    allowsFullTimeWork: false,
    supportsStudentLoan: true,
    description: 'เรียนเต็มเวลา ค่าเทอม 50,000 บ./ปี (รองรับทุนเรียนดีเมื่อ INT >= 78 หรือยื่นกู้ กยศ.)',
    sampleSchools: {
      BANGKOK: 'มหาวิทยาลัยรัฐชั้นนำ กรุงเทพฯ',
      PROVINCIAL: 'มหาวิทยาลัยภูมิภาคประจำภาค',
      REMOTE: 'มหาวิทยาลัยราชภัฏประจำจังหวัด',
    },
  },
  BACHELOR_SPECIAL: {
    id: 'BACHELOR_SPECIAL',
    title: 'ปริญญาตรี ภาคพิเศษ / เสาร์-อาทิตย์ / ม.เปิด (4 ปี)',
    shortTitle: 'ป.ตรี (ภาคพิเศษ/ม.เปิด)',
    track: 'HIGHER',
    minAge: 18,
    durationYears: 4,
    prereqLevels: ['UPPER_SEC_GENERAL', 'PVSS', 'NON_FORMAL_KSN', 'VOCATIONAL_PVCH'],
    minInt: 0,
    annualTuition: 22000,
    energyDrainYearly: 30,
    intGainYearly: 20,
    socGainYearly: 6,
    sanDeltaYearly: -5,
    allowsFullTimeWork: true,
    supportsStudentLoan: true,
    description: 'เรียนวันเสาร์-อาทิตย์หรือมหาวิทยาลัยเปิด ทำงานหลักควบคู่ไปด้วยได้ กู้ กยศ. ได้',
    sampleSchools: {
      BANGKOK: 'มหาวิทยาลัยรามคำแหง / มสธ. / ภาคพิเศษ',
      PROVINCIAL: 'มหาวิทยาลัยเปิดศูนย์วิทยบริการจังหวัด',
      REMOTE: 'มหาวิทยาลัยสุโขทัยธรรมาธิราช (เรียนทางไกล)',
    },
  },
  OVERSEAS_DEGREE: {
    id: 'OVERSEAS_DEGREE',
    title: 'ปริญญาตรี-โท มหาวิทยาลัยชั้นนำต่างประเทศ (Overseas Elite)',
    shortTitle: 'ปริญญาต่างประเทศ (Elite)',
    track: 'HIGHER',
    minAge: 18,
    durationYears: 4,
    prereqLevels: ['UPPER_SEC_GENERAL'],
    minInt: 60,
    requiresEliteWealth: true,
    annualTuition: 450000,
    energyDrainYearly: 40,
    intGainYearly: 35,
    socGainYearly: 25,
    sanDeltaYearly: 4,
    allowsFullTimeWork: false,
    description: 'เอกสิทธิ์เฉพาะทายาทมรดกชนชั้น WEALTHY_ELITE พุ่งทะยานทั้ง INT และเครือข่ายสังคมระดับสูง',
    sampleSchools: {
      BANGKOK: 'University of London / Ivy League Track',
      PROVINCIAL: 'Melbourne / UK International University',
      REMOTE: 'Singapore / UK Overseas Scholarship',
    },
  },
};

export class EducationEngine {
  static getNode(level: EducationLevel): EducationNode {
    return EDUCATION_TREE[level];
  }

  static hasCompletedOrHigher(player: PlayerData, requiredLevels: EducationLevel[]): boolean {
    if (requiredLevels.length === 0) return true;
    // OVERSEAS_DEGREE and MILITARY_CADET count for Bachelor/Upper-Secondary equivalency
    if (
      player.education.completed_levels.includes('OVERSEAS_DEGREE') &&
      (requiredLevels.includes('BACHELOR_REGULAR') || requiredLevels.includes('BACHELOR_SPECIAL'))
    ) {
      return true;
    }
    if (
      player.education.completed_levels.includes('MILITARY_CADET') &&
      (requiredLevels.includes('UPPER_SEC_GENERAL') ||
        requiredLevels.includes('BACHELOR_REGULAR') ||
        requiredLevels.includes('BACHELOR_SPECIAL'))
    ) {
      return true;
    }
    return requiredLevels.some(
      (req) =>
        player.education.current_level === req ||
        player.education.completed_levels.includes(req)
    );
  }

  static checkEligibility(
    player: PlayerData,
    targetLevel: EducationLevel
  ): { eligible: boolean; reason?: string } {
    const node = EDUCATION_TREE[targetLevel];
    if (targetLevel === 'NONE') return { eligible: false, reason: 'ไม่สามารถสมัครได้' };

    if (player.education.completed_levels.includes(targetLevel)) {
      return { eligible: false, reason: 'สำเร็จการศึกษาระดับนี้แล้ว' };
    }
    if (player.education.is_enrolled) {
      return {
        eligible: false,
        reason: `กำลังศึกษาอยู่ (${EDUCATION_TREE[player.education.active_program || 'NONE'].shortTitle})`,
      };
    }
    if (player.career.conscription_years_left > 0) {
      return { eligible: false, reason: 'อยู่ระหว่างรับราชการทหารกองประจำการ' };
    }
    if (node.blocksCriminalRecord && player.flags.is_criminal_record) {
      return { eligible: false, reason: 'ผู้มีประวัติคดีอาญาขาดคุณสมบัติสอบเข้าโรงเรียนทหาร' };
    }
    if (node.requiresEliteWealth && player.background.family_wealth !== 'WEALTHY_ELITE') {
      return { eligible: false, reason: 'ปลดล็อกเฉพาะทายาทตระกูล WEALTHY_ELITE (มรดก > 2 ล้านบาท)' };
    }
    if (player.age < node.minAge) {
      return { eligible: false, reason: `ต้องมีอายุอย่างน้อย ${node.minAge} ปี` };
    }
    if (node.maxAge && player.age > node.maxAge) {
      return { eligible: false, reason: `เกินเพดานอายุรับสมัครสอบ (${node.maxAge} ปี)` };
    }
    if (node.prereqLevels.length > 0) {
      const hasPrereq = node.prereqLevels.some((lvl) =>
        player.education.completed_levels.includes(lvl)
      );
      if (!hasPrereq) {
        const names = node.prereqLevels.map((l) => EDUCATION_TREE[l].shortTitle).join(' หรือ ');
        return { eligible: false, reason: `ต้องจบ ${names} ก่อน` };
      }
    }
    if (player.stats.int < node.minInt) {
      return {
        eligible: false,
        reason: `ต้องการค่าสติปัญญา (INT) >= ${node.minInt} (ปัจจุบัน ${player.stats.int})`,
      };
    }
    if (node.minAth && player.stats.ath < node.minAth) {
      return {
        eligible: false,
        reason: `ต้องการทักษะร่างกาย/กีฬา (ATH) >= ${node.minAth} (ปัจจุบัน ${player.stats.ath})`,
      };
    }
    if (node.minHp && player.stats.hp < node.minHp) {
      return {
        eligible: false,
        reason: `ต้องการสุขภาพกาย (HP) >= ${node.minHp} (ปัจจุบัน ${player.stats.hp})`,
      };
    }
    if (!node.allowsFullTimeWork && player.career.primary_job) {
      return { eligible: false, reason: 'หลักสูตรเต็มเวลา ต้องลาออกจากงานหลักก่อนสมัครเรียน' };
    }

    return { eligible: true };
  }

  static calculateAnnualTuition(player: PlayerData, level: EducationLevel): number {
    const node = EDUCATION_TREE[level];
    if (level === 'PRIMARY' || level === 'LOWER_SEC') {
      if (
        player.background.family_wealth === 'RICH' ||
        player.background.family_wealth === 'WEALTHY_ELITE' ||
        player.background.family_wealth === 'MIDDLE'
      ) {
        return 0;
      }
      return 1500;
    }
    if (player.education.has_scholarship) {
      return 0;
    }
    if (player.education.uses_student_loan && node.supportsStudentLoan) {
      return 0; // ค่าเทอมถูกบันทึกเข้ายอดหนี้ กยศ. แทนการตัดเงินสดทันที
    }
    if (player.age <= 22) {
      if (
        (player.background.family_wealth === 'RICH' ||
          player.background.family_wealth === 'WEALTHY_ELITE') &&
        player.background.parent_support >= 40
      ) {
        return level === 'OVERSEAS_DEGREE' ? Math.round(node.annualTuition * 0.5) : 0;
      }
      if (player.background.family_wealth === 'MIDDLE' && player.background.parent_support >= 60) {
        return Math.round(node.annualTuition * 0.4);
      }
    }
    return node.annualTuition;
  }

  static computeGPA(intStat: number, studyFocusBonus: number): number {
    const base = 1.65 + (intStat / 100) * 2.05 + studyFocusBonus;
    return Math.min(4.0, Math.max(1.5, Number(base.toFixed(2))));
  }
}
