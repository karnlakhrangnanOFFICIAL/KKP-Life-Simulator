export type FamilyWealth = 'POOR_DEBTOR' | 'POOR' | 'MIDDLE' | 'RICH' | 'WEALTHY_ELITE';
export type BirthLocation = 'BANGKOK' | 'PROVINCIAL' | 'REMOTE';
export type BiologicalSex = 'MALE' | 'FEMALE';

export type EducationLevel =
  | 'NONE'
  | 'PRIMARY'
  | 'LOWER_SEC'
  | 'UPPER_SEC_GENERAL'
  | 'VOCATIONAL_PVCH'
  | 'NON_FORMAL_KSN'
  | 'PVSS'
  | 'BACHELOR_REGULAR'
  | 'BACHELOR_SPECIAL'
  | 'OVERSEAS_DEGREE';

export type LicenseId =
  | 'DRIVING_LICENSE'
  | 'BARBER_CERT'
  | 'TEACHER_LICENSE'
  | 'CIVIL_EXAM_PASS'
  | 'ELECTRICIAN_CERT'
  | 'SPORTS_COACH_CERT';

export type EconomicCycleState = 'NORMAL' | 'BOOM' | 'RECESSION' | 'PANDEMIC_LOCKDOWN';

export interface PlayerStats {
  hp: number;         // Physical Health (0-100)
  san: number;        // Mental Health / Happiness (0-100)
  int: number;        // Intelligence / Academics (0-100)
  soc: number;        // Social / Connections / Charisma (0-100)
  ath: number;        // Athletic Skill / Physical Prowess (0-100)
  luk: number;        // Fixed/Semi-fixed Luck (1-10)
  energy: number;
  energy_max: number;
}

export interface PlayerFinance {
  cash: number;
  debt: number;
  student_loan_debt: number;
  annual_income: number;
  annual_expense: number;
  credit_score: 'GOOD' | 'BAD';
  credit_ban_years: number;
}

export interface PlayerBackground {
  family_wealth: FamilyWealth;
  location: BirthLocation;
  parent_support: number;
  generation: number;
  inherited_from?: string;
}

export interface PlayerEducation {
  current_level: EducationLevel;
  completed_levels: EducationLevel[];
  active_program: EducationLevel | null;
  years_in_program: number;
  has_scholarship: boolean;
  uses_student_loan: boolean;
  rotc_level: number;
  school_name: string;
  gpa: number;
  is_enrolled: boolean;
}

export type SafehouseId =
  | 'SLUM_ROOM'
  | 'PROVINCIAL_SAFEHOUSE'
  | 'VIP_PENTHOUSE_BUNKER'
  | 'BORDER_COMPOUND';

export interface SafehouseDefinition {
  id: SafehouseId;
  name: string;
  tierLabel: string;
  setupCost: number;
  annualUpkeep: number;
  arrestRiskReductionPct: number;
  notorietyDecayYearly: number;
  sanBonusYearly: number;
  seizureProtectionFactor: number; // 1.0 = normal seizure, 0.5 = halves cash seized if arrested
  description: string;
}

export interface PlayerCareer {
  primary_job: string | null;
  suspended_primary_job: string | null;
  conscription_years_left: number;
  prison_years_left: number;  // โทษจำคุกคงเหลือ (ปี)
  notoriety: number;          // ค่าความฉาวโฉ่ / หมายจับสะสมสายมืด (0-100)
  safehouse_id: SafehouseId | null; // แหล่งกบดานปัจจุบันสำหรับซ่อนตัวจากตำรวจ
  safehouse_security: number; // ความลับพิกัดแหล่งกบดาน (0-100) ยิ่งต่ำเกราะป้องกันยิ่งลดลง
  championship_medals: number;// เหรียญรางวัล/แชมป์สายกีฬาที่คว้าได้
  side_job: string | null;
  job_level: number;
  years_experience: number;
  licenses: LicenseId[];
}

export type AssetType = 'HOUSING' | 'VEHICLE';

export interface AssetDefinition {
  asset_id: string;
  name: string;
  type: AssetType;
  total_price: number;
  down_payment: number;
  annual_installment: number;
  installment_years: number;
  annual_maintenance: number;
  is_rental?: boolean;
  buffs: {
    san_per_year: number;
    soc_per_year: number;
    hp_recovery_bonus: number;
    work_energy_discount: number;
    accident_risk_pct: number;
    business_loan_boost?: boolean;
  };
  description: string;
}

