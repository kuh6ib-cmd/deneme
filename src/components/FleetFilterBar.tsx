import React, { useState } from 'react';
import { 
  Building, 
  Car, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { FleetGroupStat } from '../types';

interface FleetFilterBarProps {
  fleetStats: FleetGroupStat[];
  selectedFleet: string;
  onSelectFleet: (fleetName: string) => void;
  onInspectFleet: (fleetStat: FleetGroupStat) => void;
}

export const FleetFilterBar: React.FC<FleetFilterBarProps> = ({
  fleetStats,
  selectedFleet,
  onSelectFleet,
  onInspectFleet,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (!fleetStats || fleetStats.length === 0) return null;

  const totalVehicles = fleetStats.reduce((acc, f) => acc + f.vehicleCount, 0);
  const currentFleet = fleetStats.find(f => f.name === selectedFleet);

  return (
    <div className="bg-slate-50/70 border-b border-slate-200/80 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-slate-800">Filo Segmenti:</span>
            <span className="text-xs text-slate-600 font-medium">
              {selectedFleet === 'ALL' ? `Tüm Filolar (${totalVehicles} Araç)` : `${selectedFleet} (${currentFleet?.vehicleCount || 0} Araç)`}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {selectedFleet !== 'ALL' && (
              <button
                onClick={() => onSelectFleet('ALL')}
                className="px-2 py-0.5 rounded text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Tümünü Seç
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>{isExpanded ? 'Filo Kartlarını Gizle' : `Filo Kartlarını Aç (${fleetStats.length})`}</span>
              {isExpanded ? <ChevronUp className="h-3 w-3 text-slate-500" /> : <ChevronDown className="h-3 w-3 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Fleet Badges / Cards Horizontal Scroll (On Demand) */}
        {isExpanded && (
          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-stretch space-x-2.5 overflow-x-auto pb-1 scrollbar-none">
            {fleetStats.map(fleet => {
              const isSelected = selectedFleet === fleet.name;

              return (
                <div
                  key={fleet.name}
                  className={`group min-w-[220px] p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-slate-900 ring-1 ring-slate-900 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                  }`}
                  onClick={() => {
                    onSelectFleet(fleet.name);
                    onInspectFleet(fleet);
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900 truncate max-w-[140px]" title={fleet.name}>
                        {fleet.name}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                        {fleet.vehicleCount} Araç
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xs font-bold text-slate-900">
                        {fleet.totalCost.toLocaleString('tr-TR')} ₺
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        Pay: %{fleet.costSharePct}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pt-1 border-t border-slate-100">
                      <span>Araç Bş: <strong className="text-slate-700 font-semibold">{fleet.costPerVehicle.toLocaleString('tr-TR')} ₺</strong></span>
                      <span className="text-slate-600 font-medium">Bosch: %{fleet.boschSharePct}</span>
                    </div>
                  </div>

                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium text-slate-600 group-hover:text-slate-900">
                    <span className="flex items-center space-x-1">
                      <Sparkles className="h-3 w-3 text-indigo-600" />
                      <span>Filo Analiz Kartı</span>
                    </span>
                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
