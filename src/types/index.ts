export interface RawFleetRecord {
  [key: string]: any;
}

export type SparePartOriginType = 'BOSCH' | 'DIGER_YP' | 'SIVILAR_KIMYASAL' | 'ISCILIK' | 'DIGER';

export interface ColumnMapping {
  plate: string;
  brand: string;
  model: string;
  modelYear: string;
  km: string;
  supplier: string;
  expenseType: string;
  fleetGroup: string;
  sparePartType?: string; // "y.p", "Y.P", "Yedek Parça Türü", vb.
  totalPrice: string;
  unitPrice?: string;
  quantity?: string;
  date: string;
  description: string;
}

export interface AnomalyItem {
  id: string;
  rowNumber: number;
  plate: string;
  type: 'BRAND_TYPO' | 'INVALID_YEAR' | 'INVALID_KM' | 'KM_AGE_MISMATCH' | 'COST_OUTLIER' | 'MISSING_DATA';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  originalValue: any;
  correctedValue?: any;
  fieldName: string;
}

export interface NormalizedFleetRecord {
  id: string;
  rowNumber: number;
  plate: string;
  brand: string;
  originalBrand: string;
  model: string;
  modelYear: number;
  age: number;
  km: number;
  supplier: string;
  expenseType: string;
  fleetGroup: string;
  cleanPartName?: string; // Gürültüden arındırılmış standart yalın parça ismi (Örn: "Ön Fren Balatası", "Yağ Filtresi")
  sparePartType?: string; // Ham Y.P. türü ("Bosch", "Diğer Y.P.", "Motor Yağı", "İşçilik")
  sparePartOrigin?: SparePartOriginType; // Standart sınıflandırılmış menşei
  sparePartOriginLabel?: string; // Kullanıcı dostu etiket
  wasReclassifiedFromOtherYP?: boolean; // Ham veride "Diğer Y.P." yazmasına rağmen açıklamadan İşçilik/Sıvı olarak düzeltildi mi?
  totalPrice: number;
  date: string;
  description: string;
  anomalies: AnomalyItem[];
  isOutlier: boolean;
}

export interface DataQualityMetrics {
  totalRows: number;
  validRows: number;
  overallScore: number;
  brandTyposFixed: number;
  invalidYearsCount: number;
  invalidKmCount: number;
  kmAgeMismatchesCount: number;
  outliersCount: number;
  missingDataCount: number;
  completenessScore: number;
  validityScore: number;
  consistencyScore: number;
}

export interface FleetSummaryMetrics {
  totalCost: number;
  totalVehicles: number;
  avgCostPerVehicle: number;
  totalRecords: number;
  avgTicketCost: number;
  medianCost: number;
  minCost: number;
  maxCost: number;
  totalKm: number;
  avgVehicleAge: number;
  avgVehicleKm: number;
  costPerKm: number;
  maintenanceSharePct: number;
  repairSharePct: number;
  dataQualityScore: number;
}

export interface BrandStat {
  name: string;
  totalCost: number;
  vehicleCount: number;
  costPerVehicle: number;
  costSharePct: number;
  operationCount: number;
  avgTicket: number;
  avgKm: number;
  avgAge: number;
  costPerKm: number;
}

export interface DetectedChronicFailure {
  system: string; // e.g. 'DPF & Egzoz Emisyon', 'Enjektör & Yakıt', 'Triger & Motor Mekaniği', 'Kavrama / Şanzıman', 'Soğutma Grubu', 'Turboşarj & Emiş'
  issueName: string; // e.g. 'EGR Valfi & DPF Tıkanıklığı'
  count: number;
  vehicleCount: number;
  vehicleIncidencePct: number;
  totalCost: number;
}

export interface EngineCategoryBreakdown {
  category: string;
  cost: number;
  count: number;
  sharePct: number;
}

