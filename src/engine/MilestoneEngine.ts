import { CareerEngine } from './CareerEngine';
import { EDUCATION_TREE, EducationEngine } from './EducationEngine';
import { EducationLevel, MilestoneNotification, PlayerData } from './types';

export class MilestoneEngine {
  static evaluateUpcomingMilestones(player: PlayerData): MilestoneNotification[] {
    if (!player.is_alive) return [];

    const alerts: MilestoneNotification[] = [];
    const completed = player.education.completed_levels;
    const primaryJob = CareerEngine.getJobById(player.career.primary_job);

    // 1. Approaching Male Military Conscription (Age 19-20, Male, ROTC < 3)
    if (
      player.sex === 'MALE' &&
      player.age >= 19 &&
      player.age <= 20 &&
      player.education.rotc_level < 3 &&
      !player.flags.conscription_completed
    ) {
      const yearsLeft = 21 - player.age;
      alerts.push({
        id: `upcoming-conscription-${player.age}`,
        category: 'CAREER',
        horizonLabel: `อีก ${yearsLeft} ปี (อายุครบ 21 ปีบริบูรณ์)`,
        title: 'ใกล้ถึงเกณฑ์ตรวจเลือกทหารกองเกิน (จับใบดำ-ใบแดง)',
        description:
          player.education.rotc_level > 0
            ? `ขณะนี้คุณเรียน รด. ชั้นปีที่ ${player.education.rotc_level}/3 หากเรียนไม่ครบปี 3 ก่อนอายุ 21 ปี จะต้องเข้ารับการคัดเลือกทหาร`
            : 'คุณไม่ได้เรียน รด. จบชั้นปีที่ 3 เมื่ออายุ 21 ปีต้องเข้าตรวจเลือกทหาร (หากจบ ปวส./ป.ตรี สามารถยื่นลดหย่อนวันประจำการเหลือ 1 ปีได้)',
        targetTab: 'TIMELINE',
      });
    }

    // 2. Payment Default Danger Warning on Owned Assets
    const defaultingAsset = player.assets.find((a) => a.default_count >= 1 && !a.is_rental);
    if (defaultingAsset) {
      alerts.push({
        id: `asset-default-danger-${defaultingAsset.asset_id}-${player.age}`,
        category: 'FINANCE',
        horizonLabel: 'เสี่ยงถูกยึดทรัพย์ในปีนี้!',
        title: `ค้างค่างวด "${defaultingAsset.name}" มาแล้ว 1 ครั้ง`,
        description: `หากปีนี้เงินสดไม่พอจ่ายค่างวด (${defaultingAsset.annual_installment.toLocaleString()} บาท) ไฟแนนซ์จะยึดทรัพย์ทันที พร้อมติดเครดิตบูโรห้ามกู้ 5 ปี!`,
        targetTab: 'ASSETS',
        actionLabel: 'จัดการทรัพย์สิน',
      });
    }

    // 3. Approaching Compulsory Primary School (Age 5-6)
    if (player.age >= 5 && player.age <= 6 && !completed.includes('PRIMARY')) {
      alerts.push({
        id: `upcoming-primary-${player.age}`,
        category: 'EDUCATION',
        horizonLabel: `อีก ${7 - player.age} ปี (อายุ 7 ปี)`,
        title: 'เตรียมเข้าสู่เกณฑ์การศึกษาภาคบังคับ (ป.1)',
        description: 'เมื่ออายุครบ 7 ปี ระบบจะลงทะเบียนเข้าเรียนชั้นประถมศึกษาโดยอัตโนมัติ',
        targetTab: 'EDUCATION',
        actionLabel: 'ดูผังการศึกษา',
      });
    }

    // 4. Approaching M.3 Track Fork
    if (
      player.education.is_enrolled &&
      player.education.active_program === 'LOWER_SEC' &&
      player.education.years_in_program >= 2
    ) {
      alerts.push({
        id: 'approaching-m3-fork',
        category: 'EDUCATION',
        horizonLabel: 'กำลังจะจบ ม.3 ในปีหน้า',
        title: 'เตรียมเลือกสายสามัญ / อาชีวะ ปวช. / กศน.',
        description:
          player.stats.int >= 40
            ? 'ค่า INT ผ่านเกณฑ์สายสามัญแล้ว (INT >= 40) และหากเป็นเพศชาย การเรียนในระบบ (ม.4 หรือ ปวช.) จะเปิดให้เรียน รด. ยกเว้นเกณฑ์ทหารได้'
            : `หากต้องการเข้า ม.4 สายสามัญ ต้องเร่ง INT ให้ถึง 40 (ปัจจุบัน ${player.stats.int}) หรือเลือกต่อ ปวช. / กศน.`,
        targetTab: 'EDUCATION',
        actionLabel: 'ตรวจสอบเกณฑ์',
      });
    }

    // 5. Eligible for Higher Education Now
    const hasPostM3 =
      completed.includes('UPPER_SEC_GENERAL') ||
      completed.includes('VOCATIONAL_PVCH') ||
      completed.includes('NON_FORMAL_KSN');
    const hasBachelor =
      completed.includes('BACHELOR_REGULAR') ||
      completed.includes('BACHELOR_SPECIAL') ||
      completed.includes('OVERSEAS_DEGREE');

    if (hasPostM3 && !hasBachelor && !player.education.is_enrolled && player.career.conscription_years_left === 0) {
      const higherCandidates: EducationLevel[] = [
        'OVERSEAS_DEGREE',
        'BACHELOR_REGULAR',
        'BACHELOR_SPECIAL',
        'PVSS',
      ];
      const unlockedNodes = higherCandidates.filter(
        (lvl) => EducationEngine.checkEligibility(player, lvl).eligible
      );

      if (unlockedNodes.length > 0) {
        const names = unlockedNodes.map((l) => EDUCATION_TREE[l].shortTitle).join(' · ');
        alerts.push({
          id: `eligible-higher-edu-${unlockedNodes.join('_')}`,
          category: 'EDUCATION',
          horizonLabel: 'ปลดล็อกสิทธิ์อุดมศึกษา',
          title: `มีสิทธิ์ศึกษาต่อระดับอุดมศึกษา: ${names}`,
          description:
            'สามารถเลือกจ่ายค่าเทอมปกติ รับทุนเรียนดี (เมื่อ INT >= 78) หรือยื่นกู้ กยศ. เพื่อเรียนต่อได้ทันที',
          targetTab: 'EDUCATION',
          actionLabel: 'สมัครเรียนต่อ',
        });
      }
    }

    // 6. Ready to buy Condo or Eco-Car milestone
    if (
      player.age >= 22 &&
      player.finance.cash >= 260000 &&
      player.assets.length === 0 &&
      player.finance.credit_score === 'GOOD'
    ) {
      alerts.push({
        id: 'ready-first-asset',
        category: 'FINANCE',
        horizonLabel: 'เงินสดพร้อมวางดาวน์',
        title: 'มีเงินเก็บเพียงพอสำหรับดาวน์คอนโดหรือรถยนต์คันแรก',
        description:
          'การมีทรัพย์สินช่วยเพิ่มค่าความสุข (SAN) คอนเนกชัน (SOC) และลดพลังงานเดินทางไปทำงานในแต่ละปี',
        targetTab: 'ASSETS',
        actionLabel: 'ดูตลาดทรัพย์สิน',
      });
    }

    // 7A. Aspiring Youth Athlete Near Pro Threshold (Age 8-18, ATH 30-44)
    if (
      player.age >= 8 &&
      player.age <= 18 &&
      player.stats.ath >= 30 &&
      player.stats.ath < 45 &&
      !player.career.primary_job &&
      player.career.prison_years_left === 0
    ) {
      alerts.push({
        id: `youth-athletic-training-nudge-${player.age}`,
        category: 'CAREER',
        horizonLabel: `อีก ${45 - player.stats.ath} แต้มถึงเกณฑ์เทิร์นโปร (ATH ${player.stats.ath}/45)`,
        title: 'แววรุ่งด้านกีฬา! เข้าศูนย์ฝึกกีฬาเพื่อดันค่า ATH สู่ระดับอาชีพ',
        description:
          'เลือกโปรแกรม Intensive Coaching, Club Training หรือ Solo Practice เพื่อเร่งทักษะกีฬา (ATH) และสร้างคอนเนกชันแมวมอง (SOC)',
        targetTab: 'ATHLETICS',
        actionLabel: 'เข้าศูนย์ฝึกกีฬา',
      });
    }

    // 7B. Promising Youth Athlete Talent Ready to Turn Pro (Age 13-20, ATH >= 45)
    if (
      player.age >= 13 &&
      player.age <= 20 &&
      player.stats.ath >= 45 &&
      !player.career.primary_job &&
      player.career.prison_years_left === 0
    ) {
      alerts.push({
        id: `youth-sports-talent-${player.age}`,
        category: 'CAREER',
        horizonLabel: `ทักษะกีฬาโดดเด่น (ATH ${player.stats.ath}/100)`,
        title: 'ร่างกายพร้อมเทิร์นโปรเข้าค่ายมวยหรืออคาเดมีสโมสรอาชีพ',
        description:
          'ค่าสมรรถภาพกีฬาของคุณผ่านเกณฑ์ขั้นต้นของสายนักกีฬาอาชีพ สามารถสมัครขึ้นชกหรือคัดตัวสโมสรเพื่อลุ้นเงินรางวัลและเหรียญแชมป์ได้',
        targetTab: 'CAREER',
        actionLabel: 'ดูสายนักกีฬา',
      });
    }

    // 8. Athlete Approaching Mandatory Peak-Age Retirement
    if (
      primaryJob &&
      primaryJob.category === 'SPORTS' &&
      primaryJob.max_age &&
      player.age >= primaryJob.max_age - 3
    ) {
      const yearsLeft = Math.max(0, primaryJob.max_age - player.age);
      const hasCoachCert = player.career.licenses.includes('SPORTS_COACH_CERT');
      alerts.push({
        id: `athlete-retirement-window-${player.age}`,
        category: 'CAREER',
        horizonLabel: `เหลือเวลาค้าแข้งอีก ${yearsLeft} ปี (เพดานอายุ ${primaryJob.max_age} ปี)`,
        title: 'ใกล้ถึงวัยแขวนนวม/แขวนสตั๊ดของนักกีฬาอาชีพ',
        description: hasCoachCert
          ? 'คุณมีใบอนุญาตโค้ชกีฬาอาชีพ (Pro License) พร้อมผันตัวเป็นหัวหน้าผู้ฝึกสอนต่อได้ทันทีหลังรีไทร์'
          : 'ควรเตรียมสอบใบอนุญาตโค้ชกีฬาอาชีพ (Pro License) ไว้ล่วงหน้า เพื่อผันตัวเป็นหัวหน้าโค้ชทีมหลังอายุเกินเกณฑ์นักกีฬา',
        targetTab: 'CAREER',
        actionLabel: 'เตรียมสายโค้ช',
      });
    }

    // 9. High Police Warrant Heat & Safehouse Compromise Warnings
    if (player.career.prison_years_left === 0) {
      if (
        player.career.safehouse_id &&
        player.career.safehouse_security < 35
      ) {
        alerts.push({
          id: `safehouse-compromised-${player.age}`,
          category: 'HEALTH',
          horizonLabel: `ความลับพิกัดกบดานเหลือ ${player.career.safehouse_security}%`,
          title: 'สายสืบตำรวจเริ่มแกะรอยแหล่งกบดานของคุณเจอแล้ว!',
          description:
            'ประสิทธิภาพการพรางตัวของเซฟเฮาส์ลดลงครึ่งหนึ่ง ควรรีบย้ายจุดกบดานหรือเก็บตัวล้างร่องรอยก่อนถูกบุกทลาย',
          targetTab: 'UNDERWORLD',
          actionLabel: 'ย้ายจุดกบดาน',
        });
      } else if (
        (player.career.notoriety >= 40 || primaryJob?.is_illegal) &&
        !player.career.safehouse_id
      ) {
        alerts.push({
          id: `missing-safehouse-danger-${player.age}`,
          category: 'HEALTH',
          horizonLabel: `ไร้แหล่งกบดานคุ้มกัน (หมายจับ ${player.career.notoriety}/100)`,
          title: 'เดินสายมืดโดยไม่มีแหล่งกบดาน เสี่ยงถูกตำรวจบุกรวบตัวสูง!',
          description:
            'การจัดตั้งแหล่งกบดาน (Safehouse) ช่วยลดโอกาสถูกจับกุมรายปีและช่วยลดระดับความร้อนแรงของหมายจับอัตโนมัติ',
          targetTab: 'UNDERWORLD',
          actionLabel: 'หาแหล่งกบดาน',
        });
      } else if (player.career.notoriety >= 55) {
        alerts.push({
          id: `high-notoriety-danger-${player.age}`,
          category: 'HEALTH',
          horizonLabel: `หมายจับสะสมสูง (${player.career.notoriety}/100)`,
          title: 'ตกเป็นเป้าหมายสำคัญของชุดเฉพาะกิจปราบปราม!',
          description:
            'ควรเก็บตัวกบดานลดความร้อนแรง หรือฟอกร่องรอยข่าวฉาวเพื่อกดโอกาสถูกบุกจับให้ต่ำลง',
          targetTab: 'UNDERWORLD',
          actionLabel: 'กบดานซ่อนตัว',
        });
      }
    }

    // 10. Approaching Retirement Age (Age 55-59)
    if (player.age >= 55 && player.age <= 59) {
      const yearsToRetire = 60 - player.age;
      const isGov = primaryJob?.category === 'GOVERNMENT';
      alerts.push({
        id: `approaching-retirement-${player.age}`,
        category: 'RETIREMENT',
        horizonLabel: `อีก ${yearsToRetire} ปีจะถึงวัยเกษียณ (อายุ 60 ปี)`,
        title: isGov
          ? 'ใกล้ครบกำหนดเกษียณอายุราชการและรับเงินบำเหน็จบำนาญ'
          : 'ใกล้เข้าสู่วัยผู้สูงอายุและเกณฑ์รับเบี้ยยังชีพ (60 ปี)',
        description: isGov
          ? `เมื่ออายุครบ 60 ปี จะได้รับเงินก้อนบำเหน็จตามอายุงาน (${player.career.years_experience} ปี) พร้อมบำนาญรายปี`
          : 'ควรเร่งผ่อนบ้าน/รถให้หมดก่อนอายุ 60 ปี เพื่อลดภาระรายจ่ายในช่วงบั้นปลายชีวิต',
      });
    }

    return alerts;
  }
}
