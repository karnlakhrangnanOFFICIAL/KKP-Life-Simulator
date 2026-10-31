import { AssetDefinition, OwnedAsset, PlayerData } from '../engine/types';

export const ASSETS_DATABASE: AssetDefinition[] = [
  {
    asset_id: 'CRAMPED_RENTAL_ROOM',
    name: 'ห้องเช่ารูหนู / หอพักพัดลมชานเมือง',
    type: 'HOUSING',
    total_price: 0,
    down_payment: 0,
    annual_installment: 48000, // 4,000 บาท/เดือน
    installment_years: 99,
    annual_maintenance: 0,
    is_rental: true,
    buffs: {
      san_per_year: -5,
      soc_per_year: 0,
      hp_recovery_bonus: -2,
      work_energy_discount: 0,
      accident_risk_pct: 0,
    },
    description: 'จ่ายรายเดือน 4,000 บาท ไม่มีภาระผูกพันระยะยาว แต่สภาพแวดล้อมแออัด (SAN -5/ปี)',
  },
  {
    asset_id: 'CONDO_MID_TIER',
    name: 'คอนโดมิเนียมติดรถไฟฟ้า',
    type: 'HOUSING',
    total_price: 2500000,
    down_payment: 250000,
    annual_installment: 140000,
    installment_years: 20,
    annual_maintenance: 15000,
    buffs: {
      san_per_year: 10,
      soc_per_year: 5,
      hp_recovery_bonus: 5,
      work_energy_discount: 5,
      accident_risk_pct: 0,
    },
    description: 'ราคา 2.5 ล้าน (ดาวน์ 2.5 แสน · ผ่อน 140,000 บ./ปี นาน 20 ปี) เพิ่ม SAN +10, SOC +5 และฟื้นฟูสุขภาพ +5/ปี',
  },
  {
    asset_id: 'DETACHED_HOUSE',
    name: 'บ้านเดี่ยวจัดสรรชานเมือง',
    type: 'HOUSING',
    total_price: 6000000,
    down_payment: 600000,
    annual_installment: 320000,
    installment_years: 20,
    annual_maintenance: 28000,
    buffs: {
      san_per_year: 25,
      soc_per_year: 20,
      hp_recovery_bonus: 8,
      work_energy_discount: 0,
      accident_risk_pct: 0,
      business_loan_boost: true,
    },
    description: 'ราคา 6.0 ล้าน (ดาวน์ 6 แสน · ผ่อน 320,000 บ./ปี นาน 20 ปี) เพิ่ม SAN +25, SOC +20 และเพิ่มเครดิตขยายธุรกิจ',
  },
  {
    asset_id: 'USED_MOTORCYCLE',
    name: 'รถมอเตอร์ไซค์มือสอง (เงินสด)',
    type: 'VEHICLE',
    total_price: 30000,
    down_payment: 30000,
    annual_installment: 0,
    installment_years: 0,
    annual_maintenance: 3500,
    buffs: {
      san_per_year: 2,
      soc_per_year: 0,
      hp_recovery_bonus: 0,
      work_energy_discount: 5,
      accident_risk_pct: 5,
    },
    description: 'ซื้อสด 30,000 บาท ลดพลังงานทำงานหลัก -5 Energy แต่เพิ่มความเสี่ยงอุบัติเหตุบนท้องถนน +5%/ปี',
  },
  {
    asset_id: 'ECO_CAR',
    name: 'รถยนต์อีโคคาร์ป้ายแดง',
    type: 'VEHICLE',
    total_price: 500000,
    down_payment: 50000,
    annual_installment: 72000,
    installment_years: 7,
    annual_maintenance: 12000,
    buffs: {
      san_per_year: 5,
      soc_per_year: 5,
      hp_recovery_bonus: 3,
      work_energy_discount: 10,
      accident_risk_pct: 1,
    },
    description: 'ราคา 5 แสน (ดาวน์ 50,000 · ผ่อน 72,000 บ./ปี นาน 7 ปี) กันแดดกันฝน ลดพลังงานทำงานหลัก -10 Energy และ SAN +5/ปี',
  },
];

export class AssetManager {
  static getDefinition(assetId: string): AssetDefinition | undefined {
    return ASSETS_DATABASE.find((a) => a.asset_id === assetId);
  }

  static getTotalWorkEnergyDiscount(player: PlayerData): number {
    let discount = 0;
    for (const owned of player.assets) {
      const def = this.getDefinition(owned.asset_id);
      if (def) {
        discount += def.buffs.work_energy_discount;
      }
    }
    return Math.min(15, discount);
  }

