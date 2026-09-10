import {
  AgeSegmentStat,
  BrandStat,
  CrossTabMatrix,
  EngineIssueStat,
  ExpenseTypeStat,
  FleetGroupStat,
  FleetRecommendation,
  FleetSummaryMetrics,
  KmSegmentStat,
  NormalizedFleetRecord,
  ParetoItem,
  RiskLevel,
  StrategicAction,
  SupplierStat,
  SupplierServedPlate,
  VehicleRiskRecord,
  VehicleServiceBreakdown,
  VehicleSpendStat,
} from '../types';

export interface AnalyticsResult {
  summary: FleetSummaryMetrics;
  brandStats: BrandStat[];
  engineIssueStats: EngineIssueStat[];
  supplierStats: SupplierStat[];
  fleetStats: FleetGroupStat[];
  vehicleSpendStats: VehicleSpendStat[];
  expenseTypeStats: ExpenseTypeStat[];
  kmSegmentStats: KmSegmentStat[];
  kmStats: KmSegmentStat[];
  ageSegmentStats: AgeSegmentStat[];
  ageStats: AgeSegmentStat[];
  paretoBrands: ParetoItem[];
  paretoSuppliers: ParetoItem[];
  paretoExpenseTypes: ParetoItem[];
  paretoFleets: ParetoItem[];
  riskRecords: VehicleRiskRecord[];
  brandExpenseMatrix: CrossTabMatrix;
  supplierBrandMatrix: CrossTabMatrix;
  crossTabs: {
    brandByExpense: CrossTabMatrix;
    fleetByBrand: CrossTabMatrix;
    supplierByBrand: CrossTabMatrix;
    supplierByExpense: CrossTabMatrix;
    yearByKmSegment: CrossTabMatrix;
  };
  strategicRoadmap: StrategicAction[];
}

// ==========================================
// MOTOR VE ARAÇ TİPİ ARIZA & KRONİK SORUN ANALİZİ HELPERLARI
// ==========================================
export function detectEngineAndFuelType(brand: string, model: string, description: string = ''): {
  engineType: string;
  fuelType: string;
  normalizedModel: string;
} {
  const combined = `${brand || ''} ${model || ''} ${description || ''}`.toLowerCase();
  const brandUpper = (brand || '').toUpperCase().trim();
  const modelUpper = (model || '').toUpperCase().trim();

  // 1. Fiat
  if (brandUpper.includes('FIAT') || brandUpper.includes('TOFAŞ') || brandUpper.includes('TOFAS')) {
    if (combined.includes('1.3') || combined.includes('multijet') || combined.includes('mjet') || combined.includes('mj') || modelUpper.includes('FIORINO')) {
      return { engineType: '1.3 MultiJet (95 HP Dizel)', fuelType: 'Dizel', normalizedModel: modelUpper || 'Egea / Fiorino' };
    }
    if (combined.includes('1.6') || combined.includes('1.6 mjet') || combined.includes('e-torq') || modelUpper.includes('DOBLO')) {
      return { engineType: '1.6 MultiJet (120/130 HP Dizel)', fuelType: 'Dizel', normalizedModel: modelUpper || 'Egea / Doblo' };
    }
    if (combined.includes('1.4') || combined.includes('fire') || combined.includes('t-jet')) {
      return { engineType: '1.4 Fire (95 HP Atmosferik)', fuelType: 'Benzin / LPG', normalizedModel: modelUpper || 'Egea Sedan' };
    }
    if (combined.includes('1.5') || combined.includes('hybrid')) {
      return { engineType: '1.5 T4 Hibrit (130 HP)', fuelType: 'Hibrit', normalizedModel: modelUpper || 'Egea Cross' };
    }
    if (modelUpper.includes('DUCATO')) return { engineType: '2.3 MultiJet (140 HP Dizel)', fuelType: 'Dizel', normalizedModel: 'Ducato' };
    return { engineType: '1.3 / 1.6 MultiJet Dizel', fuelType: 'Dizel', normalizedModel: modelUpper || 'Egea' };
  }

  // 2. Renault / Dacia
  if (brandUpper.includes('RENAULT') || brandUpper.includes('DACIA')) {
    if (combined.includes('1.5') || combined.includes('dci') || combined.includes('blue dci') || combined.includes('k9k')) {
      return { engineType: '1.5 dCi / Blue dCi (115 HP Dizel)', fuelType: 'Dizel', normalizedModel: modelUpper || 'Megane / Clio' };
    }
    if (combined.includes('1.3') || combined.includes('1.3 tce')) {
      return { engineType: '1.3 TCe Turbo (140 HP Benzin)', fuelType: 'Benzin', normalizedModel: modelUpper || 'Megane / Duster' };
    }
    if (combined.includes('0.9') || combined.includes('1.0') || combined.includes('tce') || combined.includes('sce')) {
      return { engineType: '1.0 TCe / SCe (90/100 HP)', fuelType: 'Benzin / LPG', normalizedModel: modelUpper || 'Clio / Sandero' };
    }
    if (modelUpper.includes('TRAFIC') || modelUpper.includes('MASTER')) {
      return { engineType: '2.0 / 2.3 dCi Ağır Hizmet Dizel', fuelType: 'Dizel', normalizedModel: modelUpper };
    }
    return { engineType: '1.5 dCi Dizel', fuelType: 'Dizel', normalizedModel: modelUpper || 'Megane' };
  }

  // 3. Ford
  if (brandUpper.includes('FORD')) {
    if (combined.includes('1.5') || combined.includes('ecoblue') || combined.includes('tdci') || combined.includes('1.6 tdci') || modelUpper.includes('COURIER') || modelUpper.includes('FOCUS')) {
      return { engineType: '1.5 EcoBlue / TDCi (120 HP Dizel)', fuelType: 'Dizel', normalizedModel: modelUpper || 'Focus / Courier' };
    }
    if (combined.includes('2.0') || modelUpper.includes('TRANSIT') || modelUpper.includes('CUSTOM')) {
      return { engineType: '2.0 EcoBlue (130/170 HP Dizel)', fuelType: 'Dizel', normalizedModel: modelUpper || 'Transit / Custom' };
    }
    if (combined.includes('1.0') || combined.includes('ecoboost')) {
      return { engineType: '1.0 EcoBoost (125 HP Benzin)', fuelType: 'Benzin', normalizedModel: modelUpper || 'Focus / Puma' };
    }
    return { engineType: '1.5 / 2.0 EcoBlue TDCi Dizel', fuelType: 'Dizel', normalizedModel: modelUpper || 'Focus / Transit' };
  }

  // 4. Volkswagen / Skoda / Seat / Audi
  if (brandUpper.includes('VOLKSWAGEN') || brandUpper.includes('VW') || brandUpper.includes('SKODA') || brandUpper.includes('SEAT') || brandUpper.includes('AUDI')) {
    if (combined.includes('2.0') || combined.includes('2.0 tdi') || modelUpper.includes('CRAFTER') || modelUpper.includes('TRANSPORTER')) {
      return { engineType: '2.0 TDI CR (150/177 HP Dizel)', fuelType: 'Dizel', normalizedModel: modelUpper || 'Passat / Crafter' };
    }
    if (combined.includes('1.6') || combined.includes('1.6 tdi') || combined.includes('tdi')) {
      return { engineType: '1.6 TDI CR (115/120 HP Dizel)', fuelType: 'Dizel', normalizedModel: modelUpper || 'Passat / Golf / Octavia' };
    }
    if (combined.includes('1.0') || combined.includes('1.5') || combined.includes('tsi') || combined.includes('tfsi')) {
      return { engineType: '1.0 / 1.5 TSI ACT (150 HP Benzin)', fuelType: 'Benzin', normalizedModel: modelUpper || 'Golf / Superb' };
    }
    return { engineType: '1.6 / 2.0 TDI Dizel', fuelType: 'Dizel', normalizedModel: modelUpper || 'Passat / Caddy' };
  }

  // 5. Peugeot / Citroen / Opel
  if (brandUpper.includes('PEUGEOT') || brandUpper.includes('CITROEN') || brandUpper.includes('CITROËN') || brandUpper.includes('OPEL') || brandUpper.includes('DS')) {
    if (combined.includes('1.5') || combined.includes('bluehdi') || combined.includes('hdi') || combined.includes('cdti')) {
      return { engineType: '1.5 BlueHDi / CDTi (130 HP Dizel)', fuelType: 'Dizel', normalizedModel: modelUpper || '3008 / Rifter / Astra' };
    }
    if (combined.includes('1.2') || combined.includes('puretech') || combined.includes('turbo')) {
      return { engineType: '1.2 PureTech Turbo (130 HP Benzin)', fuelType: 'Benzin', normalizedModel: modelUpper || '2008 / C3 / Corsa' };
    }
    return { engineType: '1.5 BlueHDi / 1.2 PureTech', fuelType: 'Dizel / Benzin', normalizedModel: modelUpper || '3008 / Berlingo' };
  }

  // 6. Toyota
  if (brandUpper.includes('TOYOTA')) {
    if (combined.includes('hybrid') || combined.includes('1.8') || combined.includes('hibrit')) {
      return { engineType: '1.8 Hybrid e-CVT (122 HP Hibrit)', fuelType: 'Hibrit', normalizedModel: modelUpper || 'Corolla Hybrid' };
    }
    if (combined.includes('1.5') || combined.includes('1.6') || combined.includes('valvematic') || combined.includes('vvt')) {
      return { engineType: '1.5 / 1.6 Valvematic (132 HP Benzin)', fuelType: 'Benzin', normalizedModel: modelUpper || 'Corolla' };
    }
    if (combined.includes('1.4') || combined.includes('d-4d')) {
      return { engineType: '1.4 D-4D (90 HP Dizel)', fuelType: 'Dizel', normalizedModel: modelUpper || 'Corolla' };
    }
    if (modelUpper.includes('HILUX')) return { engineType: '2.4 / 2.8 D-4D (150/204 HP Dizel)', fuelType: 'Dizel', normalizedModel: 'Hilux' };
    return { engineType: '1.8 Hybrid / 1.6 Benzin', fuelType: 'Hibrit / Benzin', normalizedModel: modelUpper || 'Corolla' };
  }

  // 7. Hyundai / Kia
  if (brandUpper.includes('HYUNDAI') || brandUpper.includes('KIA')) {
    if (combined.includes('1.6 crdi') || combined.includes('crdi') || combined.includes('1.4 crdi')) {
      return { engineType: '1.6 CRDi Smartstream (136 HP Dizel)', fuelType: 'Dizel', normalizedModel: modelUpper || 'Tucson / i30' };
    }
    if (combined.includes('1.0') || combined.includes('1.4') || combined.includes('t-gdi')) {
      return { engineType: '1.0 / 1.6 T-GDi Turbo (Benzin)', fuelType: 'Benzin', normalizedModel: modelUpper || 'i20 / Tucson' };
    }
    return { engineType: '1.6 CRDi Dizel', fuelType: 'Dizel', normalizedModel: modelUpper || 'Tucson / i20' };
  }

  // 8. Mercedes-Benz
  if (brandUpper.includes('MERCEDES') || brandUpper.includes('MB')) {
    if (modelUpper.includes('SPRINTER') || modelUpper.includes('VITO') || combined.includes('cdi')) {
      return { engineType: '2.0 / 2.2 CDI OM651/OM654 Dizel', fuelType: 'Dizel', normalizedModel: modelUpper || 'Sprinter / Vito' };
    }
    return { engineType: '2.0 Turbo CDI / CGI', fuelType: 'Dizel / Benzin', normalizedModel: modelUpper || 'C-Serisi' };
  }

  // Fallback
  return {
    engineType: `${modelUpper || 'Standart'} Motor Grubu`,
    fuelType: combined.includes('dizel') ? 'Dizel' : combined.includes('hybrid') ? 'Hibrit' : 'Benzin / Dizel',
    normalizedModel: modelUpper || 'Standart Model',
  };
}

