import React, { useState, useMemo, useEffect } from 'react';
import { RiskLevel, VehicleRiskRecord } from '../../types';
import { 
  AlertOctagon, 
  Search, 
  Filter, 
  ShieldAlert, 
  AlertTriangle, 
  Car, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface RiskMatrixViewProps {
  riskRecords: VehicleRiskRecord[];
}

export const RiskMatrixView: React.FC<RiskMatrixViewProps> = ({ riskRecords }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    setPage(1);
  }, [selectedFilter, searchQuery]);

  const counts = useMemo(() => {
    let critical = 0;
    let cost = 0;
    let km = 0;
    let age = 0;
    let normal = 0;

    for (let i = 0; i < riskRecords.length; i++) {
      const lvl = riskRecords[i].riskLevel;
      if (lvl === 'Kritik Risk') critical++;
      else if (lvl === 'Maliyet Riski') cost++;
      else if (lvl === 'Yüksek KM Riski') km++;
      else if (lvl === 'Yaş Riski') age++;
      else normal++;
    }

    return {
      all: riskRecords.length,
      critical,
      cost,
      km,
      age,
      normal,
    };
  }, [riskRecords]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return riskRecords.filter(r => {
      if (selectedFilter === 'CRITICAL' && r.riskLevel !== 'Kritik Risk') return false;
      if (selectedFilter === 'COST' && r.riskLevel !== 'Maliyet Riski') return false;
      if (selectedFilter === 'KM' && r.riskLevel !== 'Yüksek KM Riski') return false;
      if (selectedFilter === 'AGE' && r.riskLevel !== 'Yaş Riski') return false;
      if (selectedFilter === 'NORMAL' && r.riskLevel !== 'Düşük / Normal Risk') return false;

      if (q) {
        return (
          (r.plate && r.plate.toLowerCase().includes(q)) ||
          (r.brand && r.brand.toLowerCase().includes(q)) ||
          (r.model && r.model.toLowerCase().includes(q)) ||
          (r.fleetGroup && r.fleetGroup.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [riskRecords, selectedFilter, searchQuery]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const pagedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page, pageSize]);

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'Kritik Risk':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
            <AlertOctagon className="h-3.5 w-3.5 mr-1 text-rose-600" />
            KRİTİK RİSK (&gt;8 Yaş & &gt;150k KM)
          </span>
        );
      case 'Maliyet Riski':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="h-3.5 w-3.5 mr-1 text-amber-700" />
            MALİYET KARA DELİĞİ (%50+ Sapma)
          </span>
        );
      case 'Yüksek KM Riski':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 text-orange-800 border border-orange-200">
            YÜKSEK KM (&gt;150.000 KM)
          </span>
        );
      case 'Yaş Riski':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-yellow-50 text-yellow-800 border border-yellow-200">
            YAŞ RİSKİ (&gt;8 Yaş)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
            Düşük / Normal Risk
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Araç Bazlı Risk Değerlendirme & Karar Destek Matrisi
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Yaş, kilometre, harcama anomalileri ve filo ortalaması sapmalarına göre her araç için belirlenmiş aksiyon planı
          </p>
        </div>
      </div>

      {/* Risk Filter Cards / Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setSelectedFilter('ALL')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-medium opacity-80">Tüm Araçlar</div>
          <div className="text-lg font-black mt-0.5">{counts.all}</div>
        </button>

        <button
          onClick={() => setSelectedFilter('CRITICAL')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedFilter === 'CRITICAL'
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
              : 'bg-rose-50/60 text-rose-900 border-rose-200 hover:bg-rose-100/60'
          }`}
        >
          <div className="text-[11px] font-bold">Kritik Risk</div>
          <div className="text-lg font-black mt-0.5">{counts.critical}</div>
        </button>

        <button
          onClick={() => setSelectedFilter('COST')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedFilter === 'COST'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-amber-50/60 text-amber-900 border-amber-200 hover:bg-amber-100/60'
          }`}
        >
          <div className="text-[11px] font-bold">Maliyet Riski</div>
          <div className="text-lg font-black mt-0.5">{counts.cost}</div>
        </button>

        <button
          onClick={() => setSelectedFilter('KM')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedFilter === 'KM'
              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
              : 'bg-orange-50/60 text-orange-900 border-orange-200 hover:bg-orange-100/60'
          }`}
        >
          <div className="text-[11px] font-bold">Yüksek KM</div>
          <div className="text-lg font-black mt-0.5">{counts.km}</div>
        </button>

        <button
          onClick={() => setSelectedFilter('AGE')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedFilter === 'AGE'
              ? 'bg-yellow-600 text-white border-yellow-600 shadow-xs'
              : 'bg-yellow-50/60 text-yellow-900 border-yellow-200 hover:bg-yellow-100/60'
          }`}
        >
          <div className="text-[11px] font-bold">Yaş Riski</div>
          <div className="text-lg font-black mt-0.5">{counts.age}</div>
        </button>

        <button
          onClick={() => setSelectedFilter('NORMAL')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedFilter === 'NORMAL'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-emerald-50/60 text-emerald-900 border-emerald-200 hover:bg-emerald-100/60'
          }`}
        >
          <div className="text-[11px] font-bold">Düşük Risk</div>
          <div className="text-lg font-black mt-0.5">{counts.normal}</div>
        </button>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Marka, model veya filo ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Toplam {filteredRecords.length} araç listeleniyor
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4">Araç</th>
                <th className="py-3 px-4">Model Yılı & KM</th>
                <th className="py-3 px-4 text-right">Toplam Harcama</th>
                <th className="py-3 px-4 text-center">Risk Düzeyi & Skoru</th>
                <th className="py-3 px-4">Risk Gerekçeleri</th>
                <th className="py-3 px-4">Önerilen Karar / Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pagedRecords.map((r, idx) => (
                <tr key={r.plate || idx} className="hover:bg-slate-50 font-medium transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-xs">
                      Araç #{(page - 1) * pageSize + idx + 1}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {r.brand} {r.model} • <span className="font-semibold text-slate-600">{r.fleetGroup}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">
                      {r.modelYear} <span className="text-slate-400 font-normal">({r.age} Yaş)</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {r.km.toLocaleString('tr-TR')} KM
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="font-black text-slate-900">
                      {r.totalCost.toLocaleString('tr-TR')} ₺
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {r.operationCount} İşlem
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div>{getRiskBadge(r.riskLevel)}</div>
                    <div className="text-[10px] font-bold text-slate-500 mt-1">
                      Risk Skoru: {r.riskScore} / 100
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {r.riskReasons.map((reason, idx) => (
                        <div key={idx} className="text-[11px] text-rose-700 font-semibold flex items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1.5 shrink-0"></span>
                          {reason}
                        </div>
                      ))}
                      {r.riskReasons.length === 0 && (
                        <span className="text-[11px] text-emerald-700 flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Normal seyir
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="font-bold text-slate-900 text-xs">
                        {r.recommendedAction}
                      </div>
                    </div>
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.actionUrgency === 'Acil'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : r.actionUrgency === 'Orta Vadeli'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        Aciliyet: {r.actionUrgency}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredRecords.length > pageSize && (
          <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Toplam <span className="font-semibold text-slate-900">{filteredRecords.length}</span> riskli araçtan{' '}
              <span className="font-semibold text-slate-900">{(page - 1) * pageSize + 1}</span> -{' '}
              <span className="font-semibold text-slate-900">{Math.min(page * pageSize, filteredRecords.length)}</span> arası gösteriliyor
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                id="btn-risks-prev-page"
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
                id="btn-risks-next-page"
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
