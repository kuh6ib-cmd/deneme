import { RawFleetRecord, NormalizedFleetRecord, ColumnMapping, SparePartOriginType, PartCatalogItem } from '../types';
import { getCleanPartName } from './partsCatalogService';

// Brand Normalization Dictionary
export const BRAND_DICTIONARY: Record<string, string[]> = {
  'RENAULT': [
    'reanult', 'renault', 'reno', 'renolt', 'renalt', 'rnlt', 'renault trucks', 'renault-mais', 'mais renault', 'renaultmais'
  ],
  'FIAT': [
    'fiattt', 'fiatt', 'fiat', 'fıat', 'faıt', 'tofas', 'tofaş', 'tofas fiat', 'fiat tofaş', 'fıat tofas'
  ],
  'VOLKSWAGEN': [
    'vw', 'volks wagen', 'volkwagen', 'volkswagen', 'wolkswagen', 'volks', 'vokswagen', 'v.w.', 'v.w'
  ],
  'FORD': [
    'fordd', 'frd', 'ford', 'ford motor', 'fords', 'ford otosan', 'otosan'
  ],
  'TOYOTA': [
    'toyota', 'tyt', 'toyoto', 'toyata', 'toyta'
  ],
  'MERCEDES-BENZ': [
    'mercedes', 'merco', 'mb', 'mercedes benz', 'daimler', 'mercedes-benz', 'mercedez', 'mercedess'
  ],
  'BMW': [
    'bmw', 'bmw ag', 'bmv', 'b.m.w'
  ],
  'HYUNDAI': [
    'hyundai', 'hyundaı', 'hyundia', 'hyunde', 'hundai', 'hyunday'
  ],
  'PEUGEOT': [
    'peugeot', 'pejo', 'peugot', 'peujot', 'peugeott'
  ],
  'CITROËN': [
    'citroen', 'sitroen', 'citroën', 'cıtroen', 'sitroën', 'citroen turkiye'
  ],
  'OPEL': [
    'opel', 'opl', 'opell', 'opel turkiye'
  ],
  'DACIA': [
    'dacia', 'dacıa', 'dasya', 'dacja'
  ],
  'SKODA': [
    'skoda', 'şhoda', 'şkoda', 'skoda turkiye', 'yuce skoda'
  ],
  'HONDA': [
    'honda', 'hnda'
  ],
  'NISSAN': [
    'nissan', 'nısan', 'nisan'
  ],
  'AUDI': [
    'audi', 'audı'
  ],
  'VOLVO': [
    'volvo', 'volvo trucks'
  ],
  'ISUZU': [
    'isuzu', 'anadolu isuzu', 'ısuzu'
  ],
  'IVECO': [
    'iveco', 'ıveco'
  ],
  'MITSUBISHI': [
    'mitsubishi', 'mıtsubıshı', 'mitsu'
  ],
  'SEAT': [
    'seat', 'seatt'
  ],
  'KIA': [
    'kia', 'kıa'
  ],
};

// Precomputed brand alias map for O(1) instant lookup
const BRAND_ALIAS_MAP = new Map<string, string>();
Object.entries(BRAND_DICTIONARY).forEach(([brand, aliases]) => {
  BRAND_ALIAS_MAP.set(brand.toLowerCase(), brand);
  aliases.forEach(alias => {
    BRAND_ALIAS_MAP.set(alias.toLowerCase(), brand);
  });
});

const brandCache = new Map<string, { brand: string; wasCorrected: boolean; original: string }>();

// Normalize Brand Name with fast O(1) cache
export function normalizeBrand(rawBrand: any): { brand: string; wasCorrected: boolean; original: string } {
  if (!rawBrand) {
    return { brand: 'BELİRTİLMEMİŞ', wasCorrected: false, original: '' };
  }

  const str = typeof rawBrand === 'string' ? rawBrand.trim() : String(rawBrand).trim();
  if (!str) {
    return { brand: 'BELİRTİLMEMİŞ', wasCorrected: false, original: '' };
  }

  const cached = brandCache.get(str);
  if (cached) return cached;

  const original = str.toUpperCase();
  const lower = str.toLowerCase();

  // 1. Direct map lookup
  if (BRAND_ALIAS_MAP.has(lower)) {
    const standard = BRAND_ALIAS_MAP.get(lower)!;
    const res = { brand: standard, wasCorrected: standard !== original, original: str };
    brandCache.set(str, res);
    return res;
  }

  // 2. Cleaned lookup
  const cleaned = lower.replace(/[^a-z0-9ğüşıöç]/g, ' ').replace(/\s+/g, ' ').trim();
  if (BRAND_ALIAS_MAP.has(cleaned)) {
    const standard = BRAND_ALIAS_MAP.get(cleaned)!;
    const res = { brand: standard, wasCorrected: standard !== original, original: str };
    brandCache.set(str, res);
    return res;
  }

  // 3. Partial substring scan
  for (const [alias, standard] of BRAND_ALIAS_MAP.entries()) {
    if (alias.length > 2 && (cleaned.includes(alias) || alias.includes(cleaned))) {
      const res = { brand: standard, wasCorrected: standard !== original, original: str };
      brandCache.set(str, res);
      return res;
    }
  }

  const res = { brand: original, wasCorrected: false, original: str };
  brandCache.set(str, res);
  return res;
}

// Comprehensive Automotive Expense & Service Type Classifier
interface ExpenseRule {
  category: string;
  exactMatches?: string[];
  phrases?: string[];
  patterns?: RegExp[];
}

