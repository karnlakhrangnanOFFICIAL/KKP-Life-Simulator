import {
  BirthLocation,
  CityDistrictId,
  LocalContact,
  PlayerData,
  StreetEncounterLog,
  StreetEncounterReaction,
  StreetWorldState,
} from '../engine/types';
import { EnergySystem } from './energy_system';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export const STROLL_ENERGY_COST = 5;
export const MAX_AUTO_COMMUTE_TRIGGERS_PER_YEAR = 2;

export const DISTRICT_LABELS: Record<CityDistrictId, Record<BirthLocation, string>> = {
  RESIDENTIAL_SOI: {
    BANGKOK: 'ปากซอยที่พักและตลาดนัดเย็น',
    PROVINCIAL: 'ซอยชุมชนหน้าตลาดเทศบาล',
    REMOTE: 'ทางแยกศาลาปากทางหมู่บ้าน',
  },
  ATHLETIC_CLUB: {
    BANGKOK: 'ทางเดินเลียบศูนย์กีฬาและสวนสุขภาพ',
    PROVINCIAL: 'ลานวิ่งสนามกีฬากลางจังหวัด',
    REMOTE: 'ลานดินข้างค่ายมวยและสนามหญ้าชุมชน',
  },
  CAMPUS_ZONE: {
    BANGKOK: 'ฟุตบาทหน้าสถานศึกษาและร้านถ่ายเอกสาร',
    PROVINCIAL: 'ถนนสายสถานศึกษาประจำจังหวัด',
    REMOTE: 'ซุ้มม้านั่งหน้าโรงเรียนชุมชน',
  },
  BUSINESS_MARKET: {
    BANGKOK: 'สกายวอล์กและป้ายรถเมล์ย่านออฟฟิศ',
    PROVINCIAL: 'ย่านการค้าหอนาฬิกาและท่ารถสองแถว',
    REMOTE: 'จุดรอรถโดยสารเข้าตัวอำเภอ',
  },
  BACK_ALLEY: {
    BANGKOK: 'ตรอกไฟสลัวหลังตลาดโต้รุ่ง',
    PROVINCIAL: 'ซอยเปลี่ยวหลังท่ารถเก่า',
    REMOTE: 'เพิงพักริมทางสายรองยามวิกาล',
  },
  COMMERCIAL_PLAZA: {
    BANGKOK: 'ทางเชื่อมห้างสรรพสินค้าและย่านโชว์รูม',
    PROVINCIAL: 'ถนนสายเศรษฐกิจหน้าธนาคาร',
    REMOTE: 'ตลาดนัดใหญ่ประจำตำบล',
  },
};

const TIME_OF_DAY_POOL = [
  'เช้ามืดควันหมูปิ้งหอมกรุ่น',
  'สายแดดอ่อนริมทางเท้า',
  'บ่ายแก่ไอร้อนระยิบ',
  'เย็นย่ำหลังเลิกงาน',
  'พลบค่ำไฟนีออนริมซอย',
];

interface LocalContactBlueprint {
  key: 'SOI_VENDOR' | 'MOTO_RIDER' | 'CORNER_SHOP' | 'SOI_CAT' | 'SECURITY_GUARD' | 'BARISTA_YOUTH';
  byLocation: Record<BirthLocation, { name: string; role: string }>;
}

