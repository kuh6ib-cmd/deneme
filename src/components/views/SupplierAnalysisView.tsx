import React, { useState, useMemo, useEffect } from 'react';
import { SupplierStat } from '../../types';
import { 
  Building2, 
  ArrowUpDown, 
  Search, 
  Car, 
  ChevronDown, 
  ChevronRight, 
  TrendingUp, 
  Sparkles,
  Percent,
  ChevronLeft
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

interface SupplierAnalysisViewProps {
  supplierStats: SupplierStat[];
}

export const SupplierAnalysisView: React.FC<SupplierAnalysisViewProps> = ({ supplierStats }) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof SupplierStat>('totalCost');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredSuppliers = useMemo(() => {
    if (!search.trim()) return supplierStats;
    const q = search.trim().toLowerCase();
    return supplierStats.filter(s => {
      return (
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.primaryBrand && s.primaryBrand.toLowerCase().includes(q)) ||
        (s.servedPlates && s.servedPlates.some(p => p.plate && p.plate.toLowerCase().includes(q)))
      );
    });
  }, [supplierStats, search]);

  const sortedSuppliers = useMemo(() => {
    return [...filteredSuppliers].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });
  }, [filteredSuppliers, sortField, sortAsc]);

  const totalPages = Math.ceil(sortedSuppliers.length / pageSize) || 1;
  const pagedSuppliers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedSuppliers.slice(start, start + pageSize);
  }, [sortedSuppliers, page, pageSize]);

  const handleSort = (field: keyof SupplierStat) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const chartData = useMemo(() => {
    return supplierStats.slice(0, 8).map(s => ({
      name: s.name.length > 18 ? `${s.name.slice(0, 16)}...` : s.name,
      fullName: s.name,
      totalCost: s.totalCost,
      vendorPriceIndex: s.vendorPriceIndex,
      avgTicket: s.avgTicket,
      vehicleCount: s.vehicleCount,
    }));
  }, [supplierStats]);

  const totalSupplierSpend = useMemo(() => {
    return supplierStats.reduce((sum, s) => sum + s.totalCost, 0);
  }, [supplierStats]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Servis & Tedarikçi Bazlı Toplam Harcama Analizi
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Her bir servisin toplam maliyeti (A Servisi toplam X ₺, B Servisi toplam Y ₺) ve hizmet verdiği araç dökümleri
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-slate-400">Aktif Servis:</span> <span className="font-bold text-slate-800">{supplierStats.length}</span>
          </div>
          <div className="bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 text-indigo-800">
            <span className="text-indigo-600">Toplam Servis Gideri:</span> <span className="font-bold">{totalSupplierSpend.toLocaleString('tr-TR')} ₺</span>
          </div>
        </div>
      </div>

      {/* Top 3 Spend Services Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {supplierStats.slice(0, 3).map((s, idx) => (
          <div 
            key={s.name}
            onClick={() => setExpandedSupplier(expandedSupplier === s.name ? null : s.name)}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="h-5 w-5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">
                  #{idx + 1}
                </span>
                <span className="font-bold text-xs text-slate-900 truncate max-w-[160px]">{s.name}</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                %{s.costSharePct} Pay
              </span>
            </div>

            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xs text-slate-500">{s.vehicleCount} Farklı Araç</span>
              <span className="text-base font-black text-slate-900">{s.totalCost.toLocaleString('tr-TR')} ₺</span>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span>{s.operationCount} İşlem Yapıldı</span>
              <span>Ort: <strong>{s.avgTicket.toLocaleString('tr-TR')} ₺</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Suppliers Cost */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
            En Yüksek Harcama Yapılan Servis Noktaları (C Sütunu Toplamları)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Toplam bakım ve onarım bütçesinin aktığı ilk 8 servis noktası
          </p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 80, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k ₺`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip
                  formatter={(val: number) => [`${val.toLocaleString('tr-TR')} ₺`, 'Toplam Harcama']}
                  labelFormatter={label => chartData.find(d => d.name === label)?.fullName || label}
                />
                <Bar dataKey="totalCost" fill="#4f46e5" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3730a3' : index < 3 ? '#4f46e5' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Price Index Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tedarikçi Fiyat Endeksi (Pahalı vs Ekonomik)
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              100 = Filo Ortalama Faturası
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            &gt;100 olanlar filo ortalamasından daha yüksek birim fiyat/fatura üreten servislerdir
          </p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                <Tooltip
                  formatter={(val: number) => [`Endeks: ${val}`, 'Fiyat Endeksi']}
                  labelFormatter={label => chartData.find(d => d.name === label)?.fullName || label}
                />
                <Bar dataKey="vendorPriceIndex" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.vendorPriceIndex > 120 ? '#e11d48' : entry.vendorPriceIndex < 85 ? '#10b981' : '#6366f1'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Servis adı, marka veya plaka ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {sortedSuppliers.length} Servis Listeleniyor (Plaka dökümü için servise tıklayın)
        </span>
      </div>

      {/* Supplier Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Servis & Tedarikçi Toplam Harcama Tablosu
            </h3>
            <p className="text-xs text-slate-500">
              Herhangi bir servise tıklayarak bu serviste bakım gören plakaları ve harcama detaylarını görebilirsiniz.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center space-x-1">
                    <span>Servis Noktası</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer text-right" onClick={() => handleSort('totalCost')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Toplam Harcama (₺)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer text-right" onClick={() => handleSort('costSharePct')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Harcama Payı</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer text-right" onClick={() => handleSort('vehicleCount')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Hizmet Alan Araç</span>
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
                    <span>Ortalama Fatura</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer text-right" onClick={() => handleSort('vendorPriceIndex')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Fiyat Endeksi</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4">
                  <span>Ağırlıklı Marka</span>
                </th>
                <th className="py-3 px-3 text-center">Plaka Detayı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pagedSuppliers.map(s => {
                const isExpanded = expandedSupplier === s.name;

                return (
                  <React.Fragment key={s.name}>
                    <tr 
                      onClick={() => setExpandedSupplier(isExpanded ? null : s.name)}
                      className={`hover:bg-indigo-50/40 transition-colors cursor-pointer font-medium ${
                        isExpanded ? 'bg-indigo-50/60' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                          <span>{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 whitespace-nowrap text-sm">
                        {s.totalCost.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                          %{s.costSharePct}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">{s.vehicleCount}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">{s.operationCount}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800 whitespace-nowrap">
                        {s.avgTicket.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-[11px] ${
                          s.vendorPriceIndex > 120
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : s.vendorPriceIndex < 85
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {s.vendorPriceIndex}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{s.primaryBrand}</td>
                      <td className="py-3 px-3 text-center text-slate-400">
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-indigo-600 mx-auto" /> : <ChevronRight className="h-4 w-4 mx-auto" />}
                      </td>
                    </tr>

                    {/* Expandable Plaka Dökümü for this Supplier */}
                    {isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={9} className="p-4 border-y border-slate-200">
                          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                                  <Car className="h-3.5 w-3.5 text-indigo-600" />
                                  <span>{s.name} Servisinde Hizmet Alan Araçlar & Harcamaları</span>
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  Bu serviste toplam {s.totalCost.toLocaleString('tr-TR')} ₺ harcama yapılmış olup {s.vehicleCount} farklı araç işlem görmüştür.
                                </p>
                              </div>
                            </div>

                            {s.servedPlates && s.servedPlates.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto p-1">
                                {s.servedPlates.map((p, pIdx) => (
                                  <div 
                                    key={p.plate || pIdx}
                                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-xs text-slate-900">Araç #{pIdx + 1}</span>
                                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700">
                                        %{p.costSharePct}
                                      </span>
                                    </div>
                                    <div className="mt-1.5 flex items-baseline justify-between text-[11px]">
                                      <span className="text-slate-500">{p.brand} {p.model}</span>
                                      <span className="font-black text-slate-900">{p.totalCost.toLocaleString('tr-TR')} ₺</span>
                                    </div>
                                    <div className="mt-1 text-[10px] text-slate-400">
                                      {p.operationCount} İşlem / Fatura
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-400 py-2">Araç detayı bulunamadı.</div>
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

        {/* Pagination Footer */}
        {sortedSuppliers.length > pageSize && (
          <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Toplam <span className="font-semibold text-slate-900">{sortedSuppliers.length}</span> servisten{' '}
              <span className="font-semibold text-slate-900">{(page - 1) * pageSize + 1}</span> -{' '}
              <span className="font-semibold text-slate-900">{Math.min(page * pageSize, sortedSuppliers.length)}</span> arası gösteriliyor
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                id="btn-suppliers-prev-page"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  page === 1 
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Önceki</span>
              </button>

              <span className="px-2 py-1 text-slate-700 font-semibold">
                Sayfa {page} / {totalPages}
              </span>

              <button
                id="btn-suppliers-next-page"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  page >= totalPages 
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
      </div>
    </div>
  );
};