  static getNetAssetLiquidationValue(player: PlayerData): number {
    let total = 0;
    for (const owned of player.assets) {
      if (owned.is_rental) continue;
      if (owned.remaining_years <= 0) {
        // ผ่อนหมดแล้ว ตีมูลค่าตลาด ~85% ของราคาเต็ม
        total += Math.round(owned.total_price * 0.85);
      } else {
        // ยังผ่อนไม่หมด คิดตามสัดส่วนเงินที่ส่งไปแล้วหักภาระคงค้าง
        total += Math.round(owned.total_paid * 0.65);
      }
    }
    return total;
  }

  static checkPurchaseEligibility(
    player: PlayerData,
    def: AssetDefinition
  ): { eligible: boolean; reason?: string } {
    if (player.age < 18) {
      return { eligible: false, reason: 'ต้องบรรลุนิติภาวะหรืออายุ 18 ปีขึ้นไปจึงจะทำสัญญาได้' };
    }
    if (player.assets.some((a) => a.asset_id === def.asset_id)) {
      return { eligible: false, reason: 'คุณครอบครองรายการนี้อยู่แล้ว' };
    }
    if (
      def.annual_installment > 0 &&
      !def.is_rental &&
      (player.finance.credit_score === 'BAD' || player.finance.credit_ban_years > 0)
    ) {
      return {
        eligible: false,
        reason: `ติดประวัติเครดิตบูโรเสีย ห้ามยื่นกู้ซื้อทรัพย์สินใหม่อีก ${player.finance.credit_ban_years} ปี`,
      };
    }
    if (player.finance.cash < def.down_payment) {
      return {
        eligible: false,
        reason: `เงินสดไม่พอค่าดาวน์/ซื้อสด (${def.down_payment.toLocaleString()} บาท)`,
      };
    }
    return { eligible: true };
  }

