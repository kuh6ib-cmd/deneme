import * as XLSX from 'xlsx';
import { 
  NormalizedFleetRecord, 
  PartCatalogItem, 
  PartMatchResult, 
  PartsAnalyticsSummary, 
  PartCategoryStat, 
  TopReplacedPartStat,
  MatchConfidenceLevel
} from '../types';

// ==========================================
// 1. DEFAULT AUTOMOTIVE / FLEET PARTS CATALOG (3-LEVEL HIERARCHY: GENELDEN ÖZELE)
// ==========================================
export const DEFAULT_PARTS_CATALOG: PartCatalogItem[] = [
  // --- FİLTRE GRUBU ---
  {
    id: 'prc-flt-oil',
    code: 'BOSCH-FLT-OIL',
    name: 'Yağ Filtresi',
    categoryLevel1: 'Periyodik Bakım & Sıvılar',
    categoryLevel2: 'Filtre Grubu',
    categoryLevel3: 'Yağ Filtresi',
    category: 'Periyodik Bakım & Sıvılar > Filtre Grubu > Yağ Filtresi',
    keywords: ['yağ filtresi', 'yag filtresi', 'yağ filtre', 'yag filtre', 'yag flt', 'yağ flt', 'oil filter', 'karter filtre'],
    unit: 'Adet',
    description: 'Motor yağ süzme ve mikro partikül filtresi',
  },
  {
    id: 'prc-flt-air',
    code: 'BOSCH-FLT-AIR',
    name: 'Hava Filtresi',
    categoryLevel1: 'Periyodik Bakım & Sıvılar',
    categoryLevel2: 'Filtre Grubu',
    categoryLevel3: 'Hava Filtresi',
    category: 'Periyodik Bakım & Sıvılar > Filtre Grubu > Hava Filtresi',
    keywords: ['hava filtresi', 'hava filtre', 'hva flt', 'hava flt', 'air filter', 'motor hava filtresi', 'emme filtre'],
    unit: 'Adet',
    description: 'Motor hava emiş toz ve partikül filtresi',
  },
  {
    id: 'prc-flt-cab',
    code: 'BOSCH-FLT-CAB',
    name: 'Polen / Kabin Filtresi (Karbonlu / Standart)',
    categoryLevel1: 'Periyodik Bakım & Sıvılar',
    categoryLevel2: 'Filtre Grubu',
    categoryLevel3: 'Polen / Kabin Filtresi',
    category: 'Periyodik Bakım & Sıvılar > Filtre Grubu > Polen / Kabin Filtresi',
    keywords: ['polen filtresi', 'polen filtre', 'kabin filtresi', 'kabin filtre', 'polen flt', 'karbonlu polen', 'klima filtresi', 'klima filtre'],
    unit: 'Adet',
    description: 'Araç içi havalandırma ve alerjen kabin filtresi',
  },
  {
    id: 'prc-flt-fuel',
    code: 'BOSCH-FLT-FUEL',
    name: 'Yakıt / Mazot Filtresi',
    categoryLevel1: 'Periyodik Bakım & Sıvılar',
    categoryLevel2: 'Filtre Grubu',
    categoryLevel3: 'Yakıt / Mazot Filtresi',
    category: 'Periyodik Bakım & Sıvılar > Filtre Grubu > Yakıt / Mazot Filtresi',
    keywords: ['yakıt filtresi', 'mazot filtresi', 'yakit filtresi', 'benzin filtresi', 'mazot filtre', 'yakıt filtre', 'mzt flt', 'yakit flt', 'fuel filter', 'su ayırıcı filtre'],
    unit: 'Adet',
    description: 'Dizel common rail / benzinli hassas yakıt süzgeci ve su tutucu filtre',
  },
  {
    id: 'prc-flt-set',
    code: 'BOSCH-FLT-SET',
    name: "4'lü Periyodik Filtre Seti (Yağ, Hava, Polen, Yakıt)",
    categoryLevel1: 'Periyodik Bakım & Sıvılar',
    categoryLevel2: 'Filtre Grubu',
    categoryLevel3: 'Bakım Filtre Seti',
    category: 'Periyodik Bakım & Sıvılar > Filtre Grubu > Bakım Filtre Seti',
    keywords: ['filtre seti', 'bakım seti', 'periyodik filtre seti', '4lü filtre', 'filtre takımı', 'periyodik bakım seti', 'bakım paketi'],
    unit: 'Set',
    description: 'Standart binek ve hafif ticari 4 parça periyodik filtre grubu',
  },
  {
    id: 'prc-flt-lpg',
    code: 'BOSCH-FLT-LPG',
    name: 'LPG / Otogaz Gaz Filtresi',
    categoryLevel1: 'Periyodik Bakım & Sıvılar',
    categoryLevel2: 'Filtre Grubu',
    categoryLevel3: 'LPG / Gaz Filtresi',
    category: 'Periyodik Bakım & Sıvılar > Filtre Grubu > LPG / Gaz Filtresi',
    keywords: ['lpg filtresi', 'gaz filtresi', 'otogaz filtre', 'lpg kesici filtre'],
    unit: 'Adet',
    description: 'LPG/CNG faz dönüşüm gaz filtresi',
  },

  // --- MOTOR YAĞLARI & SIVILAR ---
  {
    id: 'prc-oil-5w30',
    code: 'BOSCH-OIL-5W30',
    name: 'Tam Sentetik Motor Yağı 5W-30 (DPF Uyumlu)',
    categoryLevel1: 'Periyodik Bakım & Sıvılar',
    categoryLevel2: 'Motor Yağları & Katkılar',
    categoryLevel3: 'Tam Sentetik Motor Yağı',
    category: 'Periyodik Bakım & Sıvılar > Motor Yağları & Katkılar > Tam Sentetik Motor Yağı',
    keywords: ['5w30', '5w-30', '5 30', 'motor yağı 5w30', 'sentetik motor yağı', 'karter yağı', 'castrol edge 5w30', 'mobil 5w30', 'shell helix 5w30', 'yağ değişimi 5w30'],
    unit: 'Litre/Bidon',
    description: 'Euro 5/6 DPF uyumlu C2/C3 tam sentetik 5W-30 motor yağı',
  },
  {
    id: 'prc-oil-5w40',
    code: 'BOSCH-OIL-5W40',
    name: 'Tam Sentetik Motor Yağı 5W-40',
    categoryLevel1: 'Periyodik Bakım & Sıvılar',
    categoryLevel2: 'Motor Yağları & Katkılar',
    categoryLevel3: 'Tam Sentetik Motor Yağı',
    category: 'Periyodik Bakım & Sıvılar > Motor Yağları & Katkılar > Tam Sentetik Motor Yağı',
    keywords: ['5w40', '5w-40', '5 40', 'motor yağı 5w40', 'castrol 5w40', 'mobil 5w40'],
    unit: 'Litre/Bidon',
    description: 'Yüksek sıcaklık dayanımlı tam sentetik 5W-40 motor yağı',
  },
  {
    id: 'prc-oil-0w20',
    code: 'BOSCH-OIL-0W20',
    name: 'Yeni Nesil Düşük Viskoziteli Motor Yağı (0W-20 / 0W-30)',
    categoryLevel1: 'Periyodik Bakım & Sıvılar',
    categoryLevel2: 'Motor Yağları & Katkılar',
    categoryLevel3: 'Tam Sentetik Motor Yağı',
    category: 'Periyodik Bakım & Sıvılar > Motor Yağları & Katkılar > Tam Sentetik Motor Yağı',
    keywords: ['0w20', '0w-20', '0w30', '0w-30', '0 20', '0 30', 'eco motor yağı'],
    unit: 'Litre/Bidon',
    description: 'Yakıt ekonomisi odaklı yeni nesil 0W-20 / 0W-30 motor yağı',
  },
  {
    id: 'prc-oil-10w40',
    code: 'BOSCH-OIL-10W40',
    name: 'Yarı Sentetik Motor Yağı 10W-40',
    categoryLevel1: 'Periyodik Bakım & Sıvılar',
    categoryLevel2: 'Motor Yağları & Katkılar',
    categoryLevel3: 'Yarı Sentetik Motor Yağı',
    category: 'Periyodik Bakım & Sıvılar > Motor Yağları & Katkılar > Yarı Sentetik Motor Yağı',
    keywords: ['10w40', '10w-40', '10 40', 'yarı sentetik yağ', '15w40', 'motor yağı 10w40'],
    unit: 'Litre/Bidon',
    description: 'Yüksek kilometreli araçlar için 10W-40 motor yağı',
  },
  {
    id: 'prc-oil-gbx',
    code: 'BOSCH-OIL-GBX',
    name: 'Şanzıman & Diferansiyel Yağı (Manuel / Otomatik ATF / DSG)',
    categoryLevel1: 'Periyodik Bakım & Sıvılar',
    categoryLevel2: 'Şanzıman Sıvıları',
    categoryLevel3: 'Şanzıman & Diferansiyel Yağı',
    category: 'Periyodik Bakım & Sıvılar > Şanzıman Sıvıları > Şanzıman & Diferansiyel Yağı',
    keywords: ['şanzıman yağı', 'sanziman yagi', 'atf', 'otomatik şanzıman yağı', 'dsg yağı', 'diferansiyel yağı', '75w80', '75w90', 'şanzuman yağı'],
    unit: 'Litre',
    description: 'Manuel, otomatik ve çift kavramalı şanzıman dişli yağı',
  },
  {
    id: 'prc-adb-01',
    code: 'BOSCH-ADB-LQD',
    name: 'AdBlue SCR Emisyon Sıvısı & Dolumu',
    categoryLevel1: 'Periyodik Bakım & Sıvılar',
    categoryLevel2: 'Egzoz Emisyon Sıvıları',
    categoryLevel3: 'AdBlue SCR Sıvısı',
    category: 'Periyodik Bakım & Sıvılar > Egzoz Emisyon Sıvıları > AdBlue SCR Sıvısı',
    keywords: ['adblue', 'ad blue', 'ad-blue', 'emisyon sıvısı', 'scr sıvısı', 'ürik asit', 'adblue dolumu', 'adblue 10lt', 'adblue 20lt'],
    unit: 'Dolum',
    description: 'Euro 6 dizel SCR egzoz arıtma AdBlue sıvısı',
  },
  {
    id: 'prc-chm-afr',
    code: 'BOSCH-CHM-AFR',
    name: 'Organik Antifriz (-40°C Kırmızı / Mavi)',
    categoryLevel1: 'Periyodik Bakım & Sıvılar',
    categoryLevel2: 'Soğutma Sıvıları',
    categoryLevel3: 'Organik Antifriz',
    category: 'Periyodik Bakım & Sıvılar > Soğutma Sıvıları > Organik Antifriz',
    keywords: ['antifriz', 'antifreeze', 'kırmızı antifriz', 'organik antifriz', 'radyatör antifrizi', 'soğutma sıvısı', 'g12', 'g13'],
    unit: 'Litre',
    description: 'Alüminyum ve döküm motor koruyucu konsantre organik antifriz',
  },
  {
    id: 'prc-chm-dot4',
    code: 'BOSCH-CHM-DOT4',
    name: 'Fren Hidrolik Sıvısı (DOT 4 / DOT 5.1)',
    categoryLevel1: 'Periyodik Bakım & Sıvılar',
    categoryLevel2: 'Fren Sıvıları',
    categoryLevel3: 'Fren Hidrolik Sıvısı',
    category: 'Periyodik Bakım & Sıvılar > Fren Sıvıları > Fren Hidrolik Sıvısı',
    keywords: ['fren hidroliği', 'fren hidrolik', 'dot4', 'dot 4', 'dot5', 'dot 5.1', 'fren yağı', 'debriyaj hidroliği'],
    unit: 'Şişe',
    description: 'Yüksek kaynama noktalı ABS/ESP uyumlu sentetik fren hidrolik sıvısı',
  },
  {
    id: 'prc-chm-wsh',
    code: 'BOSCH-CHM-WSH',
    name: 'Konsantre Cam Suyu & Antifrizli Cam Suyu',
    categoryLevel1: 'Periyodik Bakım & Sıvılar',
    categoryLevel2: 'Sarf Sıvılar',
    categoryLevel3: 'Cam Suyu & Temizleyiciler',
    category: 'Periyodik Bakım & Sıvılar > Sarf Sıvılar > Cam Suyu & Temizleyiciler',
    keywords: ['cam suyu', 'silecek suyu', 'antifrizli cam suyu', 'konsantre cam suyu', 'cam temizleyici'],
    unit: 'Şişe/Bidon',
    description: 'Görüş netleştirici ve donma önleyici cam yıkama sıvısı',
  },
  {
    id: 'prc-chm-spr',
    code: 'BOSCH-CHM-SPR',
    name: 'Balata Temizleme Spreyi & Sarf Kimyasallar',
    categoryLevel1: 'Periyodik Bakım & Sıvılar',
    categoryLevel2: 'Bakım Kimyasalları',
    categoryLevel3: 'Balata Spreyi & Gres',
    category: 'Periyodik Bakım & Sıvılar > Bakım Kimyasalları > Balata Spreyi & Gres',
    keywords: ['balata spreyi', 'balata sprey', 'balata temizleme', 'sıvı gres', 'pas sökücü', 'wd40', 'fren temizleme spreyi'],
    unit: 'Kutu',
    description: 'Mekanik temizleme ve yağ arındırma sprey kimyasalı',
  },
  {
    id: 'prc-chm-add',
    code: 'BOSCH-CHM-ADD',
    name: 'Motor / Enjektör / DPF Temizleme Katkısı',
    categoryLevel1: 'Periyodik Bakım & Sıvılar',
    categoryLevel2: 'Bakım Kimyasalları',
    categoryLevel3: 'Yakıt & Motor Katkıları',
    category: 'Periyodik Bakım & Sıvılar > Bakım Kimyasalları > Yakıt & Motor Katkıları',
    keywords: ['enjektör temizleyici', 'motor içi temizleme', 'dpf temizleyici', 'yakıt katkısı', 'dizel katkı', 'yağ katkısı'],
    unit: 'Kutu',
    description: 'Enjektör, DPF ve motor yağ kanalı arındırıcı yakıt katkısı',
  },

  // --- FREN SİSTEMİ ---
  {
    id: 'prc-frn-01',
    code: 'BOSCH-BRK-FRT',
    name: 'Ön Fren Balata Takımı',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Fren Sistemi',
    categoryLevel3: 'Ön Fren Balatası',
    category: 'Mekanik & Yürüyen Aksam > Fren Sistemi > Ön Fren Balatası',
    keywords: ['ön balata', 'ön fren balata', 'fren balatası ön', 'balata ön', 'ön fren balatası', 'on balata', 'on fren bal', 'balata on', 'ön balata takımı', 'ön disk balata', 'ön balatalar', 'ön fren balata takımı'],
    unit: 'Takım',
    description: 'Ön aks seramik/organik fren balata takımı',
  },
  {
    id: 'prc-frn-02',
    code: 'BOSCH-BRK-RR',
    name: 'Arka Fren Balata Takımı',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Fren Sistemi',
    categoryLevel3: 'Arka Fren Balatası',
    category: 'Mekanik & Yürüyen Aksam > Fren Sistemi > Arka Fren Balatası',
    keywords: ['arka balata', 'arka fren balata', 'fren balatası arka', 'balata arka', 'arka fren balatası', 'ark balata', 'ark fren bal', 'balata ark', 'arka balata takımı', 'arka disk balata', 'arka kampana balata', 'el freni balatası', 'arka balatalar', 'arka fren balata takımı'],
    unit: 'Takım',
    description: 'Arka aks disk veya kampana fren balatası takımı',
  },
  {
    id: 'prc-frn-03',
    code: 'BOSCH-DSC-FRT',
    name: 'Ön Fren Diski Çifti (Hava Soğutmalı)',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Fren Sistemi',
    categoryLevel3: 'Ön Fren Diski',
    category: 'Mekanik & Yürüyen Aksam > Fren Sistemi > Ön Fren Diski',
    keywords: ['ön disk', 'ön fren diski', 'fren diski ön', 'on disk', 'on fren disk', 'disk ön', 'ön diskler', 'hava kanallı disk', 'ön fren disk takımı'],
    unit: 'Çift',
    description: 'Ön tekerlek çift hava soğutmalı fren diskleri',
  },
  {
    id: 'prc-frn-04',
    code: 'BOSCH-DSC-RR',
    name: 'Arka Fren Diski Çifti',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Fren Sistemi',
    categoryLevel3: 'Arka Fren Diski',
    category: 'Mekanik & Yürüyen Aksam > Fren Sistemi > Arka Fren Diski',
    keywords: ['arka disk', 'arka fren diski', 'fren diski arka', 'ark disk', 'ark fren disk', 'disk arka', 'arka diskler', 'arka fren disk takımı'],
    unit: 'Çift',
    description: 'Arka aks fren diski çifti',
  },
  {
    id: 'prc-frn-drm',
    code: 'BOSCH-BRK-DRM',
    name: 'Fren Kampanası & Kampana Pabucu',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Fren Sistemi',
    categoryLevel3: 'Fren Kampanası',
    category: 'Mekanik & Yürüyen Aksam > Fren Sistemi > Fren Kampanası',
    keywords: ['kampana', 'fren kampanası', 'arka kampana', 'kampana balata', 'kampana pabuç', 'fren pabucu', 'kampana balatası'],
    unit: 'Çift',
    description: 'Arka tekerlek kampana döküm gövdesi ve pabuç takımı',
  },
  {
    id: 'prc-frn-cal',
    code: 'BOSCH-BRK-CAL',
    name: 'Fren Kaliperi & Kaliper Tamir Takımı',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Fren Sistemi',
    categoryLevel3: 'Fren Kaliperi',
    category: 'Mekanik & Yürüyen Aksam > Fren Sistemi > Fren Kaliperi',
    keywords: ['kaliper', 'fren kaliperi', 'kaliper pimi', 'kaliper tamir takımı', 'fren merkezi', 'fren pistonu', 'ön kaliper', 'arka kaliper'],
    unit: 'Adet',
    description: 'Hidrolik fren kaliperi, piston ve körük takımı',
  },
  {
    id: 'prc-frn-cbl',
    code: 'BOSCH-BRK-CBL',
    name: 'El Fren Teli & Elektrikli El Fren Motoru',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Fren Sistemi',
    categoryLevel3: 'El Fren Sistemi',
    category: 'Mekanik & Yürüyen Aksam > Fren Sistemi > El Fren Sistemi',
    keywords: ['el fren teli', 'el freni teli', 'el fren halatı', 'elektrikli el freni', 'el fren motoru', 'park freni'],
    unit: 'Adet/Takım',
    description: 'Mekanik veya elektronik el freni çekme mekanizması',
  },

  // --- DEBRİYAJ & ŞANZIMAN ---
  {
    id: 'prc-dbr-01',
    code: 'BOSCH-CLT-KIT',
    name: 'Debriyaj Baskı Balata & Rulman Seti',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Debriyaj & Şanzıman',
    categoryLevel3: 'Debriyaj Baskı Balata',
    category: 'Mekanik & Yürüyen Aksam > Debriyaj & Şanzıman > Debriyaj Baskı Balata',
    keywords: ['debriyaj seti', 'baskı balata', 'baski balata', 'debriyaj baskı balata', 'debriyaj baskı', 'debriyaj takımı', 'debriyac', 'kavrama seti', 'debriyaj diski', 'debriyaj balatası', 'debriyaj baskı balata takımı'],
    unit: 'Set',
    description: 'Mekanik debriyaj baskısı, balatası ve tahrik takımı',
  },
  {
    id: 'prc-dbr-brg',
    code: 'BOSCH-CLT-BRG',
    name: 'Debriyaj Bilyası & Hidrolik Rulman (CSC)',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Debriyaj & Şanzıman',
    categoryLevel3: 'Debriyaj Bilyası & Rulman',
    category: 'Mekanik & Yürüyen Aksam > Debriyaj & Şanzıman > Debriyaj Bilyası & Rulman',
    keywords: ['debriyaj bilyası', 'debriyaj rulmanı', 'hidrolik debriyaj bilyası', 'csc rulman', 'debriyaj çatalı', 'debriyaj bilye'],
    unit: 'Adet',
    description: 'Hidrolik veya mekanik debriyaj ayırıcı baskı rulmanı',
  },
  {
    id: 'prc-dbr-cyl',
    code: 'BOSCH-CLT-CYL',
    name: 'Debriyaj Üst & Alt Merkezi',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Debriyaj & Şanzıman',
    categoryLevel3: 'Debriyaj Merkezleri',
    category: 'Mekanik & Yürüyen Aksam > Debriyaj & Şanzıman > Debriyaj Merkezleri',
    keywords: ['debriyaj üst merkez', 'debriyaj alt merkez', 'debriyaj merkezi', 'debriyaj pompası', 'debriyaj ana merkez'],
    unit: 'Adet',
    description: 'Debriyaj pedalı hidrolik basınç üretici ve iletici merkezleri',
  },
  {
    id: 'prc-dbr-02',
    code: 'BOSCH-FLY-KIT',
    name: 'Çift Kütleli Volan & Debriyaj Kiti (DMF)',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Debriyaj & Şanzıman',
    categoryLevel3: 'Çift Kütleli Volan (DMF)',
    category: 'Mekanik & Yürüyen Aksam > Debriyaj & Şanzıman > Çift Kütleli Volan (DMF)',
    keywords: ['volan', 'volant', 'oynar volan', 'çift kütleli volan', 'volan dişlisi', 'dmf', 'sabit volan', 'volan debriyaj', 'baskı balata volan', 'baski balata volant', 'volan kiti'],
    unit: 'Set',
    description: 'Titreşim sönümleyici çift kütleli volan ve debriyaj kiti',
  },
  {
    id: 'prc-drv-shf',
    code: 'BOSCH-DRV-SHF',
    name: 'Aks Komple / Aks Mili & Mafsalı',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Aktarma & Aks',
    categoryLevel3: 'Aks Mili & Mafsalı',
    category: 'Mekanik & Yürüyen Aksam > Aktarma & Aks > Aks Mili & Mafsalı',
    keywords: ['aks', 'aks mili', 'komple aks', 'sağ aks', 'sol aks', 'ön aks', 'aks kafası', 'aks lalesi', 'aks istavrozu', 'aks bilyası'],
    unit: 'Adet',
    description: 'Tekerlek tahrik aks mili, iç/dış mafsal ve lale takımı',
  },
  {
    id: 'prc-drv-bot',
    code: 'BOSCH-DRV-BOT',
    name: 'Aks Körüğü & Yağlama Gres Takımı',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Aktarma & Aks',
    categoryLevel3: 'Aks Körükleri',
    category: 'Mekanik & Yürüyen Aksam > Aktarma & Aks > Aks Körükleri',
    keywords: ['aks körüğü', 'aks korugu', 'iç aks körüğü', 'dış aks körüğü', 'aks körük kelepçesi', 'aks gresi'],
    unit: 'Takım',
    description: 'İç ve dış aks kafası toz ve su sızdırmazlık körüğü',
  },
  {
    id: 'prc-whl-brg',
    code: 'BOSCH-WHL-BRG',
    name: 'Tekerlek Porya Bilyası & Rulmanı (ABS Entegre)',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Aktarma & Aks',
    categoryLevel3: 'Porya Bilyası & Rulman',
    category: 'Mekanik & Yürüyen Aksam > Aktarma & Aks > Porya Bilyası & Rulman',
    keywords: ['porya', 'porya bilyası', 'porya bilyasi', 'tekerlek rulmanı', 'teker bilyası', 'ön porya', 'arka porya', 'teker rulman'],
    unit: 'Adet',
    description: 'Ön/arka tekerlek göbek porya rulmanı ve manyetik ABS halkası',
  },

  // --- MOTOR, ZAMANLAMA & SOĞUTMA ---
  {
    id: 'prc-trg-01',
    code: 'BOSCH-TRG-SET',
    name: 'Triger Kayış & Gergi Rulman Kiti',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Motor & Zamanlama',
    categoryLevel3: 'Triger Kayış Seti',
    category: 'Mekanik & Yürüyen Aksam > Motor & Zamanlama > Triger Kayış Seti',
    keywords: ['triger', 'triger seti', 'triger kayışı', 'triger kayisi', 'trg seti', 'zamanlama kayışı', 'eksantrik kayış', 'triger gergi'],
    unit: 'Set',
    description: 'Motor senkronizasyon triger kayışı ve otomatik gergi rulmanı',
  },
  {
    id: 'prc-wtr-pmp',
    code: 'BOSCH-WTR-PMP',
    name: 'Su Devirdaim Pompası',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Motor & Zamanlama',
    categoryLevel3: 'Devirdaim Pompası',
    category: 'Mekanik & Yürüyen Aksam > Motor & Zamanlama > Devirdaim Pompası',
    keywords: ['devirdaim', 'devir daim', 'devirdayim', 'su pompası', 'su pompasi', 'devirdaim pompası', 'devird.', 'd-daim'],
    unit: 'Adet',
    description: 'Motor soğutma sıvısı sirkülasyon devirdaim pompası',
  },
  {
    id: 'prc-trg-wtr',
    code: 'BOSCH-TRG-WTR',
    name: 'Triger Kayış & Devirdaimli Komple Ağır Bakım Seti',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Motor & Zamanlama',
    categoryLevel3: 'Triger & Devirdaim Komple Set',
    category: 'Mekanik & Yürüyen Aksam > Motor & Zamanlama > Triger & Devirdaim Komple Set',
    keywords: ['triger devirdaim', 'devirdaimli triger', 'triger su pompası', 'ağır bakım seti', 'triger seti devirdaimli'],
    unit: 'Set',
    description: 'Triger kayışı, gergi rulmanları ve su devirdaim pompası komple seti',
  },
  {
    id: 'prc-vbl-02',
    code: 'BOSCH-VBL-SET',
    name: 'V-Kayışı ve Gergi Rulmanı (Alternatör / Şarj Kayışı)',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Motor & Zamanlama',
    categoryLevel3: 'V-Kayışı ve Gergi',
    category: 'Mekanik & Yürüyen Aksam > Motor & Zamanlama > V-Kayışı ve Gergi',
    keywords: ['v kayış', 'v kayışı', 'v-kayışı', 'alternatör kayışı', 'şarj kayışı', 'klima kayışı', 'gergi rulmanı', 'gergi kütüğü', 'v gergi', 'kayış gergi'],
    unit: 'Set',
    description: 'Aksesuar tahrik V-kayışı ve otomatik gergi kütüğü tertibatı',
  },
  {
    id: 'prc-crk-ply',
    code: 'BOSCH-CRK-PLY',
    name: 'Krank Kasnağı (Titreşim Sönümleyici Kasnak)',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Motor & Zamanlama',
    categoryLevel3: 'Krank Kasnağı',
    category: 'Mekanik & Yürüyen Aksam > Motor & Zamanlama > Krank Kasnağı',
    keywords: ['krank kasnağı', 'krank kasnagi', 'krank kasnak', 'titreşim kasnağı', 'damper kasnak', 'v kayış kasnağı'],
    unit: 'Adet',
    description: 'Krank mili ucu kauçuk sönümlemeli V-kayış tahrik kasnağı',
  },
  {
    id: 'prc-thm-unt',
    code: 'BOSCH-THM-UNT',
    name: 'Termostat & Termostat Gövdesi / Su Flanşı',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Motor & Soğutma',
    categoryLevel3: 'Termostat Grubu',
    category: 'Mekanik & Yürüyen Aksam > Motor & Soğutma > Termostat Grubu',
    keywords: ['termostat', 'termostat gövdesi', 'termostat flanşı', 'su flanşı', 'hararet müşürü', 'termostat kütüğü'],
    unit: 'Adet',
    description: 'Motor çalışma sıcaklığı düzenleyici termostat ve gövdesi',
  },
  {
    id: 'prc-rad-unt',
    code: 'BOSCH-RAD-UNT',
    name: 'Motor Soğutma Radyatörü & Genleşme Kabı',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Motor & Soğutma',
    categoryLevel3: 'Radyatör Grubu',
    category: 'Mekanik & Yürüyen Aksam > Motor & Soğutma > Radyatör Grubu',
    keywords: ['radyatör', 'su radyatörü', 'motor radyatörü', 'genleşme kabı', 'yedek su deposu', 'radyatör kapağı', 'radyatör hortumu'],
    unit: 'Adet',
    description: 'Alüminyum petekli motor soğutma radyatörü ve basınçlı yedek su deposu',
  },
  {
    id: 'prc-eng-crk-sl',
    code: 'BOSCH-CRK-SL',
    name: 'Krank Keçesi & Eksantrik Yağ Keçesi (Ön / Arka)',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Motor Mekaniği',
    categoryLevel3: 'Krank & Yağ Keçeleri',
    category: 'Mekanik & Yürüyen Aksam > Motor Mekaniği > Krank & Yağ Keçeleri',
    keywords: ['krank keçesi', 'krank kecesi', 'ön krank keçesi', 'arka krank keçesi', 'on krank kecesi', 'ark krank kecesi', 'eksantrik keçesi', 'eksantrik kecesi', 'yağ keçesi', 'yag kecesi', 'krank mil keçesi', 'prizdirek keçesi', 'prizdirek kecesi', 'şanzıman keçesi', 'keçe', 'keçesi'],
    unit: 'Adet',
    description: 'Ön ve arka krank mili ve eksantrik mili sızdırmazlık yağ keçesi',
  },
  {
    id: 'prc-eng-gsk',
    code: 'BOSCH-ENG-GSK',
    name: 'Silindir Kapak Contası & Üst Takım Conta',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Motor Mekaniği',
    categoryLevel3: 'Motor Contaları',
    category: 'Mekanik & Yürüyen Aksam > Motor Mekaniği > Motor Contaları',
    keywords: ['silindir kapak contası', 'kapak contası', 'üst takım conta', 'külbütör contası', 'karter contası', 'subap lastiği', 'emme manifolt contası', 'egzoz contası', 'çelik conta', 'üst kapak contası'],
    unit: 'Takım',
    description: 'Çelik katmanlı silindir kapak contası ve sızdırmazlık takımı',
  },
  {
    id: 'prc-eng-mnt',
    code: 'BOSCH-ENG-MNT',
    name: 'Motor Kulakları & Şanzıman Takozları',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Motor Mekaniği',
    categoryLevel3: 'Motor Takozları',
    category: 'Mekanik & Yürüyen Aksam > Motor Mekaniği > Motor Takozları',
    keywords: ['motor kulağı', 'motor kulagi', 'motor takozu', 'şanzıman takozu', 'alt motor kulağı', 'sağ motor kulağı', 'tork takozu'],
    unit: 'Adet',
    description: 'Hidrolik ve kauçuk motor titreşim sönümleme kulak takımı',
  },

  // --- SÜSPANSİYON & DİREKSİYON ---
  {
    id: 'prc-sus-01',
    code: 'BOSCH-SHK-FRT',
    name: 'Ön Amortisör Çifti & Üst Takozları',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Süspansiyon & Direksiyon',
    categoryLevel3: 'Ön Amortisör Grubu',
    category: 'Mekanik & Yürüyen Aksam > Süspansiyon & Direksiyon > Ön Amortisör Grubu',
    keywords: ['ön amortisör', 'on amortisor', 'amortisör ön', 'amortisör takozu', 'amortisör bilyası', 'kule takozu', 'ön amortisör takımı'],
    unit: 'Çift',
    description: 'Gazlı ön amortisör çifti ve üst kule takoz rulmanları',
  },
  {
    id: 'prc-sus-rr',
    code: 'BOSCH-SHK-RR',
    name: 'Arka Amortisör Çifti & Helezon Yay',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Süspansiyon & Direksiyon',
    categoryLevel3: 'Arka Amortisör Grubu',
    category: 'Mekanik & Yürüyen Aksam > Süspansiyon & Direksiyon > Arka Amortisör Grubu',
    keywords: ['arka amortisör', 'ark amortisor', 'amortisör arka', 'helezon yay', 'arka yay', 'amortisör körüğü', 'amortisör takozu arka'],
    unit: 'Çift',
    description: 'Arka aks gazlı amortisör çifti ve helezon yay sönümleyicileri',
  },
  {
    id: 'prc-sus-arm',
    code: 'BOSCH-ARM-WSH',
    name: 'Ön Salıncak Takımı (Sağ / Sol & Burçlar)',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Süspansiyon & Direksiyon',
    categoryLevel3: 'Salıncak & Burçlar',
    category: 'Mekanik & Yürüyen Aksam > Süspansiyon & Direksiyon > Salıncak & Burçlar',
    keywords: ['salıncak', 'salincak', 'ön salıncak', 'alt salıncak', 'salıncak burcu', 'salıncak burçları', 'salıncak burc', 'tabla', 'alt tabla'],
    unit: 'Çift/Adet',
    description: 'Dövme çelik ön alt salıncak kolları ve vulkanize burç takımları',
  },
  {
    id: 'prc-str-rod',
    code: 'BOSCH-STR-ROD',
    name: 'Rot Başı & Rot Mili (Sağ / Sol)',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Süspansiyon & Direksiyon',
    categoryLevel3: 'Rot Başı & Rot Mili',
    category: 'Mekanik & Yürüyen Aksam > Süspansiyon & Direksiyon > Rot Başı & Rot Mili',
    keywords: ['rot başı', 'rot basi', 'rot mili', 'rot kolu', 'dış rot başı', 'iç rot başı', 'rotbaşı', 'rot kol', 'rot bas'],
    unit: 'Çift/Adet',
    description: 'Direksiyon kutusu mafsalı rot başları ve rot milleri',
  },
  {
    id: 'prc-str-jnt',
    code: 'BOSCH-STR-JNT',
    name: 'Rotil (Alt Taşıyıcı Rotil)',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Süspansiyon & Direksiyon',
    categoryLevel3: 'Rotiller',
    category: 'Mekanik & Yürüyen Aksam > Süspansiyon & Direksiyon > Rotiller',
    keywords: ['rotil', 'alt rotil', 'salıncak rotili', 'taşıyıcı rotil', 'rotil sağ', 'rotil sol'],
    unit: 'Çift/Adet',
    description: 'Tekerlek taşıyıcı aks porya mafsal rotili',
  },
  {
    id: 'prc-str-lnk',
    code: 'BOSCH-STR-LNK',
    name: 'Z-Rot / Viraj Askı Rotu & Viraj Demiri Lastiği',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Süspansiyon & Direksiyon',
    categoryLevel3: 'Z-Rot & Viraj Demiri',
    category: 'Mekanik & Yürüyen Aksam > Süspansiyon & Direksiyon > Z-Rot & Viraj Demiri',
    keywords: ['z rot', 'z-rot', 'zrot', 'askı rotu', 'viraj rotu', 'viraj demir lastiği', 'viraj çubuğu', 'ön z rot', 'arka z rot'],
    unit: 'Çift',
    description: 'Viraj denge çubuğu bağlantı mafsalları (Z-rot) ve kauçuk yatak lastikleri',
  },
  {
    id: 'prc-str-box',
    code: 'BOSCH-STR-BOX',
    name: 'Direksiyon Kutusu, Direksiyon Pompası & Körükleri',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Süspansiyon & Direksiyon',
    categoryLevel3: 'Direksiyon Sistemi',
    category: 'Mekanik & Yürüyen Aksam > Süspansiyon & Direksiyon > Direksiyon Sistemi',
    keywords: ['direksiyon kutusu', 'direksiyon pompası', 'elektrikli direksiyon', 'direksiyon körüğü', 'direksiyon mafsalı', 'kramayer'],
    unit: 'Adet',
    description: 'Hidrolik veya elektrik destekli kramayer direksiyon kutusu tertibatı',
  },

  // --- TURBO & ENJEKSİYON ---
  {
    id: 'prc-trb-01',
    code: 'BOSCH-TRB-KIT',
    name: 'Turboşarj & Turbo Kartuş Revizyonu',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Aşırı Besleme & Turbo',
    categoryLevel3: 'Turboşarj Grubu',
    category: 'Mekanik & Yürüyen Aksam > Aşırı Besleme & Turbo > Turboşarj Grubu',
    keywords: ['turbo', 'turboşarj', 'turbo kartuş', 'turbo revizyon', 'wastegate', 'turbo valfi', 'turbo hortumu', 'intercooler'],
    unit: 'Adet/İşlem',
    description: 'Değişken geometrili turbo besleme ünitesi veya kartuş revizyonu',
  },
  {
    id: 'prc-trb-hos',
    code: 'BOSCH-TRB-HOS',
    name: 'Turbo Hortumu & İntercooler Boruları',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Aşırı Besleme & Turbo',
    categoryLevel3: 'Turbo Hortumları',
    category: 'Mekanik & Yürüyen Aksam > Aşırı Besleme & Turbo > Turbo Hortumları',
    keywords: ['turbo hortumu', 'intercooler borusu', 'turbo emiş borusu', 'intercooler hortumu', 'turbo borusu'],
    unit: 'Adet',
    description: 'Yüksek basınca ve ısıya dayanıklı takviyeli turbo hava boruları',
  },
  {
    id: 'prc-inj-01',
    code: 'BOSCH-INJ-DSL',
    name: 'Common Rail Dizel Enjektör Takımı & Memesi',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Yakıt & Enjeksiyon',
    categoryLevel3: 'Enjektör Grubu',
    category: 'Mekanik & Yürüyen Aksam > Yakıt & Enjeksiyon > Enjektör Grubu',
    keywords: ['enjektör', 'enjektor', 'enjektör memesi', 'enjektör pulu', 'enjektör tamiri', 'enjektör ayarı', 'common rail', 'piezo enjektör'],
    unit: 'Takım',
    description: 'Dizel common rail piezo/selenoid yüksek basınç enjektör kiti',
  },
  {
    id: 'prc-ful-pmp',
    code: 'BOSCH-FUL-PMP',
    name: 'Yüksek Basınç Yakıt Pompası & Mazot Şamandırası',
    categoryLevel1: 'Mekanik & Yürüyen Aksam',
    categoryLevel2: 'Yakıt & Enjeksiyon',
    categoryLevel3: 'Yakıt Pompası Grubu',
    category: 'Mekanik & Yürüyen Aksam > Yakıt & Enjeksiyon > Yakıt Pompası Grubu',
    keywords: ['yakıt pompası', 'mazot pompası', 'yüksek basınç pompası', 'yakıt şamandırası', 'depo içi pompa', 'benzin pompası'],
    unit: 'Adet',
    description: 'Yüksek basınçlı yakıt besleme pompası ve depo içi şamandıra ünitesi',
  },

  // --- ELEKTRİK, AKÜ & ATEŞLEME ---
  {
    id: 'prc-elk-01',
    code: 'BOSCH-BAT-AGM',
    name: '12V 70-80Ah Start-Stop EFB/AGM Akü',
    categoryLevel1: 'Elektrik & Elektronik',
    categoryLevel2: 'Akü & Güç Depolama',
    categoryLevel3: 'Start-Stop Akü',
    category: 'Elektrik & Elektronik > Akü & Güç Depolama > Start-Stop Akü',
    keywords: ['start stop akü', 'agm akü', 'efb akü', '70ah akü', '72ah akü', '74ah akü', '75ah akü', '80ah akü', 'start stop', 'bosch s5'],
    unit: 'Adet',
    description: 'Start-Stop teknolojili yüksek döngü dayanımlı AGM/EFB kurşun asit akü',
  },
  {
    id: 'prc-elk-02',
    code: 'BOSCH-BAT-STD',
    name: '12V 60-72Ah Standart Akü',
    categoryLevel1: 'Elektrik & Elektronik',
    categoryLevel2: 'Akü & Güç Depolama',
    categoryLevel3: 'Standart Akü',
    category: 'Elektrik & Elektronik > Akü & Güç Depolama > Standart Akü',
    keywords: ['akü', 'aku', '60ah akü', 'standart akü', '12v akü', 'akü değişimi', 'mutlu akü', 'inci akü', 'varta akü', 'bosch s4'],
    unit: 'Adet',
    description: 'Standart binek araç 12V bakım gerektirmeyen kalsiyum akü',
  },
  {
    id: 'prc-ign-01',
    code: 'BOSCH-SPK-PLG',
    name: 'Buji & Ateşleme Bobini Seti (Benzinli)',
    categoryLevel1: 'Elektrik & Elektronik',
    categoryLevel2: 'Ateşleme Sistemi',
    categoryLevel3: 'Buji & Ateşleme Bobini',
    category: 'Elektrik & Elektronik > Ateşleme Sistemi > Buji & Ateşleme Bobini',
    keywords: ['buji', 'ateşleme bujisi', 'iridyum buji', 'buji takımı', 'ateşleme bobini', 'bobin', 'buji kablosu'],
    unit: 'Set',
    description: '4 adet nikel/iridyum buji ve elektronik ateşleme bobinleri',
  },
  {
    id: 'prc-ign-02',
    code: 'BOSCH-GLW-PLG',
    name: 'Kızdırma / Isıtma Bujisi Seti (Dizel)',
    categoryLevel1: 'Elektrik & Elektronik',
    categoryLevel2: 'Ateşleme Sistemi',
    categoryLevel3: 'Kızdırma Bujisi',
    category: 'Elektrik & Elektronik > Ateşleme Sistemi > Kızdırma Bujisi',
    keywords: ['kızdırma bujisi', 'kizdirma bujisi', 'ısıtma bujisi', 'dizel buji', 'ön ısıtma bujisi', 'kızdırma buji'],
    unit: 'Set',
    description: '4 adet seramik kızdırma ısıtma bujisi',
  },
  {
    id: 'prc-elk-03',
    code: 'BOSCH-ALT-GEN',
    name: 'Alternatör / Şarj Dinamosu & Konjektör',
    categoryLevel1: 'Elektrik & Elektronik',
    categoryLevel2: 'Şarj & Marş Sistemi',
    categoryLevel3: 'Alternatör & Şarj',
    category: 'Elektrik & Elektronik > Şarj & Marş Sistemi > Alternatör & Şarj',
    keywords: ['alternatör', 'alternator', 'şarj dinamosu', 'şarj dinamo', 'konjektör', 'diyot tablası', 'şarj kömürü', 'alternatör kasnağı'],
    unit: 'Adet',
    description: 'Komple alternatör şarj dinamosu veya revizyonu',
  },
  {
    id: 'prc-elk-04',
    code: 'BOSCH-STR-MTR',
    name: 'Marş Motoru & Otomatiği',
    categoryLevel1: 'Elektrik & Elektronik',
    categoryLevel2: 'Şarj & Marş Sistemi',
    categoryLevel3: 'Marş Motoru',
    category: 'Elektrik & Elektronik > Şarj & Marş Sistemi > Marş Motoru',
    keywords: ['marş motoru', 'mars motoru', 'marş dinamosu', 'marş otomatiği', 'marş kömürü', 'bendix', 'marş dişlisi'],
    unit: 'Adet',
    description: 'Redüktörlü marş motoru tertibatı',
  },
  {
    id: 'prc-sns-lam',
    code: 'BOSCH-SNS-LAM',
    name: 'Oksijen (Lambda) Sensörü & NOx Sensörü',
    categoryLevel1: 'Elektrik & Elektronik',
    categoryLevel2: 'Sensörler & Göstergeler',
    categoryLevel3: 'Oksijen & Emisyon Sensörleri',
    category: 'Elektrik & Elektronik > Sensörler & Göstergeler > Oksijen & Emisyon Sensörleri',
    keywords: ['oksijen sensörü', 'lambda sensörü', 'nox sensörü', 'egzoz sensörü', 'partikül sensörü', 'egr sensörü'],
    unit: 'Adet',
    description: 'Katalitik konvertör öncesi ve sonrası lambda oksijen sensörü',
  },

  // --- EGZOZ, DPF & EMİSYON ---
  {
    id: 'prc-dpf-unt',
    code: 'BOSCH-DPF-UNT',
    name: 'DPF Dizel Partikül Filtresi & Rejenerasyon',
    categoryLevel1: 'Egzoz & Emisyon',
    categoryLevel2: 'Partikül & Katalizör',
    categoryLevel3: 'DPF Partikül Filtresi',
    category: 'Egzoz & Emisyon > Partikül & Katalizör > DPF Partikül Filtresi',
    keywords: ['dpf', 'd.p.f', 'partikül filtresi', 'partikul filtresi', 'dpf temizliği', 'dpf rejenerasyon', 'dpf değişimi', 'partikül iptal'],
    unit: 'Adet/İşlem',
    description: 'Dizel egzoz kurum yakıcı DPF seramik partikül filtresi',
  },
  {
    id: 'prc-egr-vlv',
    code: 'BOSCH-EGR-VLV',
    name: 'EGR Valfi & EGR Soğutucusu',
    categoryLevel1: 'Egzoz & Emisyon',
    categoryLevel2: 'EGR Sistemi',
    categoryLevel3: 'EGR Valfi & Soğutucu',
    category: 'Egzoz & Emisyon > EGR Sistemi > EGR Valfi & Soğutucu',
    keywords: ['egr', 'egr valfi', 'egr soğutucu', 'egr valf', 'egr temizliği', 'egr motoru', 'egr contası'],
    unit: 'Adet',
    description: 'Egzoz gazı geri dolaşım EGR valfi ve soğutucu eşanjörü',
  },

  // --- SİLECEK, AYDINLATMA & AKSESUAR ---
  {
    id: 'prc-wpr-01',
    code: 'BOSCH-AER-FRT',
    name: 'Aerotwin Silecek Süpürgesi Ön Takımı',
    categoryLevel1: 'Lastik, Jant & Aksesuar',
    categoryLevel2: 'Görüş & Silecek Grubu',
    categoryLevel3: 'Ön Silecek Süpürgesi',
    category: 'Lastik, Jant & Aksesuar > Görüş & Silecek Grubu > Ön Silecek Süpürgesi',
    keywords: ['silecek', 'silecek süpürgesi', 'ön silecek', 'aerotwin', 'muz silecek', 'silecek takımı', 'silecek lastiği', 'ön silecek süpürgesi'],
    unit: 'Takım',
    description: 'Ön cam aerodinamik grafit kaplamalı silecek takımı',
  },
  {
    id: 'prc-wpr-rr',
    code: 'BOSCH-AER-RR',
    name: 'Arka Cam Silecek Süpürgesi & Kolu',
    categoryLevel1: 'Lastik, Jant & Aksesuar',
    categoryLevel2: 'Görüş & Silecek Grubu',
    categoryLevel3: 'Arka Silecek Süpürgesi',
    category: 'Lastik, Jant & Aksesuar > Görüş & Silecek Grubu > Arka Silecek Süpürgesi',
    keywords: ['arka silecek', 'arka cam sileceği', 'arka silecek süpürgesi', 'arka silecek kolu'],
    unit: 'Adet',
    description: 'Arka cam özel aparatlı silecek süpürgesi',
  },
  {
    id: 'prc-lmp-stp',
    code: 'BOSCH-LMP-STP',
    name: 'Stop, Fren & Sinyal Ampulü (P21W / W5W / Çift Duy / LED)',
    categoryLevel1: 'Elektrik & Elektronik',
    categoryLevel2: 'Aydınlatma Grubu',
    categoryLevel3: 'Stop & Fren Ampulü',
    category: 'Elektrik & Elektronik > Aydınlatma Grubu > Stop & Fren Ampulü',
    keywords: ['fren ampulü', 'fren ampul', 'stop ampulü', 'stop ampul', 'arka fren ampulü', 'arka fren ampul', 'sağ arka fren ampul', 'sol arka fren ampul', 'sağ fren ampulü', 'sol fren ampulü', 'sinyal ampulü', 'sinyal ampul', 'arka stop ampulü', 'arka stop ampul', 'sağ stop ampul', 'sol stop ampul', 'p21w', 'py21w', 'p21 5w', 'w5w', 't10', 'çift duy ampul', 'tek duy ampul', 'kırmızı ampul', 'fren lamba ampulü', 'stop lamba ampulü', 'fren lambası ampulü', 'plaka ampulü', 'geri vites ampulü'],
    unit: 'Adet',
    description: 'Arka stop, fren, sinyal, geri vites ve plaka aydınlatma ampulü',
  },
  {
    id: 'prc-lmp-frt',
    code: 'BOSCH-LMP-FRT',
    name: 'Ön Far & Sis Ampulü (H7 / H4 / H1 / H11 / LED / Xenon)',
    categoryLevel1: 'Elektrik & Elektronik',
    categoryLevel2: 'Aydınlatma Grubu',
    categoryLevel3: 'Ön Far & Sis Ampulü',
    category: 'Elektrik & Elektronik > Aydınlatma Grubu > Ön Far & Sis Ampulü',
    keywords: ['far ampulü', 'far ampul', 'ön far ampulü', 'h7 ampul', 'h7', 'h4 ampul', 'h4', 'h1 ampul', 'h1', 'h11 ampul', 'h11', 'sis farı ampulü', 'led far ampulü', 'xenon ampul', 'far lambası', 'uzun far ampulü', 'kısa far ampulü', 'gündüz farı ampulü'],
    unit: 'Adet/Takım',
    description: 'Halojen, LED ve Xenon yüksek aydınlatmalı ön far ve sis ampulü',
  },
  {
    id: 'prc-lmp-set',
    code: 'BOSCH-LMP-SET',
    name: 'Genel Oto Ampul & Aydınlatma Seti',
    categoryLevel1: 'Elektrik & Elektronik',
    categoryLevel2: 'Aydınlatma Grubu',
    categoryLevel3: 'Far & Ampul Grubu',
    category: 'Elektrik & Elektronik > Aydınlatma Grubu > Far & Ampul Grubu',
    keywords: ['ampul', 'ampul seti', 'oto ampul', 'aydınlatma seti', 'yedek ampul', 'ampul değişimi', 'lamba ampulü', 'aydınlatma'],
    unit: 'Takım/Adet',
    description: 'Yüksek ışık verimli far, stop, sis ve sinyal ampul takımı',
  },

  // --- İKLİMLENDİRME & KLİMA ---
  {
    id: 'prc-clm-01',
    code: 'BOSCH-CLM-GAS',
    name: 'Klima Gaz Dolumu (R134a / R1234yf) & Kaçak Testi',
    categoryLevel1: 'İklimlendirme & Konfor',
    categoryLevel2: 'Klima Gazı & Kaçak Testi',
    categoryLevel3: 'Gaz Dolumu & Dezenfeksiyon',
    category: 'İklimlendirme & Konfor > Klima Gazı & Kaçak Testi > Gaz Dolumu & Dezenfeksiyon',
    keywords: ['klima gazı', 'klima gazi', 'klima dolum', 'klima gaz dolumu', 'klima bakımı', 'gaz dolumu', 'klima kaçak testi', 'r134a', '1234yf'],
    unit: 'Dolum',
    description: 'Klima gazı vakumlama, kaçak testi ve kompresör yağı basımı',
  },
  {
    id: 'prc-clm-02',
    code: 'BOSCH-CLM-CMP',
    name: 'Klima Kompresörü, Kasnağı & Kondenser',
    categoryLevel1: 'İklimlendirme & Konfor',
    categoryLevel2: 'Klima Mekaniği',
    categoryLevel3: 'Kompresör & Kondenser',
    category: 'İklimlendirme & Konfor > Klima Mekaniği > Kompresör & Kondenser',
    keywords: ['klima kompresörü', 'klima motoru', 'klima kasnağı', 'klima radyatörü', 'kondenser', 'klima debriyajı'],
    unit: 'Adet',
    description: 'Klima soğutma kompresörü ve kavrama kasnağı',
  },

  // --- LASTİK & ROT BALANS ---
  {
    id: 'prc-tyr-16',
    code: 'BOSCH-TYR-16',
    name: '205/55 R16 Binek Lastik Seti (4 Adet)',
    categoryLevel1: 'Lastik, Jant & Aksesuar',
    categoryLevel2: 'Binek Lastik Grubu',
    categoryLevel3: '16 İnç Lastik Takımı',
    category: 'Lastik, Jant & Aksesuar > Binek Lastik Grubu > 16 İnç Lastik Takımı',
    keywords: ['205/55', '205 55 16', 'r16 lastik', 'yaz lastiği', 'kış lastiği', '4 adet lastik', 'lastik değişimi', 'lastik montaj'],
    unit: 'Takım (4)',
    description: '4 adet 205/55 R16 binek lastik takımı ve montajı',
  },
  {
    id: 'prc-tyr-15',
    code: 'BOSCH-TYR-15',
    name: '185/65 R15 - 195/65 R15 Binek Lastik Seti (4 Adet)',
    categoryLevel1: 'Lastik, Jant & Aksesuar',
    categoryLevel2: 'Binek Lastik Grubu',
    categoryLevel3: '15 İnç Lastik Takımı',
    category: 'Lastik, Jant & Aksesuar > Binek Lastik Grubu > 15 İnç Lastik Takımı',
    keywords: ['185/65', '195/65', 'r15 lastik', '15 inç lastik', '195 65 15', '185 65 15'],
    unit: 'Takım (4)',
    description: '4 adet 15 inç binek lastik seti',
  },
  {
    id: 'prc-tyr-cv',
    code: 'BOSCH-TYR-CV',
    name: '215/65 R16C Ticari Panelvan Yük Lastik Seti',
    categoryLevel1: 'Lastik, Jant & Aksesuar',
    categoryLevel2: 'Ticari Lastik Grubu',
    categoryLevel3: 'C Sınıfı Yük Lastiği',
    category: 'Lastik, Jant & Aksesuar > Ticari Lastik Grubu > C Sınıfı Yük Lastiği',
    keywords: ['215/65 r16c', 'ticari lastik', 'panelvan lastik', 'c serisi lastik', 'yük lastiği', '16c lastik'],
    unit: 'Takım (4)',
    description: 'Hafif ticari yüksek yük endeksli C sınıfı 4 adet lastik',
  },
  {
    id: 'prc-tyr-aln',
    code: 'BOSCH-TYR-ALN',
    name: 'Ön Düzen, Rot Ayarı & 4 Tekerlek Balans Hizmeti',
    categoryLevel1: 'Lastik, Jant & Aksesuar',
    categoryLevel2: 'Lastik Hizmetleri',
    categoryLevel3: 'Rot & Balans Ayarı',
    category: 'Lastik, Jant & Aksesuar > Lastik Hizmetleri > Rot & Balans Ayarı',
    keywords: ['rot balans', 'rot-balans', 'rot ayarı', 'balans ayarı', 'ön düzen ayarı', 'rot ayar', 'balans ayar', 'lastik balans'],
    unit: 'İşlem',
    description: 'Lazerli ön düzen açı kalibrasyonu ve 4 tekerlek balans ayarı',
  },

  // --- İŞÇİLİK & SERVİS HİZMETLERİ ---
  {
    id: 'prc-srv-lab',
    code: 'BOSCH-SRV-LAB',
    name: 'Periyodik Bakım Mekanik İşçiliği & Kontrol',
    categoryLevel1: 'İşçilik & Hizmetler',
    categoryLevel2: 'Periyodik Bakım İşçiliği',
    categoryLevel3: 'Periyodik Bakım İşçiliği',
    category: 'İşçilik & Hizmetler > Periyodik Bakım İşçiliği > Periyodik Bakım İşçiliği',
    keywords: ['bakım işçiliği', 'periyodik bakım işçilik', 'yağ değişimi işçilik', 'servis işçiliği', 'mekanik işçilik', 'işçilik bedeli', 'işçilik tutarı', 'ustalık'],
    unit: 'Saat/İşlem',
    description: 'Planlı periyodik bakım 15 nokta araç kabul mekanik kontrolü ve işçiliği',
  },
  {
    id: 'prc-brk-lab',
    code: 'BOSCH-BRK-LAB',
    name: 'Fren Sistemi Değişim & Bakım İşçiliği',
    categoryLevel1: 'İşçilik & Hizmetler',
    categoryLevel2: 'Fren İşçiliği',
    categoryLevel3: 'Fren Değişim İşçiliği',
    category: 'İşçilik & Hizmetler > Fren İşçiliği > Fren Değişim İşçiliği',
    keywords: ['fren işçiliği', 'balata değişim işçilik', 'disk değişim işçilik', 'ön balata işçilik', 'fren hidrolik değişim işçilik'],
    unit: 'İşlem',
    description: 'Ön ve arka fren balatası/diski sökme takma ve hidrolik hava alma işçiliği',
  },
  {
    id: 'prc-diag-srv',
    code: 'BOSCH-DIAG-SRV',
    name: 'Bilgisayarlı Arıza Tespit, Diyagnoz & Ekspertiz',
    categoryLevel1: 'İşçilik & Hizmetler',
    categoryLevel2: 'Diyagnoz & Ekspertiz',
    categoryLevel3: 'Arıza Tespit Hizmeti',
    category: 'İşçilik & Hizmetler > Diyagnoz & Ekspertiz > Arıza Tespit Hizmeti',
    keywords: ['arıza tespit', 'ariza tespit', 'diyagnoz', 'diagnostic', 'bilgisayarlı arıza tespiti', 'check-up', 'check up', 'ekspertiz', 'hata kodu okuma'],
    unit: 'İşlem',
    description: 'Bosch KTS / OBD elektronik beyin hata teşhisi ve canlı sensör testleri',
  }
];

