import { ColumnMapping } from '../types';

// Field labels and descriptions for mapping UI
export const FIELD_LABELS: Record<keyof ColumnMapping, { label: string; description: string; required: boolean }> = {
  plate: { label: 'PLAKA', description: 'Araç plakası (Örn: 34 ABC 123)', required: true },
  brand: { label: 'MARKA', description: 'Araç üretici markası (Renault, Fiat, Ford vb.)', required: true },
  model: { label: 'MODEL', description: 'Araç model adı (Megane, Egea, Transit vb.)', required: false },
  modelYear: { label: 'MODEL YILI', description: 'Araç üretim / model yılı (Örn: 2020, 2022)', required: true },
  km: { label: 'KİLOMETRE', description: 'İşlem anındaki sayaç kilometresi', required: true },
  supplier: { label: 'SERVİS İSMİ', description: 'Bakım ve servis hizmetini veren nokta', required: false },
  expenseType: { label: 'HİZMET ADI / TÜRÜ', description: 'Yapılan işlem / servis türü (Hizmet Adı)', required: false },
  fleetGroup: { label: 'FİRMA (Yedek Parça Filosu)', description: 'Firma / Filo grubu (Yedek parça filosu)', required: false },
  sparePartType: { label: 'Y.P (Yedek Parça Menşei)', description: 'Yedek parça türü: Bosch, Diğer Y.P., Sıvılar/Yağ veya İşçilik', required: false },
  totalPrice: { label: 'TUTAR (KDV HARİÇ)', description: 'İşlem tutarı / KDV hariç fatura bedeli (₺)', required: true },
  unitPrice: { label: 'Birim Fiyat (Opsiyonel)', description: 'Adet başına birim fiyat', required: false },
  quantity: { label: 'QTY / Miktar (Opsiyonel)', description: 'İşlem adedi / parça adeti', required: false },
  date: { label: 'TALEP TARİHİ / Fatura Tarihi', description: 'Talep tarihi veya fatura tarihi', required: false },
  description: { label: 'HİZMET ADI / İşlem Açıklaması', description: 'Yapılan işlem veya değişen parça detayı', required: false },
};

// Patterns for auto detection prioritized by exact user headers
const DETECTION_PATTERNS: Record<keyof ColumnMapping, RegExp[]> = {
  plate: [
    /^plaka$/i, 
    /plaka/i, 
    /plate/i, 
    /arac.*no/i, 
    /vehicle.*id/i, 
    /^plk$/i
  ],
  brand: [
    /^marka$/i, 
    /marka/i, 
    /brand/i, 
    /make/i, 
    /manufacturer/i
  ],
  model: [
    /^model$/i, 
    /model(?!\s*y[ıi]l)/i, 
    /arac.*model/i, 
    /vehicle.*model/i, 
    /tip/i, 
    /versiyon/i
  ],
  modelYear: [
    /^model\s*y[ıi]l[ıi]?$/i, 
    /model.*y[ıi]/i, 
    /y[ıi]l/i, 
    /year/i, 
    /my/i, 
    /model_year/i
  ],
  km: [
    /^k[ıiİI]lometre$/i, 
    /k[ıiİI]lometre/i, 
    /^km$/i, 
    /^k\.m\.?$/i,
    /ara[çc]\s*km/i,
    /son\s*km/i,
    /odo/i, 
    /odometer/i, 
    /sayac/i
  ],
  supplier: [
    /^serv[ıi]s\s*[ıi]sm[ıi]$/i, 
    /^serv[ıi]s\s*ad[ıi]?$/i, 
    /serv[ıi]s\s*[ıi]sm[ıi]/i, 
    /serv[ıi]s\s*ad[ıi]/i,
    /tedar[ıi]k[çc][ıi]\s*ad[ıi]?/i,
    /supplier\s*name/i,
    /vendor\s*name/i,
    /^serv[ıi]s$/i,
    /tedar[ıi]k/i, 
    /bay[ıi]/i, 
    /usta/i
  ],
  expenseType: [
    /^h[ıi]zmet\s*ad[ıi]?$/i, 
    /h[ıi]zmet\s*ad[ıi]/i, 
    /h[ıi]zmet.*t[uü]r/i, 
    /expense.*type/i, 
    /g[ıi]der.*t[ıi]p/i, 
    /kategor[ıi]/i, 
    /category/i, 
    /[ıi]slem.*t[uü]r/i, 
    /masraf/i
  ],
  fleetGroup: [
    /^f[ıi]rma$/i, 
    /f[ıi]rma\s*ad[ıi]?/i,
    /^f[ıi]lo$/i, 
    /f[ıi]lo\s*ad[ıi]?/i,
    /cr.*kod/i, 
    /b[oö]lge/i, 
    /departman/i, 
    /cost.*center/i, 
    /fleet/i
  ],
  sparePartType: [
    /^y\.?\s*p\.?$/i, 
    /y\.?\s*p/i, 
    /yedek.*par[çc]a/i, 
    /par[çc]a.*t[üu]r/i, 
    /par[çc]a.*men[şs]e/i, 
    /yp.*t[üu]r/i, 
    /par[çc]a.*tip/i, 
    /par[çc]a.*marka/i, 
    /parca.*turu/i
  ],
  totalPrice: [
    /^tutar\s*\(?kdv\s*har[ıi][çc]\)?$/i, 
    /tutar.*kdv.*har[ıi][çc]/i, 
    /kdv.*har[ıi][çc]/i, 
    /^tutar$/i, 
    /total.*price/i, 
    /toplam.*tutar/i, 
    /tutar/i, 
    /mal[ıi]yet/i, 
    /cost/i, 
    /net.*tutar/i, 
    /fatura.*tutar/i, 
    /price/i, 
    /amount/i
  ],
  unitPrice: [
    /un[ıi]t.*pr[ıi]ce/i, 
    /b[ıi]r[ıi]m.*f[ıi]yat/i, 
    /b[ıi]r[ıi]m.*tutar/i
  ],
  quantity: [
    /^qty$/i, 
    /qty/i, 
    /adet/i, 
    /m[ıi]ktar/i, 
    /quant[ıi]ty/i
  ],
  date: [
    /^talep\s*tar[ıi]h[ıi]?$/i, 
    /talep\s*tar[ıi]h/i, 
    /^fatura\s*tar[ıi]h[ıi]?$/i, 
    /fatura\s*tar[ıi]h/i, 
    /tar[ıi]h/i, 
    /date/i, 
    /[ıi]slem.*tar[ıi]h/i
  ],
  description: [
    /^h[ıi]zmet\s*ad[ıi]?$/i, 
    /h[ıi]zmet\s*ad/i, 
    /part.*group/i, 
    /parca.*grup/i, 
    /descript/i, 
    /ac[ıi]klama/i, 
    /[ıi]slem.*detay/i, 
    /yap[ıi]lan.*[ıi]slem/i, 
    /parca/i
  ],
};

