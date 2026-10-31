import { EducationEngine, EDUCATION_TREE } from './EducationEngine';
import { JobDefinition, LicenseCourse, LicenseId, PlayerData } from './types';

export const LICENSE_COURSES: LicenseCourse[] = [
  {
    id: 'DRIVING_LICENSE',
    title: 'สอบใบขับขี่รถยนต์ / จักรยานยนต์สาธารณะ',
    minAge: 18,
    reqEducation: [],
    cost: 2500,
    energyCost: 15,
    passRateBase: 0.88,
    description: 'ปลดล็อกงานสายขนส่งและเพิ่มความคล่องตัวในการประกอบอาชีพ',
  },
  {
    id: 'BARBER_CERT',
    title: 'เรียนวิชาชีพช่างตัดผมชาย-วินเทจ (ใบรับรองกรมพัฒนาฝีมือแรงงาน)',
    minAge: 16,
    reqEducation: [],
    cost: 12000,
    energyCost: 30,
    passRateBase: 0.9,
    description: 'ใบเบิกทางสำคัญสู่การเปิดร้านบาร์เบอร์ของตัวเอง (คนเคยมีคดีก็เรียนเพื่อกลับตัวได้!)',
  },
  {
    id: 'SPORTS_COACH_CERT',
    title: 'อบรมผู้ฝึกสอนกีฬาอาชีพ (C-License / ใบรับรองการกีฬาแห่งประเทศไทย)',
    minAge: 24,
    reqEducation: [],
    cost: 15000,
    energyCost: 25,
    minAth: 65,
    passRateBase: 0.85,
    description: 'ต่อยอดจากนักกีฬาที่แขวนสตั๊ด/แขวนนวม สู่การเป็นโค้ชสโมสรและเจ้าของยิมรายได้มั่นคง',
  },
  {
    id: 'ELECTRICIAN_CERT',
    title: 'สอบหนังสือรับรองความรู้ความสามารถช่างไฟฟ้าภายในอาคาร',
    minAge: 18,
    reqEducation: ['VOCATIONAL_PVCH', 'PVSS'],
    cost: 5500,
    energyCost: 25,
    minInt: 45,
    passRateBase: 0.8,
    description: 'ยกระดับช่างสายอาชีวะสู่วิศวกร/หัวหน้าช่างเทคนิคเงินเดือนสูง',
  },
  {
    id: 'CIVIL_EXAM_PASS',
    title: 'ติวและสอบภาค ก. (สำนักงาน ก.พ.)',
    minAge: 18,
    reqEducation: ['PVSS', 'BACHELOR_REGULAR', 'BACHELOR_SPECIAL', 'OVERSEAS_DEGREE'],
    cost: 4000,
    energyCost: 35,
    minInt: 60,
    passRateBase: 0.55,
    description: 'ใบผ่านทางบรรจุข้าราชการพลเรือนสามัญที่มั่นคง',
  },
  {
    id: 'TEACHER_LICENSE',
    title: 'สอบใบประกอบวิชาชีพครู (คุรุสภา)',
    minAge: 21,
    reqEducation: ['BACHELOR_REGULAR', 'BACHELOR_SPECIAL', 'OVERSEAS_DEGREE'],
    cost: 3500,
    energyCost: 30,
    minInt: 65,
    passRateBase: 0.65,
    description: 'ปลดล็อกเส้นทางข้าราชการครูและบุคลากรทางการศึกษา',
  },
];