const EXPENSE_RULES: ExpenseRule[] = [
  // 1. Planlı Periyodik Bakım & Filtre Setleri
  {
    category: 'Periyodik Bakım & Filtre Seti',
    exactMatches: [
      'periyodik bakım', 'periyodik bakim', 'perıyodık bakım', 'perıyodık bakim',
      'rutin bakım', 'rutin bakim', 'yağ bakımı', 'yag bakimi', 'yağ değişimi', 'yag degisimi',
      '10 bin bakımı', '15 bin bakımı', '20 bin bakımı', '30 bin bakımı', '45 bin bakımı', '60 bin bakımı',
      '10000 km bakımı', '15000 km bakımı', '20000 km bakımı', '30000 km bakımı', '60000 km bakımı', '90000 km bakımı', '120000 km bakımı',
      'filtre seti', 'bakım seti', 'periyodik servis'
    ],
    phrases: [
      'periyodik bakım', 'periyodik bakim', 'perıyodık', 'rutin bakım', 'rutin bakim',
      'yağ ve filtre', 'yag ve filtre', 'yağ & filtre', 'yag & filtre',
      '10.000', '15.000', '20.000', '30.000', '45.000', '60.000', '90.000', '120.000',
      'hava filtresi', 'yağ filtresi', 'yag filtresi', 'polen filtresi', 'yakıt filtresi', 'yakit filtresi',
      'mazot filtresi', 'periyodik servis', 'bakım işçiliği', 'bakim iscilik'
    ],
    patterns: [
      /\b(periyodik|periyoduk|periyodık|peryodik)\s+(bak[ıi]m|serv[ıi]s)/i,
      /\b\d{2,3}\.?000\s*(km)?\s*bak[ıi]m/i,
      /\b(ya[gğ]\s+ve\s+f[ıi]ltre|f[ıi]ltre\s+set[ıi]|bak[ıi]m\s+set[ıi])/i
    ]
  },

  // 2. Ağır Bakım, Triger & Motor Revizyon (Before general engine)
  {
    category: 'Ağır Bakım & Motor Revizyon',
    exactMatches: [
      'ağır bakım', 'agir bakim', 'triger değişimi', 'triger seti', 'motor revizyon', 'rektifiye'
    ],
    phrases: [
      'triger', 'trıger', 'triger seti', 'triger kayışı', 'triger zinciri', 'eksantrik zinciri',
      'devirdaim', 'devir daim', 'su pompası', 'motor revizyon', 'rektifiye',
      'silindir kapak', 'silindir kapak contası', 'üst kapak contası', 'segman', 'piston',
      'krank', 'krank kasnağı', 'eksantrik mili', 'ana yatak', 'kol yatak', 'subap takımı', 'supap takımı',
      'turboşarj', 'turbo revizyon', 'turbo değişimi', 'intercooler'
    ],
    patterns: [
      /\b(tr[ıi]ger|dev[ıi]rda[ıi]m|rekt[ıi]f[ıi]ye|segman|p[ıi]ston|turbo[şs]arj)\b/i,
      /\ba[gğ][ıi]r\s+bak[ıi]m\b/i
    ]
  },

  // 3. Debriyaj, Şanzıman & Güç Aktarma
  {
    category: 'Debriyaj & Şanzıman',
    exactMatches: [
      'debriyaj', 'şanzıman', 'sanziman', 'baskı balata', 'baski balata', 'kavrama', 'volan', 'volant', 'çift kütleli volan'
    ],
    phrases: [
      'baskı balata', 'baski balata', 'debriyaj baskı balata', 'debriyaj seti', 'debriyaj balatası', 'debriyaj baskı',
      'debriyaj çatalı', 'debriyaj bilyası', 'debriyaj rulmanı', 'debriyaj merkezi', 'debriyaj alt merkez', 'debriyaj üst merkez',
      'volan', 'volant', 'çift kütleli volan', 'sabit volan', 'volan debriyaj', 'volan dişlisi',
      'şanzıman', 'sanziman', 'vites kutusu', 'şanzıman yağı', 'sanziman yagi',
      'kavrama seti', 'dsg kavrama', 'mekatronik', 'robotik vites',
      'şanzıman robotu', 'vites halatı', 'senkromeç', 'şanzıman kulağı', 'şanzıman takozu'
    ],
    patterns: [
      /\b(debr[ıi]yaj|volan|volant|kavrama|dsg|mekatron[ıi]k|[şs]anz[ıi]man)\b/i,
      /\bbask[ıi]\s*balata\b/i
    ]
  },

  // 3.5 Aydınlatma & Ampul Grubu (Must be evaluated before generic Fren or Elektrik to prevent "fren ampulü" -> Fren Sistemi bug)
  {
    category: 'Elektrik & Elektronik / Akü',
    exactMatches: [
      'aydınlatma', 'aydinlatma', 'ampul', 'oto ampul', 'far ampulü', 'stop ampulü', 'fren ampulü'
    ],
    phrases: [
      'fren ampulü', 'fren ampul', 'stop ampulü', 'stop ampul', 'far ampulü', 'far ampul', 'sinyal ampulü', 'sinyal ampul',
      'arka fren ampul', 'sağ arka fren ampul', 'sol arka fren ampul', 'arka stop ampul', 'sağ stop ampul', 'sol stop ampul',
      'h7 ampul', 'h4 ampul', 'h1 ampul', 'h11 ampul', 'p21w', 'py21w', 'w5w', 't10', 'c5w',
      'led ampul', 'xenon ampul', 'sis ampulü', 'park ampulü', 'plaka ampulü', 'tavan ampulü', 'çift duy ampul', 'tek duy ampul',
      'far lambası', 'stop lambası', 'fren lambası'
    ],
    patterns: [
      /\b(ampul|p21w|w5w|py21w|t10|c5w|h[147]|h11|xenon|led\s*ampul)\b/i,
      /\b(fren|stop|sinyal|far|park|plaka|sis)\s*ampul/i,
      /\b(stop|sinyal|plaka|tavan)\s*lamba/i
    ]
  },

  // 4. Fren Sistemi
  {
    category: 'Fren Sistemi',
    exactMatches: [
      'fren', 'fren sistemi', 'fren balata', 'fren diski', 'balata değişimi', 'ön balata', 'arka balata', 'ön disk', 'arka disk'
    ],
    phrases: [
      'fren balatası', 'fren balatasi', 'ön fren balata', 'arka fren balata', 'ön balata', 'arka balata',
      'fren diski', 'ön disk', 'arka disk', 'ön fren diski', 'arka fren diski', 'disk torna', 'kampana', 'fren pabucu',
      'fren hidroliği', 'fren hidrolik', 'fren kaliperi', 'kaliper tamir', 'fren merkezi', 'fren ana merkez',
      'fren vakumu', 'abs sensörü', 'abs beyni', 'el fren teli', 'el fren motoru', 'fren hortumu'
    ],
    patterns: [
      /\b(ön|arka|ark|on)\s*(fren|balata|disk)\b/i,
      /\bfren\s*(balata|disk|kal[ıi]per|kampa?na|merkez|hortum|tel|pabu[çc])\b/i,
      /\b(balata|kampa?na|kal[ıi]per)\b/i,
      /\bfren\b/i
    ]
  },

  // 5. Ön Takım, Süspansiyon & Direksiyon (Distinct from Lastik)
  {
    category: 'Ön Takım, Süspansiyon & Direksiyon',
    exactMatches: [
      'ön takım', 'on takim', 'süspansiyon', 'suspansiyon', 'direksiyon', 'yürüyen aksam'
    ],
    phrases: [
      'ön takım', 'on takim', 'arka takım', 'yürüyen aksam', 'salıncak', 'salincak', 'rotil', 'rot başı', 'rot basi',
      'rot kolu', 'rot mili', 'z-rot', 'z rot', 'askı rotu', 'viraj demir lastiği', 'viraj çubuğu',
      'amortisör', 'amartisor', 'amortisör kulesi', 'amortisör takozu', 'amortisör bilyası', 'helezon', 'helezon yay',
      'aks', 'aks kafası', 'aks körüğü', 'aks mili', 'porya', 'porya bilyası', 'teker rulmanı',
      'direksiyon kutusu', 'direksiyon pompası', 'direksiyon mafsalı', 'direksiyon hidroliği', 'körüklü mil'
    ],
    patterns: [
      /\b(sal[ıi]ncak|rot[ıi]l|amort[ıi]s[oö]r|helezon|porya|d[ıi]reks[ıi]yon\s*(kutus|pompas|mafsal))\b/i,
      /\b(z-?rot|rot\s*ba[şs][ıi]|aks\s*k[oö]r[uü][gğ]u|on\s*tak[ıi]m|y[uü]r[uü]yen\s*aksam)\b/i
    ]
  },

  // 6. Lastik, Jant & Rot-Balans
  {
    category: 'Lastik & Rot Balans',
    exactMatches: [
      'lastik', 'lastik değişimi', 'rot balans', 'rot-balans', 'jant'
    ],
    phrases: [
      'rot balans', 'rot-balans', 'rot ayarı', 'balans ayarı', 'ön düzen ayarı',
      'lastik', 'lastik sökme', 'lastik takma', 'lastik değişimi', 'yazlık lastik', 'kışlık lastik',
      'dört mevsim lastik', 'lastik oteli', 'lastik tamiri', 'yama', 'fitil', 'sibop', 'çelik jant', 'jant düzeltme', 'jant boyama'
    ],
    patterns: [
      /\blast[ıi]k\b/i,
      /\brot[-\s]*balans\b/i,
      /\b(balans\s*ayar[ıi]|rot\s*ayar[ıi]|jant)\b/i
    ]
  },

  // 7. Egzoz, Emisyon & DPF
  {
    category: 'Egzoz, Emisyon & DPF',
    exactMatches: [
      'egzoz', 'dpf', 'partikül', 'egr', 'emisyon', 'katalizör'
    ],
    phrases: [
      'dpf', 'd.p.f', 'partikül filtresi', 'partikul filtresi', 'dpf temizliği', 'dpf rejenerasyon',
      'egr valfi', 'egr soğutucu', 'egr temizliği', 'katalizör', 'katalitik konvertör',
      'oksijen sensörü', 'lambda sensörü', 'nox sensörü', 'egzoz manifoldu', 'egzoz susturucu', 'spiral boru',
      'adblue pompası', 'adblue enjektörü', 'adblue ısıtıcı', 'adblue deposu'
    ],
    patterns: [
      /\b(dpf|part[ıi]k[uü]l|egr|katal[ıi]z[oö]r|egzo[sz]|em[ıi]syon)\b/i,
      /\b(nox\s*sens[oö]r|adblue\s*(pompa|enjekt[oö]r|tank|s[ıi]stem))\b/i
    ]
  },

  // 8. Motor, Yakıt & Ateşleme
  {
    category: 'Motor, Yakıt & Ateşleme',
    exactMatches: [
      'motor', 'yakıt sistemi', 'enjektör', 'enjektor', 'ateşleme', 'soğutma'
    ],
    phrases: [
      'enjektör', 'enjektor', 'enjektör memesi', 'enjektör pulu', 'yakıt pompası', 'mazot pompası', 'yüksek basınç pompası',
      'buji', 'kızdırma bujisi', 'ateşleme bobini', 'bobin', 'buji kablosu',
      'termostat', 'termostat gövdesi', 'su radyatörü', 'radyatör hortumu', 'genleşme kabı', 'yedek su deposu',
      'yağ soğutucu', 'yağ pompası', 'karter', 'karter contası', 'külbütör kapağı', 'v kayışı', 'gergi bilyası', 'gergi kütüğü'
    ],
    patterns: [
      /\b(enjekt[oö]r|buj[ıi]|bob[ıi]n|termostat|radyat[oö]r|karter|k[uü]lb[uü]t[oö]r)\b/i,
      /\b(yak[ıi]t\s*pompas[ıi]|ate[şs]leme|su\s*deposu|v\s*kay[ıi][şs][ıi])\b/i
    ]
  },

  // 9. Elektrik, Elektronik & Akü
  {
    category: 'Elektrik & Elektronik / Akü',
    exactMatches: [
      'elektrik', 'elektronik', 'akü', 'aku', 'aydınlatma', 'marş', 'şarj'
    ],
    phrases: [
      'akü', 'aku', 'akü değişimi', 'marş motoru', 'mars motoru', 'marş otomatiği', 'şarj dinamosu', 'alternatör',
      'far', 'ön far', 'arka stop', 'stop lambası', 'sis farı', 'xenon', 'led ampul', 'h7 ampul', 'sinyal',
      'sigorta kutusu', 'sigorta', 'röle', 'motor beyni', 'ecu', 'bcm', 'gövde beyni', 'kablo tesisatı',
      'korna', 'cam krikosu', 'cam motoru', 'merkezi kilit', 'silecek motoru', 'silecek kolu'
    ],
    patterns: [
      /\b(ak[uü]|alternat[oö]r|mar[şs]\s*motor|ayd[ıi]nlatma|[şs]arj\s*d[ıi]namo|tes[ıi]sat|s[ıi]gorta\s*kutu)\b/i,
      /\b(far|stop\s*lamba|ampul|ecu|bey[ıi]n|cam\s*kr[ıi]ko)\b/i
    ]
  },

  // 10. Klima & Isıtma / Soğutma
  {
    category: 'Klima & Isıtma / Soğutma',
    exactMatches: [
      'klima', 'klima bakımı', 'klima gazı', 'kalorifer'
    ],
    phrases: [
      'klima', 'klima gazı', 'klima gazi', 'klima gaz dolumu', 'klima kompresörü', 'klima kompresor',
      'klima radyatörü', 'klima kondansatörü', 'klima borusu', 'klima kurutucu filtre', 'klima genleşme valfi',
      'kalorifer', 'kalorifer peteği', 'kalorifer motoru', 'rezistans', 'klima kaçak testi'
    ],
    patterns: [
      /\bkl[ıi]ma\b/i,
      /\b(kalor[ıi]fer|kondansat[oö]r|klima\s*gaz[ıi]|kompres[oö]r)\b/i
    ]
  },

  // 11. Kaporta, Boya & Cam
  {
    category: 'Kaporta, Boya & Cam',
    exactMatches: [
      'kaporta', 'boya', 'hasar', 'cam', 'kaza onarım'
    ],
    phrases: [
      'kaporta', 'kaporta düzeltme', 'fırın boya', 'lokal boya', 'pasta cila', 'pasta-cila', 'boya koruma',
      'tampon', 'ön tampon', 'arka tampon', 'çamurluk', 'camurluk', 'kapı', 'bagaj kapağı', 'kaput',
      'göçük düzeltme', 'boyasız göçük', 'pdr', 'hasar onarım', 'kaza tamiri',
      'ön cam', 'arka cam', 'yan cam', 'cam değişimi', 'ayna', 'dikiz aynası', 'yan ayna'
    ],
    patterns: [
      /\b(kaporta|boya|tampon|[çc]amurluk|g[oö][çc][uü]k|pasta\s*c[ıi]la|hasar\s*onar[ıi]m)\b/i,
      /\b([oö]n\s*cam|yan\s*cam|d[ıi]k[ıi]z\s*ayna)\b/i
    ]
  },

  // 12. Arıza Tespit, Diyagnoz & Ekspertiz
  {
    category: 'Arıza Tespit & Ekspertiz',
    exactMatches: [
      'arıza tespit', 'ariza tespit', 'diyagnoz', 'ekspertiz', 'check-up', 'check up'
    ],
    phrases: [
      'arıza tespiti', 'ariza tespiti', 'arıza arama', 'bilgisayarlı arıza tespiti', 'diyagnoz', 'diyagnostik',
      'diagnostic', 'check-up', 'check up', 'checkup', 'ekspertiz', 'expertiz', 'test sürüşü', 'araç kabul kontrol'
    ],
    patterns: [
      /\b(ar[ıi]za\s*tesp[ıi]t|d[ıi]yagnoz|d[ıi]agnost[ıi]c|ekspert[ıi]z|check-?up)\b/i
    ]
  },

  // 13. İşçilik & Montaj Hizmeti
  {
    category: 'İşçilik & Montaj Hizmeti',
    exactMatches: [
      'işçilik', 'iscilik', 'servis işçiliği', 'montaj', 'usta bedeli'
    ],
    phrases: [
      'işçilik', 'iscilik', 'işçiliği', 'isciligi', 'mekanik işçilik', 'elektrik işçilik', 'kaporta işçilik',
      'sökme takma', 'sökme-takma', 'montaj bedeli', 'montaj ücreti', 'demontaj', 'usta bedeli', 'usta payı'
    ],
    patterns: [
      /\b(i[şs][çc][ıi]l[ıi]k|i[şs][çc][ıi]l[ıi][gğ][ıi]|s[oö]kme\s*takma|montaj\s*[uü]cret)\b/i
    ]
  },

  // 14. AdBlue, Sıvılar & Kimyasallar
  {
    category: 'AdBlue, Sıvılar & Kimyasallar',
    exactMatches: [
      'adblue', 'antifriz', 'cam suyu', 'sıvılar', 'kimyasallar'
    ],
    phrases: [
      'adblue', 'ad blue', 'antifriz', 'antifreeze', 'cam suyu', 'silecek suyu', 'balata spreyi',
      'sıvı gres', 'pas sökücü', 'katkı', 'motor yağı ekleme', 'hidrolik ekleme'
    ],
    patterns: [
      /\b(adblue|ant[ıi]fr[ıi]z|cam\s*suyu|balata\s*sprey|s[ıi]v[ıi]\s*gres)\b/i
    ]
  },

  // 15. Muayene Hazırlık & Yol Yardım
  {
    category: 'Muayene & Yol Yardım',
    exactMatches: [
      'muayene', 'tüvtürk', 'çekici', 'yol yardım'
    ],
    phrases: [
      'muayene hazırlık', 'tüvtürk hazırlık', 'tuvturk', 'ön muayene', 'çekici hizmeti', 'kurtarıcı', 'yol yardım', 'akü takviye'
    ],
    patterns: [
      /\b(muayene|t[uü]vt[uü]rk|[çc]ek[ıi]c[ıi]|yol\s*yard[ıi]m)\b/i
    ]
  }
];

