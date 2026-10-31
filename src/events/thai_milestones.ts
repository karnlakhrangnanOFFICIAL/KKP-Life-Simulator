import { ConditionalEvent, PlayerData } from '../engine/types';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function clonePlayer(p: PlayerData): PlayerData {
  return JSON.parse(JSON.stringify(p)) as PlayerData;
}

export class ThaiMilestones {
  /**
   * Checks whether Male Military Conscription (วันตรวจเลือกทหารกองเกิน อายุ 21 ปี)
   * must trigger immediately this year per Blueprint 2.1:
   * Age == 21 AND Sex == MALE AND ROTC_Level < 3 AND !conscription_completed
   */
  static getMandatoryMilestoneEvent(player: PlayerData): ConditionalEvent | null {
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

    return null;
  }
}