export function getEngineChronicProfiles(engineType: string, brand: string): {
  chronicIssues: string[];
  commonFailureAreas: string[];
  expertAdvice: string;
  baseRisk: number;
} {
  const e = (engineType || '').toLowerCase();

  if (e.includes('1.3 multijet')) {
    return {
      chronicIssues: [
        'EGR Valfi & DPF Tıkanması (Şehir İçi Yoğunluk)',
        'Triger Zinciri Uzaması / Gevşemesi (>120.000 KM)',
        'Enjektör Geri Dönüş Kaçağı & Yakıt Püskürtme Dengesizliği',
        'Termostat Gövdesi & Yağ Soğutucu Sızıntısı'
      ],
      commonFailureAreas: ['Yakıt & Enjeksiyon', 'DPF & Egzoz Emisyon', 'Triger Zincir Seti', 'Soğutma Grubu'],
      expertAdvice: '120.000 KM üzerindeki araçlarda zincir uzama kontrolü yapılmalı, DPF rejenerasyonu ve yağ kalitesi yakından izlenmelidir.',
      baseRisk: 68
    };
  }

  if (e.includes('1.5 dci') || e.includes('blue dci')) {
    return {
      chronicIssues: [
        'Enjektör Aşınması & Mazot Geri Dönüş Valfi',
        'Turboşarj Basınç Boruları & Intercooler Yağlanması',
        'EGR Valfi Kurum Bağlaması',
        'Çift Kütleli Volan & Debriyaj Aşınması'
      ],
      commonFailureAreas: ['Enjektör / Yakıt Sistemi', 'Turboşarj Grubu', 'Kavrama & Volan', 'DPF Filtresi'],
      expertAdvice: 'Yakıt filtresi kesinlikle Bosch OEM standartlarında tutulmalı; 140.000 KM üzerinde enjektör debi testi yaptırılmalıdır.',
      baseRisk: 64
    };
  }

  if (e.includes('1.6 tdi') || e.includes('2.0 tdi')) {
    return {
      chronicIssues: [
        'DPF Rejenerasyon Arızası & Fark Basınç Sensörü',
        'EGR Soğutucu / Valf Blokajı',
        'DSG Çift Kavrama & Mekatronik Yükü',
        'Devirdaim / Su Pompası Kaçağı'
      ],
      commonFailureAreas: ['DPF & Emisyon Sensörleri', 'DSG / Şanzıman Mekatronik', 'Devirdaim / Triger Seti', 'EGR Soğutucu'],
      expertAdvice: 'DSG kavraması ve mekatronik basınç testi periyodik olarak yapılmalı; triger kayışı değişiminde devirdaim pompası ihmal edilmemelidir.',
      baseRisk: 72
    };
  }

  if (e.includes('1.5 ecoblue') || e.includes('1.5 tdci') || e.includes('2.0 ecoblue')) {
    return {
      chronicIssues: [
        'Eksantrik Milleri Arası Zincir Aşınması (1.5 EcoBlue)',
        'AdBlue Pompa / Enjektör Kristalleşmesi',
        'DPF Tıkanıklığı Nedeniyle Yağ Seyrelmesi',
        'Debriyaj Baskı Balata & Rulman Yıpranması'
      ],
      commonFailureAreas: ['Eksantrik Zincir Grubu', 'AdBlue & Emisyon', 'DPF / Yağlama', 'Debriyaj Seti'],
      expertAdvice: 'Sadece Ford WSS onaylı özel motor yağı kullanılmalı; AdBlue sisteminde kristal önleyici katkı uygulanmalıdır.',
      baseRisk: 74
    };
  }

  if (e.includes('1.2 puretech')) {
    return {
      chronicIssues: [
        'Islak Triger Kayışının Yağ İçinde Dağılması & Karter Süzgeci Tıkanması',
        'Yüksek Yağ Tüketimi (Segman / Subap Lastikleri)',
        'Buji & Ateşleme Bobini Erken Bozulması',
        'Turboşarj Yağlama Yetersizliği'
      ],
      commonFailureAreas: ['Islak Triger Kayışı', 'Yağlama & Karter Süzgeci', 'Ateşleme Sistemi', 'Segman & Kompresyon'],
      expertAdvice: 'Triger kayışı genişliği her serviste mikrometreyle ölçülmeli; karter süzgeci kauçuk parçacıklarına karşı temizlenmelidir.',
      baseRisk: 82
    };
  }

  if (e.includes('1.4 fire')) {
    return {
      chronicIssues: [
        'Yüksek KM ve Yüksek Devirde Yağ Eksiltme',
        'LPG Uyumunda Subap Boşluğu & Aşınması',
        'Ateşleme Bobini & Buji Arızaları',
        'Termostat & Radyatör Hortum Yaşlanması'
      ],
      commonFailureAreas: ['Yağ Tüketimi', 'Ateşleme Grubu', 'Soğutma & Termostat', 'LPG / Subap'],
      expertAdvice: 'Yağ seviyesi sık sık kontrol edilmeli, 20.000 KM\'de bir Bosch bujilerle ateşleme sistemi yenilenmelidir.',
      baseRisk: 48
    };
  }

  if (e.includes('1.8 hybrid') || e.includes('hibrit')) {
    return {
      chronicIssues: [
        'Inverter Soğutma Sıvısı Seviye & Sirkülasyon Kontrolü',
        '12V Yardımcı Akü Erken Deşarjı',
        'EGR Soğutucu Kurum Birikmesi',
        'Hibrit Batarya Soğutma Fan Filtresi Tozlanması'
      ],
      commonFailureAreas: ['Inverter Soğutma', '12V Akü', 'EGR Sistemi', 'Batarya Havalandırma'],
      expertAdvice: 'Hibrit batarya soğutma fanı yılda bir temizlenmeli, inverter soğutma sıvısı seviyesi periyodik olarak kontrol edilmelidir.',
      baseRisk: 25
    };
  }

  if (e.includes('1.6 crdi')) {
    return {
      chronicIssues: [
        'Zincir Sesi & Gergi Boşalması (>130.000 KM)',
        'DCT Şanzıman Çift Kavrama Isınması ve Titreme',
        'EGR Valfi & Emme Manifoldu Kurumlanması',
        'Isıtma Bujileri Arızası'
      ],
      commonFailureAreas: ['DCT Kavrama', 'Triger Zincir Kiti', 'EGR & Manifold', 'Isıtma Bujileri'],
      expertAdvice: 'DCT şanzıman kavrama boşluğu kontrol edilmeli, soğuk çalıştırma sorunlarında ısıtma bujileri test edilmelidir.',
      baseRisk: 58
    };
  }

  // Fallback: Spesifik bir OEM teknik bülteni yoksa yapay kronik arıza uydurulmaz
  return {
    chronicIssues: [],
    commonFailureAreas: [],
    expertAdvice: 'Bu motor grubu için tanımlanmış spesifik bir kronik arıza bülteni bulunmamaktadır. İşlemler filo bakım faturaları ve OEM periyotlarına göre yürütülmelidir.',
    baseRisk: 35
  };
}

