import { ConditionalEvent, PlayerData } from '../engine/types';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function clonePlayer(p: PlayerData): PlayerData {
  return JSON.parse(JSON.stringify(p)) as PlayerData;
}

function markMilestoneResolved(player: PlayerData, milestoneId: string): void {
  const existing = player.flags.resolved_thai_milestones || [];
  if (!existing.includes(milestoneId)) {
    player.flags.resolved_thai_milestones = [...existing, milestoneId];
  }
}

function isMilestoneResolved(player: PlayerData, milestoneId: string): boolean {
  return Boolean(player.flags.resolved_thai_milestones?.includes(milestoneId));
}

export class ThaiMilestones {
  /**
   * Evaluates mandatory Thai cultural & legal life-stage milestones ('MILESTONE_THAI'):
   * - Age 7: บัตรประจำตัวประชาชนเด็กใบแรก ณ ที่ว่าการเขต/อำเภอ
   * - Age 15: เปลี่ยนคำนำหน้านาม นาย/นางสาว และทางแยกชีวิตวัยรุ่นไทย
   * - Age 21 (Male, ROTC < 3): หมายเรียกเข้ารับการตรวจเลือกทหารกองเกิน (จับใบดำ-ใบแดง)
   * - Age 60: วัยเกษียณและขึ้นทะเบียนรับเบี้ยยังชีพผู้สูงอายุ
   */
  static getMandatoryMilestoneEvent(player: PlayerData): ConditionalEvent | null {
    // 1. Age 7: First Thai Smart ID Card
    if (player.age === 7 && !isMilestoneResolved(player, 'THAI_FIRST_ID_CARD_7')) {
      return {
        id: 'THAI_FIRST_ID_CARD_7',
        title: 'ถ่ายรูปทำบัตรประชาชนใบแรก ณ ที่ว่าการอำเภอ/สำนักงานเขต (อายุ 7 ปีบริบูรณ์)',
        category: 'MILESTONE_THAI',
        description:
          'ตามกฎหมายไทยเมื่อเด็กอายุครบ 7 ปีบริบูรณ์ ผู้ปกครองพาคุณไปเข้าคิวถ่ายรูปติดบัตรประจำตัวประชาชนใบแรกในชีวิต พร้อมก้าวเข้าสู่รั้วโรงเรียนประถมศึกษาอย่างเต็มตัว',
        getWeight: () => 1000,
        choices: [
          {
            id: 'smile_confident_id_photo',
            label: 'ยืดอกยิ้มกว้างหน้ากล้อง ทักทายพี่เจ้าหน้าที่อย่างร่าเริง',
            sublabel: 'ได้รูปติดบัตรสดใส · SOC +6 · SAN +6',
            apply: (p: PlayerData) => {
              const next = clonePlayer(p);
              markMilestoneResolved(next, 'THAI_FIRST_ID_CARD_7');
              next.stats.soc = clamp(next.stats.soc + 6, 0, 100);
              next.stats.san = clamp(next.stats.san + 6, 0, 100);
              return {
                updated: next,
                outcomeText:
                  'ได้บัตรประชาชนใบแรกมาอวดเพื่อนๆ ที่โรงเรียนอย่างภูมิใจ! (+6 SOC, +6 SAN)',
              };
            },
          },
          {
            id: 'neat_student_id_photo',
            label: 'สำรวมเรียบร้อย ตั้งใจอ่านป้ายขั้นตอนราชการระหว่างรอคิว',
            sublabel: 'ฝึกความรอบคอบตั้งแต่วัยประถม · INT +6 · SAN +4',
            apply: (p: PlayerData) => {
              const next = clonePlayer(p);
              markMilestoneResolved(next, 'THAI_FIRST_ID_CARD_7');
              next.stats.int = clamp(next.stats.int + 6, 0, 100);
              next.stats.san = clamp(next.stats.san + 4, 0, 100);
              return {
                updated: next,
                outcomeText:
                  'รับบัตรประชาชนใบแรกเรียบร้อย ผู้ปกครองชมว่าโตเป็นผู้ใหญ่ขึ้นมาก (+6 INT, +4 SAN)',
              };
            },
          },
        ],
      };
    }

    // 2. Age 15: Legal Title Change (ด.ช./ด.ญ. -> นาย/นางสาว)
    if (player.age === 15 && !isMilestoneResolved(player, 'THAI_YOUTH_TITLE_TRANSITION_15')) {
      const titleWord = player.sex === 'MALE' ? 'นาย' : 'นางสาว';
      return {
        id: 'THAI_YOUTH_TITLE_TRANSITION_15',
        title: `อายุครบ 15 ปีบริบูรณ์: เปลี่ยนคำนำหน้านามเป็น "${titleWord}" และหัวเลี้ยวหัวต่อหลัง ม.3`,
        category: 'MILESTONE_THAI',
        description:
          'ถึงหมุดหมายสำคัญของวัยรุ่นไทย! คุณไปอัปเดตบัตรประชาชนเปลี่ยนคำนำหน้าชื่อเป็นผู้ใหญ่ตอนต้น พร้อมเปิดบัญชีธนาคารของตัวเองและวางเป้าหมายเส้นทางเรียนต่อหรือฝึกอาชีพ',
        getWeight: () => 1000,
        choices: [
          {
            id: 'open_savings_plan_future',
            label: 'เปิดบัญชีออมทรัพย์เล่มแรกและตั้งเป้าหมายชีวิตอย่างจริงจัง',
            sublabel: 'รับเงินขวัญถุงจากผู้ใหญ่ +2,500 บ. · INT +5 · SAN +5',
            apply: (p: PlayerData) => {
              const next = clonePlayer(p);
              markMilestoneResolved(next, 'THAI_YOUTH_TITLE_TRANSITION_15');
              next.finance.cash += 2500;
              next.stats.int = clamp(next.stats.int + 5, 0, 100);
              next.stats.san = clamp(next.stats.san + 5, 0, 100);
              return {
                updated: next,
                outcomeText: `เปลี่ยนคำนำหน้าเป็น "${titleWord}" พร้อมเปิดสมุดบัญชีเล่มแรก รับเงินขวัญถุง +2,500 บาท (+5 INT, +5 SAN)`,
              };
            },
          },
          {
            id: 'celebrate_coming_of_age_friends',
            label: 'นัดฉลองก้าวสู่วัยรุ่นตอนปลายกับกลุ่มเพื่อนสนิทหลังเลิกเรียน',
            sublabel: 'สร้างสายสัมพันธ์วัยเรียน · SOC +8 · ATH +4',
            apply: (p: PlayerData) => {
              const next = clonePlayer(p);
              markMilestoneResolved(next, 'THAI_YOUTH_TITLE_TRANSITION_15');
              next.stats.soc = clamp(next.stats.soc + 8, 0, 100);
              next.stats.ath = clamp(next.stats.ath + 4, 0, 100);
              return {
                updated: next,
                outcomeText: `ก้าวสู่วัย "${titleWord}" อย่างมั่นใจ มีกลุ่มเพื่อนคู่ใจพร้อมลุยเส้นทางใหม่ (+8 SOC, +4 ATH)`,
              };
            },
          },
        ],
      };
    }

    // 3. Age 21: Male Military Conscription (วันตรวจเลือกทหารกองเกิน)
    if (
      player.age === 21 &&
      player.sex === 'MALE' &&
      player.education.rotc_level < 3 &&
      !player.flags.conscription_completed
    ) {
      const hasBachelorOrPvss =
        player.education.completed_levels.includes('BACHELOR_REGULAR') ||
        player.education.completed_levels.includes('BACHELOR_SPECIAL') ||
        player.education.completed_levels.includes('OVERSEAS_DEGREE') ||
        player.education.completed_levels.includes('PVSS');

      return {
        id: 'THAI_MILITARY_CONSCRIPTION_21',
        title: 'หมายเรียกเข้ารับการตรวจเลือกทหารกองเกิน (อายุ 21 ปีบริบูรณ์)',
        category: 'MILESTONE_THAI',
        description:
          'ถึงกำหนดวันคัดเลือกทหารกองประจำการ ณ หอประชุมอำเภอ เนื่องจากคุณไม่ได้เรียน รด. จบชั้นปีที่ 3 คุณต้องตัดสินใจเลือกแนวทางเข้ารับการตรวจเลือกตามกฎหมายไทย',
        getWeight: () => 1000,
        choices: [
          ...(hasBachelorOrPvss
            ? [
                {
                  id: 'volunteer_degree_reduction',
                  label: 'ยื่นวุฒิ ป.ตรี / ปวส. สมัครใจร้องขอเป็นทหารกองประจำการ (ลดหย่อนเหลือ 1 ปี)',
                  sublabel:
                    'ไม่ต้องลุ้นจับสลาก · พักงานประจำชั่วคราว 1 ปี · รับเงินเดือนทหารเกณฑ์ 10,000 บ./ด. · HP +15, SAN -10',
                  apply: (p: PlayerData) => {
                    const next = clonePlayer(p);
                    next.flags.conscription_completed = true;
                    markMilestoneResolved(next, 'THAI_MILITARY_CONSCRIPTION_21');
                    next.career.conscription_years_left = 1;
                    if (next.career.primary_job) {
                      next.career.suspended_primary_job = next.career.primary_job;
                      next.career.primary_job = null;
                    }
                    next.stats.hp = clamp(next.stats.hp + 15, 0, 100);
                    next.stats.san = clamp(next.stats.san - 10, 0, 100);
                    return {
                      updated: next,
                      outcomeText:
                        'ยื่นวุฒิสมัครใจเข้ากองประจำการผลัดที่ 1 เป็นเวลา 1 ปี (อายัดตำแหน่งงานเดิมไว้ชั่วคราว · HP +15, SAN -10)',
                    };
                  },
                },
              ]
            : []),
          {
            id: 'draw_black_red_lot',
            label: hasBachelorOrPvss
              ? 'ยื่นวุฒิประกอบ แล้วเดินเข้าคูหาลุ้นจับ "ใบดำ - ใบแดง" (โอกาสใบแดง 25%)'
              : 'เดินเข้าคูหาลุ้นจับสลาก "ใบดำ - ใบแดง" วัดดวงชะตา! (โอกาสใบแดง 28%)',
            sublabel:
              'ใบดำ = รอดพ้นทันที (SAN +10) · ใบแดง = ติดทหารเกณฑ์ 1–2 ปี (HP +15, SAN -18, พักงานประจำ)',
            apply: (p: PlayerData) => {
              const next = clonePlayer(p);
              next.flags.conscription_completed = true;
              markMilestoneResolved(next, 'THAI_MILITARY_CONSCRIPTION_21');

              // Luck slightly improves black card odds
              const redChance = clamp(0.32 - next.stats.luk * 0.012, 0.15, 0.35);
              const drewRed = Math.random() < redChance;

              if (!drewRed) {
                next.stats.san = clamp(next.stats.san + 10, 0, 100);
                return {
                  updated: next,
                  outcomeText:
                    'เสียงโฆษกประกาศก้อง "ใบดำ!" คุณรอดพ้นการเป็นทหารกองประจำการ เดินยิ้มออกจากหอประชุม (+10 SAN)',
                };
              }

              const yearsServed = hasBachelorOrPvss ? 1 : 2;
              next.career.conscription_years_left = yearsServed;
              if (next.career.primary_job) {
                next.career.suspended_primary_job = next.career.primary_job;
                next.career.primary_job = null;
              }
              next.stats.hp = clamp(next.stats.hp + 15, 0, 100);
              next.stats.san = clamp(next.stats.san - 18, 0, 100);

              return {
                updated: next,
                outcomeText: `เสียงเฮลั่นหอประชุม "ทบ. ผลัด 1 ใบแดง!" ต้องเข้าประจำการในค่ายทหารเป็นเวลา ${yearsServed} ปี (เงินเดือน 10,000 บ./ด. · HP +15, SAN -18)`,
              };
            },
          },
        ],
      };
    }

    // 4. Age 60: Thai Senior Retirement & Elderly Allowance Registration
    if (player.age === 60 && !isMilestoneResolved(player, 'THAI_SENIOR_RETIREMENT_60')) {
      return {
        id: 'THAI_SENIOR_RETIREMENT_60',
        title: 'อายุครบ 60 ปีบริบูรณ์: ก้าวสู่วัยเกษียณและขึ้นทะเบียนเบี้ยยังชีพผู้สูงอายุ',
        category: 'MILESTONE_THAI',
        description:
          'เดินทางมาถึงหมุดหมายวัยเกษียณของสังคมไทย คุณได้รับสิทธิ์ขึ้นทะเบียนรับเบี้ยยังชีพผู้สูงอายุรายปี และถึงเวลาจัดระเบียบวิถีชีวิตบั้นปลายให้สมดุลทั้งกายและใจ',
        getWeight: () => 1000,
        choices: [
          {
            id: 'register_senior_health_club',
            label: 'ขึ้นทะเบียนผู้สูงอายุและเข้าร่วมชมรมสุขภาพประจำชุมชน',
            sublabel: 'ฟื้นฟูร่างกายและจิตใจ · HP +8 · SAN +12 · SOC +6',
            apply: (p: PlayerData) => {
              const next = clonePlayer(p);
              markMilestoneResolved(next, 'THAI_SENIOR_RETIREMENT_60');
              next.stats.hp = clamp(next.stats.hp + 8, 0, 100);
              next.stats.san = clamp(next.stats.san + 12, 0, 100);
              next.stats.soc = clamp(next.stats.soc + 6, 0, 100);
              return {
                updated: next,
                outcomeText:
                  'ลงทะเบียนรับสิทธิผู้สูงอายุเรียบร้อย สุขภาพกายใจสดชื่นท่ามกลางเพื่อนวัยเดียวกัน (+8 HP, +12 SAN)',
              };
            },
          },
          {
            id: 'mentor_younger_generation',
            label: 'ถ่ายทอดประสบการณ์ชีวิตและจัดระเบียบมรดกให้คนรุ่นหลัง',
            sublabel: 'เป็นที่เคารพนับถือในสายตระกูล · SAN +10 · SOC +10 · รับเงินของขวัญมุทิตาจิต +15,000 บ.',
            apply: (p: PlayerData) => {
              const next = clonePlayer(p);
              markMilestoneResolved(next, 'THAI_SENIOR_RETIREMENT_60');
              next.finance.cash += 15000;
              next.stats.san = clamp(next.stats.san + 10, 0, 100);
              next.stats.soc = clamp(next.stats.soc + 10, 0, 100);
              return {
                updated: next,
                outcomeText:
                  'ลูกหลานและคนรู้จักร่วมแสดงมุทิตาจิตในวาระครบ 60 ปี (+15,000 บาท, +10 SAN, +10 SOC)',
              };
            },
          },
        ],
      };
    }

    return null;
  }
}
