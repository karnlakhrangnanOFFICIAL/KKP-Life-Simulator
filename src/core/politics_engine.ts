import {
  IdeologyBloc,
  MinistryId,
  MinistryPortfolioSpec,
  ParliamentaryBillType,
  PartySeatResult,
  PlayerData,
  PlayerPoliticsState,
  PoliticalOfficeRole,
  PoliticalPartyDefinition,
} from '../engine/types';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const HOUSE_TOTAL_SEATS = 500;
export const MAJORITY_THRESHOLD_SEATS = 251;

export const MINISTRY_PORTFOLIOS: MinistryPortfolioSpec[] = [
  {
    id: 'FINANCE',
    title: 'กระทรวงการคลัง',
    shortTitle: 'ก.คลัง',
    grade: 'A',
    focusLabel: 'เศรษฐกิจมหภาค / งบประมาณแผ่นดิน',
    description: 'คุมกระเป๋าเงินแผ่นดิน นโยบายภาษี และมาตรการกระตุ้นเศรษฐกิจระดับประเทศ',
  },
  {
    id: 'INTERIOR',
    title: 'กระทรวงมหาดไทย',
    shortTitle: 'ก.มหาดไทย',
    grade: 'A',
    focusLabel: 'ปกครองส่วนภูมิภาค / เครือข่ายท้องถิ่น',
    description: 'คุมกลไกผู้ว่าราชการจังหวัด องค์กรปกครองส่วนท้องถิ่น และฐานเสียงระดับภูมิภาคทั่วประเทศ',
  },
  {
    id: 'TRANSPORT',
    title: 'กระทรวงคมนาคม',
    shortTitle: 'ก.คมนาคม',
    grade: 'A',
    focusLabel: 'โครงสร้างพื้นฐาน / เมกะโปรเจกต์',
    description: 'บริหารงบลงทุนโครงข่ายรถไฟ ถนนทางหลวง และโครงการพัฒนาพื้นที่เศรษฐกิจ',
  },
  {
    id: 'PUBLIC_HEALTH',
    title: 'กระทรวงสาธารณสุข',
    shortTitle: 'ก.สาธารณสุข',
    grade: 'A',
    focusLabel: 'ระบบบัตรทอง / สวัสดิการสุขภาพ',
    description: 'ดูแลโรงพยาบาลทั่วประเทศและเครือข่าย อสม. สร้างคะแนนนิยมระดับรากหญ้าอย่างสูง',
  },
  {
    id: 'DEFENSE',
    title: 'กระทรวงกลาโหมและความมั่นคง',
    shortTitle: 'ก.กลาโหม',
    grade: 'B',
    focusLabel: 'ความมั่นคง / กองทัพและชายแดน',
    description: 'ประสานงานเหล่าทัพ ดูแลงบความมั่นคง และสร้างสมดุลอำนาจกับฝ่ายทหาร',
  },
  {
    id: 'AGRICULTURE',
    title: 'กระทรวงเกษตรและสหกรณ์',
    shortTitle: 'ก.เกษตรฯ',
    grade: 'B',
    focusLabel: 'ชลประทาน / ราคาพืชผลและฐานเสียงชนบท',
    description: 'ดูแลพี่น้องเกษตรกร ที่ดินทำกิน และโครงการแหล่งน้ำในต่างจังหวัด',
  },
  {
    id: 'JUSTICE',
    title: 'กระทรวงยุติธรรม',
    shortTitle: 'ก.ยุติธรรม',
    grade: 'B',
    focusLabel: 'หลักนิติธรรม / สิทธิมนุษยชน',
    description: 'กำกับดูแลกระบวนการยุติธรรม กฎหมายสิทธิมนุษยชน และการเยียวยาประชาชน',
  },
  {
    id: 'EDUCATION',
    title: 'กระทรวงศึกษาธิการ',
    shortTitle: 'ก.ศึกษาธิการ',
    grade: 'B',
    focusLabel: 'ปฏิรูปหลักสูตร / เยาวชนคนรุ่นใหม่',
    description: 'วางรากฐานการศึกษาของชาติ ลดความเหลื่อมล้ำ และซื้อใจกลุ่มคนรุ่นใหม่และครู',
  },
  {
    id: 'CULTURE_SOUTH',
    title: 'กระทรวงวัฒนธรรม การท่องเที่ยวและพัฒนาชายแดนใต้',
    shortTitle: 'ก.วัฒนธรรม/ชายแดนใต้',
    grade: 'B',
    focusLabel: 'พหุวัฒนธรรม / ซอฟต์พาวเวอร์ / สันติภาพภาคใต้',
    description: 'ส่งเสริมเศรษฐกิจท่องเที่ยว อัตลักษณ์พหุวัฒนธรรม และการพัฒนาพื้นที่จังหวัดชายแดนภาคใต้',
  },
];

interface MinorPartySeed {
  ballotNumber: number;
  name: string;
  bloc: IdeologyBloc;
  score: number;
  region: string;
  theme: string;
}