let currentActiveCatalog: PartCatalogItem[] = DEFAULT_PARTS_CATALOG;

interface FastCatalogIndex {
  exactKwMap: Map<string, { item: PartCatalogItem; matchedKeyword: string; score: number }>;
  codeMap: Map<string, PartCatalogItem>;
  tokenMap: Map<string, Array<{ item: PartCatalogItem; kwClean: string; rawKw: string; kwWordCount: number }>>;
  catalogRef: PartCatalogItem[];
}

let activeCatalogIndex: FastCatalogIndex | null = null;
const canonicalExtractCache = new Map<string, CanonicalPartExtractionResult>();

function buildFastCatalogIndex(catalog: PartCatalogItem[]): FastCatalogIndex {
  const exactKwMap = new Map<string, { item: PartCatalogItem; matchedKeyword: string; score: number }>();
  const codeMap = new Map<string, PartCatalogItem>();
  const tokenMap = new Map<string, Array<{ item: PartCatalogItem; kwClean: string; rawKw: string; kwWordCount: number }>>();

  for (let i = 0; i < catalog.length; i++) {
    const item = catalog[i];
    if (item.code) {
      const codeClean = cleanText(item.code);
      if (codeClean.length >= 3) {
        codeMap.set(codeClean, item);
      }
    }

    const kws = item.keywords || [];
    for (let j = 0; j < kws.length; j++) {
      const rawKw = kws[j];
      const cleanKw = cleanText(rawKw);
      if (cleanKw.length < 2) continue;

      const words = cleanKw.split(/\s+/).filter(w => w.length >= 2);
      const kwWordCount = words.length;

      // Higher score for longer keywords
      const current = exactKwMap.get(cleanKw);
      if (!current || cleanKw.length * 5 > current.score) {
        exactKwMap.set(cleanKw, {
          item,
          matchedKeyword: rawKw,
          score: 260 + cleanKw.length * 5,
        });
      }

      // Add to token inverted index for phrase/word match
      const entry = { item, kwClean: cleanKw, rawKw, kwWordCount };
      for (const w of words) {
        if (w.length >= 3) {
          let list = tokenMap.get(w);
          if (!list) {
            list = [];
            tokenMap.set(w, list);
          }
          list.push(entry);
        }
      }
    }
  }

  return { exactKwMap, codeMap, tokenMap, catalogRef: catalog };
}