export const CAREER_MATRIX: JobDefinition[] = [
  // ================= SPORTS & ATHLETICS TRACK =================
  {
    job_id: 'MUAY_THAI_FIGHTER',
    title: 'นักมวยไทยเดินสาย / ค่ายมวยภูธร-เวทีมาตรฐาน',
    category: 'SPORTS',
    categoryLabel: 'นักกีฬาอาชีพ',
    min_age: 13,
    max_age: 35,
    req_education: [],
    req_stats: { ath: 45, hp: 60 },
    base_salary_monthly: 18000,
    hp_drain_yearly: 16,
    san_drain_yearly: 4,
    energy_cost: 45,
    can_be_side_job: true,
    fluctuates_with_luk: true,
    promotion_job_id: 'NATIONAL_STAR_ATHLETE',
    description:
      'ขึ้นชกแลกค่าตัวตั้งแต่วัยรุ่น ไม่ใช้วุฒิการศึกษา รายได้งามแต่ร่างกายบอบช้ำหนักและต้องรีบโกยก่อนอายุ 35 ปี!',
  },
  {
    job_id: 'THAI_LEAGUE_PLAYER',
    title: 'นักฟุตบอล / นักวอลเลย์บอลสโมสรอาชีพ',
    category: 'SPORTS',
    categoryLabel: 'นักกีฬาอาชีพ',
    min_age: 16,
    max_age: 37,
    req_education: [],
    req_stats: { ath: 65, hp: 70 },
    base_salary_monthly: 42000,
    hp_drain_yearly: 13,
    san_drain_yearly: 2,
    energy_cost: 50,
    can_be_side_job: false,
    fluctuates_with_luk: true,
    promotion_job_id: 'NATIONAL_STAR_ATHLETE',
    description:
      'เซ็นสัญญาเข้าอคาเดมี/สโมสรลีกอาชีพ เงินเดือนและเบี้ยเลี้ยงซ้อมสูง แต่หากบาดเจ็บหนักหรืออายุเกิน 37 ต้องแขวนสตั๊ด',
  },
  {
    job_id: 'NATIONAL_STAR_ATHLETE',
    title: 'นักกีฬาทีมชาติ / แชมป์โลกขวัญใจมหาชน',
    category: 'SPORTS',
    categoryLabel: 'ซูเปอร์สตาร์กีฬา',
    min_age: 18,
    max_age: 36,
    req_education: [],
    req_stats: { ath: 85, hp: 70, soc: 55 },
    base_salary_monthly: 135000,
    hp_drain_yearly: 15,
    san_drain_yearly: 6,
    energy_cost: 55,
    can_be_side_job: false,
    fluctuates_with_luk: true,
    promotion_job_id: 'HEAD_SPORTS_COACH',
    description:
      'จุดสูงสุดของสายกีฬา รับทั้งเงินอัดฉีดเหรียญรางวัลและพรีเซนเตอร์สินค้าหลักแสนต่อเดือน ก่อนผันตัวเป็นโค้ชเมื่ออายุครบ 36 ปี',
  },
  {
    job_id: 'HEAD_SPORTS_COACH',
    title: 'หัวหน้าผู้ฝึกสอนสโมสร / เจ้าของค่ายมวย-ยิมฟิตเนส',
    category: 'SPORTS',
    categoryLabel: 'บริหาร/ผู้ฝึกสอนกีฬา',
    min_age: 26,
    req_education: [],
    req_stats: { ath: 65, soc: 50 },
    req_licenses: ['SPORTS_COACH_CERT'],
    req_capital: 80000,
    base_salary_monthly: 58000,
    hp_drain_yearly: 6,
    san_drain_yearly: 4,
    energy_cost: 45,
    can_be_side_job: false,
    promotion_job_id: null,
    description:
      'เส้นทางหลังเกษียณจากการแข่งขัน ไม่จำกัดเพดานอายุ ใช้ประสบการณ์และใบผู้ฝึกสอนปั้นนักกีฬารุ่นใหม่',
  },

  // ================= UNDERWORLD & DARK SYNDICATE TRACK =================
  {
    job_id: 'STREET_DRUG_COURIER',
    title: 'เด็กเดินยา / สายส่งพัสดุสีเทาตามตรอกซอกซอย',
    category: 'UNDERWORLD',
    categoryLabel: 'สายมืดขั้นต้น (Tier 1)',
    min_age: 14,
    req_education: [],
    req_stats: {},
    is_illegal: true,
    arrest_risk_base_pct: 20,
    prison_sentence_years: 3,
    base_salary_monthly: 26000,
    hp_drain_yearly: 11,
    san_drain_yearly: 14,
    energy_cost: 35,
    can_be_side_job: true,
    fluctuates_with_luk: true,
    promotion_job_id: 'SYNDICATE_ENFORCER',
    description:
      '[ผิดกฎหมาย] ก้าวแรกในโลกมืด รับจ้างวิ่งส่งของต้องห้ามแลกเงินสดรายวัน เสี่ยงเจอด่านล่อซื้อติดคุก 3 ปี แต่ไต่เต้าขึ้นเป็นสมุนเจ้าพ่อได้',
  },
  {
    job_id: 'UNDERGROUND_RUNNER',
    title: 'เด็กเดินโพย / คนหาบัญชีม้า-ซิมผี',
    category: 'UNDERWORLD',
    categoryLabel: 'สายมืดขั้นต้น (Tier 1)',
    min_age: 15,
    req_education: [],
    req_stats: {},
    is_illegal: true,
    arrest_risk_base_pct: 16,
    prison_sentence_years: 2,
    base_salary_monthly: 28000,
    hp_drain_yearly: 9,
    san_drain_yearly: 12,
    energy_cost: 35,
    can_be_side_job: true,
    fluctuates_with_luk: true,
    promotion_job_id: 'ONLINE_GAMBLING_ADMIN',
    description:
      '[ผิดกฎหมาย] เดินโพยหวยใต้ดินและจัดหาบัญชีม้าส่งเครือข่าย เงินไวไม่ต้องใช้วุฒิ เสี่ยงถูกตำรวจไซเบอร์รวบตัวจำคุก 2 ปี',
  },
  {
    job_id: 'LOAN_SHARK_ENFORCER',
    title: 'แก๊งหมวกกันน็อก / นักเลงทวงหนี้นอกระบบ',
    category: 'UNDERWORLD',
    categoryLabel: 'สายอิทธิพลเถื่อน (Tier 2)',
    min_age: 18,
    req_education: [],
    req_stats: { ath: 52, hp: 65 },
    is_illegal: true,
    arrest_risk_base_pct: 20,
    prison_sentence_years: 3,
    base_salary_monthly: 44000,
    hp_drain_yearly: 16,
    san_drain_yearly: 14,
    energy_cost: 45,
    can_be_side_job: false,
    fluctuates_with_luk: true,
    promotion_job_id: 'SYNDICATE_ENFORCER',
    description:
      '[ผิดกฎหมาย] ขี่รถตามเก็บดอกเบี้ยโหดรายวัน ส่วนแบ่งสูงแต่เสี่ยงโดนลูกหนี้ฮึดสู้และโดนตำรวจรวบจำคุก 3 ปี',
  },
  {
    job_id: 'SYNDICATE_ENFORCER',
    title: 'สมุนเจ้าพ่อ / มือขวาคุมซุ้มอิทธิพลใต้ดิน',
    category: 'UNDERWORLD',
    categoryLabel: 'สมุนเจ้าพ่อ (Tier 3)',
    min_age: 20,
    req_education: [],
    req_stats: { ath: 58, hp: 65, soc: 50 },
    is_illegal: true,
    arrest_risk_base_pct: 23,
    prison_sentence_years: 5,
    base_salary_monthly: 68000,
    hp_drain_yearly: 15,
    san_drain_yearly: 15,
    energy_cost: 50,
    can_be_side_job: false,
    fluctuates_with_luk: true,
    promotion_job_id: 'MAFIA_KINGPIN',
    description:
      '[ผิดกฎหมายร้ายแรง] คนสนิทข้างกายขาใหญ่ ดูแลความเรียบร้อยซุ้มสถานบันเทิงสีเทาและเคลียร์อริต่างถิ่น ต้องมีแหล่งกบดานดีๆ เพื่อหลบหมายจับ!',
  },
  {
    job_id: 'ONLINE_GAMBLING_ADMIN',
    title: 'แอดมินเว็บพนัน / เครือข่ายฟอกเงินข้ามชาติ',
    category: 'UNDERWORLD',
    categoryLabel: 'อาชญากรรมไซเบอร์ (Tier 3)',
    min_age: 18,
    req_education: [],
    req_stats: { int: 55 },
    is_illegal: true,
    arrest_risk_base_pct: 22,
    prison_sentence_years: 4,
    base_salary_monthly: 82000,
    hp_drain_yearly: 8,
    san_drain_yearly: 16,
    energy_cost: 45,
    can_be_side_job: false,
    fluctuates_with_luk: true,
    promotion_job_id: 'SYNDICATE_BOSS',
    description:
      '[ผิดกฎหมาย] ดูแลระบบหลังบ้านและหมุนเวียนบัญชีเว็บสีเทา เงินสะพัดหลักแสนต่อเดือน ต้องคอยย้ายแหล่งกบดานหนีการแกะรอย IP!',
  },
  {
    job_id: 'SYNDICATE_BOSS',
    title: 'เจ้าพ่อเครือข่ายสีเทา / นายทุนบ่อน-เว็บใต้ดิน',
    category: 'UNDERWORLD',
    categoryLabel: 'นายทุนสายมืด (Tier 4)',
    min_age: 24,
    req_education: [],
    req_stats: { int: 62, soc: 72 },
    req_capital: 350000,
    is_illegal: true,
    arrest_risk_base_pct: 25,
    prison_sentence_years: 7,
    base_salary_monthly: 195000,
    hp_drain_yearly: 12,
    san_drain_yearly: 18,
    energy_cost: 55,
    can_be_side_job: false,
    fluctuates_with_luk: true,
    promotion_job_id: 'MAFIA_KINGPIN',
    description:
      '[ผิดกฎหมายร้ายแรง] ถือหุ้นใหญ่บ่อนวิ่งและเครือข่ายสีเทาระดับภูมิภาค รายได้เฉียดสองแสนต่อเดือน โทษจำคุก 7 ปีหากไร้แหล่งกบดานคุ้มภัย',
  },
  {
    job_id: 'MAFIA_KINGPIN',
    title: 'มาเฟียผู้มีอิทธิพล / เจ้าพ่อเงาอำนาจมืด',
    category: 'UNDERWORLD',
    categoryLabel: 'จุดสูงสุดโลกใต้ดิน (Tier 5)',
    min_age: 28,
    req_education: [],
    req_stats: { int: 68, soc: 82 },
    req_capital: 850000,
    is_illegal: true,
    arrest_risk_base_pct: 28,
    prison_sentence_years: 10,
    base_salary_monthly: 360000,
    hp_drain_yearly: 13,
    san_drain_yearly: 20,
    energy_cost: 55,
    can_be_side_job: false,
    fluctuates_with_luk: true,
    promotion_job_id: null,
    description:
      '[จุดสูงสุดสายมืด] ผู้ทรงอิทธิพลที่ชักใยอาณาจักรธุรกิจสีเทาเต็มรูปแบบ กวาดเงินหลายล้านต่อปี แต่ตกเป็นเป้าหมายอันดับ 1 ของชุดเฉพาะกิจระดับประเทศ (โทษจำคุก 10 ปี)!',
  },

  // ================= STANDARD HONEST CAREERS =================
  {
    job_id: 'RETAIL_STAFF',
    title: 'พนักงาน 7-Eleven / ร้านค้าปลีก',
    category: 'CORPORATE_FRONTLINE',
    categoryLabel: 'บริการหน้าร้าน',
    min_age: 18,
    req_education: ['LOWER_SEC', 'NON_FORMAL_KSN', 'UPPER_SEC_GENERAL', 'VOCATIONAL_PVCH', 'PVSS', 'BACHELOR_REGULAR', 'BACHELOR_SPECIAL'],
    req_stats: {},
    base_salary_monthly: 12000,
    hp_drain_yearly: 10,
    san_drain_yearly: 5,
    energy_cost: 45,
    can_be_side_job: false,
    promotion_job_id: 'RETAIL_STORE_MANAGER',
    description: 'ยืนเครื่องคิดเงิน จัดเรียงสินค้า เข้ากะดึก งานหนักแต่รับวุฒิ ม.3 ขึ้นไป',
  },
  {
    job_id: 'RETAIL_STORE_MANAGER',
    title: 'ผู้จัดการสาขาร้านสะดวกซื้อ',
    category: 'CORPORATE_FRONTLINE',
    categoryLabel: 'บริหารหน้าร้าน',
    min_age: 22,
    req_education: ['UPPER_SEC_GENERAL', 'VOCATIONAL_PVCH', 'NON_FORMAL_KSN', 'PVSS', 'BACHELOR_REGULAR', 'BACHELOR_SPECIAL'],
    req_stats: { int: 48, soc: 50 },
    blocks_criminal_record: true,
    base_salary_monthly: 24000,
    hp_drain_yearly: 9,
    san_drain_yearly: 8,
    energy_cost: 50,
    can_be_side_job: false,
    promotion_job_id: null,
    description: 'บริหารยอดขาย สต๊อกสินค้า และจัดตารางกะลูกน้องทั้งสาขา (ตรวจประวัติอาชญากรรม)',
  },
  {
    job_id: 'FREELANCE_VOCALIST',
    title: 'นักร้องอิสระ / เล่นดนตรีกลางคืน',
    category: 'ARTS_FREELANCE',
    categoryLabel: 'ศิลปะและอิสระ',
    min_age: 16,
    req_education: [],
    req_stats: { soc: 60 },
    base_salary_monthly: 18000,
    hp_drain_yearly: 15,
    san_drain_yearly: -5,
    energy_cost: 35,
    can_be_side_job: true,
    promotion_job_id: 'FAMOUS_ARTIST',
    description: 'จับไมค์ร้องเพลงตามร้านอาหารยามค่ำคืน นอนดึกเสียสุขภาพกาย แต่เติมเต็มความสุขทางใจ',
  },
  {
    job_id: 'FAMOUS_ARTIST',
    title: 'ศิลปินสังกัดค่าย / นักร้องชื่อดัง',
    category: 'ARTS_FREELANCE',
    categoryLabel: 'ศิลปินอาชีพ',
    min_age: 18,
    req_education: [],
    req_stats: { soc: 80 },
    base_salary_monthly: 65000,
    hp_drain_yearly: 14,
    san_drain_yearly: -4,
    energy_cost: 55,
    can_be_side_job: false,
    fluctuates_with_luk: true,
    promotion_job_id: null,
    description: 'ปล่อยซิงเกิล ทัวร์คอนเสิร์ตทั่วประเทศ รายได้พุ่งทะยานตามชื่อเสียงและดวงชะตา',
  },
  {
    job_id: 'BARBER_SHOP_OWNER',
    title: 'ช่างตัดผม / เจ้าของร้านบาร์เบอร์',
    category: 'SKILLED_SERVICES',
    categoryLabel: 'วิชาชีพอิสระ',
    min_age: 18,
    req_education: [],
    req_stats: {},
    req_licenses: ['BARBER_CERT'],
    req_capital: 50000,
    base_salary_monthly: 25000,
    hp_drain_yearly: 8,
    san_drain_yearly: 0,
    energy_cost: 45,
    can_be_side_job: false,
    promotion_job_id: null,
    description: 'เปิดร้านบาร์เบอร์ของตัวเอง ไม่ใช้วุฒิและไม่ตรวจประวัติคดี ขอแค่มีฝีมือและทุน 50,000 บาท',
  },
  {
    job_id: 'INDUSTRIAL_TECHNICIAN',
    title: 'ช่างเทคนิคโรงงาน / ช่างซ่อมบำรุง',
    category: 'SKILLED_SERVICES',
    categoryLabel: 'สายช่างอาชีวะ',
    min_age: 18,
    req_education: ['VOCATIONAL_PVCH', 'PVSS'],
    req_stats: { int: 42 },
    base_salary_monthly: 17500,
    hp_drain_yearly: 11,
    san_drain_yearly: 4,
    energy_cost: 45,
    can_be_side_job: false,
    promotion_job_id: 'SENIOR_ENGINEER_TECH',
    description: 'สายตรงเด็กอาชีวะ ปวช./ปวส. ดูแลเครื่องจักรในนิคมอุตสาหกรรม',
  },
  {
    job_id: 'SENIOR_ENGINEER_TECH',
    title: 'หัวหน้าวิศวกรเทคนิค / ผู้ควบคุมระบบ',
    category: 'SKILLED_SERVICES',
    categoryLabel: 'วิศวกรรมเทคนิค',
    min_age: 22,
    req_education: ['PVSS', 'BACHELOR_REGULAR', 'BACHELOR_SPECIAL', 'OVERSEAS_DEGREE'],
    req_stats: { int: 62 },
    req_licenses: ['ELECTRICIAN_CERT'],
    blocks_criminal_record: true,
    base_salary_monthly: 38000,
    hp_drain_yearly: 8,
    san_drain_yearly: 6,
    energy_cost: 50,
    can_be_side_job: false,
    promotion_job_id: null,
    description: 'คุมทีมช่างเทคนิคและระบบไฟฟ้าโรงงาน รายได้มั่นคงระดับหัวหน้างาน',
  },
  {
    job_id: 'MILITARY_NCO',
    title: 'ทหารประทวน (นายสิบ)',
    category: 'GOVERNMENT',
    categoryLabel: 'ราชการ/ความมั่นคง',
    min_age: 18,
    req_education: ['UPPER_SEC_GENERAL', 'VOCATIONAL_PVCH', 'NON_FORMAL_KSN', 'PVSS', 'BACHELOR_REGULAR', 'BACHELOR_SPECIAL'],
    req_stats: { hp: 70 },
    blocks_criminal_record: true,
    base_salary_monthly: 15000,
    hp_drain_yearly: 5,
    san_drain_yearly: 10,
    energy_cost: 45,
    can_be_side_job: false,
    promotion_job_id: 'MILITARY_OFFICER',
    description: 'รับราชการทหารชั้นประทวน สวัสดิการรักษาพยาบาลครอบคลุมครอบครัว',
  },
  {
    job_id: 'MILITARY_OFFICER',
    title: 'นายทหารสัญญาบัตร',
    category: 'GOVERNMENT',
    categoryLabel: 'ราชการ/ความมั่นคง',
    min_age: 24,
    req_education: ['BACHELOR_REGULAR', 'BACHELOR_SPECIAL', 'OVERSEAS_DEGREE'],
    req_stats: { hp: 60, int: 60 },
    blocks_criminal_record: true,
    base_salary_monthly: 32000,
    hp_drain_yearly: 5,
    san_drain_yearly: 7,
    energy_cost: 45,
    can_be_side_job: false,
    promotion_job_id: null,
    description: 'เลื่อนยศขึ้นเป็นนายทหารสัญญาบัตร มีเกียรติและบำนาญมั่นคงยามเกษียณ',
  },
  {
    job_id: 'CIVIL_SERVANT_OFFICER',
    title: 'ข้าราชการพลเรือนสามัญ / ครูผู้ช่วย',
    category: 'GOVERNMENT',
    categoryLabel: 'ข้าราชการพลเรือน',
    min_age: 21,
    req_education: ['BACHELOR_REGULAR', 'BACHELOR_SPECIAL', 'OVERSEAS_DEGREE'],
    req_stats: { int: 65 },
    req_licenses: ['CIVIL_EXAM_PASS'],
    blocks_criminal_record: true,
    base_salary_monthly: 19500,
    hp_drain_yearly: 5,
    san_drain_yearly: 6,
    energy_cost: 45,
    can_be_side_job: false,
    promotion_job_id: null,
    description: 'บรรจุราชการหลังสอบผ่านภาค ก. เงินเดือนขึ้นตามขั้นและมีบำนาญระยะยาว',
  },
  {
    job_id: 'STREET_VENDOR',
    title: 'พ่อค้าแม่ค้าแผงลอย / ตลาดนัด',
    category: 'TRADE',
    categoryLabel: 'ค้าขายอิสระ',
    min_age: 15,
    req_education: [],
    req_stats: {},
    req_capital: 5000,
    base_salary_monthly: 15000,
    hp_drain_yearly: 12,
    san_drain_yearly: 8,
    energy_cost: 35,
    can_be_side_job: true,
    fluctuates_with_luk: true,
    promotion_job_id: 'SME_OWNER',
    description: 'ตั้งแผงขายอาหารตามตลาดนัด ลงทุนต่ำ 5,000 บาท เปิดโอกาสให้ทุกคนไม่ว่าอดีตเคยเป็นอย่างไร',
  },
  {
    job_id: 'DELIVERY_RIDER',
    title: 'ไรเดอร์ส่งอาหาร / พัสดุด่วน',
    category: 'TRADE',
    categoryLabel: 'งานอิสระ/ขนส่ง',
    min_age: 18,
    req_education: [],
    req_stats: { hp: 50 },
    req_licenses: ['DRIVING_LICENSE'],
    base_salary_monthly: 16500,
    hp_drain_yearly: 13,
    san_drain_yearly: 6,
    energy_cost: 30,
    can_be_side_job: true,
    fluctuates_with_luk: true,
    promotion_job_id: null,
    description: 'วิ่งงานบนท้องถนน รับออเดอร์อิสระ ทำเป็นอาชีพหลักหรือวิ่งเสริมหลังเลิกงานก็ได้',
  },
  {
    job_id: 'SME_OWNER',
    title: 'เจ้าของกิจการ SME / แฟรนไชส์ร้านอาหาร',
    category: 'TRADE',
    categoryLabel: 'ผู้ประกอบการ',
    min_age: 22,
    req_education: [],
    req_stats: { int: 55, soc: 60 },
    req_capital: 200000,
    base_salary_monthly: 55000,
    hp_drain_yearly: 10,
    san_drain_yearly: 9,
    energy_cost: 55,
    can_be_side_job: false,
    fluctuates_with_luk: true,
    promotion_job_id: null,
    description: 'ขยับขยายจากแผงลอยสู่ธุรกิจเต็มตัว กำไรสูงแต่ต้องแบกรับความเสี่ยงเศรษฐกิจ',
  },
  {
    job_id: 'CORPORATE_ANALYST',
    title: 'พนักงานออฟฟิศเอกชน / นักวิเคราะห์ธุรกิจ',
    category: 'PROFESSIONAL',
    categoryLabel: 'บริษัทเอกชน',
    min_age: 21,
    req_education: ['BACHELOR_REGULAR', 'BACHELOR_SPECIAL', 'OVERSEAS_DEGREE'],
    req_stats: { int: 70 },
    blocks_criminal_record: true,
    base_salary_monthly: 28000,
    hp_drain_yearly: 8,
    san_drain_yearly: 11,
    energy_cost: 50,
    can_be_side_job: false,
    promotion_job_id: null,
    description: 'ทำงานตึกสูงย่านธุรกิจ เงินเดือนดี แลกกับความเครียดและตรวจประวัติอาชญากรรมเข้มงวด',
  },
];