const MINOR_47_SEEDS: MinorPartySeed[] = [
  { ballotNumber: 1, name: 'พรรคไทยทรัพย์ทวี', bloc: 'PRAGMATIC_CONSERVATIVE', score: 52, region: 'ผู้ประกอบการรายย่อย / ภาคกลาง', theme: 'ส่งเสริมปากท้องและกองทุนชุมชน' },
  { ballotNumber: 2, name: 'พรรคเพื่อชาติไทย', bloc: 'PRAGMATIC_CONSERVATIVE', score: 56, region: 'ภูมิภาคท้องถิ่น', theme: 'ประสานประโยชน์ท้องถิ่นและสวัสดิการชาวบ้าน' },
  { ballotNumber: 3, name: 'พรรคใหม่', bloc: 'PROGRESSIVE', score: 26, region: 'คนเมือง / กลุ่มอาสาสมัคร', theme: 'รณรงค์ต่อต้านคอร์รัปชันและคุ้มครองสิทธิพลเมือง' },
  { ballotNumber: 4, name: 'พรรคมิติใหม่', bloc: 'PRAGMATIC_CONSERVATIVE', score: 48, region: 'ปริมณฑล / เมืองรอง', theme: 'นโยบายเศรษฐกิจดิจิทัลชุมชน' },
  { ballotNumber: 5, name: 'พรรครวมใจไทย', bloc: 'HARDLINE_CONSERVATIVE', score: 74, region: 'กลุ่มอนุรักษนิยมท้องถิ่น', theme: 'เน้นความสามัคคีและสถาบันหลักของชาติ' },
  { ballotNumber: 7, name: 'พรรคพลวัต', bloc: 'PROGRESSIVE', score: 28, region: 'คนทำงานรุ่นใหม่ / สตาร์ทอัพ', theme: 'ขับเคลื่อนเศรษฐกิจสร้างสรรค์และเทคโนโลยีก้าวหน้า' },
  { ballotNumber: 8, name: 'พรรคประชาธิปไตยใหม่', bloc: 'PRAGMATIC_CONSERVATIVE', score: 54, region: 'เครือข่ายฐานเสียงเฉพาะจุด', theme: 'พรรคขนาดเล็กจอมต่อรองในสภา พร้อมโหวตหนุนแลกนโยบายสวัสดิการ' },
  { ballotNumber: 10, name: 'พรรคทางเลือกใหม่', bloc: 'PRAGMATIC_CONSERVATIVE', score: 50, region: 'ปริมณฑล / ภาคกลาง', theme: 'เสนอนโยบายลดค่าครองชีพและพลังงานทางเลือก' },
  { ballotNumber: 11, name: 'พรรคเศรษฐกิจ', bloc: 'PRAGMATIC_CONSERVATIVE', score: 60, region: 'กลุ่มนักธุรกิจ / พ่อค้าคนกลาง', theme: 'เน้นลดภาษีธุรกิจและกระตุ้นการลงทุนภาคเอกชน' },
  { ballotNumber: 12, name: 'พรรคเสรีรวมไทย', bloc: 'PROGRESSIVE', score: 32, region: 'กรุงเทพฯ / ภาคกลาง', theme: 'ชูจุดยืนปราบปรามการทุจริตและปฏิรูปกระบวนการยุติธรรม' },
  { ballotNumber: 13, name: 'พรรครวมพลังประชาชน', bloc: 'PRAGMATIC_CONSERVATIVE', score: 55, region: 'เครือข่ายชุมชนต่างจังหวัด', theme: 'เน้นกองทุนหมู่บ้านและพักชำระหนี้รายย่อย' },
  { ballotNumber: 14, name: 'พรรคท้องที่ไทย', bloc: 'PRAGMATIC_CONSERVATIVE', score: 58, region: 'กำนัน-ผู้ใหญ่บ้าน / ท้องถิ่น', theme: 'ผลักดันสวัสดิการผู้นำชุมชนและการปกครองท้องที่' },
  { ballotNumber: 15, name: 'พรรคอนาคตไทย', bloc: 'PROGRESSIVE', score: 30, region: 'กลุ่มเยาวชนและแรงงานบริการ', theme: 'ผลักดันรัฐสวัสดิการถ้วนหน้าและการศึกษาสมัยใหม่' },
  { ballotNumber: 16, name: 'พรรคพลังเพื่อไทย', bloc: 'PRAGMATIC_CONSERVATIVE', score: 46, region: 'ภาคอีสานตอนล่าง / ภาคเหนือ', theme: 'เน้นนโยบายเกษตรแปรรูปและราคาพืชผล' },
  { ballotNumber: 17, name: 'พรรคไทยชนะ', bloc: 'HARDLINE_CONSERVATIVE', score: 72, region: 'เครือข่ายวิชาชีพและข้าราชการบำนาญ', theme: 'เน้นวินัยการคลังและความมั่นคงภายในประเทศ' },
  { ballotNumber: 18, name: 'พรรคพลังสังคมใหม่', bloc: 'PRAGMATIC_CONSERVATIVE', score: 53, region: 'พื้นที่ชนบทห่างไกล', theme: 'ดูแลเบี้ยผู้สูงอายุและอาสาสมัครสาธารณสุข' },
  { ballotNumber: 19, name: 'พรรคสังคมประชาธิปไตย', bloc: 'PROGRESSIVE', score: 20, region: 'เครือข่ายสหภาพแรงงาน / นักวิชาการ', theme: 'ชูรัฐสวัสดิการ สิทธิแรงงาน และภาษีอัตราก้าวหน้า' },
  { ballotNumber: 20, name: 'พรรคฟิวชัน', bloc: 'PROGRESSIVE', score: 34, region: 'กลุ่มคนรุ่นใหม่สายเทคโนโลยี', theme: 'ผสานนวัตกรรม AI และข้อมูลเปิดภาครัฐ' },
  { ballotNumber: 21, name: 'พรรคไทรวมพลัง', bloc: 'PRAGMATIC_CONSERVATIVE', score: 50, region: 'อุบลราชธานี / อีสานใต้', theme: 'ฐานเสียงพื้นที่เหนียวแน่นระดับเขต พร้อมร่วมมือพัฒนาท้องถิ่น' },
  { ballotNumber: 22, name: 'พรรคก้าวอิสระ', bloc: 'PROGRESSIVE', score: 35, region: 'อาชีพอิสระ / ฟรีแลนซ์ในเมือง', theme: 'คุ้มครองแรงงานนอกระบบและเศรษฐกิจแพลตฟอร์ม' },
  { ballotNumber: 23, name: 'พรรคปวงชนไทย', bloc: 'PRAGMATIC_CONSERVATIVE', score: 57, region: 'ภาคกลาง / ภาคตะวันตก', theme: 'แก้ปัญหาหนี้นอกระบบและเข้าถึงแหล่งทุน' },
  { ballotNumber: 24, name: 'พรรควิชชั่นใหม่', bloc: 'PRAGMATIC_CONSERVATIVE', score: 47, region: 'ผู้ประกอบการ SME เมืองใหญ่', theme: 'ยกระดับขีดความสามารถการแข่งขันส่งออกไทย' },
  { ballotNumber: 25, name: 'พรรคเพื่อชีวิตใหม่', bloc: 'PROGRESSIVE', score: 36, region: 'กลุ่มเปราะบาง / ประชาสังคม', theme: 'ยกระดับคุณภาพชีวิตผู้พิการและผู้มีรายได้น้อย' },
  { ballotNumber: 26, name: 'พรรคคลองไทย', bloc: 'PRAGMATIC_CONSERVATIVE', score: 62, region: 'ภาคใต้ฝั่งอันดามัน-อ่าวไทย', theme: 'ชูเมกะโปรเจกต์ระเบียงเศรษฐกิจทางทะเลภาคใต้' },
  { ballotNumber: 28, name: 'พรรคไทยก้าวหน้า', bloc: 'PRAGMATIC_CONSERVATIVE', score: 49, region: 'ชานเมือง / นิคมอุตสาหกรรม', theme: 'ดูแลค่าแรงขั้นต่ำและทักษะฝีมือแรงงาน' },
  { ballotNumber: 30, name: 'พรรคแรงงานสร้างชาติ', bloc: 'PROGRESSIVE', score: 29, region: 'นิคมอุตสาหกรรมภาคตะวันออก-กลาง', theme: 'ปกป้องสิทธิประกันสังคมและสวัสดิการผู้ใช้แรงงาน' },
  { ballotNumber: 31, name: 'พรรคประชากรไทย', bloc: 'HARDLINE_CONSERVATIVE', score: 70, region: 'ผู้สูงวัยในกรุงเทพฯ และปริมณฑล', theme: 'พรรคเก่าแก่สายอนุรักษนิยม เน้นดูแลค่าครองชีพคนเมือง' },
  { ballotNumber: 32, name: 'พรรคครูไทยเพื่อประชาชน', bloc: 'PRAGMATIC_CONSERVATIVE', score: 54, region: 'เครือข่ายครูและบุคลากรทางการศึกษา', theme: 'พักหนี้ครูและยกระดับสวัสดิการโรงเรียนภูมิภาค' },
  { ballotNumber: 34, name: 'พรรคสร้างอนาคตไทย', bloc: 'PRAGMATIC_CONSERVATIVE', score: 61, region: 'นักบริหารเทคโนแครต / ชนชั้นกลาง', theme: 'ทีมเศรษฐกิจมืออาชีพ เน้นแก้หนี้ครัวเรือนอย่างเป็นระบบ' },
  { ballotNumber: 35, name: 'พรรครักชาติ', bloc: 'HARDLINE_CONSERVATIVE', score: 84, region: 'กลุ่มอนุรักษนิยมสายความมั่นคง', theme: 'เชิดชูเกียรติภูมิชาติและระเบียบวินัยสังคม' },
  { ballotNumber: 36, name: 'พรรคไทยพร้อม', bloc: 'PRAGMATIC_CONSERVATIVE', score: 52, region: 'ภาคกลาง / ภาคตะวันออก', theme: 'พร้อมประสานทุกฝ่ายเพื่อขับเคลื่อนงบพัฒนาพื้นที่' },
  { ballotNumber: 38, name: 'พรรคพลังธรรมใหม่', bloc: 'PRAGMATIC_CONSERVATIVE', score: 51, region: 'เครือข่ายแพทย์ชนบทและศีลธรรม', theme: 'ชูการเมืองคุณธรรมและบริการสาธารณสุขเข้าถึงง่าย' },
  { ballotNumber: 39, name: 'พรรคกรีน', bloc: 'PROGRESSIVE', score: 25, region: 'นักสิ่งแวดล้อม / คนเมืองรักษ์โลก', theme: 'ผลักดันกฎหมายอากาศสะอาด พลังงานหมุนเวียน และสิ่งแวดล้อม' },
  { ballotNumber: 40, name: 'พรรคไทยธรรม', bloc: 'PRAGMATIC_CONSERVATIVE', score: 56, region: 'ชุมชนวิถีพุทธ / ภูมิภาค', theme: 'ส่งเสริมจริยธรรมการเมืองและเศรษฐกิจพอเพียง' },
  { ballotNumber: 41, name: 'พรรคแผ่นดินธรรม', bloc: 'HARDLINE_CONSERVATIVE', score: 80, region: 'เครือข่ายศาสนาและวัฒนธรรมดั้งเดิม', theme: 'พิทักษ์ศีลธรรมและคุณค่าทางวัฒนธรรมไทย' },
  { ballotNumber: 44, name: 'พรรคโอกาสใหม่', bloc: 'PRAGMATIC_CONSERVATIVE', score: 49, region: 'อดีตข้าราชการส่วนภูมิภาค / คนรุ่นกลาง', theme: 'เชื่อมกลไกราชการกับภาคเอกชนเพื่อสร้างโอกาสทางเศรษฐกิจ' },
  { ballotNumber: 47, name: 'พรรคประชาไทย', bloc: 'PRAGMATIC_CONSERVATIVE', score: 52, region: 'ชุมชนเกษตรกรรมภาคกลาง', theme: 'พัฒนาแหล่งน้ำและสหกรณ์การเกษตรครบวงจร' },
  { ballotNumber: 48, name: 'พรรคไทยสร้างไทย', bloc: 'PROGRESSIVE', score: 33, region: 'กรุงเทพฯ / อีสานบางส่วน', theme: 'ชูบำนาญประชาชน 3,000 บาท และปลดล็อกกฎหมายตัวเล็ก' },
  { ballotNumber: 49, name: 'พรรคไทยก้าวใหม่', bloc: 'PROGRESSIVE', score: 31, region: 'คนเมืองสายการศึกษาและนวัตกรรม', theme: 'ปฏิรูปทักษะคนไทยสู่อุตสาหกรรมอนาคต' },
  { ballotNumber: 50, name: 'พรรคประชาอาสาชาติ', bloc: 'PRAGMATIC_CONSERVATIVE', score: 54, region: 'เครือข่ายจิตอาสาท้องถิ่น', theme: 'สนับสนุนงบอาสาสมัครบรรเทาสาธารณภัยชุมชน' },
  { ballotNumber: 51, name: 'พรรคพร้อม', bloc: 'PRAGMATIC_CONSERVATIVE', score: 50, region: 'ภาคธุรกิจบริการและท่องเที่ยว', theme: 'ฟื้นฟูการท่องเที่ยวเมืองรองและธุรกิจโรงแรมรายย่อย' },
  { ballotNumber: 52, name: 'พรรคเครือข่ายชาวนาแห่งประเทศไทย', bloc: 'PRAGMATIC_CONSERVATIVE', score: 47, region: 'ลุ่มน้ำเจ้าพระยา / ชาวนาภาคอีสาน', theme: 'ประกันราคาข้าวเปลือกและลดต้นทุนปุ๋ย-ยาปราบศัตรูพืช' },
  { ballotNumber: 53, name: 'พรรคไทยพิทักษ์ธรรม', bloc: 'HARDLINE_CONSERVATIVE', score: 77, region: 'กลุ่มนักกฎหมายสายอนุรักษนิยม', theme: 'บังคับใช้กฎหมายเข้มงวดและรักษาความสงบเรียบร้อย' },
  { ballotNumber: 54, name: 'พรรคความหวังใหม่', bloc: 'PRAGMATIC_CONSERVATIVE', score: 55, region: 'ภาคอีสาน / พื้นที่ชนบทดั้งเดิม', theme: 'พรรคตำนานสายภูมิภาค เน้นกระจายงบพัฒนาชนบท' },
  { ballotNumber: 55, name: 'พรรคไทยรวมไทย', bloc: 'PRAGMATIC_CONSERVATIVE', score: 51, region: 'การค้าชายแดนและภูมิภาค', theme: 'ส่งเสริมการค้าเสรีแนวชายแดนและโลจิสติกส์ภูมิภาค' },
  { ballotNumber: 56, name: 'พรรคเพื่อบ้านเมือง', bloc: 'HARDLINE_CONSERVATIVE', score: 69, region: 'ผู้นำท้องถิ่นอาวุโส', theme: 'เน้นเสถียรภาพการบริหารราชการแผ่นดิน' },
  { ballotNumber: 57, name: 'พรรคพลังไทยรักชาติ', bloc: 'HARDLINE_CONSERVATIVE', score: 82, region: 'มวลชนสายอนุรักษนิยมต่างจังหวัด', theme: 'ปกป้องผลประโยชน์ของชาติและอุดมการณ์ดั้งเดิม' },
];

