import React, { useState, useMemo, useEffect } from 'react';
import { BrandStat, EngineIssueStat } from '../../types';
import { 
  Tag, 
  Car, 
  ArrowUpDown, 
  AlertTriangle, 
  ShieldCheck, 
  Gauge, 
  Wrench, 
  Flame, 
  Zap, 
  CheckCircle2, 
  Search, 
  Filter, 
  Info,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Activity,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface BrandAnalysisViewProps {
  brandStats: BrandStat[];
  engineIssueStats?: EngineIssueStat[];
}

export const BrandAnalysisView: React.FC<BrandAnalysisViewProps> = ({ 
  brandStats, 
  engineIssueStats = [] 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'engines' | 'brands'>('engines');
  const [sortField, setSortField] = useState<keyof BrandStat>('totalCost');
  const [sortAsc, setSortAsc] = useState(false);
  
  // Engine Filters & Pagination
  const [engineSearch, setEngineSearch] = useState('');
  const [selectedFuel, setSelectedFuel] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [expandedEngineId, setExpandedEngineId] = useState<string | null>(null);
  const [enginePage, setEnginePage] = useState(1);
  const enginePageSize = 8;

  useEffect(() => {
    setEnginePage(1);
  }, [engineSearch, selectedFuel, selectedRisk]);

  // Sort Brands
  const sortedBrands = useMemo(() => {
    return [...brandStats].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });
  }, [brandStats, sortField, sortAsc]);

  const handleSort = (field: keyof BrandStat) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Filter Engines
  const filteredEngines = useMemo(() => {
    const q = engineSearch.trim().toLowerCase();
    const fuelQ = selectedFuel === 'ALL' ? '' : selectedFuel.toLowerCase();

    return engineIssueStats.filter(item => {
      const matchSearch = !q || (
        (item.brand && item.brand.toLowerCase().includes(q)) ||
        (item.model && item.model.toLowerCase().includes(q)) ||
        (item.engineType && item.engineType.toLowerCase().includes(q)) ||
        (item.chronicIssues && item.chronicIssues.some(ci => ci.toLowerCase().includes(q)))
      );
      
      const matchFuel = selectedFuel === 'ALL' || (item.fuelType && item.fuelType.toLowerCase().includes(fuelQ));
      const matchRisk = selectedRisk === 'ALL' || item.issueLevel === selectedRisk;

      return matchSearch && matchFuel && matchRisk;
    });
  }, [engineIssueStats, engineSearch, selectedFuel, selectedRisk]);

  const totalEnginePages = Math.ceil(filteredEngines.length / enginePageSize) || 1;
  const pagedEngines = useMemo(() => {
    const start = (enginePage - 1) * enginePageSize;
    return filteredEngines.slice(start, start + enginePageSize);
  }, [filteredEngines, enginePage, enginePageSize]);

  // Top Most Problematic Engines Summary
  const topCriticalEngines = useMemo(() => {
    return [...engineIssueStats]
      .sort((a, b) => b.failureRateIndex - a.failureRateIndex)
      .slice(0, 3);
  }, [engineIssueStats]);

  const chartData = useMemo(() => {
    return brandStats.map(b => ({
      name: b.name,
      totalCost: b.totalCost,
      costPerVehicle: b.costPerVehicle,
      vehicleCount: b.vehicleCount,
      costPerKm: b.costPerKm,
    }));
  }, [brandStats]);

  const engineRadarData = useMemo(() => {
    return engineIssueStats.slice(0, 6).map(e => ({
      engine: `${e.brand} ${e.model.split(' ')[0]}`,
      failureIndex: e.failureRateIndex,
      costScore: Math.min(100, Math.round((e.costPerVehicle / 25000) * 100)),
      visitFreq: Math.min(100, Math.round(e.ticketPerVehicle * 20)),
    }));
  }, [engineIssueStats]);

  const getRiskBadge = (level: EngineIssueStat['issueLevel']) => {
    switch (level) {
      case 'Kritik Sorunlu':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="h-3 w-3 text-rose-600" />
            Kritik Sorunlu
          </span>
        );
      case 'Yüksek Arıza Riski':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Flame className="h-3 w-3 text-amber-600" />
            Yüksek Arıza Riski
          </span>
        );
      case 'Orta Risk':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Gauge className="h-3 w-3 text-blue-600" />
            Orta Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            Sorunsuz / Düşük Risk
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Marka & Motor Tipi Güvenilirlik ve Arıza Analizi
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hangi araç ve motor tipinde en çok hangi kronik sorunlar çıkıyor, parça maliyetleri ve TCO karşılaştırması
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            id="tab-engine-issues"
            onClick={() => setActiveSubTab('engines')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'engines'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Motor & Kronik Arıza Analizi</span>
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              Yeni
            </span>
          </button>
          <button
            id="tab-brand-stats"
            onClick={() => setActiveSubTab('brands')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'brands'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="h-3.5 w-3.5" />
            <span>Marka Geneli TCO & KM Başı</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ENGINE & CHRONIC ISSUE BREAKDOWN VIEW                                  */}
      {/* ========================================================================= */}
      {activeSubTab === 'engines' && (
        <div className="space-y-6">
          {/* Executive Direct Answer Box: "Hangi Araçta Hangi Motor Sorun Çıkartıyor?" */}
          <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Filo Karar Destek Özeti: En Çok Sorun Çıkartan Motor Tipleri & Kronik Arızaları
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Saha bakım faturaları, parça tüketim sıklığı ve arıza endeksine göre belirlenen en kritik araç tipleri
                  </p>
                </div>
              </div>
              <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
                {engineIssueStats.length} Motor Tipi İncelendi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topCriticalEngines.map((item, idx) => (
                <div 
                  key={item.id}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-4 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-rose-400 uppercase">
                          #{idx + 1} En Yüksek Arıza Yükü
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {item.brand} {item.model}
                        </h4>
                        <p className="text-xs font-semibold text-blue-300">
                          {item.engineType}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-extrabold text-rose-400">
                          %{item.failureRateIndex}
                        </span>
                        <p className="text-[10px] text-slate-400">Arıza Endeksi</p>
                      </div>
                    </div>

                    {/* Chronic issues quick preview */}
                    <div className="mt-3 pt-3 border-t border-slate-700/60">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">
                        Öne Çıkan Kronik Sorunlar:
                      </span>
                      {item.chronicIssues && item.chronicIssues.length > 0 ? (
                        <ul className="space-y-1">
                          {item.chronicIssues.slice(0, 2).map((issue, i) => (
                            <li key={i} className="text-xs text-slate-200 flex items-start gap-1.5">
                              <span className="text-rose-400 text-xs font-bold leading-tight">•</span>
                              <span className="leading-tight">{issue}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Tanımlı kronik arıza bülteni bulunmuyor</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/60 px-2.5 py-1.5 rounded-lg">
                    <span>Ort. Maliyet: <strong className="text-white">{item.costPerVehicle.toLocaleString('tr-TR')} ₺</strong></span>
                    <span>Ziyaret: <strong className="text-white">{item.ticketPerVehicle} / araç</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="search-engine-issues"
                type="text"
                value={engineSearch}
                onChange={(e) => setEngineSearch(e.target.value)}
                placeholder="Araç, marka, motor tipi veya arıza ara (örn: Egea 1.3, PureTech, DPF, Enjektör, Triger)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span>Yakıt:</span>
                <select
                  id="select-fuel-filter"
                  value={selectedFuel}
                  onChange={(e) => setSelectedFuel(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">Tümü</option>
                  <option value="Dizel">Dizel</option>
                  <option value="Benzin">Benzin / LPG</option>
                  <option value="Hibrit">Hibrit</option>
                </select>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                <span>Risk Seviyesi:</span>
                <select
                  id="select-risk-filter"
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">Tüm Seviyeler</option>
                  <option value="Kritik Sorunlu">Kritik Sorunlu</option>
                  <option value="Yüksek Arıza Riski">Yüksek Arıza Riski</option>
                  <option value="Orta Risk">Orta Risk</option>
                  <option value="Sorunsuz / Düşük Risk">Sorunsuz / Düşük</option>
                </select>
              </div>
            </div>
          </div>

          {/* Engine Issues Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pagedEngines.map((item) => {
              const isExpanded = expandedEngineId === item.id;
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    item.issueLevel === 'Kritik Sorunlu'
                      ? 'border-rose-200 hover:border-rose-400 shadow-xs'
                      : item.issueLevel === 'Yüksek Arıza Riski'
                      ? 'border-amber-200 hover:border-amber-400 shadow-xs'
                      : 'border-slate-200 hover:border-blue-300 shadow-xs'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">
                            {item.brand} {item.model}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.fuelType}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-blue-700 mt-1 flex items-center gap-1.5">
                          <Wrench className="h-3.5 w-3.5 text-blue-500" />
                          {item.engineType}
                        </h4>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        {getRiskBadge(item.issueLevel)}
                        <span className="text-[11px] text-slate-500 mt-1">
                          Arıza Skoru: <strong className="text-slate-800">%{item.failureRateIndex}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Quick Metrics Bar */}
                    <div className="grid grid-cols-4 gap-2 mt-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Filo Adedi</span>
                        <span className="text-xs font-bold text-slate-800">{item.vehicleCount} Araç</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Ort. Harcama</span>
                        <span className="text-xs font-bold text-slate-800">{item.costPerVehicle.toLocaleString('tr-TR')} ₺</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">KM Başı Maliyet</span>
                        <span className="text-xs font-bold text-emerald-700">{item.costPerKm} ₺/KM</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Servis Sıklığı</span>
                        <span className="text-xs font-bold text-slate-800">{item.ticketPerVehicle} Kez/Yıl</span>
                      </div>
                    </div>
                  </div>

                  {/* Chronic Issues & Top Parts */}
                  <div className="p-5 space-y-4">
                    {item.chronicIssues && item.chronicIssues.length > 0 ? (
                      <div>
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          Kronik Arıza Noktaları & Hassas Parçalar
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.chronicIssues.map((issue, idx) => (
                            <div 
                              key={idx}
                              className="text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-lg border border-slate-100 flex items-start gap-1.5 font-medium leading-snug"
                            >
                              <span className="text-rose-500 font-bold">•</span>
                              <span>{issue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center gap-2">
                        <span className="text-slate-400">Bu motor/model için tanımlanmış spesifik bir OEM kronik arıza bülteni bulunmamaktadır.</span>
                      </div>
                    )}

                    {/* Top Billed Services/Parts in Actual Data */}
                    {item.topFailedParts && item.topFailedParts.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                          En Çok Fatura Edilen Bakım & Parça Kalemleri
                        </span>
                        <div className="space-y-1.5">
                          {item.topFailedParts.map((part, pIdx) => (
                            <div 
                              key={pIdx}
                              className="flex items-center justify-between text-xs bg-blue-50/50 hover:bg-blue-50/80 px-2.5 py-1.5 rounded-lg border border-blue-100/60"
                            >
                              <span className="font-semibold text-slate-800 truncate max-w-[220px]">
                                {part.name}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-500">
                                  {part.count} Adet
                                </span>
                                <span className="font-bold text-blue-700">
                                  {part.cost.toLocaleString('tr-TR')} ₺
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expert Maintenance Advice */}
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold block text-amber-950 mb-0.5">Filo & Önleyici Bakım Önerisi:</strong>
                        <p className="leading-relaxed text-slate-700">{item.expertAdvice}</p>
                      </div>
                    </div>

                    {/* Plates Toggle */}
                    {item.plates.length > 0 && (
                      <div>
                        <button
                          onClick={() => setExpandedEngineId(isExpanded ? null : item.id)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                        >
                          <span>{isExpanded ? 'Plakaları Gizle' : `Filodaki ${item.plates.length} Aracı ve Plakalarını Göster`}</span>
                          <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>

                        {isExpanded && (
                          <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex flex-wrap gap-1.5">
                              {item.plates.map((plate) => (
                                <span 
                                  key={plate} 
                                  className="px-2 py-1 bg-white border border-slate-200 rounded font-mono font-bold text-xs text-slate-800 shadow-2xs"
                                >
                                  {plate}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Engine Pagination Footer */}
          {filteredEngines.length > enginePageSize && (
            <div className="px-4 py-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 shadow-2xs">
              <div>
                Toplam <span className="font-semibold text-slate-900">{filteredEngines.length}</span> motor tipinden{' '}
                <span className="font-semibold text-slate-900">{(enginePage - 1) * enginePageSize + 1}</span> -{' '}
                <span className="font-semibold text-slate-900">{Math.min(enginePage * enginePageSize, filteredEngines.length)}</span> arası gösteriliyor
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  id="btn-engines-prev-page"
                  onClick={() => setEnginePage(p => Math.max(1, p - 1))}
                  disabled={enginePage === 1}
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    enginePage === 1 
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Önceki</span>
                </button>

                <span className="px-2 py-1 text-slate-700 font-semibold">
                  Sayfa {enginePage} / {totalEnginePages}
                </span>

                <button
                  id="btn-engines-next-page"
                  onClick={() => setEnginePage(p => Math.min(totalEnginePages, p + 1))}
                  disabled={enginePage >= totalEnginePages}
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    enginePage >= totalEnginePages 
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <span>Sonraki</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {filteredEngines.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Info className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">Filtreye Uygun Motor Tipi Bulunamadı</h3>
              <p className="text-xs text-slate-500 mt-1">Arama kriterlerinizi veya filtre seçimlerinizi sıfırlayabilirsiniz.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. OVERALL BRAND TCO & SUMMARY VIEW                                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'brands' && (
        <div className="space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Total Cost vs Vehicle Count */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Markalara Göre Toplam Maliyet & Araç Başı Maliyet
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Toplam harcama (Mavi) ve araç başı ortalama harcama (Açık Mavi)
              </p>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k ₺`} />
                    <Tooltip formatter={(val: number) => `${val.toLocaleString('tr-TR')} ₺`} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar name="Toplam Harcama" dataKey="totalCost" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar name="Araç Başı Harcama" dataKey="costPerVehicle" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Cost Per KM by Brand */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                KM Başına Bakım Maliyeti (₺ / KM)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Düşük değerler daha yüksek operasyonel ve TCO verimliliğine işaret eder
              </p>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v} ₺`} />
                    <Tooltip formatter={(val: number) => [`${val} ₺ / KM`, 'KM Başı Maliyet']} />
                    <Bar name="KM Başı Maliyet (₺/KM)" dataKey="costPerKm" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Brand Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Marka Performans ve Maliyet Tablosu
              </h3>
              <span className="text-xs text-slate-500">
                Sütun başlıklarına tıklayarak sıralayabilirsiniz.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center space-x-1">
                        <span>Marka</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer text-right" onClick={() => handleSort('totalCost')}>
                      <div className="flex items-center justify-end space-x-1">
                        <span>Toplam Harcama</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer text-right" onClick={() => handleSort('costSharePct')}>
                      <div className="flex items-center justify-end space-x-1">
                        <span>Maliyet Payı</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer text-right" onClick={() => handleSort('vehicleCount')}>
                      <div className="flex items-center justify-end space-x-1">
                        <span>Araç Sayısı</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer text-right" onClick={() => handleSort('costPerVehicle')}>
                      <div className="flex items-center justify-end space-x-1">
                        <span>Araç Başı Harcama</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer text-right" onClick={() => handleSort('operationCount')}>
                      <div className="flex items-center justify-end space-x-1">
                        <span>İşlem Adedi</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer text-right" onClick={() => handleSort('avgTicket')}>
                      <div className="flex items-center justify-end space-x-1">
                        <span>Ort. Bilet (₺)</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer text-right" onClick={() => handleSort('costPerKm')}>
                      <div className="flex items-center justify-end space-x-1">
                        <span>KM Başı (₺/KM)</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer text-right" onClick={() => handleSort('avgAge')}>
                      <div className="flex items-center justify-end space-x-1">
                        <span>Ort. Yaş</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {sortedBrands.map(b => (
                    <tr key={b.name} className="hover:bg-blue-50/30 transition-colors font-medium">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                        <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                        <span>{b.name}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {b.totalCost.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[11px]">
                          %{b.costSharePct}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">{b.vehicleCount}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">
                        {b.costPerVehicle.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="py-3 px-4 text-right">{b.operationCount}</td>
                      <td className="py-3 px-4 text-right">{b.avgTicket.toLocaleString('tr-TR')} ₺</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        {b.costPerKm} ₺
                      </td>
                      <td className="py-3 px-4 text-right">{b.avgAge} Yıl</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