export class CareerEngine {
  static getJobById(jobId: string | null): JobDefinition | null {
    if (!jobId) return null;
    return CAREER_MATRIX.find((j) => j.job_id === jobId) || null;
  }

  static getLicenseById(licenseId: LicenseId): LicenseCourse | undefined {
    return LICENSE_COURSES.find((l) => l.id === licenseId);
  }

  static checkJobRequirements(
    player: PlayerData,
    job: JobDefinition,
    asSideJob: boolean = false
  ): { eligible: boolean; reasons: string[] } {
    const reasons: string[] = [];

    if (player.career.prison_years_left > 0) {
      reasons.push('กำลังถูกคุมขังอยู่ในเรือนจำ');
    }

    if (asSideJob && !job.can_be_side_job) {
      reasons.push('อาชีพนี้ต้องทำเต็มเวลาเท่านั้น');
    }

    if (!asSideJob && player.education.is_enrolled && player.education.active_program) {
      const eduNode = EDUCATION_TREE[player.education.active_program];
      if (!eduNode.allowsFullTimeWork) {
        reasons.push(`กำลังเรียนภาคปกติ (${eduNode.shortTitle}) รับได้เฉพาะงานเสริม`);
      }
    }

    if (player.age < job.min_age) {
      reasons.push(`อายุขั้นต่ำ ${job.min_age} ปี`);
    }

    if (job.max_age && player.age > job.max_age) {
      reasons.push(`เกินเพดานอายุนักกีฬาอาชีพ (${job.max_age} ปี)`);
    }

    if (
      player.flags.is_criminal_record &&
      (job.category === 'GOVERNMENT' || job.blocks_criminal_record)
    ) {
      reasons.push('ติดประวัติอาชญากรรม (ใบแดงประวัติคดี) บริษัท/ราชการปฏิเสธรับเข้าทำงาน');
    }

    if (job.req_education.length > 0) {
      const okEdu = EducationEngine.hasCompletedOrHigher(player, job.req_education);
      if (!okEdu) {
        const minLabel = EDUCATION_TREE[job.req_education[0]].shortTitle;
        reasons.push(`ต้องมีวุฒิ ${minLabel} ขึ้นไป`);
      }
    }

    if (job.req_stats.hp && player.stats.hp < job.req_stats.hp) {
      reasons.push(`ต้องการ HP >= ${job.req_stats.hp}`);
    }
    if (job.req_stats.int && player.stats.int < job.req_stats.int) {
      reasons.push(`ต้องการ INT >= ${job.req_stats.int}`);
    }
    if (job.req_stats.soc && player.stats.soc < job.req_stats.soc) {
      reasons.push(`ต้องการ SOC >= ${job.req_stats.soc}`);
    }
    if (job.req_stats.ath && player.stats.ath < job.req_stats.ath) {
      reasons.push(`ต้องการทักษะกีฬา (ATH) >= ${job.req_stats.ath}`);
    }

    if (job.req_licenses && job.req_licenses.length > 0) {
      for (const lic of job.req_licenses) {
        if (!player.career.licenses.includes(lic)) {
          const course = this.getLicenseById(lic);
          reasons.push(`ต้องมีใบอนุญาต: ${course ? course.title : lic}`);
        }
      }
    }

    if (job.req_capital && player.finance.cash < job.req_capital) {
      reasons.push(`ต้องใช้เงินทุนตั้งต้น ${job.req_capital.toLocaleString()} บาท`);
    }

    return {
      eligible: reasons.length === 0,
      reasons,
    };
  }

  static calculateMonthlyJobIncome(
    player: PlayerData,
    job: JobDefinition,
    isSideJob: boolean
  ): number {
    const levelMultiplier = isSideJob ? 0.55 : 1 + (player.career.job_level - 1) * 0.14;
    let lukFactor = 1.0;
    if (job.fluctuates_with_luk) {
      const variance = Math.random() * 0.24 - 0.12;
      lukFactor = 0.72 + player.stats.luk * 0.065 + variance;
    }
    // Bonus for championship athletes
    const medalBonus =
      job.category === 'SPORTS' ? 1 + Math.min(0.6, player.career.championship_medals * 0.12) : 1;

    return Math.round(job.base_salary_monthly * levelMultiplier * lukFactor * medalBonus);
  }
}