export function computeFleetAnalytics(
  records: NormalizedFleetRecord[],
  dataQualityScore: number = 90
): AnalyticsResult {
  const totalRecords = records.length;
  let totalCost = 0;
  let plannedMaintenanceCost = 0;

  // Single-pass Group by unique vehicle (plate) + service breakdowns
  const vehicleMap = new Map<string, {
    plate: string;
    brand: string;
    model: string;
    modelYear: number;
    age: number;
    maxKm: number;
    totalCost: number;
    operationCount: number;
    fleetGroup: string;
    anomalies: Set<string>;
    isOutlier: boolean;
    serviceMap: Map<string, { totalCost: number; count: number }>;
  }>();

  // Brand aggregations
  const brandGroup = new Map<string, {
    totalCost: number;
    operations: number;
    plates: Set<string>;
  }>();

  // Supplier aggregations
  const supplierGroup = new Map<string, {
    totalCost: number;
    operations: number;
    plates: Map<string, { totalCost: number; count: number; brand: string; model: string }>;
    brands: Map<string, number>;
  }>();

  // Expense aggregations
  const expenseGroup = new Map<string, { totalCost: number; operations: number }>();

  // Fleet group aggregations
  const fleetGroupMap = new Map<string, number>();

  // KM Segments counters (0-50k, 50-100k, 100-150k, 150-200k, 200k+)
  const kmRecordBuckets = [0, 0, 0, 0, 0];
  const kmRecordCostBuckets = [0, 0, 0, 0, 0];

  // Age Segments counters (0-2, 3-5, 6-8, 9+)
  const ageRecordBuckets = [0, 0, 0, 0];
  const ageRecordCostBuckets = [0, 0, 0, 0];

  // Single main pass over all records
  for (let i = 0; i < totalRecords; i++) {
    const r = records[i];
    const cost = r.totalPrice || 0;
    totalCost += cost;

    const isPlanned = r.expenseType === 'Periyodik Bakım' || 
                      r.expenseType.startsWith('Periyodik') || 
                      /periyodik|rutin\s*bak[ıi]m/i.test(r.expenseType);
    if (isPlanned) {
      plannedMaintenanceCost += cost;
    }

    // Vehicle Map aggregation
    let vEntry = vehicleMap.get(r.plate);
    if (!vEntry) {
      const anomSet = new Set<string>();
      if (Array.isArray(r.anomalies)) {
        for (let j = 0; j < r.anomalies.length; j++) {
          const a = r.anomalies[j];
          if (a?.title) anomSet.add(a.title);
        }
      }
      vEntry = {
        plate: r.plate,
        brand: r.brand,
        model: r.model,
        modelYear: r.modelYear,
        age: r.age,
        maxKm: r.km,
        totalCost: cost,
        operationCount: 1,
        fleetGroup: r.fleetGroup,
        anomalies: anomSet,
        isOutlier: !!r.isOutlier,
        serviceMap: new Map(),
      };
      vehicleMap.set(r.plate, vEntry);
    } else {
      vEntry.totalCost += cost;
      vEntry.operationCount += 1;
      if (r.km > vEntry.maxKm) vEntry.maxKm = r.km;
      if (r.modelYear > 0 && vEntry.modelYear === 0) vEntry.modelYear = r.modelYear;
      if (r.model && (!vEntry.model || r.model.length > vEntry.model.length)) {
        vEntry.model = r.model;
      }
      if (Array.isArray(r.anomalies)) {
        for (let j = 0; j < r.anomalies.length; j++) {
          const a = r.anomalies[j];
          if (a?.title) vEntry.anomalies.add(a.title);
        }
      }
      if (r.isOutlier) vEntry.isOutlier = true;
    }

    // Per-vehicle supplier breakdown
    const sName = r.supplier || 'Yetkili/Özel Servis';
    const vService = vEntry.serviceMap.get(sName) || { totalCost: 0, count: 0 };
    vService.totalCost += cost;
    vService.count += 1;
    vEntry.serviceMap.set(sName, vService);

    // Brand aggregation
    const b = r.brand || 'DİĞER';
    let bEntry = brandGroup.get(b);
    if (!bEntry) {
      bEntry = { totalCost: 0, operations: 0, plates: new Set() };
      brandGroup.set(b, bEntry);
    }
    bEntry.totalCost += cost;
    bEntry.operations += 1;
    bEntry.plates.add(r.plate);

    // Supplier aggregation
    let supEntry = supplierGroup.get(sName);
    if (!supEntry) {
      supEntry = { totalCost: 0, operations: 0, plates: new Map(), brands: new Map() };
      supplierGroup.set(sName, supEntry);
    }
    supEntry.totalCost += cost;
    supEntry.operations += 1;
    let spEntry = supEntry.plates.get(r.plate);
    if (!spEntry) {
      spEntry = { totalCost: 0, count: 0, brand: r.brand, model: r.model };
      supEntry.plates.set(r.plate, spEntry);
    }
    spEntry.totalCost += cost;
    spEntry.count += 1;
    if (r.brand && !spEntry.brand) spEntry.brand = r.brand;
    if (r.model && !spEntry.model) spEntry.model = r.model;
    supEntry.brands.set(r.brand, (supEntry.brands.get(r.brand) || 0) + 1);

    // Expense aggregation
    const e = r.expenseType || 'Genel Onarım';
    let expEntry = expenseGroup.get(e);
    if (!expEntry) {
      expEntry = { totalCost: 0, operations: 0 };
      expenseGroup.set(e, expEntry);
    }
    expEntry.totalCost += cost;
    expEntry.operations += 1;

    // Fleet group
    const f = r.fleetGroup || 'Genel Filo';
    fleetGroupMap.set(f, (fleetGroupMap.get(f) || 0) + cost);

    // KM Buckets for records
    if (r.km <= 50000) { kmRecordBuckets[0]++; kmRecordCostBuckets[0] += cost; }
    else if (r.km <= 100000) { kmRecordBuckets[1]++; kmRecordCostBuckets[1] += cost; }
    else if (r.km <= 150000) { kmRecordBuckets[2]++; kmRecordCostBuckets[2] += cost; }
    else if (r.km <= 200000) { kmRecordBuckets[3]++; kmRecordCostBuckets[3] += cost; }
    else { kmRecordBuckets[4]++; kmRecordCostBuckets[4] += cost; }

    // Age Buckets for records
    if (r.age <= 2) { ageRecordBuckets[0]++; ageRecordCostBuckets[0] += cost; }
    else if (r.age <= 5) { ageRecordBuckets[1]++; ageRecordCostBuckets[1] += cost; }
    else if (r.age <= 8) { ageRecordBuckets[2]++; ageRecordCostBuckets[2] += cost; }
    else { ageRecordBuckets[3]++; ageRecordCostBuckets[3] += cost; }
  }

  const uniqueVehicles = Array.from(vehicleMap.values());
  const totalVehicles = uniqueVehicles.length || 1;
  const avgCostPerVehicle = Math.round(totalCost / totalVehicles);
  const avgTicketCost = totalRecords > 0 ? Math.round(totalCost / totalRecords) : 0;

  // Single pass on unique vehicles for total KM, Age and Segment Counts
  let totalKm = 0;
  let totalAgeSum = 0;
  const kmVehicleBuckets = [0, 0, 0, 0, 0];
  const kmVehicleKmBuckets = [0, 0, 0, 0, 0];
  const ageVehicleBuckets = [0, 0, 0, 0];
  const ageVehicleKmBuckets = [0, 0, 0, 0];
  const brandKmMap = new Map<string, number>();
  const brandAgeMap = new Map<string, number>();

  for (let i = 0; i < uniqueVehicles.length; i++) {
    const v = uniqueVehicles[i];
    totalKm += v.maxKm;
    totalAgeSum += v.age;

    brandKmMap.set(v.brand, (brandKmMap.get(v.brand) || 0) + v.maxKm);
    brandAgeMap.set(v.brand, (brandAgeMap.get(v.brand) || 0) + v.age);

    if (v.maxKm <= 50000) {
      kmVehicleBuckets[0]++;
      kmVehicleKmBuckets[0] += v.maxKm;
    } else if (v.maxKm <= 100000) {
      kmVehicleBuckets[1]++;
      kmVehicleKmBuckets[1] += v.maxKm;
    } else if (v.maxKm <= 150000) {
      kmVehicleBuckets[2]++;
      kmVehicleKmBuckets[2] += v.maxKm;
    } else if (v.maxKm <= 200000) {
      kmVehicleBuckets[3]++;
      kmVehicleKmBuckets[3] += v.maxKm;
    } else {
      kmVehicleBuckets[4]++;
      kmVehicleKmBuckets[4] += v.maxKm;
    }

    if (v.age <= 2) {
      ageVehicleBuckets[0]++;
      ageVehicleKmBuckets[0] += v.maxKm;
    } else if (v.age <= 5) {
      ageVehicleBuckets[1]++;
      ageVehicleKmBuckets[1] += v.maxKm;
    } else if (v.age <= 8) {
      ageVehicleBuckets[2]++;
      ageVehicleKmBuckets[2] += v.maxKm;
    } else {
      ageVehicleBuckets[3]++;
      ageVehicleKmBuckets[3] += v.maxKm;
    }
  }

  const avgVehicleKm = Math.round(totalKm / totalVehicles);
  const avgVehicleAge = parseFloat((totalAgeSum / totalVehicles).toFixed(1));
  const costPerKm = totalKm > 0 ? parseFloat((totalCost / totalKm).toFixed(2)) : 0;

  let minCost = 0;
  let maxCost = 0;
  let medianCost = 0;

  if (totalRecords > 0) {
    const sortedCosts = records.map(r => r.totalPrice).sort((a, b) => a - b);
    minCost = sortedCosts[0] || 0;
    maxCost = sortedCosts[sortedCosts.length - 1] || 0;
    medianCost = sortedCosts[Math.floor(sortedCosts.length / 2)] || 0;
  }

  const maintenanceSharePct = totalCost > 0 ? Math.round((plannedMaintenanceCost / totalCost) * 100) : 0;
  const repairSharePct = Math.max(0, 100 - maintenanceSharePct);

  const summary: FleetSummaryMetrics = {
    totalCost,
    totalVehicles,
    avgCostPerVehicle,
    totalRecords,
    avgTicketCost,
    medianCost,
    minCost,
    maxCost,
    totalKm,
    avgVehicleAge,
    avgVehicleKm,
    costPerKm,
    maintenanceSharePct,
    repairSharePct,
    dataQualityScore,
  };

  // 1. BRAND STATS
  const brandStats: BrandStat[] = Array.from(brandGroup.entries()).map(([name, data]) => {
    const vCount = data.plates.size || 1;
    const bTotalKm = brandKmMap.get(name) || 0;
    const bTotalAge = brandAgeMap.get(name) || 0;

    return {
      name,
      totalCost: data.totalCost,
      vehicleCount: vCount,
      costPerVehicle: Math.round(data.totalCost / vCount),
      costSharePct: totalCost > 0 ? parseFloat(((data.totalCost / totalCost) * 100).toFixed(1)) : 0,
      operationCount: data.operations,
      avgTicket: Math.round(data.totalCost / data.operations),
      avgKm: Math.round(bTotalKm / vCount),
      avgAge: parseFloat((bTotalAge / vCount).toFixed(1)),
      costPerKm: bTotalKm > 0 ? parseFloat((data.totalCost / bTotalKm).toFixed(2)) : 0,
    };
  }).sort((a, b) => b.totalCost - a.totalCost);

  // 1.5. ENGINE & MODEL ISSUE / RELIABILITY ANALYSIS (ARAÇ & MOTOR TİPİ KRONİK ARIZA ANALİZİ)
  const engineGroupMap = new Map<string, {
    brand: string;
    model: string;
    engineType: string;
    fuelType: string;
    totalCost: number;
    operations: number;
    totalKm: number;
    totalAge: number;
    plates: Set<string>;
    partsMap: Map<string, { cost: number; count: number }>;
  }>();

  records.forEach(r => {
    const { engineType, fuelType, normalizedModel } = detectEngineAndFuelType(r.brand, r.model, r.description);
    const key = `${r.brand || 'DİĞER'}___${normalizedModel}___${engineType}`;
    
    let eEntry = engineGroupMap.get(key);
    if (!eEntry) {
      eEntry = {
        brand: r.brand || 'DİĞER',
        model: normalizedModel,
        engineType,
        fuelType,
        totalCost: 0,
        operations: 0,
        totalKm: 0,
        totalAge: 0,
        plates: new Set(),
        partsMap: new Map(),
      };
      engineGroupMap.set(key, eEntry);
    }

    const cost = r.totalPrice || 0;
    eEntry.totalCost += cost;
    eEntry.operations += 1;
    eEntry.plates.add(r.plate);

    // Track parts for this engine
    const partKey = r.description || r.expenseType || 'Genel Bakım / Parça';
    const pData = eEntry.partsMap.get(partKey) || { cost: 0, count: 0 };
    pData.cost += cost;
    pData.count += 1;
    eEntry.partsMap.set(partKey, pData);
  });

  // Add vehicle KM and Age
  uniqueVehicles.forEach(v => {
    const { engineType, fuelType, normalizedModel } = detectEngineAndFuelType(v.brand, v.model);
    const key = `${v.brand || 'DİĞER'}___${normalizedModel}___${engineType}`;
    const eEntry = engineGroupMap.get(key);
    if (eEntry) {
      eEntry.totalKm += v.maxKm;
      eEntry.totalAge += v.age;
    }
  });

  const engineIssueStats: EngineIssueStat[] = Array.from(engineGroupMap.values()).map((data, idx) => {
    const vCount = data.plates.size || 1;
    const costPerVehicle = Math.round(data.totalCost / vCount);
    const costPerKm = data.totalKm > 0 ? parseFloat((data.totalCost / data.totalKm).toFixed(2)) : 0;
    const ticketPerVehicle = parseFloat((data.operations / vCount).toFixed(1));
    const avgKm = Math.round(data.totalKm / vCount);
    const avgAge = parseFloat((data.totalAge / vCount).toFixed(1));

    const topFailedParts = Array.from(data.partsMap.entries())
      .map(([name, pStat]) => ({ name, cost: pStat.cost, count: pStat.count }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 4);

    const profile = getEngineChronicProfiles(data.engineType, data.brand);

    // Failure Rate Index (0 - 100)
    // Factors: Cost compared to fleet average, Ticket frequency, KM, Chronic profile baseline
    const costRatio = avgCostPerVehicle > 0 ? costPerVehicle / avgCostPerVehicle : 1;
    const freqRatio = Math.min(3, ticketPerVehicle / 3);
    const rawScore = (costRatio * 35) + (freqRatio * 30) + (profile.baseRisk * 0.35);
    const failureRateIndex = Math.min(99, Math.max(15, Math.round(rawScore)));

    let issueLevel: EngineIssueStat['issueLevel'] = 'Sorunsuz / Düşük Risk';
    if (failureRateIndex >= 75) {
      issueLevel = 'Kritik Sorunlu';
    } else if (failureRateIndex >= 55) {
      issueLevel = 'Yüksek Arıza Riski';
    } else if (failureRateIndex >= 35) {
      issueLevel = 'Orta Risk';
    }

    return {
      id: `engine-${idx}-${data.brand}-${data.model}`.replace(/[^a-zA-Z0-9-_]/g, '_'),
      brand: data.brand,
      model: data.model,
      engineType: data.engineType,
      fuelType: data.fuelType,
      vehicleCount: vCount,
      totalCost: Math.round(data.totalCost),
      costPerVehicle,
      costPerKm,
      operationCount: data.operations,
      ticketPerVehicle,
      avgKm,
      avgAge,
      failureRateIndex,
      issueLevel,
      chronicIssues: profile.chronicIssues,
      topFailedParts,
      commonFailureAreas: profile.commonFailureAreas,
      expertAdvice: profile.expertAdvice,
      plates: Array.from(data.plates),
    };
  }).sort((a, b) => b.failureRateIndex - a.failureRateIndex || b.totalCost - a.totalCost);


  // 2. SUPPLIER / VENDOR STATS
  const supplierStats: SupplierStat[] = Array.from(supplierGroup.entries()).map(([name, data]) => {
    const vCount = data.plates.size || 1;
    const avgTicket = Math.round(data.totalCost / data.operations);
    const vendorPriceIndex = avgTicketCost > 0 ? Math.round((avgTicket / avgTicketCost) * 100) : 100;

    let primaryBrand = 'Çoklu Marka';
    let maxBCount = 0;
    data.brands.forEach((count, bName) => {
      if (count > maxBCount) {
        maxBCount = count;
        primaryBrand = bName;
      }
    });

    const servedPlates: SupplierServedPlate[] = Array.from(data.plates.entries()).map(([plate, pData]) => ({
      plate,
      brand: pData.brand,
      model: pData.model,
      totalCost: pData.totalCost,
      operationCount: pData.count,
      costSharePct: data.totalCost > 0 ? parseFloat(((pData.totalCost / data.totalCost) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.totalCost - a.totalCost);

    return {
      name,
      totalCost: data.totalCost,
      vehicleCount: vCount,
      costPerVehicle: Math.round(data.totalCost / vCount),
      costSharePct: totalCost > 0 ? parseFloat(((data.totalCost / totalCost) * 100).toFixed(1)) : 0,
      operationCount: data.operations,
      avgTicket,
      vendorPriceIndex,
      primaryBrand,
      servedPlates,
    };
  }).sort((a, b) => b.totalCost - a.totalCost);

  // 3. EXPENSE TYPE STATS
  const expenseTypeStats: ExpenseTypeStat[] = Array.from(expenseGroup.entries()).map(([name, data]) => {
    const isPlanned = name === 'Periyodik Bakım' || 
                      name.startsWith('Periyodik') || 
                      /periyodik|rutin\s*bak[ıi]m/i.test(name);
    return {
      name,
      totalCost: data.totalCost,
      operationCount: data.operations,
      costSharePct: totalCost > 0 ? parseFloat(((data.totalCost / totalCost) * 100).toFixed(1)) : 0,
      avgCost: data.operations > 0 ? Math.round(data.totalCost / data.operations) : 0,
      isPlannedMaintenance: isPlanned,
    };
  }).sort((a, b) => b.totalCost - a.totalCost);

  // 4. KM & AGE SEGMENTS
  const kmSegmentNames = [
    '0 - 50.000 KM',
    '50.000 - 100.000 KM',
    '100.000 - 150.000 KM',
    '150.000 - 200.000 KM',
    '200.000+ KM',
  ];

  const kmSegmentStats: KmSegmentStat[] = kmSegmentNames.map((name, idx) => {
    const vCount = kmVehicleBuckets[idx];
    const segCost = kmRecordCostBuckets[idx];
    const segKm = kmVehicleKmBuckets[idx] || 0;
    return {
      segment: name,
      totalCost: segCost,
      vehicleCount: vCount,
      avgCostPerVehicle: vCount > 0 ? Math.round(segCost / vCount) : 0,
      operationCount: kmRecordBuckets[idx],
      totalKm: segKm,
      costPerKm: segKm > 0 ? parseFloat((segCost / segKm).toFixed(2)) : 0,
    };
  });

  const ageSegmentNames = [
    '0 - 2 Yaş (Yeni)',
    '3 - 5 Yaş (Orta)',
    '6 - 8 Yaş (Eski)',
    '9+ Yaş (Kritik)',
  ];

  const ageSegmentStats: AgeSegmentStat[] = ageSegmentNames.map((name, idx) => {
    const vCount = ageVehicleBuckets[idx];
    const segCost = ageRecordCostBuckets[idx];
    const segKm = ageVehicleKmBuckets[idx] || 0;
    return {
      segment: name,
      totalCost: segCost,
      vehicleCount: vCount,
      avgCostPerVehicle: vCount > 0 ? Math.round(segCost / vCount) : 0,
      operationCount: ageRecordBuckets[idx],
      costPerKm: segKm > 0 ? parseFloat((segCost / segKm).toFixed(2)) : 0,
    };
  });

  // 5. PARETO (80/20) ANALYSIS FUNCTION
  function buildPareto(items: { name: string; cost: number }[]): ParetoItem[] {
    const sorted = [...items].sort((a, b) => b.cost - a.cost);
    let runningTotal = 0;
    return sorted.map((item, index) => {
      runningTotal += item.cost;
      const sharePct = totalCost > 0 ? (item.cost / totalCost) * 100 : 0;
      const cumulativePct = totalCost > 0 ? (runningTotal / totalCost) * 100 : 0;
      const isKeyDriver = cumulativePct <= 85 || index === 0;

      return {
        name: item.name,
        cost: item.cost,
        costSharePct: parseFloat(sharePct.toFixed(1)),
        cumulativeCost: runningTotal,
        cumulativePct: parseFloat(cumulativePct.toFixed(1)),
        isKeyDriver,
        rank: index + 1,
      };
    });
  }

  const paretoBrands = buildPareto(brandStats.map(b => ({ name: b.name, cost: b.totalCost })));
  const paretoSuppliers = buildPareto(supplierStats.map(s => ({ name: s.name, cost: s.totalCost })));
  const paretoExpenseTypes = buildPareto(expenseTypeStats.map(e => ({ name: e.name, cost: e.totalCost })));
  const paretoFleets = buildPareto(Array.from(fleetGroupMap.entries()).map(([name, cost]) => ({ name, cost })));

  // 6. VEHICLE RISK ASSESSMENT MATRIX
  const costThreshold = avgCostPerVehicle * 1.5;
  const costCriticalThreshold = avgCostPerVehicle * 2.0;
  const riskMap = new Map<string, VehicleRiskRecord>();

  const riskRecords: VehicleRiskRecord[] = uniqueVehicles.map(v => {
    const isOld = v.age > 8;
    const isHighKm = v.maxKm > 150000;
    const isHighCost = v.totalCost >= costThreshold;
    const isCriticalCost = v.totalCost >= costCriticalThreshold;

    let riskLevel: RiskLevel = 'Düşük / Normal Risk';
    let riskScore = 20;
    const riskReasons: string[] = [];
    let recommendedAction = 'Rutin Periyodik Bakım Takibi';
    let actionUrgency: 'Acil' | 'Orta Vadeli' | 'Rutin Takip' = 'Rutin Takip';

    if (isOld && isHighKm) {
      riskLevel = 'Kritik Risk';
      riskScore = 95;
      riskReasons.push(`>8 Yaş (${v.age} Yaşında)`);
      riskReasons.push(`>150.000 KM (${v.maxKm.toLocaleString('tr-TR')} KM)`);
      if (isHighCost) riskReasons.push(`Aşırı Maliyet Yükü (${v.totalCost.toLocaleString('tr-TR')} ₺)`);
      recommendedAction = 'Acil Filodan Çıkar / Yenileme İhalesine Al';
      actionUrgency = 'Acil';
    } else if (isCriticalCost || isHighCost) {
      riskLevel = 'Maliyet Riski';
      riskScore = 80;
      riskReasons.push(`Filo Ortalamasının %${Math.round(((v.totalCost - avgCostPerVehicle) / Math.max(1, avgCostPerVehicle)) * 100)} Üzerinde Harcama`);
      if (isHighKm) riskReasons.push(`Yüksek KM (${v.maxKm.toLocaleString('tr-TR')} KM)`);
      recommendedAction = 'Teknik İnceleme & Telemetri / Şüpheli Fatura Denetimi';
      actionUrgency = 'Acil';
    } else if (isHighKm) {
      riskLevel = 'Yüksek KM Riski';
      riskScore = 65;
      riskReasons.push(`>150.000 KM (${v.maxKm.toLocaleString('tr-TR')} KM)`);
      recommendedAction = 'Ağır Bakım & Güç Aktarma Revizyon Takibi';
      actionUrgency = 'Orta Vadeli';
    } else if (isOld) {
      riskLevel = 'Yaş Riski';
      riskScore = 55;
      riskReasons.push(`>8 Yaş (${v.age} Yaşında)`);
      recommendedAction = 'Kalan Ekonomik Ömür & Güvenlik Değerlendirmesi';
      actionUrgency = 'Orta Vadeli';
    } else {
      if (v.totalCost > avgCostPerVehicle) {
        riskScore = 40;
      }
    }

    if (v.anomalies.size > 0) {
      riskScore = Math.min(100, riskScore + 10);
    }

    const rec: VehicleRiskRecord = {
      plate: v.plate,
      brand: v.brand,
      model: v.model,
      modelYear: v.modelYear,
      age: v.age,
      km: v.maxKm,
      totalCost: v.totalCost,
      operationCount: v.operationCount,
      fleetGroup: v.fleetGroup,
      riskLevel,
      riskScore,
      riskReasons,
      anomalies: Array.from(v.anomalies),
      recommendedAction,
      actionUrgency,
    };

    riskMap.set(v.plate, rec);
    return rec;
  }).sort((a, b) => b.riskScore - a.riskScore || b.totalCost - a.totalCost);

  // 6.5. VEHICLE SPEND STATS (Fast O(1) from vehicleMap pre-aggregated data)
  const vehicleSpendStats: VehicleSpendStat[] = uniqueVehicles.map(v => {
    const servicesVisited: VehicleServiceBreakdown[] = Array.from(v.serviceMap.entries()).map(([sName, sData]) => ({
      serviceName: sName,
      totalCost: sData.totalCost,
      operationCount: sData.count,
      costSharePct: v.totalCost > 0 ? parseFloat(((sData.totalCost / v.totalCost) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.totalCost - a.totalCost);

    const primaryService = servicesVisited[0]?.serviceName || 'Belirtilmemiş';
    const costPerKm = v.maxKm > 0 ? parseFloat((v.totalCost / v.maxKm).toFixed(2)) : 0;
    const avgVehicleTicketCost = v.operationCount > 0 ? Math.round(v.totalCost / v.operationCount) : 0;
    const costSharePct = totalCost > 0 ? parseFloat(((v.totalCost / totalCost) * 100).toFixed(1)) : 0;
    const matchingRisk = riskMap.get(v.plate);

    return {
      plate: v.plate,
      brand: v.brand,
      model: v.model,
      modelYear: v.modelYear,
      age: v.age,
      km: v.maxKm,
      fleetGroup: v.fleetGroup,
      totalCost: v.totalCost,
      costSharePct,
      operationCount: v.operationCount,
      avgTicketCost: avgVehicleTicketCost,
      costPerKm,
      servicesVisited,
      primaryService,
      riskLevel: matchingRisk?.riskLevel || 'Düşük / Normal Risk',
      riskScore: matchingRisk?.riskScore || 20,
    };
  }).sort((a, b) => b.totalCost - a.totalCost);

  // 6.7. FLEET GROUP STATS (FİLOLARA GÖRE ANALİZ VE ÖNERİLER)
  const fleetDataMap = new Map<string, {
    totalCost: number;
    operations: number;
    records: NormalizedFleetRecord[];
    plates: Set<string>;
    plannedCost: number;
    boschSpend: number;
    otherPartsSpend: number;
    fluidsSpend: number;
    laborSpend: number;
    supplierMap: Map<string, { cost: number; count: number }>;
  }>();

  records.forEach(r => {
    const fName = r.fleetGroup || 'Genel Filo';
    const existing = fleetDataMap.get(fName) || {
      totalCost: 0,
      operations: 0,
      records: [],
      plates: new Set<string>(),
      plannedCost: 0,
      boschSpend: 0,
      otherPartsSpend: 0,
      fluidsSpend: 0,
      laborSpend: 0,
      supplierMap: new Map<string, { cost: number; count: number }>(),
    };

    const cost = r.totalPrice || 0;
    existing.totalCost += cost;
    existing.operations += 1;
    existing.records.push(r);
    existing.plates.add(r.plate);

    const isPlannedExp = r.expenseType === 'Periyodik Bakım' || 
                         r.expenseType.startsWith('Periyodik') || 
                         /periyodik|rutin\s*bak[ıi]m/i.test(r.expenseType);
    if (isPlannedExp) {
      existing.plannedCost += cost;
    }

    if (r.sparePartOrigin === 'BOSCH') {
      existing.boschSpend += cost;
    } else if (r.sparePartOrigin === 'DIGER_YP') {
      existing.otherPartsSpend += cost;
    } else if (r.sparePartOrigin === 'SIVILAR_KIMYASAL') {
      existing.fluidsSpend += cost;
    } else if (r.sparePartOrigin === 'ISCILIK') {
      existing.laborSpend += cost;
    }

    const supName = r.supplier || 'Diğer Servis';
    const supData = existing.supplierMap.get(supName) || { cost: 0, count: 0 };
    supData.cost += cost;
    supData.count += 1;
    existing.supplierMap.set(supName, supData);

    fleetDataMap.set(fName, existing);
  });

  // Pre-group unique vehicles by fleetGroup for O(1) lookup
  const fleetVehiclesGroup = new Map<string, typeof uniqueVehicles>();
  for (let i = 0; i < uniqueVehicles.length; i++) {
    const uv = uniqueVehicles[i];
    const fGroup = uv.fleetGroup || 'Genel Filo';
    let fvList = fleetVehiclesGroup.get(fGroup);
    if (!fvList) {
      fvList = [];
      fleetVehiclesGroup.set(fGroup, fvList);
    }
    fvList.push(uv);
  }

  const fleetStats: FleetGroupStat[] = Array.from(fleetDataMap.entries()).map(([name, fData]) => {
    const vCount = fData.plates.size || 1;
    const fVehicles = fleetVehiclesGroup.get(name) || [];
    const fTotalKm = fVehicles.reduce((s, v) => s + v.maxKm, 0);
    const fTotalAge = fVehicles.reduce((s, v) => s + v.age, 0);
    const avgKm = Math.round(fTotalKm / vCount);
    const avgAge = Number((fTotalAge / vCount).toFixed(1));
    const costPerVehicle = Math.round(fData.totalCost / vCount);
    const costPerKm = fTotalKm > 0 ? Number((fData.totalCost / fTotalKm).toFixed(2)) : 0;
    const costSharePct = totalCost > 0 ? Number(((fData.totalCost / totalCost) * 100).toFixed(1)) : 0;
    const maintenanceSharePct = fData.totalCost > 0 ? Math.round((fData.plannedCost / fData.totalCost) * 100) : 0;
    const repairSharePct = Math.max(0, 100 - maintenanceSharePct);
    const totalPartsAndLabor = (fData.boschSpend + fData.otherPartsSpend + fData.fluidsSpend + fData.laborSpend) || fData.totalCost || 1;
    const boschSharePct = Math.round((fData.boschSpend / totalPartsAndLabor) * 100);

    // Top Vehicles in Fleet
    const topVehicles = fVehicles
      .map(v => {
        const rRec = riskMap.get(v.plate);
        return {
          plate: v.plate,
          brand: v.brand,
          model: v.model,
          cost: v.totalCost,
          km: v.maxKm,
          age: v.age,
          riskLevel: rRec ? rRec.riskLevel : ('Düşük / Normal Risk' as RiskLevel),
        };
      })
      .sort((a, b) => b.cost - a.cost);

    const criticalVehiclesCount = topVehicles.filter(v => v.riskLevel === 'Kritik Risk' || v.riskLevel === 'Maliyet Riski').length;

    // Top Suppliers
    const topSuppliers = Array.from(fData.supplierMap.entries())
      .map(([sName, sData]) => ({ name: sName, cost: sData.cost, count: sData.count }))
      .sort((a, b) => b.cost - a.cost);

    // Top Used Parts in this Fleet
    const fleetPartsMap = new Map<string, { count: number; totalCost: number }>();
    fData.records.forEach(r => {
      const partKey = r.description || r.expenseType || 'Belirtilmemiş Parça / İşlem';
      const pData = fleetPartsMap.get(partKey) || { count: 0, totalCost: 0 };
      pData.count += 1;
      pData.totalCost += r.totalPrice || 0;
      fleetPartsMap.set(partKey, pData);
    });

    const topUsedParts = Array.from(fleetPartsMap.entries())
      .map(([pName, pStat]) => ({ name: pName, count: pStat.count, totalCost: pStat.totalCost }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5);

    // Vehicles recommended for replacement/renewal (High cost, high KM, or age)
    const topRenewVehicles = topVehicles
      .filter(v => v.riskLevel === 'Kritik Risk' || v.cost > costPerVehicle * 1.3 || v.km >= 150000 || v.age >= 6)
      .slice(0, 4)
      .map(v => {
        let reason = 'Yüksek bakım maliyeti';
        if (v.km >= 180000) reason = 'Kritik KM sınırı aşımı & yüksek masraf';
        else if (v.age >= 7) reason = 'Yüksek araç yaşı & kronik parça ihtiyacı';
        else if (v.cost > costPerVehicle * 1.5) reason = 'Filo ortalamasının %50 üzerinde masraf';
        return {
          plate: v.plate,
          brand: v.brand,
          model: v.model,
          km: v.km,
          age: v.age,
          cost: v.cost,
          reason
        };
      });

    // Dynamic Fleet Recommendations
    const recommendations: FleetRecommendation[] = [];

    // Rec 1: Doğrudan Araç Değiştirme / Yenileme Önerisi (Doğrudan Plakaları Vererek)
    if (topRenewVehicles.length > 0) {
      const renewPlates = topRenewVehicles.map(v => v.plate).join(', ');
      recommendations.push({
        id: `rec-renew-${name}`,
        category: 'VEHICLE_RENEWAL',
        title: 'Öncelikli Değiştirilmesi Gereken Araçlar',
        description: `Bu filoda özellikle [ ${renewPlates} ] plakalı araçlar yüksek KM ve ağır bakım faturaları nedeniyle filoya aşırı masraf çıkarmaktadır. Bu araçların revizyon yerine yenilenmesi/elden çıkarılması tavsiye edilir.`,
        impactLevel: 'Stratejik',
        estimatedSavings: 'Yıllık Bakım Yükünde %30 Düşüş',
        suggestedAction: `${renewPlates} plakalı araçları takas / araç yenileme listesine alın.`,
      });
    }

    // Rec 2: Sık Kullanılan Parçalar ve Parça Tüketim Analizi (Kullanıcı Talebi: "aa bak siz şu şu parçaları çok kullanmışsınız")
    if (topUsedParts.length > 0) {
      const topPartsStr = topUsedParts.slice(0, 3).map(p => `"${p.name}" (${p.totalCost.toLocaleString('tr-TR')} ₺)`).join(', ');
      recommendations.push({
        id: `rec-parts-usage-${name}`,
        category: 'BOSCH_PARTS',
        title: 'Yoğun Tüketilen Parçalar & Toplu Alım Fırsatı',
        description: `Bu filonuzda en çok harcama yapılan ve sık tüketilen parçalar: ${topPartsStr}. Bu kalemleri tek tek almak yerine Bosch ile filo bazlı toplu alım/konsinye anlaşması yaparak maliyeti düşürebilirsiniz.`,
        impactLevel: 'Yüksek',
        estimatedSavings: `~${Math.round(fData.totalCost * 0.12).toLocaleString('tr-TR')} ₺ Tasarruf`,
        suggestedAction: 'En çok tüketilen bu yedek parçalar için merkezi indirim protokolü tanımlayın.',
      });
    }

    // Rec 3: Servis Konsolidasyonu
    if (topSuppliers.length > 1) {
      const mainSup = topSuppliers[0]?.name || 'Ana Servis';
      recommendations.push({
        id: `rec-serv-${name}`,
        category: 'SERVICE_CONSOLIDATION',
        title: 'Servis ve Bakım Noktalarının Tekilleştirilmesi',
        description: `Filo ${topSuppliers.length} farklı servis noktasından hizmet almaktadır. İş hacminin tek bir bölge anlaşmalı Bosch Car Service noktasında toplanması durumunda hacim iskontosu (%12-18) elde edilebilir.`,
        impactLevel: 'Orta',
        estimatedSavings: `~${Math.round(fData.totalCost * 0.10).toLocaleString('tr-TR')} ₺ (%10 İskonto)`,
        suggestedAction: `Dağınık servis faturalarını inceleyip ${mainSup} veya merkezi Bosch Car Service ile çerçeve sözleşme yapın.`,
      });
    }

    return {
      name,
      totalCost: fData.totalCost,
      vehicleCount: vCount,
      costPerVehicle,
      costSharePct,
      operationCount: fData.operations,
      avgTicket: Math.round(fData.totalCost / fData.operations),
      avgKm,
      avgAge,
      costPerKm,
      maintenanceSharePct,
      repairSharePct,
      boschPartsSpend: fData.boschSpend,
      otherPartsSpend: fData.otherPartsSpend,
      fluidsSpend: fData.fluidsSpend,
      laborSpend: fData.laborSpend,
      boschSharePct,
      criticalVehiclesCount,
      topVehicles,
      topSuppliers,
      topUsedParts,
      topRenewVehicles,
      recommendations,
    };
  }).sort((a, b) => b.totalCost - a.totalCost);

  // 7. CROSS-TABULATION MATRICES
  function buildCrossTab(
    title: string,
    rowHeader: string,
    colHeader: string,
    getRowKey: (r: NormalizedFleetRecord) => string,
    getColKey: (r: NormalizedFleetRecord) => string,
    maxRows = 8,
    maxCols = 7
  ): CrossTabMatrix {
    const rawData: { [row: string]: { [col: string]: number } } = {};
    const rowSums: { [row: string]: number } = {};
    const colSums: { [col: string]: number } = {};

    records.forEach(r => {
      const rowKey = getRowKey(r) || 'Diğer';
      const colKey = getColKey(r) || 'Diğer';
      const cost = r.totalPrice;

      if (!rawData[rowKey]) rawData[rowKey] = {};
      rawData[rowKey][colKey] = (rawData[rowKey][colKey] || 0) + cost;

      rowSums[rowKey] = (rowSums[rowKey] || 0) + cost;
      colSums[colKey] = (colSums[colKey] || 0) + cost;
    });

    const sortedRows = Object.keys(rowSums).sort((a, b) => rowSums[b] - rowSums[a]).slice(0, maxRows);
    const sortedCols = Object.keys(colSums).sort((a, b) => colSums[b] - colSums[a]).slice(0, maxCols);

    const filteredData: { [row: string]: { [col: string]: number } } = {};
    const finalRowTotals: { [row: string]: number } = {};
    const finalColTotals: { [col: string]: number } = {};
    let grand = 0;

    sortedRows.forEach(rKey => {
      filteredData[rKey] = {};
      finalRowTotals[rKey] = 0;
      sortedCols.forEach(cKey => {
        const val = rawData[rKey]?.[cKey] || 0;
        filteredData[rKey][cKey] = val;
        finalRowTotals[rKey] += val;
        finalColTotals[cKey] = (finalColTotals[cKey] || 0) + val;
        grand += val;
      });
    });

    return {
      title,
      rowHeader,
      colHeader,
      rows: sortedRows,
      cols: sortedCols,
      data: filteredData,
      rowTotals: finalRowTotals,
      colTotals: finalColTotals,
      grandTotal: grand,
    };
  }

  const crossTabs = {
    brandByExpense: buildCrossTab(
      'Marka × Hizmet Türü Maliyet Matrisi',
      'Araç Markası',
      'Hizmet Türü',
      r => r.brand,
      r => r.expenseType
    ),
    fleetByBrand: buildCrossTab(
      'Filo / Bölge × Marka Maliyet Matrisi',
      'Filo / Bölge',
      'Marka',
      r => r.fleetGroup,
      r => r.brand
    ),
    supplierByBrand: buildCrossTab(
      'Servis Noktası × Marka Maliyet Matrisi',
      'Servis Noktası',
      'Marka',
      r => r.supplier,
      r => r.brand
    ),
    supplierByExpense: buildCrossTab(
      'Servis Noktası × Hizmet Türü Matrisi',
      'Servis Noktası',
      'Hizmet Türü',
      r => r.supplier,
      r => r.expenseType
    ),
    yearByKmSegment: buildCrossTab(
      'Model Yılı × KM Segmenti Matrisi',
      'Model Yılı',
      'KM Segmenti',
      r => String(r.modelYear || 'Bilinmiyor'),
      r => {
        if (r.km <= 50000) return '0-50k KM';
        if (r.km <= 100000) return '50-100k KM';
        if (r.km <= 150000) return '100-150k KM';
        if (r.km <= 200000) return '150-200k KM';
        return '200k+ KM';
      },
      8,
      5
    ),
  };

  // 8. STRATEGIC ROADMAP
  const criticalRiskCount = riskRecords.filter(r => r.riskLevel === 'Kritik Risk').length;
  const topSupplier = supplierStats[0]?.name || 'Ana Servis';
  const topSupplierCost = supplierStats[0]?.totalCost || 0;
  const outlierRecords = records.filter(r => r.isOutlier);

  const strategicRoadmap: StrategicAction[] = [
    {
      id: 'act-1',
      timeframe: '0-3 Ay (Hızlı Kazanımlar)',
      priority: 'Yüksek',
      title: 'Uç Değer Fatura ve Outlier Kalemleri İtiraz/Denetim Süreci',
      description: `Ortalama maliyetin çok üzerinde kalan ${outlierRecords.length} adet fatura ve anormal parça/işçilik fiyatları için servis noktalarıyla mutabakat ve teknik denetim başlatılması.`,
      targetVehiclesOrVendors: `${outlierRecords.length} Adet Anomali Faturası`,
      potentialSavingsEstimate: `${Math.round(totalCost * 0.05).toLocaleString('tr-TR')} ₺ (%5 Tasarruf)`,
      status: 'Uygulanabilir',
    },
    {
      id: 'act-2',
      timeframe: '0-3 Ay (Hızlı Kazanımlar)',
      priority: 'Yüksek',
      title: 'Kritik Riskli Yaşlı & Yüksek KM Araçların Satış/İhale Takvimi',
      description: `Filoda hem 8 yaşını hem de 150.000 KM sınırını aşmış ${criticalRiskCount} adet aracın ağır bakım maliyetleri oluşmadan 2. el piyasasında satışa çıkarılması.`,
      targetVehiclesOrVendors: `${criticalRiskCount} Adet Kritik Araç`,
      potentialSavingsEstimate: `${Math.round(totalCost * 0.08).toLocaleString('tr-TR')} ₺ (%8 Bakım Yükü Azalışı)`,
      status: 'Uygulanabilir',
    },
    {
      id: 'act-3',
      timeframe: '3-12 Ay (Orta Vade / Sözleşmeler)',
      priority: 'Stratejik',
      title: 'Lider Tedarikçi ile İskonto & SLA Sözleşme Revizyonu',
      description: `Toplam harcamanın en büyük kısmını alan ${topSupplier} (${topSupplierCost.toLocaleString('tr-TR')} ₺) ile toplu parça iskontosu (%15) ve sabit işçilik saat ücreti anlaşması yapılması.`,
      targetVehiclesOrVendors: topSupplier,
      potentialSavingsEstimate: `${Math.round(topSupplierCost * 0.12).toLocaleString('tr-TR')} ₺ (%12 İskonto)`,
      status: 'İncelemede',
    },
    {
      id: 'act-4',
      timeframe: '3-12 Ay (Orta Vade / Sözleşmeler)',
      priority: 'Orta',
      title: 'Önleyici (Preventif) Bakım Disiplini ve Telemetri Entegrasyonu',
      description: `Plansız onarım ve ağır revizyon maliyetlerini önlemek için periyodik bakım aralıklarının telemetri tabanlı canlı kilometre takibiyle otomasyona bağlanması.`,
      targetVehiclesOrVendors: 'Tüm Filo Araçları',
      potentialSavingsEstimate: 'Plansız Arızalarda %30 Düşüş',
      status: 'Önerilen',
    },
    {
      id: 'act-5',
      timeframe: '12+ Ay (Uzun Vade / Filo Dönüşümü)',
      priority: 'Stratejik',
      title: 'Düşük KM Başı Maliyetli Markalara Dayalı Filo Standardizasyonu',
      description: `KM başına en düşük bakım gideri üreten markalara ağırlık verilerek filo marka çeşitliliğinin azaltılması ve yedek parça tedarik avantajı sağlanması.`,
      targetVehiclesOrVendors: 'Filo Tedarik Stratejisi',
      potentialSavingsEstimate: `${Math.round(totalCost * 0.15).toLocaleString('tr-TR')} ₺ (%15 TCO İyileşmesi)`,
      status: 'Önerilen',
    },
  ];

  return {
    summary,
    brandStats,
    engineIssueStats,
    supplierStats,
    fleetStats,
    vehicleSpendStats,
    expenseTypeStats,
    kmSegmentStats,
    kmStats: kmSegmentStats,
    ageSegmentStats,
    ageStats: ageSegmentStats,
    paretoBrands,
    paretoSuppliers,
    paretoExpenseTypes,
    paretoFleets,
    riskRecords,
    brandExpenseMatrix: crossTabs.brandByExpense,
    supplierBrandMatrix: crossTabs.supplierByBrand,
    crossTabs,
    strategicRoadmap,
  };
}
