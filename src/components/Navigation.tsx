import React from 'react';
import { 
  LayoutDashboard, 
  Car,
  Tag, 
  Building2, 
  Wrench, 
  TrendingUp, 
  PieChart, 
  AlertOctagon, 
  Grid, 
  ShieldAlert, 
  TableProperties,
  PackageCheck
} from 'lucide-react';

export type TabId = 
  | 'summary'
  | 'vehicle_spend'
  | 'suppliers'
  | 'parts'
  | 'brands'
  | 'expenses'
  | 'km_age'
  | 'pareto'
  | 'risks'
  | 'crosstabs'
  | 'quality'
  | 'records';

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  anomalyCount: number;
  criticalRiskCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  anomalyCount,
  criticalRiskCount,
}) => {
  const tabs = [
    { id: 'summary' as TabId, label: 'Yönetici Özeti', icon: LayoutDashboard },
    { id: 'vehicle_spend' as TabId, label: 'Araç Harcamaları', icon: Car },
    { id: 'suppliers' as TabId, label: 'Tedarikçi & Servisler', icon: Building2 },
    { 
      id: 'parts' as TabId, 
      label: 'Parça & Katalog', 
      icon: PackageCheck,
    },
    { id: 'brands' as TabId, label: 'Marka & Motor Arıza', icon: Tag },
    { id: 'expenses' as TabId, label: 'Hizmet & Gider Türü', icon: Wrench },
    { id: 'km_age' as TabId, label: 'KM & Yaş Segmenti', icon: TrendingUp },
    { id: 'pareto' as TabId, label: 'Pareto (%80/20)', icon: PieChart },
    { 
      id: 'risks' as TabId, 
      label: 'Risk Matrisi', 
      icon: AlertOctagon,
      badge: criticalRiskCount > 0 ? criticalRiskCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 border border-rose-200/60',
    },
    { id: 'crosstabs' as TabId, label: 'Çapraz Matrisler', icon: Grid },
    { 
      id: 'quality' as TabId, 
      label: 'Veri Kalitesi', 
      icon: ShieldAlert,
      badge: anomalyCount > 0 ? anomalyCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border border-amber-200/60',
    },
    { id: 'records' as TabId, label: 'Veri Tablosu', icon: TableProperties },
  ];


  return (
    <nav className="bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-slate-200' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 text-[10px] font-semibold rounded-full ${
                      isActive ? 'bg-slate-700 text-white' : tab.badgeColor
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
