import { AssetManager } from './asset_manager';
import { StreetEncounterEngine } from './street_encounter_engine';
import { EDUCATION_TREE } from '../engine/EducationEngine';
import { LifeSimulatorEngine } from '../engine/LifeSimulatorEngine';
import { FamilyWealth, PlayerData } from '../engine/types';

export interface EstateBreakdown {
  cashLeft: number;
  assetLiquidationValue: number;
  totalDebts: number;
  grossEstate: number;
  inheritanceTaxAndFees: number;
  netLegacy: number;
  taxRatePct: number;
  nextGenWealthClass: FamilyWealth;
  nextGenCash: number;
  nextGenDebt: number;
  inheritedSoc: number;
  inheritedAth: number;
}

export class LegacyEngine {
  static calculateEstate(player: PlayerData): EstateBreakdown {
    const cashLeft = player.finance.cash;
    const assetLiquidationValue = AssetManager.getNetAssetLiquidationValue(player);
    const totalDebts = player.finance.debt + player.finance.student_loan_debt;

    const grossEstate = cashLeft + assetLiquidationValue - totalDebts;

    let taxRatePct = 0;
    let inheritanceTaxAndFees = 0;

    if (grossEstate > 0) {
      taxRatePct = grossEstate > 10000000 ? 20 : grossEstate > 2000000 ? 15 : 10;
      inheritanceTaxAndFees = Math.round((grossEstate * taxRatePct) / 100);
    }

    const netLegacy = grossEstate - inheritanceTaxAndFees;

    let nextGenWealthClass: FamilyWealth = 'POOR';
    let nextGenCash = 0;
    let nextGenDebt = 0;

    if (netLegacy < 0) {
      nextGenWealthClass = 'POOR_DEBTOR';
      nextGenCash = 0;
      nextGenDebt = Math.round(Math.abs(netLegacy) * 0.5);
    } else if (netLegacy <= 100000) {
      nextGenWealthClass = 'POOR';
      nextGenCash = netLegacy;
      nextGenDebt = 0;
    } else if (netLegacy <= 2000000) {
      nextGenWealthClass = 'MIDDLE';
      nextGenCash = netLegacy;
      nextGenDebt = 0;
    } else {
      nextGenWealthClass = 'WEALTHY_ELITE';
      nextGenCash = netLegacy;
      nextGenDebt = 0;
    }

    const inheritedSoc = Math.max(15, Math.min(85, Math.round(player.stats.soc * 0.3) + 20));
    const inheritedAth = Math.max(25, Math.min(75, Math.round(player.max_stats_reached.ath * 0.35) + 18));

    return {
      cashLeft,
      assetLiquidationValue,
      totalDebts,
      grossEstate,
      inheritanceTaxAndFees,
      netLegacy,
      taxRatePct,
      nextGenWealthClass,
      nextGenCash,
      nextGenDebt,
      inheritedSoc,
      inheritedAth,
    };
  }

  static createNextGenerationChild(
    deceasedParent: PlayerData,
    childCustomName?: string
  ): PlayerData {
    const estate = this.calculateEstate(deceasedParent);
    const parentEnding = LifeSimulatorEngine.evaluateEndingSummary(deceasedParent);

    const sex = Math.random() < 0.5 ? 'MALE' : 'FEMALE';
    const nextGenNumber = (deceasedParent.background.generation || 1) + 1;
    const childBirthYearBE = deceasedParent.birth_year_be + Math.max(25, deceasedParent.age - 18);

    const parentSupport =
      estate.nextGenWealthClass === 'WEALTHY_ELITE'
        ? 92
        : estate.nextGenWealthClass === 'MIDDLE'
        ? 62
        : estate.nextGenWealthClass === 'POOR'
        ? 32
        : 15;

    const baseInt =
      estate.nextGenWealthClass === 'WEALTHY_ELITE'
        ? 55
        : estate.nextGenWealthClass === 'MIDDLE'
        ? 45
        : 36;

    const luk = Math.floor(Math.random() * 10) + 1;
    const childName =
      childCustomName?.trim() || LifeSimulatorEngine.getSampleRandomName(sex);

    const updatedLineage = [
      ...deceasedParent.lineage,
      {
        generation: deceasedParent.background.generation || 1,
        name: deceasedParent.name,
        final_age: deceasedParent.age,
        ending_title: parentEnding.title,
        net_estate_passed: estate.netLegacy,
      },
    ];

    const child: PlayerData = {
      character_id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `gen-${nextGenNumber}-${Date.now()}`,
      name: childName,
      sex,
      birth_year_be: childBirthYearBE,
      age: 0,
      is_alive: true,
      cause_of_death: null,
      stats: {
        hp: 95,
        san: estate.nextGenDebt > 0 ? 75 : 95,
        int: baseInt,
        soc: estate.inheritedSoc,
        ath: estate.inheritedAth,
        luk,
        energy: 100,
        energy_max: 100,
      },
      max_stats_reached: {
        int: baseInt,
        soc: estate.inheritedSoc,
        ath: estate.inheritedAth,
        cash: estate.nextGenCash,
      },
      finance: {
        cash: estate.nextGenCash,
        debt: estate.nextGenDebt,
        student_loan_debt: 0,
        annual_income: 0,
        annual_expense: 0,
        credit_score: 'GOOD',
        credit_ban_years: 0,
      },
      background: {
        family_wealth: estate.nextGenWealthClass,
        location: deceasedParent.background.location,
        parent_support: parentSupport,
        generation: nextGenNumber,
        inherited_from: deceasedParent.name,
      },
      education: {
        current_level: 'NONE',
        completed_levels: [],
        active_program: null,
        years_in_program: 0,
        has_scholarship: false,
        uses_student_loan: false,
        rotc_level: 0,
        school_name: EDUCATION_TREE.NONE.sampleSchools[deceasedParent.background.location],
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
        years_remaining: 8,
      },
      flags: {
        has_chronic_disease: false,
        is_married: false,
        has_children: false,
        is_criminal_record: false,
        is_burnout: false,
        conscription_completed: false,
      },
      lineage: updatedLineage,
      street_world: StreetEncounterEngine.createInitialStreetWorld(
        deceasedParent.background.location,
        Math.round(
          ((deceasedParent.street_world?.neighborhood_affinity ?? 50) + 50) / 2
        )
      ),
      history: [
        {
          age: 0,
          year_be: childBirthYearBE,
          headline: `สืบทอดสายเลือดรุ่นที่ ${nextGenNumber} ต่อจาก "${deceasedParent.name}"`,
          details: [
            estate.netLegacy >= 0
              ? `รับมรดกสุทธิหลังหักภาษี ${estate.netLegacy.toLocaleString()} บาท (ชนชั้น: ${LifeSimulatorEngine.getWealthLabel(estate.nextGenWealthClass)})`
              : `รับภาระหนี้มรดกหลังประนอมหนี้ 50% จำนวน ${estate.nextGenDebt.toLocaleString()} บาท (สถานะ: ลูกหนี้สืบทอด)`,
            `ได้รับการถ่ายทอดต้นทุนทางสังคม (SOC ${estate.inheritedSoc}) และพันธุกรรมกีฬา (ATH ${estate.inheritedAth})`,
          ],
          net_finance_delta: estate.netLegacy,
          hp_after: 95,
          san_after: estate.nextGenDebt > 0 ? 75 : 95,
          int_after: baseInt,
          soc_after: estate.inheritedSoc,
          ath_after: estate.inheritedAth,
          cash_after: estate.nextGenCash,
          debt_after: estate.nextGenDebt,
          economic_state: 'NORMAL',
        },
      ],
    };

    return child;
  }
}