const LOCAL_CONTACT_BLUEPRINTS: LocalContactBlueprint[] = [
  {
    key: 'SOI_VENDOR',
    byLocation: {
      BANGKOK: { name: 'ป้าต้อย หมูปิ้งเตาถ่าน', role: 'แม่ค้ารถเข็นปากซอย' },
      PROVINCIAL: { name: 'ป้านวล ข้าวเหนียวหมูทอด', role: 'แม่ค้าตลาดเช้าเทศบาล' },
      REMOTE: { name: 'ยายคำ แผงผักพื้นบ้าน', role: 'ผู้เฒ่าขายกับข้าวปากทาง' },
    },
  },
  {
    key: 'MOTO_RIDER',
    byLocation: {
      BANGKOK: { name: 'พี่เอก วินเสื้อกั๊กเบอร์ 4', role: 'วินมอเตอร์ไซค์ประจำซอย' },
      PROVINCIAL: { name: 'น้าชาติ สองแถวฟ้า', role: 'คนขับรถสองแถวคิวตลาด' },
      REMOTE: { name: 'ลุงบุญ รถพุ่มพวง', role: 'คนขับรถกับข้าวเคลื่อนที่' },
    },
  },
  {
    key: 'CORNER_SHOP',
    byLocation: {
      BANGKOK: { name: 'เฮียหมง ร้านชำปากตรอก', role: 'เจ้าของร้านโชห่วยเก่าแก่' },
      PROVINCIAL: { name: 'อาแปะชัย กาแฟโบราณ', role: 'เจ้าของร้านสภากาแฟ' },
      REMOTE: { name: 'น้าสม ร้านชำหน้าวัด', role: 'เจ้าของร้านค้าประจำหมู่บ้าน' },
    },
  },
  {
    key: 'SOI_CAT',
    byLocation: {
      BANGKOK: { name: 'เจ้าส้ม แมวจรหน้าเซเว่น', role: 'ขาใหญ่ประจำจุดตากแอร์' },
      PROVINCIAL: { name: 'เจ้าทองแดง หมาร้านกาแฟ', role: 'สุนัขแสนรู้ประจำซอย' },
      REMOTE: { name: 'เจ้าด่าง ศาลาปากทาง', role: 'สุนัขเฝ้าทางเข้าหมู่บ้าน' },
    },
  },
  {
    key: 'SECURITY_GUARD',
    byLocation: {
      BANGKOK: { name: 'ลุงหมาย รปภ. กะดึก', role: 'ยามรักษาความปลอดภัยท้ายซอย' },
      PROVINCIAL: { name: 'จ่าเข้ม อปพร.', role: 'อาสาป้องกันภัยชุมชน' },
      REMOTE: { name: 'พ่อผู้ใหญ่สิน', role: 'ผู้นำชุมชนดูแลความสงบ' },
    },
  },
  {
    key: 'BARISTA_YOUTH',
    byLocation: {
      BANGKOK: { name: 'น้องมิ้นต์ กาแฟรถเข็น', role: 'บาริสต้าร้านชงริมฟุตบาท' },
      PROVINCIAL: { name: 'น้องภูมิ ร้านซ่อมมือถือ', role: 'ช่างหนุ่มอัธยาศัยดีหน้าตลาด' },
      REMOTE: { name: 'พี่ก้อง ช่างซ่อมมอเตอร์ไซค์', role: 'ช่างประจำเพิงซ่อมรถปากทาง' },
    },
  },
];

interface StreetSnippetTemplate {
  id: string;
  allowedDistricts?: CityDistrictId[];
  allowedLocations?: BirthLocation[];
  minAge?: number;
  contactKey?: LocalContactBlueprint['key'];
  buildSnippet: (ctx: {
    player: PlayerData;
    contactName?: string;
    hasVehicle: boolean;
  }) => {
    snippet: string;
    sanDelta: number;
    localAffinityDelta: number;
    socDelta: number;
    cashDelta?: number;
    reaction?: StreetEncounterReaction;
  };
}