export function autoDetectColumns(availableHeaders: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    plate: '',
    brand: '',
    model: '',
    modelYear: '',
    km: '',
    supplier: '',
    expenseType: '',
    fleetGroup: '',
    sparePartType: '',
    totalPrice: '',
    unitPrice: '',
    quantity: '',
    date: '',
    description: '',
  };

  const usedHeaders = new Set<string>();

  // 1. Pattern-based matching (Strict & exact matching first)
  for (const [field, patterns] of Object.entries(DETECTION_PATTERNS) as [keyof ColumnMapping, RegExp[]][]) {
    for (const header of availableHeaders) {
      if (usedHeaders.has(header)) continue;

      const matched = patterns.some(pattern => pattern.test(header.trim()));
      if (matched) {
        mapping[field] = header;
        usedHeaders.add(header);
        break;
      }
    }
  }

  // 2. Excel Column Letter Fallbacks based on exact user layout
  // Column L (12th column, index 11): SERVİS İSMİ
  if (!mapping.supplier && availableHeaders.length >= 12) {
    const colL = availableHeaders.find((h, idx) => h.trim().toUpperCase() === 'L' || idx === 11);
    if (colL && !usedHeaders.has(colL)) {
      mapping.supplier = colL;
      usedHeaders.add(colL);
    }
  }

  // Column K (11th column, index 10): FİRMA (Yedek Parça Filosu)
  if (!mapping.fleetGroup && availableHeaders.length >= 11) {
    const colK = availableHeaders.find((h, idx) => h.trim().toUpperCase() === 'K' || idx === 10);
    if (colK && !usedHeaders.has(colK)) {
      mapping.fleetGroup = colK;
      usedHeaders.add(colK);
    }
  }

  // Column J (10th column, index 9): Y.P (Yedek Parça Menşei)
  if (!mapping.sparePartType && availableHeaders.length >= 10) {
    const colJ = availableHeaders.find((h, idx) => h.trim().toUpperCase() === 'J' || idx === 9);
    if (colJ && !usedHeaders.has(colJ)) {
      mapping.sparePartType = colJ;
      usedHeaders.add(colJ);
    }
  }

  // Column I (9th column, index 8): TUTAR (KDV HARİÇ)
  if (!mapping.totalPrice && availableHeaders.length >= 9) {
    const colI = availableHeaders.find((h, idx) => h.trim().toUpperCase() === 'I' || idx === 8);
    if (colI && !usedHeaders.has(colI)) {
      mapping.totalPrice = colI;
      usedHeaders.add(colI);
    }
  }

  // Column O (15th column, index 14): PLAKA
  if (!mapping.plate && availableHeaders.length >= 15) {
    const colO = availableHeaders.find((h, idx) => h.trim().toUpperCase() === 'O' || idx === 14);
    if (colO && !usedHeaders.has(colO)) {
      mapping.plate = colO;
      usedHeaders.add(colO);
    }
  }

  // Column P (16th column, index 15): KİLOMETRE
  if (!mapping.km && availableHeaders.length >= 16) {
    const colP = availableHeaders.find((h, idx) => h.trim().toUpperCase() === 'P' || idx === 15);
    if (colP && !usedHeaders.has(colP)) {
      mapping.km = colP;
      usedHeaders.add(colP);
    }
  }

  // Column Q (17th column, index 16): MARKA
  if (!mapping.brand && availableHeaders.length >= 17) {
    const colQ = availableHeaders.find((h, idx) => h.trim().toUpperCase() === 'Q' || idx === 16);
    if (colQ && !usedHeaders.has(colQ)) {
      mapping.brand = colQ;
      usedHeaders.add(colQ);
    }
  }

  // Column R (18th column, index 17): MODEL
  if (!mapping.model && availableHeaders.length >= 18) {
    const colR = availableHeaders.find((h, idx) => h.trim().toUpperCase() === 'R' || idx === 17);
    if (colR && !usedHeaders.has(colR)) {
      mapping.model = colR;
      usedHeaders.add(colR);
    }
  }

  // Column S (19th column, index 18): MODEL YILI
  if (!mapping.modelYear && availableHeaders.length >= 19) {
    const colS = availableHeaders.find((h, idx) => h.trim().toUpperCase() === 'S' || idx === 18);
    if (colS && !usedHeaders.has(colS)) {
      mapping.modelYear = colS;
      usedHeaders.add(colS);
    }
  }

  return mapping;
}

export const autoDetectMapping = autoDetectColumns;