const expenseCache = new Map<string, string>();

/**
 * Robustly normalizes raw expense type & invoice description into standard automotive categories.
 */
export function normalizeExpenseType(rawExpense: any, description: any = ''): string {
  const rawExpenseStr = String(rawExpense || '').trim();
  const descriptionStr = String(description || '').trim();
  
  if (!rawExpenseStr && !descriptionStr) {
    return 'Genel Onarım & Servis';
  }

  const rawKey = `${rawExpenseStr}___${descriptionStr}`;
  const cached = expenseCache.get(rawKey);
  if (cached) return cached;

  const rawLower = rawExpenseStr.toLowerCase();
  const descLower = descriptionStr.toLowerCase();
  const combined = `${rawLower} ${descLower}`.trim();

  // Phase 1: Exact matches against rawExpense (highest precision)
  if (rawLower.length > 0) {
    for (let i = 0; i < EXPENSE_RULES.length; i++) {
      const rule = EXPENSE_RULES[i];
      if (rule.exactMatches) {
        for (let j = 0; j < rule.exactMatches.length; j++) {
          if (rawLower === rule.exactMatches[j] || rawLower === rule.category.toLowerCase()) {
            expenseCache.set(rawKey, rule.category);
            return rule.category;
          }
        }
      }
    }
  }

  // Phase 2: Phrase & keyword matching across combined text
  for (let i = 0; i < EXPENSE_RULES.length; i++) {
    const rule = EXPENSE_RULES[i];
    if (rule.phrases) {
      for (let j = 0; j < rule.phrases.length; j++) {
        const phrase = rule.phrases[j];
        if (combined.includes(phrase)) {
          expenseCache.set(rawKey, rule.category);
          return rule.category;
        }
      }
    }
  }

  // Phase 3: Regex pattern matching with boundary awareness
  for (let i = 0; i < EXPENSE_RULES.length; i++) {
    const rule = EXPENSE_RULES[i];
    if (rule.patterns) {
      for (let j = 0; j < rule.patterns.length; j++) {
        if (rule.patterns[j].test(combined)) {
          expenseCache.set(rawKey, rule.category);
          return rule.category;
        }
      }
    }
  }

  // Phase 4: Clean fallback if rawExpense has meaningful text
  if (rawExpenseStr.length > 3 && !/^(genel|diger|diğer|yp|y\.p|islem|işlem)$/i.test(rawExpenseStr)) {
    // Capitalize first letters
    const cleaned = rawExpenseStr
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    expenseCache.set(rawKey, cleaned);
    return cleaned;
  }

  const fallback = 'Genel Onarım & Servis';
  expenseCache.set(rawKey, fallback);
  return fallback;
}

