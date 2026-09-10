import * as XLSX from 'xlsx';
import { AnalyticsResult } from './analyticsEngine';
import { AnomalyItem, DataQualityMetrics, NormalizedFleetRecord, PartsAnalyticsSummary } from '../types';

export function exportComprehensiveFleetReport(
  analyticsOrRecords: AnalyticsResult | NormalizedFleetRecord[],
  recordsOrAnalytics: NormalizedFleetRecord[] | AnalyticsResult,
  anomalies: AnomalyItem[],
  qualityMetrics: DataQualityMetrics,
  fileName: string = 'Filo_Analiz_ve_Karar_Destek_Raporu.xlsx',
  partsAnalytics?: PartsAnalyticsSummary
) {
  // Support flexible argument order
  let analytics: AnalyticsResult;
  let records: NormalizedFleetRecord[];

  if ('summary' in analyticsOrRecords) {
    analytics = analyticsOrRecords as AnalyticsResult;
    records = recordsOrAnalytics as NormalizedFleetRecord[];
  } else {
    records = analyticsOrRecords as NormalizedFleetRecord[];
    analytics = recordsOrAnalytics as AnalyticsResult;
  }

  const wb = XLSX.utils.book_new();

  // 1. SHEET: Yönetici Özeti (Executive Summary)

  const summaryRows = [
    ['FİLO ANALİZ VE KARAR DESTEK RAPORU - YÖNETİCİ ÖZETİ'],
    ['Rapor Oluşturma Tarihi', new Date().toLocaleDateString('tr-TR')],
    [],
    ['TEMEL FİLO METRİKLERİ', 'DEĞER', 'BİRİM / AÇIKLAMA'],
    ['Toplam Filo Harcaması', analytics.summary.totalCost, 'TL (₺)'],
    ['Toplam Aktif Araç Sayısı', analytics.summary.totalVehicles, 'Adet'],
    ['Araç Başına Ortalama Maliyet', analytics.summary.avgCostPerVehicle, 'TL / Araç'],
    ['Toplam Servis / Bakım İşlemi', analytics.summary.totalRecords, 'Adet İş Emri'],
    ['İşlem Başına Ortalama Tutar (Ticket)', analytics.summary.avgTicketCost, 'TL / İşlem'],
    ['Toplam Filo Kilometresi', analytics.summary.totalKm, 'KM'],
    ['KM Başına Ortalama Bakım Maliyeti', analytics.summary.costPerKm, 'TL / KM'],
    ['Filo Ortalama Araç Yaşı', analytics.summary.avgVehicleAge, 'Yıl'],
    ['Filo Ortalama Araç Kilometresi', analytics.summary.avgVehicleKm, 'KM'],
    ['Planlı Periyodik Bakım Oranı', `%${analytics.summary.maintenanceSharePct}`, 'Önleyici Bakım'],
    ['Plansız Arıza / Onarım Oranı', `%${analytics.summary.repairSharePct}`, 'Reaktif Onarım'],
    ['Veri Kalitesi ve Güvenilirlik Skoru', `%${qualityMetrics.overallScore}`, '100 Üzerinden'],
    [],
    ['ZAMAN KADEMELİ STRATEJİK AKSİYON PLANI'],
    ['Zaman Çerçevesi', 'Öncelik', 'Stratejik Aksiyon', 'Hedef Kitle', 'Tahmini Tasarruf Potansiyeli', 'Durum'],
    ...analytics.strategicRoadmap.map(a => [
      a.timeframe,
      a.priority,
      a.title,
      a.targetVehiclesOrVendors,
      a.potentialSavingsEstimate,
      a.status,
    ]),
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Yonetici_Ozeti');

  // 2. SHEET: Marka Analizi (Brand Analysis)
  const brandHeaders = [
    'Marka',
    'Toplam Harcama (₺)',
    'Araç Sayısı',
    'Araç Başına Maliyet (₺)',
    'Filo Maliyet Payı (%)',
    'İşlem Sayısı',
    'Ortalama İşlem Tutarı (₺)',
    'Ortalama KM',
    'Ortalama Yaş',
    'KM Başına Maliyet (₺/KM)',
  ];
  const brandRows = analytics.brandStats.map(b => [
    b.name,
    b.totalCost,
    b.vehicleCount,
    b.costPerVehicle,
    b.costSharePct,
    b.operationCount,
    b.avgTicket,
    b.avgKm,
    b.avgAge,
    b.costPerKm,
  ]);
  const wsBrand = XLSX.utils.aoa_to_sheet([brandHeaders, ...brandRows]);
  XLSX.utils.book_append_sheet(wb, wsBrand, 'Marka_Analizi');

  // 3. SHEET: Tedarikçi / Servis Analizi (Supplier Analysis)
  const supplierHeaders = [
    'Servis / Tedarikçi Noktası',
    'Toplam Harcama (₺)',
    'Hizmet Verilen Araç Sayısı',
    'Araç Başı Maliyet (₺)',
    'Harcama Payı (%)',
    'İşlem Sayısı',
    'Ortalama Fatura Tutarı (₺)',
    'Tedarikçi Fiyat Endeksi (100 = Filo Ort.)',
    'Ağırlıklı Marka',
  ];
  const supplierRows = analytics.supplierStats.map(s => [
    s.name,
    s.totalCost,
    s.vehicleCount,
    s.costPerVehicle,
    s.costSharePct,
    s.operationCount,
    s.avgTicket,
    s.vendorPriceIndex,
    s.primaryBrand,
  ]);
  const wsSupplier = XLSX.utils.aoa_to_sheet([supplierHeaders, ...supplierRows]);
  XLSX.utils.book_append_sheet(wb, wsSupplier, 'Servis_Harcama_Analizi');

  // 3.5. SHEET: Araç & Plaka Harcama Analizi (Vehicle Spend Analysis)
  const vehicleSpendHeaders = [
    'Plaka',
    'Marka',
    'Model',
    'Model Yılı',
    'Araç Yaşı',
    'Son KM',
    'Filo Grubu',
    'Toplam Harcama (₺)',
    'Filo Harcama Payı (%)',
    'Toplam İşlem Sayısı',
    'Ortalama Fatura (₺)',
    'KM Başına Harcama (₺/KM)',
    'En Çok Gidilen Servis',
    'Gittiği Servisler & Harcama Detayı',
    'Risk Seviyesi',
  ];
  const vehicleSpendRows = (analytics.vehicleSpendStats || []).map(v => [
    v.plate,
    v.brand,
    v.model,
    v.modelYear,
    v.age,
    v.km,
    v.fleetGroup,
    v.totalCost,
    v.costSharePct,
    v.operationCount,
    v.avgTicketCost,
    v.costPerKm,
    v.primaryService,
    v.servicesVisited.map(s => `${s.serviceName}: ${s.totalCost.toLocaleString('tr-TR')} ₺ (%${s.costSharePct})`).join('; '),
    v.riskLevel,
  ]);
  const wsVehicleSpend = XLSX.utils.aoa_to_sheet([vehicleSpendHeaders, ...vehicleSpendRows]);
  XLSX.utils.book_append_sheet(wb, wsVehicleSpend, 'Plaka_Harcama_Analizi');

  // 4. SHEET: Hizmet Türü Analizi (Expense Types)
  const expenseHeaders = [
    'Hizmet / Gider Türü',
    'Toplam Maliyet (₺)',
    'İşlem Sayısı',
    'Maliyet Payı (%)',
    'Ortalama İşlem Tutarı (₺)',
    'Bakım Türü',
  ];
  const expenseRows = analytics.expenseTypeStats.map(e => [
    e.name,
    e.totalCost,
    e.operationCount,
    e.costSharePct,
    e.avgCost,
    e.isPlannedMaintenance ? 'Planlı Bakım' : 'Onarım / Arıza / Sarf',
  ]);
  const wsExpense = XLSX.utils.aoa_to_sheet([expenseHeaders, ...expenseRows]);
  XLSX.utils.book_append_sheet(wb, wsExpense, 'Hizmet_Turu_Analizi');

  // 5. SHEET: KM ve Yaş Segmentasyonu (KM & Age Analysis)
  const kmHeaders = ['KM Segmenti', 'Toplam Harcama (₺)', 'Araç Sayısı', 'Araç Başı Ortalama (₺)', 'İşlem Adedi'];
  const kmRows = analytics.kmSegmentStats.map(k => [k.segment, k.totalCost, k.vehicleCount, k.avgCostPerVehicle, k.operationCount]);

  const ageHeaders = ['Yaş Grubu', 'Toplam Harcama (₺)', 'Araç Sayısı', 'Araç Başı Ortalama (₺)', 'İşlem Adedi'];
  const ageRows = analytics.ageSegmentStats.map(a => [a.segment, a.totalCost, a.vehicleCount, a.avgCostPerVehicle, a.operationCount]);

  const wsKmAge = XLSX.utils.aoa_to_sheet([
    ['KİLOMETRE SEGMENTLERİ MALİYET DAĞILIMI'],
    kmHeaders,
    ...kmRows,
    [],
    ['MODEL YAŞI SEGMENTLERİ MALİYET DAĞILIMI'],
    ageHeaders,
    ...ageRows,
  ]);
  XLSX.utils.book_append_sheet(wb, wsKmAge, 'KM_ve_Yas_Analizi');

  // 6. SHEET: Pareto (80/20) Analizi
  const paretoBrandHeaders = ['Sıra', 'Marka', 'Harcama (₺)', 'Pay (%)', 'Kümülatif Tutar (₺)', 'Kümülatif (%)', 'Kritik %80 Sürücüsü'];
  const paretoBrandRows = analytics.paretoBrands.map(p => [
    p.rank,
    p.name,
    p.cost,
    p.costSharePct,
    p.cumulativeCost,
    p.cumulativePct,
    p.isKeyDriver ? 'EVET (%80 Kapsamında)' : 'HAYIR',
  ]);

  const paretoSuppHeaders = ['Sıra', 'Servis / Tedarikçi', 'Harcama (₺)', 'Pay (%)', 'Kümülatif Tutar (₺)', 'Kümülatif (%)', 'Kritik %80 Sürücüsü'];
  const paretoSuppRows = analytics.paretoSuppliers.map(p => [
    p.rank,
    p.name,
    p.cost,
    p.costSharePct,
    p.cumulativeCost,
    p.cumulativePct,
    p.isKeyDriver ? 'EVET (%80 Kapsamında)' : 'HAYIR',
  ]);

  const wsPareto = XLSX.utils.aoa_to_sheet([
    ['PARETO (%80/20) MARKA HARCAMA ANALİZİ'],
    paretoBrandHeaders,
    ...paretoBrandRows,
    [],
    ['PARETO (%80/20) TEDARİKÇİ / SERVİS HARCAMA ANALİZİ'],
    paretoSuppHeaders,
    ...paretoSuppRows,
  ]);
  XLSX.utils.book_append_sheet(wb, wsPareto, 'Pareto_80_20');

  // 7. SHEET: Risk Matrisi ve Aksiyonlar (Vehicle Risk Matrix)
  const riskHeaders = [
    'Plaka',
    'Marka',
    'Model',
    'Model Yılı',
    'Araç Yaşı',
    'Kilometre (KM)',
    'Toplam Harcama (₺)',
    'İşlem Sayısı',
    'Filo / Bölge',
    'Risk Düzeyi',
    'Risk Skoru (0-100)',
    'Risk Gerekçeleri',
    'Önerilen Aksiyon',
    'Aksiyon Aciliyeti',
  ];
  const riskRows = analytics.riskRecords.map(r => [
    r.plate,
    r.brand,
    r.model,
    r.modelYear,
    r.age,
    r.km,
    r.totalCost,
    r.operationCount,
    r.fleetGroup,
    r.riskLevel,
    r.riskScore,
    r.riskReasons.join('; '),
    r.recommendedAction,
    r.actionUrgency,
  ]);
  const wsRisk = XLSX.utils.aoa_to_sheet([riskHeaders, ...riskRows]);
  XLSX.utils.book_append_sheet(wb, wsRisk, 'Risk_Matrisi_ve_Aksiyonlar');

  // 8. SHEET: Çapraz Tablolar (Cross-Tabulations)
  const cb = analytics.crossTabs.brandByExpense;
  const cbCols = cb.cols || [];
  const cbHeader = [cb.rowHeader, ...cbCols, 'GENEL TOPLAM'];
  const cbRows = cb.rows.map(r => [
    r,
    ...cbCols.map(c => cb.data[r]?.[c] || 0),
    cb.rowTotals[r] || 0,
  ]);
  const cbFooter = ['TOPLAM', ...cbCols.map(c => cb.colTotals[c] || 0), cb.grandTotal];

  const wsCross = XLSX.utils.aoa_to_sheet([
    [cb.title],
    cbHeader,
    ...cbRows,
    cbFooter,
  ]);
  XLSX.utils.book_append_sheet(wb, wsCross, 'Capraz_Analizler');

  // 9. SHEET: Veri Kalitesi ve Anomaliler (Anomalies Audit)
  const anomHeaders = [
    'Satır No',
    'Plaka',
    'Anomali Türü',
    'Önem Derecesi',
    'Başlık',
    'Açıklama / Detay',
    'Ham / Orijinal Değer',
    'Düzeltilen Standart Değer',
    'İlgili Sütun',
  ];
  const anomRows = anomalies.map(a => [
    a.rowNumber,
    a.plate,
    a.type,
    a.severity.toUpperCase(),
    a.title,
    a.description,
    a.originalValue,
    a.correctedValue || '-',
    a.fieldName,
  ]);
  const wsAnom = XLSX.utils.aoa_to_sheet([
    ['VERİ KALİTESİ VE ANOMALİ DENETİM RAPORU'],
    ['Genel Veri Kalite Skoru', `%${qualityMetrics.overallScore}`],
    ['Otomatik Düzeltilen Marka Yazım Hataları', qualityMetrics.brandTyposFixed],
    ['Hatalı / Mantıksız Model Yılı Sayısı', qualityMetrics.invalidYearsCount],
    ['Negatif / 0 KM Kayıt Sayısı', qualityMetrics.invalidKmCount],
    ['KM ve Yaş Tutarsızlığı Sayısı', qualityMetrics.kmAgeMismatchesCount],
    ['Uç Değer (Outlier) Maliyet Sayısı', qualityMetrics.outliersCount],
    [],
    anomHeaders,
    ...anomRows,
  ]);
  XLSX.utils.book_append_sheet(wb, wsAnom, 'Anomali_ve_Veri_Kalitesi');

  // 10. SHEET: Normalize Edilmiş Temiz Veri (Clean Records)
  const cleanHeaders = [
    'Satır',
    'Plaka',
    'Marka (Standart)',
    'Orijinal Marka',
    'Model',
    'Model Yılı',
    'Araç Yaşı',
    'Kilometre (KM)',
    'Servis / Tedarikçi',
    'Hizmet Türü',
    'Filo / Bölge',
    'Tutar / Maliyet (₺)',
    'İşlem Tarihi',
    'Açıklama',
    'Uç Değer (Outlier)',
    'Tespit Edilen Anomali Sayısı',
  ];
  const cleanRows = records.map(r => [
    r.rowNumber,
    r.plate,
    r.brand,
    r.originalBrand,
    r.model,
    r.modelYear,
    r.age,
    r.km,
    r.supplier,
    r.expenseType,
    r.fleetGroup,
    r.totalPrice,
    r.date,
    r.description,
    r.isOutlier ? 'EVET' : 'HAYIR',
    r.anomalies?.length || 0,
  ]);
  const wsClean = XLSX.utils.aoa_to_sheet([cleanHeaders, ...cleanRows]);
  XLSX.utils.book_append_sheet(wb, wsClean, 'Normalize_Edilmis_Veri');

  // 11. SHEET: Parça Kataloğu ve Eşleştirme Analizi (Parts Catalog & Matching Analysis)
  if (partsAnalytics) {
    const partsHeaders = [
      'Satır',
      'Plaka',
      'Marka',
      'Servis Noktası',
      'Fatura Açıklaması',
      'Eşleşen Standart Parça',
      'Parça Kodu (OEM)',
      '1. Seviye Genel Kategori',
      '2. Seviye Alt Kategori',
      '3. Seviye Detay Grubu',
      'Tam Kategori Yolu',
      'Fatura Tutarı (₺)',
      'Eşleşme Güven Skoru (%)',
      'Eşleşme Seviyesi',
    ];

    const partRows = partsAnalytics.matches.map(m => [
      m.rowNumber,
      m.plate,
      m.brand,
      m.supplier,
      m.rawDescription,
      m.cleanPartName || m.matchedPartName || '(Özel İşlem)',
      m.matchedPartCode || '-',
      m.matchedCategoryLevel1 || '-',
      m.matchedCategoryLevel2 || '-',
      m.matchedCategoryLevel3 || '-',
      m.matchedCategory,
      m.totalPrice,
      `%${m.confidence}`,
      m.confidenceLevel,
    ]);

    const wsParts = XLSX.utils.aoa_to_sheet([
      ['PARÇA KATALOĞU VE 3 KADEMELİ HİYERARŞİK EŞLEŞTİRME RAPORU'],
      ['Katalog Kaynağı', partsAnalytics.catalogSource === 'custom' ? 'Özel Şirket Kataloğu' : 'Standart Parça Kataloğu'],
      ['Katalogdaki Parça Sayısı', partsAnalytics.catalogItemCount],
      ['Katalog Eşleşme Oranı', `%${partsAnalytics.matchRatePct}`],
      ['Eşleşen Kayıt Sayısı', partsAnalytics.matchedRecordsCount],
      ['Standartlaştırılan Parça Çeşidi', partsAnalytics.distinctMatchedPartsCount],
      [],
      partsHeaders,
      ...partRows,
    ]);

    XLSX.utils.book_append_sheet(wb, wsParts, 'Parca_Katalog_Analizi');
  }

  // Write and trigger download
  XLSX.writeFile(wb, fileName);
}

export const exportFleetReportToExcel = exportComprehensiveFleetReport;
