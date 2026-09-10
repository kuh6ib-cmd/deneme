import React, { useState, useMemo, useEffect } from 'react';
import { AnomalyItem, DataQualityMetrics, NormalizedFleetRecord } from '../../types';
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  FileCheck,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface DataQualityViewProps {
  metrics: DataQualityMetrics;
  anomalies: AnomalyItem[];
  records: NormalizedFleetRecord[];
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({
  metrics,
  anomalies,
  records,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'typos' | 'logical' | 'outliers'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

  // Find all records where brand was corrected (memoized)
  const brandCorrections = useMemo(() => {
    return records.filter(r => r.originalBrand && r.originalBrand.toUpperCase() !== r.brand);
  }, [records]);

  const filteredAnomalies = useMemo(() => {
    const q = search.trim().toLowerCase();
    return anomalies.filter(a => {
      if (activeTab === 'typos' && a.type !== 'BRAND_TYPO') return false;
      if (activeTab === 'logical' && a.type !== 'INVALID_YEAR' && a.type !== 'INVALID_KM' && a.type !== 'KM_AGE_MISMATCH') return false;
      if (activeTab === 'outliers' && a.type !== 'COST_OUTLIER') return false;

      if (q) {
        return (
          (a.plate && a.plate.toLowerCase().includes(q)) ||
          (a.fieldName && a.fieldName.toLowerCase().includes(q)) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          (a.originalValue && String(a.originalValue).toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [anomalies, activeTab, search]);

  const totalPages = Math.ceil(filteredAnomalies.length / pageSize) || 1;
  const pagedAnomalies = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAnomalies.slice(start, start + pageSize);
  }, [filteredAnomalies, page, pageSize]);

  return (
    <div className="space-y-6">
      {/* Banner & Score Overview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Veri Kalitesi, Anomali Denetimi ve Standartlaştırma Motoru
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Otomotiv filo veri setinizdeki yazım yanlışları otomatik düzeltilmiş; mantıksal tarih/KM uyumsuzlukları ve istatistiksel uç değerler (outlier) ayrıştırılmıştır.
          </p>
        </div>

        {/* Quality Score Card */}
        <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white p-4 rounded-2xl flex items-center space-x-4 border border-slate-700 shadow-sm shrink-0">
          <div>
            <div className="text-[11px] font-semibold text-slate-300">Genel Veri Kalite Skoru</div>
            <div className="text-2xl font-black text-emerald-400">%{metrics.overallScore}</div>
            <div className="text-[10px] text-slate-400">
              {metrics.validRows} / {metrics.totalRows} Temiz Kayıt
            </div>
          </div>
          <div className="h-10 w-10 rounded-full border-4 border-emerald-500/40 border-t-emerald-400 flex items-center justify-center">
            <FileCheck className="h-5 w-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Brand Typos */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Düzeltilen Marka Yazımları</span>
            <span className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black">
              {metrics.brandTyposFixed}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            'REANULT', 'FIATTT', 'VW', 'RENO' vb.
          </p>
        </div>

        {/* Invalid Years */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Mantıksız Model Yılları</span>
            <span className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-black">
              {metrics.invalidYearsCount}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            1911, 2030 gibi hatalı girişler
          </p>
        </div>

        {/* KM / Age Mismatches */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">KM & Yaş Uyumsuzlukları</span>
            <span className="h-7 w-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-black">
              {metrics.kmAgeMismatchesCount}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            1 yaşında 500k KM veya 12 yaşında 1.800 KM
          </p>
        </div>

        {/* Statistical Outliers */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Uç Değer (Outlier) Fatura</span>
            <span className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-black">
              {metrics.outliersCount}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Ortalama + 2.5 Standart Sapma üstü faturalar
          </p>
        </div>
      </div>

      {/* Brand Corrections Detail Box */}
      {brandCorrections.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Otomatik Standartlaştırılan Marka Listesi (Örnek Eşleşmeler)
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {brandCorrections.slice(0, 6).map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-rose-600 line-through font-mono font-medium">
                  {item.originalBrand}
                </span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {item.brand}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomalies Table & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl space-x-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tüm Anomaliler ({anomalies.length})
            </button>
            <button
              onClick={() => setActiveTab('typos')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'typos' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Marka Yazım ({metrics.brandTyposFixed})
            </button>
            <button
              onClick={() => setActiveTab('logical')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'logical' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Mantıksal Tutarsızlık ({metrics.invalidYearsCount + metrics.invalidKmCount + metrics.kmAgeMismatchesCount})
            </button>
            <button
              onClick={() => setActiveTab('outliers')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'outliers' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Uç Değer / Outlier ({metrics.outliersCount})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Anomali veya değer ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4">Satır No</th>
                <th className="py-3 px-4">Araç</th>
                <th className="py-3 px-4">Anomali Türü</th>
                <th className="py-3 px-4">İlgili Alan</th>
                <th className="py-3 px-4">Orijinal Değer</th>
                <th className="py-3 px-4">Açıklama / Alınan Önlem</th>
                <th className="py-3 px-4">Kritiklik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {pagedAnomalies.map((a, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-slate-400">#{a.rowNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">Araç #{a.rowNumber}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {a.type === 'BRAND_TYPO' ? 'Marka Yazım Düzeltmesi' :
                     a.type === 'INVALID_YEAR' ? 'Geçersiz Model Yılı' :
                     a.type === 'INVALID_KM' ? 'Geçersiz KM Değeri' :
                     a.type === 'KM_AGE_MISMATCH' ? 'KM / Yaş Uyumsuzluğu' :
                     a.type === 'COST_OUTLIER' ? 'İstatistiksel Uç Değer (Outlier)' : a.type}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{a.fieldName}</td>
                  <td className="py-3 px-4 text-rose-600 font-mono font-bold">{String(a.originalValue)}</td>
                  <td className="py-3 px-4 text-slate-800">{a.description}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.severity === 'high' ? 'bg-rose-100 text-rose-800' :
                      a.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {a.severity === 'high' ? 'Yüksek' : a.severity === 'medium' ? 'Orta' : 'Bilgi'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAnomalies.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Seçilen kriterde anomali kaydı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredAnomalies.length > pageSize && (
          <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Toplam <span className="font-semibold text-slate-900">{filteredAnomalies.length}</span> anomali kaydından{' '}
              <span className="font-semibold text-slate-900">{(page - 1) * pageSize + 1}</span> -{' '}
              <span className="font-semibold text-slate-900">{Math.min(page * pageSize, filteredAnomalies.length)}</span> arası gösteriliyor
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                id="btn-quality-prev-page"
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
                id="btn-quality-next-page"
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