export interface OwnedAsset {
  asset_id: string;
  name: string;
  type: AssetType;
  total_price: number;
  remaining_years: number;
  annual_installment: number;
  annual_maintenance: number;
  total_paid: number;
  default_count: number;
  is_rental?: boolean;
}

export interface DelayedChainEventItem {
  queue_id: string;
  trigger_age: number;
  created_at_age: number;
  event_chain_id:
    | 'FRIEND_LOAN_RESOLVE'
    | 'ROTC_BOOTCAMP_GRAD'
    | 'STARTUP_SEED_PAYOFF'
    | 'CHRONIC_NEGLECT_FLARE'
    | 'GARAGE_SIDE_BIZ_RESULT'
    | 'POLICE_WARRANT_TRACE';
  title: string;
  payload: Record<string, number | string | boolean>;
}

export interface PlayerFlags {
  has_chronic_disease: boolean;
  is_married: boolean;
  has_children: boolean;
  is_criminal_record: boolean;
  is_burnout: boolean;
  conscription_completed: boolean;
}

export interface YearlyLogEntry {
  age: number;
  year_be: number;
  headline: string;
  details: string[];
  net_finance_delta: number;
  hp_after: number;
  san_after: number;
  int_after?: number;
  soc_after?: number;
  ath_after?: number;
  cash_after: number;
  debt_after: number;
  economic_state?: EconomicCycleState;
}

export interface PastAncestorRecord {
  generation: number;
  name: string;
  final_age: number;
  ending_title: string;
  net_estate_passed: number;
}

export interface PlayerData {
  character_id: string;
  name: string;
  sex: BiologicalSex;
  birth_year_be: number;
  age: number;
  is_alive: boolean;
  cause_of_death: string | null;
  stats: PlayerStats;
  max_stats_reached: {
    int: number;
    soc: number;
    ath: number;
    cash: number;
  };
  finance: PlayerFinance;
  background: PlayerBackground;
  education: PlayerEducation;
  career: PlayerCareer;
  assets: OwnedAsset[];
  event_queue: DelayedChainEventItem[];
  macro_economy: {
    current_state: EconomicCycleState;
    years_remaining: number;
  };
  flags: PlayerFlags;
  lineage: PastAncestorRecord[];
  history: YearlyLogEntry[];
  pending_year_logs?: string[];
  street_world?: StreetWorldState;
}

export type GameState = 'TITLE_MENU' | 'PLAYING' | 'GAME_OVER';

export interface EducationNode {
  id: EducationLevel;
  title: string;
  shortTitle: string;
  track: 'COMPULSORY' | 'TRACK_A_FORMAL' | 'TRACK_B_NON_FORMAL' | 'HIGHER';
  minAge: number;
  durationYears: number;
  prereqLevels: EducationLevel[];
  minInt: number;
  requiresEliteWealth?: boolean;
  annualTuition: number;
  energyDrainYearly: number;
  intGainYearly: number;
  socGainYearly: number;
  sanDeltaYearly: number;
  allowsFullTimeWork: boolean;
  supportsStudentLoan?: boolean;
  description: string;
  sampleSchools: Record<BirthLocation, string>;
}

export type JobCategory =
  | 'CORPORATE_FRONTLINE'
  | 'ARTS_FREELANCE'
  | 'SKILLED_SERVICES'
  | 'GOVERNMENT'
  | 'TRADE'
  | 'PROFESSIONAL'
  | 'SPORTS'
  | 'UNDERWORLD';

export interface JobDefinition {
  job_id: string;
  title: string;
  category: JobCategory;
  categoryLabel: string;
  min_age: number;
  max_age?: number; // สำหรับนักกีฬาอาชีพที่มีอายุขัยการเล่นในสนามจำกัด
  req_education: EducationLevel[];
  req_stats: Partial<Pick<PlayerStats, 'hp' | 'san' | 'int' | 'soc' | 'ath' | 'luk'>>;
  req_licenses?: LicenseId[];
  req_capital?: number;
  blocks_criminal_record?: boolean;
  is_illegal?: boolean;
  arrest_risk_base_pct?: number; // โอกาสถูกตำรวจบุกจับต่อปีสำหรับสายมืด
  prison_sentence_years?: number;
  base_salary_monthly: number;
  hp_drain_yearly: number;
  san_drain_yearly: number;
  energy_cost: number;
  can_be_side_job: boolean;
  fluctuates_with_luk?: boolean;
  promotion_job_id: string | null;
  description: string;
}

