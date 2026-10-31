import { UnderworldEngine } from '../core/underworld_engine';
import { DelayedChainEventItem, PlayerData } from '../engine/types';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export class EventChainQueue {
  static scheduleChainEvent(
    player: PlayerData,
    item: Omit<DelayedChainEventItem, 'created_at_age'>
  ): void {
    player.event_queue.push({
      ...item,
      created_at_age: player.age,
    });
  }

  static processYearlyEventQueue(player: PlayerData): string[] {
    const triggeredMessages: string[] = [];
    const remainingQueue: DelayedChainEventItem[] = [];

    for (const item of player.event_queue) {
      if (item.trigger_age <= player.age) {
        switch (item.event_chain_id) {
          case 'FRIEND_LOAN_RESOLVE': {
            const borrowed = Number(item.payload.amount_borrowed || 20000);
            const loyalty = Number(item.payload.friend_loyalty_score || 45);
            const successRate = loyalty + player.stats.luk * 5;
            const roll = Math.random() * 100;

            if (roll <= successRate) {
              const repaid = Math.round(borrowed * 1.2);
              player.finance.cash += repaid;
              player.stats.san = clamp(player.stats.san + 15, 0, 100);
              triggeredMessages.push(
                `[ผลลัพธ์จากอดีตเมื่ออายุ ${item.created_at_age} ปี] เพื่อนที่คุณเคยให้ยืมเงิน นำเงินมาคืนครบพร้อมดอกเบี้ยรวม ${repaid.toLocaleString()} บาท! (+15 SAN)`
              );
            } else {
              player.stats.san = clamp(player.stats.san - 25, 0, 100);
              triggeredMessages.push(
                `[ผลลัพธ์จากอดีตเมื่ออายุ ${item.created_at_age} ปี] เพื่อนที่ยืมเงินคุณไป ${borrowed.toLocaleString()} บาท ย้ายบ้านหนีและบล็อกทุกช่องทางติดต่อ... (-25 SAN)`
              );
            }
            break;
          }

          case 'STARTUP_SEED_PAYOFF': {
            const invested = Number(item.payload.invested_amount || 50000);
            const winChance = 30 + player.stats.int * 0.35 + player.stats.luk * 3;
            if (Math.random() * 100 <= winChance) {
              const payout = invested * 3;
              player.finance.cash += payout;
              player.stats.san = clamp(player.stats.san + 20, 0, 100);
              player.stats.soc = clamp(player.stats.soc + 10, 0, 100);
              triggeredMessages.push(
                `[ผลลัพธ์การร่วมทุนเมื่ออายุ ${item.created_at_age} ปี] กิจการของรุ่นพี่เติบโตก้าวกระโดด ปันผลกำไรคืนให้คุณถึง ${payout.toLocaleString()} บาท! (+20 SAN)`
              );
            } else {
              player.stats.san = clamp(player.stats.san - 12, 0, 100);
              triggeredMessages.push(
                `[ผลลัพธ์การร่วมทุนเมื่ออายุ ${item.created_at_age} ปี] โปรเจกต์สตาร์ทอัพที่ร่วมลงขันไว้ไปไม่รอด ขาดทุนเงินต้นทั้งหมด (-12 SAN)`
              );
            }
            break;
          }

          case 'CHRONIC_NEGLECT_FLARE': {
            player.flags.has_chronic_disease = true;
            player.stats.hp = clamp(player.stats.hp - 18, 0, 100);
            player.stats.san = clamp(player.stats.san - 10, 0, 100);
            triggeredMessages.push(
              `[ผลพวงจากการละเลยสุขภาพเมื่ออายุ ${item.created_at_age} ปี] อาการเรื้อรังกำเริบหนักจนกลายเป็นโรคประจำตัวถาวร (-18 HP, -10 SAN)`
            );
            break;
          }

          case 'GARAGE_SIDE_BIZ_RESULT': {
            const success =
              Math.random() * 100 <= 45 + player.stats.soc * 0.3 + player.stats.luk * 3;
            if (success) {
              player.finance.cash += 95000;
              player.stats.soc = clamp(player.stats.soc + 8, 0, 100);
              triggeredMessages.push(
                `[ผลลัพธ์เพจขายของออนไลน์ที่ปั้นไว้เมื่ออายุ ${item.created_at_age} ปี] สินค้าติดตลาดยอดสั่งซื้อถล่มทลาย รับกำไรสุทธิ +95,000 บาท!`
              );
            } else {
              player.stats.san = clamp(player.stats.san - 8, 0, 100);
              triggeredMessages.push(
                `[ผลลัพธ์เพจขายของออนไลน์เมื่ออายุ ${item.created_at_age} ปี] คู่แข่งตัดราคาจนสต๊อกจม ต้องเลหลังขายขาดทุน (-8 SAN)`
              );
            }
            break;
          }

          case 'POLICE_WARRANT_TRACE': {
            const sentence = Number(item.payload.prison_years || 2);
            const { shieldPct, safehouse } = UnderworldEngine.getEffectiveSafehouseShield(player);
            const evadeChance =
              player.stats.luk * 4 +
              shieldPct * 1.15 +
              (player.finance.cash >= 100000 ? 15 : 0);
            if (Math.random() * 100 < evadeChance) {
              const lawyerFee = safehouse ? 0 : Math.min(player.finance.cash, 60000);
              player.finance.cash -= lawyerFee;
              player.career.notoriety = Math.max(0, player.career.notoriety - 15);
              triggeredMessages.push(
                safehouse
                  ? `[รอดหมายจับด้วยแหล่งกบดาน!] ตำรวจไซเบอร์นำหมายจับจากงานสีเทาเมื่ออายุ ${item.created_at_age} ปี ออกตามล่า แต่คุณพรางตัวอยู่ใน "${safehouse.name}" จนแกะรอยไม่เจอ!`
                  : `[หมายเรียกย้อนหลังจากงานสีเทาเมื่ออายุ ${item.created_at_age} ปี] ตำรวจแกะรอยเส้นทางการเงินมาถึงคุณ แต่จ้างทนายสู้คดีหลุดรอดมาได้หวุดหวิด! (-${lawyerFee.toLocaleString()} บาท)`
              );
            } else {
              UnderworldEngine.incarceratePlayer(player, sentence, 0.4);
              triggeredMessages.push(
                `[กรรมตามทันจากงานสีเทาเมื่ออายุ ${item.created_at_age} ปี!] ตำรวจไซเบอร์นำหมายจับบุกรวบตัวถึงที่พัก ศาลตัดสินจำคุก ${sentence} ปี พร้อมยึดทรัพย์!`
              );
            }
            break;
          }

          default:
            break;
        }
      } else {
        remainingQueue.push(item);
      }
    }

    player.event_queue = remainingQueue;
    return triggeredMessages;
  }
}
