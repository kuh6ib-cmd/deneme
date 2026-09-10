import React, { useState, useMemo } from 'react';
import { ExpenseTypeStat } from '../../types';
import { 
  Wrench, 
  ArrowUpDown, 
  ShieldCheck, 
  AlertCircle, 
  Search, 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  DollarSign, 
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';

interface ExpenseTypeViewProps {
  expenseTypeStats: ExpenseTypeStat[];
}

const PALETTE = [
  '#2563eb', // Blue
  '#0d9488', // Teal
  '#16a34a', // Green
  '#d97706', // Amber
  '#ea580c', // Orange
  '#dc2626', // Red
  '#7c3aed', // Purple
  '#0284c7', // Sky
  '#db2777', // Pink
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#475569', // Slate
];

export const ExpenseTypeView: React.FC<ExpenseTypeViewProps> = ({ expenseTypeStats }) => {
  const [sortField, setSortField] = useState<keyof ExpenseTypeStat>('totalCost');
  const [sortAsc, setSortAsc] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'planned' | 'unplanned'>('all');
  const [chartType, setChartType] = useState<'donut' | 'horizontal-bar' | 'vertical-bar'>('donut');
  const [metricType, setMetricType] = useState<'cost' | 'count'>('cost');

  // Overall aggregates
  const totalCost = useMemo(() => {
    return expenseTypeStats.reduce((sum, e) => sum + e.totalCost, 0);
  }, [expenseTypeStats]);

  const totalOperations = useMemo(() => {
    return expenseTypeStats.reduce((sum, e) => sum + e.operationCount, 0);
  }, [expenseTypeStats]);

  const plannedCost = useMemo(() => {
    return expenseTypeStats
      .filter(e => e.isPlannedMaintenance)
      .reduce((sum, e) => sum + e.totalCost, 0);
  }, [expenseTypeStats]);

  const unplannedCost = totalCost - plannedCost;
  const plannedPct = totalCost > 0 ? parseFloat(((plannedCost / totalCost) * 100).toFixed(1)) : 0;
  const unplannedPct = totalCost > 0 ? parseFloat(((unplannedCost / totalCost) * 100).toFixed(1)) : 0;
  const avgCostPerOp = totalOperations > 0 ? Math.round(totalCost / totalOperations) : 0;

  // Filtered & Sorted items
  const filteredStats = useMemo(() => {
    return expenseTypeStats.filter(e => {
      // Category filter
      if (categoryFilter === 'planned' && !e.isPlannedMaintenance) return false;
      if (categoryFilter === 'unplanned' && e.isPlannedMaintenance) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return e.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [expenseTypeStats, categoryFilter, searchQuery]);

  const sortedStats = useMemo(() => {
    return [...filteredStats].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc 
        ? String(valA).localeCompare(String(valB), 'tr') 
        : String(valB).localeCompare(String(valA), 'tr');
    });
  }, [filteredStats, sortField, sortAsc]);

  const handleSort = (field: keyof ExpenseTypeStat) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Prepare chart dataset
  const chartData = useMemo(() => {
    return sortedStats.map((e, idx) => ({
      name: e.name,
      shortName: e.name.length > 22 ? `${e.name.slice(0, 20)}...` : e.name,
      totalCost: e.totalCost,
      operationCount: e.operationCount,
      costSharePct: e.costSharePct,
      avgCost: e.avgCost,
      color: PALETTE[idx % PALETTE.length],
    }));
  }, [sortedStats]);

  // Donut/Pie chart dataset (Top categories + Others)
  const donutData = useMemo(() => {
    const sortedByMetric = [...filteredStats].sort((a, b) => {
      const valA = metricType === 'cost' ? a.totalCost : a.operationCount;
      const valB = metricType === 'cost' ? b.totalCost : b.operationCount;
      return valB - valA;
    });

    const metricTotal = sortedByMetric.reduce((s, e) => s + (metricType === 'cost' ? e.totalCost : e.operationCount), 0);

    if (sortedByMetric.length <= 7) {
      return sortedByMetric.map((e, idx) => {
        const val = metricType === 'cost' ? e.totalCost : e.operationCount;
        const pct = metricTotal > 0 ? parseFloat(((val / metricTotal) * 100).toFixed(1)) : 0;
        return {
          name: e.name,
          value: val,
          color: PALETTE[idx % PALETTE.length],
          sharePct: pct,
          isPlanned: e.isPlannedMaintenance,
          operationCount: e.operationCount,
          totalCost: e.totalCost,
        };
      });
    }

    const top6 = sortedByMetric.slice(0, 6).map((e, idx) => {
      const val = metricType === 'cost' ? e.totalCost : e.operationCount;
      const pct = metricTotal > 0 ? parseFloat(((val / metricTotal) * 100).toFixed(1)) : 0;
      return {
        name: e.name,
        value: val,
        color: PALETTE[idx % PALETTE.length],
        sharePct: pct,
        isPlanned: e.isPlannedMaintenance,
        operationCount: e.operationCount,
        totalCost: e.totalCost,
      };
    });

    const others = sortedByMetric.slice(6);
    const otherVal = others.reduce((s, e) => s + (metricType === 'cost' ? e.totalCost : e.operationCount), 0);
    const otherCost = others.reduce((s, e) => s + e.totalCost, 0);
    const otherOps = others.reduce((s, e) => s + e.operationCount, 0);
    const otherPct = metricTotal > 0 ? parseFloat(((otherVal / metricTotal) * 100).toFixed(1)) : 0;

    top6.push({
      name: `Diğer (${others.length} Kategori)`,
      value: otherVal,
      color: '#94a3b8',
      sharePct: otherPct,
      isPlanned: false,
      operationCount: otherOps,
      totalCost: otherCost,
    });

    return top6;
  }, [filteredStats, metricType]);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Hizmet & Gider Türlerine Göre Harcama Dağılımı
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Periyodik bakım, mekanik onarım, ağır revizyon, fren, ön takım ve sarfiyat kalemlerinin analizi
              </p>
            </div>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-800 flex items-center space-x-1.5 shadow-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Planlı Bakım: <strong>%{plannedPct}</strong> ({plannedCost.toLocaleString('tr-TR')} ₺)</span>
          </div>
          <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-amber-800 flex items-center space-x-1.5 shadow-xs">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span>Plansız Onarım & Sarf: <strong>%{unplannedPct}</strong> ({unplannedCost.toLocaleString('tr-TR')} ₺)</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Toplam Hizmet Harcaması</span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">
              {totalCost.toLocaleString('tr-TR')} ₺
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center space-x-1">
            <span>Toplam {totalOperations.toLocaleString('tr-TR')} servis işlemi</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Planlı Periyodik Bakım</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-950">
              {plannedCost.toLocaleString('tr-TR')} ₺
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              %{plannedPct}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-700">
            Filtre seti, periyodik yağ ve rutin kontroller
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-100 bg-gradient-to-br from-white to-amber-50/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Plansız Onarım & Revizyon</span>
            <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-amber-950">
              {unplannedCost.toLocaleString('tr-TR')} ₺
            </span>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
              %{unplannedPct}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-amber-700">
            Fren, süspansiyon, debriyaj, elektrik vb. arızalar
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Ortalama İşlem Maliyeti</span>
            <div className="h-7 w-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">
              {avgCostPerOp.toLocaleString('tr-TR')} ₺
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 truncate">
            Lider: <strong className="text-slate-700">{expenseTypeStats[0]?.name || '-'}</strong> (%{expenseTypeStats[0]?.costSharePct || 0})
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        {/* Controls Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Gider Kategorileri Dağılım Grafiği
            </h3>
            <p className="text-xs text-slate-500">
              {metricType === 'cost' ? 'Toplam harcama bedeline (₺)' : 'İşlem adedine'} göre kategori sıralaması
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl space-x-1 text-xs">
              <button
                onClick={() => setMetricType('cost')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  metricType === 'cost' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tutar (₺)
              </button>
              <button
                onClick={() => setMetricType('count')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  metricType === 'count' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                İşlem Sayısı
              </button>
            </div>

            {/* Chart Type Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl space-x-1 text-xs">
              <button
                onClick={() => setChartType('donut')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                  chartType === 'donut' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Pasta / Dilim Dağılım Grafiği"
              >
                <PieIcon className="h-3.5 w-3.5" />
                <span className="inline">Pasta Grafiği</span>
              </button>
              <button
                onClick={() => setChartType('horizontal-bar')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                  chartType === 'horizontal-bar' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Yatay Çubuk Grafiği"
              >
                <BarChart3 className="h-3.5 w-3.5 rotate-90" />
                <span className="hidden sm:inline">Yatay Bar</span>
              </button>
              <button
                onClick={() => setChartType('vertical-bar')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                  chartType === 'vertical-bar' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Dikey Sütun Grafiği"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Dikey Bar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="w-full">
          {chartType === 'donut' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center py-2">
              {/* Pie/Donut Chart */}
              <div className="lg:col-span-7 h-80 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={115}
                      paddingAngle={2.5}
                      dataKey="value"
                      label={({ name, sharePct }) => `${name.length > 15 ? name.slice(0, 13) + '..' : name} (%${sharePct})`}
                      labelLine={true}
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: number) => [
                        metricType === 'cost' ? `${val.toLocaleString('tr-TR')} ₺` : `${val.toLocaleString('tr-TR')} adet`,
                        metricType === 'cost' ? 'Toplam Tutar' : 'İşlem Sayısı'
                      ]}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Categorical Breakdown Legend */}
              <div className="lg:col-span-5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-2 max-h-80 overflow-y-auto">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Kategori & Pay Dağılımı</span>
                  <span>{metricType === 'cost' ? 'Tutar / Pay' : 'İşlem / Pay'}</span>
                </div>
                {donutData.map((entry, idx) => (
                  <div 
                    key={idx} 
                    className="p-2 bg-white rounded-lg border border-slate-200/60 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      <div 
                        className="h-3 w-3 rounded-md shrink-0" 
                        style={{ backgroundColor: entry.color }} 
                      />
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-800 truncate block">
                          {entry.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {entry.operationCount} işlem • {entry.isPlanned ? 'Planlı Bakım' : 'Onarım/Sarf'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-900">
                        {metricType === 'cost' 
                          ? `${entry.totalCost.toLocaleString('tr-TR')} ₺` 
                          : `${entry.operationCount.toLocaleString('tr-TR')} adet`}
                      </div>
                      <span className="inline-block text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                        %{entry.sharePct}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {chartType === 'horizontal-bar' && (
            <div className="w-full" style={{ height: Math.max(340, chartData.length * 36 + 60) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 140, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    tickFormatter={v => metricType === 'cost' ? `${(v / 1000).toLocaleString('tr-TR')}k ₺` : `${v}`} 
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 500 }} 
                    width={135}
                  />
                  <Tooltip 
                    formatter={(val: number) => [
                      metricType === 'cost' ? `${val.toLocaleString('tr-TR')} ₺` : `${val} adet`,
                      metricType === 'cost' ? 'Toplam Tutar' : 'İşlem Sayısı'
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar 
                    dataKey={metricType === 'cost' ? 'totalCost' : 'operationCount'} 
                    radius={[0, 6, 6, 0]}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartType === 'vertical-bar' && (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 15, right: 10, left: 10, bottom: 45 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    angle={-25} 
                    textAnchor="end" 
                    interval={0}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    tickFormatter={v => metricType === 'cost' ? `${(v / 1000).toFixed(0)}k ₺` : `${v}`} 
                  />
                  <Tooltip 
                    formatter={(val: number) => [
                      metricType === 'cost' ? `${val.toLocaleString('tr-TR')} ₺` : `${val} adet`,
                      metricType === 'cost' ? 'Toplam Tutar' : 'İşlem Sayısı'
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0' }}
                  />
                  <Bar 
                    dataKey={metricType === 'cost' ? 'totalCost' : 'operationCount'} 
                    radius={[6, 6, 0, 0]}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-v-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Data Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header & Search Filter */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Hizmet Kalemleri Detaylı Tablosu
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Toplam {filteredStats.length} hizmet kategorisi listeleniyor
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl space-x-1 text-xs">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  categoryFilter === 'all' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setCategoryFilter('planned')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  categoryFilter === 'planned' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sadece Planlı Bakım
              </button>
              <button
                onClick={() => setCategoryFilter('unplanned')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  categoryFilter === 'unplanned' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sadece Plansız Onarım
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Kategori ara..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white w-36 sm:w-48 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100/60 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center space-x-1.5">
                    <span>Hizmet / Gider Türü</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100/60 transition-colors text-right" onClick={() => handleSort('totalCost')}>
                  <div className="flex items-center justify-end space-x-1.5">
                    <span>Toplam Harcama</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100/60 transition-colors text-right" onClick={() => handleSort('costSharePct')}>
                  <div className="flex items-center justify-end space-x-1.5">
                    <span>Bütçe Payı</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100/60 transition-colors text-right" onClick={() => handleSort('operationCount')}>
                  <div className="flex items-center justify-end space-x-1.5">
                    <span>İşlem Adedi</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100/60 transition-colors text-right" onClick={() => handleSort('avgCost')}>
                  <div className="flex items-center justify-end space-x-1.5">
                    <span>Ort. İşlem Maliyeti</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">
                  <span>Bakım Niteliği</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sortedStats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Aranan kriterlere uygun hizmet kategorisi bulunamadı.
                  </td>
                </tr>
              ) : (
                sortedStats.map((e, idx) => {
                  const paletteColor = PALETTE[idx % PALETTE.length];
                  return (
                    <tr key={e.name} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center space-x-2.5">
                          <div 
                            className="h-2.5 w-2.5 rounded-full shrink-0" 
                            style={{ backgroundColor: paletteColor }} 
                          />
                          <span className="truncate">{e.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        {e.totalCost.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden hidden sm:block">
                            <div 
                              className="h-full rounded-full" 
                              style={{ width: `${Math.min(100, e.costSharePct)}%`, backgroundColor: paletteColor }} 
                            />
                          </div>
                          <span className="font-bold text-slate-800 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md">
                            %{e.costSharePct}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-700">
                        {e.operationCount.toLocaleString('tr-TR')}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {e.avgCost.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="py-3 px-4 text-center">
                        {e.isPlannedMaintenance ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600" /> Planlı Bakım
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="h-3 w-3 mr-1 text-amber-600" /> Onarım / Sarf
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
