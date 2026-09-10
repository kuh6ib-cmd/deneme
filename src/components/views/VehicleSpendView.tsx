import React, { useState, useMemo, useEffect } from 'react';
import { VehicleSpendStat, NormalizedFleetRecord } from '../../types';
import { 
  Car, 
  Search, 
  ArrowUpDown, 
  Building2, 
  ChevronDown, 
  ChevronRight, 
  AlertTriangle, 
  ShieldCheck, 
  Gauge, 
  Wallet,
  TrendingUp,
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
  Cell 
} from 'recharts';

interface VehicleSpendViewProps {
  vehicleSpendStats: VehicleSpendStat[];
  normalizedRecords: NormalizedFleetRecord[];
}

export const VehicleSpendView: React.FC<VehicleSpendViewProps> = ({
  vehicleSpendStats,
  normalizedRecords,
}) => {
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedService, setSelectedService] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [sortField, setSortField] = useState<keyof VehicleSpendStat>('totalCost');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedPlate, setExpandedPlate] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    setPage(1);
  }, [search, selectedBrand, selectedService, selectedRisk]);

  // Extract unique brands and services for filters
  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(vehicleSpendStats.map(v => v.brand).filter(Boolean))).sort();
  }, [vehicleSpendStats]);

  const uniqueServices = useMemo(() => {
    const services = new Set<string>();
    vehicleSpendStats.forEach(v => {
      v.servicesVisited.forEach(s => services.add(s.serviceName));
    });
    return Array.from(services).sort();
  }, [vehicleSpendStats]);

  // Filtered & Sorted Records
  const filteredVehicles = useMemo(() => {
    return vehicleSpendStats.filter(v => {
      if (selectedBrand !== 'ALL' && v.brand !== selectedBrand) return false;
      if (selectedRisk !== 'ALL' && v.riskLevel !== selectedRisk) return false;
      if (selectedService !== 'ALL' && !v.servicesVisited.some(s => s.serviceName === selectedService)) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          v.plate.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.primaryService.toLowerCase().includes(q) ||
          v.fleetGroup.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [vehicleSpendStats, selectedBrand, selectedService, selectedRisk, search]);

  const sortedVehicles = useMemo(() => {
    return [...filteredVehicles].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });
  }, [filteredVehicles, sortField, sortAsc]);

  const handleSort = (field: keyof VehicleSpendStat) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const totalPages = Math.ceil(sortedVehicles.length / pageSize) || 1;
  const pagedVehicles = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedVehicles.slice(start, start + pageSize);
  }, [sortedVehicles, page, pageSize]);

  // Top 8 Vehicles for Quick Chart
  const topVehiclesChartData = useMemo(() => {
    return vehicleSpendStats.slice(0, 8).map((v, idx) => ({
      vehicleName: `Araç #${idx + 1}`,
      plate: v.plate,
      totalCost: v.totalCost,
      brand: v.brand,
      model: v.model,
      primaryService: v.primaryService,
    }));
  }, [vehicleSpendStats]);

  // Overall metrics
  const totalFleetCost = useMemo(() => {
    return vehicleSpendStats.reduce((sum, v) => sum + v.totalCost, 0);
  }, [vehicleSpendStats]);

  const avgCostPerVehicle = vehicleSpendStats.length > 0
    ? Math.round(totalFleetCost / vehicleSpendStats.length)
    : 0;

  const topVehicle = vehicleSpendStats[0];

  // Records for expanded vehicle
  const expandedVehicleRecords = useMemo(() => {
    if (!expandedPlate) return [];
    return normalizedRecords.filter(r => r.plate === expandedPlate);
  }, [expandedPlate, normalizedRecords]);

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
              <Car className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              Araç Bazlı Toplam Harcama Analizi
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Her bir aracın toplam bakım ve onarım harcaması, hizmet aldığı servisler ve maliyet payları
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
            <span className="text-slate-500">Toplam Araç:</span> <span className="font-semibold text-slate-800">{vehicleSpendStats.length}</span>
          </div>
          <div className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 text-slate-800">
            <span className="text-slate-500">Araç Başı Ort:</span> <span className="font-semibold text-slate-900">{avgCostPerVehicle.toLocaleString('tr-TR')} ₺</span>
          </div>
        </div>
      </div>

      {/* Top 3 High-Spend Vehicles Highlight & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top 3 Vehicle Cards */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-800">
              En Yüksek Harcama Yapan İlk 3 Araç
            </h3>
            <span className="text-[10px] text-slate-500">Maliyet Liderleri</span>
          </div>

          {vehicleSpendStats.slice(0, 3).map((v, idx) => (
            <div
              key={v.plate}
              onClick={() => setExpandedPlate(expandedPlate === v.plate ? null : v.plate)}
              className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1.5">
                  <span className="h-4.5 w-4.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-xs text-slate-900">Araç #{idx + 1} ({v.brand} {v.model})</span>
                </div>
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200/60">
                  %{v.costSharePct} Pay
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <span className="text-[11px] text-slate-500">{v.fleetGroup || 'Filo'} • Model Yılı: {v.modelYear}</span>
                <span className="text-sm font-bold text-slate-900">{v.totalCost.toLocaleString('tr-TR')} ₺</span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
                <div className="flex items-center space-x-1">
                  <Building2 className="h-3 w-3 text-slate-400" />
                  <span className="truncate max-w-[140px]">{v.primaryService}</span>
                </div>
                <span className="text-slate-700 font-medium">{v.operationCount} İşlem</span>
              </div>
            </div>
          ))}
        </div>

        {/* Top 8 Vehicles Horizontal Bar Chart */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-0.5">
              Araç Bazında Toplam Maliyet Sıralaması (İlk 8 Araç)
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Filo bütçesini en çok tüketen araçların toplam harcama tutarları
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVehiclesChartData} layout="vertical" margin={{ top: 5, right: 20, left: 70, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k ₺`} />
                <YAxis dataKey="vehicleName" type="category" tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => [`${val.toLocaleString('tr-TR')} ₺`, 'Toplam Harcama']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  labelFormatter={vehicleName => {
                    const item = topVehiclesChartData.find(d => d.vehicleName === vehicleName);
                    return item ? `${vehicleName}: ${item.brand} ${item.model} (${item.primaryService})` : vehicleName;
                  }}
                />
                <Bar dataKey="totalCost" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {topVehiclesChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : index < 3 ? '#3b82f6' : '#60a5fa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Marka, model, servis veya filo grubu ara..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 font-normal"
          />
        </div>

        {/* Brand Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-xs text-slate-500 font-medium">Marka:</span>
          <select
            value={selectedBrand}
            onChange={e => { setSelectedBrand(e.target.value); setPage(1); }}
            className="text-xs bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-slate-400"
          >
            <option value="ALL">Tüm Markalar</option>
            {uniqueBrands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Service Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-xs text-slate-500 font-medium">Servis:</span>
          <select
            value={selectedService}
            onChange={e => { setSelectedService(e.target.value); setPage(1); }}
            className="text-xs bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-slate-400 max-w-[180px]"
          >
            <option value="ALL">Tüm Servisler</option>
            {uniqueServices.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Risk Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-xs text-slate-500 font-medium">Risk:</span>
          <select
            value={selectedRisk}
            onChange={e => { setSelectedRisk(e.target.value); setPage(1); }}
            className="text-xs bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-slate-400"
          >
            <option value="ALL">Tüm Riskler</option>
            <option value="Kritik Risk">Kritik Risk</option>
            <option value="Maliyet Riski">Maliyet Riski</option>
            <option value="Yüksek KM Riski">Yüksek KM</option>
            <option value="Yaş Riski">Yaş Riski</option>
            <option value="Düşük / Normal Risk">Normal</option>
          </select>
        </div>
      </div>

      {/* Main Vehicle Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Araç Bazında Toplam Harcama Tablosu
            </h3>
            <p className="text-[11px] text-slate-500">
              Araç satırına tıklayarak servis harcama detaylarını ve faturaları inceleyebilirsiniz.
            </p>
          </div>
          <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
            {filteredVehicles.length} Araç
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 text-slate-600 border-b border-slate-200/80 font-semibold">
                <th className="py-2.5 px-3 w-8 text-center">#</th>
                <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('plate')}>
                  <div className="flex items-center space-x-1">
                    <span>Araç Kimliği</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('brand')}>
                  <div className="flex items-center space-x-1">
                    <span>Marka & Model</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('km')}>
                  <div className="flex items-center space-x-1">
                    <span>Model Yılı / KM</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer text-right" onClick={() => handleSort('totalCost')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Toplam Harcama</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer text-right" onClick={() => handleSort('costSharePct')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Pay (%)</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3">
                  <span>Hizmet Aldığı Servisler</span>
                </th>
                <th className="py-2.5 px-3 cursor-pointer text-right" onClick={() => handleSort('operationCount')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>İşlem</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer text-right" onClick={() => handleSort('costPerKm')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>₺ / KM</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">Durum</th>
                <th className="py-2.5 px-2 text-center">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pagedVehicles.map((v, idx) => {
                const isExpanded = expandedPlate === v.plate;
                const rowNum = (page - 1) * pageSize + idx + 1;

                return (
                  <React.Fragment key={v.plate || idx}>
                    <tr 
                      onClick={() => setExpandedPlate(isExpanded ? null : v.plate)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer font-normal ${
                        isExpanded ? 'bg-slate-50/80' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 text-[11px]">
                        {rowNum}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <Car className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <span>Araç #{rowNum}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{v.brand} {v.model}</div>
                        <div className="text-[11px] text-slate-400">{v.fleetGroup || 'Filo'}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">{v.modelYear} ({v.age} Yaş)</div>
                        <div className="text-[11px] text-slate-400">{v.km.toLocaleString('tr-TR')} KM</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        {v.totalCost.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="inline-block px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          %{v.costSharePct}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[280px]">
                          {v.servicesVisited.slice(0, 2).map((s, sIdx) => (
                            <span 
                              key={sIdx} 
                              className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-normal border border-slate-200/60"
                              title={`${s.serviceName}: ${s.totalCost.toLocaleString('tr-TR')} ₺ (%${s.costSharePct})`}
                            >
                              <span className="truncate max-w-[100px]">{s.serviceName}</span>
                              <span className="text-slate-900 font-medium">({s.totalCost.toLocaleString('tr-TR')} ₺)</span>
                            </span>
                          ))}
                          {v.servicesVisited.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-medium px-1 py-0.2">
                              +{v.servicesVisited.length - 2} daha
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                        {v.operationCount}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-700 whitespace-nowrap">
                        {v.costPerKm} ₺
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-medium ${
                          v.riskLevel === 'Kritik Risk'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200/60'
                            : v.riskLevel === 'Maliyet Riski'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                        }`}>
                          {v.riskLevel}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-400">
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-700 mx-auto" /> : <ChevronRight className="h-3.5 w-3.5 mx-auto" />}
                      </td>
                    </tr>

                    {/* Expanded Drawer for this Vehicle */}
                    {isExpanded && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={11} className="p-3.5 border-y border-slate-200/70">
                          <div className="bg-white rounded-lg p-3.5 border border-slate-200/80 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                              <div>
                                <h4 className="text-xs font-semibold text-slate-900 flex items-center space-x-1.5">
                                  <Car className="h-3.5 w-3.5 text-slate-700" />
                                  <span>Araç #{rowNum} ({v.brand} {v.model}) Servis Harcama Kırılımı</span>
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Toplam {v.totalCost.toLocaleString('tr-TR')} ₺ harcamanın servis dağılımı
                                </p>
                              </div>
                              <div className="text-xs text-slate-600 flex items-center space-x-3">
                                <span>Ort. İşlem: <strong className="text-slate-800 font-semibold">{v.avgTicketCost.toLocaleString('tr-TR')} ₺</strong></span>
                                <span>Filo Grubu: <strong className="text-slate-800 font-semibold">{v.fleetGroup || 'Genel'}</strong></span>
                              </div>
                            </div>

                            {/* Service Breakdown List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              {v.servicesVisited.map((srv, sIdx) => (
                                <div key={sIdx} className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/60 flex flex-col justify-between">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-1.5">
                                      <Building2 className="h-3 w-3 text-slate-500 shrink-0" />
                                      <span className="font-semibold text-slate-900 text-xs truncate max-w-[150px]">{srv.serviceName}</span>
                                    </div>
                                    <span className="text-[10px] font-medium px-1 py-0.2 rounded bg-slate-100 text-slate-700">
                                      %{srv.costSharePct}
                                    </span>
                                  </div>
                                  <div className="mt-1.5 flex items-baseline justify-between">
                                    <span className="text-[11px] text-slate-500">{srv.operationCount} İşlem</span>
                                    <span className="text-xs font-bold text-slate-900">{srv.totalCost.toLocaleString('tr-TR')} ₺</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Recent Invoices / Records Table for this Plate */}
                            {expandedVehicleRecords.length > 0 && (
                              <div className="mt-2.5">
                                <h5 className="text-[11px] font-semibold text-slate-700 mb-1.5">Fatura & İşlem Kayıtları:</h5>
                                <div className="max-h-44 overflow-y-auto border border-slate-200/80 rounded-md">
                                  <table className="w-full text-left text-[11px]">
                                    <thead className="bg-slate-50 text-slate-600 font-medium sticky top-0 border-b border-slate-200/60">
                                      <tr>
                                        <th className="py-1.5 px-2.5">Tarih</th>
                                        <th className="py-1.5 px-2.5">Servis Noktası</th>
                                        <th className="py-1.5 px-2.5">Hizmet Türü</th>
                                        <th className="py-1.5 px-2.5">Açıklama</th>
                                        <th className="py-1.5 px-2.5 text-right">Tutar</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {expandedVehicleRecords.map((r, rIdx) => (
                                        <tr key={rIdx} className="hover:bg-slate-50/50">
                                          <td className="py-1.5 px-2.5 text-slate-600">{r.date || '-'}</td>
                                          <td className="py-1.5 px-2.5 font-medium text-slate-800">{r.supplier}</td>
                                          <td className="py-1.5 px-2.5 text-slate-600">{r.expenseType}</td>
                                          <td className="py-1.5 px-2.5 text-slate-500 truncate max-w-[200px]">{r.description || '-'}</td>
                                          <td className="py-1.5 px-2.5 text-right font-semibold text-slate-900">{r.totalPrice.toLocaleString('tr-TR')} ₺</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Toplam <span className="font-semibold text-slate-800">{filteredVehicles.length}</span> araçtan {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredVehicles.length)} arası
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50 font-medium text-slate-700"
            >
              Önceki
            </button>
            <span className="font-medium text-slate-700 px-1">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50 font-medium text-slate-700"
            >
              Sonraki
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