// Clean and parse currency/KM/numbers robustly
export function parseCleanNumber(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  let str = String(val).trim();
  if (!str) return 0;

  // Remove currency, KM units, and other symbols
  str = str.replace(/[₺$€TLtl\s]/g, '').replace(/km|KM|Km|k\.m\./gi, '').trim();
  if (!str) return 0;

  // Pure integer without punctuation
  if (/^-?\d+$/.test(str)) {
    return parseInt(str, 10) || 0;
  }

  // Handle Turkish decimal and thousand formatting
  if (str.includes(',') && str.includes('.')) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      // Turkish format: 120.000,50 -> 120000.50
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // English format: 120,000.50 -> 120000.50
      str = str.replace(/,/g, '');
    }
  } else if (str.includes('.')) {
    // Only dot present (e.g. "120.000", "84.500", "1.250.000" vs "120.5" or "12.34")
    // If dot is followed by 3 digits (or multiple groups of 3 digits), it's a thousand separator
    if (/\.\d{3}$/.test(str) || /\.\d{3}\.\d{3}$/.test(str)) {
      str = str.replace(/\./g, '');
    } else {
      // Standard decimal e.g. "12.5" or "12.50"
    }
  } else if (str.includes(',')) {
    // Only comma present
    if (/,\d{3}$/.test(str)) {
      // English thousand separator: "120,000" -> "120000"
      str = str.replace(/,/g, '');
    } else {
      // Turkish decimal separator: "1234,56" -> "1234.56"
      str = str.replace(',', '.');
    }
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

const plateCache = new Map<string, string>();

// Clean and normalize License Plate
export function normalizePlate(rawPlate: any): string {
  if (!rawPlate) return 'PLAKA-YOK';
  const str = typeof rawPlate === 'string' ? rawPlate.trim() : String(rawPlate).trim();
  if (!str) return 'PLAKA-YOK';

  const cached = plateCache.get(str);
  if (cached) return cached;

  const normalized = str
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim() || 'PLAKA-YOK';

  plateCache.set(str, normalized);
  return normalized;
}

/**
 * Checks if a record represents labor, workmanship, or service fee.
 * Turkish automotive invoices frequently classify everything non-Bosch as "DİĞER Y.P.",
 * even when the line description is clearly "Periyodik Bakım İşçiliği", "Rot Balans", "Mekanik İşçilik" etc.
 */
export function isLaborServiceItem(
  description: string = '',
  expenseType: string = '',
  rawYP: string = ''
): boolean {
  const desc = (description || '').toLowerCase();
  const exp = (expenseType || '').toLowerCase();
  const yp = (rawYP || '').toLowerCase();
  const combined = `${desc} ${exp} ${yp}`;

  // 1. Direct Turkish labor & workmanship terms
  const directLaborTerms = [
    'işçilik', 'işcilik', 'iscilik', 'isclik', 'isçilik',
    'işçiliği', 'isciligi', 'işciligi', 'isçiligi',
    'işçilikleri', 'iscilikleri', 'işçilikler',
    'işçilik bedeli', 'işçilik tutarı', 'işçilik ücreti', 'işçilik payı', 'işçilik bedelleri',
    'ustalık', 'usta payı', 'usta bedeli', 'servis işçiliği', 'bakım işçiliği', 'onarım işçiliği',
    'labor', 'workmanship', 'service fee', 'labor fee'
  ];

  for (let i = 0; i < directLaborTerms.length; i++) {
    if (combined.includes(directLaborTerms[i])) {
      return true;
    }
  }

  // 2. Specific Service, Action, Assembly, Geometry and Diagnosis Phrases
  const serviceActionPhrases = [
    'sökme takma', 'sökme-takma', 'sökme ve takma', 'sökme montaj', 'sökülüp takılması',
    'montaj bedeli', 'montaj ücreti', 'montaj işçilik', 'montaj & demontaj', 'demontaj',
    'değişim işçiliği', 'değişimi işçilik', 'değişim ücreti', 'yenileme işçiliği',
    'rot balans', 'rot-balans', 'rot ayarı', 'rot ayar', 'balans ayarı', 'ön düzen ayarı', 'ön takım ayarı',
    'far ayarı', 'far yükseklik ayarı', 'fren ayarı', 'el freni ayarı', 'debriyaj ayarı',
    'arıza tespiti', 'arıza teşhis', 'arıza arama', 'bilgisayarlı arıza tespiti', 'diyagnoz', 'diyagnostik', 'diagnostic',
    'arıza tespit ücreti', 'test ve kontrol', 'ekspertiz', 'expertiz', 'check-up', 'check up', 'checkup',
    'muayene hazırlık', 'ön muayene', 'yol testi', 'test sürüşü', 'araç kabul kontrolü',
    'torna', 'tornalama', 'disk taşlama', 'silindir kapak taşlama', 'kapak taşlama', 'supap taşlama', 'supap ayarı',
    'şanzıman indirme', 'motor indirme', 'motor revizyon işçilik', 'enjektör ayar', 'pompa ayar',
    'kaporta düzeltme', 'göçük düzeltme', 'boyasız göçük', 'pdr onarım', 'fırın boya', 'lokal boya', 'pasta cila', 'pasta-cila',
    'klima gaz dolumu', 'klima gaz basma', 'klima kaçak testi', 'klima gaz dolum', 'gaz dolumu işçilik',
    'oto yıkama', 'iç dış yıkama', 'detaylı temizlik', 'motor yıkama', 'dezenfeksiyon', 'koltuk temizleme',
    'çekici hizmeti', 'çekici bedeli', 'kurtarıcı bedeli', 'yol yardım bedeli',
    'kaynak işçiliği', 'pres işçiliği', 'tamir işçiliği'
  ];

  for (let i = 0; i < serviceActionPhrases.length; i++) {
    if (combined.includes(serviceActionPhrases[i])) {
      return true;
    }
  }

  // 3. If rawYP or expenseType explicitly indicates labor
  if (yp === 'işçilik' || yp === 'iscilik' || yp === 'hizmet' || yp === 'labor' || exp === 'işçilik' || exp === 'iscilik') {
    return true;
  }

  return false;
}

/**
 * Checks if a record represents fluids, oils, chemicals, or additives.
 */
export function isFluidOrChemicalItem(
  description: string = '',
  expenseType: string = '',
  rawYP: string = ''
): boolean {
  const desc = (description || '').toLowerCase();
  const exp = (expenseType || '').toLowerCase();
  const yp = (rawYP || '').toLowerCase();
  const combined = `${desc} ${exp} ${yp}`;

  const fluidKeywords = [
    'motor yağı', 'motor yagi', 'motor yaği', 'motor yag', 'sentetik yağ',
    '5w30', '5w-30', '5w40', '5w-40', '0w30', '0w-30', '0w20', '0w-20', '10w40', '10w-40', '15w40',
    'antifriz', 'antifreeze', 'adblue', 'ad blue', 'cam suyu', 'fren hidroliği', 'fren hidrolik',
    'şanzıman yağı', 'sanziman yagi', 'direksiyon hidroliği', 'direksiyon yağı', 'diferansiyel yağı',
    'radyatör antifrizi', 'soğutma sıvısı', 'balata spreyi', 'sıvı gres', 'pas sökücü',
    'enjektör temizleyici', 'motor içi temizleyici', 'dpf temizleme', 'radyatör temizleyici', 'katkı'
  ];

  for (let i = 0; i < fluidKeywords.length; i++) {
    if (combined.includes(fluidKeywords[i])) {
      return true;
    }
  }

  if (
    yp.includes('sıvı') || 
    yp.includes('sivi') || 
    yp.includes('kimyasal') || 
    yp.includes('yağ') || 
    yp.includes('yag') || 
    yp.includes('adblue') || 
    yp.includes('antifriz')
  ) {
    return true;
  }

  return false;
}

export function classifySparePartOrigin(
  rawYP: any,
  expenseType: string,
  description: string,
  supplier: string = ''
): { origin: SparePartOriginType; label: string; wasReclassifiedFromOtherYP?: boolean } {
  const ypStr = String(rawYP || '').trim().toLowerCase();
  const descStr = String(description || '').trim().toLowerCase();
  const expStr = String(expenseType || '').trim().toLowerCase();
  const supStr = String(supplier || '').trim().toLowerCase();

  const rawSaysOtherYP = Boolean(
    ypStr && (
      ypStr.includes('diğer') || 
      ypStr.includes('diger') || 
      ypStr.includes('yan sanayi') || 
      ypStr.includes('muadil') || 
      ypStr.includes('eşdeğer') || 
      ypStr.includes('esdeger') ||
      ypStr.includes('oe') ||
      ypStr.includes('y.p') ||
      ypStr.includes('yp') ||
      ypStr.includes('parça') ||
      ypStr.includes('parca')
    )
  );

  // 1. CRITICAL: LABOR / WORKMANSHIP CHECK (Overrides any generic "DİĞER Y.P." / "Y.P." column text)
  if (isLaborServiceItem(descStr, expStr, ypStr)) {
    return { 
      origin: 'ISCILIK', 
      label: 'İşçilik & Servis Hizmeti',
      wasReclassifiedFromOtherYP: rawSaysOtherYP
    };
  }

  // 2. FLUIDS & CHEMICALS CHECK (Overrides generic "DİĞER Y.P." column text)
  if (isFluidOrChemicalItem(descStr, expStr, ypStr)) {
    return { 
      origin: 'SIVILAR_KIMYASAL', 
      label: 'Sıvılar & Kimyasallar (Motor Yağı vb.)',
      wasReclassifiedFromOtherYP: rawSaysOtherYP
    };
  }

  // 3. EXPLICIT BOSCH ORIGIN
  if (
    ypStr.includes('bosch') ||
    descStr.includes('bosch') || 
    (supStr.includes('bosch') && (
      descStr.includes('balata') || 
      descStr.includes('filtre') || 
      descStr.includes('buji') || 
      descStr.includes('akü') || 
      descStr.includes('silecek') ||
      descStr.includes('enjektör')
    ))
  ) {
    return { origin: 'BOSCH', label: 'Bosch Orijinal / Eşdeğer Y.P.' };
  }

  // 4. DIĞER YEDEK PARÇA (Genuine Non-Bosch Mechanical / Wear Parts)
  if (
    rawSaysOtherYP ||
    expStr.includes('fren') || 
    expStr.includes('filtre') || 
    expStr.includes('mekanik') || 
    expStr.includes('debriyaj') || 
    expStr.includes('akü') || 
    expStr.includes('lastik') || 
    expStr.includes('motor') ||
    expStr.includes('aydınlatma') ||
    descStr.includes('balata') || 
    descStr.includes('disk') || 
    descStr.includes('filtre') || 
    descStr.includes('debriyaj') || 
    descStr.includes('volan') ||
    descStr.includes('volant') ||
    descStr.includes('triger') || 
    descStr.includes('amortisör') || 
    descStr.includes('salıncak') || 
    descStr.includes('rotil') || 
    descStr.includes('rot başı') || 
    descStr.includes('z rot') || 
    descStr.includes('buji') || 
    descStr.includes('kayış') ||
    descStr.includes('silecek') ||
    descStr.includes('rulman') ||
    descStr.includes('porya') ||
    descStr.includes('sensör') ||
    descStr.includes('termostat') ||
    descStr.includes('devirdaim') ||
    descStr.includes('pompa') ||
    descStr.includes('radyatör') ||
    descStr.includes('ampul') ||
    descStr.includes('lamba') ||
    descStr.includes('keçe') ||
    descStr.includes('kece') ||
    descStr.includes('conta') ||
    descStr.includes('kasnak')
  ) {
    return { origin: 'DIGER_YP', label: 'Diğer Y.P. (Bosch Olmayan)' };
  }

  return { origin: 'DIGER', label: 'Diğer / Çeşitli Masraflar' };
}

function resolveFieldKey(
  sampleKeys: string[],
  mappedKey: string | undefined,
  aliases: string[]
): string | null {
  if (mappedKey && sampleKeys.includes(mappedKey)) {
    return mappedKey;
  }
  for (let i = 0; i < aliases.length; i++) {
    const alias = aliases[i];
    if (sampleKeys.includes(alias)) {
      return alias;
    }
  }
  const cleanAliases = aliases.map(a => a.toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, ''));
  for (let k = 0; k < sampleKeys.length; k++) {
    const cleanKey = sampleKeys[k].toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, '');
    for (let a = 0; a < cleanAliases.length; a++) {
      if (cleanKey === cleanAliases[a]) {
        return sampleKeys[k];
      }
    }
  }
  return null;
}

