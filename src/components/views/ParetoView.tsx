import React, { useState, useMemo } from 'react';
import { ParetoItem } from '../../types';
import { PieChart as PieIcon, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine, 
  Legend 
} from 'recharts';

interface ParetoViewProps {
  paretoBrands: ParetoItem[];
  paretoSuppliers: ParetoItem[];
  paretoExpenseTypes: ParetoItem[];
  paretoFleets: ParetoItem[];
}

export const ParetoView: React.FC<ParetoViewProps> = ({
  paretoBrands,
  paretoSuppliers,
  paretoExpenseTypes,
  paretoFleets,
}) => {
  const [activeCategory, setActiveCategory] = useState<'brands' | 'suppliers' | 'expenses' | 'fleets'>('brands');

  const currentItems = useMemo(() => {
    return activeCategory === 'brands' ? paretoBrands :
      activeCategory === 'suppliers' ? paretoSuppliers :
      activeCategory === 'expenses' ? paretoExpenseTypes :
      paretoFleets;
  }, [activeCategory, paretoBrands, paretoSuppliers, paretoExpenseTypes, paretoFleets]);

  const keyDrivers = useMemo(() => {
    return currentItems.filter(i => i.isKeyDriver);
  }, [currentItems]);

  const chartData = useMemo(() => {
    return currentItems.map(item => ({
      name: item.name.length > 18 ? `${item.name.slice(0, 16)}...` : item.name,
      fullName: item.name,
      cost: item.cost,
      cumulativePct: item.cumulativePct,
      isKeyDriver: item.isKeyDriver,
    }));
  }, [currentItems]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PieIcon className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Pareto Analizi (%80 / 20 İlkesi)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Toplam bakım bütçesinin %80'ine neden olan kritik %20'lik markaları, servisleri ve harcama kalemlerini tespit edin
          </p>
        </div>

        {/* Category Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl space-x-1">
          <button
            onClick={() => setActiveCategory('brands')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'brands' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Markalar
          </button>
          <button
            onClick={() => setActiveCategory('suppliers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'suppliers' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Servis / Tedarikçi
          </button>
          <button
            onClick={() => setActiveCategory('expenses')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'expenses' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hizmet Türleri
          </button>
          <button
            onClick={() => setActiveCategory('fleets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'fleets' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Filo Grupları
          </button>
        </div>
      </div>

      {/* Insight Highlight Box */}
      <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-indigo-900">
        <div className="flex items-center space-x-2.5">
          <Sparkles className="h-5 w-5 text-indigo-600 shrink-0" />
          <div>
            <span className="font-bold">Pareto İçgörüsü: </span>
            Toplam harcamanın %80'lik kısmını yalnızca <span className="font-extrabold text-indigo-700">{keyDrivers.length} adet</span> ana unsur oluşturmaktadır:
            <span className="font-semibold ml-1">
              ({keyDrivers.map(d => d.name).join(', ')})
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 font-bold text-indigo-700 shrink-0">
          Öncelikli Odak Alanı
        </span>
      </div>

      {/* Pareto Composed Chart (Bar + Cumulative % Line) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Pareto Çift Eksenli Harcama & Kümülatif Yüzde Eğrisi
          </h3>
          <span className="text-xs font-bold text-rose-600">
            Kırmızı Çizgi = %80 Kritik Sınır
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Sol Eksen: Harcama Tutarı (₺) • Sağ Eksen: Kümülatif Bütçe Payı (%)
        </p>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k ₺`} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `%${v}`} />
              <Tooltip 
                formatter={(value: any, name: string) => {
                  if (name.includes('Kümülatif')) return [`%${value}`, name];
                  return [`${Number(value).toLocaleString('tr-TR')} ₺`, name];
                }}
                labelFormatter={label => chartData.find(d => d.name === label)?.fullName || label}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <ReferenceLine yAxisId="right" y={80} stroke="#e11d48" strokeDasharray="4 4" strokeWidth={2} label={{ value: '%80 Eşiği', fill: '#e11d48', fontSize: 10, position: 'right' }} />
              <Bar yAxisId="left" name="Harcama Tutarı (₺)" dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" name="Kümülatif Pay (%)" type="monotone" dataKey="cumulativePct" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pareto Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Pareto Sıralama Tablosu
          </h3>
          <span className="text-xs text-slate-500">
            Harcama büyüklüğüne göre azalan sırada listelenmiştir.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4 w-12 text-center">Sıra</th>
                <th className="py-3 px-4">Unsur / Kategori Adı</th>
                <th className="py-3 px-4 text-right">Harcama Tutarı</th>
                <th className="py-3 px-4 text-right">Bütçe Payı (%)</th>
                <th className="py-3 px-4 text-right">Kümülatif Tutar</th>
                <th className="py-3 px-4 text-right">Kümülatif (%)</th>
                <th className="py-3 px-4 text-center">Kritik %80 Sürücüsü mü?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentItems.map(item => (
                <tr key={item.name} className={`hover:bg-slate-50 font-medium ${item.isKeyDriver ? 'bg-indigo-50/20' : ''}`}>
                  <td className="py-3 px-4 text-center font-bold text-slate-400">
                    #{item.rank}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {item.cost.toLocaleString('tr-TR')} ₺
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[11px]">
                      %{item.costSharePct}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-600">
                    {item.cumulativeCost.toLocaleString('tr-TR')} ₺
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-indigo-700">
                    %{item.cumulativePct}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.isKeyDriver ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        <CheckCircle2 className="h-3 w-3 mr-1 text-indigo-600" />
                        EVET (%80 Kapsamında)
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">
                        Hayır (İkincil)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