const STREET_SNIPPET_TEMPLATES: StreetSnippetTemplate[] = [
  {
    id: 'SOI_VENDOR_WARM_GREETING',
    allowedDistricts: ['RESIDENTIAL_SOI', 'BUSINESS_MARKET'],
    contactKey: 'SOI_VENDOR',
    buildSnippet: ({ contactName }) => ({
      snippet: `เดินผ่านหน้ารถเข็นควันฉุย ${contactName}จำหน้าคุณได้แม่น ตะโกนทักทายเสียงใสพร้อมแถมข้าวเหนียวร้อนๆ ให้ฟรีห่อหนึ่ง`,
      sanDelta: 3,
      localAffinityDelta: 4,
      socDelta: 1,
      reaction: {
        promptLabel: 'อุดหนุนเพิ่มฝากเพื่อนบ้าน (-25 บ.)',
        cashCost: 25,
        bonusSan: 2,
        bonusAffinity: 4,
        bonusSoc: 1,
        outcomeSnippet: `${contactName}ยิ้มแก้มปริ อวยพรให้วันนี้เฮงๆ ตลอดวัน`,
      },
    }),
  },
  {
    id: 'STRAY_PET_COMFORT',
    allowedDistricts: ['RESIDENTIAL_SOI', 'COMMERCIAL_PLAZA', 'CAMPUS_ZONE'],
    contactKey: 'SOI_CAT',
    buildSnippet: ({ contactName }) => ({
      snippet: `${contactName}เดินบิดขี้เกียจเข้ามาคลอเคลียขาคุณหน้าประตูเลื่อนอัตโนมัติ ทำตาแป๋วเหมือนช่วยปลอบประโลมความเหนื่อยล้าของวัน`,
      sanDelta: 4,
      localAffinityDelta: 2,
      socDelta: 0,
      reaction: {
        promptLabel: 'แบ่งขนม/ลูกชิ้นปิ้งให้ (-15 บ.)',
        cashCost: 15,
        bonusSan: 3,
        bonusAffinity: 3,
        bonusSoc: 1,
        outcomeSnippet: `${contactName}เคี้ยวตุ้ยๆ อย่างอารมณ์ดี คนเดินผ่านไปมาแอบยิ้มเอ็นดูตามไปด้วย`,
      },
    }),
  },
  {
    id: 'MOTO_RIDER_SHORTCUT_TIP',
    allowedDistricts: ['BUSINESS_MARKET', 'RESIDENTIAL_SOI', 'COMMERCIAL_PLAZA'],
    contactKey: 'MOTO_RIDER',
    buildSnippet: ({ contactName, hasVehicle }) => ({
      snippet: hasVehicle
        ? `จอดติดไฟแดงข้างคิวรถ ${contactName}พยักหน้าทักและชี้บอกทางลัดเลี่ยงจุดทำถนนข้างหน้า ช่วยประหยัดเวลาเดินทางไปได้โข`
        : `ระหว่างเดินเลียบทางเท้า ${contactName}ตะโกนเตือนว่าข้างหน้ามีท่อระบายน้ำชำรุดให้เดินเลี่ยงฝั่งร่มไม้แทน`,
      sanDelta: 2,
      localAffinityDelta: 4,
      socDelta: 1,
      reaction: {
        promptLabel: 'ซื้อเครื่องดื่มเกลือแร่ฝาก (-20 บ.)',
        cashCost: 20,
        bonusSan: 2,
        bonusAffinity: 5,
        bonusSoc: 2,
        outcomeSnippet: `${contactName}ยกมือขอบคุณ บอกว่ามีธุระด่วนในซอยเมื่อไหร่เรียกใช้ได้เสมอ`,
      },
    }),
  },
  {
    id: 'LOOSE_FOOTPATH_TILE_SPLASH',
    allowedLocations: ['BANGKOK', 'PROVINCIAL'],
    allowedDistricts: ['BUSINESS_MARKET', 'CAMPUS_ZONE', 'COMMERCIAL_PLAZA'],
    buildSnippet: () => ({
      snippet:
        'ก้าวเหยียบแผ่นปูทางเท้าที่กระดกซ่อนน้ำขังจากเมื่อคืน น้ำกระเซ็นใส่ขากางเกงเต็มๆ ต้องแวะเช็ดออกอย่างเซ็งอารมณ์เล็กน้อย',
      sanDelta: -2,
      localAffinityDelta: 0,
      socDelta: 0,
    }),
  },
  {
    id: 'CORNER_SHOP_SMALL_TALK',
    allowedDistricts: ['RESIDENTIAL_SOI', 'BACK_ALLEY'],
    contactKey: 'CORNER_SHOP',
    buildSnippet: ({ contactName, player }) => ({
      snippet:
        player.macro_economy.current_state === 'RECESSION'
          ? `แวะหลบแดดหน้าร้าน ${contactName}ชวนคุยบ่นเรื่องของแพงแต่ยังรินน้ำชาเย็นๆ ให้จิบฟรีตามประสาคนคุ้นเคยในละแวกเดียวกัน`
          : `เดินผ่านหน้าร้าน ${contactName}โบกพัดไปมาพลางเล่าข่าวสารความเคลื่อนไหวของคนในซอยให้ฟังอย่างเป็นกันเอง`,
      sanDelta: 2,
      localAffinityDelta: 4,
      socDelta: 1,
    }),
  },
  {
    id: 'SUDDEN_TROPICAL_AWNING_SHELTER',
    buildSnippet: () => ({
      snippet:
        'ฝนไล่ช้างเทลงมากะทันหัน ต้องวิ่งหลบใต้กันสาดร้านค้าข้างทาง ยืนฟังเสียงเม็ดฝนกระทบสังกะสีร่วมกับผู้คนแปลกหน้าที่ยิ้มให้กันบางๆ',
      sanDelta: 2,
      localAffinityDelta: 2,
      socDelta: 1,
      reaction: {
        promptLabel: 'ขยับแบ่งที่ร่มให้คุณยายข้างๆ (ฟรี)',
        cashCost: 0,
        bonusSan: 3,
        bonusAffinity: 4,
        bonusSoc: 1,
        outcomeSnippet: 'คุณยายกล่าวขอบคุณยกใหญ่ สร้างความรู้สึกอบอุ่นใจท่ามกลางสายฝนเย็นฉ่ำ',
      },
    }),
  },
  {
    id: 'MODIFIED_EXHAUST_NOISE',
    allowedDistricts: ['RESIDENTIAL_SOI', 'BACK_ALLEY', 'BUSINESS_MARKET'],
    buildSnippet: () => ({
      snippet:
        'มอเตอร์ไซค์ท่อดังบิดเร่งเครื่องผ่านหน้าไปในระยะประชิด เสียงกัมปนาททำเอาสะดุ้งโหยงและหูอื้อไปชั่วขณะ',
      sanDelta: -3,
      localAffinityDelta: -1,
      socDelta: 0,
    }),
  },
  {
    id: 'ATHLETIC_PARK_ENCOURAGEMENT',
    allowedDistricts: ['ATHLETIC_CLUB'],
    buildSnippet: ({ player }) => ({
      snippet:
        player.stats.ath >= 55
          ? 'ระหว่างเดินวอร์มผ่านลานกีฬา เด็กๆ ในชุมชนแอบกระซิบชมท่าทางทะมัดทะแมงของคุณแล้ววิ่งเข้ามาขอดูเทคนิคด้วยความตื่นเต้น'
          : 'กลิ่นหญ้าตัดใหม่และเสียงนกหวีดซ้อมกีฬาเบาๆ รอบสนามช่วยให้สมองปลอดโปร่ง โล่งจากเรื่องวุ่นวายประจำวัน',
      sanDelta: 4,
      localAffinityDelta: 3,
      socDelta: 2,
    }),
  },
  {
    id: 'SECURITY_GUARD_NOD',
    allowedDistricts: ['RESIDENTIAL_SOI', 'COMMERCIAL_PLAZA', 'BACK_ALLEY'],
    contactKey: 'SECURITY_GUARD',
    buildSnippet: ({ contactName }) => ({
      snippet: `${contactName}เดินตรวจความเรียบร้อยผ่านมาพอดี ยกไฟฉายแตะหมวกทักทายคุณอย่างสุภาพและเตือนให้ระวังกระเป๋าสตางค์ช่วงคนพลุกพล่าน`,
      sanDelta: 2,
      localAffinityDelta: 3,
      socDelta: 1,
    }),
  },
  {
    id: 'BARISTA_EXTRA_ICE_SMILE',
    allowedDistricts: ['CAMPUS_ZONE', 'BUSINESS_MARKET', 'COMMERCIAL_PLAZA'],
    contactKey: 'BARISTA_YOUTH',
    buildSnippet: ({ contactName }) => ({
      snippet: `เดินผ่านซุ้มเครื่องดื่ม ${contactName}จำเมนูโปรดของคุณได้ ชวนคุยเรื่องเพลงฮิตช่วงนี้ด้วยรอยยิ้มสดใสทำให้อารมณ์ดีขึ้นทันตา`,
      sanDelta: 3,
      localAffinityDelta: 3,
      socDelta: 2,
      reaction: {
        promptLabel: 'ทิปใส่กระป๋องกำลังใจ (-10 บ.)',
        cashCost: 10,
        bonusSan: 2,
        bonusAffinity: 3,
        bonusSoc: 1,
        outcomeSnippet: `${contactName}กล่าวขอบคุณเสียงดังฟังชัด แถมน้ำแข็งบดเย็นเจี๊ยบให้เต็มแก้ว`,
      },
    }),
  },
  {
    id: 'NEIGHBOR_PARKING_FRICTION',
    allowedDistricts: ['RESIDENTIAL_SOI', 'COMMERCIAL_PLAZA'],
    buildSnippet: () => ({
      snippet:
        'มีรถจอดขวางทางเข้าออกแคบๆ ในซอยจนคนเดินผ่านต้องเบียดตัวหลบ เกิดเสียงบ่นพึมพำกระทบกระทั่งกับคนแถวนั้นเล็กน้อย',
      sanDelta: -2,
      localAffinityDelta: -3,
      socDelta: 0,
      reaction: {
        promptLabel: 'ช่วยโบกบอกจังหวะถอยรถอย่างใจเย็น (ฟรี)',
        cashCost: 0,
        bonusSan: 2,
        bonusAffinity: 5,
        bonusSoc: 2,
        outcomeSnippet: 'คู่กรณียกมือไหว้ขอโทษและขอบคุณที่คุณช่วยคลี่คลายสถานการณ์จนทางกลับมาโล่ง',
      },
    }),
  },
  {
    id: 'BUSKER_NOSTALGIC_MELODY',
    allowedDistricts: ['CAMPUS_ZONE', 'BUSINESS_MARKET', 'COMMERCIAL_PLAZA'],
    buildSnippet: () => ({
      snippet:
        'เสียงกีตาร์โปร่งเพลงไทยยุคเก่าลอยตามลมมาจากมุมสะพานลอย ท่วงทำนองเรียบง่ายช่วยชะลอจังหวะก้าวเดินที่เร่งรีบให้สงบลง',
      sanDelta: 4,
      localAffinityDelta: 1,
      socDelta: 0,
      reaction: {
        promptLabel: 'หยอดเหรียญใส่กล่องเปิดหมวก (-20 บ.)',
        cashCost: 20,
        bonusSan: 2,
        bonusAffinity: 2,
        bonusSoc: 1,
        outcomeSnippet: 'นักดนตรีเปิดหมวกพยักหน้ายิ้มขอบคุณและดีดคอร์ดส่งท้ายอย่างมีพลัง',
      },
    }),
  },
  {
    id: 'BACK_ALLEY_WHISPERS',
    allowedDistricts: ['BACK_ALLEY'],
    minAge: 14,
    buildSnippet: ({ player }) => ({
      snippet:
        player.career.notoriety >= 30
          ? 'เดินลัดผ่านตรอกมืด สายตาคนคุ้นหน้าในเงาสลัวหลีกทางให้เงียบๆ พร้อมส่งซิกว่าคืนนี้มีสายตรวจวนอยู่ถนนใหญ่'
          : 'กลิ่นชื้นของกำแพงอิฐเก่าและแสงไฟนีออนกะพริบในตรอกแคบชวนให้ระแวดระวังตัว ต้องรีบสาวเท้าเดินทะลุออกถนนหลัก',
      sanDelta: player.career.notoriety >= 30 ? 1 : -2,
      localAffinityDelta: player.career.notoriety >= 30 ? 2 : 0,
      socDelta: 1,
    }),
  },
  {
    id: 'NEIGHBOR_OVER_FENCE_FRUIT',
    allowedDistricts: ['RESIDENTIAL_SOI'],
    buildSnippet: () => ({
      snippet:
        'เพื่อนบ้านรั้วติดกันเรียกไว้ขณะคุณกำลังเดินผ่าน ยื่นถุงมะม่วงสุกจากต้นหลังบ้านแบ่งให้ชิมด้วยไมตรีจิตแบบไทยๆ',
      sanDelta: 4,
      localAffinityDelta: 5,
      socDelta: 1,
    }),
  },
  {
    id: 'FOUND_FORGOTTEN_TWENTY_BAHT',
    buildSnippet: () => ({
      snippet:
        'ล้วงกระเป๋าเสื้อคลุมระหว่างเดินรับลมริมถนน เจอแบงก์ยี่สิบพับซ่อนอยู่ตั้งแต่เมื่อไหร่ไม่รู้ เป็นความสุขเล็กๆ ที่เรียกรอยยิ้มมุมปากได้ทันที',
      sanDelta: 3,
      localAffinityDelta: 0,
      socDelta: 0,
      cashDelta: 20,
    }),
  },
  {
    id: 'CROWDS_RUSH_BUMP',
    allowedLocations: ['BANGKOK'],
    allowedDistricts: ['BUSINESS_MARKET', 'COMMERCIAL_PLAZA'],
    buildSnippet: () => ({
      snippet:
        'คลื่นผู้คนชั่วโมงเร่งด่วนเบียดเสียดกันตรงทางขึ้นลงสถานี มีคนเดินชนไหล่คุณอย่างจังโดยไม่หันมามอง ทำเอาหงุดหงิดใจชั่ววูบ',
      sanDelta: -2,
      localAffinityDelta: -1,
      socDelta: 0,
    }),
  },
  {
    id: 'RURAL_EVENING_BREEZE',
    allowedLocations: ['PROVINCIAL', 'REMOTE'],
    buildSnippet: () => ({
      snippet:
        'สายลมเย็นพัดกลิ่นดินและรวงข้าวผ่านถนนซอยยามเย็น ผู้เฒ่าที่นั่งสานตะกร้าอยู่หน้าบ้านเอ่ยทักถามสารทุกข์สุกดิบอย่างอบอุ่น',
      sanDelta: 4,
      localAffinityDelta: 4,
      socDelta: 1,
    }),
  },
];

