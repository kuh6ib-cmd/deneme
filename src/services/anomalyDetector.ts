import { AnomalyItem, ColumnMapping, DataQualityMetrics, NormalizedFleetRecord, RawFleetRecord } from '../types';
import { normalizeBrand, normalizeExpenseType, normalizePlate, parseCleanNumber } from './normalizer';

const CURRENT_YEAR = new Date().getFullYear();

export function auditFleetData(records: NormalizedFleetRecord[]): AnomalyItem[] {
  const anomalies: AnomalyItem[] = [];
  const currentYear = CURRENT_YEAR;

  // Step 1: Check individual records
  records.forEach((rec, idx) => {
    rec.anomalies = [];
    rec.isOutlier = false;
    const rowNumber = rec.rowNumber || idx + 2;

    // Brand typo correction anomaly
    if (rec.originalBrand && rec.brand && rec.originalBrand.toUpperCase() !== rec.brand) {
      const anom: AnomalyItem = {
        id: `anom-${rowNumber}-brand-typo`,
        rowNumber,
        plate: rec.plate,
        type: 'BRAND_TYPO',
        severity: 'low',
        title: 'Marka Yazım Düzeltmesi',
        description: `'${rec.originalBrand}' ifadesi standart '${rec.brand}' markasına dönüştürüldü.`,
        originalValue: rec.originalBrand,
        correctedValue: rec.brand,
        fieldName: 'Marka',
      };
      anomalies.push(anom);
      rec.anomalies.push(anom);
    }

    // Invalid model year
    if (rec.modelYear < 1990 || rec.modelYear > currentYear + 1) {
      const anom: AnomalyItem = {
        id: `anom-${rowNumber}-invalid-year`,
        rowNumber,
        plate: rec.plate,
        type: 'INVALID_YEAR',
        severity: 'high',
        title: 'Hatalı / Mantıksız Model Yılı',
        description: `Girilen model yılı (${rec.modelYear}) mantık sınırları dışında (<1990 veya >${currentYear + 1}).`,
        originalValue: rec.modelYear,
        correctedValue: currentYear - 4,
        fieldName: 'Model Yılı',
      };
      anomalies.push(anom);
      rec.anomalies.push(anom);
    }

    // Invalid KM
    if (rec.km <= 0 || rec.km > 1500000) {
      const anom: AnomalyItem = {
        id: `anom-${rowNumber}-invalid-km`,
        rowNumber,
        plate: rec.plate,
        type: 'INVALID_KM',
        severity: 'high',
        title: 'Negatif veya Geçersiz KM',
        description: `Araç kilometresi (${rec.km}) 0 veya mantıksız bir değerde.`,
        originalValue: rec.km,
        correctedValue: 50000,
        fieldName: 'Kilometre',
      };
      anomalies.push(anom);
      rec.anomalies.push(anom);
    }

    // KM and Age inconsistency
    if (rec.modelYear >= 1990 && rec.km > 0) {
      if (rec.age <= 1 && rec.km > 300000) {
        const anom: AnomalyItem = {
          id: `anom-${rowNumber}-km-age-mismatch-high`,
          rowNumber,
          plate: rec.plate,
          type: 'KM_AGE_MISMATCH',
          severity: 'medium',
          title: 'KM & Yaş Tutarsızlığı (Aşırı Yüksek KM)',
          description: `Araç ${rec.age} yaşında fakat ${rec.km.toLocaleString('tr-TR')} KM kaydedilmiş. Sayac hatası şüphesi.`,
          originalValue: `${rec.age} Yaş / ${rec.km} KM`,
          fieldName: 'KM & Model Yılı',
        };
        anomalies.push(anom);
        rec.anomalies.push(anom);
      } else if (rec.age >= 8 && rec.km < 3000) {
        const anom: AnomalyItem = {
          id: `anom-${rowNumber}-km-age-mismatch-low`,
          rowNumber,
          plate: rec.plate,
          type: 'KM_AGE_MISMATCH',
          severity: 'medium',
          title: 'KM & Yaş Tutarsızlığı (Şüpheli Düşük KM)',
          description: `Araç ${rec.age} yaşında ancak sadece ${rec.km.toLocaleString('tr-TR')} KM kaydedilmiş. Atıl filo veya sıfırlanmış sayaç şüphesi.`,
          originalValue: `${rec.age} Yaş / ${rec.km} KM`,
          fieldName: 'KM & Model Yılı',
        };
        anomalies.push(anom);
        rec.anomalies.push(anom);
      }
    }
  });

  // Step 2: Statistical Outlier Cost Detection
  let costSum = 0;
  let validCostCount = 0;
  for (let i = 0; i < records.length; i++) {
    const cost = records[i].totalPrice;
    if (cost > 0) {
      costSum += cost;
      validCostCount++;
    }
  }

  if (validCostCount > 5) {
    const mean = costSum / validCostCount;
    let varianceSum = 0;
    for (let i = 0; i < records.length; i++) {
      const cost = records[i].totalPrice;
      if (cost > 0) {
        varianceSum += Math.pow(cost - mean, 2);
      }
    }
    const variance = varianceSum / validCostCount;
    const stdDev = Math.sqrt(variance);
    const upperThreshold = mean + 2.5 * stdDev;

    records.forEach((rec, idx) => {
      const rowNumber = rec.rowNumber || idx + 2;
      if (rec.totalPrice > upperThreshold && rec.totalPrice > 25000) {
        rec.isOutlier = true;
        const anom: AnomalyItem = {
          id: `anom-${rowNumber}-outlier-cost`,
          rowNumber,
          plate: rec.plate,
          type: 'COST_OUTLIER',
          severity: 'high',
          title: 'Uç Değer (Outlier) Maliyet Tespiti',
          description: `İşlem tutarı (${rec.totalPrice.toLocaleString('tr-TR')} ₺), istatistiksel sınırın (Ort + 2.5σ = ${Math.round(upperThreshold).toLocaleString('tr-TR')} ₺) çok üzerinde.`,
          originalValue: `${rec.totalPrice.toLocaleString('tr-TR')} ₺`,
          fieldName: 'Tutar / Maliyet',
        };
        anomalies.push(anom);
        rec.anomalies.push(anom);
      }
    });
  }

  return anomalies;
}