const MAJOR_10_PARTIES: Record<number, PoliticalPartyDefinition> = {
  6: {
    ballotNumber: 6,
    name: 'พรรครวมไทยสร้างชาติ',
    isMajor10: true,
    popularityTier: 'MEDIUM',
    popularityLabel: 'ปานกลาง',
    basePopularityScore: 54,
    constituencyStrength: 0.92,
    partyListStrength: 1.08,
    ideologyBloc: 'HARDLINE_CONSERVATIVE',
    ideologyScore: 86,
    baseRegion: 'ภาคใต้ / อนุรักษนิยมเข้มข้น',
    buffText: 'ได้รับความไว้วางใจจากกลุ่มพลังเงียบและฝ่ายความมั่นคง',
    debuffText: 'ขยายฐานเสียงไปยังกลุ่มคนรุ่นใหม่ได้ยาก',
    coalitionConditionText: 'ร่วมเฉพาะขั้วอนุรักษนิยมเท่านั้น (ไม่ร่วมกับพรรคสายปฏิรูป)',
    preferredMinistries: ['DEFENSE', 'FINANCE'],
    requiresAnyMinistry: true,
    opposesStructuralReform: true,
    vetoIdeologyBlocs: ['PROGRESSIVE'],
  },
  9: {
    ballotNumber: 9,
    name: 'พรรคเพื่อไทย',
    isMajor10: true,
    popularityTier: 'HIGH',
    popularityLabel: 'สูง',
    basePopularityScore: 84,
    constituencyStrength: 1.25,
    partyListStrength: 1.18,
    ideologyBloc: 'PRAGMATIC_CONSERVATIVE',
    ideologyScore: 44,
    baseRegion: 'ภาคอีสาน / ภาคเหนือ',
    buffText: 'ความเชี่ยวชาญด้านเศรษฐกิจ ปรับตัวตามสถานการณ์ทางการเมืองเก่ง',
    debuffText: 'ฐานเสียงเดิมเกิดความลังเลและไหลออกหากตัดสินใจสลับขั้ว',
    coalitionConditionText: 'ยอมลดระดับกระทรวงได้ แต่ต้องได้ตำแหน่งนายกรัฐมนตรีหรือกระทรวงการคลัง',
    preferredMinistries: ['FINANCE', 'TRANSPORT', 'AGRICULTURE'],
    requiresPmOrFinance: true,
  },
  27: {
    ballotNumber: 27,
    name: 'พรรคประชาธิปัตย์',
    isMajor10: true,
    popularityTier: 'MEDIUM',
    popularityLabel: 'ปานกลาง',
    basePopularityScore: 46,
    constituencyStrength: 0.95,
    partyListStrength: 0.82,
    ideologyBloc: 'PRAGMATIC_CONSERVATIVE',
    ideologyScore: 68,
    baseRegion: 'ภาคใต้ / กทม. (บางส่วน)',
    buffText: 'ความน่าเชื่อถือด้านสถาบันการเมืองและทีมกฎหมายในสภา',
    debuffText: 'ฐานเสียงแตกแยกง่ายเมื่อตัดสินใจสลับขั้วร่วมรัฐบาล',
    coalitionConditionText: 'ต้องไม่ปฏิรูปกฎหมายเกี่ยวกับโครงสร้างพื้นฐานของรัฐ',
    preferredMinistries: ['JUSTICE', 'AGRICULTURE', 'EDUCATION'],
    opposesStructuralReform: true,
  },
  29: {
    ballotNumber: 29,
    name: 'พรรคไทยภักดี',
    isMajor10: true,
    popularityTier: 'LOW',
    popularityLabel: 'น้อย',
    basePopularityScore: 22,
    constituencyStrength: 0.45,
    partyListStrength: 0.72,
    ideologyBloc: 'HARDLINE_CONSERVATIVE',
    ideologyScore: 96,
    baseRegion: 'อนุรักษนิยมสุดขั้ว',
    buffText: 'แรงบีบเค้นทางอุดมการณ์สูง ปลุกมวลชนสายอุดมการณ์ได้ดี',
    debuffText: 'ไม่สามารถทำงานร่วมกับฝ่ายปฏิรูปได้เลยในทุกกรณี',
    coalitionConditionText: 'ไม่ร่วมงานกับฝ่ายปฏิรูปเด็ดขาด',
    preferredMinistries: ['DEFENSE', 'EDUCATION'],
    opposesStructuralReform: true,
    vetoIdeologyBlocs: ['PROGRESSIVE'],
  },
  33: {
    ballotNumber: 33,
    name: 'พรรคประชาชาติ',
    isMajor10: true,
    popularityTier: 'MEDIUM',
    popularityLabel: 'ปานกลาง',
    basePopularityScore: 38,
    constituencyStrength: 0.9,
    partyListStrength: 0.65,
    ideologyBloc: 'PRAGMATIC_CONSERVATIVE',
    ideologyScore: 40,
    baseRegion: '3 จังหวัดชายแดนภาคใต้',
    buffText: 'ฐานเสียงแน่นหนามากในพื้นที่ชายแดนใต้ ย้ายค่ายยาก',
    debuffText: 'ไม่สามารถขยายฐานเสียงออกนอกพื้นที่หลักได้มากนัก',
    coalitionConditionText: 'ต้องได้ดูแลนโยบายภาคใต้ วัฒนธรรม หรือกระทรวงยุติธรรม',
    preferredMinistries: ['CULTURE_SOUTH', 'JUSTICE'],
    requiresAnyMinistry: true,
  },
  37: {
    ballotNumber: 37,
    name: 'พรรคภูมิใจไทย',
    isMajor10: true,
    popularityTier: 'HIGH',
    popularityLabel: 'สูง',
    basePopularityScore: 76,
    constituencyStrength: 1.32,
    partyListStrength: 0.62,
    ideologyBloc: 'PRAGMATIC_CONSERVATIVE',
    ideologyScore: 58,
    baseRegion: 'ภาคบุรีรัมย์ / ภาคใต้ / บ้านใหญ่',
    buffText: 'ควบคุมกระทรวงระดับภูมิภาคและเครือข่าย สส. เขตเข้มแข็งมาก',
    debuffText: 'คะแนนเสียงระบบบัญชีรายชื่อ (ปาร์ตี้ลิสต์) ต่ำกว่าคู่แข่ง',
    coalitionConditionText: 'ต้องได้คุมกระทรวงเกรด A (เช่น มหาดไทย / คมนาคม / สาธารณสุข)',
    preferredMinistries: ['INTERIOR', 'TRANSPORT', 'PUBLIC_HEALTH'],
    requiresGradeAMinistry: true,
  },
  42: {
    ballotNumber: 42,
    name: 'พรรคกล้าธรรม',
    isMajor10: true,
    popularityTier: 'MEDIUM',
    popularityLabel: 'ปานกลาง',
    basePopularityScore: 48,
    constituencyStrength: 1.05,
    partyListStrength: 0.55,
    ideologyBloc: 'PRAGMATIC_CONSERVATIVE',
    ideologyScore: 55,
    baseRegion: 'บ้านใหญ่เฉพาะพื้นที่ / ภาคเหนือ',
    buffText: 'พลังเจรจาดีลลับสูง รวบรวม สส. เขตและกลุ่มอิสระได้ดี',
    debuffText: 'ภาพลักษณ์สาธารณะในกระแสสื่อติดลบง่าย',
    coalitionConditionText: 'พร้อมร่วมรัฐบาลกับใครก็ได้ที่จัดสรรโควตารัฐมนตรีให้',
    preferredMinistries: ['AGRICULTURE', 'INTERIOR'],
    requiresAnyMinistry: true,
    flexibleKingmaker: true,
  },
  43: {
    ballotNumber: 43,
    name: 'พรรคพลังประชารัฐ',
    isMajor10: true,
    popularityTier: 'MEDIUM',
    popularityLabel: 'ปานกลาง',
    basePopularityScore: 45,
    constituencyStrength: 0.98,
    partyListStrength: 0.58,
    ideologyBloc: 'HARDLINE_CONSERVATIVE',
    ideologyScore: 78,
    baseRegion: 'ท้องถิ่น / คอนเนกชันรัฐบาลเดิม',
    buffText: 'เครือข่ายข้าราชการระดับสูงและบารมีทางการเมืองสูง',
    debuffText: 'คะแนนนิยมจากประชาชนทั่วไปผันผวนสูง',
    coalitionConditionText: 'ต้องมีตำแหน่งในระดับบริหาร (โควตารัฐมนตรี)',
    preferredMinistries: ['DEFENSE', 'AGRICULTURE', 'INTERIOR'],
    requiresAnyMinistry: true,
  },
  45: {
    ballotNumber: 45,
    name: 'พรรคเป็นธรรม',
    isMajor10: true,
    popularityTier: 'LOW',
    popularityLabel: 'น้อย',
    basePopularityScore: 24,
    constituencyStrength: 0.42,
    partyListStrength: 0.78,
    ideologyBloc: 'PROGRESSIVE',
    ideologyScore: 18,
    baseRegion: 'จังหวัดชายแดนภาคใต้ / สิทธิมนุษยชน',
    buffText: 'โดดเด่นด้านนโยบายสันติภาพ สิทธิมนุษยชน และความโปร่งใส',
    debuffText: 'จำนวน สส. ในสภาน้อย อำนาจต่อรองเชิงตัวเลขจำกัด',
    coalitionConditionText: 'เน้นขับเคลื่อนกฎหมายเฉพาะและสันติภาพ ไม่เน้นเก้าอี้ รมต.',
    preferredMinistries: ['JUSTICE', 'CULTURE_SOUTH'],
    vetoPartyNumbers: [6, 29],
  },
  46: {
    ballotNumber: 46,
    name: 'พรรคประชาชน',
    isMajor10: true,
    popularityTier: 'VERY_HIGH',
    popularityLabel: 'สูงมาก',
    basePopularityScore: 92,
    constituencyStrength: 1.22,
    partyListStrength: 1.52,
    ideologyBloc: 'PROGRESSIVE',
    ideologyScore: 10,
    baseRegion: 'เมืองใหญ่ / คนรุ่นใหม่',
    buffText: 'เสียงสนับสนุนในสภาแน่วแน่ ปลุกกระแสโซเชียลมีเดียได้ดีเยี่ยม',
    debuffText: 'ถูกปฏิเสธและตั้งแง่จากพรรคฝั่งอนุรักษนิยมอย่างรุนแรง',
    coalitionConditionText: 'ต้องได้คุมกระทรวงเกรด A และไม่ร่วมงานกับพรรคอนุรักษนิยมสุดขั้ว',
    preferredMinistries: ['FINANCE', 'INTERIOR', 'EDUCATION'],
    requiresGradeAMinistry: true,
    vetoIdeologyBlocs: ['HARDLINE_CONSERVATIVE'],
  },
};

function buildAll57Parties(): PoliticalPartyDefinition[] {
  const list: PoliticalPartyDefinition[] = [];
  for (let num = 1; num <= 57; num++) {
    if (MAJOR_10_PARTIES[num]) {
      list.push(MAJOR_10_PARTIES[num]);
      continue;
    }
    const seed = MINOR_47_SEEDS.find((s) => s.ballotNumber === num);
    const name = seed?.name || `พรรคหมายเลข ${num}`;
    const bloc = seed?.bloc || 'PRAGMATIC_CONSERVATIVE';
    const score = seed?.score ?? 50;
    list.push({
      ballotNumber: num,
      name,
      isMajor10: false,
      popularityTier: 'LOW',
      popularityLabel: 'พรรคขนาดเล็ก/ทางเลือก',
      basePopularityScore: 14,
      constituencyStrength: 0.35,
      partyListStrength: 0.55,
      ideologyBloc: bloc,
      ideologyScore: score,
      baseRegion: seed?.region || 'ฐานเสียงเฉพาะกลุ่ม / บัญชีรายชื่อปัดเศษ',
      buffText: `${seed?.theme || 'คล่องตัวในการเจรจานโยบายเฉพาะจุด'} · เป็นเสียงสวรรค์ชี้ขาดช่วงเสียงปริ่มน้ำ`,
      debuffText: 'ทรัพยากรหาเสียงและจำนวน สส. ในสภามีจำกัด (1–2 ที่นั่ง)',
      coalitionConditionText: 'พร้อมโหวตหนุนจัดตั้งรัฐบาลเมื่อได้รับการสนับสนุนงบประมาณขับเคลื่อนนโยบายพรรค',
      preferredMinistries: ['CULTURE_SOUTH', 'AGRICULTURE'],
      flexibleKingmaker: true,
    });
  }
  return list;
}

export const POLITICAL_PARTIES_57: PoliticalPartyDefinition[] = buildAll57Parties();

export interface CoalitionEvaluation {
  coalitionPartyNumbers: number[];
  totalSeats: number;
  hasMajority: boolean;
  seatsShortOfMajority: number;
  ideologyMin: number;
  ideologyMax: number;
  ideologySpread: number;
  frictionIndex: number;
  estimatedStability: number;
  hardVetoReasons: string[];
  unsatisfiedConditions: string[];
  crossBlocBacklashWarnings: string[];
  canFormGovernment: boolean;
}

export class PoliticsEngine {
  static getAllParties(): PoliticalPartyDefinition[] {
    return POLITICAL_PARTIES_57;
  }

  static getMajor10Parties(): PoliticalPartyDefinition[] {
    return POLITICAL_PARTIES_57.filter((p) => p.isMajor10);
  }

  static getMinorPoolParties(): PoliticalPartyDefinition[] {
    return POLITICAL_PARTIES_57.filter((p) => !p.isMajor10);
  }

  static getPartyByNumber(ballotNumber: number | null | undefined): PoliticalPartyDefinition | null {
    if (!ballotNumber) return null;
    return POLITICAL_PARTIES_57.find((p) => p.ballotNumber === ballotNumber) || null;
  }

  static getMinistrySpec(ministryId: MinistryId | null | undefined): MinistryPortfolioSpec | null {
    if (!ministryId) return null;
    return MINISTRY_PORTFOLIOS.find((m) => m.id === ministryId) || null;
  }

  static getIdeologyBlocLabel(bloc: IdeologyBloc): string {
    switch (bloc) {
      case 'PROGRESSIVE':
        return 'ฝ่ายปฏิรูป/ก้าวหน้า';
      case 'PRAGMATIC_CONSERVATIVE':
        return 'ฝ่ายอนุรักษนิยมสายบริหาร';
      case 'HARDLINE_CONSERVATIVE':
        return 'ฝ่ายอนุรักษนิยมเข้มข้น';
    }
  }

  static getOfficeRoleLabel(role: PoliticalOfficeRole, ministryId?: MinistryId | null): string {
    switch (role) {
      case 'NONE':
        return 'ประชาชนทั่วไป (ยังไม่สังกัดพรรค)';
      case 'PARTY_MEMBER':
        return 'สมาชิกพรรค / ว่าที่ผู้สมัคร สส.';
      case 'MP':
        return 'สมาชิกสภาผู้แทนราษฎร (สส.)';
      case 'MINISTER': {
        const min = this.getMinistrySpec(ministryId);
        return min ? `รัฐมนตรีว่าการ${min.title}` : 'รัฐมนตรีร่วมคณะรัฐบาล';
      }
      case 'PARTY_LEADER':
        return 'หัวหน้าพรรค & แคนดิเดตนายกรัฐมนตรี';
      case 'PRIME_MINISTER':
        return 'นายกรัฐมนตรีแห่งราชอาณาจักรไทย';
    }
  }

