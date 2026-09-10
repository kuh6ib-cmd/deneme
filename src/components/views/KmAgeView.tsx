import React from 'react';
import { AgeSegmentStat, KmSegmentStat } from '../../types';
import { TrendingUp, Calendar, AlertOctagon, Activity } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface KmAgeViewProps {
  kmStats: KmSegmentStat[];
  ageStats: AgeSegmentStat[];
}

export const KmAgeView: React.FC<KmAgeViewProps> = ({ kmStats, ageStats }) => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Kilometre ve Model Yaşı Segmentasyon Analizi
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Araçların yıpranma döngüleri, kilometre eşikleri ve yaşlandıkça artan bakım maliyet eğrileri
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200 flex items-center">
            <AlertOctagon className="h-3.5 w-3.5 mr-1" />
            150k+ KM &gt; Maliyet Sıçraması
          </span>
        </div>
      </div>

      {/* Grid: KM Curve and Age Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KM Escalation Curve */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
            Kilometreye Göre Araç Başı Ortalama Maliyet Eğrisi (₺)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Kilometre yükseldikçe araç başına harcamanın üstel artışı
          </p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kmStats} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <defs>
                  <linearGradient id="colorKm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="segment" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k ₺`} />
                <Tooltip formatter={(val: number) => [`${val.toLocaleString('tr-TR')} ₺`, 'Araç Başı Maliyet']} />
                <Area type="monotone" dataKey="avgCostPerVehicle" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorKm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Groups Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
            Model Yaşı Gruplarına Göre Toplam Harcama (₺)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            0-2 yaş, 3-5 yaş, 6-8 yaş ve 9+ yaş filo segmentleri toplam harcama yükü
          </p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageStats} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="segment" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k ₺`} />
                <Tooltip formatter={(val: number) => [`${val.toLocaleString('tr-TR')} ₺`, 'Toplam Harcama']} />
                <Bar dataKey="totalCost" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Segment Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KM Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Kilometre Aralıkları Detay Tablosu
            </h4>
            <Activity className="h-4 w-4 text-sky-600" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">KM Segmenti</th>
                  <th className="py-2.5 px-4 text-right">Araç Sayısı</th>
                  <th className="py-2.5 px-4 text-right">Toplam Harcama</th>
                  <th className="py-2.5 px-4 text-right">Araç Başı Ort.</th>
                  <th className="py-2.5 px-4 text-right">KM Başı (₺/KM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {kmStats.map(k => (
                  <tr key={k.segment} className="hover:bg-sky-50/20 font-medium">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{k.segment}</td>
                    <td className="py-2.5 px-4 text-right">{k.vehicleCount}</td>
                    <td className="py-2.5 px-4 text-right font-semibold">{k.totalCost.toLocaleString('tr-TR')} ₺</td>
                    <td className="py-2.5 px-4 text-right font-bold text-sky-700">{k.avgCostPerVehicle.toLocaleString('tr-TR')} ₺</td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-700">
                      {k.costPerKm ? `${k.costPerKm.toFixed(2)} ₺` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Age Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Model Yaşı Grupları Detay Tablosu
            </h4>
            <Calendar className="h-4 w-4 text-amber-600" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Yaş Grubu</th>
                  <th className="py-2.5 px-4 text-right">Araç Sayısı</th>
                  <th className="py-2.5 px-4 text-right">Toplam Harcama</th>
                  <th className="py-2.5 px-4 text-right">Araç Başı Ort.</th>
                  <th className="py-2.5 px-4 text-right">KM Başı (₺/KM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {ageStats.map(a => (
                  <tr key={a.segment} className="hover:bg-amber-50/20 font-medium">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{a.segment}</td>
                    <td className="py-2.5 px-4 text-right">{a.vehicleCount}</td>
                    <td className="py-2.5 px-4 text-right font-semibold">{a.totalCost.toLocaleString('tr-TR')} ₺</td>
                    <td className="py-2.5 px-4 text-right font-bold text-amber-700">{a.avgCostPerVehicle.toLocaleString('tr-TR')} ₺</td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-700">
                      {a.costPerKm ? `${a.costPerKm.toFixed(2)} ₺` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