export interface LicenseCourse {
  id: LicenseId;
  title: string;
  minAge: number;
  reqEducation: EducationLevel[];
  cost: number;
  energyCost: number;
  minInt?: number;
  minAth?: number;
  passRateBase: number;
  description: string;
}

export interface EventChoice {
  id: string;
  label: string;
  sublabel?: string;
  apply: (player: PlayerData) => { updated: PlayerData; outcomeText: string };
}

export interface ConditionalEvent {
  id: string;
  title: string;
  category: 'CRITICAL' | 'CAREER' | 'ECONOMY' | 'LIFE' | 'FAMILY' | 'MILESTONE_THAI' | 'UNDERWORLD' | 'SPORTS';
  description: string;
  getWeight: (player: PlayerData) => number;
  choices: EventChoice[];
}

export interface EnergyActivityUnit {
  id: string;
  title: string;
  subtitle: string;
  energyCost: number;
  cashCost: number;
  mandatory?: boolean;
  category: 'MANDATORY' | 'SIDE_WORK' | 'STUDY' | 'HEALTH' | 'SOCIAL' | 'FINANCE' | 'SPORTS' | 'UNDERWORLD';
  maxRepeats: number;
}

export interface CrimeOperation {
  id: string;
  title: string;
  minAge: number;
  energyCost: number;
  minInt?: number;
  minSoc?: number;
  minAth?: number;
  rewardMin: number;
  rewardMax: number;
  baseArrestChancePct: number;
  prisonYears: number;
  notorietyGain: number;
  description: string;
}

export type AthleticTrainingModeId =
  | 'INTENSIVE_COACHING'
  | 'CLUB_TRAINING'
  | 'SOLO_PRACTICE';

export interface AthleticTrainingOption {
  id: AthleticTrainingModeId;
  title: string;
  englishTitle: string;
  minAge: number;
  energyCost: number;
  hpCost: number; // Positive = drains HP; Negative = restores HP
  athGain: number;
  socGain: number;
  sanDelta: number;
  riskTag: string;
  paceTag: string;
  description: string;
}

export type CityDistrictId =
  | 'RESIDENTIAL_SOI'
  | 'ATHLETIC_CLUB'
  | 'CAMPUS_ZONE'
  | 'BUSINESS_MARKET'
  | 'BACK_ALLEY'
  | 'COMMERCIAL_PLAZA';

export interface LocalContact {
  id: string;
  name: string;
  role: string;
  affinity: number; // 0-100 relationship warmth
  encounters: number;
}

export interface StreetEncounterReaction {
  promptLabel: string;
  cashCost: number;
  bonusSan: number;
  bonusAffinity: number;
  bonusSoc: number;
  outcomeSnippet: string;
}

export interface StreetEncounterLog {
  id: string;
  age: number;
  districtId: CityDistrictId;
  districtLabel: string;
  timeOfDayLabel: string;
  snippet: string;
  sanDelta: number;
  localAffinityDelta: number;
  socDelta: number;
  cashDelta: number;
  localContactName?: string;
  reaction?: StreetEncounterReaction;
  reactionTaken?: boolean;
  reactionOutcomeText?: string;
}

export interface StreetWorldState {
  neighborhood_affinity: number; // 0-100 overall local relationship warmth
  commute_encounters_this_year: number;
  known_locals: LocalContact[];
  recent_snippets: StreetEncounterLog[];
}

export interface MilestoneNotification {
  id: string;
  category: 'EDUCATION' | 'CAREER' | 'RETIREMENT' | 'FINANCE' | 'HEALTH';
  horizonLabel: string;
  title: string;
  description: string;
  targetTab?: 'TIMELINE' | 'ATHLETICS' | 'EDUCATION' | 'CAREER' | 'ASSETS' | 'UNDERWORLD';
  actionLabel?: string;
}