  static getMonthlyPoliticalSalary(role: PoliticalOfficeRole): number {
    switch (role) {
      case 'PRIME_MINISTER':
        return 125590;
      case 'MINISTER':
        return 115740;
      case 'PARTY_LEADER':
      case 'MP':
        return 113560;
      default:
        return 0;
    }
  }

  static simulate500SeatElection(
    playerPartyNumber: number | null,
    playerCampaignBoost: number,
    switchedBlocPenaltyPartyNum: number | null,
    switchedPenaltyAmount: number
  ): {
    seatResults: PartySeatResult[];
    activeMinorNumbers: number[];
  } {
    // 1. Procedurally pick 4 minor jackpot parties from the 47-party pool (1-2 seats each)
    const minorPool = this.getMinorPoolParties();
    const chosenMinors = new Set<number>();

    if (playerPartyNumber && !this.getPartyByNumber(playerPartyNumber)?.isMajor10) {
      chosenMinors.add(playerPartyNumber);
    }

    const targetMinorCount = randomInt(3, 5);
    while (chosenMinors.size < targetMinorCount) {
      const pick = minorPool[randomInt(0, minorPool.length - 1)];
      chosenMinors.add(pick.ballotNumber);
    }

    const activeMinorNumbers = Array.from(chosenMinors).sort((a, b) => a - b);
    const minorSeatMap = new Map<number, number>();
    let totalMinorPartyListSeats = 0;

    for (const mNum of activeMinorNumbers) {
      const isPlayerMinor = mNum === playerPartyNumber;
      const baseMinorSeats =
        isPlayerMinor && playerCampaignBoost >= 25
          ? randomInt(2, 4)
          : Math.random() < 0.42
          ? 2
          : 1;
      minorSeatMap.set(mNum, baseMinorSeats);
      totalMinorPartyListSeats += baseMinorSeats;
    }

    // 2. Allocate remaining (100 - totalMinorPartyListSeats) Party-List seats + 400 Constituency seats among Major 10
    const major10 = this.getMajor10Parties();
    const remainingPartyListSeats = Math.max(80, 100 - totalMinorPartyListSeats);
    const constituencyPool = 400;

    const rawConstWeights: Array<{ num: number; w: number }> = [];
    const rawListWeights: Array<{ num: number; w: number }> = [];

    for (const party of major10) {
      let pop = party.basePopularityScore + randomInt(-7, 7);
      if (party.ballotNumber === playerPartyNumber) {
        pop += Math.round(playerCampaignBoost * 0.28);
      }
      if (party.ballotNumber === switchedBlocPenaltyPartyNum && switchedPenaltyAmount > 0) {
        pop -= switchedPenaltyAmount;
      }
      pop = clamp(pop, 8, 115);

      // Exponential shaping so top parties realistically get ~110-155 seats and small ideological parties get ~5-20 seats
      const shaped = Math.pow(pop / 10, 1.75);
      rawConstWeights.push({
        num: party.ballotNumber,
        w: Math.max(0.2, shaped * party.constituencyStrength),
      });
      rawListWeights.push({
        num: party.ballotNumber,
        w: Math.max(0.2, shaped * party.partyListStrength),
      });
    }

    const allocateProportional = (
      weights: Array<{ num: number; w: number }>,
      totalToAllocate: number
    ): Map<number, number> => {
      const sumW = weights.reduce((acc, item) => acc + item.w, 0);
      const exacts = weights.map((item) => {
        const exact = (item.w / sumW) * totalToAllocate;
        return {
          num: item.num,
          floor: Math.floor(exact),
          rem: exact - Math.floor(exact),
        };
      });
      let allocated = exacts.reduce((acc, item) => acc + item.floor, 0);
      exacts.sort((a, b) => b.rem - a.rem);
      let idx = 0;
      while (allocated < totalToAllocate) {
        exacts[idx % exacts.length].floor += 1;
        allocated += 1;
        idx += 1;
      }
      const out = new Map<number, number>();
      for (const item of exacts) {
        out.set(item.num, item.floor);
      }
      return out;
    };

    const constMap = allocateProportional(rawConstWeights, constituencyPool);
    const listMap = allocateProportional(rawListWeights, remainingPartyListSeats);

    const seatResults: PartySeatResult[] = [];

    for (const party of major10) {
      const cSeats = constMap.get(party.ballotNumber) || 0;
      const lSeats = listMap.get(party.ballotNumber) || 0;
      seatResults.push({
        ballotNumber: party.ballotNumber,
        constituencySeats: cSeats,
        partyListSeats: lSeats,
        totalSeats: cSeats + lSeats,
        isMinorJackpot: false,
      });
    }

    for (const mNum of activeMinorNumbers) {
      const mSeats = minorSeatMap.get(mNum) || 1;
      seatResults.push({
        ballotNumber: mNum,
        constituencySeats: 0,
        partyListSeats: mSeats,
        totalSeats: mSeats,
        isMinorJackpot: true,
      });
    }

    seatResults.sort((a, b) => b.totalSeats - a.totalSeats || a.ballotNumber - b.ballotNumber);
    return { seatResults, activeMinorNumbers };
  }

  static autoAllocateMinistriesForCoalition(
    coalitionNumbers: number[],
    seatResults: PartySeatResult[],
    pmPartyNumber: number
  ): Record<MinistryId, number> {
    const seatLookup = new Map<number, number>();
    for (const r of seatResults) {
      seatLookup.set(r.ballotNumber, r.totalSeats);
    }

    const sortedPartners = [...coalitionNumbers].sort(
      (a, b) => (seatLookup.get(b) || 0) - (seatLookup.get(a) || 0)
    );

    const assigned: Partial<Record<MinistryId, number>> = {};

    // First pass: satisfy top preferred ministry of each major partner in seat order
    for (const pNum of sortedPartners) {
      const pDef = this.getPartyByNumber(pNum);
      if (!pDef) continue;
      if (!pDef.isMajor10 && (seatLookup.get(pNum) || 0) <= 2) continue;

      for (const pref of pDef.preferredMinistries) {
        if (!assigned[pref]) {
          assigned[pref] = pNum;
          break;
        }
      }
    }

    // Second pass: fill remaining ministries proportionally starting with PM party
    let idx = 0;
    const majorPartners = sortedPartners.filter((n) => (seatLookup.get(n) || 0) >= 5);
    const pool = majorPartners.length > 0 ? majorPartners : [pmPartyNumber];

    for (const min of MINISTRY_PORTFOLIOS) {
      if (!assigned[min.id]) {
        assigned[min.id] = idx === 0 ? pmPartyNumber : pool[idx % pool.length];
        idx += 1;
      }
    }

    return assigned as Record<MinistryId, number>;
  }

  static evaluateCoalitionCompatibility(
    coalitionPartyNumbers: number[],
    seatResults: PartySeatResult[],
    ministryAllocations: Record<MinistryId, number>,
    pmPartyNumber: number
  ): CoalitionEvaluation {
    const uniqueNums = Array.from(new Set(coalitionPartyNumbers));
    const seatLookup = new Map<number, number>();
    for (const r of seatResults) {
      seatLookup.set(r.ballotNumber, r.totalSeats);
    }

    const totalSeats = uniqueNums.reduce((sum, num) => sum + (seatLookup.get(num) || 0), 0);
    const hasMajority = totalSeats >= MAJORITY_THRESHOLD_SEATS;
    const seatsShortOfMajority = Math.max(0, MAJORITY_THRESHOLD_SEATS - totalSeats);

    const parties = uniqueNums
      .map((n) => this.getPartyByNumber(n))
      .filter((p): p is PoliticalPartyDefinition => Boolean(p));

    if (parties.length === 0) {
      return {
        coalitionPartyNumbers: [],
        totalSeats: 0,
        hasMajority: false,
        seatsShortOfMajority: MAJORITY_THRESHOLD_SEATS,
        ideologyMin: 50,
        ideologyMax: 50,
        ideologySpread: 0,
        frictionIndex: 0,
        estimatedStability: 0,
        hardVetoReasons: ['ยังไม่ได้เลือกพรรคแกนนำจัดตั้งรัฐบาล'],
        unsatisfiedConditions: [],
        crossBlocBacklashWarnings: [],
        canFormGovernment: false,
      };
    }

    const scores = parties.map((p) => p.ideologyScore);
    const ideologyMin = Math.min(...scores);
    const ideologyMax = Math.max(...scores);
    const ideologySpread = ideologyMax - ideologyMin;

    const hardVetoReasons: string[] = [];
    const unsatisfiedConditions: string[] = [];
    const crossBlocBacklashWarnings: string[] = [];

    const hasProgressiveInCoalition = parties.some((p) => p.ideologyBloc === 'PROGRESSIVE');
    const hasHardlineInCoalition = parties.some((p) => p.ideologyBloc === 'HARDLINE_CONSERVATIVE');

    for (const p of parties) {
      // Check ideological bloc hard vetoes
      if (p.vetoIdeologyBlocs) {
        for (const bannedBloc of p.vetoIdeologyBlocs) {
          const conflicting = parties.find(
            (other) => other.ballotNumber !== p.ballotNumber && other.ideologyBloc === bannedBloc
          );
          if (conflicting) {
            hardVetoReasons.push(
              `${p.name} (เบอร์ ${p.ballotNumber}) ปฏิเสธการร่วมรัฐบาลกับ ${conflicting.name} (${this.getIdeologyBlocLabel(bannedBloc)})`
            );
          }
        }
      }

      if (p.vetoPartyNumbers) {
        for (const bannedNum of p.vetoPartyNumbers) {
          if (uniqueNums.includes(bannedNum)) {
            const bannedParty = this.getPartyByNumber(bannedNum);
            hardVetoReasons.push(
              `${p.name} ไม่ยอมจับมือร่วมรัฐบาลกับ ${bannedParty?.name || `เบอร์ ${bannedNum}`}`
            );
          }
        }
      }

      // Check Ministerial Portfolio Demands for parties with >= 6 seats
      const partySeats = seatLookup.get(p.ballotNumber) || 0;
      if (partySeats >= 6) {
        const heldMinistries = MINISTRY_PORTFOLIOS.filter(
          (m) => ministryAllocations[m.id] === p.ballotNumber
        );
        const heldGradeA = heldMinistries.some((m) => m.grade === 'A');

        if (p.requiresPmOrFinance) {
          const holdsPm = pmPartyNumber === p.ballotNumber;
          const holdsFinance = ministryAllocations.FINANCE === p.ballotNumber;
          if (!holdsPm && !holdsFinance) {
            unsatisfiedConditions.push(
              `${p.name}: ต้องได้รับตำแหน่งนายกรัฐมนตรี หรือคุมกระทรวงการคลัง`
            );
          }
        }

        if (p.requiresGradeAMinistry && !heldGradeA) {
          unsatisfiedConditions.push(
            `${p.name}: ต้องได้คุมกระทรวงเกรด A อย่างน้อย 1 กระทรวง (คลัง / มหาดไทย / คมนาคม / สาธารณสุข)`
          );
        }

        if (p.requiresAnyMinistry && heldMinistries.length === 0) {
          unsatisfiedConditions.push(`${p.name}: ต้องได้รับโควตารัฐมนตรีอย่างน้อย 1 กระทรวง`);
        }

        if (
          p.ballotNumber === 33 &&
          ministryAllocations.CULTURE_SOUTH !== 33 &&
          ministryAllocations.JUSTICE !== 33
        ) {
          unsatisfiedConditions.push(
            `พรรคประชาชาติ: ต้องการกำกับดูแล ก.วัฒนธรรม/ชายแดนใต้ หรือ ก.ยุติธรรม`
          );
        }
      }

      // Cross-bloc voter backlash warnings (Pheu Thai #9 & Democrat #27)
      if (p.ballotNumber === 9 && hasHardlineInCoalition) {
        crossBlocBacklashWarnings.push(
          'พรรคเพื่อไทยจับมือขั้วอนุรักษนิยมเข้มข้น: ฐานเสียงเดิมบางส่วนเกิดความลังเล (+12 ความขัดแย้ง)'
        );
      }
      if (p.ballotNumber === 27 && (hasProgressiveInCoalition || uniqueNums.includes(9))) {
        crossBlocBacklashWarnings.push(
          'พรรคประชาธิปัตย์ตัดสินใจสลับขั้วร่วมรัฐบาล: เสี่ยงเกิดกระแสฐานเสียงแตกแยก (+10 ความขัดแย้ง)'
        );
      }
    }

    let frictionIndex = Math.round(ideologySpread * 0.62 + Math.max(0, uniqueNums.length - 3) * 4);
    frictionIndex += unsatisfiedConditions.length * 14;
    frictionIndex += crossBlocBacklashWarnings.length * 10;
    if (hardVetoReasons.length > 0) {
      frictionIndex += 35;
    }
    frictionIndex = clamp(frictionIndex, 5, 100);

    const seatBufferBonus = hasMajority ? Math.min(18, Math.round((totalSeats - 250) * 0.25)) : -30;
    const estimatedStability = clamp(92 - Math.round(frictionIndex * 0.72) + seatBufferBonus, 10, 96);

    const canFormGovernment = hasMajority && hardVetoReasons.length === 0;

    return {
      coalitionPartyNumbers: uniqueNums,
      totalSeats,
      hasMajority,
      seatsShortOfMajority,
      ideologyMin,
      ideologyMax,
      ideologySpread,
      frictionIndex,
      estimatedStability,
      hardVetoReasons,
      unsatisfiedConditions,
      crossBlocBacklashWarnings,
      canFormGovernment,
    };
  }