export class StreetEncounterEngine {
  static createInitialStreetWorld(
    location: BirthLocation,
    inheritedAffinity?: number
  ): StreetWorldState {
    const startAffinity = clamp(inheritedAffinity ?? 50, 25, 80);
    const starterBlueprints = [LOCAL_CONTACT_BLUEPRINTS[0], LOCAL_CONTACT_BLUEPRINTS[3]];
    const known_locals: LocalContact[] = starterBlueprints.map((bp) => ({
      id: bp.key,
      name: bp.byLocation[location].name,
      role: bp.byLocation[location].role,
      affinity: startAffinity,
      encounters: 1,
    }));

    return {
      neighborhood_affinity: startAffinity,
      commute_encounters_this_year: 0,
      known_locals,
      recent_snippets: [],
    };
  }

  static ensureStreetWorld(player: PlayerData): StreetWorldState {
    if (!player.street_world) {
      player.street_world = this.createInitialStreetWorld(player.background.location);
    }
    return player.street_world;
  }

  static getAffinityTierLabel(affinity: number): string {
    if (affinity >= 85) return 'ขวัญใจประจำย่าน';
    if (affinity >= 65) return 'มิตรรักคนในชุมชน';
    if (affinity >= 45) return 'คนคุ้นหน้าในซอย';
    if (affinity >= 25) return 'ต่างคนต่างอยู่';
    return 'เพื่อนบ้านเขม่น';
  }

