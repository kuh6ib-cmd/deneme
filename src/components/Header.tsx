import React, { useRef, useState, useEffect } from 'react';
import { 
  Car, 
  FileSpreadsheet, 
  Upload, 
  Sparkles, 
  Settings2, 
  ShieldCheck, 
  RotateCcw,
  AlertTriangle,
  PackageCheck,
  Building,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import { DataQualityMetrics, FleetGroupStat } from '../types';

interface HeaderProps {
  dataQuality: DataQualityMetrics;
  onFileUpload: (file: File) => void;
  onLoadSample: () => void;
  onOpenColumnMapper: () => void;
  onOpenAiInsights: () => void;
  onOpenPartsCatalog?: () => void;
  catalogItemCount?: number;
  onExportExcel: () => void;
  activeDatasetName: string;
  totalVehicles: number;
  totalRecords: number;
  totalCost: number;
  fleetStats?: FleetGroupStat[];
  selectedFleet?: string;
  onSelectFleet?: (fleetName: string) => void;
  onInspectFleet?: (fleet: FleetGroupStat) => void;
}

export const Header: React.FC<HeaderProps> = ({
  dataQuality,
  onFileUpload,
  onLoadSample,
  onOpenColumnMapper,
  onOpenAiInsights,
  onOpenPartsCatalog,
  catalogItemCount = 0,
  onExportExcel,
  activeDatasetName,
  totalVehicles,
  totalRecords,
  totalCost,
  fleetStats = [],
  selectedFleet = 'ALL',
  onSelectFleet,
  onInspectFleet,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentFleetStat = fleetStats.find(f => f.name === selectedFleet);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = '';
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
          {/* Logo & Main Title */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-slate-100 shadow-xs shrink-0">
              <Car className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Filo & Parça Karar Destek Platformu
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5 flex items-center space-x-1.5">
                <span className="truncate max-w-[180px] sm:max-w-xs text-slate-700 font-medium">{activeDatasetName}</span>
                <span>•</span>
                <span><strong>{totalVehicles}</strong> Araç</span>
                <span>•</span>
                <span><strong>{totalRecords}</strong> Kayıt</span>
                <span>•</span>
                <span className="text-slate-900 font-semibold">{totalCost.toLocaleString('tr-TR')} ₺</span>
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />

            {/* Fleet Filter Quick Dropdown & Analysis Trigger */}
            {fleetStats.length > 0 && onSelectFleet && (
              <div className="inline-flex items-center bg-slate-50 p-0.5 rounded-lg border border-slate-200/80 text-slate-700">
                <div className="flex items-center pl-2 pr-1 space-x-1">
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    id="header-fleet-selector"
                    value={selectedFleet}
                    onChange={(e) => {
                      const fleet = e.target.value;
                      onSelectFleet(fleet);
                    }}
                    className="text-xs bg-transparent border-0 font-medium text-slate-800 focus:ring-0 focus:outline-hidden cursor-pointer py-1 pr-1.5"
                  >
                    <option value="ALL">Tüm Filolar ({fleetStats.length})</option>
                    {fleetStats.map(f => (
                      <option key={f.name} value={f.name}>
                        {f.name} ({f.vehicleCount} Araç)
                      </option>
                    ))}
                  </select>
                </div>

                {currentFleetStat && onInspectFleet && (
                  <button
                    onClick={() => onInspectFleet(currentFleetStat)}
                    id="btn-inspect-selected-fleet"
                    className="inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/80 rounded-md transition-colors"
                    title={`${currentFleetStat.name} için analiz ve karar önerilerini aç`}
                  >
                    <Sparkles className="h-3 w-3 text-indigo-600" />
                    <span>Filo Analizi</span>
                  </button>
                )}
              </div>
            )}

            {/* Upload Custom File */}
            <button
              onClick={() => fileInputRef.current?.click()}
              id="btn-upload-file"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
            >
              <Upload className="h-3.5 w-3.5 text-slate-600" />
              <span>Dosya Yükle</span>
            </button>

            {/* AI Advisor */}
            <button
              onClick={onOpenAiInsights}
              id="btn-ai-insights"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/60 rounded-lg transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>AI Brifingi</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={onExportExcel}
              id="btn-export-excel"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>Excel Raporu</span>
            </button>

            {/* More Tools Dropdown Menu (Secondary tools kept neatly accessible) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                id="btn-more-tools"
                className={`inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  isToolsOpen
                    ? 'bg-slate-100 text-slate-900 border-slate-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                title="Diğer araçlar ve ayarlar"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
                <span>Araçlar</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {isToolsOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                  <button
                    onClick={() => {
                      onLoadSample();
                      setIsToolsOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center space-x-2.5 text-slate-700"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-800">Örnek Veriyi Yükle</div>
                      <div className="text-[10px] text-slate-400">30+ araçlık hazır veri seti</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onOpenColumnMapper();
                      setIsToolsOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center space-x-2.5 text-slate-700 border-t border-slate-100"
                  >
                    <Settings2 className="h-3.5 w-3.5 text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-800">Sütun Eşleştirme</div>
                      <div className="text-[10px] text-slate-400">Excel başlıklarını düzenle</div>
                    </div>
                  </button>

                  {onOpenPartsCatalog && (
                    <button
                      onClick={() => {
                        onOpenPartsCatalog();
                        setIsToolsOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center space-x-2.5 text-slate-700 border-t border-slate-100"
                    >
                      <PackageCheck className="h-3.5 w-3.5 text-slate-400" />
                      <div>
                        <div className="font-medium text-slate-800 flex items-center space-x-1">
                          <span>Parça Kataloğu</span>
                          {catalogItemCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[9px] font-semibold">
                              {catalogItemCount}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">OEM parça listesi & fiyatları</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