  static buildAiDefaultCoalition(seatResults: PartySeatResult[]): {
    coalitionNumbers: number[];
    pmPartyNumber: number;
    ministryAllocations: Record<MinistryId, number>;
    frictionIndex: number;
    stability: number;
  } {
    const topPartyNum = seatResults[0]?.ballotNumber || 46;

    // Candidate coalition templates:
    // Option A: Progressive + Pragmatic Center (e.g. #46 + #9 + #33 + #45 + minors)
    // Option B: Pragmatic Center + Bhumjaithai + Conservatives (e.g. #9 + #37 + #42 + #43 + #6 + #33)
    const candidateFormations: Array<{ pm: number; members: number[] }> = [
      {
        pm: topPartyNum,
        members: [topPartyNum, 9, 45, 33, 42],
      },
      {
        pm: seatResults.find((s) => s.ballotNumber === 9 && s.totalSeats >= 80) ? 9 : 37,
        members: [9, 37, 42, 43, 6, 33, 27],
      },
      {
        pm: 37,
        members: [37, 42, 43, 6, 27, 29, 33],
      },
    ];

    const minorNums = seatResults.filter((s) => s.isMinorJackpot).map((s) => s.ballotNumber);

    for (const plan of candidateFormations) {
      const presentMembers = plan.members.filter((num) =>
        seatResults.some((s) => s.ballotNumber === num && s.totalSeats > 0)
      );
      // Trim down to minimum needed above 265 seats while respecting vetoes
      const trimmed: number[] = [];
      let runningSeats = 0;
      for (const m of presentMembers) {
        const testList = [...trimmed, m];
        const testAlloc = this.autoAllocateMinistriesForCoalition(testList, seatResults, plan.pm);
        const evalRes = this.evaluateCoalitionCompatibility(
          testList,
          seatResults,
          testAlloc,
          plan.pm
        );
        if (evalRes.hardVetoReasons.length === 0) {
          trimmed.push(m);
          const sObj = seatResults.find((s) => s.ballotNumber === m);
          runningSeats += sObj?.totalSeats || 0;
          if (runningSeats >= 278) break;
        }
      }

      // If hovering between 244 and 250 seats, pull in minor kingmaker parties ("เสียงสวรรค์")!
      if (runningSeats < MAJORITY_THRESHOLD_SEATS) {
        for (const mNum of minorNums) {
          if (!trimmed.includes(mNum)) {
            trimmed.push(mNum);
            runningSeats += seatResults.find((s) => s.ballotNumber === mNum)?.totalSeats || 0;
            if (runningSeats >= MAJORITY_THRESHOLD_SEATS + 4) break;
          }
        }
      }

      const finalAlloc = this.autoAllocateMinistriesForCoalition(trimmed, seatResults, plan.pm);
      const finalEval = this.evaluateCoalitionCompatibility(
        trimmed,
        seatResults,
        finalAlloc,
        plan.pm
      );
      if (finalEval.canFormGovernment) {
        return {
          coalitionNumbers: trimmed,
          pmPartyNumber: plan.pm,
          ministryAllocations: finalAlloc,
          frictionIndex: finalEval.frictionIndex,
          stability: finalEval.estimatedStability,
        };
      }
    }

    // Fallback pragmatic grand coalition
    const fallbackMembers = seatResults
      .filter((s) => {
        const p = this.getPartyByNumber(s.ballotNumber);
        return p && p.ideologyBloc !== 'PROGRESSIVE';
      })
      .map((s) => s.ballotNumber);
    const pmFallback = fallbackMembers[0] || 9;
    const alloc = this.autoAllocateMinistriesForCoalition(fallbackMembers, seatResults, pmFallback);
    const ev = this.evaluateCoalitionCompatibility(fallbackMembers, seatResults, alloc, pmFallback);
    return {
      coalitionNumbers: fallbackMembers,
      pmPartyNumber: pmFallback,
      ministryAllocations: alloc,
      frictionIndex: ev.frictionIndex,
      stability: Math.max(48, ev.estimatedStability),
    };
  }

  static createInitialPoliticsState(currentYearBE: number): PlayerPoliticsState {
    const { seatResults, activeMinorNumbers } = this.simulate500SeatElection(null, 0, null, 0);
    const aiGov = this.buildAiDefaultCoalition(seatResults);
    const pmParty = this.getPartyByNumber(aiGov.pmPartyNumber);
    const topParty = this.getPartyByNumber(seatResults[0]?.ballotNumber);

    return {
      party_number: null,
      office_role: 'NONE',
      assigned_ministry: null,
      constituency_popularity: 15,
      party_influence: 0,
      elections_won: 0,
      terms_as_minister: 0,
      terms_as_pm: 0,
      bills_passed: 0,
      switched_bloc_penalty: 0,
      last_election_year_be: currentYearBE,
      next_election_year_be: currentYearBE + 4,
      parliament_seats: seatResults,
      active_minor_party_numbers: activeMinorNumbers,
      coalition_party_numbers: aiGov.coalitionNumbers,
      pm_party_number: aiGov.pmPartyNumber,
      ministry_allocations: aiGov.ministryAllocations,
      friction_index: aiGov.frictionIndex,
      government_stability: aiGov.stability,
      coalition_negotiation_open: false,
      structural_reform_passed_in_term: false,
      last_election_headline: `${topParty?.name || 'พรรคแกนนำ'} ชนะที่นั่งสูงสุด (${seatResults[0]?.totalSeats || 0} เสียง) · ${pmParty?.name || 'พรรครัฐบาล'} เป็นแกนนำตั้งรัฐบาลผสม`,
    };
  }

  static ensurePoliticsState(player: PlayerData): PlayerPoliticsState {
    if (!player.politics) {
      const currentYearBE = player.birth_year_be + player.age;
      player.politics = this.createInitialPoliticsState(currentYearBE);
    }
    return player.politics;
  }

  static canPlayerNegotiateCoalition(player: PlayerData): boolean {
    const pol = this.ensurePoliticsState(player);
    if (!pol.party_number) return false;
    const mySeats =
      pol.parliament_seats.find((s) => s.ballotNumber === pol.party_number)?.totalSeats || 0;
    if (mySeats <= 0) return false;
    return (
      pol.office_role === 'PARTY_LEADER' ||
      pol.office_role === 'PRIME_MINISTER' ||
      pol.office_role === 'MINISTER' ||
      (pol.office_role === 'MP' && pol.party_influence >= 45)
    );
  }