export function normalizeFleetRecords(
  rawRecords: RawFleetRecord[],
  mapping: ColumnMapping,
  catalog?: PartCatalogItem[]
): NormalizedFleetRecord[] {
  if (!rawRecords || rawRecords.length === 0) return [];
  const currentYear = new Date().getFullYear();

  // Find sample keys from the first available record to pre-resolve all column keys ONCE
  const sampleKeys = Object.keys(rawRecords[0] || {});

  const plateKey = resolveFieldKey(sampleKeys, mapping.plate, ['PLAKA', 'Plaka', 'plate', 'Licence Plate', 'ARAC_PLAKA']);
  const brandKey = resolveFieldKey(sampleKeys, mapping.brand, ['MARKA', 'Marka', 'brand', 'Make', 'ARAC_MARKA']);
  const modelKey = resolveFieldKey(sampleKeys, mapping.model, ['MODEL', 'Model', 'model', 'ARAC_MODEL']);
  const modelYearKey = resolveFieldKey(sampleKeys, mapping.modelYear, ['MODEL YILI', 'Model Yılı', 'MODEL YI', 'MODEL_YILI', 'YIL', 'Model Year', 'YEAR']);
  const kmKey = resolveFieldKey(sampleKeys, mapping.km, ['KİLOMETRE', 'Kilometre', 'KILOMETRE', 'KM', 'Km', 'km', 'K.M.', 'Odo', 'Odometer', 'SON_KM', 'ARAC_KM']);
  const supplierKey = resolveFieldKey(sampleKeys, mapping.supplier, ['SERVİS İSMİ', 'Servis İsmi', 'SERVIS ISMI', 'SERVİS ADI', 'Servis Adı', 'SERVIS', 'Servis', 'TEDARIKCI', 'Supplier']);
  const expenseTypeKey = resolveFieldKey(sampleKeys, mapping.expenseType, ['HİZMET ADI', 'Hizmet Adı', 'HIZMET ADI', 'EXPENSE_TYPE', 'HIZMET TÜRÜ', 'Hizmet Türü', 'Gider Türü']);
  const fleetGroupKey = resolveFieldKey(sampleKeys, mapping.fleetGroup, ['FİRMA', 'Firma', 'FIRMA', 'FILO', 'Filo', 'BOLGE', 'Fleet', 'Müşteri']);
  const sparePartTypeKey = resolveFieldKey(sampleKeys, mapping.sparePartType, ['Y.P', 'Y.P.', 'YP', 'y.p', 'Yedek Parça', 'PARCA_TURU', 'Parça Menşei']);
  const totalPriceKey = resolveFieldKey(sampleKeys, mapping.totalPrice, ['TUTAR (KDV HARİÇ)', 'TUTAR (KDV HARIC)', 'TUTAR', 'Tutar', 'TOTAL PRICE', 'Toplam Tutar', 'Maliyet', 'Cost']);
  const unitPriceKey = resolveFieldKey(sampleKeys, mapping.unitPrice, ['BIRIM FIYAT', 'Birim Fiyat', 'Unit Price']);
  const quantityKey = resolveFieldKey(sampleKeys, mapping.quantity, ['QTY', 'Qty', 'ADET', 'Miktar', 'Adet']);
  const dateKey = resolveFieldKey(sampleKeys, mapping.date, ['TALEP TARİHİ', 'Talep Tarihi', 'TALEP TARIHI', 'FATURA TARIHI', 'Fatura Tarihi', 'TARIH', 'Tarih', 'Date']);
  const descriptionKey = resolveFieldKey(sampleKeys, mapping.description, ['HİZMET ADI', 'Hizmet Adı', 'HIZMET ADI', 'DESCRIPTI', 'ACIKLAMA', 'Açıklama', 'Description']);

  const count = rawRecords.length;
  const result = new Array<NormalizedFleetRecord>(count);

  for (let index = 0; index < count; index++) {
    const raw = rawRecords[index];
    const rawPlate = plateKey ? raw[plateKey] : '';
    const rawBrand = brandKey ? raw[brandKey] : '';
    const rawModel = modelKey ? raw[modelKey] : '';
    const rawModelYear = modelYearKey ? raw[modelYearKey] : '';
    const rawKm = kmKey ? raw[kmKey] : '';
    const rawSupplier = supplierKey ? raw[supplierKey] : '';
    const rawExpenseType = expenseTypeKey ? raw[expenseTypeKey] : '';
    const rawFleetGroup = fleetGroupKey ? raw[fleetGroupKey] : '';
    const rawSparePartType = sparePartTypeKey ? raw[sparePartTypeKey] : '';
    const rawTotalPrice = totalPriceKey ? raw[totalPriceKey] : '';
    const rawUnitPrice = unitPriceKey ? raw[unitPriceKey] : '';
    const rawQuantity = quantityKey ? raw[quantityKey] : '';
    const rawDate = dateKey ? raw[dateKey] : '';
    const rawDescription = descriptionKey ? raw[descriptionKey] : '';

    // Clean Plate
    const plate = normalizePlate(rawPlate);

    // Clean Brand
    const { brand, wasCorrected, original } = normalizeBrand(rawBrand);

    // Clean Model
    const model = String(rawModel || 'Bilinmiyor').trim();

    // Clean Model Year & Age
    let modelYear = Math.round(parseCleanNumber(rawModelYear));
    if (modelYear === 0) {
      modelYear = currentYear - 4; // realistic fallback
    }
    const age = Math.max(0, currentYear - modelYear);

    // Clean KM
    const km = Math.round(parseCleanNumber(rawKm));

    // Clean Supplier
    const supplier = String(rawSupplier || 'Genel Servis').trim() || 'Genel Servis';

    // Clean Description
    const description = String(rawDescription || '').trim();

    // Clean Expense Type
    const expenseType = normalizeExpenseType(rawExpenseType, description);

    // Clean Fleet Group
    const fleetGroup = String(rawFleetGroup || 'Genel Filo').trim() || 'Genel Filo';

    // Clean Y.P. (Spare Part Type & Origin)
    const sparePartTypeStr = String(rawSparePartType || '').trim();
    const { origin: sparePartOrigin, label: sparePartOriginLabel, wasReclassifiedFromOtherYP } = classifySparePartOrigin(
      sparePartTypeStr,
      expenseType,
      description,
      supplier
    );

    // Clean Price / Cost
    let totalPrice = parseCleanNumber(rawTotalPrice);
    if (totalPrice === 0 && rawUnitPrice) {
      const unitPrice = parseCleanNumber(rawUnitPrice);
      const qty = parseCleanNumber(rawQuantity) || 1;
      totalPrice = unitPrice * qty;
    }

    // Clean Date
    const date = String(rawDate || new Date().toISOString().split('T')[0]).trim();

    result[index] = {
      id: `fleet-rec-${index + 1}`,
      rowNumber: index + 2,
      plate,
      brand,
      originalBrand: original,
      model,
      modelYear,
      age,
      km,
      supplier,
      expenseType,
      fleetGroup,
      sparePartType: sparePartTypeStr || undefined,
      sparePartOrigin,
      sparePartOriginLabel,
      wasReclassifiedFromOtherYP,
      cleanPartName: getCleanPartName(description, expenseType, catalog),
      totalPrice,
      date,
      description,
      anomalies: [],
      isOutlier: false,
    };
  }

  return result;
}