function getOrBuildCatalogIndex(catalog?: PartCatalogItem[]): FastCatalogIndex {
  const cat = catalog && catalog.length > 0 ? catalog : getActiveCatalog();
  if (activeCatalogIndex && activeCatalogIndex.catalogRef === cat) {
    return activeCatalogIndex;
  }
  const idx = buildFastCatalogIndex(cat);
  if (cat === currentActiveCatalog) {
    activeCatalogIndex = idx;
  }
  return idx;
}

export function clearCatalogCaches(): void {
  canonicalExtractCache.clear();
  cleanTextCache.clear();
  activeCatalogIndex = null;
  recordMatchCache.clear();
  cachedCatalogRef = null;
}

export function setActiveCatalog(catalog: PartCatalogItem[]): void {
  if (catalog && Array.isArray(catalog) && catalog.length > 0) {
    currentActiveCatalog = catalog;
    clearCatalogCaches();
    activeCatalogIndex = buildFastCatalogIndex(catalog);
  }
}

export function getActiveCatalog(): PartCatalogItem[] {
  return currentActiveCatalog;
}

const cleanTextCache = new Map<string, string>();

/**
 * Normalizes Turkish automotive descriptions, expanding industry-specific abbreviations,
 * typos, and standardizing tokens.
 */
export function cleanText(input: string): string {
  if (!input) return '';
  const cached = cleanTextCache.get(input);
  if (cached !== undefined) return cached;

  let res = input
    .toLocaleLowerCase('tr-TR')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/Ğ/g, 'ğ')
    .replace(/Ü/g, 'ü')
    .replace(/Ş/g, 'ş')
    .replace(/Ö/g, 'ö')
    .replace(/Ç/g, 'ç')
    .replace(/[\/\-\_\,\.\;\:\(\)\[\]\+\*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Automotive abbreviation expansions
  res = res
    .replace(/\b(flt|fltr|filt)\b/g, 'filtre')
    .replace(/\b(yag flt|yağ flt|yag filtre|yağ filtre)\b/g, 'yağ filtresi')
    .replace(/\b(hva flt|hava flt|hav flt|hava filtre)\b/g, 'hava filtresi')
    .replace(/\b(pln flt|polen flt|pol flt|polen filtre|kabin flt)\b/g, 'polen filtresi')
    .replace(/\b(mzt flt|mazot flt|ykt flt|yakit flt|yakıt flt|mazot filtre|yakıt filtre)\b/g, 'yakıt mazot filtresi')
    .replace(/\b(on bal|on balata|balata on|bal on)\b/g, 'ön balata')
    .replace(/\b(ark bal|arka bal|arka balata|balata ark|bal ark)\b/g, 'arka balata')
    .replace(/\b(on disk|disk on)\b/g, 'ön disk')
    .replace(/\b(ark disk|arka disk|disk ark)\b/g, 'arka disk')
    .replace(/\b(z rot|z-rot|zrot|aski rotu|viraj rotu)\b/g, 'z rot')
    .replace(/\b(rot b|rot bas|rot basi|rot başı)\b/g, 'rot başı')
    .replace(/\b(rot m|rot mil|rot mili|rot kolu)\b/g, 'rot mili')
    .replace(/\b(salincak b|salıncak b|salincak burcu|salıncak burcu)\b/g, 'salıncak')
    .replace(/\b(amartisor|amortisor|amortisör)\b/g, 'amortisör')
    .replace(/\b(devirdayim|devir daim|devird|su pompasi|su pompası)\b/g, 'devirdaim su pompası')
    .replace(/\b(trg|triger k|triger kayisi|triger kayışı)\b/g, 'triger seti')
    .replace(/\b(v kayis|v kayışı|sarj kayisi|alternator kayisi)\b/g, 'v kayışı')
    .replace(/\b(baski balata|baskı balata)\b/g, 'baskı balata')
    .replace(/\b(debriyac)\b/g, 'debriyaj')
    .replace(/\b(volant|cift kutleli volan|çift kütleli volan)\b/g, 'volan')
    .replace(/\b(krank kecesi|krank keçe|krank kece)\b/g, 'krank keçesi')
    .replace(/\b(yag kecesi|yağ keçe|yag kece)\b/g, 'yağ keçesi')
    .replace(/\b(fren ampul|fren ampulu|stop ampul|stop ampulu)\b/g, 'stop fren ampulü')
    .replace(/\b(far ampul|far ampulu)\b/g, 'far ampulü')
    .replace(/\b(sinyal ampul|sinyal ampulu)\b/g, 'sinyal ampulü')
    .replace(/\b(5 30|5\/30)\b/g, '5w30')
    .replace(/\b(5 40|5\/40)\b/g, '5w40')
    .replace(/\b(0 20|0\/20)\b/g, '0w20')
    .replace(/\b(10 40|10\/40)\b/g, '10w40')
    .replace(/\b(rot balans|rot ayari|balans ayari|on duzen)\b/g, 'rot balans')
    .replace(/\b(porya bilyasi|teker rulmani|tekerlek bilyasi)\b/g, 'porya bilyası')
    .replace(/\b(kizdirma|isitma bujisi)\b/g, 'kızdırma bujisi')
    .replace(/\b(isclik|iscilik|işcilik)\b/g, 'işçilik')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanTextCache.size > 10000) {
    cleanTextCache.clear();
  }
  cleanTextCache.set(input, res);
  return res;
}

