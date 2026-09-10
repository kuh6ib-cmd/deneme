import React, { useState, useMemo, useEffect } from 'react';
import { NormalizedFleetRecord, RawFleetRecord } from '../../types';
import { Search, ShieldCheck, Wrench, Droplet, AlertTriangle } from 'lucide-react';

interface DataTableViewProps {
  normalizedRecords: NormalizedFleetRecord[];
  rawRecords: RawFleetRecord[];
  brandsList: string[];
  expenseTypesList: string[];
  fleetsList?: string[];
  initialFleetFilter?: string;
}

export const DataTableView: React.FC<DataTableViewProps> = ({
  normalizedRecords,
  rawRecords,
  brandsList,
  expenseTypesList,
  fleetsList = [],
  initialFleetFilter = 'ALL',
}) => {
  const [viewMode, setViewMode] = useState<'normalized' | 'raw'>('normalized');
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedExpense, setSelectedExpense] = useState('ALL');
  const [selectedFleet, setSelectedFleet] = useState(initialFleetFilter);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    setPage(1);
  }, [search, selectedBrand, selectedExpense, selectedFleet, viewMode]);

  // Derive unique fleets if not provided
  const allFleets = useMemo(() => {
    if (fleetsList && fleetsList.length > 0) return fleetsList;
    return Array.from(new Set(normalizedRecords.map(r => r.fleetGroup).filter(Boolean))).sort();
  }, [fleetsList, normalizedRecords]);

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return normalizedRecords.filter(r => {
      if (selectedBrand !== 'ALL' && r.brand !== selectedBrand) return false;
      if (selectedExpense !== 'ALL' && r.expenseType !== selectedExpense) return false;
      if (selectedFleet !== 'ALL' && r.fleetGroup !== selectedFleet) return false;

      if (q) {
        return (
          (r.plate && r.plate.toLowerCase().includes(q)) ||
          (r.brand && r.brand.toLowerCase().includes(q)) ||
          (r.model && r.model.toLowerCase().includes(q)) ||
          (r.supplier && r.supplier.toLowerCase().includes(q)) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          (r.fleetGroup && r.fleetGroup.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [normalizedRecords, selectedBrand, selectedExpense, selectedFleet, search]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const pagedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page, pageSize]);

  return (
    <div className="space-y-6">
      {/* Banner & Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Filo Bakım ve İşlem Kayıtları
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Normalize edilmiş, anomali kontrolünden geçmiş veri satırlarını görüntüleyin
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl space-x-1">
          <button
            onClick={() => setViewMode('normalized')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'normalized' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Normalize Edilmiş Veri ({normalizedRecords.length})
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'raw' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Ham Veri Önizleme
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Model, marka, servis, açıklama veya filo ara..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Brand Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-xs text-slate-500 font-medium">Marka:</span>
          <select
            value={selectedBrand}
            onChange={e => { setSelectedBrand(e.target.value); setPage(1); }}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tüm Markalar</option>
            {brandsList.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Fleet Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-xs text-slate-500 font-medium">Filo:</span>
          <select
            value={selectedFleet}
            onChange={e => { setSelectedFleet(e.target.value); setPage(1); }}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tüm Filolar ({allFleets.length})</option>
            {allFleets.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Expense Type Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-xs text-slate-500 font-medium">Gider Türü:</span>
          <select
            value={selectedExpense}
            onChange={e => { setSelectedExpense(e.target.value); setPage(1); }}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tüm Gider Türleri</option>
            {expenseTypesList.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {viewMode === 'normalized' ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <th className="py-3 px-4">Araç No</th>
                  <th className="py-3 px-4">Filo Grubu</th>
                  <th className="py-3 px-4">Marka & Model</th>
                  <th className="py-3 px-4">Model Yılı / KM</th>
                  <th className="py-3 px-4">Gider / Hizmet Türü</th>
                  <th className="py-3 px-4">Y.P. / Menşei</th>
                  <th className="py-3 px-4">Servis Noktası</th>
                  <th className="py-3 px-4 text-right">Tutar (₺)</th>
                  <th className="py-3 px-4 text-right">KM Başı (₺/KM)</th>
                  <th className="py-3 px-4">Açıklama</th>
                  <th className="py-3 px-4 text-center">Durum / Not</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {pagedRecords.map((r, idx) => {
                  const wasBrandCorrected = r.originalBrand && r.originalBrand.toUpperCase() !== r.brand;
                  const anomCount = r.anomalies?.length || 0;
                  const kmVal = r.km || 0;
                  const rowCostPerKm = kmVal > 0 ? (r.totalPrice / kmVal).toFixed(2) : '-';
                  const rowNum = (page - 1) * pageSize + idx + 1;

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        Araç #{rowNum}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                          {r.fleetGroup || 'Genel Filo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                          <span>{r.brand}</span>
                          {wasBrandCorrected && (
                            <span className="text-[10px] text-blue-600 font-semibold" title={`Orijinal: ${r.originalBrand}`}>
                              (Düzeltildi)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{r.model}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-800 font-semibold">
                          {r.modelYear} <span className="text-slate-400 font-normal">({r.age} Yaş)</span>
                        </div>
                        <div className="text-[11px] font-bold text-sky-700">
                          {kmVal > 0 ? `${kmVal.toLocaleString('tr-TR')} KM` : 'KM Belirtilmemiş'}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[11px]">
                          {r.expenseType}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {r.sparePartOrigin === 'BOSCH' ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Bosch</span>
                          </span>
                        ) : r.sparePartOrigin === 'DIGER_YP' ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Diğer Y.P.</span>
                          </span>
                        ) : r.sparePartOrigin === 'SIVILAR_KIMYASAL' ? (
                          <div className="flex flex-col items-start gap-0.5">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              <Droplet className="h-3 w-3" />
                              <span>Sıvı / Yağ</span>
                            </span>
                            {r.wasReclassifiedFromOtherYP && (
                              <span className="text-[9px] text-blue-700 font-medium">⚡ Otomatik Sıvı</span>
                            )}
                          </div>
                        ) : r.sparePartOrigin === 'ISCILIK' ? (
                          <div className="flex flex-col items-start gap-0.5">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              <Wrench className="h-3 w-3" />
                              <span>İşçilik</span>
                            </span>
                            {r.wasReclassifiedFromOtherYP && (
                              <span className="text-[9px] text-purple-700 font-medium">⚡ Otomatik İşçilik</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500">{r.sparePartType || '-'}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-[150px] truncate" title={r.supplier}>
                        {r.supplier}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                        {r.totalPrice.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700 whitespace-nowrap">
                        {rowCostPerKm !== '-' ? `${rowCostPerKm} ₺/KM` : '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate" title={r.description}>
                        {r.description || '-'}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {r.isOutlier && (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                            Uç Değer
                          </span>
                        )}
                        {anomCount > 0 && !r.isOutlier && (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Anomali Kaydı
                          </span>
                        )}
                        {anomCount === 0 && !r.isOutlier && (
                          <span className="text-emerald-600 text-[11px] font-medium flex items-center justify-center">
                            <ShieldCheck className="h-3.5 w-3.5 mr-0.5" /> Standart
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-4 overflow-x-auto">
              <pre className="text-[11px] font-mono text-slate-700 bg-slate-50 p-4 rounded-xl max-h-96 overflow-y-auto">
                {JSON.stringify(rawRecords.slice(0, 10), null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Toplam <span className="font-bold text-slate-800">{filteredRecords.length}</span> kayıttan {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredRecords.length)} arası
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-white border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-medium"
            >
              Önceki
            </button>
            <span className="font-bold text-slate-700">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 bg-white border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50 font-medium"
            >
              Sonraki
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