  static joinOrSwitchParty(
    player: PlayerData,
    ballotNumber: number
  ): { updated: PlayerData; success: boolean; message: string } {
    if (player.age < 18) {
      return {
        updated: player,
        success: false,
        message: 'ต้องมีอายุครบ 18 ปีบริบูรณ์จึงจะสมัครสมาชิกพรรคการเมืองตามกฎหมายได้',
      };
    }
    if (player.career.prison_years_left > 0) {
      return {
        updated: player,
        success: false,
        message: 'อยู่ระหว่างต้องโทษจำคุก ไม่สามารถสมัครสมาชิกพรรคการเมืองได้',
      };
    }
    if (player.flags.is_criminal_record) {
      return {
        updated: player,
        success: false,
        message: 'ผู้เคยต้องคำพิพากษาจำคุกคดีอาญาขาดคุณสมบัติทางการเมืองตามรัฐธรรมนูญ',
      };
    }

    const targetParty = this.getPartyByNumber(ballotNumber);
    if (!targetParty) {
      return { updated: player, success: false, message: 'ไม่พบข้อมูลพรรคการเมืองหมายเลขนี้' };
    }

    const fee = 2000;
    if (player.finance.cash < fee) {
      return {
        updated: player,
        success: false,
        message: `ต้องใช้ค่าธรรมเนียมสมัครสมาชิกพรรค ${fee.toLocaleString()} บาท`,
      };
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    const pol = this.ensurePoliticsState(next);

    if (pol.party_number === ballotNumber) {
      return {
        updated: player,
        success: false,
        message: `คุณสังกัด ${targetParty.name} (เบอร์ ${ballotNumber}) อยู่แล้ว`,
      };
    }

    const prevParty = this.getPartyByNumber(pol.party_number);
    next.finance.cash -= fee;

    let switchNote = '';
    if (prevParty) {
      const ideologyJump = Math.abs(prevParty.ideologyScore - targetParty.ideologyScore);
      if (ideologyJump >= 35) {
        pol.constituency_popularity = clamp(pol.constituency_popularity - 14, 5, 100);
        pol.switched_bloc_penalty = 12;
        switchNote = ' (การย้ายพรรคข้ามขั้วอุดมการณ์ทำให้ฐานเสียงเดิมบางส่วนผิดหวัง -14 คะแนนพื้นที่)';
      } else {
        pol.constituency_popularity = clamp(pol.constituency_popularity - 5, 5, 100);
        switchNote = ' (ปรับเปลี่ยนสังกัดพรรคใหม่ -5 คะแนนพื้นที่)';
      }
      pol.party_influence = Math.max(12, Math.round(pol.party_influence * 0.45));
      if (pol.office_role === 'PRIME_MINISTER' || pol.office_role === 'MINISTER' || pol.office_role === 'MP') {
        // Resigning party membership vacates MP seat until next election
        pol.office_role = 'PARTY_MEMBER';
        pol.assigned_ministry = null;
      } else {
        pol.office_role = 'PARTY_MEMBER';
      }
    } else {
      pol.office_role = 'PARTY_MEMBER';
      const militaryBonus =
        targetParty.ideologyBloc === 'HARDLINE_CONSERVATIVE'
          ? Math.min(25, Math.round((next.career.military_merit ?? 0) * 0.6))
          : 0;
      const baseInf = 12 + Math.round(next.stats.soc * 0.18) + militaryBonus;
      pol.party_influence = clamp(baseInf, 10, 55);
      pol.constituency_popularity = clamp(
        Math.max(pol.constituency_popularity, 18 + Math.round(next.stats.soc * 0.25)),
        10,
        75
      );
    }

    pol.party_number = ballotNumber;

    return {
      updated: next,
      success: true,
      message: `สมัครเข้าสังกัด "${targetParty.name}" (หมายเลข ${ballotNumber}) สำเร็จ!${switchNote}`,
    };
  }

  static resignFromPolitics(player: PlayerData): { updated: PlayerData; message: string } {
    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    const pol = this.ensurePoliticsState(next);
    const oldParty = this.getPartyByNumber(pol.party_number);
    pol.party_number = null;
    pol.office_role = 'NONE';
    pol.assigned_ministry = null;
    pol.party_influence = 0;
    pol.coalition_negotiation_open = false;
    return {
      updated: next,
      message: `ลาออกจากสมาชิกภาพ ${oldParty?.name || 'พรรคการเมือง'} และวางมือจากตำแหน่งทางการเมืองแล้ว`,
    };
  }

  static campaignInConstituency(player: PlayerData): {
    updated: PlayerData;
    success: boolean;
    message: string;
  } {
    const pol = this.ensurePoliticsState(player);
    const party = this.getPartyByNumber(pol.party_number);
    if (!party) {
      return { updated: player, success: false, message: 'กรุณาสมัครสังกัดพรรคการเมืองก่อนลงพื้นที่หาเสียง' };
    }
    if (player.career.prison_years_left > 0 || player.career.conscription_years_left > 0) {
      return { updated: player, success: false, message: 'ไม่สามารถลงพื้นที่หาเสียงได้ในขณะนี้' };
    }
    const energyCost = 20;
    const cashCost = 8000;
    if (player.stats.energy < energyCost) {
      return {
        updated: player,
        success: false,
        message: `พลังงานไม่พอลงพื้นที่ปราศรัย (ต้องการ ${energyCost} Energy · เหลือ ${player.stats.energy})`,
      };
    }
    if (player.finance.cash < cashCost) {
      return {
        updated: player,
        success: false,
        message: `เงินสดไม่พอค่าจัดเวทีและสื่อหาเสียง (${cashCost.toLocaleString()} บาท)`,
      };
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    const nextPol = this.ensurePoliticsState(next);
    next.stats.energy -= energyCost;
    next.finance.cash -= cashCost;

    // Party trait buffs: #46 social media wave, #37/#33 strong regional roots
    const socialWaveBonus = party.ballotNumber === 46 ? 5 : 0;
    const regionalBonus = party.ballotNumber === 37 || party.ballotNumber === 33 ? 4 : 0;
    const popGain =
      8 + Math.round(next.stats.soc * 0.08) + socialWaveBonus + regionalBonus + randomInt(0, 3);
    const infGain = 5 + Math.round(next.stats.int * 0.05);

    nextPol.constituency_popularity = clamp(nextPol.constituency_popularity + popGain, 0, 100);
    nextPol.party_influence = clamp(nextPol.party_influence + infGain, 0, 100);
    next.stats.soc = clamp(next.stats.soc + 3, 0, 100);

    return {
      updated: next,
      success: true,
      message: `ลงพื้นที่พบปะประชาชนและปราศรัยโซเชียลในนาม ${party.name} (คะแนนนิยมเขต +${popGain} เป็น ${nextPol.constituency_popularity}/100 · บารมีในพรรค +${infGain})`,
    };
  }

  static buildPartyFactionInfluence(player: PlayerData): {
    updated: PlayerData;
    success: boolean;
    message: string;
  } {
    const pol = this.ensurePoliticsState(player);
    const party = this.getPartyByNumber(pol.party_number);
    if (!party) {
      return { updated: player, success: false, message: 'ต้องสังกัดพรรคการเมืองก่อนสร้างฐานบารมีในพรรค' };
    }
    const energyCost = 20;
    const cashCost = 25000;
    if (player.stats.energy < energyCost) {
      return {
        updated: player,
        success: false,
        message: `พลังงานไม่พอประชุมแกนนำพรรค (ต้องการ ${energyCost} Energy)`,
      };
    }
    if (player.finance.cash < cashCost) {
      return {
        updated: player,
        success: false,
        message: `ต้องใช้งบสนับสนุนกิจกรรมพรรค ${cashCost.toLocaleString()} บาท`,
      };
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    const nextPol = this.ensurePoliticsState(next);
    next.stats.energy -= energyCost;
    next.finance.cash -= cashCost;

    // #42 Kla Tham & #43 PPRP faction negotiation bonus
    const factionBonus = party.ballotNumber === 42 || party.ballotNumber === 43 ? 6 : 0;
    const infGain = 11 + Math.round(next.stats.soc * 0.07) + factionBonus;
    nextPol.party_influence = clamp(nextPol.party_influence + infGain, 0, 100);
    next.stats.soc = clamp(next.stats.soc + 4, 0, 100);

    return {
      updated: next,
      success: true,
      message: `ระดมทุนและประสานเสียงแกนนำภายใน ${party.name} สำเร็จ! (บารมีในพรรค +${infGain} เป็น ${nextPol.party_influence}/100)`,
    };
  }

  static challengePartyLeadership(player: PlayerData): {
    updated: PlayerData;
    success: boolean;
    message: string;
  } {
    const pol = this.ensurePoliticsState(player);
    const party = this.getPartyByNumber(pol.party_number);
    if (!party) {
      return { updated: player, success: false, message: 'ยังไม่ได้สังกัดพรรคการเมือง' };
    }
    if (pol.office_role === 'PARTY_LEADER' || pol.office_role === 'PRIME_MINISTER') {
      return { updated: player, success: false, message: 'คุณดำรงตำแหน่งผู้นำสูงสุดของพรรคอยู่แล้ว' };
    }
    if (player.age < 30) {
      return {
        updated: player,
        success: false,
        message: 'ต้องมีอายุอย่างน้อย 30 ปีบริบูรณ์จึงจะชิงตำแหน่งหัวหน้าพรรคและแคนดิเดตนายกฯ ได้',
      };
    }
    if (pol.office_role !== 'MP' && pol.office_role !== 'MINISTER' && party.isMajor10) {
      return {
        updated: player,
        success: false,
        message: 'สำหรับพรรคใหญ่ ต้องชนะเลือกตั้งเป็น สส. หรือรัฐมนตรีก่อนจึงจะชิงหัวหน้าพรรคได้',
      };
    }
    if (pol.party_influence < 65 || player.stats.soc < 62 || player.stats.int < 58) {
      return {
        updated: player,
        success: false,
        message: `ต้องการบารมีในพรรค ≥ 65 (มี ${pol.party_influence}), SOC ≥ 62 (มี ${player.stats.soc}), และ INT ≥ 58 (มี ${player.stats.int})`,
      };
    }
    if (player.stats.energy < 25) {
      return { updated: player, success: false, message: 'ต้องการพลังงาน 25 แต้มสำหรับการประชุมใหญ่สามัญประจำปีของพรรค' };
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    const nextPol = this.ensurePoliticsState(next);
    next.stats.energy -= 25;

    const winChance = clamp(
      0.55 + (nextPol.party_influence - 65) * 0.01 + (next.stats.soc - 60) * 0.006,
      0.45,
      0.96
    );

    if (Math.random() <= winChance) {
      const isPmPartyNow =
        nextPol.pm_party_number === party.ballotNumber &&
        nextPol.coalition_party_numbers.includes(party.ballotNumber);
      nextPol.office_role = isPmPartyNow && next.age >= 35 ? 'PRIME_MINISTER' : 'PARTY_LEADER';
      if (nextPol.office_role === 'PRIME_MINISTER') {
        nextPol.terms_as_pm += 1;
      }
      next.stats.san = clamp(next.stats.san + 14, 0, 100);
      next.stats.soc = clamp(next.stats.soc + 8, 0, 100);
      return {
        updated: next,
        success: true,
        message:
          nextPol.office_role === 'PRIME_MINISTER'
            ? `ที่ประชุมใหญ่ ${party.name} โหวตเลือกคุณขึ้นเป็นหัวหน้าพรรค และก้าวขึ้นดำรงตำแหน่ง "นายกรัฐมนตรี" ในฐานะแกนนำรัฐบาลทันที!`
            : `ชนะโหวตที่ประชุมใหญ่! ก้าวขึ้นดำรงตำแหน่ง "หัวหน้า${party.name}" และแคนดิเดตนายกรัฐมนตรีอย่างเป็นทางการ!`,
      };
    }

    nextPol.party_influence = Math.max(40, nextPol.party_influence - 8);
    next.stats.san = clamp(next.stats.san - 6, 0, 100);
    return {
      updated: next,
      success: false,
      message: `คะแนนโหวตในที่ประชุมใหญ่ ${party.name} แพ้เฉียดฉิว ลองสะสมบารมีในพรรคเพิ่มอีกครั้ง (-8 บารมีพรรค)`,
    };
  }

  static confirmPlayerCoalitionGovernment(
    player: PlayerData,
    selectedPartnerNumbers: number[],
    customMinistries: Record<MinistryId, number>,
    claimPmForPlayerParty: boolean
  ): { updated: PlayerData; success: boolean; message: string } {
    const pol = this.ensurePoliticsState(player);
    if (!pol.party_number) {
      return { updated: player, success: false, message: 'คุณยังไม่ได้สังกัดพรรคการเมือง' };
    }
    if (!this.canPlayerNegotiateCoalition(player)) {
      return {
        updated: player,
        success: false,
        message: 'ต้องเป็นหัวหน้าพรรค รัฐมนตรี หรือแกนนำ สส. (บารมีพรรค ≥ 45) จึงจะเป็นผู้จัดการรัฐบาลได้',
      };
    }

    const allPartners = Array.from(new Set([pol.party_number, ...selectedPartnerNumbers]));
    const seatLookup = new Map<number, number>();
    for (const s of pol.parliament_seats) {
      seatLookup.set(s.ballotNumber, s.totalSeats);
    }

    const largestPartner = [...allPartners].sort(
      (a, b) => (seatLookup.get(b) || 0) - (seatLookup.get(a) || 0)
    )[0];

    const pmPartyNumber =
      claimPmForPlayerParty && player.age >= 35 ? pol.party_number : largestPartner;

    const evalRes = this.evaluateCoalitionCompatibility(
      allPartners,
      pol.parliament_seats,
      customMinistries,
      pmPartyNumber
    );

    if (!evalRes.hasMajority) {
      return {
        updated: player,
        success: false,
        message: `เสียงรวมในสภายังได้เพียง ${evalRes.totalSeats}/500 ที่นั่ง (ขาดอีก ${evalRes.seatsShortOfMajority} เสียงจึงจะถึงเกณฑ์ 251 เสียง) ลองดึงพรรคร่วมเพิ่มหรือใช้ดีลเสียงสวรรค์พรรคเล็ก!`,
      };
    }

    if (evalRes.hardVetoReasons.length > 0) {
      return {
        updated: player,
        success: false,
        message: `ดีลล่มจากเส้นแดงทางอุดมการณ์: ${evalRes.hardVetoReasons[0]}`,
      };
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    const nextPol = this.ensurePoliticsState(next);

    nextPol.coalition_party_numbers = allPartners;
    nextPol.pm_party_number = pmPartyNumber;
    nextPol.ministry_allocations = { ...customMinistries };
    nextPol.friction_index = evalRes.frictionIndex;
    nextPol.government_stability = evalRes.estimatedStability;
    nextPol.coalition_negotiation_open = false;
    nextPol.structural_reform_passed_in_term = false;

    if (evalRes.crossBlocBacklashWarnings.length > 0) {
      nextPol.switched_bloc_penalty = 14;
      nextPol.constituency_popularity = clamp(nextPol.constituency_popularity - 8, 5, 100);
    }

    // Determine player's cabinet / PM appointment
    const playerHeldMinistry = MINISTRY_PORTFOLIOS.find(
      (m) => customMinistries[m.id] === nextPol.party_number
    );

    if (
      pmPartyNumber === nextPol.party_number &&
      (nextPol.office_role === 'PARTY_LEADER' || nextPol.office_role === 'PRIME_MINISTER') &&
      next.age >= 35
    ) {
      nextPol.office_role = 'PRIME_MINISTER';
      nextPol.assigned_ministry = playerHeldMinistry?.id || 'FINANCE';
      nextPol.terms_as_pm += 1;
      next.stats.san = clamp(next.stats.san + 18, 0, 100);
      next.stats.soc = clamp(next.stats.soc + 12, 0, 100);
      return {
        updated: next,
        success: true,
        message: `มติสภาเห็นชอบ ${evalRes.totalSeats}/500 เสียง! คุณก้าวขึ้นดำรงตำแหน่ง "นายกรัฐมนตรี" นำรัฐบาลผสม ${allPartners.length} พรรค (เสถียรภาพ ${evalRes.estimatedStability}% · ความขัดแย้ง ${evalRes.frictionIndex})`,
      };
    }

    if (playerHeldMinistry && next.age >= 35 && nextPol.party_influence >= 50) {
      if (nextPol.office_role !== 'PARTY_LEADER') {
        nextPol.office_role = 'MINISTER';
      }
      nextPol.assigned_ministry = playerHeldMinistry.id;
      nextPol.terms_as_minister += 1;
      next.stats.san = clamp(next.stats.san + 12, 0, 100);
      return {
        updated: next,
        success: true,
        message: `จัดตั้งรัฐบาลผสมสำเร็จ (${evalRes.totalSeats}/500 เสียง)! คุณได้รับแต่งตั้งดูแล "${playerHeldMinistry.title}" (เสถียรภาพ ${evalRes.estimatedStability}%)`,
      };
    }

    return {
      updated: next,
      success: true,
      message: `จัดตั้งรัฐบาลผสม ${allPartners.length} พรรคสำเร็จด้วยเสียงข้างมาก ${evalRes.totalSeats}/500 ที่นั่ง! (เสถียรภาพเริ่มต้น ${evalRes.estimatedStability}% · ความขัดแย้ง ${evalRes.frictionIndex})`,
    };
  }

  static recruitMinorKingmakerParty(
    player: PlayerData,
    minorBallotNumber: number
  ): { updated: PlayerData; success: boolean; message: string } {
    const pol = this.ensurePoliticsState(player);
    if (!pol.party_number || !pol.coalition_party_numbers.includes(pol.party_number)) {
      return {
        updated: player,
        success: false,
        message: 'พรรคของคุณต้องอยู่ในขั้วรัฐบาลเพื่อเจรจาดึงพรรคขนาดเล็กเข้าร่วมเสริมเสถียรภาพ',
      };
    }
    if (pol.coalition_party_numbers.includes(minorBallotNumber)) {
      return { updated: player, success: false, message: 'พรรคขนาดเล็กนี้ร่วมอยู่ในรัฐบาลแล้ว' };
    }

    const minorSeatObj = pol.parliament_seats.find((s) => s.ballotNumber === minorBallotNumber);
    const minorDef = this.getPartyByNumber(minorBallotNumber);
    if (!minorSeatObj || !minorDef || minorSeatObj.totalSeats <= 0) {
      return { updated: player, success: false, message: 'พรรคนี้ไม่มีที่นั่ง สส. ในสภาชุดปัจจุบัน' };
    }

    const budgetCost = 45000 * minorSeatObj.totalSeats;
    const energyCost = 15;
    if (player.finance.cash < budgetCost) {
      return {
        updated: player,
        success: false,
        message: `ต้องใช้งบสนับสนุนโครงการพื้นที่ ${budgetCost.toLocaleString()} บาท เพื่อดึงเสียงสวรรค์ ${minorSeatObj.totalSeats} ที่นั่ง`,
      };
    }
    if (player.stats.energy < energyCost) {
      return { updated: player, success: false, message: `ต้องการพลังงาน ${energyCost} แต้มเพื่อตั้งโต๊ะเจรจา` };
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    const nextPol = this.ensurePoliticsState(next);
    next.finance.cash -= budgetCost;
    next.stats.energy -= energyCost;

    nextPol.coalition_party_numbers.push(minorBallotNumber);
    nextPol.government_stability = clamp(
      nextPol.government_stability + 6 * minorSeatObj.totalSeats,
      0,
      100
    );

    const newTotalSeats = nextPol.coalition_party_numbers.reduce((sum, n) => {
      return sum + (nextPol.parliament_seats.find((s) => s.ballotNumber === n)?.totalSeats || 0);
    }, 0);

    return {
      updated: next,
      success: true,
      message: `ปิดดีล "เสียงสวรรค์" สำเร็จ! ดึง ${minorDef.name} (เบอร์ ${minorBallotNumber} · +${minorSeatObj.totalSeats} เสียง) เข้าร่วมรัฐบาล รวมเป็น ${newTotalSeats}/500 ที่นั่ง (+${6 * minorSeatObj.totalSeats}% เสถียรภาพ)`,
    };
  }

  static executeMinistryGovernance(player: PlayerData): {
    updated: PlayerData;
    success: boolean;
    message: string;
  } {
    const pol = this.ensurePoliticsState(player);
    if (!pol.party_number || !pol.coalition_party_numbers.includes(pol.party_number)) {
      return {
        updated: player,
        success: false,
        message: 'ต้องสังกัดพรรคร่วมรัฐบาลและถือครองโควตากระทรวงจึงจะบริหารงบนโยบายได้',
      };
    }

    const heldMinistry =
      this.getMinistrySpec(pol.assigned_ministry) ||
      MINISTRY_PORTFOLIOS.find((m) => pol.ministry_allocations[m.id] === pol.party_number);

    if (!heldMinistry) {
      return {
        updated: player,
        success: false,
        message: 'พรรคของคุณยังไม่ได้รับจัดสรรโควตากระทรวงในคณะรัฐมนตรีชุดนี้',
      };
    }

    const energyCost = 25;
    if (player.stats.energy < energyCost) {
      return {
        updated: player,
        success: false,
        message: `ต้องการพลังงาน ${energyCost} แต้มเพื่อตรวจราชการและเร่งรัดงบกระทรวง`,
      };
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    const nextPol = this.ensurePoliticsState(next);
    next.stats.energy -= energyCost;

    // Pheu Thai #9 economic expertise buff
    const econBuff = nextPol.party_number === 9 && heldMinistry.id === 'FINANCE' ? 5 : 0;
    const stabGain = 8 + Math.round(next.stats.int * 0.06) + econBuff;
    nextPol.government_stability = clamp(nextPol.government_stability + stabGain, 0, 100);
    nextPol.friction_index = clamp(nextPol.friction_index - 5, 5, 100);
    nextPol.constituency_popularity = clamp(nextPol.constituency_popularity + 7, 0, 100);
    nextPol.party_influence = clamp(nextPol.party_influence + 6, 0, 100);

    let extraEffect = '';
    if (
      (heldMinistry.id === 'FINANCE' || heldMinistry.id === 'TRANSPORT') &&
      next.macro_economy.current_state === 'RECESSION' &&
      Math.random() < 0.45
    ) {
      next.macro_economy.current_state = 'NORMAL';
      next.macro_economy.years_remaining = 5;
      extraEffect = ' · มาตรการกระตุ้นเศรษฐกิจช่วยพยุงประเทศพ้นภาวะถดถอย!';
    } else if (heldMinistry.id === 'PUBLIC_HEALTH') {
      next.stats.hp = clamp(next.stats.hp + 5, 0, 100);
      extraEffect = ' · ยกระดับระบบสาธารณสุข (+5 HP)';
    } else if (heldMinistry.id === 'DEFENSE') {
      next.career.military_merit = (next.career.military_merit ?? 0) + 6;
      extraEffect = ' · เสริมความสัมพันธ์กองทัพ (+6 ผลงานทหาร)';
    }

    return {
      updated: next,
      success: true,
      message: `ขับเคลื่อนผลงาน "${heldMinistry.title}" เข้าเป้า! เสถียรภาพรัฐบาล +${stabGain}% (เป็น ${nextPol.government_stability}%) · คะแนนนิยม +7${extraEffect}`,
    };
  }

  static proposeParliamentaryBill(
    player: PlayerData,
    billType: ParliamentaryBillType
  ): { updated: PlayerData; passed: boolean; message: string } {
    const pol = this.ensurePoliticsState(player);
    if (
      pol.office_role !== 'MP' &&
      pol.office_role !== 'MINISTER' &&
      pol.office_role !== 'PARTY_LEADER' &&
      pol.office_role !== 'PRIME_MINISTER'
    ) {
      return {
        updated: player,
        passed: false,
        message: 'เฉพาะ สส. รัฐมนตรี หรือนายกรัฐมนตรีเท่านั้นที่สามารถเสนอร่าง พ.ร.บ. เข้าสู่สภาได้',
      };
    }

    const energyCost = 25;
    if (player.stats.energy < energyCost) {
      return {
        updated: player,
        passed: false,
        message: `ต้องการพลังงาน ${energyCost} แต้มเพื่ออภิปรายและคุมเสียงโหวตในสภา`,
      };
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    const nextPol = this.ensurePoliticsState(next);
    next.stats.energy -= energyCost;

    const billTitles: Record<ParliamentaryBillType, string> = {
      ECONOMIC_STIMULUS: 'ร่าง พ.ร.บ. งบประมาณกระตุ้นเศรษฐกิจและลดภาระค่าครองชีพ',
      STRUCTURAL_REFORM: 'ร่าง พ.ร.บ. ปฏิรูปโครงสร้างรัฐ กระจายอำนาจ และทลายทุนผูกขาด',
      SOUTHERN_PEACE_RIGHTS: 'ร่าง พ.ร.บ. สันติภาพชายแดนใต้ พหุวัฒนธรรม และคุ้มครองสิทธิมนุษยชน',
    };

    const isPlayerInGov =
      nextPol.party_number !== null &&
      nextPol.coalition_party_numbers.includes(nextPol.party_number);

    // Count aye votes out of 500
    let ayeVotes = 0;
    const rebelPenaltyRate = nextPol.friction_index * 0.0022;

    for (const seatRow of nextPol.parliament_seats) {
      const pDef = this.getPartyByNumber(seatRow.ballotNumber);
      if (!pDef) continue;
      const inGov = nextPol.coalition_party_numbers.includes(seatRow.ballotNumber);

      if (billType === 'ECONOMIC_STIMULUS') {
        if (inGov) {
          ayeVotes += Math.round(seatRow.totalSeats * (1 - rebelPenaltyRate * 0.5));
        } else if (seatRow.ballotNumber === nextPol.party_number) {
          ayeVotes += seatRow.totalSeats;
        }
      } else if (billType === 'STRUCTURAL_REFORM') {
        if (pDef.ideologyBloc === 'PROGRESSIVE') {
          ayeVotes += seatRow.totalSeats;
        } else if (pDef.opposesStructuralReform || pDef.ideologyBloc === 'HARDLINE_CONSERVATIVE') {
          // Democrat #27, UTN #6, Thai Pakdee #29 vote against structural reform!
          ayeVotes += 0;
        } else if (inGov && isPlayerInGov) {
          ayeVotes += Math.round(seatRow.totalSeats * 0.65);
        }
      } else if (billType === 'SOUTHERN_PEACE_RIGHTS') {
        if (
          pDef.ideologyBloc === 'PROGRESSIVE' ||
          pDef.ballotNumber === 33 ||
          pDef.ballotNumber === 45 ||
          (inGov && pDef.ideologyBloc !== 'HARDLINE_CONSERVATIVE')
        ) {
          ayeVotes += Math.round(seatRow.totalSeats * 0.92);
        }
      }
    }

    // Add player's personal whip persuasion bonus
    ayeVotes = clamp(
      ayeVotes + Math.round((next.stats.int + next.stats.soc - 90) * 0.25) + randomInt(-6, 8),
      0,
      500
    );

    const passed = ayeVotes >= MAJORITY_THRESHOLD_SEATS;

    // Check Democrat #27 / Conservative backlash if structural reform pushed inside coalition
    let coalitionShock = '';
    if (billType === 'STRUCTURAL_REFORM' && isPlayerInGov) {
      const hasAntiReformPartner = nextPol.coalition_party_numbers.some(
        (n) => this.getPartyByNumber(n)?.opposesStructuralReform
      );
      if (hasAntiReformPartner) {
        nextPol.friction_index = clamp(nextPol.friction_index + 18, 0, 100);
        nextPol.government_stability = clamp(nextPol.government_stability - 16, 0, 100);
        coalitionShock =
          ' · แต่พรรคร่วมสายอนุรักษนิยมไม่พอใจอย่างหนักที่ละเมิดเงื่อนไขห้ามแก้โครงสร้างรัฐ! (ความขัดแย้ง +18, เสถียรภาพ -16%)';
      }
    }

    if (passed) {
      nextPol.bills_passed += 1;
      if (billType === 'STRUCTURAL_REFORM') {
        nextPol.structural_reform_passed_in_term = true;
      }
      nextPol.constituency_popularity = clamp(nextPol.constituency_popularity + 10, 0, 100);
      nextPol.party_influence = clamp(nextPol.party_influence + 8, 0, 100);
      next.stats.san = clamp(next.stats.san + 10, 0, 100);
      return {
        updated: next,
        passed: true,
        message: `มติสภาผ่านฉลุย ${ayeVotes}/500 เสียง! ประกาศใช้ "${billTitles[billType]}" สำเร็จ (+10 คะแนนนิยมเขต, +8 บารมีพรรค)${coalitionShock}`,
      };
    }

    if (isPlayerInGov) {
      nextPol.government_stability = clamp(nextPol.government_stability - 14, 0, 100);
    }
    next.stats.san = clamp(next.stats.san - 6, 0, 100);
    return {
      updated: next,
      passed: false,
      message: `ร่างกฎหมายถูกปัดตกด้วยเสียง ${ayeVotes}/500 (ไม่ถึง 251 เสียง)! เกิดเสียงแตกในวิปรัฐบาล${
        isPlayerInGov ? ' (เสถียรภาพรัฐบาล -14%)' : ''
      }${coalitionShock}`,
    };
  }

  static runGeneralElectionOnPlayer(
    next: PlayerData,
    reasonLabel: string
  ): string[] {
    const pol = this.ensurePoliticsState(next);
    const logs: string[] = [];
    const currentYearBE = next.birth_year_be + next.age;

    const { seatResults, activeMinorNumbers } = this.simulate500SeatElection(
      pol.party_number,
      pol.constituency_popularity,
      pol.switched_bloc_penalty > 0 ? pol.party_number : null,
      pol.switched_bloc_penalty
    );

    pol.parliament_seats = seatResults;
    pol.active_minor_party_numbers = activeMinorNumbers;
    pol.last_election_year_be = currentYearBE;
    pol.next_election_year_be = currentYearBE + 4;
    pol.switched_bloc_penalty = Math.max(0, pol.switched_bloc_penalty - 8);
    pol.structural_reform_passed_in_term = false;

    const topSeat = seatResults[0];
    const topParty = this.getPartyByNumber(topSeat?.ballotNumber);
    const minorNames = activeMinorNumbers
      .map((n) => {
        const p = this.getPartyByNumber(n);
        const s = seatResults.find((r) => r.ballotNumber === n)?.totalSeats || 1;
        return `${p?.name || `เบอร์ ${n}`} (${s})`;
      })
      .join(', ');

    logs.push(
      `[ศึกเลือกตั้งใหญ่ 500 ที่นั่ง · ${reasonLabel}] ${topParty?.name || ''} คว้าอันดับหนึ่ง ${topSeat?.totalSeats || 0} ที่นั่ง · พรรคปัดเศษเสียงสวรรค์เข้าสภา: ${minorNames}`
    );

    // Evaluate player's personal MP election race if affiliated and eligible (Age >= 25)
    const myParty = this.getPartyByNumber(pol.party_number);
    const myPartySeats =
      seatResults.find((s) => s.ballotNumber === pol.party_number)?.totalSeats || 0;

    if (
      myParty &&
      next.age >= 25 &&
      next.career.prison_years_left === 0 &&
      !next.flags.is_criminal_record
    ) {
      const electionScore =
        pol.constituency_popularity * 0.48 +
        next.stats.soc * 0.25 +
        next.stats.int * 0.12 +
        next.stats.luk * 2.2 +
        Math.min(18, myPartySeats * 0.12);

      const wonSeat = myPartySeats > 0 && electionScore >= 42;
      if (wonSeat) {
        pol.elections_won += 1;
        if (pol.office_role === 'PARTY_MEMBER' || pol.office_role === 'NONE') {
          pol.office_role = 'MP';
        } else if (pol.office_role === 'PRIME_MINISTER') {
          // Steps back to PARTY_LEADER while new coalition is formed
          pol.office_role = 'PARTY_LEADER';
        }
        pol.party_influence = clamp(pol.party_influence + 10, 0, 100);
        next.stats.san = clamp(next.stats.san + 10, 0, 100);
        logs.push(
          `[ชนะเลือกตั้งเข้าสภา!] คุณได้รับเลือกตั้งเป็น สส. สังกัด ${myParty.name} (หมายเลข ${myParty.ballotNumber} · พรรคได้รวม ${myPartySeats} ที่นั่ง)`
        );
      } else {
        pol.office_role = 'PARTY_MEMBER';
        pol.assigned_ministry = null;
        next.stats.san = clamp(next.stats.san - 6, 0, 100);
        logs.push(
          `[พ่ายศึกเลือกตั้งเขต] คะแนนเสียงในพื้นที่ยังไม่เพียงพอในรอบนี้ (พรรคได้ ${myPartySeats} ที่นั่ง · เร่งลงพื้นที่สะสมคะแนนนิยมสู้สมัยหน้า!)`
        );
      }
    }

    // Coalition formation: open interactive negotiation if player is senior leader, else AI forms coalition
    const aiGov = this.buildAiDefaultCoalition(seatResults);
    pol.coalition_party_numbers = aiGov.coalitionNumbers;
    pol.pm_party_number = aiGov.pmPartyNumber;
    pol.ministry_allocations = aiGov.ministryAllocations;
    pol.friction_index = aiGov.frictionIndex;
    pol.government_stability = aiGov.stability;

    if (this.canPlayerNegotiateCoalition(next)) {
      pol.coalition_negotiation_open = true;
      logs.push(
        `[เปิดดีลจัดตั้งรัฐบาลใหม่!] ในฐานะแกนนำ ${myParty?.name || ''} คุณสามารถเข้าไปที่แท็บ "สภา & การเมือง" เพื่อจับขั้วรวบรวมเสียง 251+ ที่นั่งและแบ่งโควตากระทรวงได้ด้วยตนเอง!`
      );
    } else {
      pol.coalition_negotiation_open = false;
      // Check if player's party joined AI government and appoints player as Minister
      if (
        pol.party_number &&
        aiGov.coalitionNumbers.includes(pol.party_number) &&
        (pol.office_role === 'MP' || pol.office_role === 'MINISTER') &&
        next.age >= 35 &&
        pol.party_influence >= 58
      ) {
        const partyMin = MINISTRY_PORTFOLIOS.find(
          (m) => aiGov.ministryAllocations[m.id] === pol.party_number
        );
        if (partyMin) {
          pol.office_role = 'MINISTER';
          pol.assigned_ministry = partyMin.id;
          pol.terms_as_minister += 1;
          logs.push(
            `[โปรดเกล้าฯ ครม. ชุดใหม่] คุณได้รับโควตาพรรคร่วมรัฐบาล ดำรงตำแหน่ง "รัฐมนตรีว่าการ${partyMin.title}"!`
          );
        }
      } else if (pol.office_role === 'MINISTER') {
        pol.office_role = 'MP';
        pol.assigned_ministry = null;
      }
    }

    const pmParty = this.getPartyByNumber(pol.pm_party_number);
    pol.last_election_headline = `พ.ศ. ${currentYearBE}: ${topParty?.name || ''} ชนะ ${topSeat?.totalSeats || 0} ที่นั่ง · รัฐบาลผสมนำโดย ${pmParty?.name || ''} (${aiGov.coalitionNumbers.reduce((s, n) => s + (seatResults.find((r) => r.ballotNumber === n)?.totalSeats || 0), 0)}/500 เสียง)`;

    return logs;
  }

  static triggerManualSnapDissolution(player: PlayerData): {
    updated: PlayerData;
    success: boolean;
    message: string;
  } {
    const pol = this.ensurePoliticsState(player);
    if (pol.office_role !== 'PRIME_MINISTER') {
      return {
        updated: player,
        success: false,
        message: 'เฉพาะผู้ดำรงตำแหน่งนายกรัฐมนตรีเท่านั้นที่มีอำนาจประกาศยุบสภาผู้แทนราษฎร',
      };
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    const logs = this.runGeneralElectionOnPlayer(next, 'นายกรัฐมนตรีประกาศยุบสภาคืนอำนาจให้ประชาชน');
    next.pending_year_logs = [...(next.pending_year_logs || []), ...logs];

    return {
      updated: next,
      success: true,
      message: 'ประกาศพระราชกฤษฎีกายุบสภาผู้แทนราษฎร! จัดการเลือกตั้งใหญ่ 500 ที่นั่งใหม่ทันที',
    };
  }

  static processYearlyPoliticsTick(next: PlayerData): {
    politicalGrossIncome: number;
    logs: string[];
  } {
    const pol = this.ensurePoliticsState(next);
    const logs: string[] = [];
    let politicalGrossIncome = 0;
    const currentYearBE = next.birth_year_be + next.age;

    // Disqualify if imprisoned or convicted
    if (
      (next.career.prison_years_left > 0 || next.flags.is_criminal_record) &&
      pol.office_role !== 'NONE'
    ) {
      pol.office_role = 'NONE';
      pol.party_number = null;
      pol.assigned_ministry = null;
      pol.coalition_negotiation_open = false;
      logs.push('[พ้นสมาชิกภาพทางการเมือง] ขาดคุณสมบัติตามรัฐธรรมนูญเนื่องจากต้องคำพิพากษาคดีอาญา');
      return { politicalGrossIncome: 0, logs };
    }

    // Pay official parliamentary / cabinet remuneration if holding elected/cabinet office
    const monthlyPay = this.getMonthlyPoliticalSalary(pol.office_role);
    if (monthlyPay > 0 && next.career.prison_years_left === 0) {
      politicalGrossIncome = monthlyPay * 12;
      const roleTitle = this.getOfficeRoleLabel(pol.office_role, pol.assigned_ministry);
      logs.push(
        `รับเงินประจำตำแหน่งและเงินเพิ่ม "${roleTitle}" รวม +${politicalGrossIncome.toLocaleString()} บาท/ปี`
      );
      pol.party_influence = clamp(pol.party_influence + 3, 0, 100);
    }

    // Ongoing Friction Index wear on Government Stability
    const stabilityWear = Math.max(2, Math.round(pol.friction_index * 0.22));
    pol.government_stability = clamp(pol.government_stability - stabilityWear, 0, 100);

    // Check Snap Dissolution if Government Collapses (รัฐบาลล่ม) before 4-year term!
    if (pol.government_stability <= 0 && currentYearBE < pol.next_election_year_be) {
      logs.push(
        `[รัฐบาลล่มกลางคัน!] ค่าความขัดแย้งพรรคร่วมพุ่งสูงจนองค์ประชุมสภาล่มซ้ำซาก รัฐบาลต้องประกาศยุบสภาจัดเลือกตั้งใหม่ก่อนครบวาระ!`
      );
      const snapLogs = this.runGeneralElectionOnPlayer(next, 'ยุบสภาหลังวิกฤตรัฐบาลล่ม');
      logs.push(...snapLogs);
    } else if (currentYearBE >= pol.next_election_year_be) {
      const regularLogs = this.runGeneralElectionOnPlayer(next, 'ครบวาระสภาผู้แทนราษฎร 4 ปี');
      logs.push(...regularLogs);
    }

    return { politicalGrossIncome, logs };
  }
}