  static mapTabToDistrict(
    tab: 'TIMELINE' | 'ATHLETICS' | 'EDUCATION' | 'CAREER' | 'UNDERWORLD' | 'ASSETS' | 'SCHEMA'
  ): CityDistrictId | null {
    switch (tab) {
      case 'TIMELINE':
        return 'RESIDENTIAL_SOI';
      case 'ATHLETICS':
        return 'ATHLETIC_CLUB';
      case 'EDUCATION':
        return 'CAMPUS_ZONE';
      case 'CAREER':
        return 'BUSINESS_MARKET';
      case 'UNDERWORLD':
        return 'BACK_ALLEY';
      case 'ASSETS':
        return 'COMMERCIAL_PLAZA';
      case 'SCHEMA':
        return null;
    }
  }

  static canMoveInCity(player: PlayerData): { allowed: boolean; reason?: string } {
    if (!player.is_alive) {
      return { allowed: false, reason: 'ตัวละครเสียชีวิตแล้ว' };
    }
    if (player.age < 5) {
      return { allowed: false, reason: 'วัยทารกยังไม่ออกเดินลำพังนอกบ้าน (เริ่มอายุ 5 ปีขึ้นไป)' };
    }
    if (player.career.prison_years_left > 0) {
      return { allowed: false, reason: 'ถูกคุมขังอยู่ในเรือนจำ ไม่สามารถเดินออกสู่ย่านเมืองได้' };
    }
    if (player.career.conscription_years_left > 0) {
      return { allowed: false, reason: 'ประจำการอยู่ในค่ายทหาร' };
    }
    return { allowed: true };
  }

