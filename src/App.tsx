import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { 
  ColumnMapping, 
  NormalizedFleetRecord, 
  RawFleetRecord, 
  AnomalyItem, 
  DataQualityMetrics,
  PartCatalogItem,
  PartsAnalyticsSummary
} from './types';
import { SAMPLE_FLEET_DATA } from './services/sampleData';
import { autoDetectMapping } from './services/columnDetector';
import { normalizeFleetRecords, normalizeFleetRecordsAsync } from './services/normalizer';
import { auditFleetData, computeQualityMetrics } from './services/anomalyDetector';
import { computeFleetAnalytics, AnalyticsResult } from './services/analyticsEngine';
import { exportFleetReportToExcel } from './services/excelExporter';
import { 
  DEFAULT_PARTS_CATALOG, 
  computePartsAnalytics,
  loadCatalogFromStorage,
  saveCatalogToStorage,
  setActiveCatalog
} from './services/partsCatalogService';
import { parseLargeFleetFile, ParseProgress } from './services/excelImporter';

import { Header } from './components/Header';
import { Navigation, TabId } from './components/Navigation';
import { FleetFilterBar } from './components/FleetFilterBar';
import { ColumnMapperModal } from './components/ColumnMapperModal';
import { AiInsightsModal } from './components/AiInsightsModal';
import { PartsCatalogModal } from './components/PartsCatalogModal';
import { FleetAnalysisModal } from './components/FleetAnalysisModal';
import { FileLoadingModal } from './components/FileLoadingModal';
import { FleetGroupStat } from './types';

import { ExecutiveSummaryView } from './components/views/ExecutiveSummaryView';
import { VehicleSpendView } from './components/views/VehicleSpendView';
import { PartsCatalogView } from './components/views/PartsCatalogView';
import { BrandAnalysisView } from './components/views/BrandAnalysisView';
import { SupplierAnalysisView } from './components/views/SupplierAnalysisView';
import { ExpenseTypeView } from './components/views/ExpenseTypeView';
import { KmAgeView } from './components/views/KmAgeView';
import { ParetoView } from './components/views/ParetoView';
import { RiskMatrixView } from './components/views/RiskMatrixView';
import { CrossTabsView } from './components/views/CrossTabsView';
import { DataQualityView } from './components/views/DataQualityView';
import { DataTableView } from './components/views/DataTableView';


interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center space-y-4">
            <div className="h-12 w-12 rounded-xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center font-bold text-xl">
              !
            </div>
            <h2 className="text-lg font-bold text-slate-100">Bir Hata Oluştu</h2>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || 'Uygulama çalıştırılırken beklenmeyen bir hata meydana geldi.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Yeniden Başlat
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function FleetApp() {
  const [datasetName, setDatasetName] = useState<string>('Örnek Filo Bakım Verisi (30+ Araç)');
  const [rawRecords, setRawRecords] = useState<RawFleetRecord[]>(SAMPLE_FLEET_DATA);
  const [availableHeaders, setAvailableHeaders] = useState<string[]>(() => {
    return SAMPLE_FLEET_DATA.length > 0 ? Object.keys(SAMPLE_FLEET_DATA[0]) : [];
  });
  const [mapping, setMapping] = useState<ColumnMapping>(() => {
    const headers = SAMPLE_FLEET_DATA.length > 0 ? Object.keys(SAMPLE_FLEET_DATA[0]) : [];
    return autoDetectMapping(headers);
  });
  const [activeTab, setActiveTab] = useState<TabId>('summary');

  // Parts Catalog State with LocalStorage Persistence
  const [catalogState, setCatalogState] = useState<{ catalog: PartCatalogItem[]; source: 'default' | 'custom' }>(() => {
    const loaded = loadCatalogFromStorage();
    if (loaded && loaded.catalog && loaded.catalog.length > 0) {
      setActiveCatalog(loaded.catalog);
    }
    return loaded;
  });
  const partsCatalog = catalogState.catalog;
  const catalogSource = catalogState.source;

  // Keep active parts catalog synchronized for normalization
  useEffect(() => {
    if (partsCatalog && partsCatalog.length > 0) {
      setActiveCatalog(partsCatalog);
    }
  }, [partsCatalog]);

  // Modals & Fleet Filter State
  const [isMapperOpen, setIsMapperOpen] = useState<boolean>(false);
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [isPartsModalOpen, setIsPartsModalOpen] = useState<boolean>(false);
  const [isFleetModalOpen, setIsFleetModalOpen] = useState<boolean>(false);
  const [selectedFleet, setSelectedFleet] = useState<string>('ALL');
  const [inspectingFleet, setInspectingFleet] = useState<FleetGroupStat | null>(null);

  // Large File Loading State
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [parseProgress, setParseProgress] = useState<ParseProgress | null>(null);
  const [loadingFileName, setLoadingFileName] = useState<string>('');
  const [parseError, setParseError] = useState<string | null>(null);

  // Initialize dataset & normalization
  const [normalizedRecords, setNormalizedRecords] = useState<NormalizedFleetRecord[]>(() => {
    const headers = SAMPLE_FLEET_DATA.length > 0 ? Object.keys(SAMPLE_FLEET_DATA[0]) : [];
    const initMapping = autoDetectMapping(headers);
    return normalizeFleetRecords(SAMPLE_FLEET_DATA, initMapping, DEFAULT_PARTS_CATALOG);
  });

  // Initialize mapping on dataset change
  const initializeDataset = useCallback((records: RawFleetRecord[], name: string, explicitHeaders?: string[]) => {
    if (!records || records.length === 0) return;
    const headers = explicitHeaders && explicitHeaders.length > 0 
      ? explicitHeaders 
      : Object.keys(records[0] || {});
    setAvailableHeaders(headers);
    const detected = autoDetectMapping(headers);
    setMapping(detected);
    setRawRecords(records);
    setDatasetName(name);
    setSelectedFleet('ALL');
    const norm = normalizeFleetRecords(records, detected, partsCatalog);
    setNormalizedRecords(norm);
  }, [partsCatalog]);

  // Run anomaly audit
  const anomalies: AnomalyItem[] = useMemo(() => {
    if (!normalizedRecords || normalizedRecords.length === 0) return [];
    return auditFleetData(normalizedRecords);
  }, [normalizedRecords]);

  // Compute quality metrics
  const qualityMetrics: DataQualityMetrics = useMemo(() => {
    return computeQualityMetrics(normalizedRecords, anomalies);
  }, [normalizedRecords, anomalies]);

  // Compute deep analytics
  const analytics: AnalyticsResult = useMemo(() => {
    return computeFleetAnalytics(normalizedRecords, qualityMetrics?.overallScore ?? 90);
  }, [normalizedRecords, qualityMetrics]);

  // Compute Parts & Components Analytics
  const partsAnalytics: PartsAnalyticsSummary = useMemo(() => {
    return computePartsAnalytics(normalizedRecords, partsCatalog, catalogSource);
  }, [normalizedRecords, partsCatalog, catalogSource]);

  // Handle File Upload (.xlsx, .xls, .csv) with Non-Blocking Progressive Loading
  const handleFileUpload = async (file: File) => {
    setLoadingFileName(file.name);
    setParseError(null);
    setIsLoadingFile(true);
    setParseProgress({
      stage: 'reading',
      percent: 10,
      message: 'Dosya okunuyor ve belleğe alınıyor...'
    });

    try {
      const result = await parseLargeFleetFile(file, (prog) => {
        setParseProgress(prog);
      });

      if (result.records.length > 0) {
        setParseProgress({
          stage: 'normalizing',
          percent: 65,
          message: 'Sütunlar otomatik haritalanıyor...',
          sheetName: result.sheetName,
          totalRows: result.records.length
        });
        await new Promise(r => setTimeout(r, 20));

        const detected = autoDetectMapping(result.headers);
        setAvailableHeaders(result.headers);
        setMapping(detected);
        setDatasetName(`${file.name} (${result.sheetName})`);
        setSelectedFleet('ALL');
        setRawRecords(result.records);

        // Progressively normalize in chunks without blocking the UI thread
        setParseProgress({
          stage: 'normalizing',
          percent: 70,
          message: `Katalog ve KEYWORDS_TR eşleştirmesi yapılıyor (${result.records.length.toLocaleString('tr-TR')} satır)...`,
          sheetName: result.sheetName,
          totalRows: result.records.length
        });

        const normalized = await normalizeFleetRecordsAsync(
          result.records,
          detected,
          (pct, curr, tot) => {
            setParseProgress({
              stage: 'normalizing',
              percent: 70 + Math.round(pct * 0.28),
              message: `${curr.toLocaleString('tr-TR')} / ${tot.toLocaleString('tr-TR')} kayıt normalize edildi...`,
              sheetName: result.sheetName,
              totalRows: tot
            });
          },
          partsCatalog
        );

        setNormalizedRecords(normalized);
        setActiveTab('summary');

        setParseProgress({
          stage: 'complete',
          percent: 100,
          message: `${normalized.length.toLocaleString('tr-TR')} satır başarıyla işlendi ve panele aktarıldı.`,
          sheetName: result.sheetName,
          totalRows: normalized.length
        });

        setTimeout(() => {
          setIsLoadingFile(false);
          setParseProgress(null);
        }, 600);
      } else {
        throw new Error('Dosyada işlenebilecek veri satırı bulunamadı.');
      }
    } catch (err: any) {
      console.error('File parse error:', err);
      setParseError(err?.message || 'Dosya okunurken bir hata oluştu. Lütfen geçerli bir Excel veya CSV dosyası yükleyin.');
    }
  };

  // Handle Column Mapping Updates Smoothly
  const handleApplyMapping = async (newMap: ColumnMapping) => {
    setMapping(newMap);
    if (!rawRecords || rawRecords.length === 0) return;

    if (rawRecords.length > 2000) {
      setIsLoadingFile(true);
      setLoadingFileName('Eşleştirme güncelleniyor');
      setParseProgress({
        stage: 'normalizing',
        percent: 40,
        message: 'Kayıtlar yeni sütun haritasıyla normalize ediliyor...'
      });

      const updated = await normalizeFleetRecordsAsync(
        rawRecords,
        newMap,
        (pct, curr, tot) => {
          setParseProgress({
            stage: 'normalizing',
            percent: 40 + Math.round(pct * 0.55),
            message: `${curr.toLocaleString('tr-TR')} / ${tot.toLocaleString('tr-TR')} kayıt güncellendi...`,
            totalRows: tot
          });
        },
        partsCatalog
      );

      setNormalizedRecords(updated);
      setParseProgress({
        stage: 'complete',
        percent: 100,
        message: 'Eşleştirme başarıyla tamamlandı!'
      });
      setTimeout(() => {
        setIsLoadingFile(false);
        setParseProgress(null);
      }, 400);
    } else {
      setNormalizedRecords(normalizeFleetRecords(rawRecords, newMap, partsCatalog));
    }
  };

  // Handle Catalog Updates Smoothly
  const handleUpdateCatalog = async (newCat: PartCatalogItem[], src: 'default' | 'custom') => {
    setCatalogState({ catalog: newCat, source: src });
    saveCatalogToStorage(newCat, src);
    setActiveCatalog(newCat);

    if (!rawRecords || rawRecords.length === 0) return;

    if (rawRecords.length > 2000) {
      setIsLoadingFile(true);
      setLoadingFileName('Katalog güncelleniyor');
      setParseProgress({
        stage: 'normalizing',
        percent: 40,
        message: 'Kayıtlar yeni parça kataloğu ve KEYWORDS_TR ile eşleştiriliyor...'
      });

      const updated = await normalizeFleetRecordsAsync(
        rawRecords,
        mapping,
        (pct, curr, tot) => {
          setParseProgress({
            stage: 'normalizing',
            percent: 40 + Math.round(pct * 0.55),
            message: `${curr.toLocaleString('tr-TR')} / ${tot.toLocaleString('tr-TR')} parça eşleştirildi...`,
            totalRows: tot
          });
        },
        newCat
      );

      setNormalizedRecords(updated);
      setParseProgress({
        stage: 'complete',
        percent: 100,
        message: 'Katalog eşleştirmesi güncellendi!'
      });
      setTimeout(() => {
        setIsLoadingFile(false);
        setParseProgress(null);
      }, 400);
    } else {
      setNormalizedRecords(normalizeFleetRecords(rawRecords, mapping, newCat));
    }
  };

  // Handle Export to Excel
  const handleExportExcel = () => {
    if (normalizedRecords.length === 0) return;
    exportFleetReportToExcel(
      normalizedRecords, 
      analytics, 
      anomalies, 
      qualityMetrics, 
      'Filo_Analiz_ve_Karar_Destek_Raporu.xlsx',
      partsAnalytics
    );
  };

  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(normalizedRecords.map(r => r.brand))).sort();
  }, [normalizedRecords]);

  const uniqueExpenses = useMemo(() => {
    return Array.from(new Set(normalizedRecords.map(r => r.expenseType))).sort();
  }, [normalizedRecords]);

  const criticalRiskCount = useMemo(() => {
    return analytics.riskRecords.filter(r => r.riskLevel === 'Kritik Risk').length;
  }, [analytics.riskRecords]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <Header
        dataQuality={qualityMetrics}
        onFileUpload={handleFileUpload}
        onLoadSample={() => initializeDataset(SAMPLE_FLEET_DATA, 'Örnek Filo Bakım Verisi (30+ Araç)')}
        onOpenColumnMapper={() => setIsMapperOpen(true)}
        onOpenAiInsights={() => setIsAiOpen(true)}
        onOpenPartsCatalog={() => setIsPartsModalOpen(true)}
        catalogItemCount={partsCatalog.length}
        onExportExcel={handleExportExcel}
        activeDatasetName={datasetName}
        totalVehicles={analytics.summary.totalVehicles}
        totalRecords={analytics.summary.totalRecords}
        totalCost={analytics.summary.totalCost}
        fleetStats={analytics.fleetStats || []}
        selectedFleet={selectedFleet}
        onSelectFleet={(fleetName) => setSelectedFleet(fleetName)}
        onInspectFleet={(fleetStat) => {
          setInspectingFleet(fleetStat);
          setIsFleetModalOpen(true);
        }}
      />

      {/* Tabs Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        anomalyCount={anomalies.length}
        criticalRiskCount={criticalRiskCount}
      />

      {/* Fleet Filter Bar */}
      <FleetFilterBar
        fleetStats={analytics.fleetStats || []}
        selectedFleet={selectedFleet}
        onSelectFleet={(fleetName) => setSelectedFleet(fleetName)}
        onInspectFleet={(fleetStat) => {
          setInspectingFleet(fleetStat);
          setIsFleetModalOpen(true);
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'summary' && (
          <ExecutiveSummaryView
            analytics={analytics}
            quality={qualityMetrics}
            onOpenAiInsights={() => setIsAiOpen(true)}
            onSelectTab={setActiveTab}
            onInspectFleet={(fleetStat) => {
              setInspectingFleet(fleetStat);
              setIsFleetModalOpen(true);
            }}
          />
        )}

        {activeTab === 'vehicle_spend' && (
          <VehicleSpendView
            vehicleSpendStats={analytics.vehicleSpendStats || []}
            normalizedRecords={normalizedRecords}
          />
        )}

        {activeTab === 'suppliers' && (
          <SupplierAnalysisView supplierStats={analytics.supplierStats} />
        )}

        {activeTab === 'parts' && (
          <PartsCatalogView
            partsAnalytics={partsAnalytics}
            catalog={partsCatalog}
            catalogSource={catalogSource}
            onOpenCatalogModal={() => setIsPartsModalOpen(true)}
          />
        )}

        {activeTab === 'brands' && (
          <BrandAnalysisView 
            brandStats={analytics.brandStats} 
            engineIssueStats={analytics.engineIssueStats}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseTypeView expenseTypeStats={analytics.expenseTypeStats} />
        )}

        {activeTab === 'km_age' && (
          <KmAgeView kmStats={analytics.kmStats} ageStats={analytics.ageStats} />
        )}

        {activeTab === 'pareto' && (
          <ParetoView
            paretoBrands={analytics.paretoBrands}
            paretoSuppliers={analytics.paretoSuppliers}
            paretoExpenseTypes={analytics.paretoExpenseTypes}
            paretoFleets={analytics.paretoFleets}
          />
        )}

        {activeTab === 'risks' && (
          <RiskMatrixView riskRecords={analytics.riskRecords} />
        )}

        {activeTab === 'crosstabs' && (
          <CrossTabsView
            brandExpenseMatrix={analytics.brandExpenseMatrix}
            supplierBrandMatrix={analytics.supplierBrandMatrix}
          />
        )}

        {activeTab === 'quality' && (
          <DataQualityView
            metrics={qualityMetrics}
            anomalies={anomalies}
            records={normalizedRecords}
          />
        )}

        {activeTab === 'records' && (
          <DataTableView
            normalizedRecords={normalizedRecords}
            rawRecords={rawRecords}
            brandsList={uniqueBrands}
            expenseTypesList={uniqueExpenses}
            fleetsList={(analytics.fleetStats || []).map(f => f.name)}
            initialFleetFilter={selectedFleet}
          />
        )}
      </main>

      {/* Modals */}
      <FleetAnalysisModal
        isOpen={isFleetModalOpen}
        onClose={() => setIsFleetModalOpen(false)}
        fleetStat={inspectingFleet}
        onFilterByFleet={(fleetName) => {
          setSelectedFleet(fleetName);
          setActiveTab('records');
        }}
      />

      <ColumnMapperModal
        isOpen={isMapperOpen}
        onClose={() => setIsMapperOpen(false)}
        availableHeaders={availableHeaders}
        currentMapping={mapping}
        sampleRows={rawRecords}
        onApplyMapping={handleApplyMapping}
      />

      <AiInsightsModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        analytics={analytics}
        anomalies={anomalies}
      />

      <PartsCatalogModal
        isOpen={isPartsModalOpen}
        onClose={() => setIsPartsModalOpen(false)}
        catalog={partsCatalog}
        catalogSource={catalogSource}
        onUpdateCatalog={handleUpdateCatalog}
      />

      <FileLoadingModal
        isOpen={isLoadingFile}
        progress={parseProgress}
        fileName={loadingFileName}
        error={parseError}
        onClose={() => {
          setIsLoadingFile(false);
          setParseError(null);
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <FleetApp />
    </ErrorBoundary>
  );
}

export default App;