/**
 * Asynchronous chunked normalization for large datasets to keep the main thread fluid.
 */
export async function normalizeFleetRecordsAsync(
  rawRecords: RawFleetRecord[],
  mapping: ColumnMapping,
  onProgress?: (percent: number, current: number, total: number) => void,
  catalog?: PartCatalogItem[]
): Promise<NormalizedFleetRecord[]> {
  const total = rawRecords.length;
  if (total === 0) return [];
  if (total < 2500) {
    return normalizeFleetRecords(rawRecords, mapping, catalog);
  }

  const chunkSize = 10000;
  const normalized: NormalizedFleetRecord[] = [];

  for (let i = 0; i < total; i += chunkSize) {
    const chunk = rawRecords.slice(i, i + chunkSize);
    const normalizedChunk = normalizeFleetRecords(chunk, mapping, catalog);
    // Correct IDs & row numbers for global offset and push directly
    for (let j = 0; j < normalizedChunk.length; j++) {
      const item = normalizedChunk[j];
      item.id = `fleet-rec-${i + j + 1}`;
      item.rowNumber = i + j + 2;
      normalized.push(item);
    }

    const percent = Math.min(100, Math.round(((i + chunk.length) / total) * 100));
    onProgress?.(percent, i + chunk.length, total);

    // Yield to browser event loop
    await new Promise(r => setTimeout(r, 0));
  }

  return normalized;
}