  static generateSnippetForDistrict(
    player: PlayerData,
    districtId: CityDistrictId
  ): StreetEncounterLog {
    const location = player.background.location;
    const hasVehicle = player.assets.some((a) => a.type === 'VEHICLE');
    const street = this.ensureStreetWorld(player);

    const candidates = STREET_SNIPPET_TEMPLATES.filter((tpl) => {
      if (tpl.minAge && player.age < tpl.minAge) return false;
      if (tpl.allowedLocations && !tpl.allowedLocations.includes(location)) return false;
      if (tpl.allowedDistricts && !tpl.allowedDistricts.includes(districtId)) return false;
      return true;
    });

    const chosen =
      candidates.length > 0 ? pickRandom(candidates) : STREET_SNIPPET_TEMPLATES[0];

    let contactObj: LocalContact | undefined;
    if (chosen.contactKey) {
      const bp = LOCAL_CONTACT_BLUEPRINTS.find((b) => b.key === chosen.contactKey);
      if (bp) {
        contactObj = street.known_locals.find((c) => c.id === bp.key);
        if (!contactObj) {
          contactObj = {
            id: bp.key,
            name: bp.byLocation[location].name,
            role: bp.byLocation[location].role,
            affinity: street.neighborhood_affinity,
            encounters: 0,
          };
          street.known_locals.push(contactObj);
        }
      }
    }

    const built = chosen.buildSnippet({
      player,
      contactName: contactObj?.name,
      hasVehicle,
    });

    return {
      id: `street-${player.age}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      age: player.age,
      districtId,
      districtLabel: DISTRICT_LABELS[districtId][location],
      timeOfDayLabel: pickRandom(TIME_OF_DAY_POOL),
      snippet: built.snippet,
      sanDelta: built.sanDelta,
      localAffinityDelta: built.localAffinityDelta,
      socDelta: built.socDelta,
      cashDelta: built.cashDelta || 0,
      localContactName: contactObj?.name,
      reaction: built.reaction,
      reactionTaken: false,
    };
  }

  private static applyEncounterEffects(
    next: PlayerData,
    entry: StreetEncounterLog,
    contactKey?: string
  ): StreetEncounterLog {
    const street = this.ensureStreetWorld(next);

    // Strictly non-critical SAN shift: never drops below 5 from a street snippet
    const minSafeSan = Math.min(next.stats.san, 5);
    const prevSan = next.stats.san;
    next.stats.san = clamp(next.stats.san + entry.sanDelta, minSafeSan, 100);
    const actualSanDelta = next.stats.san - prevSan;

    const prevAff = street.neighborhood_affinity;
    street.neighborhood_affinity = clamp(
      street.neighborhood_affinity + entry.localAffinityDelta,
      0,
      100
    );
    const actualAffDelta = street.neighborhood_affinity - prevAff;

    const prevSoc = next.stats.soc;
    next.stats.soc = clamp(next.stats.soc + entry.socDelta, 0, 100);
    const actualSocDelta = next.stats.soc - prevSoc;
    next.max_stats_reached.soc = Math.max(next.max_stats_reached.soc, next.stats.soc);

    if (entry.cashDelta !== 0) {
      next.finance.cash = Math.max(0, next.finance.cash + entry.cashDelta);
      next.max_stats_reached.cash = Math.max(next.max_stats_reached.cash, next.finance.cash);
    }

    if (contactKey || entry.localContactName) {
      const target = street.known_locals.find(
        (c) => c.id === contactKey || c.name === entry.localContactName
      );
      if (target) {
        target.encounters += 1;
        target.affinity = clamp(target.affinity + entry.localAffinityDelta + 1, 0, 100);
      }
    }

    const finalized: StreetEncounterLog = {
      ...entry,
      sanDelta: actualSanDelta,
      localAffinityDelta: actualAffDelta,
      socDelta: actualSocDelta,
    };

    street.recent_snippets = [finalized, ...street.recent_snippets].slice(0, 8);
    return finalized;
  }

  /**
   * Triggered either automatically when moving across city districts (tabs) or manually via "City Stroll".
   */
  static triggerMovementEncounter(
    player: PlayerData,
    districtId: CityDistrictId,
    options: { isManualStroll: boolean }
  ): {
    updated: PlayerData;
    triggered: boolean;
    encounter?: StreetEncounterLog;
    message?: string;
  } {
    const moveCheck = this.canMoveInCity(player);
    if (!moveCheck.allowed) {
      return {
        updated: player,
        triggered: false,
        message: moveCheck.reason,
      };
    }

    const currentStreet = player.street_world;
    if (!options.isManualStroll) {
      const usedCount = currentStreet?.commute_encounters_this_year || 0;
      if (usedCount >= MAX_AUTO_COMMUTE_TRIGGERS_PER_YEAR) {
        return { updated: player, triggered: false };
      }
      // 45% organic trigger probability when commuting between districts
      if (Math.random() > 0.45) {
        return { updated: player, triggered: false };
      }
    } else {
      if (player.stats.energy < STROLL_ENERGY_COST) {
        return {
          updated: player,
          triggered: false,
          message: `พลังงานคงเหลือไม่พอเดินสำรวจย่านเมือง (ต้องการ ${STROLL_ENERGY_COST} Energy · เหลือ ${player.stats.energy})`,
        };
      }
      const allocSummary = EnergySystem.calculateAllocationSummary(player, {});
      if (allocSummary.totalAllocated + STROLL_ENERGY_COST > allocSummary.hardCapEnergy) {
        return {
          updated: player,
          triggered: false,
          message: `เกินเพดานพลังงานสูงสุดประจำปี (${allocSummary.hardCapEnergy} Energy)`,
        };
      }
    }

    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    const street = this.ensureStreetWorld(next);

    if (options.isManualStroll) {
      next.stats.energy = Math.max(0, next.stats.energy - STROLL_ENERGY_COST);
    } else {
      street.commute_encounters_this_year += 1;
    }

    const rawEntry = this.generateSnippetForDistrict(next, districtId);
    const finalized = this.applyEncounterEffects(next, rawEntry);

    if (options.isManualStroll) {
      if (!next.pending_year_logs) next.pending_year_logs = [];
      next.pending_year_logs.push(
        `เดินสำรวจ "${finalized.districtLabel}" (-${STROLL_ENERGY_COST} Energy): ${finalized.snippet}`
      );
    }

    return {
      updated: next,
      triggered: true,
      encounter: finalized,
      message: finalized.snippet,
    };
  }

  /**
   * Optional 1-click micro-gesture on a street snippet (e.g. sharing food with a stray cat or greeting a vendor).
   */
  static resolveEncounterReaction(
    player: PlayerData,
    encounterId: string
  ): {
    updated: PlayerData;
    success: boolean;
    message: string;
  } {
    const next = JSON.parse(JSON.stringify(player)) as PlayerData;
    const street = this.ensureStreetWorld(next);
    const target = street.recent_snippets.find((item) => item.id === encounterId);

    if (!target || !target.reaction || target.reactionTaken) {
      return {
        updated: player,
        success: false,
        message: 'เหตุการณ์ริมทางนี้ผ่านไปแล้ว',
      };
    }

    if (target.reaction.cashCost > 0 && next.finance.cash < target.reaction.cashCost) {
      return {
        updated: player,
        success: false,
        message: `เงินสดติดตัวไม่พอ (${target.reaction.cashCost} บาท)`,
      };
    }

    next.finance.cash = Math.max(0, next.finance.cash - target.reaction.cashCost);
    next.stats.san = clamp(next.stats.san + target.reaction.bonusSan, 0, 100);
    next.stats.soc = clamp(next.stats.soc + target.reaction.bonusSoc, 0, 100);
    next.max_stats_reached.soc = Math.max(next.max_stats_reached.soc, next.stats.soc);
    street.neighborhood_affinity = clamp(
      street.neighborhood_affinity + target.reaction.bonusAffinity,
      0,
      100
    );

    if (target.localContactName) {
      const localPerson = street.known_locals.find((c) => c.name === target.localContactName);
      if (localPerson) {
        localPerson.affinity = clamp(
          localPerson.affinity + target.reaction.bonusAffinity,
          0,
          100
        );
      }
    }

    target.reactionTaken = true;
    target.reactionOutcomeText = target.reaction.outcomeSnippet;
    target.sanDelta += target.reaction.bonusSan;
    target.localAffinityDelta += target.reaction.bonusAffinity;
    target.socDelta += target.reaction.bonusSoc;
    target.cashDelta -= target.reaction.cashCost;

    return {
      updated: next,
      success: true,
      message: `${target.reaction.outcomeSnippet} (SAN +${target.reaction.bonusSan} · มิตรภาพชุมชน +${target.reaction.bonusAffinity})`,
    };
  }

  /**
   * Annual tick: resets yearly commute cap, generates 1 ambient street snippet for the year,
   * and applies passive neighborhood relationship warmth/friction.
   */
  static processYearlyNeighborhoodTick(next: PlayerData): string[] {
    const street = this.ensureStreetWorld(next);
    street.commute_encounters_this_year = 0;
    const logs: string[] = [];

    if (
      next.is_alive &&
      next.age >= 6 &&
      next.career.prison_years_left === 0 &&
      next.career.conscription_years_left === 0
    ) {
      const ambientDistricts: CityDistrictId[] = next.education.is_enrolled
        ? ['RESIDENTIAL_SOI', 'CAMPUS_ZONE']
        : next.career.primary_job
        ? ['RESIDENTIAL_SOI', 'BUSINESS_MARKET', 'COMMERCIAL_PLAZA']
        : ['RESIDENTIAL_SOI', 'ATHLETIC_CLUB'];

      const raw = this.generateSnippetForDistrict(next, pickRandom(ambientDistricts));
      const finalized = this.applyEncounterEffects(next, raw);
      logs.push(
        `เรื่องเล่าคนเดินถนน (${finalized.districtLabel}): ${finalized.snippet}`
      );

      // Passive Local Relationships (มิตรภาพคนในชุมชน) yearly effect
      if (street.neighborhood_affinity >= 72) {
        next.stats.san = clamp(next.stats.san + 2, 0, 100);
        logs.push(
          `มิตรภาพชุมชนอบอุ่น (${street.neighborhood_affinity}/100): คนในละแวกบ้านคอยช่วยเหลือและฝากของกินให้กัน (+2 SAN)`
        );
      } else if (street.neighborhood_affinity <= 24) {
        const minSafe = Math.min(next.stats.san, 5);
        next.stats.san = clamp(next.stats.san - 2, minSafe, 100);
        logs.push(
          `บรรยากาศเพื่อนบ้านตึงเครียด (${street.neighborhood_affinity}/100): สายตาเย็นชาจากคนในซอยชวนให้อึดอัดใจ (-2 SAN)`
        );
      }
    }

    return logs;
  }
}
