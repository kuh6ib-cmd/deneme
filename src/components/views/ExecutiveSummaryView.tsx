import React, { useMemo, useState } from 'react';
import { AnalyticsResult } from '../../services/analyticsEngine';
import { DataQualityMetrics, FleetGroupStat } from '../../types';
import { 
  Wallet, 
  Car, 
  Wrench, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  CheckCircle2,
  PieChart as PieIcon,
  Award,
  Building2,
  ArrowRight,
  PackageCheck,
  ChevronRight,
  Filter,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  BarChart3,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface ExecutiveSummaryViewProps {
  analytics: AnalyticsResult;
  quality: DataQualityMetrics;
  onOpenAiInsights: () => void;
  onSelectTab: (tab: any) => void;
  onInspectFleet?: (fleet: FleetGroupStat) => void;
}

const COLORS = ['#2563eb', '#38bdf8', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({
  analytics,
  quality,
  onOpenAiInsights,
  onSelectTab,
  onInspectFleet,
}) => {
  const { summary, brandStats, supplierStats, fleetStats = [], vehicleSpendStats, expenseTypeStats, riskRecords, strategicRoadmap } = analytics;

  // View state: 'simple' (fewer items by default) vs 'detailed' (all expanded)
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');

  // Granular on-demand section toggles
  const [showSuppliersVehicles, setShowSuppliersVehicles] = useState<boolean>(false);
  const [showFleetCards, setShowFleetCards] = useState<boolean>(false);
  const [showCharts, setShowCharts] = useState<boolean>(false);
  const [showRiskRoadmap, setShowRiskRoadmap] = useState<boolean>(false);

  const criticalRisksCount = useMemo(() => {
    return (riskRecords || []).filter(r => r.riskLevel === 'Kritik Risk').length;
  }, [riskRecords]);

  const costRisksCount = useMemo(() => {
    return (riskRecords || []).filter(r => r.riskLevel === 'Maliyet Riski').length;
  }, [riskRecords]);

  const topBrandData = useMemo(() => {
    return (brandStats || []).slice(0, 5).map(b => ({
      name: b.name,
      cost: b.totalCost,
      vehicleCount: b.vehicleCount,
    }));
  }, [brandStats]);

  const expensePieData = useMemo(() => {
    return (expenseTypeStats || []).slice(0, 5).map(e => ({
      name: e.name,
      value: e.totalCost,
    }));
  }, [expenseTypeStats]);

  const topSuppliers = useMemo(() => (supplierStats || []).slice(0, 3), [supplierStats]);
  const topVehicles = useMemo(() => (vehicleSpendStats || []).slice(0, 3), [vehicleSpendStats]);

  // Section visibility based on viewMode or individual toggle
  const isSuppliersVehiclesOpen = viewMode === 'detailed' || showSuppliersVehicles;
  const isFleetCardsOpen = viewMode === 'detailed' || showFleetCards;
  const isChartsOpen = viewMode === 'detailed' || showCharts;
  const isRiskRoadmapOpen = viewMode === 'detailed' || showRiskRoadmap;

  const handleToggleMode = (mode: 'simple' | 'detailed') => {
    setViewMode(mode);
    if (mode === 'detailed') {
      setShowSuppliersVehicles(true);
      setShowFleetCards(true);
      setShowCharts(true);
      setShowRiskRoadmap(true);
    } else {
      setShowSuppliersVehicles(false);
      setShowFleetCards(false);
      setShowCharts(false);
      setShowRiskRoadmap(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Welcome Action */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
              Yönetici Özeti
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              Kalite Güveni: <strong className="text-slate-800 font-semibold">%{quality.overallScore}</strong>
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
            Filo Sağlık, Harcama ve Karar Özeti
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl font-normal">
            {summary.totalVehicles} aracın {summary.totalRecords} bakım kaydı analiz edildi. 
            Toplam bütçe: <strong className="text-slate-900 font-bold">{summary.totalCost.toLocaleString('tr-TR')} ₺</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenAiInsights}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Yönetici Brifingi</span>
          </button>
        </div>
      </div>

      {/* Row 1: Key Executive KPIs (Always visible, clean & concise) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Total Spend */}
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Toplam Harcama
            </span>
            <div className="h-7 w-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
              <Wallet className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900">
              {summary.totalCost.toLocaleString('tr-TR')} ₺
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 pt-1 border-t border-slate-100">
              <span>İşlem Başına:</span>
              <span className="font-medium text-slate-700">{summary.avgTicketCost.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Cost Per Vehicle */}
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Araç Başı Ortalama
            </span>
            <div className="h-7 w-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
              <Car className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900">
              {summary.avgCostPerVehicle.toLocaleString('tr-TR')} ₺
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 pt-1 border-t border-slate-100">
              <span>Toplam Araç:</span>
              <span className="font-medium text-slate-700">{summary.totalVehicles} Araç</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Cost Per KM */}
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              KM Başına Maliyet
            </span>
            <div className="h-7 w-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900">
              {summary.costPerKm} ₺ <span className="text-xs font-normal text-slate-500">/ KM</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 pt-1 border-t border-slate-100">
              <span>Ortalama Filo KM:</span>
              <span className="font-medium text-slate-700">{summary.avgVehicleKm.toLocaleString('tr-TR')} KM</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Maintenance vs Repair Balance */}
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Planlı / Plansız Oranı
            </span>
            <div className="h-7 w-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
              <Wrench className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900">
              %{summary.maintenanceSharePct} <span className="text-xs font-normal text-slate-400">Planlı</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 pt-1 border-t border-slate-100">
              <span>Plansız / Arıza Onarım:</span>
              <span className="font-semibold text-slate-700">%{summary.repairSharePct}</span>
            </div>
          </div>
        </div>
      </div>

      {/* On-Demand Controls Bar (Görünüm ve Modül Yönetimi) */}
      <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-xs font-semibold text-slate-800">Modül Görünümü:</span>
          
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/60">
            <button
              onClick={() => handleToggleMode('simple')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                viewMode === 'simple'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sade (Özet)
            </button>
            <button
              onClick={() => handleToggleMode('detailed')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                viewMode === 'detailed'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Detaylı (Tüm Modüller)
            </button>
          </div>
        </div>

        {/* Individual Module Toggle Chips (Aç/Kapa) */}
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          <button
            onClick={() => {
              setShowSuppliersVehicles(!isSuppliersVehiclesOpen);
              if (viewMode === 'detailed') setViewMode('simple');
            }}
            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-medium border transition-colors ${
              isSuppliersVehiclesOpen
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>🏢 Servis & Araçlar</span>
            {isSuppliersVehiclesOpen ? <ChevronUp className="h-3 w-3 ml-0.5" /> : <ChevronDown className="h-3 w-3 ml-0.5" />}
          </button>

          {fleetStats.length > 0 && (
            <button
              onClick={() => {
                setShowFleetCards(!isFleetCardsOpen);
                if (viewMode === 'detailed') setViewMode('simple');
              }}
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-medium border transition-colors ${
                isFleetCardsOpen
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>🚗 Filo Kartları</span>
              {isFleetCardsOpen ? <ChevronUp className="h-3 w-3 ml-0.5" /> : <ChevronDown className="h-3 w-3 ml-0.5" />}
            </button>
          )}

          <button
            onClick={() => {
              setShowCharts(!isChartsOpen);
              if (viewMode === 'detailed') setViewMode('simple');
            }}
            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-medium border transition-colors ${
              isChartsOpen
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>📊 Grafikler</span>
            {isChartsOpen ? <ChevronUp className="h-3 w-3 ml-0.5" /> : <ChevronDown className="h-3 w-3 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              setShowRiskRoadmap(!isRiskRoadmapOpen);
              if (viewMode === 'detailed') setViewMode('simple');
            }}
            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-medium border transition-colors ${
              isRiskRoadmapOpen
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>⚠️ Risk & Plan</span>
            {isRiskRoadmapOpen ? <ChevronUp className="h-3 w-3 ml-0.5" /> : <ChevronDown className="h-3 w-3 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* When in Simple View & No modules open, show a clean 4-card Quick Access Grid */}
      {viewMode === 'simple' && !isSuppliersVehiclesOpen && !isFleetCardsOpen && !isChartsOpen && !isRiskRoadmapOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Servis & Araçlar Preview */}
          <div 
            onClick={() => setShowSuppliersVehicles(true)}
            className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Servis & Araç Harcamaları</h4>
                  <p className="text-[10px] text-slate-500">Top harcayan noktalar</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                + Aç
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Lider Servis: <strong className="text-slate-800">{topSuppliers[0]?.name || '-'}</strong></span>
            </div>
          </div>

          {/* Card 2: Filo Kartları Preview */}
          {fleetStats.length > 0 && (
            <div 
              onClick={() => setShowFleetCards(true)}
              className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Car className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Filo Segmentleri</h4>
                    <p className="text-[10px] text-slate-500">{fleetStats.length} filo grubu</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                  + Aç
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                <span>Öneriler: <strong className="text-slate-800">{fleetStats.reduce((acc, f) => acc + f.recommendations.length, 0)} Aksiyon</strong></span>
              </div>
            </div>
          )}

          {/* Card 3: Grafikler Preview */}
          <div 
            onClick={() => setShowCharts(true)}
            className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                  <BarChart3 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Maliyet Grafikleri</h4>
                  <p className="text-[10px] text-slate-500">Marka ve gider dağılımı</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                + Aç
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Lider Marka: <strong className="text-slate-800">{topBrandData[0]?.name || '-'}</strong></span>
            </div>
          </div>

          {/* Card 4: Risk & Yol Haritası Preview */}
          <div 
            onClick={() => setShowRiskRoadmap(true)}
            className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 rounded-md bg-rose-50 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Risk & Yol Haritası</h4>
                  <p className="text-[10px] text-slate-500">Kritik araçlar ve aksiyonlar</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">
                + Aç
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Kritik Risk: <strong className="text-rose-700">{criticalRisksCount} Araç</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Module 1: Servis & Araç Harcama Odaklı Konsolidasyon (On-Demand) */}
      {isSuppliersVehiclesOpen && (
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                <Building2 className="h-3 w-3" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">
                Servis & Araç Bazlı Harcama Dağılımı
              </h3>
            </div>
            <button
              onClick={() => setShowSuppliersVehicles(false)}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center space-x-1"
            >
              <span>Gizle</span>
              <ChevronUp className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card A: Servis & Tedarikçi Bazlı Toplam Harcamalar */}
            <div className="bg-slate-50/50 rounded-lg p-3.5 border border-slate-200/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-800">En Yüksek Hacimli Servisler</span>
                  <button
                    onClick={() => onSelectTab('suppliers')}
                    className="text-[11px] text-slate-600 hover:text-slate-900 font-medium flex items-center space-x-1"
                  >
                    <span>Tümü</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {topSuppliers.map((s, idx) => (
                    <div 
                      key={s.name}
                      onClick={() => onSelectTab('suppliers')}
                      className="p-2.5 rounded-lg bg-white hover:bg-slate-100/70 border border-slate-200/60 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="h-4.5 w-4.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 truncate max-w-[170px]">{s.name}</div>
                          <div className="text-[10px] text-slate-500">{s.vehicleCount} Araç • {s.operationCount} İşlem</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-900">{s.totalCost.toLocaleString('tr-TR')} ₺</div>
                        <span className="text-[10px] font-medium text-slate-500">%{s.costSharePct} Pay</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card B: Araç Bazlı Toplam Harcamalar */}
            <div className="bg-slate-50/50 rounded-lg p-3.5 border border-slate-200/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-800">En Çok Harcayan Araçlar</span>
                  <button
                    onClick={() => onSelectTab('vehicle_spend')}
                    className="text-[11px] text-slate-600 hover:text-slate-900 font-medium flex items-center space-x-1"
                  >
                    <span>Tümü</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {topVehicles.map((v, idx) => (
                    <div 
                      key={v.plate || idx}
                      onClick={() => onSelectTab('vehicle_spend')}
                      className="p-2.5 rounded-lg bg-white hover:bg-slate-100/70 border border-slate-200/60 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="h-4.5 w-4.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{v.brand} {v.model} <span className="font-normal text-slate-500 text-[11px]">(Araç #{idx + 1})</span></div>
                          <div className="text-[10px] text-slate-500">{v.fleetGroup || 'Genel Filo'} • {v.primaryService}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-900">{v.totalCost.toLocaleString('tr-TR')} ₺</div>
                        <span className="text-[10px] font-medium text-slate-500">%{v.costSharePct} Pay</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 2: Filo Bazlı Karar Destek & Öneri Kartları (On-Demand) */}
      {isFleetCardsOpen && fleetStats && fleetStats.length > 0 && (
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                <Car className="h-3 w-3" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">
                Filo Bazlı Harcama & Stratejik Öneri Kartları ({fleetStats.length} Filo)
              </h3>
            </div>
            <button
              onClick={() => setShowFleetCards(false)}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center space-x-1"
            >
              <span>Gizle</span>
              <ChevronUp className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {fleetStats.map(fleet => (
              <div
                key={fleet.name}
                onClick={() => onInspectFleet && onInspectFleet(fleet)}
                className="group p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 text-xs truncate max-w-[170px]" title={fleet.name}>
                      {fleet.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
                      {fleet.vehicleCount} Araç
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-1.5">
                    <span className="text-base font-bold text-slate-900">
                      {fleet.totalCost.toLocaleString('tr-TR')} ₺
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      Pay: %{fleet.costSharePct}
                    </span>
                  </div>

                  {/* Mini metrics */}
                  <div className="grid grid-cols-2 gap-1.5 mt-2.5 text-[11px] text-slate-600 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                    <div>Araç Bş: <strong className="text-slate-800 font-semibold">{fleet.costPerVehicle.toLocaleString('tr-TR')} ₺</strong></div>
                    <div>KM Bş: <strong className="text-slate-800 font-semibold">{fleet.costPerKm.toFixed(2)} ₺</strong></div>
                    <div>Bosch Payı: <strong className="text-emerald-700 font-semibold">%{fleet.boschSharePct}</strong></div>
                    <div>Kritik Risk: <strong className={fleet.criticalVehiclesCount > 0 ? "text-rose-700 font-semibold" : "text-slate-600"}>{fleet.criticalVehiclesCount} Araç</strong></div>
                  </div>

                  {/* Recommendations summary badge */}
                  <div className="mt-2">
                    <div className="text-[11px] text-slate-700 font-medium bg-slate-100/80 px-2 py-1 rounded-md border border-slate-200/60 flex items-center justify-between">
                      <span className="truncate max-w-[200px]">💡 {fleet.recommendations[0]?.title || 'Stratejik Öneriler'}</span>
                      <span className="text-[10px] font-semibold text-slate-500">({fleet.recommendations.length})</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-700 group-hover:text-slate-900">
                  <span className="flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-indigo-600" />
                    <span>Filo Analizini İncele</span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Module 3: Charts & Visuals (On-Demand) */}
      {isChartsOpen && (
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                <BarChart3 className="h-3 w-3" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">
                Maliyet & Harcama Grafikleri
              </h3>
            </div>
            <button
              onClick={() => setShowCharts(false)}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center space-x-1"
            >
              <span>Gizle</span>
              <ChevronUp className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Bar Chart: Top 5 Brands Spend */}
            <div className="bg-slate-50/50 rounded-lg p-3.5 border border-slate-200/60 lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Markalara Göre Toplam Bakım Harcaması
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    İlk 5 markanın maliyet yükü
                  </p>
                </div>
                <button
                  onClick={() => onSelectTab('brands')}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                >
                  Marka Analizi →
                </button>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topBrandData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={val => `${(val / 1000).toFixed(0)}k ₺`} />
                    <Tooltip
                      formatter={(val: number) => [`${val.toLocaleString('tr-TR')} ₺`, 'Toplam Harcama']}
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                      labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                    />
                    <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart: Top Expense Types */}
            <div className="bg-slate-50/50 rounded-lg p-3.5 border border-slate-200/60 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Gider Türü Dağılımı
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Ana maliyet kalemleri
                  </p>
                </div>
                <button
                  onClick={() => onSelectTab('expenses')}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                >
                  Detay →
                </button>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={62}
                      paddingAngle={2}
                    >
                      {expensePieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: number) => `${val.toLocaleString('tr-TR')} ₺`} 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1 mt-1">
                {expensePieData.slice(0, 3).map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                      <span className="text-slate-600 truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800">{item.value.toLocaleString('tr-TR')} ₺</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 4: Risk Summary & Strategic Roadmap (On-Demand) */}
      {isRiskRoadmapOpen && (
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-md bg-rose-50 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="h-3 w-3" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">
                Risk Uyarıları ve Stratejik Aksiyon Yol Haritası
              </h3>
            </div>
            <button
              onClick={() => setShowRiskRoadmap(false)}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center space-x-1"
            >
              <span>Gizle</span>
              <ChevronUp className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Risk Alerts Card */}
            <div className="bg-slate-50/50 rounded-lg p-3.5 border border-slate-200/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-800">Riskli Araç Uyarıları</h4>
                  <button
                    onClick={() => onSelectTab('risks')}
                    className="text-xs text-rose-700 hover:text-rose-900 font-medium"
                  >
                    Risk Matrisi →
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="p-2 rounded-lg bg-white border border-rose-200/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-rose-900">Kritik Riskli Araçlar</div>
                      <div className="text-[10px] text-rose-700">&gt;8 Yaş ve &gt;150k KM</div>
                    </div>
                    <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/80">
                      {criticalRisksCount} Araç
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-amber-200/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-amber-900">Maliyet Kara Deliği</div>
                      <div className="text-[10px] text-amber-700">Ortalamanın %50+ üstünde</div>
                    </div>
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                      {costRisksCount} Araç
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Veri Kalitesi Düzeltmeleri</div>
                      <div className="text-[10px] text-slate-600">Yazım hataları, uç değerler</div>
                    </div>
                    <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {quality.brandTyposFixed + quality.invalidYearsCount + quality.invalidKmCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center text-[11px]">
                  <ShieldCheck className="h-3 w-3 text-emerald-600 mr-1" />
                  Güvenilirlik: <strong className="text-slate-800 ml-1">%{quality.overallScore}</strong>
                </span>
                <button
                  onClick={() => onSelectTab('quality')}
                  className="text-slate-700 font-medium hover:underline text-[11px]"
                >
                  Anomaliler →
                </button>
              </div>
            </div>

            {/* Strategic Action Roadmap */}
            <div className="bg-slate-50/50 rounded-lg p-3.5 border border-slate-200/60 lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">
                    Stratejik Aksiyon Yol Haritası
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Zaman kademeli öneriler ve tasarruf potansiyeli
                  </p>
                </div>
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700">
                  5 Temel Aksiyon
                </span>
              </div>

              <div className="space-y-1.5 overflow-y-auto flex-1 max-h-60 pr-1">
                {strategicRoadmap.map(action => (
                  <div
                    key={action.id}
                    className="p-2.5 rounded-lg bg-white border border-slate-200/70 text-xs"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`px-1.5 py-0.2 rounded font-medium text-[10px] ${
                        action.timeframe.includes('0-3')
                          ? 'bg-rose-50 text-rose-800 border border-rose-200/60'
                          : action.timeframe.includes('3-12')
                          ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                      }`}>
                        {action.timeframe}
                      </span>
                      <span className="font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.2 rounded text-[10px] border border-slate-200/60">
                        {action.potentialSavingsEstimate}
                      </span>
                    </div>
                    <h5 className="font-semibold text-slate-900 text-xs">
                      {action.title}
                    </h5>
                    <p className="text-slate-600 text-[11px] mt-0.5 font-normal leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
