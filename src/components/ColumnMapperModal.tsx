import React, { useState } from 'react';
import { ColumnMapping, RawFleetRecord } from '../types';
import { FIELD_LABELS } from '../services/columnDetector';
import { X, Check, ArrowRight, HelpCircle } from 'lucide-react';

interface ColumnMapperModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableHeaders: string[];
  currentMapping: ColumnMapping;
  sampleRows: RawFleetRecord[];
  onApplyMapping: (newMapping: ColumnMapping) => void;
}

export const ColumnMapperModal: React.FC<ColumnMapperModalProps> = ({
  isOpen,
  onClose,
  availableHeaders,
  currentMapping,
  sampleRows,
  onApplyMapping,
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>(currentMapping);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof ColumnMapping, selectedHeader: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: selectedHeader,
    }));
  };

  const handleSave = () => {
    onApplyMapping(mapping);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Esnek Sütun Eşleştirici (Column Mapper)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Yüklenen dosyadaki başlıkları analiz motorunun standart alanlarıyla eşleştirin.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-blue-800">
            <div className="flex items-start space-x-2">
              <HelpCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Standart Filo Şablonu:</span> Talep Tarihi, Hizmet Adı, Tutar (KDV Hariç), Y.P, Firma, Servis İsmi, Plaka, Marka, Model, Model Yılı ve Kilometre alanları otomatik olarak eşleştirilir.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                // Find matching headers for standard template prioritizing exact header names
                const findHeader = (patterns: RegExp[]) => 
                  availableHeaders.find(h => !/id$/i.test(h.trim()) && patterns.some(p => p.test(h.trim()))) || 
                  availableHeaders.find(h => patterns.some(p => p.test(h.trim()))) || '';

                setMapping({
                  plate: findHeader([/^plaka$/i, /plaka/i]),
                  brand: findHeader([/^marka$/i, /marka/i]),
                  model: findHeader([/^model$/i, /model/i]),
                  modelYear: findHeader([/^model\s*y[ıi]l[ıi]?$/i, /model.*y[ıi]/i]),
                  km: findHeader([/^k[ıi]lometre$/i, /k[ıi]lometre/i, /^km$/i]),
                  supplier: findHeader([/^serv[ıi]s\s*[ıi]sm[ıi]$/i, /^serv[ıi]s\s*ad[ıi]?$/i, /serv[ıi]s\s*[ıi]sm[ıi]/i, /^serv[ıi]s$/i]),
                  expenseType: findHeader([/^h[ıi]zmet\s*ad[ıi]?$/i, /h[ıi]zmet/i]),
                  fleetGroup: findHeader([/^f[ıi]rma$/i, /^f[ıi]lo$/i, /f[ıi]rma/i, /f[ıi]lo/i]),
                  sparePartType: findHeader([/^y\.?\s*p\.?$/i, /yedek.*par[çc]a/i]),
                  totalPrice: findHeader([/^tutar\s*\(?kdv\s*har[ıi][çc]\)?$/i, /tutar/i]),
                  unitPrice: findHeader([/b[ıi]r[ıi]m.*f[ıi]yat/i]),
                  quantity: findHeader([/^qty$/i, /adet/i, /m[ıi]ktar/i]),
                  date: findHeader([/^talep\s*tar[ıi]h[ıi]?$/i, /fatura\s*tar[ıi]h/i, /tar[ıi]h/i]),
                  description: findHeader([/^h[ıi]zmet\s*ad[ıi]?$/i, /ac[ıi]klama/i]),
                });
              }}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-[11px] hover:bg-blue-700 transition-colors shrink-0 shadow-xs"
            >
              Standart Şablonu Otomatik Eşle
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(FIELD_LABELS) as (keyof ColumnMapping)[]).map(field => {
              const info = FIELD_LABELS[field];
              const selectedValue = mapping[field] || '';
              const sampleVal = sampleRows[0] && selectedValue ? String(sampleRows[0][selectedValue] || '') : '-';

              return (
                <div key={field} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                      <span>{info.label}</span>
                      {info.required && <span className="text-rose-500 font-bold">*</span>}
                    </label>
                    {selectedValue && (
                      <span className="text-[10px] text-emerald-600 font-medium flex items-center">
                        <Check className="h-3 w-3 mr-0.5" /> Eşleşti
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    {info.description}
                  </p>

                  <select
                    value={selectedValue}
                    onChange={e => handleFieldChange(field, e.target.value)}
                    className="w-full bg-white text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Sütun Seçilmedi --</option>
                    {availableHeaders.map(h => (
                      <option key={h} value={h}>
                        {h} {sampleRows[0]?.[h] !== undefined ? `(Örn: "${String(sampleRows[0][h]).slice(0, 20)}")` : ''}
                      </option>
                    ))}
                  </select>

                  {selectedValue && sampleVal !== '-' && (
                    <div className="mt-1.5 text-[10px] text-slate-500 truncate flex items-center space-x-1">
                      <ArrowRight className="h-2.5 w-2.5 text-slate-400" />
                      <span className="text-slate-400">1. Satır Değeri:</span>
                      <span className="font-semibold text-slate-700 truncate">{sampleVal}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            Eşleştirmeyi Uygula & Yeniden Analiz Et
          </button>
        </div>
      </div>
    </div>
  );
};