export interface EngineIssueStat {
  id: string;
  brand: string;
  model: string;
  engineType: string;
  fuelType: string;
  vehicleCount: number;
  totalCost: number;
  costPerVehicle: number;
  costPerKm: number;
  operationCount: number;
  ticketPerVehicle: number;
  avgKm: number;
  avgAge: number;
  failureRateIndex: number; // 0 - 100
  issueLevel: 'Kritik Sorunlu' | 'Yüksek Arıza Riski' | 'Orta Risk' | 'Sorunsuz / Düşük Risk';
  chronicIssues: string[];
  topFailedParts: { name: string; cost: number; count: number }[];
  commonFailureAreas: string[];
  expertAdvice: string;
  plates: string[];
  // Genişletilmiş Filo Karar Destek Alanları
  unscheduledCost?: number;
  scheduledCost?: number;
  unscheduledCostPct?: number;
  detectedChronicFailures?: DetectedChronicFailure[];
  breakdownByCategory?: EngineCategoryBreakdown[];
  sampleConfidence?: 'Yüksek (Geniş Filo)' | 'Orta' | 'Düşük (Az Sayıda Araç)';
  mechanicalIncidencePct?: number;
}

export interface SupplierServedPlate {
  plate: string;
  brand: string;
  model: string;
  totalCost: number;
  operationCount: number;
  costSharePct: number;
}

export interface SupplierStat {
  name: string;
  totalCost: number;
  vehicleCount: number;
  costPerVehicle: number;
  costSharePct: number;
  operationCount: number;
  avgTicket: number;
  vendorPriceIndex: number; // 100 is avg, >100 is more expensive
  primaryBrand: string;
  servedPlates?: SupplierServedPlate[];
}

export interface VehicleServiceBreakdown {
  serviceName: string;
  totalCost: number;
  operationCount: number;
  costSharePct: number;
}

export interface VehicleSpendStat {
  plate: string;
  brand: string;
  model: string;
  modelYear: number;
  age: number;
  km: number;
  fleetGroup: string;
  totalCost: number; // Şu plakada olan araba toplam şu kadar harcamış
  costSharePct: number;
  operationCount: number;
  avgTicketCost: number;
  costPerKm: number;
  servicesVisited: VehicleServiceBreakdown[];
  primaryService: string;
  riskLevel: RiskLevel;
  riskScore: number;
}

export interface ExpenseTypeStat {
  name: string;
  totalCost: number;
  operationCount: number;
  costSharePct: number;
  avgCost: number;
  isPlannedMaintenance: boolean;
}

export interface KmSegmentStat {
  segment: string;
  totalCost: number;
  vehicleCount: number;
  avgCostPerVehicle: number;
  operationCount: number;
  totalKm?: number;
  costPerKm?: number;
}

export interface AgeSegmentStat {
  segment: string;
  totalCost: number;
  vehicleCount: number;
  avgCostPerVehicle: number;
  operationCount: number;
  costPerKm?: number;
}

export interface ParetoItem {
  name: string;
  cost: number;
  costSharePct: number;
  cumulativeCost: number;
  cumulativePct: number;
  isKeyDriver: boolean; // Part of 80%
  rank: number;
}

export type RiskLevel = 'Kritik Risk' | 'Yüksek KM Riski' | 'Yaş Riski' | 'Maliyet Riski' | 'Düşük / Normal Risk';

export interface VehicleRiskRecord {
  plate: string;
  brand: string;
  model: string;
  modelYear: number;
  age: number;
  km: number;
  totalCost: number;
  operationCount: number;
  fleetGroup: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  riskReasons: string[];
  anomalies: string[];
  recommendedAction: string;
  actionUrgency: 'Acil' | 'Orta Vadeli' | 'Rutin Takip';
}

export interface CrossTabMatrix {
  title: string;
  rowHeader: string;
  colHeader: string;
  rows: string[];
  cols: string[];
  data: { [row: string]: { [col: string]: number } };
  rowTotals: { [row: string]: number };
  colTotals: { [col: string]: number };
  grandTotal: number;
}

export interface FleetRecommendation {
  id: string;
  category: 'BOSCH_PARTS' | 'VEHICLE_RENEWAL' | 'SERVICE_CONSOLIDATION' | 'PREVENTIVE_MAINTENANCE';
  title: string;
  description: string;
  impactLevel: 'Yüksek' | 'Orta' | 'Stratejik';
  estimatedSavings: string;
  suggestedAction: string;
}

