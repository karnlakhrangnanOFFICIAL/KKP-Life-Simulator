import { PoliticsEngine } from '../core/politics_engine';
import { UnderworldEngine } from '../core/underworld_engine';
import { EventChainQueue } from '../events/event_chain_queue';
import { ThaiMilestones } from '../events/thai_milestones';
import { CareerEngine } from './CareerEngine';
import { ConditionalEvent, PlayerData } from './types';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function clonePlayer(p: PlayerData): PlayerData {
  return JSON.parse(JSON.stringify(p)) as PlayerData;
}

function spendOrDebt(player: PlayerData, amount: number): void {
  player.finance.cash -= amount;
  if (player.finance.cash < 0) {
    player.finance.debt += Math.abs(player.finance.cash);
    player.finance.cash = 0;
  }
}

export const CONDITIONAL_EVENTS: ConditionalEvent[] = [
  // ================= PARLIAMENT, 57 PARTIES & COALITION POLITICS =================
  {
    id: 'POLITICS_QUORUM_COLLAPSE_CRISIS',
    title: 'วิกฤตสภาล่ม! พรรคร่วมขู่ถอนตัวก่อนศึกอภิปรายไม่ไว้วางใจ',
    category: 'CRITICAL',
    description:
      'ค่าความขัดแย้งในพรรคร่วมรัฐบาลพุ่งสูง สส. ต่างขั้วเริ่มโดดประชุมจนองค์ประชุมสภาล่มซ้ำซาก หากคุมเสียงไม่อยู่ รัฐบาลอาจล่มกลางคันและต้องประกาศยุบสภา!',
    getWeight: (p) => {
      const pol = p.politics;
      if (
        p.career.prison_years_left > 0 ||
        !pol ||
        !pol.party_number ||
        !pol.coalition_party_numbers.includes(pol.party_number)
      ) {
        return 0;
      }
      const holdsParliamentRole =
        pol.office_role === 'MP' ||
        pol.office_role === 'MINISTER' ||
        pol.office_role === 'PARTY_LEADER' ||
        pol.office_role === 'PRIME_MINISTER';
      if (!holdsParliamentRole) return 0;
      return pol.government_stability <= 52 || pol.friction_index >= 45 ? 58 : 0;
    },
    choices: [
      {
        id: 'whip_negotiate_coalition',
        label: 'เรียกประชุมวิปรัฐบาลด่วน ประนีประนอมโควตางบประมาณพรรคร่วม',
        sublabel: 'ใช้ทักษะเจรจา SOC & INT · ลดความขัดแย้ง -8 · เสถียรภาพรัฐบาล +14%',
        apply: (player) => {
          const next = clonePlayer(player);
          const pol = PoliticsEngine.ensurePoliticsState(next);
          const bonus = next.stats.soc >= 65 || next.stats.int >= 65 ? 6 : 0;
          pol.friction_index = clamp(pol.friction_index - 8, 5, 100);
          pol.government_stability = clamp(pol.government_stability + 14 + bonus, 0, 100);
          pol.party_influence = clamp(pol.party_influence + 5, 0, 100);
          next.stats.san = clamp(next.stats.san - 4, 0, 100);
          return {
            updated: next,
            outcomeText: `เจรจาเคลียร์ใจพรรคร่วมสำเร็จ องค์ประชุมสภากลับมาครบถ้วน (เสถียรภาพรัฐบาล +${
              14 + bonus
            }%, ความขัดแย้ง -8)`,
          };
        },
      },
      {
        id: 'fund_kingmaker_votes',
        label: 'อัดงบประสานงานพื้นที่ 35,000 บาท ดึงเสียงสวรรค์พรรคเล็กช่วยค้ำสภา',
        sublabel: 'หักเงินสด 35,000 บ. · เสถียรภาพรัฐบาล +18% · บารมีในพรรค +7',
        apply: (player) => {
          const next = clonePlayer(player);
          const pol = PoliticsEngine.ensurePoliticsState(next);
          spendOrDebt(next, 35000);
          pol.government_stability = clamp(pol.government_stability + 18, 0, 100);
          pol.party_influence = clamp(pol.party_influence + 7, 0, 100);
          return {
            updated: next,
            outcomeText:
              'เสียงสวรรค์จากพรรคเล็กยกมือหนุนในสภาอย่างพร้อมเพรียง รอดพ้นวิกฤตสภาล่มหวุดหวิด! (เสถียรภาพรัฐบาล +18%)',
          };
        },
      },
      {
        id: 'stand_ideological_ground',
        label: 'ยืนกรานจุดยืนเดิมไม่ยอมแลกผลประโยชน์ แม้เสี่ยงรัฐบาลล่ม!',
        sublabel: 'คะแนนนิยมประชาชน +10 · เสถียรภาพรัฐบาล -24% (หากเหลือ 0% จะยุบสภาทันที)',
        apply: (player) => {
          const next = clonePlayer(player);
          const pol = PoliticsEngine.ensurePoliticsState(next);
          pol.constituency_popularity = clamp(pol.constituency_popularity + 10, 0, 100);
          pol.government_stability = clamp(pol.government_stability - 24, 0, 100);
          next.stats.san = clamp(next.stats.san + 4, 0, 100);
          return {
            updated: next,
            outcomeText:
              'ประชาชนชื่นชมความตรงไปตรงมาของคุณ แต่รอยร้าวในพรรคร่วมรัฐบาลรุนแรงขึ้นอย่างหนัก! (คะแนนนิยมเขต +10, เสถียรภาพรัฐบาล -24%)',
          };
        },
      },
    ],
  },

  {
    id: 'POLITICS_CROSS_AISLE_DEFECTION_DEAL',
    title: 'ดีลลับข้ามขั้ว! แกนนำรัฐบาลส่งเทียบเชิญชวนสลับขั้วร่วม ครม.',
    category: 'CAREER',
    description:
      'ตัวแทนพรรคแกนนำรัฐบาลแอบนัดพบลับๆ เสนอโควตารัฐมนตรีและงบพัฒนาพื้นที่แลกกับการนำเสียง สส. ของพรรคคุณข้ามขั้วไปช่วยเติมเสียงข้างมากเกิน 251 ที่นั่ง',
    getWeight: (p) => {
      const pol = p.politics;
      if (
        p.career.prison_years_left > 0 ||
        !pol ||
        !pol.party_number ||
        pol.coalition_party_numbers.includes(pol.party_number)
      ) {
        return 0;
      }
      return pol.office_role === 'MP' || pol.office_role === 'PARTY_LEADER' ? 36 : 0;
    },
    choices: [
      {
        id: 'accept_cross_aisle_cabinet',
        label: 'ตัดสินใจสลับขั้วเข้าร่วมรัฐบาลผสม เพื่อเข้าไปกุมงบทำงานจริง!',
        sublabel:
          'พรรคเข้าร่วมรัฐบาล + รับงบประสานงาน 60,000 บ. · เสี่ยงฐานเสียงเดิมผิดหวัง (คะแนนนิยมเขต -12)',
        apply: (player) => {
          const next = clonePlayer(player);
          const pol = PoliticsEngine.ensurePoliticsState(next);
          if (pol.party_number && !pol.coalition_party_numbers.includes(pol.party_number)) {
            pol.coalition_party_numbers.push(pol.party_number);
          }
          if (next.age >= 35 && pol.party_influence >= 45) {
            if (pol.office_role !== 'PARTY_LEADER') {
              pol.office_role = 'MINISTER';
            }
            pol.assigned_ministry = pol.assigned_ministry || 'AGRICULTURE';
            pol.terms_as_minister += 1;
            if (pol.party_number) {
              pol.ministry_allocations[pol.assigned_ministry] = pol.party_number;
            }
          }
          next.finance.cash += 60000;
          pol.constituency_popularity = clamp(pol.constituency_popularity - 12, 5, 100);
          pol.switched_bloc_penalty = 12;
          pol.friction_index = clamp(pol.friction_index + 10, 5, 100);
          pol.government_stability = clamp(pol.government_stability + 10, 0, 100);
          return {
            updated: next,
            outcomeText:
              'ประกาศจับมือข้ามขั้วเข้าร่วมรัฐบาลผสม! ได้กุมอำนาจบริหารพร้อมทุนการเมือง +60,000 บาท แม้กระแสโซเชียลฐานเสียงเดิมจะวิจารณ์หนัก (-12 คะแนนนิยมเขต)',
          };
        },
      },
      {
        id: 'expose_deal_in_debate',
        label: 'ปฏิเสธดีลลับและนำหลักฐานขึ้นอภิปรายแฉกลางสภาในฐานะฝ่ายค้าน!',
        sublabel: 'คะแนนนิยมประชาชน +12 · บารมีในพรรค +10 · SOC +6 · สั่นคลอนเสถียรภาพรัฐบาล -12%',
        apply: (player) => {
          const next = clonePlayer(player);
          const pol = PoliticsEngine.ensurePoliticsState(next);
          pol.constituency_popularity = clamp(pol.constituency_popularity + 12, 0, 100);
          pol.party_influence = clamp(pol.party_influence + 10, 0, 100);
          pol.government_stability = clamp(pol.government_stability - 12, 0, 100);
          next.stats.soc = clamp(next.stats.soc + 6, 0, 100);
          next.stats.san = clamp(next.stats.san + 8, 0, 100);
          return {
            updated: next,
            outcomeText:
              'คลิปอภิปรายแฉดีลลับของคุณกลายเป็นไวรัลทั่วประเทศ! ประชาชนยกย่องในจุดยืนผู้แทนที่ไม่ขายเสียง (+12 คะแนนนิยมเขต, +10 บารมีพรรค)',
          };
        },
      },
    ],
  },

  {
    id: 'POLITICS_NATIONAL_ELECTION_EVE',
    title: 'โค้งสุดท้ายก่อนวันหย่อนบัตรเลือกตั้งใหญ่ 500 ที่นั่ง!',
    category: 'MILESTONE_THAI',
    description:
      'ป้ายหาเสียงทั้ง 57 พรรคการเมืองเรียงรายทั่วถนนทุกสาย เหลือเวลาอีกเพียงอึดใจเดียวก่อนศึกเลือกตั้งใหญ่ระดับชาติ คุณจะเลือกยุทธศาสตร์หาเสียงโค้งสุดท้ายแบบใด?',
    getWeight: (p) => {
      const pol = p.politics;
      if (p.career.prison_years_left > 0 || p.age < 24 || !pol || !pol.party_number) {
        return 0;
      }
      const currentYearBE = p.birth_year_be + p.age;
      return pol.next_election_year_be - currentYearBE === 1 ? 65 : 0;
    },
    choices: [
      {
        id: 'digital_debate_wave',
        label: 'ขึ้นเวทีดีเบตประชันวิสัยทัศน์ระดับชาติและปั่นกระแสโซเชียล',
        sublabel: 'ใช้งบสื่อ 12,000 บ. · คะแนนนิยมเขต +14 · INT +3 · SOC +5',
        apply: (player) => {
          const next = clonePlayer(player);
          const pol = PoliticsEngine.ensurePoliticsState(next);
          spendOrDebt(next, 12000);
          pol.constituency_popularity = clamp(pol.constituency_popularity + 14, 0, 100);
          next.stats.int = clamp(next.stats.int + 3, 0, 100);
          next.stats.soc = clamp(next.stats.soc + 5, 0, 100);
          return {
            updated: next,
            outcomeText:
              'ลีลาตอบคำถามบนเวทีดีเบตเฉียบคมจนติดเทรนด์อันดับ 1 กระแสคนรุ่นใหม่และคนเมืองเทคะแนนให้เพียบ! (+14 คะแนนนิยมเขต)',
          };
        },
      },
      {
        id: 'door_to_door_canvassing',
        label: 'ปูพรมเดินเคาะประตูบ้านทุกตรอกซอยและผนึกกำลังบ้านใหญ่ในพื้นที่',
        sublabel: 'ใช้งบลงพื้นที่ 20,000 บ. · คะแนนนิยมเขต +17 · บารมีในพรรค +8',
        apply: (player) => {
          const next = clonePlayer(player);
          const pol = PoliticsEngine.ensurePoliticsState(next);
          spendOrDebt(next, 20000);
          pol.constituency_popularity = clamp(pol.constituency_popularity + 17, 0, 100);
          pol.party_influence = clamp(pol.party_influence + 8, 0, 100);
          return {
            updated: next,
            outcomeText:
              'เข้าถึงชาวบ้านทุกครัวเรือนอย่างใกล้ชิด ฐานเสียงเขตเลือกตั้งแน่นปึ้กพร้อมสู้ศึกวันเข้าคูหา! (+17 คะแนนนิยมเขต, +8 บารมีพรรค)',
          };
        },
      },
      {
        id: 'grassroots_volunteer_campaign',
        label: 'เปิดแคมเปญอาสาสมัครเดินรณรงค์นโยบายแบบประหยัดงบแต่จริงใจ',
        sublabel: 'ไม่เสียเงินสด · คะแนนนิยมเขต +9 · SAN +6',
        apply: (player) => {
          const next = clonePlayer(player);
          const pol = PoliticsEngine.ensurePoliticsState(next);
          pol.constituency_popularity = clamp(pol.constituency_popularity + 9, 0, 100);
          next.stats.san = clamp(next.stats.san + 6, 0, 100);
          return {
            updated: next,
            outcomeText:
              'พลังอาสาสมัครช่วยกันแจกแผ่นพับนโยบายอย่างคึกคัก ได้ใจผู้มีสิทธิเลือกตั้งด้วยความโปร่งใส (+9 คะแนนนิยมเขต, +6 SAN)',
          };
        },
      },
    ],
  },

  // ================= MILITARY & ARMED FORCES DILEMMAS =================
  {
    id: 'MILITARY_BORDER_PATROL_CRISIS',
    title: 'ด่วนที่สุด! หน่วยลาดตระเวนปะทะขบวนการลักลอบขนสิ่งผิดกฎหมายแนวชายแดน!',
    category: 'CRITICAL',
    description:
      'วิทยุสนามแจ้งเหตุฉุกเฉินกลางดึก พบคาราวานสิ่งผิดกฎหมายลักลอบตัดผ่านช่องทางธรรมชาติในเขตรับผิดชอบของคุณ ขณะเดียวกันมีคนกลางแอบติดต่อยื่นซองเงินสดก้อนโตแลกกับการถอนกำลังเปิดทาง',
    getWeight: (p) =>
      p.career.prison_years_left === 0 && CareerEngine.isMilitaryJob(p.career.primary_job)
        ? 34
        : 0,
    choices: [
      {
        id: 'lead_tactical_border_raid',
        label: 'นำชุดปฏิบัติการบุกสกัดกั้นและเข้ายึดของกลางตามยุทธวิธีเต็มกำลัง!',
        sublabel:
          'เสี่ยงบาดเจ็บจากการปะทะ (HP -8 ถึง -14) · ผลงานเกียรติคุณทหาร +15 · เงินรางวัลนำจับสุจริต +45,000 บ. · เลื่อนขั้นรายได้ +1',
        apply: (player) => {
          const next = clonePlayer(player);
          const tacticalScore =
            next.stats.ath * 0.4 + next.stats.int * 0.4 + next.stats.luk * 2;
          if (tacticalScore >= 42) {
            next.stats.hp = clamp(next.stats.hp - 8, 0, 100);
            next.stats.san = clamp(next.stats.san + 12, 0, 100);
            next.stats.soc = clamp(next.stats.soc + 8, 0, 100);
            next.finance.cash += 45000;
            next.career.military_merit = (next.career.military_merit ?? 0) + 15;
            next.career.job_level = Math.min(6, next.career.job_level + 1);
            return {
              updated: next,
              outcomeText:
                'วางแผนโอบล้อมยึดของกลางล็อตใหญ่สำเร็จ! ได้รับเหรียญเชิดชูเกียรติ เงินรางวัลนำจับ +45,000 บาท และขยับขั้นเงินเดือนทันที (+15 ผลงานทหาร)',
            };
          }
          next.stats.hp = clamp(next.stats.hp - 14, 0, 100);
          next.stats.san = clamp(next.stats.san + 6, 0, 100);
          next.finance.cash += 30000;
          next.career.military_merit = (next.career.military_merit ?? 0) + 12;
          return {
            updated: next,
            outcomeText:
              'ปะทะดุเดือดสกัดกั้นขบวนการสำเร็จแม้ได้รับบาดเจ็บถากๆ รับเงินรางวัลปฏิบัติการ +30,000 บาท (+12 ผลงานทหาร, HP -14)',
          };
        },
      },
      {
        id: 'contain_perimeter_call_backup',
        label: 'ตรึงกำลังปิดล้อมตามระเบียบและประสานกำลังเสริมชุดใหญ่เข้าเคลียร์พื้นที่',
        sublabel: 'ปลอดภัยต่อกำลังพล (HP -3) · ผลงานเกียรติคุณทหาร +8 · INT +4 · SAN +5',
        apply: (player) => {
          const next = clonePlayer(player);
          next.stats.hp = clamp(next.stats.hp - 3, 0, 100);
          next.stats.int = clamp(next.stats.int + 4, 0, 100);
          next.stats.san = clamp(next.stats.san + 5, 0, 100);
          next.career.military_merit = (next.career.military_merit ?? 0) + 8;
          return {
            updated: next,
            outcomeText:
              'คุมพื้นที่อย่างรัดกุมไร้กำลังพลสูญเสีย ผู้บังคับบัญชาชมเชยความรอบคอบ (+8 ผลงานทหาร, INT +4)',
          };
        },
      },
      {
        id: 'accept_border_bribe_250k',
        label: 'แอบรับเงินส่วยเปิดทางชายแดน 250,000 บาท แล้วสั่งถอนกำลังเงียบๆ',
        sublabel:
          'รับสด +250,000 บ. · แต่มีโอกาส 40% ถูกข่าวกรอง/จเรทหารจับได้ ถอดยศไล่ออกและจำคุก 4 ปี!',
        apply: (player) => {
          const next = clonePlayer(player);
          if (Math.random() < 0.4) {
            next.career.military_merit = 0;
            UnderworldEngine.incarceratePlayer(next, 4, 0.35);
            return {
              updated: next,
              outcomeText:
                '[คำสั่งถอดยศฟ้าผ่า!] หน่วยข่าวกรองดักฟังหลักฐานรับส่วยชายแดนได้ ศาลทหารพิพากษาถอดยศ ไล่ออกจากราชการ และจำคุก 4 ปี!',
            };
          }
          next.finance.cash += 250000;
          next.career.notoriety = clamp(next.career.notoriety + 22, 0, 100);
          next.stats.san = clamp(next.stats.san - 15, 0, 100);
          return {
            updated: next,
            outcomeText:
              'รับซองเงินร้อน 250,000 บาทแลกกับการหลับตาข้างหนึ่ง แม้รอดพ้นสายตาแต่ความฉาวโฉ่เริ่มสะสมเงียบๆ (Notoriety +22, SAN -15)',
          };
        },
      },
    ],
  },

  {
    id: 'MILITARY_DISASTER_RELIEF_MOBILIZATION',
    title: 'คำสั่งระดมพลด่วน! นำกำลังทหารช่วยชาวบ้านประสบอุทกภัยและดินถล่มครั้งใหญ่',
    category: 'CAREER',
    description:
      'พายุฝนถล่มหนักจนน้ำป่าไหลหลากตัดขาดหมู่บ้านหลายตำบล กองทัพสั่งตั้งศูนย์บรรเทาสาธารณภัยฉุกเฉิน คุณสามารถเลือกบทบาทการนำกำลังพลเข้าช่วยเหลือประชาชนได้',
    getWeight: (p) =>
      p.career.prison_years_left === 0 && CareerEngine.isMilitaryJob(p.career.primary_job)
        ? 36
        : 0,
    choices: [
      {
        id: 'frontline_rescue_boats',
        label: 'อาสานำชุดเรือท้องแบนลุยน้ำเชี่ยวเข้าอพยพผู้สูงอายุและเด็กด้วยตัวเอง',
        sublabel:
          'เหนื่อยกาย HP -6 · ได้ใจชาวบ้านเต็มเปี่ยม SOC +10, SAN +14 · ผลงานเกียรติคุณทหาร +12 · เบี้ยเลี้ยงสนาม +10,000 บ.',
        apply: (player) => {
          const next = clonePlayer(player);
          next.stats.hp = clamp(next.stats.hp - 6, 0, 100);
          next.stats.soc = clamp(next.stats.soc + 10, 0, 100);
          next.stats.san = clamp(next.stats.san + 14, 0, 100);
          next.finance.cash += 10000;
          next.career.military_merit = (next.career.military_merit ?? 0) + 12;
          return {
            updated: next,
            outcomeText:
              'ลุยน้ำช่วยชาวบ้านปลอดภัยครบทุกคน ภาพความทุ่มเทกลายเป็นข่าวชื่นชมทั่วประเทศ! (+12 ผลงานทหาร, SOC +10, SAN +14)',
          };
        },
      },
      {
        id: 'command_bailey_bridge_logistics',
        label: 'บัญชาการศูนย์ส่งกำลังบำรุงและประกอบสะพานเบลีย์เชื่อมเส้นทางเสบียง',
        sublabel:
          'ฝึกทักษะเสนาธิการ INT +7, SOC +6 · ผลงานเกียรติคุณทหาร +10 · เบี้ยเลี้ยง +8,000 บ.',
        apply: (player) => {
          const next = clonePlayer(player);
          next.stats.int = clamp(next.stats.int + 7, 0, 100);
          next.stats.soc = clamp(next.stats.soc + 6, 0, 100);
          next.stats.san = clamp(next.stats.san + 8, 0, 100);
          next.finance.cash += 8000;
          next.career.military_merit = (next.career.military_merit ?? 0) + 10;
          return {
            updated: next,
            outcomeText:
              'วางสะพานเหล็กชั่วคราวเปิดเส้นทางรถพยาบาลสำเร็จทันเวลา แสดงฝีมือระดับเสนาธิการ (+10 ผลงานทหาร, INT +7)',
          };
        },
      },
    ],
  },

  {
    id: 'MILITARY_OCTOBER_RESHUFFLE_POLITICS',
    title: 'คลื่นใต้น้ำฤดูแต่งตั้งโยกย้าย "โผทหารเดือนตุลาคม" และการเมืองในกองทัพ',
    category: 'CAREER',
    description:
      'เข้าสู่ช่วงจัดทำบัญชีรายชื่อแต่งตั้งโยกย้ายนายทหารประจำปี ขั้วอำนาจและรุ่นพี่หลายสายเริ่มขยับตัวชิงเก้าอี้หลัก คุณต้องเลือกจุดยืนในการเดินหมากเส้นทางราชการปีนี้',
    getWeight: (p) =>
      p.career.prison_years_left === 0 &&
      p.age >= 26 &&
      (p.career.primary_job === 'MILITARY_OFFICER' ||
        p.career.primary_job === 'MILITARY_COLONEL' ||
        p.career.primary_job === 'MILITARY_GENERAL')
        ? 38
        : 0,
    choices: [
      {
        id: 'professional_merit_soldier',
        label: 'ยืนหยัดเป็น "ทหารอาชีพ" ยึดผลงานสนามและระเบียบวินัย ไม่อิงขั้วการเมือง',
        sublabel:
          'มั่นคงไร้ศัตรู · ผลงานเกียรติคุณทหาร +10 · INT +4 · SAN +8 (ขยับขั้นรายได้ +1 เมื่อแต้มผลงานสูง)',
        apply: (player) => {
          const next = clonePlayer(player);
          next.career.military_merit = (next.career.military_merit ?? 0) + 10;
          next.stats.int = clamp(next.stats.int + 4, 0, 100);
          next.stats.san = clamp(next.stats.san + 8, 0, 100);
          if ((next.career.military_merit ?? 0) >= 24 && next.career.job_level < 6) {
            next.career.job_level += 1;
            return {
              updated: next,
              outcomeText:
                'ผลงานเป็นที่ประจักษ์จนคณะกรรมการคัดเลือกต้องยอมรับ! ได้ปรับขั้นเงินเดือนขึ้นเป็นระดับ ' +
                next.career.job_level +
                ' อย่างสง่างาม (+10 ผลงานทหาร)',
            };
          }
          return {
            updated: next,
            outcomeText:
              'วางตัวเป็นกลางอย่างมืออาชีพ ผู้ใต้บังคับบัญชาเคารพศรัทธาและสะสมบารมีมั่นคง (+10 ผลงานทหาร, SAN +8)',
          };
        },
      },
      {
        id: 'lobby_senior_alumni_faction',
        label: 'เข้าหาเครือข่ายรุ่นพี่สายอำนาจและจัดเลี้ยงรับรองรุ่น (จ่าย 35,000 บาท)',
        sublabel:
          'SOC +10 · ลุ้นติดโผเลื่อนยศข้ามขั้นสู่นายพัน/นายพลทันทีหากผ่านเกณฑ์ · แต่เสี่ยงแป๊กหากขั้วอำนาจเปลี่ยน!',
        apply: (player) => {
          const next = clonePlayer(player);
          spendOrDebt(next, 35000);
          next.stats.soc = clamp(next.stats.soc + 10, 0, 100);
          const networkWin = next.stats.soc * 0.7 + next.stats.luk * 3 >= 52;
          if (networkWin) {
            next.career.military_merit = (next.career.military_merit ?? 0) + 8;
            const currentJob = CareerEngine.getJobById(next.career.primary_job);
            const promoJob = currentJob?.promotion_job_id
              ? CareerEngine.getJobById(currentJob.promotion_job_id)
              : null;
            if (promoJob && CareerEngine.checkJobRequirements(next, promoJob, false).eligible) {
              next.career.primary_job = promoJob.job_id;
              next.career.job_level = 1;
              next.stats.san = clamp(next.stats.san + 14, 0, 100);
              return {
                updated: next,
                outcomeText: `แรงหนุนรุ่นพี่ดันชื่อทะลุโผตุลาคม! ได้รับโปรดเกล้าฯ เลื่อนตำแหน่งขึ้นเป็น "${promoJob.title}" ทันที! (+14 SAN)`,
              };
            }
            next.career.job_level = Math.min(6, next.career.job_level + 2);
            next.stats.san = clamp(next.stats.san + 10, 0, 100);
            return {
              updated: next,
              outcomeText:
                'คอนเนกชันสายรุ่นพี่หนุนหลังเต็มตัว! ได้ขยับขั้นเงินเดือนพิเศษ 2 ขั้นรวด (+8 ผลงานทหาร, SOC +10)',
            };
          }
          next.stats.san = clamp(next.stats.san - 12, 0, 100);
          next.career.military_merit = Math.max(0, (next.career.military_merit ?? 0) - 4);
          return {
            updated: next,
            outcomeText:
              'ขั้วอำนาจเปลี่ยนกลางคัน! ชื่อหลุดโผถูกโยกไปประจำตำแหน่งผู้ทรงคุณวุฒิชั่วคราว (-35,000 บาท, SAN -12)',
          };
        },
      },
      {
        id: 'expose_unit_procurement_graft',
        label: 'ส่งหลักฐานลับร้องเรียนการหักหัวคิวเบี้ยเลี้ยงและงบจัดซื้อต่อจเรทหาร',
        sublabel:
          'เดิมพันศักดิ์ศรี! สำเร็จ = ได้รับยกย่องระดับกองทัพ (ผลงานทหาร +18, เลื่อนขั้น +1) · พลาด = ถูกเพ่งเล็ง (SAN -14)',
        apply: (player) => {
          const next = clonePlayer(player);
          const whistleSuccess = next.stats.int * 0.6 + next.stats.luk * 4 >= 50;
          if (whistleSuccess) {
            next.career.military_merit = (next.career.military_merit ?? 0) + 18;
            next.career.job_level = Math.min(6, next.career.job_level + 1);
            next.stats.san = clamp(next.stats.san + 16, 0, 100);
            next.stats.soc = clamp(next.stats.soc + 10, 0, 100);
            return {
              updated: next,
              outcomeText:
                'หลักฐานแน่นหนาจนกวาดล้างกลุ่มทุจริตได้ยกแก๊ง! ทหารชั้นผู้น้อยเฮลั่นค่าย คุณได้รับบำเหน็จความชอบพิเศษ (+18 ผลงานทหาร, SAN +16)',
            };
          }
          next.career.military_merit = (next.career.military_merit ?? 0) + 4;
          next.stats.san = clamp(next.stats.san - 14, 0, 100);
          next.stats.soc = clamp(next.stats.soc - 6, 0, 100);
          return {
            updated: next,
            outcomeText:
              'เรื่องเงียบหายเข้ากลีบเมฆพร้อมสายตาเย็นชาจากผู้ใหญ่บางกลุ่ม แม้เหนื่อยใจแต่คุณไม่เสียศักดิ์ศรี (SAN -14)',
          };
        },
      },
    ],
  },

  // ================= SPORTS & ATHLETICS DILEMMAS =================
  {
    id: 'SPORTS_MATCH_FIXING_BRIBE',
    title: 'เซียนพนันแอบส่งคนมาเสนอเงินก้อนโตจ้าง "ล้มมวย / ล้มบอล"!',
    category: 'SPORTS',
    description:
      'คืนก่อนขึ้นสังเวียนนัดชิงชนะเลิศ นายทุนโต๊ะพนันแอบยื่นข้อเสนอเงินสด 200,000 บาท ขอแค่คุณแกล้งพลาดท่าแพ้ในยกตัดสิน จะเลือกศักดิ์ศรีนักกีฬาหรือเงินก้อนลัดฟ้า?',
    getWeight: (p) =>
      p.career.prison_years_left === 0 &&
      (p.career.primary_job === 'MUAY_THAI_FIGHTER' ||
        p.career.primary_job === 'THAI_LEAGUE_PLAYER' ||
        p.career.primary_job === 'NATIONAL_STAR_ATHLETE')
        ? 36
        : 0,
    choices: [
      {
        id: 'reject_bribe_fight_honor',
        label: 'ปฏิเสธเงินสกปรก! สู้สุดใจเพื่อเกียรติยศและแชมป์',
        sublabel: 'ลุ้นคว้าเหรียญแชมป์ + เงินอัดฉีดสุจริต 60,000 บ. · SAN +15, SOC +10',
        apply: (player) => {
          const next = clonePlayer(player);
          const win = Math.random() * 100 <= next.stats.ath * 0.75 + next.stats.luk * 2;
          if (win) {
            next.finance.cash += 60000;
            next.career.championship_medals += 1;
            next.stats.san = clamp(next.stats.san + 15, 0, 100);
            next.stats.soc = clamp(next.stats.soc + 10, 0, 100);
            return {
              updated: next,
              outcomeText:
                'คุณระเบิดฟอร์มคว้าชัยชนะขาวสะอาด! รับถ้วยแชมป์และเงินอัดฉีด 60,000 บาท แฟนกีฬาปรบมือทั้งสนาม (+15 SAN)',
            };
          }
          next.stats.hp = clamp(next.stats.hp - 6, 0, 100);
          next.stats.san = clamp(next.stats.san + 5, 0, 100);
          return {
            updated: next,
            outcomeText:
              'สู้เต็มที่แม้พ่ายแพ้คะแนนอย่างสมศักดิ์ศรี โค้ชและแฟนๆ ชื่นชมหัวใจนักสู้ของคุณ (+5 SAN)',
          };
        },
      },
      {
        id: 'accept_match_fixing_200k',
        label: 'แอบรับเงินใต้โต๊ะ 200,000 บาท แล้วแกล้งออมมือในสนาม',
        sublabel: 'รับสดทันที +200,000 บ. · แต่มีโอกาส 35% ถูกกรรมการจับพิรุธแบนตลอดชีวิตและติดคดี!',
        apply: (player) => {
          const next = clonePlayer(player);
          const caught = Math.random() < 0.35;
          if (caught) {
            UnderworldEngine.incarceratePlayer(next, 2, 0.25);
            return {
              updated: next,
              outcomeText:
                '[ข่าวดังสะเทือนวงการกีฬา!] สมาคมตรวจพบพิรุธการล้มกีฬา สั่งแบนถาวร ยึดเงินของกลาง และดำเนินคดีจำคุก 2 ปี!',
            };
          }
          next.finance.cash += 200000;
          next.career.notoriety = clamp(next.career.notoriety + 20, 0, 100);
          next.stats.san = clamp(next.stats.san - 16, 0, 100);
          return {
            updated: next,
            outcomeText:
              'แกล้งพลาดท่าพ่ายแพ้ตามใบสั่ง รับเงินร้อน 200,000 บาทเข้ากระเป๋าท่ามกลางเสียงโห่ของคนดู (SAN -16)',
          };
        },
      },
    ],
  },

  {
    id: 'SPORTS_ACL_INJURY_CRISIS',
    title: 'อุบัติเหตุเอ็นเข่าฉีกขาดกลางสนามแข่งขัน (ACL Injury)!',
    category: 'SPORTS',
    description:
      'จังหวะปะทะหนักทำให้หัวเข่าบิดอย่างรุนแรง แพทย์กีฬาเตือนว่าหากไม่ผ่าตัดส่องกล้องและทำกายภาพเต็มรูปแบบ ทักษะกีฬาของคุณจะลดฮวบถาวร',
    getWeight: (p) =>
      p.career.prison_years_left === 0 &&
      (p.career.primary_job === 'MUAY_THAI_FIGHTER' ||
        p.career.primary_job === 'THAI_LEAGUE_PLAYER' ||
        p.career.primary_job === 'NATIONAL_STAR_ATHLETE')
        ? 24
        : 0,
    choices: [
      {
        id: 'sports_medicine_surgery',
        label: 'ผ่าตัดเวชศาสตร์การกีฬาชั้นนำ (จ่าย 65,000 บาท)',
        sublabel: 'รักษาทักษะ ATH ไว้ครบถ้วน · ฟื้นตัวไว HP +5',
        apply: (player) => {
          const next = clonePlayer(player);
          spendOrDebt(next, 65000);
          next.stats.hp = clamp(next.stats.hp + 5, 0, 100);
          return {
            updated: next,
            outcomeText: 'ผ่าตัดและฟื้นฟูกล้ามเนื้อสำเร็จ กลับมาลงสนามได้เต็มร้อยอีกครั้ง (-65,000 บาท)',
          };
        },
      },
      {
        id: 'cheap_splint_rest',
        label: 'ประคบเย็นใส่เฝือกอ่อนพักเอง ประหยัดค่ารักษา',
        sublabel: 'ไม่เสียเงินก้อน · แต่ทักษะกีฬา ATH ลดลง -18 ถาวร และ HP -12!',
        apply: (player) => {
          const next = clonePlayer(player);
          next.stats.ath = clamp(next.stats.ath - 18, 0, 100);
          next.stats.hp = clamp(next.stats.hp - 12, 0, 100);
          next.stats.san = clamp(next.stats.san - 10, 0, 100);
          return {
            updated: next,
            outcomeText:
              'ข้อเข่าไม่เหมือนเดิมอีกต่อไป ความเร็วและพลังลดลงอย่างชัดเจน (ATH -18, HP -12)',
          };
        },
      },
    ],
  },

  {
    id: 'YOUTH_SPORTS_SCOUT',
    title: 'โค้ชแมวมองสโมสรเห็นแววพรสวรรค์ด้านกีฬาของคุณ!',
    category: 'SPORTS',
    description:
      'ระหว่างแข่งกีฬาระดับเขต แมวมองจากค่ายกีฬาอาชีพเข้ามาชวนคุณไปทดสอบฝีเท้าและมอบทุนฝึกซ้อม',
    getWeight: (p) =>
      p.age >= 12 && p.age <= 19 && p.stats.ath >= 48 && p.career.prison_years_left === 0
        ? 38
        : 0,
    choices: [
      {
        id: 'join_trial_camp',
        label: 'ตอบรับเข้าแคมป์ทดสอบฝีมือทันที!',
        sublabel: 'ATH +12 · SOC +6 · รับเบี้ยเลี้ยงทุนนักกีฬา +15,000 บาท',
        apply: (player) => {
          const next = clonePlayer(player);
          next.stats.ath = clamp(next.stats.ath + 12, 0, 100);
          next.stats.soc = clamp(next.stats.soc + 6, 0, 100);
          next.finance.cash += 15000;
          return {
            updated: next,
            outcomeText:
              'ผ่านการคัดเลือกเยาวชนช้างเผือก! ได้รับเบี้ยเลี้ยง 15,000 บาท และทักษะกีฬาพุ่งกระฉูด (+12 ATH)',
          };
        },
      },
      {
        id: 'decline_focus_books',
        label: 'ปฏิเสธโค้ช ขอโฟกัสการเรียนสายวิชาการเป็นหลัก',
        sublabel: 'INT +6',
        apply: (player) => {
          const next = clonePlayer(player);
          next.stats.int = clamp(next.stats.int + 6, 0, 100);
          return {
            updated: next,
            outcomeText: 'เลือกเดินสายตำราเรียนอย่างมุ่งมั่น (+6 INT)',
          };
        },
      },
    ],
  },

  // ================= UNDERWORLD, SAFEHOUSE & PRISON EVENTS =================
  {
    id: 'UNDERWORLD_POLICE_SHAKEDOWN',
    title: 'ข่าววงในรั่วไหล! ชุดเฉพาะกิจเตรียมบุกค้นจุดพักงานสีเทา',
    category: 'UNDERWORLD',
    description:
      'สายข่าวแจ้งเตือนด่วนว่าชื่อของคุณอยู่ในแฟ้มสืบสวนของเจ้าหน้าที่ ต้องตัดสินใจเด็ดขาดก่อนโดนรวบตัว!',
    getWeight: (p) =>
      p.career.prison_years_left === 0 && p.career.notoriety >= 30 ? 42 : 0,
    choices: [
      {
        id: 'pay_hush_lawyer_80k',
        label: 'จ่ายเงินเคลียร์ทางและจ้างทนายทำลายหลักฐาน (80,000 บาท)',
        sublabel: 'ลดระดับหมายจับ Notoriety -25 · รอดพ้นการถูกจับกุมรอบนี้',
        apply: (player) => {
          const next = clonePlayer(player);
          if (next.finance.cash >= 80000) {
            next.finance.cash -= 80000;
            next.career.notoriety = Math.max(0, next.career.notoriety - 25);
            return {
              updated: next,
              outcomeText:
                'ใช้เงินแก้ปัญหาเคลียร์ร่องรอยทันเวลา ระดับหมายจับลดลง (-80,000 บาท, Notoriety -25)',
            };
          }
          UnderworldEngine.incarceratePlayer(next, 3, 0.35);
          return {
            updated: next,
            outcomeText:
              'เงินสดไม่พอจ่ายค่าเคลียร์ทาง! เจ้าหน้าที่บุกรวบตัวคาที่ ศาลตัดสินจำคุก 3 ปี!',
          };
        },
      },
      {
        id: 'retreat_to_safehouse',
        label: 'หักซิมทิ้งแล้วหลบเข้าแหล่งกบดานเพื่อพรางตัว!',
        sublabel:
          'ไม่เสียเงิน · หากมีแหล่งกบดานที่มีความลับสูงจะมีโอกาสรอดเกือบ 100% มิฉะนั้นต้องวัดดวง!',
        apply: (player) => {
          const next = clonePlayer(player);
          const { shieldPct, safehouse } = UnderworldEngine.getEffectiveSafehouseShield(next);
          const escapeChance = 38 + shieldPct * 1.6 + next.stats.luk * 3;
          const escaped = Math.random() * 100 < escapeChance;
          if (escaped) {
            next.career.notoriety = Math.max(5, next.career.notoriety - (safehouse ? 18 : 10));
            if (safehouse) {
              next.career.safehouse_security = clamp(next.career.safehouse_security - 12, 0, 100);
            } else {
              next.stats.san = clamp(next.stats.san - 10, 0, 100);
            }
            return {
              updated: next,
              outcomeText: safehouse
                ? `หลบเข้าซ่อนตัวใน "${safehouse.name}" ทันเวลา! ตำรวจบุกค้นจุดเก่าคว้าน้ำเหลว (Notoriety -18)`
                : 'หนีรอดหวุดหวิดไปกบดานเงียบๆ จนเรื่องซาลง (SAN -10)',
            };
          }
          UnderworldEngine.incarceratePlayer(next, 3, 0.35);
          return {
            updated: next,
            outcomeText: 'หนีไม่พ้นด่านตรวจสกัดเพราะไร้เซฟเฮาส์คุ้มกัน! ถูกควบคุมตัวดำเนินคดีจำคุก 3 ปี',
          };
        },
      },
    ],
  },

  {
    id: 'SAFEHOUSE_POLICE_PINPOINT',
    title: 'โดรนสอดแนมตำรวจเริ่มบินวนใกล้พิกัดแหล่งกบดาน!',
    category: 'UNDERWORLD',
    description:
      'บอดี้การ์ดและกล้องวงจรปิดตรวจพบรถตู้ต้องสงสัยจอดซุ่มดูลาดเลาหน้าทางเข้าเซฟเฮาส์ ความลับของแหล่งกบดานกำลังรั่วไหล!',
    getWeight: (p) =>
      p.career.prison_years_left === 0 &&
      Boolean(p.career.safehouse_id) &&
      p.career.safehouse_security <= 55 &&
      p.career.notoriety >= 35
        ? 44
        : 0,
    choices: [
      {
        id: 'emergency_burn_and_relocate',
        label: 'เผาทำลายเอกสารและทุ่มงบย้ายพิกัดเซฟเฮาส์ด่วน (45,000 บาท)',
        sublabel: 'รีเซ็ตความลับแหล่งกบดานเต็ม 100% · ลด Notoriety -20',
        apply: (player) => {
          const next = clonePlayer(player);
          spendOrDebt(next, 45000);
          next.career.safehouse_security = 100;
          next.career.notoriety = Math.max(0, next.career.notoriety - 20);
          return {
            updated: next,
            outcomeText:
              'ย้ายฐานกบดานไปพิกัดสำรองอย่างแนบเนียน ตำรวจบุกมาเจอเพียงห้องว่างเปล่า! (ความลับกบดาน 100%, Notoriety -20)',
          };
        },
      },
      {
        id: 'abandon_safehouse_escape',
        label: 'สละแหล่งกบดานทันที แล้วหนีออกทางลับตัวเปล่า!',
        sublabel: 'รอดพ้นการถูกจับกุม 100% โดยไม่เสียเงิน · แต่สูญเสียแหล่งกบดานปัจจุบัน',
        apply: (player) => {
          const next = clonePlayer(player);
          const old = UnderworldEngine.getSafehouseById(next.career.safehouse_id);
          next.career.safehouse_id = null;
          next.career.safehouse_security = 0;
          next.career.notoriety = Math.max(10, next.career.notoriety - 10);
          return {
            updated: next,
            outcomeText: `มุดทางลับหนีออกจาก "${old?.name || 'แหล่งกบดาน'}" ได้ฉิวเฉียด รอดคุกแต่ต้องหาเซฟเฮาส์แห่งใหม่!`,
          };
        },
      },
    ],
  },

  {
    id: 'MAFIA_TURF_WAR_CONFLICT',
    title: 'แก๊งอริต่างถิ่นบุกรุกแย่งชิงเขตอิทธิพลสายมืด!',
    category: 'UNDERWORLD',
    description:
      'ซุ้มคู่อริเริ่มส่งเด็กเดินงานและนักเลงเข้ามาตัดราคาแย่งลูกค้าในเขตของคุณ ขาใหญ่ในเครือข่ายรอดูท่าทีว่าคุณจะจัดการอย่างไร',
    getWeight: (p) =>
      p.career.prison_years_left === 0 &&
      (p.career.primary_job === 'STREET_DRUG_COURIER' ||
        p.career.primary_job === 'SYNDICATE_ENFORCER' ||
        p.career.primary_job === 'SYNDICATE_BOSS' ||
        p.career.primary_job === 'MAFIA_KINGPIN')
        ? 38
        : 0,
    choices: [
      {
        id: 'turf_showdown_force',
        label: 'นำทีมสมุนบุกประกาศศักดายึดพื้นที่คืน!',
        sublabel: 'ใช้ค่า ATH & SOC · ชนะกวาดเงินส่วนแบ่ง +140,000 บ. และบารมี SOC +10 (แต่ Notoriety +16)',
        apply: (player) => {
          const next = clonePlayer(player);
          const power = next.stats.ath * 0.6 + next.stats.soc * 0.5 + next.stats.luk * 2;
          if (power >= 68) {
            next.finance.cash += 140000;
            next.stats.soc = clamp(next.stats.soc + 10, 0, 100);
            next.career.notoriety = clamp(next.career.notoriety + 16, 0, 100);
            return {
              updated: next,
              outcomeText:
                'ยึดพื้นที่สีเทาคืนได้เบ็ดเสร็จ! กวาดส่วนแบ่งก้อนโต +140,000 บาท บารมีในวงการพุ่งกระฉูด (+10 SOC, Notoriety +16)',
            };
          }
          next.stats.hp = clamp(next.stats.hp - 18, 0, 100);
          next.career.notoriety = clamp(next.career.notoriety + 14, 0, 100);
          return {
            updated: next,
            outcomeText:
              'ปะทะเดือดบาดเจ็บสาหัสก่อนตำรวจสายตรวจจะเปิดไซเรนมาถึง ต้องล่าถอยกลับเซฟเฮาส์ (HP -18, Notoriety +14)',
          };
        },
      },
      {
        id: 'turf_diplomacy_split',
        label: 'ตั้งโต๊ะเจรจาแบ่งเขตหากินอย่างมีชั้นเชิง',
        sublabel: 'ใช้ไหวพริบ INT >= 52 · รับส่วนแบ่งเงียบๆ +65,000 บ. โดยไม่เพิ่มระดับหมายจับ!',
        apply: (player) => {
          const next = clonePlayer(player);
          if (next.stats.int >= 52) {
            next.finance.cash += 65000;
            next.stats.soc = clamp(next.stats.soc + 6, 0, 100);
            return {
              updated: next,
              outcomeText:
                'เจรจาปักปันเขตอิทธิพลลงตัวทั้งสองฝ่าย รับเงินส่วนแบ่ง +65,000 บาทแบบไร้เสียงปืนและไม่เป็นข่าว (+6 SOC)',
            };
          }
          next.stats.soc = clamp(next.stats.soc - 6, 0, 100);
          return {
            updated: next,
            outcomeText: 'อีกฝ่ายรู้ทันเชิงเจรจา ต้องยอมถอยร่นเสียส่วนแบ่งพื้นที่บางส่วน (SOC -6)',
          };
        },
      },
    ],
  },

  {
    id: 'PRISON_ROYAL_PARDON_OR_BRAWL',
    title: 'เหตุการณ์ไม่คาดฝันหลังกำแพงเรือนจำ',
    category: 'UNDERWORLD',
    description:
      'ภายในแดนขังเกิดความตึงเครียดระหว่างกลุ่มขาใหญ่ ขณะเดียวกันทางเรือนจำกำลังประเมินรายชื่อผู้ต้องขังชั้นดีเพื่อลดวันต้องโทษ',
    getWeight: (p) => (p.career.prison_years_left > 0 ? 75 : 0),
    choices: [
      {
        id: 'model_inmate_peace',
        label: 'สงบเสงี่ยม ช่วยงานโรงฝึกอาชีพเรือนจำเพื่อขอเป็นนักโทษชั้นเยี่ยม',
        sublabel: 'โอกาสลดโทษจำคุกลง 1 ปีทันที! · INT +4',
        apply: (player) => {
          const next = clonePlayer(player);
          next.stats.int = clamp(next.stats.int + 4, 0, 100);
          if (Math.random() < 0.65 && next.career.prison_years_left > 1) {
            next.career.prison_years_left -= 1;
            next.stats.san = clamp(next.stats.san + 10, 0, 100);
            return {
              updated: next,
              outcomeText:
                'ได้รับการเลื่อนชั้นเป็นนักโทษชั้นเยี่ยม ลดวันต้องโทษลง 1 ปี! (+10 SAN)',
            };
          }
          return {
            updated: next,
            outcomeText: 'ประพฤติตัวเรียบร้อยผ่านพ้นปีในเรือนจำอย่างปลอดภัย (+4 INT)',
          };
        },
      },
      {
        id: 'stand_ground_gang',
        label: 'เปิดศึกวัดใจขาใหญ่ประจำแดนเพื่อสร้างบารมี!',
        sublabel: 'ใช้ค่า ATH · ชนะได้คอนเนกชันสายมืด SOC +12 · แพ้บาดเจ็บหนักและบวกโทษเพิ่ม!',
        apply: (player) => {
          const next = clonePlayer(player);
          if (next.stats.ath >= 60) {
            next.stats.soc = clamp(next.stats.soc + 12, 0, 100);
            next.stats.san = clamp(next.stats.san + 6, 0, 100);
            return {
              updated: next,
              outcomeText:
                'ล้มขาใหญ่ประจำแดนได้ด้วยทักษะการต่อสู้! คนในแดนให้ความยำเกรง ได้เครือข่ายสายมืดเพียบ (+12 SOC)',
            };
          }
          next.stats.hp = clamp(next.stats.hp - 20, 0, 100);
          next.career.prison_years_left += 1;
          return {
            updated: next,
            outcomeText:
              'พลาดท่าโดนรุมสะบักสะบอมแถมถูกผู้คุมสั่งขังเดี่ยว บวกโทษจำคุกเพิ่มอีก 1 ปี! (HP -20)',
          };
        },
      },
    ],
  },

  // ================= EXISTING CORE LIFE & CHAIN EVENTS =================
  {
    id: 'HOSPITAL_CRITICAL',
    title: 'ร่างกายทรุดหนัก หามส่งห้องฉุกเฉิน!',
    category: 'CRITICAL',
    description:
      'สุขภาพกายของคุณอ่อนล้าสะสมจนล้มพับกลางวันแสกๆ แพทย์วินิจฉัยว่าต้องพักรักษาตัวด่วน มิฉะนั้นอาจเกิดภาวะแทรกซ้อนเรื้อรังในอนาคต',
    getWeight: (p) => (p.stats.hp < 30 && p.career.prison_years_left === 0 ? 80 : 0),
    choices: [
      {
        id: 'private_care',
        label: 'แอดมิทโรงพยาบาลเอกชน (จ่าย 25,000 บาท)',
        sublabel: 'ฟื้นฟู HP +30 ทันที · ปลอดภัยไร้ผลข้างเคียงระยะยาว',
        apply: (player) => {
          const next = clonePlayer(player);
          spendOrDebt(next, 25000);
          next.stats.hp = clamp(next.stats.hp + 30, 0, 100);
          next.stats.san = clamp(next.stats.san + 4, 0, 100);
          return {
            updated: next,
            outcomeText: 'ได้รับการรักษาอย่างดีเยี่ยม ฟื้นตัวเต็มที่ (HP +30, -25,000 บาท)',
          };
        },
      },
      {
        id: 'gold_card_ward',
        label: 'ใช้สิทธิบัตรทอง 30 บาท / สวัสดิการราชการ',
        sublabel: 'ประหยัดค่ารักษา · ฟื้นฟู HP +16',
        apply: (player) => {
          const next = clonePlayer(player);
          const isGov = CareerEngine.isGovernmentJob(next.career.primary_job);
          spendOrDebt(next, isGov ? 0 : 30);
          next.stats.hp = clamp(next.stats.hp + 16, 0, 100);
          next.stats.san = clamp(next.stats.san - (isGov ? 0 : 4), 0, 100);
          return {
            updated: next,
            outcomeText: isGov
              ? 'เบิกสวัสดิการข้าราชการรักษาฟรีจนอาการปลอดภัย (HP +16)'
              : 'ใช้สิทธิบัตรทองรักษาจนพ้นขีดอันตราย (HP +16, SAN -4)',
          };
        },
      },
      {
        id: 'ignore_symptoms_chain',
        label: 'ฝืนกินยาแก้ปวดแล้วกลับไปลุยงานต่อ',
        sublabel: 'ไม่เสียเงินวันนี้ · แต่ก่อชนวนโรคเรื้อรังในอีก 3 ปีข้างหน้า!',
        apply: (player) => {
          const next = clonePlayer(player);
          next.stats.hp = clamp(next.stats.hp - 5, 0, 100);
          EventChainQueue.scheduleChainEvent(next, {
            queue_id: `CHRONIC_NEGLECT_${next.age}`,
            trigger_age: next.age + 3,
            event_chain_id: 'CHRONIC_NEGLECT_FLARE',
            title: 'อาการป่วยเรื้อรังที่เคยปล่อยปละละเลยกำเริบหนัก',
            payload: {},
          });
          return {
            updated: next,
            outcomeText:
              'ฝืนร่างกายกลับไปทำงาน อาการเหมือนจะทุเลาลงชั่วคราว แต่ระเบิดเวลาสุขภาพกำลังนับถอยหลัง...',
          };
        },
      },
    ],
  },

  {
    id: 'SEVERE_MENTAL_CRISIS',
    title: 'ภาวะเครียดสะสมขั้นวิกฤต จิตใจใกล้ถึงจุดแตกหัก!',
    category: 'CRITICAL',
    description:
      'แรงกดดันจากภาระชีวิตรุมเร้าจนคุณนอนไม่หลับติดต่อกันหลายสัปดาห์และเกิดอาการแพนิกเฉียบพลัน จำเป็นต้องหยุดพักฟื้นฟูสภาพจิตใจอย่างเร่งด่วน',
    getWeight: (p) => (p.stats.san < 25 && p.career.prison_years_left === 0 ? 80 : 0),
    choices: [
      {
        id: 'psychiatric_therapy_care',
        label: 'พบจิตแพทย์และเข้าคอร์สบำบัดฟื้นฟูจิตใจ (จ่าย 12,000 บาท)',
        sublabel: 'ฟื้นฟู SAN +28 ทันที · ปลดภาวะไฟมอด (Burnout)',
        apply: (player) => {
          const next = clonePlayer(player);
          spendOrDebt(next, 12000);
          next.stats.san = clamp(next.stats.san + 28, 0, 100);
          next.flags.is_burnout = false;
          return {
            updated: next,
            outcomeText:
              'ได้รับการดูแลจากผู้เชี่ยวชาญจนสภาพจิตใจกลับมาเข้มแข็งอีกครั้ง (SAN +28, -12,000 บาท)',
          };
        },
      },
      {
        id: 'mental_health_hotline_retreat',
        label: 'โทรปรึกษาสายด่วนสุขภาพจิต 1323 และลางานกลับไปพักใจกับครอบครัว',
        sublabel: 'ไม่มีค่าใช้จ่าย · ฟื้นฟู SAN +16 · HP +4',
        apply: (player) => {
          const next = clonePlayer(player);
          next.stats.san = clamp(next.stats.san + 16, 0, 100);
          next.stats.hp = clamp(next.stats.hp + 4, 0, 100);
          return {
            updated: next,
            outcomeText:
              'ได้ระบายความอัดอั้นและพักผ่อนเต็มอิ่ม ความมืดมนในใจค่อยๆ คลายลง (SAN +16, HP +4)',
          };
        },
      },
    ],
  },

  {
    id: 'FRIEND_BORROW_MONEY_REQUEST',
    title: 'เพื่อนสนิทสมัยเรียนโทรมาขอยืมเงินด่วน 20,000 บาท!',
    category: 'ECONOMY',
    description:
      'เพื่อนเก่าโทรมาด้วยน้ำเสียงร้อนรน บอกว่าหมุนเงินธุรกิจไม่ทัน ขอยืมเงินสด 20,000 บาท สัญญาว่าจะคืนพร้อมดอกเบี้ยในอีก 3 ปีข้างหน้า',
    getWeight: (p) =>
      p.career.prison_years_left === 0 &&
      p.age >= 20 &&
      p.finance.cash >= 25000 &&
      !p.event_queue.some((q) => q.event_chain_id === 'FRIEND_LOAN_RESOLVE')
        ? 24
        : 0,
    choices: [
      {
        id: 'lend_20k_chain',
        label: 'ตัดสินใจโอนให้เพื่อนยืม 20,000 บาท (รอลุ้นผลในอีก 3 ปี)',
        sublabel: 'หักเงินสด 20,000 บ. · SOC +6 · ตั้งเวลา Event Chain ตอนอายุ +3 ปี',
        apply: (player) => {
          const next = clonePlayer(player);
          next.finance.cash -= 20000;
          next.stats.soc = clamp(next.stats.soc + 6, 0, 100);
          const loyaltyScore = Math.floor(Math.random() * 45) + 30;
          EventChainQueue.scheduleChainEvent(next, {
            queue_id: `PENDING_LOAN_TO_FRIEND_${next.age}`,
            trigger_age: next.age + 3,
            event_chain_id: 'FRIEND_LOAN_RESOLVE',
            title: 'ครบกำหนดนัดคืนเงินของเพื่อนสนิท',
            payload: {
              amount_borrowed: 20000,
              friend_loyalty_score: loyaltyScore,
            },
          });
          return {
            updated: next,
            outcomeText: `โอนเงินให้เพื่อนยืม 20,000 บาท (+6 SOC) — ระบบบันทึกนัดชำระคืนไว้เมื่อคุณอายุ ${
              next.age + 3
            } ปี`,
          };
        },
      },
      {
        id: 'decline_loan_polite',
        label: 'ปฏิเสธอย่างสุภาพ บอกว่าต้องสำรองเงินไว้ใช้จ่ายเอง',
        sublabel: 'เงินสดปลอดภัย · เสียเพื่อนเล็กน้อย SOC -4',
        apply: (player) => {
          const next = clonePlayer(player);
          next.stats.soc = clamp(next.stats.soc - 4, 0, 100);
          return {
            updated: next,
            outcomeText: 'รักษาเงินสดในกระเป๋าไว้ได้ แม้เพื่อนจะตึงๆ ใส่ไปบ้าง (SOC -4)',
          };
        },
      },
    ],
  },

  {
    id: 'LOAN_SHARK_THREAT',
    title: 'เจ้าหนี้ตามทวงหนี้ถึงหน้าบ้าน!',
    category: 'CRITICAL',
    description:
      'ยอดหนี้สะสมนอกระบบของคุณพุ่งเกินหลักแสน เจ้าหนี้ส่งคนมาติดตามทวงถามอย่างหนักหน่วง สร้างความกดดันต่อสภาพจิตใจอย่างรุนแรง',
    getWeight: (p) =>
      p.career.prison_years_left === 0 && p.finance.debt > 100000 ? 70 : 0,
    choices: [
      {
        id: 'negotiate_restructure',
        label: 'เจรจาขอปรับโครงสร้างหนี้และทยอยจ่ายขั้นต่ำ',
        sublabel: 'ใช้ทักษะเจรจา SOC · ลดความตึงเครียดเฉพาะหน้า',
        apply: (player) => {
          const next = clonePlayer(player);
          const payAmount = Math.min(next.finance.cash, 15000);
          next.finance.cash -= payAmount;
          next.finance.debt = Math.max(0, next.finance.debt - payAmount);
          if (next.stats.soc >= 55) {
            next.finance.debt = Math.round(next.finance.debt * 0.94);
            next.stats.san = clamp(next.stats.san - 4, 0, 100);
            return {
              updated: next,
              outcomeText: `เจรจาประนอมหนี้สำเร็จ เจ้าหนี้ยอมลดเบี้ยปรับให้บางส่วน (ชำระไป ${payAmount.toLocaleString()} บาท)`,
            };
          }
          next.stats.san = clamp(next.stats.san - 12, 0, 100);
          return {
            updated: next,
            outcomeText: 'เจ้าหนี้ยอมผ่อนผันชั่วคราวแต่ขู่สำทับหนัก (SAN -12)',
          };
        },
      },
      {
        id: 'work_for_loan_shark',
        label: 'ไม่มีเงินจ่าย! ยอมทำงานเป็นเด็กเดินของ-เดินโพยขัดดอกให้เจ้าหนี้',
        sublabel: 'ล้างหนี้ให้ 40,000 บาททันที · ก้าวเข้าสู่ Career Path สายมืด!',
        apply: (player) => {
          const next = clonePlayer(player);
          next.finance.debt = Math.max(0, next.finance.debt - 40000);
          next.career.notoriety = clamp(next.career.notoriety + 15, 0, 100);
          if (!next.career.primary_job && next.age >= 14) {
            next.career.primary_job = 'STREET_DRUG_COURIER';
          }
          next.stats.san = clamp(next.stats.san - 10, 0, 100);
          return {
            updated: next,
            outcomeText:
              'จำใจรับงานเด็กเดินของสีเทาขัดดอกให้เจ้าหนี้ หนี้ลดลง 40,000 บาท แต่ถลำลึกเข้าสู่โลกใต้ดินเต็มตัว (Notoriety +15)',
          };
        },
      },
    ],
  },

  {
    id: 'SCOUTED_BY_LABEL',
    title: 'แมวมองค่ายเพลงดังมานั่งฟังคุณร้องสด!',
    category: 'CAREER',
    description:
      'คลิปการร้องเพลงกลางคืนของคุณกลายเป็นไวรัลในโซเชียล โปรดิวเซอร์ค่ายเพลงเข้ามาติดต่อชวนเซ็นสัญญาเป็นศิลปินเต็มตัว',
    getWeight: (p) =>
      p.career.prison_years_left === 0 &&
      (p.career.primary_job === 'FREELANCE_VOCALIST' ||
        p.career.side_job === 'FREELANCE_VOCALIST') &&
      p.stats.soc > 70
        ? 35
        : 0,
    choices: [
      {
        id: 'sign_contract',
        label: 'เซ็นสัญญาเปิดตัวเป็นศิลปินสังกัดค่าย!',
        sublabel: 'เลื่อนขั้นสู่อาชีพศิลปินชื่อดัง + เงินขวัญถุง 50,000 บาท',
        apply: (player) => {
          const next = clonePlayer(player);
          next.career.primary_job = 'FAMOUS_ARTIST';
          if (next.career.side_job === 'FREELANCE_VOCALIST') {
            next.career.side_job = null;
          }
          next.career.job_level = 1;
          next.finance.cash += 50000;
          next.stats.san = clamp(next.stats.san + 18, 0, 100);
          next.stats.soc = clamp(next.stats.soc + 10, 0, 100);
          return {
            updated: next,
            outcomeText: 'ก้าวสู่เส้นทางศิลปินอาชีพเต็มตัว! รับเงินเซ็นสัญญา 50,000 บาท (SAN +18)',
          };
        },
      },
      {
        id: 'stay_indie',
        label: 'ปฏิเสธค่าย ขอทำช่องเพลงอินดี้ของตัวเอง',
        sublabel: 'รับรายได้สปอนเซอร์ 25,000 บาท · รักษาอิสระเดิมไว้',
        apply: (player) => {
          const next = clonePlayer(player);
          next.finance.cash += 25000;
          next.stats.soc = clamp(next.stats.soc + 6, 0, 100);
          next.stats.san = clamp(next.stats.san + 10, 0, 100);
          return {
            updated: next,
            outcomeText: 'ยอดผู้ติดตามพุ่งสูง รับงานรีวิวและร้องเพลงอิสระสบายใจ (+25,000 บาท)',
          };
        },
      },
    ],
  },

  {
    id: 'MARRIAGE_OPPORTUNITY',
    title: 'ความรักสุกงอม คนรักชวนวางแผนสร้างครอบครัว',
    category: 'FAMILY',
    description:
      'คุณคบหาดูใจกับคนรักที่เข้าใจกันมาพักใหญ่ ถึงเวลาตัดสินใจว่าจะก้าวสู่ชีวิตคู่เพื่อเปิดทางสู่การมีทายาทสืบสกุลหรือไม่',
    getWeight: (p) =>
      p.career.prison_years_left === 0 &&
      !p.flags.is_married &&
      p.age >= 23 &&
      p.age <= 45 &&
      p.stats.soc >= 42
        ? 22
        : 0,
    choices: [
      {
        id: 'marry_modest',
        label: 'จัดงานแต่งงานเรียบง่ายอบอุ่น (ค่าใช้จ่าย 40,000 บาท)',
        sublabel: 'สถานะแต่งงาน · SAN +20 · ปลดล็อกโอกาสมีบุตรสืบทอดมรดก (Legacy)',
        apply: (player) => {
          const next = clonePlayer(player);
          spendOrDebt(next, 40000);
          next.flags.is_married = true;
          next.stats.san = clamp(next.stats.san + 20, 0, 100);
          next.stats.soc = clamp(next.stats.soc + 6, 0, 100);
          return {
            updated: next,
            outcomeText: 'เริ่มต้นชีวิตคู่อย่างอบอุ่น มีกำลังใจสำคัญในทุกเช้าวันใหม่ (SAN +20)',
          };
        },
      },
      {
        id: 'postpone_marriage',
        label: 'ขอเลื่อนไปก่อน อยากเก็บเงินสร้างตัวให้มั่นคงกว่านี้',
        sublabel: 'ไม่เสียเงินก้อน · SAN -5',
        apply: (player) => {
          const next = clonePlayer(player);
          next.stats.san = clamp(next.stats.san - 5, 0, 100);
          return {
            updated: next,
            outcomeText: 'ตกลงชะลอแผนแต่งงานออกไปก่อนเพื่อความมั่นคงทางการเงิน (SAN -5)',
          };
        },
      },
    ],
  },

  {
    id: 'NEWBORN_CHILD',
    title: 'ข่าวดีของครอบครัว! ทายาทตัวน้อยลืมตาดูโลก',
    category: 'FAMILY',
    description:
      'ครอบครัวของคุณมีทายาทเพิ่มขึ้นมา! เมื่อคุณจากโลกนี้ไป คุณจะสามารถเลือกสืบทอดมรดกและเล่นต่อในฐานะ "รุ่นลูก (Gen ถัดไป)" ได้',
    getWeight: (p) =>
      p.career.prison_years_left === 0 &&
      p.flags.is_married &&
      !p.flags.has_children &&
      p.age >= 24 &&
      p.age <= 48
        ? 30
        : 0,
    choices: [
      {
        id: 'welcome_baby',
        label: 'ฝากครรภ์และเตรียมต้อนรับลูกน้อยอย่างอบอุ่น (15,000 บาท)',
        sublabel: 'มีบุตร (ปลดล็อกระบบสืบทอดทายาทรุ่นต่อไป!) · SAN +18',
        apply: (player) => {
          const next = clonePlayer(player);
          spendOrDebt(next, 15000);
          next.flags.has_children = true;
          next.stats.san = clamp(next.stats.san + 18, 0, 100);
          return {
            updated: next,
            outcomeText:
              'ต้อนรับทายาทตัวน้อยสู่ตระกูล! ระบบสืบทอดมรดกรุ่นสู่รุ่น (Generational Legacy) ถูกเปิดใช้งานแล้ว (+18 SAN)',
          };
        },
      },
    ],
  },

  {
    id: 'LOTTERY_WIN',
    title: 'ดวงเฮง! ถูกรางวัลสลากกินแบ่งรัฐบาล',
    category: 'ECONOMY',
    description:
      'สลากใบที่คุณติดกระเป๋าไว้ตรงกับผลการออกรางวัลพอดี! ได้รับเงินก้อนมาต่อลมหายใจอย่างไม่คาดคิด',
    getWeight: (p) => (p.career.prison_years_left === 0 && p.age >= 18 ? p.stats.luk * 2 : 0),
    choices: [
      {
        id: 'save_prize',
        label: 'ขึ้นเงินรางวัลเข้าบัญชีออมทรัพย์และโปะหนี้',
        sublabel: 'รับเงินสดตามค่าดวง (20,000 - 120,000 บาท)',
        apply: (player) => {
          const next = clonePlayer(player);
          const prize = next.stats.luk >= 8 ? 120000 : next.stats.luk >= 5 ? 40000 : 20000;
          if (next.finance.debt > 0) {
            const paid = Math.min(next.finance.debt, prize);
            next.finance.debt -= paid;
            next.finance.cash += prize - paid;
          } else {
            next.finance.cash += prize;
          }
          next.stats.san = clamp(next.stats.san + 14, 0, 100);
          return {
            updated: next,
            outcomeText: `รับทรัพย์ก้อนโต ${prize.toLocaleString()} บาท! ช่วยให้การเงินคล่องตัวขึ้นมาก (SAN +14)`,
          };
        },
      },
      {
        id: 'celebrate_friends',
        label: 'แบ่งเงินส่วนหนึ่งเลี้ยงฉลองครอบครัวและเพื่อนฝูง',
        sublabel: 'ได้คอนเนกชัน SOC +8, SAN +18',
        apply: (player) => {
          const next = clonePlayer(player);
          const prize = next.stats.luk >= 8 ? 100000 : 30000;
          next.finance.cash += prize;
          next.stats.soc = clamp(next.stats.soc + 8, 0, 100);
          next.stats.san = clamp(next.stats.san + 18, 0, 100);
          return {
            updated: next,
            outcomeText: `แบ่งปันความสุขกับคนรอบข้าง เหลือเก็บเข้ากระเป๋า ${prize.toLocaleString()} บาท (SOC +8, SAN +18)`,
          };
        },
      },
    ],
  },

  {
    id: 'CHILDHOOD_COMPETITION',
    title: 'กิจกรรมงานวิชาการและแข่งกีฬาสีประจำโรงเรียน',
    category: 'LIFE',
    description:
      'โรงเรียนเปิดรับตัวแทนนักเรียนลงแข่งขันตอบปัญหาวิชาการ หรือลงสนามนักกรีฑา-ฟุตบอลโรงเรียน',
    getWeight: (p) => (p.age >= 7 && p.age <= 15 ? 40 : 0),
    choices: [
      {
        id: 'academic_quiz',
        label: 'ลงแข่งตอบปัญหาวิชาการ',
        sublabel: 'พัฒนาสติปัญญา INT +6 · SAN +2',
        apply: (player) => {
          const next = clonePlayer(player);
          next.stats.int = clamp(next.stats.int + 6, 0, 100);
          next.stats.san = clamp(next.stats.san + 2, 0, 100);
          return {
            updated: next,
            outcomeText: 'ฝึกฝนค้นคว้าตำราจนคว้าเกียรติบัตรหน้าเสาธง (INT +6)',
          };
        },
      },
      {
        id: 'school_athlete_team',
        label: 'ลงแข่งเป็นนักกีฬาตัวแทนโรงเรียน!',
        sublabel: 'ปูทางสายนักกีฬาอาชีพ ATH +8, HP +4, SOC +5',
        apply: (player) => {
          const next = clonePlayer(player);
          next.stats.ath = clamp(next.stats.ath + 8, 0, 100);
          next.stats.hp = clamp(next.stats.hp + 4, 0, 100);
          next.stats.soc = clamp(next.stats.soc + 5, 0, 100);
          return {
            updated: next,
            outcomeText: 'คว้าเหรียญทองกีฬาสี! ร่างกายฟิตแกร่งและเริ่มมีแววนักกีฬา (ATH +8, HP +4)',
          };
        },
      },
    ],
  },

  {
    id: 'EARLY_CHILDHOOD_MOMENT',
    title: 'ก้าวแรกของการเติบโตในอ้อมอกครอบครัว',
    category: 'LIFE',
    description:
      'ในวัยเด็กเล็ก สภาพแวดล้อมรอบบ้านและการดูแลของผู้ปกครองกำลังหล่อหลอมพื้นฐานร่างกายและอารมณ์ของคุณ',
    getWeight: (p) => (p.age <= 6 ? 60 : 0),
    choices: [
      {
        id: 'play_outside',
        label: 'วิ่งเล่นเตะบอลและปีนป่ายซุกซนแถวบ้าน',
        sublabel: 'ATH +5 · HP +3 · SOC +4',
        apply: (player) => {
          const next = clonePlayer(player);
          next.stats.ath = clamp(next.stats.ath + 5, 0, 100);
          next.stats.hp = clamp(next.stats.hp + 3, 0, 100);
          next.stats.soc = clamp(next.stats.soc + 4, 0, 100);
          return {
            updated: next,
            outcomeText: 'พลังเหลือล้น คล่องแคล่วว่องไวตั้งแต่วัยเด็ก (ATH +5, HP +3)',
          };
        },
      },
      {
        id: 'curious_books',
        label: 'ชอบรื้อหนังสือนิทานและของเล่นฝึกสมอง',
        sublabel: 'INT +5 · SAN +2',
        apply: (player) => {
          const next = clonePlayer(player);
          next.stats.int = clamp(next.stats.int + 5, 0, 100);
          next.stats.san = clamp(next.stats.san + 2, 0, 100);
          return {
            updated: next,
            outcomeText: 'ช่างสังเกตและเรียนรู้ไวตั้งแต่วัยอนุบาล (INT +5)',
          };
        },
      },
    ],
  },
];

export class EventEngine {
  static evaluateYearlyEvent(player: PlayerData): ConditionalEvent | null {
    if (player.career.prison_years_left === 0) {
      const mandatoryMilestone = ThaiMilestones.getMandatoryMilestoneEvent(player);
      if (mandatoryMilestone) {
        return mandatoryMilestone;
      }
    }

    const pool: Array<{ event: ConditionalEvent; weight: number }> = [];

    for (const ev of CONDITIONAL_EVENTS) {
      const w = ev.getWeight(player);
      if (w > 0) {
        pool.push({ event: ev, weight: w });
      }
    }

    if (pool.length === 0) return null;

    const totalWeight = pool.reduce((acc, item) => acc + item.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const item of pool) {
      if (roll < item.weight) {
        return item.event;
      }
      roll -= item.weight;
    }

    return pool[pool.length - 1].event;
  }
}