export function computeQualityMetrics(
  records: NormalizedFleetRecord[],
  anomalies: AnomalyItem[]
): DataQualityMetrics {
  const totalRows = records.length || 1;
  let brandTyposFixed = 0;
  let invalidYearsCount = 0;
  let invalidKmCount = 0;
  let kmAgeMismatchesCount = 0;
  let outliersCount = 0;
  let missingDataCount = 0;
  const highSeverityRows = new Set<number>();

  for (let i = 0; i < anomalies.length; i++) {
    const a = anomalies[i];
    if (a.severity === 'high') {
      highSeverityRows.add(a.rowNumber);
    }
    switch (a.type) {
      case 'BRAND_TYPO': brandTyposFixed++; break;
      case 'INVALID_YEAR': invalidYearsCount++; break;
      case 'INVALID_KM': invalidKmCount++; break;
      case 'KM_AGE_MISMATCH': kmAgeMismatchesCount++; break;
      case 'COST_OUTLIER': outliersCount++; break;
      case 'MISSING_DATA': missingDataCount++; break;
    }
  }

  const validRows = Math.max(0, totalRows - highSeverityRows.size);

  const completenessScore = Math.max(0, Math.min(100, Math.round(100 - (missingDataCount / totalRows) * 100)));
  const validityScore = Math.max(0, Math.min(100, Math.round(100 - ((invalidYearsCount + invalidKmCount) / totalRows) * 50)));
  const consistencyScore = Math.max(0, Math.min(100, Math.round(100 - ((kmAgeMismatchesCount + outliersCount) / totalRows) * 40)));

  const overallScore = Math.max(10, Math.min(100, Math.round((completenessScore * 0.3) + (validityScore * 0.4) + (consistencyScore * 0.3))));

  return {
    totalRows,
    validRows,
    overallScore,
    brandTyposFixed,
    invalidYearsCount,
    invalidKmCount,
    kmAgeMismatchesCount,
    outliersCount,
    missingDataCount,
    completenessScore,
    validityScore,
    consistencyScore,
  };
}
