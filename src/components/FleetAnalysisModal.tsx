import React from 'react';
import { 
  X, 
  Car, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  PackageCheck,
  Zap,
  Repeat,
  ShoppingBag,
  Info
} from 'lucide-react';
import { FleetGroupStat } from '../types';

interface FleetAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  fleetStat: FleetGroupStat | null;
  onFilterByFleet?: (fleetName: string) => void;
}

export const FleetAnalysisModal: React.FC<FleetAnalysisModalProps> = ({
  isOpen,
  onClose,
  fleetStat,
  onFilterByFleet,
}) => {
  if (!isOpen || !fleetStat) return null;

  const {
    name,
    totalCost,
    vehicleCount,
    costPerVehicle,
    costSharePct,
    operationCount,
    avgTicket,
    avgKm,
    avgAge,
    costPerKm,
    maintenanceSharePct,
    repairSharePct,
    boschPartsSpend,
    otherPartsSpend,
    fluidsSpend,
    laborSpend,
    boschSharePct,
    criticalVehiclesCount,
    topVehicles,
    topSuppliers,
    topUsedParts = [],
    topRenewVehicles = [],
    recommendations,
  } = fleetStat;

  // Calculate percentages for breakdown bar
  const totalCategorySpend = boschPartsSpend + otherPartsSpend + fluidsSpend + laborSpend || totalCost || 1;
  const boschPct = Math.round((boschPartsSpend / totalCategorySpend) * 100);
  const otherPct = Math.round((otherPartsSpend / totalCategorySpend) * 100);
  const fluidsPct = Math.round((fluidsSpend / totalCategorySpend) * 100);
  const laborPct = Math.max(0, 100 - (boschPct + otherPct + fluidsPct));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="h-12 w-12 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center shadow-inner shrink-0">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Filo Karar Destek & Öneri Paneli
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {vehicleCount} Araç • {operationCount} Servis Hareketi • Toplam <strong className="text-emerald-400">{totalCost.toLocaleString('tr-TR')} ₺</strong> Harcama (Filo Payı: %{costSharePct})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Key Metric Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Araç Başına Maliyet</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {costPerVehicle.toLocaleString('tr-TR')} ₺
              </div>
              <div className="text-[11px] text-slate-500 mt-1">İşlem Ort: {avgTicket.toLocaleString('tr-TR')} ₺</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">KM Başına Bakım</div>
              <div className="text-xl font-extrabold text-blue-700 mt-1">
                {costPerKm > 0 ? `${costPerKm.toFixed(2)} ₺` : '-'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Ort. KM: {avgKm.toLocaleString('tr-TR')}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Ortalama Filo Yaşı</div>
              <div className="text-xl font-extrabold text-indigo-700 mt-1">
                {avgAge} Yaş
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Periyodik Bakım: %{maintenanceSharePct}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Kritik Riskli Araçlar</div>
              <div className="text-xl font-extrabold text-rose-700 mt-1">
                {criticalVehiclesCount} Araç
              </div>
              <div className="text-[11px] text-rose-600 font-medium mt-1">
                {criticalVehiclesCount > 0 ? 'Öncelikli yenileme/takip' : 'Risk seviyesi normal'}
              </div>
            </div>
          </div>

          {/* 1. ÖNCELİKLİ AKSİYON: DEĞİŞTİRİLMESİ GEREKEN ARAÇLAR */}
          {topRenewVehicles.length > 0 && (
            <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-rose-600 text-white">
                    <Repeat className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-rose-950">
                      🚗 Bu Araçlarınızı Değiştirmenizi / Yenilemenizi Öneriyoruz
                    </h3>
                    <p className="text-xs text-rose-800">
                      Aşağıdaki araçlar filonun bakım bütçesini tüketiyor. Ağır masraf açmadan takas/yenileme planına almanız tavsiye edilir:
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-200/80 text-rose-900 border border-rose-300">
                  {topRenewVehicles.length} Araç Önerisi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {topRenewVehicles.map(v => (
                  <div key={v.plate} className="p-3 rounded-xl bg-white border border-rose-200/80 flex items-center justify-between shadow-2xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 text-xs">{v.plate}</span>
                        <span className="text-[11px] font-semibold text-slate-600">({v.brand} {v.model})</span>
                      </div>
                      <div className="text-[11px] text-rose-700 font-medium mt-0.5">
                        ⚠️ {v.reason}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {v.km.toLocaleString('tr-TR')} KM • {v.age} Yaşında
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="text-xs font-black text-rose-700">
                        {v.cost.toLocaleString('tr-TR')} ₺
                      </div>
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                        Değiştir
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. SIK KULLANILAN PARÇALAR & TÜKETİM ÖZETİ ("Aa bak siz şu şu parçaları çok kullanmışsınız") */}
          {topUsedParts.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-600 text-white">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-950">
                      📦 Bu Filoda En Çok Tükettiğiniz ve Harcama Yaptığınız Parçalar
                    </h3>
                    <p className="text-xs text-amber-800">
                      Filonuzda en yüksek adet ve maliyete ulaşan parçalar. Bunları tek tek almak yerine Bosch ile toplu indirim anlaşması yapabilirsiniz:
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                  En Çok Tüketilenler
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                {topUsedParts.map((p, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white border border-amber-200 flex items-center justify-between shadow-2xs">
                    <div className="truncate pr-2">
                      <div className="font-bold text-slate-900 text-xs truncate" title={p.name}>
                        {p.name}
                      </div>
                      <div className="text-[11px] text-amber-800 font-medium">
                        {p.count} adet / işlem yapılmış
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-extrabold text-slate-900">
                        {p.totalCost.toLocaleString('tr-TR')} ₺
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Toplam Harcama
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOSCH VS OTHER PARTS & COST BREAKDOWN */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <PackageCheck className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Filo Parça ve Masraf Menşei Dağılımı (Bosch vs. Diğer Y.P.)
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Bosch Payı: %{boschSharePct}
              </span>
            </div>

            {/* Visual Breakdown Bar */}
            <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden flex">
              <div style={{ width: `${boschPct}%` }} className="bg-emerald-500 h-full" title={`Bosch Parçalar: %${boschPct}`} />
              <div style={{ width: `${otherPct}%` }} className="bg-amber-500 h-full" title={`Diğer Y.P. (Bosch Olmayan): %${otherPct}`} />
              <div style={{ width: `${fluidsPct}%` }} className="bg-blue-500 h-full" title={`Sıvılar/Yağ: %${fluidsPct}`} />
              <div style={{ width: `${laborPct}%` }} className="bg-purple-600 h-full" title={`İşçilik: %${laborPct}`} />
            </div>

            {/* Detail items */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                <div className="flex items-center space-x-1.5 text-xs text-emerald-800 font-bold">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Bosch Parçalar</span>
                </div>
                <div className="text-base font-extrabold text-slate-900 mt-1">
                  {boschPartsSpend.toLocaleString('tr-TR')} ₺
                </div>
                <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Pay: %{boschPct}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-amber-200">
                <div className="flex items-center space-x-1.5 text-xs text-amber-800 font-bold">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Diğer Y.P. (Bosch Dışı)</span>
                </div>
                <div className="text-base font-extrabold text-slate-900 mt-1">
                  {otherPartsSpend.toLocaleString('tr-TR')} ₺
                </div>
                <div className="text-[11px] text-amber-700 font-medium mt-0.5">Tasarruf Potansiyeli</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-blue-200">
                <div className="flex items-center space-x-1.5 text-xs text-blue-800 font-bold">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Sıvılar & Motor Yağı</span>
                </div>
                <div className="text-base font-extrabold text-slate-900 mt-1">
                  {fluidsSpend.toLocaleString('tr-TR')} ₺
                </div>
                <div className="text-[11px] text-blue-700 font-medium mt-0.5">Kimyasallar / Yağ</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-purple-200">
                <div className="flex items-center space-x-1.5 text-xs text-purple-800 font-bold">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  <span>İşçilik & Servis</span>
                </div>
                <div className="text-base font-extrabold text-slate-900 mt-1">
                  {laborSpend.toLocaleString('tr-TR')} ₺
                </div>
                <div className="text-[11px] text-purple-700 font-medium mt-0.5">Montaj / Bakım</div>
              </div>
            </div>
          </div>

          {/* TOP VEHICLES & SUPPLIERS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Top Vehicles in this fleet */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Car className="h-4 w-4 text-blue-600" />
                  <span>Bu Filonun En Çok Harcayan Araçları</span>
                </h4>
                <span className="text-[11px] text-slate-500">Maliyet Sıralı</span>
              </div>

              <div className="space-y-2">
                {topVehicles.slice(0, 5).map(v => (
                  <div key={v.plate} className="p-2 rounded-xl bg-slate-50 flex items-center justify-between text-xs border border-slate-100">
                    <div>
                      <div className="font-bold text-slate-900">{v.plate}</div>
                      <div className="text-[10px] text-slate-500">{v.brand} {v.model} • {v.km.toLocaleString('tr-TR')} KM</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{v.cost.toLocaleString('tr-TR')} ₺</div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        v.riskLevel === 'Kritik Risk' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {v.riskLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Suppliers for this fleet */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Building2 className="h-4 w-4 text-indigo-600" />
                  <span>En Çok Çalışılan Servis Noktaları</span>
                </h4>
                <span className="text-[11px] text-slate-500">Harcama Payı</span>
              </div>

              <div className="space-y-2">
                {topSuppliers.slice(0, 5).map(s => (
                  <div key={s.name} className="p-2 rounded-xl bg-slate-50 flex items-center justify-between text-xs border border-slate-100">
                    <div className="truncate max-w-[220px]">
                      <div className="font-bold text-slate-900 truncate" title={s.name}>{s.name}</div>
                      <div className="text-[10px] text-slate-500">{s.count} Servis İşlemi</div>
                    </div>
                    <div className="font-bold text-slate-900 shrink-0">
                      {s.cost.toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-slate-500">
            {name} için otomatik üretilen karar destek raporu.
          </div>

          <div className="flex items-center space-x-2">
            {onFilterByFleet && (
              <button
                onClick={() => {
                  onFilterByFleet(name);
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Bu Filoyu Tabloda Filtrele
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