/**
 * Converts text to Turkish Title Case respecting Turkish character set and small conjunctions.
 */
export function toTurkishTitleCase(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .split(/\s+/)
    .map(word => {
      if (!word) return '';
      if (/^(ve|ile|de|da|veya|için|icin)$/i.test(word)) return word.toLocaleLowerCase('tr-TR');
      return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR');
    })
    .join(' ');
}

export interface CanonicalPartExtractionResult {
  canonicalName: string;
  categoryLevel1: string;
  categoryLevel2: string;
  categoryLevel3: string;
  isStandardized: boolean;
}

/**
 * Searches the parts catalog using aliases/keywords defined in KEYWORDS_TR.
 * Prioritizes exact phrase matches, multi-word terms, and OEM part codes.
 */
export function matchCatalogByKeywords(
  rawDescription: string,
  expenseType: string = '',
  catalog?: PartCatalogItem[]
): { item: PartCatalogItem; matchedKeyword: string; score: number } | null {
  const index = getOrBuildCatalogIndex(catalog);
  if (!index || index.catalogRef.length === 0) return null;

  const rawClean = cleanText(rawDescription || '');
  const expClean = cleanText(expenseType || '');
  const combined = `${rawClean} ${expClean}`.trim();
  if (!combined) return null;

  // 1. Instant O(1) exact keyword match on rawClean
  const exactRaw = index.exactKwMap.get(rawClean);
  if (exactRaw) return exactRaw;

  // Build noise-stripped version of raw description
  const stripped = rawClean
    .replace(/\b[a-z0-9]{2,}[-/.][a-z0-9/-]{2,}\b/gi, ' ')
    .replace(/\b(oem|oe|ref|kod|stok|pn|p\/n|parca no|parça no)\s*[:#\-]?\s*[a-z0-9\-\.]+\b/gi, ' ')
    .replace(/\b\d{3}\s+\d{3}\s+\d{3,4}\b/g, ' ')
    .replace(/\b\d{6,}\b/g, ' ')
    .replace(/\b\d+(\.\d+)?\s*(adet|ad\.|ad|lt\.|lt|litre|kg\.|kg|kutu|takim|takım|set|tk|x)\b/gi, ' ')
    .replace(/\(\s*\d+\s*(adet|ad|lt|litre|kg|tk|set)\s*\)/gi, ' ')
    .replace(/\b(sökme takma|sökme-takma|sökme|takma|değişimi|değiştirilmesi|degisimi|degistirilmesi|yenilemesi|yenileme|montajı|montaji|montaj|demontaj|demontajı|revizyonu|revizyon|tamiri|tamir|onarımı|onarim|bakımı|bakim|bakimi|kontrolü|kontrol|işlemi|islemi|islem|bedeli|ücreti|ucreti|fatura)\b/gi, ' ')
    .replace(/\b(bosch|castrol|mobil|shell|total|petronas|motul|liqui moly|luk|sachs|valeo|mutlu|inci|varta|delphi|ferodo|brembo|mann|filtron|mahle|febi|swag|meyle|gates|dayco|skf|fag|ina|mais|orjinal|orj|yan sanayi|muadil|esdeger|eşdeğer)\b/gi, ' ')
    .replace(/[*#\(\)\[\]\{\}_=~"';:<>!?,|\/\\]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Instant O(1) exact match on stripped
  if (stripped) {
    const exactStripped = index.exactKwMap.get(stripped);
    if (exactStripped) return exactStripped;
  }

  // 3. Fast OEM Part code match
  for (const [codeClean, item] of index.codeMap) {
    if (rawClean.includes(codeClean) || combined.includes(codeClean)) {
      return { item, matchedKeyword: item.code, score: 200 };
    }
  }

  // 4. Inverted Token Index Lookup for phrase matches:
  // Instead of scanning all 300 items x 10 keywords, we only check candidates that share at least one significant word
  const queryWords = (stripped || rawClean).split(/\s+/).filter(w => w.length >= 3);
  const candidateEntries: Array<{ item: PartCatalogItem; kwClean: string; rawKw: string; kwWordCount: number }> = [];
  const seenEntries = new Set<string>();

  for (const qw of queryWords) {
    const hits = index.tokenMap.get(qw);
    if (hits) {
      for (let h = 0; h < hits.length; h++) {
        const item = hits[h];
        const key = `${item.item.id}___${item.kwClean}`;
        if (!seenEntries.has(key)) {
          seenEntries.add(key);
          candidateEntries.push(item);
        }
      }
    }
  }

  let bestItem: PartCatalogItem | null = null;
  let bestScore = 0;
  let bestMatchedKw = '';

  const entriesToEval = candidateEntries.length > 0 ? candidateEntries : [];

  for (let j = 0; j < entriesToEval.length; j++) {
    const entry = entriesToEval[j];
    const cleanKw = entry.kwClean;
    let score = 0;

    if (stripped.length > 0 && (` ${stripped} `).includes(` ${cleanKw} `)) {
      score = 130 + (entry.kwWordCount * 35) + cleanKw.length * 3;
    } else if ((` ${combined} `).includes(` ${cleanKw} `)) {
      score = 95 + (entry.kwWordCount * 30) + cleanKw.length * 2;
    } else if (stripped.length >= 4 && (` ${cleanKw} `).includes(` ${stripped} `)) {
      score = 75 + stripped.length * 2;
    }

    if (score > 0) {
      // Disambiguate Ön / Arka
      const kwHasFront = cleanKw.includes('ön') || cleanKw.includes('on ');
      const kwHasRear = cleanKw.includes('arka') || cleanKw.includes('ark ');
      const textHasFront = combined.includes('ön') || combined.includes('on ');
      const textHasRear = combined.includes('arka') || combined.includes('ark ');

      if (textHasFront && kwHasRear) score -= 120;
      if (textHasRear && kwHasFront) score -= 120;

      // Disambiguate Balata / Disk
      const kwHasBalata = cleanKw.includes('balata');
      const kwHasDisk = cleanKw.includes('disk');
      const textHasBalata = combined.includes('balata');
      const textHasDisk = combined.includes('disk');

      if (textHasBalata && !textHasDisk && kwHasDisk) score -= 120;
      if (textHasDisk && !textHasBalata && kwHasBalata) score -= 120;

      if (score > bestScore) {
        bestScore = score;
        bestItem = entry.item;
        bestMatchedKw = entry.rawKw;
      }
    }
  }

  if (bestItem && bestScore >= 50) {
    return {
      item: bestItem,
      matchedKeyword: bestMatchedKw,
      score: bestScore,
    };
  }

  return null;
}

/**
 * Strips all noise from raw invoice descriptions (OEM part codes, serial numbers,
 * quantity/unit noise like "1 ADET", "4 LİTRE", action verbs like "DEĞİŞİMİ", "SÖKME TAKMA",
 * brand tags like "(BOSCH)", "(ORJ)", etc.) and isolates the true canonical part name,
 * leveraging the KEYWORDS_TR column from the parts catalog and mapping logically to standard 3-level categories.
 */
function _extractCanonicalPartNameInternal(
  rawDescription: string,
  expenseType: string = '',
  matchedCatalogName?: string,
  catalog?: PartCatalogItem[]
): CanonicalPartExtractionResult {
  const activeCat = catalog && catalog.length > 0 ? catalog : getActiveCatalog();

  // If matched with an official catalog item, use its clean name & derive categories
  if (matchedCatalogName && matchedCatalogName.trim().length > 0) {
    const foundInCat = activeCat.find(c => c.name.toLowerCase() === matchedCatalogName.toLowerCase());
    if (foundInCat) {
      return {
        canonicalName: foundInCat.name,
        categoryLevel1: foundInCat.categoryLevel1,
        categoryLevel2: foundInCat.categoryLevel2,
        categoryLevel3: foundInCat.categoryLevel3,
        isStandardized: true,
      };
    }
    const derived = derive3LevelCategoryFromPartGroup(matchedCatalogName);
    return {
      canonicalName: matchedCatalogName.trim(),
      categoryLevel1: derived.level1,
      categoryLevel2: derived.level2,
      categoryLevel3: derived.level3,
      isStandardized: true,
    };
  }

  const raw = (rawDescription || '').trim();
  const exp = (expenseType || '').trim();
  if (!raw && !exp) {
    return {
      canonicalName: 'Genel Parça / Hizmet',
      categoryLevel1: 'Genel Bakım & Onarım',
      categoryLevel2: 'Muhtelif Servis Hizmetleri',
      categoryLevel3: 'Genel Parça / Hizmet',
      isStandardized: false,
    };
  }

  // 1. Expand standard abbreviations
  let clean = cleanText(`${raw} ${exp}`);

  // 2. Comprehensive Noise Stripping (Codes, Quantities, Action verbs, Brands, Punctuation)
  clean = clean
    // Strip part numbers and alphanumeric code sequences (e.g. 1K0698151, 8200768913, BOS-1234, 0 986 424 705)
    .replace(/\b[a-z0-9]{2,}[-/.][a-z0-9/-]{2,}\b/gi, ' ')
    .replace(/\b(oem|oe|ref|kod|stok|pn|p\/n|parca no|parça no)\s*[:#\-]?\s*[a-z0-9\-\.]+\b/gi, ' ')
    .replace(/\b\d{3}\s+\d{3}\s+\d{3,4}\b/g, ' ')
    .replace(/\b\d{6,}\b/g, ' ')
    .replace(/\b[a-z]\d{5,}\b/gi, ' ')
    // Strip quantity and measurement noise (e.g. 1 ADET, 4 LT, 2 AD, 1.5 KG, (2 ADET))
    .replace(/\b\d+(\.\d+)?\s*(adet|ad\.|ad|lt\.|lt|litre|kg\.|kg|kutu|takim|takım|set|tk|x|adet\/takım)\b/gi, ' ')
    .replace(/\(\s*\d+\s*(adet|ad|lt|litre|kg|tk|set)\s*\)/gi, ' ')
    .replace(/\b(1|2|3|4|5|6|8)\s*(ad|adet|lt|litre|tk|takım|set)\b/gi, ' ')
    // Strip action verbs and workflow nouns (e.g. SÖKME TAKMA, DEĞİŞİMİ, MONTAJI, REVİZYONU, BAKIMI)
    .replace(/\b(sökme takma|sökme-takma|sökme montaj|sökülüp takılması|sökme|takma|değişimi|değiştirilmesi|degisimi|degistirilmesi|yenilemesi|yenileme|montajı|montaji|montaj|demontaj|demontajı|revizyonu|revizyon|tamiri|tamir|onarımı|onarim|bakımı|bakim|bakimi|kontrolü|kontrolu|kontrol|işlemi|islemi|islem|bedeli|ücreti|ucreti|fiyatı|fiyati|fatura|faturası|talep|talep no|ustalık|ustalik|ücret)\b/gi, ' ')
    // Strip brand & supplier names (e.g. BOSCH, CASTROL, MOBIL, VALEO, LUK, SACHS, MUTLU, INCI, etc.)
    .replace(/\b(bosch|castrol|mobil|shell|total|petronas|motul|liqui moly|luk|sachs|valeo|mutlu|inci|varta|delphi|ferodo|brembo|mann|filtron|mahle|febi|swag|meyle|gates|dayco|skf|fag|ina|mais|orjinal|orj|yan sanayi|muadil|esdeger|eşdeğer|ithal|yerli|oe|oem|genel)\b/gi, ' ')
    .replace(/[*#\(\)\[\]\{\}_=~"';:<>!?,|\/\\]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 3. Catalog KEYWORDS_TR matching (Normalizing with possible part names from catalog)
  const kwMatch = matchCatalogByKeywords(raw, exp, activeCat);
  if (kwMatch && kwMatch.item) {
    return {
      canonicalName: kwMatch.item.name,
      categoryLevel1: kwMatch.item.categoryLevel1,
      categoryLevel2: kwMatch.item.categoryLevel2,
      categoryLevel3: kwMatch.item.categoryLevel3,
      isStandardized: true,
    };
  }

  // 4. Automotive Semantic Mapping (Domain-Specific Dictionary)

  // A. Aydınlatma & Ampul Grubu
  if (clean.includes('ampul') || clean.includes('lamba') || clean.includes('p21w') || clean.includes('py21w') || clean.includes('w5w') || clean.includes('t10') || clean.includes('h7') || clean.includes('h4') || clean.includes('h1') || clean.includes('h11') || clean.includes('led ampul') || clean.includes('xenon') || clean.includes('stop fren ampulü') || clean.includes('far ampulü')) {
    if (clean.includes('fren') || clean.includes('stop') || clean.includes('sinyal') || clean.includes('arka') || clean.includes('p21') || clean.includes('w5w') || clean.includes('plaka')) {
      return {
        canonicalName: 'Stop & Fren Ampulü (P21W / W5W)',
        categoryLevel1: 'Elektrik & Elektronik',
        categoryLevel2: 'Aydınlatma Grubu',
        categoryLevel3: 'Stop & Fren Ampulü',
        isStandardized: true,
      };
    }
    if (clean.includes('far') || clean.includes('sis') || clean.includes('h7') || clean.includes('h4') || clean.includes('h1') || clean.includes('h11') || clean.includes('ön') || clean.includes('on')) {
      return {
        canonicalName: 'Ön Far & Sis Ampulü (H7 / H4 / LED)',
        categoryLevel1: 'Elektrik & Elektronik',
        categoryLevel2: 'Aydınlatma Grubu',
        categoryLevel3: 'Ön Far & Sis Ampulü',
        isStandardized: true,
      };
    }
    return {
      canonicalName: 'Oto Aydınlatma Ampulü',
      categoryLevel1: 'Elektrik & Elektronik',
      categoryLevel2: 'Aydınlatma Grubu',
      categoryLevel3: 'Ampul Grubu',
      isStandardized: true,
    };
  }

  // B. Filtre Grubu (Periyodik Bakım)
  if (clean.includes('filtre') || clean.includes('filtresi')) {
    if (clean.includes('yag') || clean.includes('yağ')) {
      return {
        canonicalName: 'Yağ Filtresi',
        categoryLevel1: 'Periyodik Bakım & Sıvılar',
        categoryLevel2: 'Filtre Grubu',
        categoryLevel3: 'Yağ Filtresi',
        isStandardized: true,
      };
    }
    if (clean.includes('hava')) {
      return {
        canonicalName: 'Hava Filtresi',
        categoryLevel1: 'Periyodik Bakım & Sıvılar',
        categoryLevel2: 'Filtre Grubu',
        categoryLevel3: 'Hava Filtresi',
        isStandardized: true,
      };
    }
    if (clean.includes('polen') || clean.includes('kabin') || clean.includes('karbonlu')) {
      return {
        canonicalName: 'Polen / Kabin Filtresi',
        categoryLevel1: 'Periyodik Bakım & Sıvılar',
        categoryLevel2: 'Filtre Grubu',
        categoryLevel3: 'Polen Filtresi',
        isStandardized: true,
      };
    }
    if (clean.includes('yakit') || clean.includes('yakıt') || clean.includes('mazot') || clean.includes('benzin')) {
      return {
        canonicalName: 'Yakıt / Mazot Filtresi',
        categoryLevel1: 'Periyodik Bakım & Sıvılar',
        categoryLevel2: 'Filtre Grubu',
        categoryLevel3: 'Yakıt Filtresi',
        isStandardized: true,
      };
    }
    if (clean.includes('set') || clean.includes('bakim') || clean.includes('4 lu') || clean.includes('4 lü')) {
      return {
        canonicalName: "4'lü Periyodik Filtre Seti",
        categoryLevel1: 'Periyodik Bakım & Sıvılar',
        categoryLevel2: 'Filtre Grubu',
        categoryLevel3: 'Bakım Filtre Seti',
        isStandardized: true,
      };
    }
  }

  // C. Sıvılar, Yağlar & Kimyasallar
  if (clean.includes('5w30') || clean.includes('5w40') || clean.includes('5w 30') || clean.includes('5w 40') || clean.includes('tam sentetik') || clean.includes('motor yagi') || clean.includes('motor yağı')) {
    return {
      canonicalName: 'Tam Sentetik Motor Yağı (5W-30 / 5W-40)',
      categoryLevel1: 'Periyodik Bakım & Sıvılar',
      categoryLevel2: 'Motor Yağları & Katkılar',
      categoryLevel3: 'Tam Sentetik Motor Yağı',
      isStandardized: true,
    };
  }
  if (clean.includes('0w20') || clean.includes('0w30') || clean.includes('0w 20') || clean.includes('0w 30')) {
    return {
      canonicalName: 'Tam Sentetik Motor Yağı (0W-20 / 0W-30)',
      categoryLevel1: 'Periyodik Bakım & Sıvılar',
      categoryLevel2: 'Motor Yağları & Katkılar',
      categoryLevel3: 'Tam Sentetik Motor Yağı',
      isStandardized: true,
    };
  }
  if (clean.includes('10w40') || clean.includes('15w40') || clean.includes('10w 40') || clean.includes('yari sentetik') || clean.includes('yarı sentetik')) {
    return {
      canonicalName: 'Yarı Sentetik Motor Yağı (10W-40)',
      categoryLevel1: 'Periyodik Bakım & Sıvılar',
      categoryLevel2: 'Motor Yağları & Katkılar',
      categoryLevel3: 'Yarı Sentetik Motor Yağı',
      isStandardized: true,
    };
  }
  if (clean.includes('antifriz') || clean.includes('antifreeze')) {
    return {
      canonicalName: 'Organik Antifriz (-40°C)',
      categoryLevel1: 'Periyodik Bakım & Sıvılar',
      categoryLevel2: 'Soğutma Sıvıları',
      categoryLevel3: 'Organik Antifriz',
      isStandardized: true,
    };
  }
  if (clean.includes('adblue') || clean.includes('ad blue')) {
    return {
      canonicalName: 'AdBlue SCR Emisyon Sıvısı',
      categoryLevel1: 'Periyodik Bakım & Sıvılar',
      categoryLevel2: 'Egzoz Emisyon Sıvıları',
      categoryLevel3: 'AdBlue SCR Sıvısı',
      isStandardized: true,
    };
  }
  if (clean.includes('cam suyu') || clean.includes('silecek suyu')) {
    return {
      canonicalName: 'Cam Suyu & Temizleyiciler',
      categoryLevel1: 'Periyodik Bakım & Sıvılar',
      categoryLevel2: 'Sarf Sıvılar',
      categoryLevel3: 'Cam Suyu & Temizleyiciler',
      isStandardized: true,
    };
  }
  if (clean.includes('balata sprey') || clean.includes('balata spreyi') || clean.includes('sivi gres') || clean.includes('sıvı gres') || clean.includes('pas sokucu') || clean.includes('wd40')) {
    return {
      canonicalName: 'Balata Spreyi & Sarf Kimyasallar',
      categoryLevel1: 'Periyodik Bakım & Sıvılar',
      categoryLevel2: 'Bakım Kimyasalları',
      categoryLevel3: 'Balata Spreyi & Gres',
      isStandardized: true,
    };
  }
  if (clean.includes('sanziman yagi') || clean.includes('şanzıman yağı') || clean.includes('atf') || clean.includes('dsg yagi') || clean.includes('diferansiyel yagi')) {
    return {
      canonicalName: 'Şanzıman & Diferansiyel Yağı',
      categoryLevel1: 'Periyodik Bakım & Sıvılar',
      categoryLevel2: 'Şanzıman Sıvıları',
      categoryLevel3: 'Şanzıman & Diferansiyel Yağı',
      isStandardized: true,
    };
  }

  // D. Fren Sistemi
  if (clean.includes('balata') || clean.includes('disk') || clean.includes('fren') || clean.includes('kampana') || clean.includes('kaliper')) {
    if (clean.includes('ön balata') || clean.includes('on balata') || (clean.includes('ön') && clean.includes('balata')) || (clean.includes('on') && clean.includes('balata'))) {
      return {
        canonicalName: 'Ön Fren Balatası',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Fren Sistemi',
        categoryLevel3: 'Ön Fren Balatası',
        isStandardized: true,
      };
    }
    if (clean.includes('arka balata') || clean.includes('ark balata') || (clean.includes('arka') && clean.includes('balata')) || (clean.includes('ark') && clean.includes('balata'))) {
      return {
        canonicalName: 'Arka Fren Balatası',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Fren Sistemi',
        categoryLevel3: 'Arka Fren Balatası',
        isStandardized: true,
      };
    }
    if (clean.includes('ön disk') || clean.includes('on disk') || (clean.includes('ön') && clean.includes('disk')) || (clean.includes('on') && clean.includes('disk'))) {
      return {
        canonicalName: 'Ön Fren Diski',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Fren Sistemi',
        categoryLevel3: 'Ön Fren Diski',
        isStandardized: true,
      };
    }
    if (clean.includes('arka disk') || clean.includes('ark disk') || (clean.includes('arka') && clean.includes('disk')) || (clean.includes('ark') && clean.includes('disk'))) {
      return {
        canonicalName: 'Arka Fren Diski',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Fren Sistemi',
        categoryLevel3: 'Arka Fren Diski',
        isStandardized: true,
      };
    }
    if (clean.includes('balata')) {
      return {
        canonicalName: 'Fren Balata Takımı',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Fren Sistemi',
        categoryLevel3: 'Fren Balatası',
        isStandardized: true,
      };
    }
    if (clean.includes('disk')) {
      return {
        canonicalName: 'Fren Diski Çifti',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Fren Sistemi',
        categoryLevel3: 'Fren Diski',
        isStandardized: true,
      };
    }
    if (clean.includes('kampana') || clean.includes('pabuc') || clean.includes('pabuç')) {
      return {
        canonicalName: 'Fren Kampanası & Pabucu',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Fren Sistemi',
        categoryLevel3: 'Fren Kampanası',
        isStandardized: true,
      };
    }
    if (clean.includes('kaliper')) {
      return {
        canonicalName: 'Fren Kaliperi & Tamir Takımı',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Fren Sistemi',
        categoryLevel3: 'Fren Kaliperi',
        isStandardized: true,
      };
    }
    if (clean.includes('el fren') || clean.includes('park fren')) {
      return {
        canonicalName: 'El Fren Teli & Mekanizması',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Fren Sistemi',
        categoryLevel3: 'El Fren Sistemi',
        isStandardized: true,
      };
    }
    if (clean.includes('hidrolik') || clean.includes('dot 4') || clean.includes('dot 5')) {
      return {
        canonicalName: 'Fren Hidrolik Sıvısı (DOT 4)',
        categoryLevel1: 'Periyodik Bakım & Sıvılar',
        categoryLevel2: 'Fren Sıvıları',
        categoryLevel3: 'Fren Hidrolik Sıvısı',
        isStandardized: true,
      };
    }
  }

  // E. Debriyaj, Şanzıman & Aktarma
  if (clean.includes('baski balata') || clean.includes('baskı balata') || clean.includes('debriyaj') || clean.includes('volan') || clean.includes('volant') || clean.includes('kavrama') || clean.includes('aks')) {
    if (clean.includes('volan') || clean.includes('volant') || clean.includes('dmf')) {
      return {
        canonicalName: 'Çift Kütleli Volan (DMF)',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Debriyaj & Şanzıman',
        categoryLevel3: 'Çift Kütleli Volan (DMF)',
        isStandardized: true,
      };
    }
    if (clean.includes('baski') || clean.includes('baskı') || clean.includes('debriyaj set') || clean.includes('kavrama')) {
      return {
        canonicalName: 'Debriyaj Baskı Balata & Rulman Seti',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Debriyaj & Şanzıman',
        categoryLevel3: 'Debriyaj Baskı Balata',
        isStandardized: true,
      };
    }
    if (clean.includes('aks') && (clean.includes('koruk') || clean.includes('körük'))) {
      return {
        canonicalName: 'Aks Körüğü & Yağlama Takımı',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Aktarma & Aks',
        categoryLevel3: 'Aks Körükleri',
        isStandardized: true,
      };
    }
    if (clean.includes('aks')) {
      return {
        canonicalName: 'Aks Mili & Mafsalı',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Aktarma & Aks',
        categoryLevel3: 'Aks Mili & Mafsalı',
        isStandardized: true,
      };
    }
    if (clean.includes('rulman') || clean.includes('bilya') || clean.includes('csc')) {
      return {
        canonicalName: 'Debriyaj Bilyası & Rulmanı',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Debriyaj & Şanzıman',
        categoryLevel3: 'Debriyaj Bilyası & Rulman',
        isStandardized: true,
      };
    }
    if (clean.includes('merkez') || clean.includes('pompa')) {
      return {
        canonicalName: 'Debriyaj Üst / Alt Merkezi',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Debriyaj & Şanzıman',
        categoryLevel3: 'Debriyaj Merkezleri',
        isStandardized: true,
      };
    }
  }

  // F. Motor, Zamanlama, Soğutma & Mekanik
  if (clean.includes('triger') || clean.includes('devirdaim') || clean.includes('su pompa') || clean.includes('v kayis') || clean.includes('termostat') || clean.includes('radyator') || clean.includes('kasnak') || clean.includes('kece') || clean.includes('keçe') || clean.includes('conta')) {
    if (clean.includes('triger') && (clean.includes('devirdaim') || clean.includes('su pompa') || clean.includes('komple') || clean.includes('set'))) {
      return {
        canonicalName: 'Triger Kayış & Devirdaimli Komple Set',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Motor & Zamanlama',
        categoryLevel3: 'Triger & Devirdaim Komple Set',
        isStandardized: true,
      };
    }
    if (clean.includes('triger')) {
      return {
        canonicalName: 'Triger Kayış & Gergi Rulman Kiti',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Motor & Zamanlama',
        categoryLevel3: 'Triger Kayış Seti',
        isStandardized: true,
      };
    }
    if (clean.includes('devirdaim') || clean.includes('su pompa')) {
      return {
        canonicalName: 'Su Devirdaim Pompası',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Motor & Zamanlama',
        categoryLevel3: 'Devirdaim Pompası',
        isStandardized: true,
      };
    }
    if (clean.includes('v kayis') || clean.includes('alternator kayis') || clean.includes('sarj kayis') || clean.includes('gergi')) {
      return {
        canonicalName: 'V-Kayışı ve Gergi Rulmanı',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Motor & Zamanlama',
        categoryLevel3: 'V-Kayışı ve Gergi',
        isStandardized: true,
      };
    }
    if (clean.includes('kasnak') || clean.includes('krank kasnagi')) {
      return {
        canonicalName: 'Krank Kasnağı (Damper)',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Motor & Zamanlama',
        categoryLevel3: 'Krank Kasnağı',
        isStandardized: true,
      };
    }
    if (clean.includes('termostat')) {
      return {
        canonicalName: 'Termostat & Termostat Gövdesi',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Motor & Soğutma',
        categoryLevel3: 'Termostat Grubu',
        isStandardized: true,
      };
    }
    if (clean.includes('radyator') || clean.includes('radyatör')) {
      return {
        canonicalName: 'Motor Soğutma Radyatörü & Deposu',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Motor & Soğutma',
        categoryLevel3: 'Radyatör Grubu',
        isStandardized: true,
      };
    }
    if (clean.includes('kece') || clean.includes('keçe')) {
      return {
        canonicalName: 'Krank Keçesi & Eksantrik Yağ Keçesi',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Motor Mekaniği',
        categoryLevel3: 'Krank & Yağ Keçeleri',
        isStandardized: true,
      };
    }
    if (clean.includes('conta')) {
      return {
        canonicalName: 'Silindir Kapak & Motor Contaları',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Motor Mekaniği',
        categoryLevel3: 'Motor Contaları',
        isStandardized: true,
      };
    }
  }

  // G. Süspansiyon, Ön Düzen & Direksiyon
  if (clean.includes('amortis') || clean.includes('salincak') || clean.includes('salıncak') || clean.includes('z rot') || clean.includes('rot basi') || clean.includes('rot başı') || clean.includes('rotil') || clean.includes('direksiyon') || clean.includes('porya') || clean.includes('viraj')) {
    if (clean.includes('z rot') || clean.includes('z-rot') || clean.includes('aski rotu') || clean.includes('askı rotu')) {
      return {
        canonicalName: 'Z-Rot / Viraj Askı Rotu',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Süspansiyon & Direksiyon',
        categoryLevel3: 'Z-Rot & Viraj Demiri',
        isStandardized: true,
      };
    }
    if (clean.includes('rot basi') || clean.includes('rot başı') || clean.includes('rot mili') || clean.includes('rot kolu')) {
      return {
        canonicalName: 'Rot Başı & Rot Mili',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Süspansiyon & Direksiyon',
        categoryLevel3: 'Rot Başı & Rot Mili',
        isStandardized: true,
      };
    }
    if (clean.includes('rotil') || clean.includes('alt rotil')) {
      return {
        canonicalName: 'Alt Taşıyıcı Rotil',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Süspansiyon & Direksiyon',
        categoryLevel3: 'Rotiller',
        isStandardized: true,
      };
    }
    if (clean.includes('salincak') || clean.includes('salıncak') || clean.includes('tabla')) {
      return {
        canonicalName: 'Ön Salıncak Takımı & Burçlar',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Süspansiyon & Direksiyon',
        categoryLevel3: 'Salıncak & Burçlar',
        isStandardized: true,
      };
    }
    if (clean.includes('ön amortis') || clean.includes('on amortis') || (clean.includes('ön') && clean.includes('amortis'))) {
      return {
        canonicalName: 'Ön Amortisör Çifti & Üst Takozları',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Süspansiyon & Direksiyon',
        categoryLevel3: 'Ön Amortisör Grubu',
        isStandardized: true,
      };
    }
    if (clean.includes('arka amortis') || clean.includes('ark amortis') || (clean.includes('arka') && clean.includes('amortis'))) {
      return {
        canonicalName: 'Arka Amortisör Çifti & Helezon Yay',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Süspansiyon & Direksiyon',
        categoryLevel3: 'Arka Amortisör Grubu',
        isStandardized: true,
      };
    }
    if (clean.includes('amortis')) {
      return {
        canonicalName: 'Amortisör Grubu',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Süspansiyon & Direksiyon',
        categoryLevel3: 'Amortisör Grubu',
        isStandardized: true,
      };
    }
    if (clean.includes('porya') || clean.includes('tekerlek rulmani') || clean.includes('teker rulmani')) {
      return {
        canonicalName: 'Tekerlek Porya Bilyası & Rulmanı',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Aktarma & Aks',
        categoryLevel3: 'Porya Bilyası & Rulman',
        isStandardized: true,
      };
    }
    if (clean.includes('direksiyon')) {
      return {
        canonicalName: 'Direksiyon Kutusu & Pompası',
        categoryLevel1: 'Mekanik & Yürüyen Aksam',
        categoryLevel2: 'Süspansiyon & Direksiyon',
        categoryLevel3: 'Direksiyon Sistemi',
        isStandardized: true,
      };
    }
  }

  // H. Ateşleme, Elektrik & Elektronik
  if (clean.includes('buji') || clean.includes('bobin') || clean.includes('kizdirma') || clean.includes('aku') || clean.includes('akü') || clean.includes('alternator') || clean.includes('mars') || clean.includes('marş') || clean.includes('sensor') || clean.includes('sensör')) {
    if (clean.includes('kizdirma') || clean.includes('ısıtma buji') || clean.includes('isitma buji')) {
      return {
        canonicalName: 'Kızdırma / Isıtma Bujisi (Dizel)',
        categoryLevel1: 'Elektrik & Elektronik',
        categoryLevel2: 'Ateşleme Sistemi',
        categoryLevel3: 'Kızdırma Bujisi',
        isStandardized: true,
      };
    }
    if (clean.includes('buji') && !clean.includes('bobin')) {
      return {
        canonicalName: 'Ateşleme Bujisi (Benzin / LPG)',
        categoryLevel1: 'Elektrik & Elektronik',
        categoryLevel2: 'Ateşleme Sistemi',
        categoryLevel3: 'Ateşleme Bujisi',
        isStandardized: true,
      };
    }
    if (clean.includes('bobin') || clean.includes('buji kablosu')) {
      return {
        canonicalName: 'Elektronik Ateşleme Bobini & Buji Kablosu',
        categoryLevel1: 'Elektrik & Elektronik',
        categoryLevel2: 'Ateşleme Sistemi',
        categoryLevel3: 'Ateşleme Bobini',
        isStandardized: true,
      };
    }
    if (clean.includes('aku') || clean.includes('akü')) {
      const isStartStop = clean.includes('start') || clean.includes('agm') || clean.includes('efb');
      return {
        canonicalName: isStartStop ? '12V Start-Stop AGM/EFB Akü' : '12V Standart Akü (60Ah - 74Ah)',
        categoryLevel1: 'Elektrik & Elektronik',
        categoryLevel2: 'Akü & Güç Depolama',
        categoryLevel3: isStartStop ? 'Start-Stop Akü' : 'Standart Akü',
        isStandardized: true,
      };
    }
    if (clean.includes('alternator') || clean.includes('sarj dinamosu') || clean.includes('şarj dinamosu')) {
      return {
        canonicalName: 'Alternatör / Şarj Dinamosu',
        categoryLevel1: 'Elektrik & Elektronik',
        categoryLevel2: 'Marş & Şarj Sistemi',
        categoryLevel3: 'Alternatör / Şarj Dinamosu',
        isStandardized: true,
      };
    }
    if (clean.includes('mars') || clean.includes('marş')) {
      return {
        canonicalName: 'Marş Motoru & Otomatiği',
        categoryLevel1: 'Elektrik & Elektronik',
        categoryLevel2: 'Marş & Şarj Sistemi',
        categoryLevel3: 'Marş Motoru',
        isStandardized: true,
      };
    }
    if (clean.includes('sensor') || clean.includes('sensör') || clean.includes('oksijen') || clean.includes('lambda') || clean.includes('abs sens')) {
      return {
        canonicalName: 'Elektronik Sensör Grubu (ABS / Oksijen / Krank / MAF)',
        categoryLevel1: 'Elektrik & Elektronik',
        categoryLevel2: 'Sensör & Beyin Grubu',
        categoryLevel3: 'Sensör Grubu',
        isStandardized: true,
      };
    }
  }

  // I. Lastik, Silecek & Jant
  if (clean.includes('silecek') || clean.includes('supurge') || clean.includes('aerotwin')) {
    if (clean.includes('arka') || clean.includes('ark')) {
      return {
        canonicalName: 'Arka Cam Silecek Süpürgesi & Kolu',
        categoryLevel1: 'Lastik, Jant & Aksesuar',
        categoryLevel2: 'Görüş & Silecek Grubu',
        categoryLevel3: 'Arka Silecek Süpürgesi',
        isStandardized: true,
      };
    }
    return {
      canonicalName: 'Ön Silecek Süpürgesi (Aerotwin)',
      categoryLevel1: 'Lastik, Jant & Aksesuar',
      categoryLevel2: 'Görüş & Silecek Grubu',
      categoryLevel3: 'Ön Silecek Süpürgesi',
      isStandardized: true,
    };
  }
  if (clean.includes('rot balans') || clean.includes('rot ayari') || clean.includes('balans ayari') || clean.includes('on duzen')) {
    return {
      canonicalName: 'Ön Düzen, Rot Ayarı & 4 Tekerlek Balans',
      categoryLevel1: 'Lastik, Jant & Aksesuar',
      categoryLevel2: 'Lastik Hizmetleri',
      categoryLevel3: 'Rot & Balans Ayarı',
      isStandardized: true,
    };
  }
  if (clean.includes('lastik')) {
    if (clean.includes('ticari') || clean.includes('c sinifi') || clean.includes('c serisi') || clean.includes('yuk')) {
      return {
        canonicalName: 'Hafif Ticari C Sınıfı Yük Lastiği',
        categoryLevel1: 'Lastik, Jant & Aksesuar',
        categoryLevel2: 'Ticari Lastik Grubu',
        categoryLevel3: 'C Sınıfı Yük Lastiği',
        isStandardized: true,
      };
    }
    return {
      canonicalName: 'Binek Araç Lastik Takımı',
      categoryLevel1: 'Lastik, Jant & Aksesuar',
      categoryLevel2: 'Binek Lastik Grubu',
      categoryLevel3: 'Binek Lastik Takımı',
      isStandardized: true,
    };
  }

  // J. Klima & İklimlendirme
  if (clean.includes('klima') || clean.includes('gaz dolum') || clean.includes('kalorifer')) {
    if (clean.includes('gaz') || clean.includes('dolum') || clean.includes('kacak')) {
      return {
        canonicalName: 'Klima Gaz Dolumu & Kaçak Testi',
        categoryLevel1: 'İklimlendirme & Konfor',
        categoryLevel2: 'Klima Gazı & Kaçak Testi',
        categoryLevel3: 'Gaz Dolumu & Dezenfeksiyon',
        isStandardized: true,
      };
    }
    if (clean.includes('kompresor') || clean.includes('kondenser')) {
      return {
        canonicalName: 'Klima Kompresörü & Kondenseri',
        categoryLevel1: 'İklimlendirme & Konfor',
        categoryLevel2: 'Klima Mekaniği',
        categoryLevel3: 'Kompresör & Kondenser',
        isStandardized: true,
      };
    }
    if (clean.includes('kalorifer')) {
      return {
        canonicalName: 'Kalorifer Radyatörü & Fan Motoru',
        categoryLevel1: 'İklimlendirme & Konfor',
        categoryLevel2: 'Isıtma & Havalandırma',
        categoryLevel3: 'Kalorifer Sistemi',
        isStandardized: true,
      };
    }
  }

  // K. Kaporta, Boya, Cam & Kilit
  if (clean.includes('tampon') || clean.includes('cam') || clean.includes('kapi') || clean.includes('kapı') || clean.includes('kilit') || clean.includes('boya') || clean.includes('pasta') || clean.includes('ayna')) {
    if (clean.includes('tampon')) {
      return {
        canonicalName: 'Ön / Arka Tampon Grubu',
        categoryLevel1: 'Gövde, Kaporta & Cam',
        categoryLevel2: 'Kaporta Parçaları',
        categoryLevel3: 'Tampon Grubu',
        isStandardized: true,
      };
    }
    if (clean.includes('cam')) {
      return {
        canonicalName: 'Ön / Arka Cam Değişimi & Montajı',
        categoryLevel1: 'Gövde, Kaporta & Cam',
        categoryLevel2: 'Cam Grubu',
        categoryLevel3: 'Oto Cam',
        isStandardized: true,
      };
    }
    if (clean.includes('ayna') || clean.includes('dikiz')) {
      return {
        canonicalName: 'Yan Dikiz Aynası & Camı',
        categoryLevel1: 'Gövde, Kaporta & Cam',
        categoryLevel2: 'Dış Aksam & Aynalar',
        categoryLevel3: 'Yan Dikiz Aynası',
        isStandardized: true,
      };
    }
    if (clean.includes('boya') || clean.includes('pasta') || clean.includes('cila') || clean.includes('göçük') || clean.includes('gocuk')) {
      return {
        canonicalName: 'Boya & Lokal Kaporta Onarımı',
        categoryLevel1: 'Gövde, Kaporta & Cam',
        categoryLevel2: 'Boya & Onarım',
        categoryLevel3: 'Boya & Lokal Onarım',
        isStandardized: true,
      };
    }
    if (clean.includes('kilit') || clean.includes('kolu') || clean.includes('kriko')) {
      return {
        canonicalName: 'Kapı Kilidi, Kolu & Cam Krikosu',
        categoryLevel1: 'Gövde, Kaporta & Cam',
        categoryLevel2: 'Kilit & Mekanizma',
        categoryLevel3: 'Kapı & Kilit Mekanizması',
        isStandardized: true,
      };
    }
  }

  // L. İşçilik & Servis Hizmetleri
  if (clean.includes('işçilik') || clean.includes('iscilik') || clean.includes('bakım') || clean.includes('bakim') || clean.includes('ariza tespit') || clean.includes('arıza tespit') || clean.includes('yıkama') || clean.includes('yol yardim') || clean.includes('çekici') || clean.includes('muayene')) {
    if (clean.includes('periyodik') || clean.includes('yag degisim') || clean.includes('yağ değişim')) {
      return {
        canonicalName: 'Periyodik Bakım Mekanik İşçiliği',
        categoryLevel1: 'İşçilik & Hizmetler',
        categoryLevel2: 'Periyodik Bakım İşçiliği',
        categoryLevel3: 'Periyodik Bakım İşçiliği',
        isStandardized: true,
      };
    }
    if (clean.includes('fren') || clean.includes('balata') || clean.includes('disk')) {
      return {
        canonicalName: 'Fren Sistemi Değişim & Bakım İşçiliği',
        categoryLevel1: 'İşçilik & Hizmetler',
        categoryLevel2: 'Fren İşçiliği',
        categoryLevel3: 'Fren Değişim İşçiliği',
        isStandardized: true,
      };
    }
    if (clean.includes('ariza') || clean.includes('arıza') || clean.includes('diyagnoz') || clean.includes('tespit') || clean.includes('ekspertiz')) {
      return {
        canonicalName: 'Bilgisayarlı Arıza Tespit & Diyagnoz',
        categoryLevel1: 'İşçilik & Hizmetler',
        categoryLevel2: 'Diyagnoz & Ekspertiz',
        categoryLevel3: 'Arıza Tespit Hizmeti',
        isStandardized: true,
      };
    }
    if (clean.includes('agir bakim') || clean.includes('ağır bakım') || clean.includes('motor revizyon') || clean.includes('sanziman indirme') || clean.includes('şanzıman indirme')) {
      return {
        canonicalName: 'Ağır Bakım & Motor Revizyon İşçiliği',
        categoryLevel1: 'İşçilik & Hizmetler',
        categoryLevel2: 'Motor & Mekanik İşçilik',
        categoryLevel3: 'Ağır Bakım İşçiliği',
        isStandardized: true,
      };
    }
    if (clean.includes('yıkama') || clean.includes('yikama') || clean.includes('temizlik') || clean.includes('kuafor') || clean.includes('kuaför')) {
      return {
        canonicalName: 'Oto Yıkama & Detaylı İç Temizlik',
        categoryLevel1: 'İşçilik & Hizmetler',
        categoryLevel2: 'Temizlik & Bakım',
        categoryLevel3: 'Araç Yıkama & Kuaför',
        isStandardized: true,
      };
    }
    if (clean.includes('cekici') || clean.includes('çekici') || clean.includes('kurtarici') || clean.includes('yol yardim')) {
      return {
        canonicalName: 'Çekici & Yol Yardım Hizmeti',
        categoryLevel1: 'İşçilik & Hizmetler',
        categoryLevel2: 'Yol Yardım & Lojistik',
        categoryLevel3: 'Çekici Hizmeti',
        isStandardized: true,
      };
    }
    if (clean.includes('muayene')) {
      return {
        canonicalName: 'Araç Muayene Hazırlık Kontrolü',
        categoryLevel1: 'İşçilik & Hizmetler',
        categoryLevel2: 'Muayene & Kontrol',
        categoryLevel3: 'Muayene Hazırlık',
        isStandardized: true,
      };
    }
    return {
      canonicalName: 'Mekanik Servis & Onarım İşçiliği',
      categoryLevel1: 'İşçilik & Hizmetler',
      categoryLevel2: 'Genel İşçilik',
      categoryLevel3: 'Genel Servis İşçiliği',
      isStandardized: true,
    };
  }

  // 4. Fallback: Clean Title Case Noun Extraction
  const titleCased = toTurkishTitleCase(clean);
  const derivedCat = derive3LevelCategoryFromPartGroup(titleCased || raw);
  const fallbackName = titleCased.length >= 3 ? titleCased : (derivedCat.level3 || 'Özel Parça & İşlem');

  return {
    canonicalName: fallbackName,
    categoryLevel1: derivedCat.level1,
    categoryLevel2: derivedCat.level2,
    categoryLevel3: derivedCat.level3,
    isStandardized: titleCased.length >= 3,
  };
}

/**
 * Fast memoized wrapper for canonical part name extraction.
 * Reuses computed results for repeated descriptions across thousands of fleet records.
 */
export function extractCanonicalPartName(
  rawDescription: string,
  expenseType: string = '',
  matchedCatalogName?: string,
  catalog?: PartCatalogItem[]
): CanonicalPartExtractionResult {
  const catLen = catalog ? catalog.length : currentActiveCatalog.length;
  const cacheKey = `${rawDescription || ''}___${expenseType || ''}___${matchedCatalogName || ''}___${catLen}`;
  const cached = canonicalExtractCache.get(cacheKey);
  if (cached) return cached;

  const res = _extractCanonicalPartNameInternal(rawDescription, expenseType, matchedCatalogName, catalog);
  if (canonicalExtractCache.size > 20000) {
    canonicalExtractCache.clear();
  }
  canonicalExtractCache.set(cacheKey, res);
  return res;
}

/**
 * Returns only the clean standalone part name string.
 * Leverages KEYWORDS_TR from the catalog if provided or active.
 */
export function getCleanPartName(
  rawDescription: string,
  expenseType: string = '',
  catalog?: PartCatalogItem[]
): string {
  return extractCanonicalPartName(rawDescription, expenseType, undefined, catalog).canonicalName;
}

interface PreprocessedCatalogItem {
  index: number;
  item: PartCatalogItem;
  cleanCode: string;
  cleanCodeNoSpace: string;
  cleanKeywords: { raw: string; clean: string; weight: number }[];
  cleanL1: string;
  cleanL2: string;
  cleanL3: string;
  isFrontExclusive: boolean;
  isRearExclusive: boolean;
  isLaborExclusive: boolean;
  isLighting: boolean;
  isBrakePad: boolean;
  isBrakeDisk: boolean;
  isClutch: boolean;
  isCrankSeal: boolean;
  isGasket: boolean;
  isAirFilter: boolean;
  isOilFilter: boolean;
  isCabinFilter: boolean;
  isFuelFilter: boolean;
  isSparkPlug: boolean;
  isGlowPlug: boolean;
}

let cachedCatalogRef: PartCatalogItem[] | null = null;
let preprocessedCatalogCache: PreprocessedCatalogItem[] = [];
let catalogTokenIndex = new Map<string, number[]>();
let recordMatchCache = new Map<string, {
  bestMatch: PartCatalogItem | null;
  bestScore: number;
  matchedKeywords: string[];
}>();

function getPreprocessedCatalog(catalog: PartCatalogItem[]): PreprocessedCatalogItem[] {
  if (cachedCatalogRef === catalog && preprocessedCatalogCache.length === catalog.length) {
    return preprocessedCatalogCache;
  }
  cachedCatalogRef = catalog;
  recordMatchCache.clear();
  catalogTokenIndex.clear();

  preprocessedCatalogCache = catalog.map((item, idx) => {
    const cleanCode = cleanText(item.code);
    const cleanCodeNoSpace = cleanCode.length > 3 ? cleanCode.replace(/\s/g, '') : '';
    const cleanKeywords = item.keywords.map(kw => {
      const cleanKw = cleanText(kw);
      const weight = Math.min(55, 18 + cleanKw.length * 2.2);
      return { raw: kw, clean: cleanKw, weight };
    }).filter(k => k.clean.length > 0);

    const cleanL1 = cleanText(item.categoryLevel1 || '');
    const cleanL2 = cleanText(item.categoryLevel2 || '');
    const cleanL3 = cleanText(item.categoryLevel3 || '');
    const fullText = `${cleanCode} ${item.name.toLowerCase()} ${cleanL1} ${cleanL2} ${cleanL3}`;

    const isFrontExclusive = (fullText.includes('ön') || fullText.includes('on ')) && !fullText.includes('arka');
    const isRearExclusive = (fullText.includes('arka') || fullText.includes('ark ')) && !fullText.includes('ön');
    const isLaborExclusive = fullText.includes('işçilik') || fullText.includes('hizmet') || fullText.includes('tespit') || fullText.includes('ayar');

    const isLighting = cleanL2.includes('aydınlatma') || cleanL3.includes('ampul') || item.code.includes('LMP');
    const isBrakePad = (cleanL3.includes('balata') && cleanL2.includes('fren')) || item.code.includes('BRK-FRT') || item.code.includes('BRK-RR');
    const isBrakeDisk = cleanL3.includes('disk') || item.code.includes('DSC');
    const isClutch = cleanL2.includes('debriyaj') || cleanL3.includes('volan') || cleanL3.includes('baskı balata') || item.code.includes('CLT') || item.code.includes('FLY');
    const isCrankSeal = cleanL3.includes('keçe') || cleanL3.includes('krank & yağ') || item.code.includes('CRK-SL');
    const isGasket = cleanL3.includes('conta') || item.code.includes('GSK');
    const isAirFilter = cleanL3.includes('hava') || item.code.includes('FLT-AIR');
    const isOilFilter = cleanL3.includes('yağ filtresi') || item.code.includes('FLT-OIL');
    const isCabinFilter = cleanL3.includes('polen') || cleanL3.includes('kabin') || item.code.includes('FLT-CAB');
    const isFuelFilter = cleanL3.includes('yakıt') || cleanL3.includes('mazot') || item.code.includes('FLT-FUL');
    const isSparkPlug = (cleanL3.includes('buji') && !cleanL3.includes('kızdırma')) || item.code.includes('SPK');
    const isGlowPlug = cleanL3.includes('kızdırma') || item.code.includes('GLW');

    const prep: PreprocessedCatalogItem = {
      index: idx,
      item,
      cleanCode,
      cleanCodeNoSpace,
      cleanKeywords,
      cleanL1,
      cleanL2,
      cleanL3,
      isFrontExclusive,
      isRearExclusive,
      isLaborExclusive,
      isLighting,
      isBrakePad,
      isBrakeDisk,
      isClutch,
      isCrankSeal,
      isGasket,
      isAirFilter,
      isOilFilter,
      isCabinFilter,
      isFuelFilter,
      isSparkPlug,
      isGlowPlug,
    };

    // Inverted index words/tokens
    const tokens = new Set<string>();
    if (cleanCode) cleanCode.split(/\s+/).forEach(t => t.length > 2 && tokens.add(t));
    if (cleanCodeNoSpace) tokens.add(cleanCodeNoSpace);
    cleanKeywords.forEach(k => k.clean.split(/\s+/).forEach(t => t.length > 2 && tokens.add(t)));
    if (prep.cleanL1) prep.cleanL1.split(/\s+/).forEach(t => t.length > 2 && tokens.add(t));
    if (prep.cleanL2) prep.cleanL2.split(/\s+/).forEach(t => t.length > 2 && tokens.add(t));
    if (prep.cleanL3) prep.cleanL3.split(/\s+/).forEach(t => t.length > 2 && tokens.add(t));

    tokens.forEach(tok => {
      const list = catalogTokenIndex.get(tok) || [];
      list.push(idx);
      catalogTokenIndex.set(tok, list);
    });

    return prep;
  });

  return preprocessedCatalogCache;
}

// ==========================================
// 2. MATCH RECORD WITH CATALOG (SMART DISAMBIGUATION & CONFLICT RESOLUTION)
// ==========================================
export function matchRecordWithCatalog(
  record: NormalizedFleetRecord,
  catalog: PartCatalogItem[]
): PartMatchResult {
  const rawDesc = record.description || '';
  const expenseType = record.expenseType || '';
  const spareOrigin = record.sparePartOrigin || '';
  const cacheKey = `${rawDesc}____${expenseType}____${spareOrigin}`;

  const preprocessed = getPreprocessedCatalog(catalog);
  let matchData = recordMatchCache.get(cacheKey);

  if (!matchData) {
    const combinedText = cleanText(`${rawDesc} ${expenseType}`);
    const combinedNoSpace = combinedText.replace(/\s/g, '');
    const cleanExp = cleanText(expenseType);

    // Precise query intent classification
    const hasBulbOrLight = combinedText.includes('ampul') || 
                           combinedText.includes('lamba') || 
                           combinedText.includes('aydınlatma') || 
                           combinedText.includes('p21w') || 
                           combinedText.includes('py21w') || 
                           combinedText.includes('w5w') || 
                           combinedText.includes('t10') || 
                           combinedText.includes('h7') || 
                           combinedText.includes('h4') || 
                           combinedText.includes('h1') || 
                           combinedText.includes('h11') || 
                           combinedText.includes('led ampul') || 
                           combinedText.includes('xenon');

    const hasClutch = combinedText.includes('baskı balata') || 
                      combinedText.includes('baski balata') || 
                      combinedText.includes('debriyaj') || 
                      combinedText.includes('kavrama') || 
                      combinedText.includes('volan') || 
                      combinedText.includes('volant') || 
                      combinedText.includes('dmf');

    const hasBrakeBalata = (combinedText.includes('arka balata') || 
                           combinedText.includes('ön balata') || 
                           combinedText.includes('on balata') || 
                           combinedText.includes('ark balata') || 
                           combinedText.includes('fren balata') || 
                           combinedText.includes('balata')) && !hasClutch && !hasBulbOrLight;

    const hasCrankSeal = (combinedText.includes('krank keçesi') || 
                          combinedText.includes('krank kecesi') || 
                          combinedText.includes('yağ keçesi') || 
                          combinedText.includes('yag kecesi') || 
                          combinedText.includes('eksantrik keçesi') || 
                          combinedText.includes('keçe') || 
                          combinedText.includes('keçesi')) && !hasBulbOrLight;

    const hasGasket = (combinedText.includes('conta') || 
                       combinedText.includes('silindir kapak') || 
                       combinedText.includes('külbütör') || 
                       combinedText.includes('karter contası')) && !hasCrankSeal;

    const hasAirFilter = combinedText.includes('hava filtresi') || combinedText.includes('hava filtre');
    const hasOilFilter = combinedText.includes('yağ filtresi') || combinedText.includes('yag filtresi');
    const hasCabinFilter = combinedText.includes('polen filtresi') || combinedText.includes('kabin filtresi');
    const hasFuelFilter = combinedText.includes('yakıt filtresi') || combinedText.includes('mazot filtresi');

    const hasSparkPlug = (combinedText.includes('buji') && !combinedText.includes('kızdırma') && !combinedText.includes('isitma') && !combinedText.includes('dizel'));
    const hasGlowPlug = combinedText.includes('kızdırma') || combinedText.includes('isitma bujisi');

    const hasFront = (combinedText.includes('ön') || combinedText.includes('on ')) && !combinedText.includes('arka');
    const hasRear = (combinedText.includes('arka') || combinedText.includes('ark ')) && !combinedText.includes('ön');
    const hasLabor = combinedText.includes('işçilik') || combinedText.includes('iscilik') || spareOrigin === 'ISCILIK';
    const hasDisk = combinedText.includes('disk') && !combinedText.includes('balata');
    const hasBalata = combinedText.includes('balata') && !combinedText.includes('disk');

    let bestMatch: PartCatalogItem | null = null;
    let bestScore = 0;
    let matchedKeywords: string[] = [];

    // Candidate selection using token inverted index for fast lookup
    const queryTokens = combinedText.split(/\s+/).filter(t => t.length > 2);
    const candidateIndices = new Set<number>();

    for (let t = 0; t < queryTokens.length; t++) {
      const tok = queryTokens[t];
      const hits = catalogTokenIndex.get(tok);
      if (hits) {
        for (let h = 0; h < hits.length; h++) {
          candidateIndices.add(hits[h]);
        }
      }
    }

    // If candidates found via index, evaluate them; otherwise fallback to full catalog
    const candidatesToEval = candidateIndices.size > 0 
      ? Array.from(candidateIndices).map(idx => preprocessed[idx])
      : preprocessed;

    for (let i = 0; i < candidatesToEval.length; i++) {
      const prep = candidatesToEval[i];
      let score = 0;
      const currentMatchedKws: string[] = [];

      // 1. Direct Part Code match (Highest priority)
      if (prep.cleanCode && (combinedText.includes(prep.cleanCode) || (prep.cleanCodeNoSpace && combinedNoSpace.includes(prep.cleanCodeNoSpace)))) {
        score += 85;
        currentMatchedKws.push(prep.item.code);
      }

      // 2. Keywords matching with length bonus
      for (let j = 0; j < prep.cleanKeywords.length; j++) {
        const kw = prep.cleanKeywords[j];
        if (combinedText.includes(kw.clean)) {
          score += kw.weight;
          currentMatchedKws.push(kw.raw);
        }
      }

      // 3. Category Level Boosts
      if (cleanExp) {
        if (prep.cleanL1 && (prep.cleanL1.includes(cleanExp) || cleanExp.includes(prep.cleanL1))) score += 15;
        if (prep.cleanL2 && (prep.cleanL2.includes(cleanExp) || cleanExp.includes(prep.cleanL2))) score += 20;
        if (prep.cleanL3 && (prep.cleanL3.includes(cleanExp) || cleanExp.includes(prep.cleanL3))) score += 25;
      }

      // 4. SMART DOMAIN AFFINITY & CONFLICT RESOLUTION
      if (hasBulbOrLight) {
        if (prep.isLighting) {
          score += 75;
        } else {
          score -= 160; // Strictly forbid mechanical items or seals matching bulbs
        }
      }

      if (hasBrakeBalata) {
        if (prep.isBrakePad) {
          score += 65;
        } else if (prep.isClutch || prep.isCrankSeal || prep.isGasket || prep.isLighting) {
          score -= 160; // Strictly forbid clutch or engine seals matching brake pad queries
        }
      }

      if (hasClutch) {
        if (prep.isClutch) {
          score += 65;
        } else if (prep.isBrakePad || prep.isBrakeDisk || prep.isLighting || prep.isCrankSeal) {
          score -= 160; // Strictly forbid brake pads matching clutch queries
        }
      }

      if (hasCrankSeal) {
        if (prep.isCrankSeal) {
          score += 80;
        } else if (prep.isLighting || prep.isBrakePad || prep.isBrakeDisk || prep.isClutch) {
          score -= 160;
        }
      }

      if (hasGasket && !hasCrankSeal) {
        if (prep.isGasket) {
          score += 60;
        } else if (prep.isCrankSeal) {
          score -= 60;
        }
      }

      // Filter disambiguation
      if (hasAirFilter) {
        if (prep.isAirFilter) score += 60;
        else if (prep.isOilFilter || prep.isCabinFilter || prep.isFuelFilter) score -= 100;
      }
      if (hasOilFilter) {
        if (prep.isOilFilter) score += 60;
        else if (prep.isAirFilter || prep.isCabinFilter || prep.isFuelFilter) score -= 100;
      }
      if (hasCabinFilter) {
        if (prep.isCabinFilter) score += 60;
        else if (prep.isAirFilter || prep.isOilFilter || prep.isFuelFilter) score -= 100;
      }
      if (hasFuelFilter) {
        if (prep.isFuelFilter) score += 60;
        else if (prep.isAirFilter || prep.isOilFilter || prep.isCabinFilter) score -= 100;
      }

      // Spark vs Glow plug
      if (hasSparkPlug) {
        if (prep.isSparkPlug) score += 60;
        else if (prep.isGlowPlug) score -= 100;
      }
      if (hasGlowPlug) {
        if (prep.isGlowPlug) score += 60;
        else if (prep.isSparkPlug) score -= 100;
      }

      // Position & Specificity Conflict Penalties
      if (hasFront && prep.isRearExclusive) {
        score -= 80; // Penalize rear item when query explicitly says front
      }
      if (hasRear && prep.isFrontExclusive) {
        score -= 80; // Penalize front item when query explicitly says rear
      }
      if (hasDisk && prep.isBrakePad) {
        score -= 40; // Query has disk, penalize pure brake pad
      }
      if (hasBalata && prep.isBrakeDisk) {
        score -= 40; // Query has pad, penalize pure brake disk
      }
      if (hasLabor && !prep.isLaborExclusive && !prep.cleanCode.includes('LAB')) {
        score -= 35; // Query is labor, prefer labor catalog item
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = prep.item;
        matchedKeywords = currentMatchedKws;
      }
    }

    matchData = {
      bestMatch,
      bestScore,
      matchedKeywords,
    };

    if (recordMatchCache.size > 30000) {
      recordMatchCache.clear();
    }
    recordMatchCache.set(cacheKey, matchData);
  }

  const { bestMatch, bestScore, matchedKeywords } = matchData;
  const isMatched = bestScore >= 20 && bestMatch !== null;
  const confidence = Math.min(100, Math.round(bestScore * 1.25));

  let confidenceLevel: MatchConfidenceLevel = 'Eşleşmedi / Özel İşlem';
  if (confidence >= 80) {
    confidenceLevel = 'Tam Eşleşme';
  } else if (confidence >= 55) {
    confidenceLevel = 'Yüksek Eşleşme';
  } else if (isMatched) {
    confidenceLevel = 'Kategori Eşleşti';
  }

  // Extract clean canonical part name & logical 3-level categories
  const canonicalExtract = extractCanonicalPartName(rawDesc, expenseType, bestMatch?.name, catalog);
  const cleanPartName = canonicalExtract.canonicalName;
  const matchedPartName = bestMatch ? bestMatch.name : cleanPartName;

  const matchedCategoryLevel1 = bestMatch ? bestMatch.categoryLevel1 : canonicalExtract.categoryLevel1;
  const matchedCategoryLevel2 = bestMatch ? bestMatch.categoryLevel2 : canonicalExtract.categoryLevel2;
  const matchedCategoryLevel3 = bestMatch ? bestMatch.categoryLevel3 : canonicalExtract.categoryLevel3;
  const matchedCategory = bestMatch ? bestMatch.category : `${matchedCategoryLevel1} > ${matchedCategoryLevel2} > ${matchedCategoryLevel3}`;

  return {
    recordId: record.id,
    rowNumber: record.rowNumber,
    plate: record.plate,
    brand: record.brand,
    supplier: record.supplier,
    expenseType: record.expenseType,
    rawDescription: rawDesc || '(Açıklama Belirtilmemiş)',
    cleanPartName,
    totalPrice: record.totalPrice,
    sparePartType: record.sparePartType,
    sparePartOrigin: record.sparePartOrigin,
    sparePartOriginLabel: record.sparePartOriginLabel,
    wasReclassifiedFromOtherYP: record.wasReclassifiedFromOtherYP,
    isMatched,
    matchedPartCode: bestMatch ? bestMatch.code : undefined,
    matchedPartName,
    matchedCategoryLevel1,
    matchedCategoryLevel2,
    matchedCategoryLevel3,
    matchedCategory,
    confidence,
    confidenceLevel,
    matchedKeywords: Array.from(new Set(matchedKeywords)),
  };
}

// ==========================================
// 3. COMPUTE FULL PARTS ANALYTICS
// ==========================================
export function computePartsAnalytics(
  records: NormalizedFleetRecord[],
  catalog: PartCatalogItem[],
  catalogSource: 'default' | 'custom' = 'default'
): PartsAnalyticsSummary {
  if (!records || records.length === 0) {
    return {
      catalogSource,
      catalogItemCount: catalog.length,
      totalSpend: 0,
      matchedRecordsCount: 0,
      unmatchedRecordsCount: 0,
      matchRatePct: 0,
      distinctMatchedPartsCount: 0,
      boschSpend: 0,
      otherPartsSpend: 0,
      fluidsSpend: 0,
      laborSpend: 0,
      boschSpendPct: 0,
      otherPartsSpendPct: 0,
      fluidsSpendPct: 0,
      laborSpendPct: 0,
      categoryBreakdown: [],
      topReplacedParts: [],
      matches: [],
    };
  }

  const matches: PartMatchResult[] = records.map(r => matchRecordWithCatalog(r, catalog));

  const totalSpend = records.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  const matchedRecordsCount = matches.filter(m => m.isMatched).length;
  const unmatchedRecordsCount = matches.length - matchedRecordsCount;
  const matchRatePct = Math.round((matchedRecordsCount / Math.max(1, matches.length)) * 100);

  // Compute Bosch vs Other Y.P. vs Fluids vs Labor breakdown
  let boschSpend = 0;
  let otherPartsSpend = 0;
  let fluidsSpend = 0;
  let laborSpend = 0;

  records.forEach(r => {
    const cost = r.totalPrice || 0;
    if (r.sparePartOrigin === 'BOSCH') {
      boschSpend += cost;
    } else if (r.sparePartOrigin === 'DIGER_YP') {
      otherPartsSpend += cost;
    } else if (r.sparePartOrigin === 'SIVILAR_KIMYASAL') {
      fluidsSpend += cost;
    } else if (r.sparePartOrigin === 'ISCILIK') {
      laborSpend += cost;
    } else {
      // Fallback: If not explicitly categorized, check if it's maintenance/fluids or default to other Y.P.
      if (r.expenseType === 'İşçilik') {
        laborSpend += cost;
      } else {
        otherPartsSpend += cost;
      }
    }
  });

  const boschSpendPct = totalSpend > 0 ? Number(((boschSpend / totalSpend) * 100).toFixed(1)) : 0;
  const otherPartsSpendPct = totalSpend > 0 ? Number(((otherPartsSpend / totalSpend) * 100).toFixed(1)) : 0;
  const fluidsSpendPct = totalSpend > 0 ? Number(((fluidsSpend / totalSpend) * 100).toFixed(1)) : 0;
  const laborSpendPct = totalSpend > 0 ? Number(((laborSpend / totalSpend) * 100).toFixed(1)) : 0;

  // Distinct matched standard part codes
  const distinctMatchedPartsCount = new Set(
    matches.filter(m => m.isMatched && m.matchedPartCode).map(m => m.matchedPartCode)
  ).size;

  // Category Breakdown (Grouped by Level 1, Level 2 & Human-Readable Part Name)
  const catMap = new Map<string, { 
    count: number; 
    totalCost: number; 
    level1: string; 
    level2: string; 
    level3: string; 
    partName: string;
  }>();

  matches.forEach(m => {
    // Prioritize descriptive part name over category code or ID
    const partName = m.matchedPartName || m.matchedCategoryLevel3 || m.rawDescription || 'Genel Parça / İşlem';
    const l1 = m.matchedCategoryLevel1 || 'Diğer / Özel';
    const l2 = m.matchedCategoryLevel2 || 'Genel Hizmet';
    const l3 = partName;
    const cat = `${l1} > ${l2} > ${partName}`;

    const existing = catMap.get(cat) || { 
      count: 0, 
      totalCost: 0, 
      level1: l1, 
      level2: l2, 
      level3: l3, 
      partName: partName 
    };
    existing.count += 1;
    existing.totalCost += m.totalPrice;
    if (!existing.partName && m.matchedPartName) {
      existing.partName = m.matchedPartName;
    }
    catMap.set(cat, existing);
  });

  const categoryBreakdown: PartCategoryStat[] = Array.from(catMap.entries())
    .map(([category, stats]) => ({
      category,
      level1: stats.level1,
      level2: stats.level2,
      level3: stats.partName || stats.level3,
      name: stats.partName || stats.level3,
      partName: stats.partName || stats.level3,
      count: stats.count,
      totalCost: Math.round(stats.totalCost),
      sharePct: totalSpend > 0 ? Number(((stats.totalCost / totalSpend) * 100).toFixed(1)) : 0,
      avgCost: Math.round(stats.totalCost / Math.max(1, stats.count)),
    }))
    .sort((a, b) => b.totalCost - a.totalCost);

  // Top Replaced Parts (with Code, Name, L1, L2, L3)
  const partMap = new Map<string, { 
    code: string; 
    name: string; 
    category: string; 
    categoryLevel1?: string;
    categoryLevel2?: string;
    categoryLevel3?: string;
    count: number; 
    totalCost: number; 
  }>();

  matches.forEach(m => {
    if (m.isMatched && m.matchedPartCode && m.matchedPartName) {
      const key = m.matchedPartCode;
      const existing = partMap.get(key) || {
        code: m.matchedPartCode,
        name: m.matchedPartName,
        category: m.matchedCategory,
        categoryLevel1: m.matchedCategoryLevel1,
        categoryLevel2: m.matchedCategoryLevel2,
        categoryLevel3: m.matchedCategoryLevel3,
        count: 0,
        totalCost: 0,
      };
      existing.count += 1;
      existing.totalCost += m.totalPrice;
      partMap.set(key, existing);
    }
  });

  const topReplacedParts: TopReplacedPartStat[] = Array.from(partMap.values())
    .map(p => {
      const avgActualPrice = Math.round(p.totalCost / Math.max(1, p.count));
      return {
        code: p.code,
        name: p.name,
        category: p.category,
        categoryLevel1: p.categoryLevel1,
        categoryLevel2: p.categoryLevel2,
        categoryLevel3: p.categoryLevel3,
        count: p.count,
        totalCost: Math.round(p.totalCost),
        avgActualPrice,
      };
    })
    .sort((a, b) => b.count - a.count);

  return {
    catalogSource,
    catalogItemCount: catalog.length,
    totalSpend: Math.round(totalSpend),
    matchedRecordsCount,
    unmatchedRecordsCount,
    matchRatePct,
    distinctMatchedPartsCount,
    boschSpend: Math.round(boschSpend),
    otherPartsSpend: Math.round(otherPartsSpend),
    fluidsSpend: Math.round(fluidsSpend),
    laborSpend: Math.round(laborSpend),
    boschSpendPct,
    otherPartsSpendPct,
    fluidsSpendPct,
    laborSpendPct,
    categoryBreakdown,
    topReplacedParts,
    matches,
  };
}

// ==========================================
// 4. DERIVE 3-LEVEL CATEGORIES FROM PART_GROUP
// ==========================================
export function derive3LevelCategoryFromPartGroup(rawText: string): {
  level1: string;
  level2: string;
  level3: string;
} {
  const clean = cleanText(rawText);

  // 1. Aydınlatma & Ampul Grubu (Highest Priority to avoid brake/lamp confusion)
  if (clean.includes('ampul') || clean.includes('lamba') || clean.includes('aydınlatma') || clean.includes('p21w') || clean.includes('py21w') || clean.includes('w5w') || clean.includes('t10') || clean.includes('h7') || clean.includes('h4') || clean.includes('h1') || clean.includes('h11') || clean.includes('led ampul') || clean.includes('xenon') || clean.includes('stop fren ampulü') || clean.includes('far ampulü')) {
    let l3 = 'Far & Ampul Grubu';
    if (clean.includes('fren') || clean.includes('stop') || clean.includes('sinyal') || clean.includes('arka') || clean.includes('p21') || clean.includes('w5w') || clean.includes('plaka')) {
      l3 = 'Stop & Fren Ampulü';
    } else if (clean.includes('far') || clean.includes('sis') || clean.includes('h7') || clean.includes('h4') || clean.includes('h1') || clean.includes('h11') || clean.includes('ön') || clean.includes('on')) {
      l3 = 'Ön Far & Sis Ampulü';
    }

    return {
      level1: 'Elektrik & Elektronik',
      level2: 'Aydınlatma Grubu',
      level3: l3,
    };
  }

  // 2. Krank, Eksantrik & Yağ Keçeleri
  if (clean.includes('krank keçesi') || clean.includes('krank kecesi') || clean.includes('yağ keçesi') || clean.includes('yag kecesi') || clean.includes('eksantrik keçesi') || clean.includes('prizdirek keçesi') || clean.includes('keçe') || clean.includes('keçesi')) {
    return {
      level1: 'Mekanik & Yürüyen Aksam',
      level2: 'Motor Mekaniği',
      level3: 'Krank & Yağ Keçeleri',
    };
  }

  // 3. Debriyaj, Volan & Şanzıman Aktarma
  if (clean.includes('debriyaj') || clean.includes('baskı balata') || clean.includes('baski balata') || clean.includes('volan') || clean.includes('volant') || clean.includes('kavrama') || clean.includes('dmf') || clean.includes('aks')) {
    let l3 = 'Debriyaj & Şanzıman Bileşeni';
    if (clean.includes('volan') || clean.includes('volant') || clean.includes('dmf')) l3 = 'Çift Kütleli Volan (DMF)';
    else if (clean.includes('baskı') || clean.includes('baski') || clean.includes('debriyaj set') || clean.includes('kavrama')) l3 = 'Debriyaj Baskı Balata';
    else if (clean.includes('aks') || clean.includes('koruk') || clean.includes('lale')) l3 = 'Aks Mili & Mafsalı';
    else if (clean.includes('rulman') || clean.includes('bilya') || clean.includes('csc')) l3 = 'Debriyaj Bilyası & Rulman';
    else if (clean.includes('merkez') || clean.includes('pompa')) l3 = 'Debriyaj Merkezleri';

    return {
      level1: 'Mekanik & Yürüyen Aksam',
      level2: 'Debriyaj & Şanzıman',
      level3: l3,
    };
  }

  // 4. Fren Sistemi
  if (clean.includes('fren') || clean.includes('balata') || clean.includes('disk') || clean.includes('kaliper') || clean.includes('kampana') || clean.includes('abs') || clean.includes('hidrolik')) {
    let l3 = 'Fren Bileşenleri';
    if (clean.includes('ön balata') || clean.includes('on balata') || (clean.includes('ön') && clean.includes('balata')) || (clean.includes('on') && clean.includes('balata'))) l3 = 'Ön Fren Balatası';
    else if (clean.includes('arka balata') || clean.includes('ark balata') || (clean.includes('arka') && clean.includes('balata')) || (clean.includes('ark') && clean.includes('balata'))) l3 = 'Arka Fren Balatası';
    else if (clean.includes('balata')) l3 = 'Fren Balatası Takımı';
    else if (clean.includes('ön disk') || clean.includes('on disk') || (clean.includes('ön') && clean.includes('disk')) || (clean.includes('on') && clean.includes('disk'))) l3 = 'Ön Fren Diski';
    else if (clean.includes('arka disk') || clean.includes('ark disk') || (clean.includes('arka') && clean.includes('disk')) || (clean.includes('ark') && clean.includes('disk'))) l3 = 'Arka Fren Diski';
    else if (clean.includes('disk')) l3 = 'Fren Diski Grubu';
    else if (clean.includes('kampana')) l3 = 'Fren Kampanası';
    else if (clean.includes('kaliper')) l3 = 'Fren Kaliperi';
    else if (clean.includes('hidrolik') || clean.includes('dot')) l3 = 'Fren Hidrolik Sıvısı';
    else if (clean.includes('el fren')) l3 = 'El Fren Sistemi';

    return {
      level1: 'Mekanik & Yürüyen Aksam',
      level2: 'Fren Sistemi',
      level3: l3,
    };
  }

  // 5. Motor, Zamanlama & Soğutma
  if (clean.includes('triger') || clean.includes('kayis') || clean.includes('devirdaim') || clean.includes('su pompa') || clean.includes('termostat') || clean.includes('radyator') || clean.includes('conta') || clean.includes('subap') || clean.includes('piston') || clean.includes('segman') || clean.includes('krank') || clean.includes('kasnak')) {
    let l3 = 'Motor Mekanik Bileşeni';
    if (clean.includes('triger') || clean.includes('zamanlama')) l3 = 'Triger Kayış & Gergi Seti';
    else if (clean.includes('devirdaim') || clean.includes('su pompa')) l3 = 'Su Devirdaim Pompası';
    else if (clean.includes('v kayis') || clean.includes('alternator kayis')) l3 = 'V-Kayışı ve Gergi Rulmanı';
    else if (clean.includes('termostat')) l3 = 'Termostat & Gövdesi';
    else if (clean.includes('radyator')) l3 = 'Motor Soğutma Radyatörü';
    else if (clean.includes('conta') || clean.includes('silindir')) l3 = 'Silindir Kapak Contası';
    else if (clean.includes('kasnak') || clean.includes('krank')) l3 = 'Krank Kasnağı';

    return {
      level1: 'Mekanik & Yürüyen Aksam',
      level2: 'Motor & Zamanlama',
      level3: l3,
    };
  }

  // 6. Süspansiyon, Direksiyon & Ön Düzen
  if (clean.includes('amortis') || clean.includes('salincak') || clean.includes('rot') || clean.includes('rotil') || clean.includes('direksiyon') || clean.includes('koruk') || clean.includes('takoz') || clean.includes('burc') || clean.includes('yay') || clean.includes('on takim')) {
    let l3 = 'Süspansiyon Bileşeni';
    if (clean.includes('amortis')) l3 = 'Amortisör Grubu';
    else if (clean.includes('salincak')) l3 = 'Salıncak & Burç Takımı';
    else if (clean.includes('z rot') || clean.includes('viraj')) l3 = 'Z-Rot / Askı Rotu';
    else if (clean.includes('rot basi') || clean.includes('rotil')) l3 = 'Rot Başı & Rotil';
    else if (clean.includes('direksiyon')) l3 = 'Direksiyon Kutusu & Pompası';
    else if (clean.includes('takoz')) l3 = 'Amortisör / Motor Takozu';

    return {
      level1: 'Mekanik & Yürüyen Aksam',
      level2: 'Süspansiyon & Direksiyon',
      level3: l3,
    };
  }

  // 7. Elektrik, Elektronik, Akü & Aydınlatma
  if (clean.includes('aku') || clean.includes('akü') || clean.includes('alternator') || clean.includes('mars') || clean.includes('marş') || clean.includes('far') || clean.includes('lamba') || clean.includes('ampul') || clean.includes('sigorta') || clean.includes('sensor') || clean.includes('beyin') || clean.includes('ecu') || clean.includes('kablo')) {
    let l2 = 'Elektrik & Elektronik';
    let l3 = 'Elektrik Bileşeni';
    if (clean.includes('aku') || clean.includes('akü')) {
      l2 = 'Akü & Güç Depolama';
      l3 = clean.includes('start') || clean.includes('agm') || clean.includes('efb') ? 'Start-Stop Akü' : 'Standart Akü (12V)';
    } else if (clean.includes('alternator') || clean.includes('sarj') || clean.includes('şarj')) {
      l2 = 'Şarj & Marş Sistemi';
      l3 = 'Alternatör / Şarj Dinamosu';
    } else if (clean.includes('mars') || clean.includes('marş')) {
      l2 = 'Şarj & Marş Sistemi';
      l3 = 'Marş Motoru & Otomatiği';
    } else if (clean.includes('far') || clean.includes('stop') || clean.includes('ampul') || clean.includes('led')) {
      l2 = 'Aydınlatma Grubu';
      l3 = 'Far, Stop & Ampul Takımı';
    } else if (clean.includes('sensor') || clean.includes('sensör') || clean.includes('oksijen') || clean.includes('lambda')) {
      l2 = 'Sensörler & Göstergeler';
      l3 = 'Elektronik Sensör Grubu';
    }

    return {
      level1: 'Elektrik & Elektronik',
      level2: l2,
      level3: l3,
    };
  }

  // 8. Ateşleme Sistemi
  if (clean.includes('buji') || clean.includes('bobin') || clean.includes('kizdirma') || clean.includes('ısıtma buji')) {
    let l3 = 'Buji & Ateşleme Bobini';
    if (clean.includes('kizdirma') || clean.includes('isitma') || clean.includes('dizel')) l3 = 'Kızdırma / Isıtma Bujisi (Dizel)';
    else if (clean.includes('bobin')) l3 = 'Elektronik Ateşleme Bobini';
    else if (clean.includes('buji')) l3 = 'Buji Seti (Benzinli)';

    return {
      level1: 'Elektrik & Elektronik',
      level2: 'Ateşleme Sistemi',
      level3: l3,
    };
  }

  // 9. Lastik, Jant & Görüş
  if (clean.includes('lastik') || clean.includes('jant') || clean.includes('silecek') || clean.includes('balans') || clean.includes('subap') || clean.includes('stepne')) {
    let l2 = 'Binek Lastik Grubu';
    let l3 = 'Lastik Seti';
    if (clean.includes('silecek') || clean.includes('supurge') || clean.includes('aerotwin')) {
      l2 = 'Görüş & Silecek Grubu';
      l3 = 'Silecek Süpürgesi Takımı';
    } else if (clean.includes('balans') || clean.includes('rot balans')) {
      l2 = 'Lastik Hizmetleri';
      l3 = 'Rot & Balans Ayarı';
    } else if (clean.includes('ticari') || clean.includes('c serisi') || clean.includes('yuk')) {
      l2 = 'Ticari Lastik Grubu';
      l3 = 'C Sınıfı Ticari Lastik';
    } else if (clean.includes('jant')) {
      l2 = 'Jant Grubu';
      l3 = 'Sac / Alaşım Jant';
    }

    return {
      level1: 'Lastik, Jant & Aksesuar',
      level2: l2,
      level3: l3,
    };
  }

  // 10. İklimlendirme & Klima
  if (clean.includes('klima') || clean.includes('gaz') || clean.includes('kompresor') || clean.includes('evaporator') || clean.includes('kalorifer') || clean.includes('kondenser')) {
    let l3 = 'Klima Bileşeni';
    if (clean.includes('gaz') || clean.includes('dolum') || clean.includes('kacak')) l3 = 'Klima Gaz Dolumu & Kaçak Testi';
    else if (clean.includes('kompresor')) l3 = 'Klima Kompresörü';
    else if (clean.includes('kondenser') || clean.includes('radyator')) l3 = 'Klima Kondenseri';
    else if (clean.includes('kalorifer')) l3 = 'Kalorifer Peteği & Motoru';

    return {
      level1: 'İklimlendirme & Konfor',
      level2: 'Klima & Isıtma Sistemi',
      level3: l3,
    };
  }

  // 11. Kaporta, Boya & Cam
  if (clean.includes('cam') || clean.includes('tampon') || clean.includes('camurluk') || clean.includes('kapi') || clean.includes('boya') || clean.includes('kaporta') || clean.includes('ayna') || clean.includes('kilit')) {
    let l2 = 'Kaporta & Gövde';
    let l3 = 'Kaporta Bileşeni';
    if (clean.includes('cam') || clean.includes('on cam') || clean.includes('rezistans')) {
      l2 = 'Oto Cam Grubu';
      l3 = 'Ön / Yan Oto Camı';
    } else if (clean.includes('ayna') || clean.includes('dikiz')) {
      l2 = 'Dış Aksam & Aynalar';
      l3 = 'Yan Dikiz Aynası';
    } else if (clean.includes('boya') || clean.includes('pasta') || clean.includes('cila')) {
      l2 = 'Boya & Onarım';
      l3 = 'Boya & Lokal Onarım';
    } else if (clean.includes('tampon')) {
      l3 = 'Ön / Arka Tampon';
    }

    return {
      level1: 'Gövde, Kaporta & Cam',
      level2: l2,
      level3: l3,
    };
  }

  // Default Fallback
  return {
    level1: 'Genel Bakım & Onarım',
    level2: 'Muhtelif Servis Hizmetleri',
    level3: rawText || 'Özel Parça & İşçilik',
  };
}

// ==========================================
// 5. PARSE CUSTOM CATALOG EXCEL / CSV (3-LEVEL HIERARCHY SUPPORT)
// ==========================================
export async function parseCustomCatalogFile(file: File): Promise<PartCatalogItem[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, {
    type: 'array',
    dense: true,
    cellDates: false,
    raw: true,
  });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '', blankrows: false });

  if (!rows || rows.length === 0) {
    throw new Error('Yüklenen katalog dosyası boş veya geçersiz formatta.');
  }

  // Column matching helpers
  const headers = Object.keys(rows[0]);
  const findCol = (patterns: RegExp[]) => {
    return headers.find(h => patterns.some(p => p.test(h.trim())));
  };

  // 1. Prioritize PART_GROUP column (Master categories file compatibility)
  const partGroupCol = findCol([
    /^part.*group$/i, /^parca.*grup/i, /^parca.*grubu/i, /^part.*gr/i, 
    /^malzeme.*grup/i, /^urun.*grup/i, /^grup.*ad/i
  ]);

  const nameCol = findCol([
    /part.*group/i, /parca.*grup/i, /parca.*ad/i, /part.*name/i, /tan[ıi]m/i, /urun.*ad/i, 
    /islem.*ad/i, /malzeme.*ad/i, /isim/i, /name/i, /parca/i, /description/i
  ]);

  // 2. Part Code column
  const codeCol = findCol([
    /^part.*code$/i, /^part.*no$/i, /^oem/i, /^stok.*kod/i, /^kod$/i, /^code$/i,
    /parca.*kod/i, /part.*code/i, /oem.*kod/i, /oem.*no/i, /oem/i, 
    /stok.*kod/i, /kod/i, /code/i, /part.*no/i, /parca.*no/i, /malzeme.*kod/i, /material/i
  ]);

  // 3. 3-Level Categories: Genelden Özele (Level 1 > Level 2 > Level 3)
  const catLevel1Col = findCol([
    /kategori.*1/i, /kategori1/i, /l1/i, /seviye.*1/i, /genel.*kategori/i, 
    /ana.*kategori/i, /ana.*grup/i, /main.*category/i, /ust.*kategori/i, /grup.*1/i
  ]);

  const catLevel2Col = findCol([
    /kategori.*2/i, /kategori2/i, /l2/i, /seviye.*2/i, /alt.*kategori/i, 
    /alt.*grup/i, /sistem/i, /sub.*category/i, /ara.*kategori/i, /grup.*2/i
  ]);

  const catLevel3Col = findCol([
    /kategori.*3/i, /kategori3/i, /l3/i, /seviye.*3/i, /detay.*kategori/i, 
    /detay.*grup/i, /parca.*grubu/i, /ozel.*kategori/i, /detail.*category/i, /grup.*3/i
  ]);

  // General fallback category column if separate L1/L2/L3 columns don't exist
  const genericCatCol = findCol([/kategor[ıi]/i, /category/i, /grup/i, /tur/i, /sistem/i]);
  const kwCol = findCol([
    /^keywords[_\s\-]*tr$/i,
    /keywords[_\s\-]*tr/i,
    /^keyword[_\s\-]*tr$/i,
    /keyword[_\s\-]*tr/i,
    /^keywords$/i,
    /^keyword$/i,
    /keywords/i,
    /keyword/i,
    /^anahtar[_\s\-]*kelimeler/i,
    /anahtar.*kelime/i,
    /olasi.*parca/i,
    /parca.*adlar/i,
    /sinonim/i,
    /synonym/i,
    /kel[ıi]me/i,
    /arama/i
  ]);
  const unitCol = findCol([/b[ıi]r[ıi]m/i, /unit/i]);
  const descCol = findCol([/aciklama/i, /not/i, /bilgi/i, /description/i]);

  const parsedCatalog: PartCatalogItem[] = [];

  rows.forEach((row, idx) => {
    // Determine raw part name prioritizing PART_GROUP
    const rawPartGroup = partGroupCol && row[partGroupCol] ? String(row[partGroupCol]).trim() : '';
    const rawNameCol = nameCol && row[nameCol] ? String(row[nameCol]).trim() : '';
    const rawCodeCol = codeCol && row[codeCol] ? String(row[codeCol]).trim() : '';
    const rawName = rawPartGroup || rawNameCol || rawCodeCol;
    
    if (!rawName) return;

    // Resolve Code
    let code = rawCodeCol ? rawCodeCol.toUpperCase() : '';
    if (!code) {
      const slug = cleanText(rawName).replace(/\s+/g, '-').slice(0, 12).toUpperCase();
      code = slug ? `PRC-${slug}` : `PRC-${idx + 100}`;
    }

    const name = rawName;

    // Resolve 3 Category Levels (Genelden Özele)
    let l1 = '';
    let l2 = '';
    let l3 = '';

    if (catLevel1Col && row[catLevel1Col]) l1 = String(row[catLevel1Col]).trim();
    if (catLevel2Col && row[catLevel2Col]) l2 = String(row[catLevel2Col]).trim();
    if (catLevel3Col && row[catLevel3Col]) l3 = String(row[catLevel3Col]).trim();

    // If separate columns not present, check generic category string for splitters like ">", "/", "-"
    if (!l1 && genericCatCol && row[genericCatCol]) {
      const fullCatString = String(row[genericCatCol]).trim();
      const parts = fullCatString.split(/[>\/\|]/).map(p => p.trim()).filter(Boolean);
      if (parts.length >= 3) {
        l1 = parts[0];
        l2 = parts[1];
        l3 = parts[2];
      } else if (parts.length === 2) {
        l1 = parts[0];
        l2 = parts[1];
        l3 = rawPartGroup || 'Genel Parça';
      } else if (parts.length === 1) {
        l1 = parts[0];
        l2 = 'Genel Grup';
        l3 = rawPartGroup || 'Genel Parça';
      }
    }

    // If still missing L1/L2/L3, automatically derive from PART_GROUP / Part Name
    if (!l1 || !l2 || !l3) {
      const derived = derive3LevelCategoryFromPartGroup(rawPartGroup || name);
      if (!l1) l1 = derived.level1;
      if (!l2) l2 = derived.level2;
      if (!l3) l3 = rawPartGroup || derived.level3;
    }

    const fullCategory = `${l1} > ${l2} > ${l3}`;

    // Keywords from KEYWORDS_TR (olası parça adları) & ANAHTAR_KELIMELER
    let keywords: string[] = [];
    if (kwCol && row[kwCol] !== undefined && row[kwCol] !== null) {
      const rawVal = String(row[kwCol]).trim();
      if (rawVal) {
        const rawKeywords = rawVal
          .split(/[,;\n\r|•\/]+/)
          .map(k => k.trim())
          .filter(k => k.length > 1);
        keywords.push(...rawKeywords);
      }
    }

    // Also include standard name, code, and category terms as aliases
    if (name) keywords.push(name);
    if (code) keywords.push(code);
    if (l3 && l3 !== name) keywords.push(l3);

    // Dedup case-insensitively while preserving original wording
    const seenKw = new Set<string>();
    const dedupedKeywords: string[] = [];
    for (const kw of keywords) {
      const lower = kw.toLowerCase();
      if (!seenKw.has(lower)) {
        seenKw.add(lower);
        dedupedKeywords.push(kw);
      }
    }
    keywords = dedupedKeywords;

    parsedCatalog.push({
      id: `custom-cat-${idx + 1}`,
      code,
      name,
      categoryLevel1: l1,
      categoryLevel2: l2,
      categoryLevel3: l3,
      category: fullCategory,
      keywords,
      unit: String(row[unitCol] || 'Adet').trim(),
      description: row[descCol] ? String(row[descCol]).trim() : `Özel Katalog: ${fullCategory}`,
    });
  });

  if (parsedCatalog.length === 0) {
    throw new Error('Dosyadan geçerli parça katalog kaydı ayrıştırılamadı. Lütfen PART_GROUP, Parça Kodu veya Parça Adı sütunlarını kontrol edin.');
  }

  return parsedCatalog;
}

// ==========================================
// 6. EXPORT 3-LEVEL CATALOG TEMPLATE (.XLSX)
// ==========================================
export function downloadCatalogTemplate() {
  const templateRows = [
    {
      'GENEL_KATEGORI_L1': 'Periyodik Bakım & Sıvılar',
      'ALT_KATEGORI_L2': 'Filtre Grubu',
      'DETAY_KATEGORI_L3': 'Bakım Filtre Seti',
      'PARCA_KODU': 'BOSCH-FLT-01',
      'PARCA_ADI': "4'lü Periyodik Filtre Seti (Yağ, Hava, Polen, Yakıt)",
      'BIRIM': 'Set',
      'KEYWORDS_TR': 'filtre, hava filtresi, yağ filtresi, polen filtresi, mazot filtresi, periyodik bakım',
      'ANAHTAR_KELIMELER': 'filtre, hava filtresi, yağ filtresi, polen filtresi, mazot filtresi, periyodik bakım',
      'ACIKLAMA': 'Standart 4 parça bakım filtre seti'
    },
    {
      'GENEL_KATEGORI_L1': 'Periyodik Bakım & Sıvılar',
      'ALT_KATEGORI_L2': 'Motor Yağları & Katkılar',
      'DETAY_KATEGORI_L3': 'Tam Sentetik Motor Yağı',
      'PARCA_KODU': 'BOSCH-OIL-01',
      'PARCA_ADI': 'Tam Sentetik Motor Yağı (5W-30 / 5W-40 4-5 Litre)',
      'BIRIM': 'Litre/Bidon',
      'KEYWORDS_TR': 'motor yağı, yağ değişimi, 5w30, 5w40, sentetik yağ, karter yağı',
      'ANAHTAR_KELIMELER': 'motor yağı, yağ değişimi, 5w30, 5w40, sentetik yağ, karter yağı',
      'ACIKLAMA': 'DPF uyumlu tam sentetik motor yağı'
    },
    {
      'GENEL_KATEGORI_L1': 'Mekanik & Yürüyen Aksam',
      'ALT_KATEGORI_L2': 'Fren Sistemi',
      'DETAY_KATEGORI_L3': 'Ön Fren Balatası',
      'PARCA_KODU': 'BOSCH-BRK-01',
      'PARCA_ADI': 'Ön Fren Balata Takımı',
      'BIRIM': 'Takım',
      'KEYWORDS_TR': 'ön balata, fren balatası, ön fren, balata değişimi',
      'ANAHTAR_KELIMELER': 'ön balata, fren balatası, ön fren, balata değişimi',
      'ACIKLAMA': 'Ön aks seramik/organik fren balatası'
    },
    {
      'GENEL_KATEGORI_L1': 'Mekanik & Yürüyen Aksam',
      'ALT_KATEGORI_L2': 'Fren Sistemi',
      'DETAY_KATEGORI_L3': 'Ön Fren Diski',
      'PARCA_KODU': 'BOSCH-DSC-01',
      'PARCA_ADI': 'Ön Fren Diski Çifti',
      'BIRIM': 'Çift',
      'KEYWORDS_TR': 'ön disk, fren diski, hava kanallı disk, disk değişimi',
      'ANAHTAR_KELIMELER': 'ön disk, fren diski, hava kanallı disk, disk değişimi',
      'ACIKLAMA': 'Ön hava soğutmalı fren disk çifti'
    },
    {
      'GENEL_KATEGORI_L1': 'Mekanik & Yürüyen Aksam',
      'ALT_KATEGORI_L2': 'Debriyaj & Şanzıman',
      'DETAY_KATEGORI_L3': 'Debriyaj Baskı Balata',
      'PARCA_KODU': 'BOSCH-CLT-01',
      'PARCA_ADI': 'Debriyaj Baskı Balata & Rulman Seti',
      'BIRIM': 'Set',
      'ANAHTAR_KELIMELER': 'debriyaj, baskı balata, kavrama, debriyaj bilyası',
      'ACIKLAMA': 'Komple debriyaj kiti'
    },
    {
      'GENEL_KATEGORI_L1': 'Mekanik & Yürüyen Aksam',
      'ALT_KATEGORI_L2': 'Motor & Zamanlama',
      'DETAY_KATEGORI_L3': 'Triger Kayış Seti',
      'PARCA_KODU': 'BOSCH-TRG-01',
      'PARCA_ADI': 'Triger Kayış & Gergi Rulman Kiti (Devirdaimli)',
      'BIRIM': 'Set',
      'ANAHTAR_KELIMELER': 'triger, triger seti, triger kayışı, su pompası, devirdaim',
      'ACIKLAMA': 'Ağır bakım triger seti ve su pompası'
    },
    {
      'GENEL_KATEGORI_L1': 'Elektrik & Elektronik',
      'ALT_KATEGORI_L2': 'Akü & Güç Depolama',
      'DETAY_KATEGORI_L3': 'Start-Stop Akü',
      'PARCA_KODU': 'BOSCH-BAT-01',
      'PARCA_ADI': '12V 72Ah Start-Stop AGM/EFB Akü',
      'BIRIM': 'Adet',
      'ANAHTAR_KELIMELER': 'akü, start stop, agm, efb, 72ah, 70ah',
      'ACIKLAMA': 'Start-Stop uyumlu yüksek döngülü akü'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Parca_Katalog_Sablonu');
  XLSX.writeFile(wb, 'Filo_Parca_Katalog_3_Kademeli_Sablon.xlsx');
}

// ==========================================
// 6. PERSISTENCE HELPERS (LOCALSTORAGE)
// ==========================================
const STORAGE_KEY_PARTS_CATALOG = 'fleet_custom_parts_catalog_v1';
const STORAGE_KEY_CATALOG_SOURCE = 'fleet_parts_catalog_source_v1';

export function saveCatalogToStorage(catalog: PartCatalogItem[], source: 'default' | 'custom'): void {
  try {
    if (source === 'custom' && catalog && catalog.length > 0) {
      localStorage.setItem(STORAGE_KEY_PARTS_CATALOG, JSON.stringify(catalog));
      localStorage.setItem(STORAGE_KEY_CATALOG_SOURCE, 'custom');
    } else {
      localStorage.removeItem(STORAGE_KEY_PARTS_CATALOG);
      localStorage.setItem(STORAGE_KEY_CATALOG_SOURCE, 'default');
    }
  } catch (e) {
    console.warn('LocalStorage save error for parts catalog:', e);
  }
}

export function loadCatalogFromStorage(): { catalog: PartCatalogItem[]; source: 'default' | 'custom' } {
  try {
    const savedSource = localStorage.getItem(STORAGE_KEY_CATALOG_SOURCE) as 'default' | 'custom' | null;
    const savedData = localStorage.getItem(STORAGE_KEY_PARTS_CATALOG);

    if (savedSource === 'custom' && savedData) {
      const parsed = JSON.parse(savedData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          catalog: parsed,
          source: 'custom'
        };
      }
    }
  } catch (e) {
    console.warn('LocalStorage load error for parts catalog:', e);
  }

  return {
    catalog: DEFAULT_PARTS_CATALOG,
    source: 'default'
  };
}