  static purchaseAsset(
    player: PlayerData,
    assetId: string
  ): { updated: PlayerData; message: string } {
    const def = this.getDefinition(assetId);
    if (!def) return { updated: player, message: 'ไม่พบข้อมูลทรัพย์สิน' };

    const check = this.checkPurchaseEligibility(player, def);
    if (!check.eligible) {
      return { updated: player, message: check.reason || 'ไม่สามารถซื้อทรัพย์สินนี้ได้' };
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;

    // หากเช่าห้องรูหนูอยู่แล้วซื้อคอนโด/บ้าน ให้ยกเลิกสัญญาเช่าเดิมอัตโนมัติ
    if (def.type === 'HOUSING' && !def.is_rental) {
      next.assets = next.assets.filter((a) => !a.is_rental);
    }

    next.finance.cash -= def.down_payment;

    const newOwned: OwnedAsset = {
      asset_id: def.asset_id,
      name: def.name,
      type: def.type,
      total_price: def.total_price,
      remaining_years: def.installment_years,
      annual_installment: def.annual_installment,
      annual_maintenance: def.annual_maintenance,
      total_paid: def.down_payment,
      default_count: 0,
      is_rental: def.is_rental,
    };

    next.assets.push(newOwned);
    return {
      updated: next,
      message: def.is_rental
        ? `ทำสัญญาเช่า "${def.name}" เรียบร้อยแล้ว`
        : def.installment_years === 0
        ? `ซื้อสด "${def.name}" มูลค่า ${def.down_payment.toLocaleString()} บาท เรียบร้อยแล้ว!`
        : `วางเงินดาวน์ ${def.down_payment.toLocaleString()} บาท ทำสัญญาผ่อน "${def.name}" สำเร็จ!`,
    };
  }

  static cancelRentalOrSellAsset(
    player: PlayerData,
    assetId: string
  ): { updated: PlayerData; message: string } {
    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    const idx = next.assets.findIndex((a) => a.asset_id === assetId);
    if (idx === -1) return { updated: player, message: 'ไม่พบทรัพย์สิน' };

    const target = next.assets[idx];
    next.assets.splice(idx, 1);

    if (target.is_rental) {
      return { updated: next, message: `ยกเลิกสัญญาเช่า "${target.name}" แล้ว` };
    }

    const saleProceeds =
      target.remaining_years <= 0
        ? Math.round(target.total_price * 0.78)
        : Math.round(target.total_paid * 0.45);
    next.finance.cash += saleProceeds;
    return {
      updated: next,
      message: `ขายดาวน์/ขายทอดตลาด "${target.name}" ได้รับเงินสดคืน ${saleProceeds.toLocaleString()} บาท`,
    };
  }

  /**
   * Processes annual asset installments, maintenance, buffs, vehicle accident risk,
   * and exact Default & Repossession logic per Blueprint 1.2:
   * - Default #1: PAYMENT_DEFAULT_WARNING + Emergency Loan (15% interest)
   * - Default >= 2: Asset Repossessed, CASH += Total_Paid * 0.3, SAN -= 35, CREDIT_SCORE = BAD (5 years)
   */
  static processYearlyAssets(player: PlayerData): { logs: string[] } {
    const logs: string[] = [];

    // Tick down credit ban
    if (player.finance.credit_ban_years > 0) {
      player.finance.credit_ban_years -= 1;
      if (player.finance.credit_ban_years === 0) {
        player.finance.credit_score = 'GOOD';
        logs.push('พ้นระยะติดแบล็กลิสต์เครดิตบูโร 5 ปี สถานะเครดิตกลับมาเป็นปกติ (GOOD)');
      }
    }

    const survivingAssets: OwnedAsset[] = [];

    for (const asset of player.assets) {
      const def = this.getDefinition(asset.asset_id);
      const dueInstallment = asset.remaining_years > 0 ? asset.annual_installment : 0;
      const dueMaint = asset.annual_maintenance;
      const totalDue = dueInstallment + dueMaint;

      if (asset.is_rental) {
        // Rental room: pay or get evicted without repossession credit ban
        if (player.finance.cash >= totalDue) {
          player.finance.cash -= totalDue;
          survivingAssets.push(asset);
        } else {
          const shortfall = totalDue - player.finance.cash;
          player.finance.cash = 0;
          player.finance.debt += shortfall;
          logs.push(`ค้างค่าเช่า "${asset.name}" ต้องหยิบยืมเงินมาจ่ายเพิ่มเป็นหนี้ +${shortfall.toLocaleString()} บาท`);
          survivingAssets.push(asset);
        }
      } else if (dueInstallment > 0 && player.finance.cash < dueInstallment) {
        // PAYMENT DEFAULT LOGIC
        asset.default_count += 1;
        if (asset.default_count === 1) {
          // Emergency Loan at 15% interest
          const emergencyPrincipal = dueInstallment - player.finance.cash;
          player.finance.cash = 0;
          const loanWithInterest = Math.round(emergencyPrincipal * 1.15);
          player.finance.debt += loanWithInterest;
          asset.total_paid += dueInstallment;
          asset.remaining_years = Math.max(0, asset.remaining_years - 1);
          logs.push(
            `[คำเตือนผิดนัดชำระครั้งที่ 1] เงินสดไม่พอส่งงวด "${asset.name}" ต้องกู้ฉุกเฉินดอกเบี้ย 15% (+${loanWithInterest.toLocaleString()} บาท) หากค้างซ้ำจะถูกยึดทรัพย์!`
          );
          survivingAssets.push(asset);
        } else {
          // Default_Count >= 2 -> Asset Repossessed!
          const refund = Math.round(asset.total_paid * 0.3);
          player.finance.cash += refund;
          player.stats.san = Math.max(0, player.stats.san - 35);
          player.finance.credit_score = 'BAD';
          player.finance.credit_ban_years = 5;
          logs.push(
            `[ถูกยึดทรัพย์ขายทอดตลาด!] ผิดนัดชำระ "${asset.name}" ซ้ำซ้อน ไฟแนนซ์เข้ายึดทรัพย์ คืนเงินส่วนต่าง ${refund.toLocaleString()} บาท (SAN -35 · ติดเครดิตบูโรห้ามกู้ 5 ปี)`
          );
          continue; // Removed from survivingAssets
        }
      } else {
        // Normal payment
        if (totalDue > 0) {
          if (player.finance.cash >= totalDue) {
            player.finance.cash -= totalDue;
          } else {
            const diff = totalDue - player.finance.cash;
            player.finance.cash = 0;
            player.finance.debt += diff;
          }
        }
        if (dueInstallment > 0) {
          asset.total_paid += dueInstallment;
          asset.remaining_years = Math.max(0, asset.remaining_years - 1);
          asset.default_count = 0; // Reset consecutive default warning on timely payment
          if (asset.remaining_years === 0) {
            player.stats.san = Math.min(100, player.stats.san + 15);
            logs.push(`ไชโย! ผ่อนชำระ "${asset.name}" ครบทุกงวดแล้ว กลายเป็นกรรมสิทธิ์ปลอดภาระหนี้ 100%! (+15 SAN)`);
          }
        }
        survivingAssets.push(asset);
      }

      // Apply annual asset buffs & risks if still owned
      if (def) {
        player.stats.san = Math.max(0, Math.min(100, player.stats.san + def.buffs.san_per_year));
        player.stats.soc = Math.max(0, Math.min(100, player.stats.soc + def.buffs.soc_per_year));
        player.stats.hp = Math.max(0, Math.min(100, player.stats.hp + def.buffs.hp_recovery_bonus));

        if (def.buffs.accident_risk_pct > 0 && Math.random() * 100 < def.buffs.accident_risk_pct) {
          player.stats.hp = Math.max(0, player.stats.hp - 9);
          logs.push(`เกิดอุบัติเหตุรถล้มระหว่างขับขี่ "${asset.name}" บาดเจ็บ HP -9`);
        }
      }
    }

    player.assets = survivingAssets;
    return { logs };
  }
}