export interface FleetGroupStat {
  name: string;
  totalCost: number;
  vehicleCount: number;
  costPerVehicle: number;
  costSharePct: number;
  operationCount: number;
  avgTicket: number;
  avgKm: number;
  avgAge: number;
  costPerKm: number;
  maintenanceSharePct: number;
  repairSharePct: number;
  boschPartsSpend: number;
  otherPartsSpend: number;
  fluidsSpend: number;
  laborSpend: number;
  boschSharePct: number;
  criticalVehiclesCount: number;
  topVehicles: {
    plate: string;
    brand: string;
    model: string;
    cost: number;
    km: number;
    age: number;
    riskLevel: RiskLevel;
  }[];
  topSuppliers: {
    name: string;
    cost: number;
    count: number;
  }[];
  topUsedParts?: {
    name: string;
    count: number;
    totalCost: number;
  }[];
  topRenewVehicles?: {
    plate: string;
    brand: string;
    model: string;
    km: number;
    age: number;
    cost: number;
    reason: string;
  }[];
  recommendations: FleetRecommendation[];
}

export interface StrategicAction {
  id: string;
  timeframe: '0-3 Ay (Hızlı Kazanımlar)' | '3-12 Ay (Orta Vade / Sözleşmeler)' | '12+ Ay (Uzun Vade / Filo Dönüşümü)';
  priority: 'Yüksek' | 'Orta' | 'Stratejik';
  title: string;
  description: string;
  targetVehiclesOrVendors: string;
  potentialSavingsEstimate: string;
  status: 'Önerilen' | 'İncelemede' | 'Uygulanabilir';
}

export interface PartCatalogItem {
  id: string;
  code: string;
  name: string;
  // 3-Kademeli Hiyerarşik Kategori (Genelden Özele)
  categoryLevel1: string; // 1. Seviye: Genel Kategori (Örn: Mekanik & Yürüyen, Periyodik Bakım)
  categoryLevel2: string; // 2. Seviye: Alt Kategori (Örn: Fren Sistemi, Filtre Grubu)
  categoryLevel3: string; // 3. Seviye: Detay / Parça Grubu (Örn: Ön Balata Takımı, Hava Filtresi)
  category: string; // Tam hiyerarşi yolu (L1 > L2 > L3)
  keywords: string[];
  unit: string;
  brandOrModel?: string;
  description?: string;
}

export type MatchConfidenceLevel = 'Tam Eşleşme' | 'Yüksek Eşleşme' | 'Kategori Eşleşti' | 'Eşleşmedi / Özel İşlem';

export interface PartMatchResult {
  recordId: string;
  rowNumber: number;
  plate: string;
  brand: string;
  supplier: string;
  expenseType: string;
  rawDescription: string;
  cleanPartName?: string; // Gürültüden arındırılmış standart yalın parça ismi
  totalPrice: number;
  sparePartType?: string;
  sparePartOrigin?: SparePartOriginType;
  sparePartOriginLabel?: string;
  wasReclassifiedFromOtherYP?: boolean;
  isMatched: boolean;
  matchedPartCode?: string;
  matchedPartName?: string;
  // 3-Kademeli Kategori Eşleşmesi (Genelden Özele)
  matchedCategoryLevel1?: string;
  matchedCategoryLevel2?: string;
  matchedCategoryLevel3?: string;
  matchedCategory: string;
  confidence: number;
  confidenceLevel: MatchConfidenceLevel;
  matchedKeywords: string[];
}

export interface PartCategoryStat {
  category: string;
  level1?: string;
  level2?: string;
  level3?: string;
  name?: string;
  partName?: string;
  count: number;
  totalCost: number;
  sharePct: number;
  avgCost: number;
}

export interface TopReplacedPartStat {
  code: string;
  name: string;
  categoryLevel1?: string;
  categoryLevel2?: string;
  categoryLevel3?: string;
  category: string;
  count: number;
  totalCost: number;
  avgActualPrice: number;
}

export interface PartsAnalyticsSummary {
  catalogSource: 'default' | 'custom';
  catalogItemCount: number;
  totalSpend: number;
  matchedRecordsCount: number;
  unmatchedRecordsCount: number;
  matchRatePct: number;
  distinctMatchedPartsCount: number;
  // Bosch vs Non-Bosch Breakdown
  boschSpend: number;
  otherPartsSpend: number;
  fluidsSpend: number;
  laborSpend: number;
  boschSpendPct: number;
  otherPartsSpendPct: number;
  fluidsSpendPct: number;
  laborSpendPct: number;
  categoryBreakdown: PartCategoryStat[];
  topReplacedParts: TopReplacedPartStat[];
  matches: PartMatchResult[];
}

