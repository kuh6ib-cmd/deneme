import React, { useState, useMemo } from 'react';
import { CrossTabMatrix } from '../../types';
import { Grid, Building2, Tag } from 'lucide-react';

interface CrossTabsViewProps {
  brandExpenseMatrix: CrossTabMatrix;
  supplierBrandMatrix: CrossTabMatrix;
}

export const CrossTabsView: React.FC<CrossTabsViewProps> = ({
  brandExpenseMatrix,
  supplierBrandMatrix,
}) => {
  const [activeMatrix, setActiveMatrix] = useState<'brand-expense' | 'supplier-brand'>('brand-expense');

  const matrix = useMemo(() => {
    return activeMatrix === 'brand-expense' ? brandExpenseMatrix : supplierBrandMatrix;
  }, [activeMatrix, brandExpenseMatrix, supplierBrandMatrix]);

  const cols = matrix?.cols || [];
  const rows = matrix?.rows || [];

  // Find max value for heatmap color intensity (memoized)
  const maxValue = useMemo(() => {
    let max = 0;
    if (!matrix?.data) return 0;
    const rowValues = Object.values(matrix.data);
    for (let i = 0; i < rowValues.length; i++) {
      const row = rowValues[i];
      if (row) {
        const vals = Object.values(row);
        for (let j = 0; j < vals.length; j++) {
          if (vals[j] > max) max = vals[j];
        }
      }
    }
    return max;
  }, [matrix]);

  const getCellBg = (val: number) => {
    if (val === 0) return 'bg-white text-slate-400';
    const ratio = val / (maxValue || 1);
    if (ratio > 0.6) return 'bg-blue-600 text-white font-bold';
    if (ratio > 0.3) return 'bg-blue-200 text-blue-900 font-bold';
    if (ratio > 0.1) return 'bg-blue-100 text-blue-800 font-medium';
    return 'bg-blue-50/70 text-slate-700 font-medium';
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Grid className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Çapraz Analiz Matrisleri (Cross-Tabulation & Heatmap)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            İki boyutlu maliyet kesişimleri sayesinde spesifik marka-arıza veya servis-marka yoğunlaşmalarını görün
          </p>
        </div>

        {/* Matrix Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl space-x-1">
          <button
            onClick={() => setActiveMatrix('brand-expense')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeMatrix === 'brand-expense' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="h-3.5 w-3.5" />
            <span>Marka × Gider Türü</span>
          </button>
          <button
            onClick={() => setActiveMatrix('supplier-brand')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeMatrix === 'supplier-brand' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Servis × Marka</span>
          </button>
        </div>
      </div>

      {/* Heatmap Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {matrix.title}
          </h3>
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <span>Yoğunluk:</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-slate-700 font-medium">Düşük</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-200 text-blue-900 font-bold">Orta</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">Yüksek</span>
          </div>
        </div>

        <div className="overflow-x-auto p-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4 sticky left-0 bg-slate-50 z-10 min-w-[140px]">
                  {activeMatrix === 'brand-expense' ? 'Marka' : 'Servis Noktası'}
                </th>
                {cols.map(col => (
                  <th key={col} className="py-3 px-3 text-right whitespace-nowrap min-w-[110px]">
                    {col}
                  </th>
                ))}
                <th className="py-3 px-4 text-right font-black text-slate-900 bg-slate-100 min-w-[120px]">
                  Satır Toplamı
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(row => {
                const rowSum = cols.reduce((sum, col) => sum + (matrix.data[row]?.[col] || 0), 0);

                return (
                  <tr key={row} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-bold text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-100">
                      {row}
                    </td>
                    {cols.map(col => {
                      const val = matrix.data[row]?.[col] || 0;
                      return (
                        <td key={col} className={`py-2.5 px-3 text-right text-xs transition-colors ${getCellBg(val)}`}>
                          {val > 0 ? `${val.toLocaleString('tr-TR')} ₺` : '-'}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-4 text-right font-black text-slate-900 bg-slate-50">
                      {rowSum.toLocaleString('tr-TR')} ₺
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900 text-xs">
                <td className="py-3 px-4 sticky left-0 bg-slate-100 z-10">
                  Sütun Toplamı
                </td>
                {cols.map(col => {
                  const colSum = rows.reduce((sum, row) => sum + (matrix.data[row]?.[col] || 0), 0);
                  return (
                    <td key={col} className="py-3 px-3 text-right font-bold text-slate-900">
                      {colSum.toLocaleString('tr-TR')} ₺
                    </td>
                  );
                })}
                <td className="py-3 px-4 text-right font-black text-blue-700 bg-slate-200">
                  {rows.reduce((total, row) => 
                    total + cols.reduce((sum, col) => sum + (matrix.data[row]?.[col] || 0), 0)
                  , 0).toLocaleString('tr-TR')} ₺
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
