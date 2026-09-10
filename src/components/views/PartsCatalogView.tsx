import React, { useState, useMemo, useEffect } from 'react';
import { 
  Layers, 
  Download, 
  CheckCircle2, 
  DollarSign, 
  Search, 
  Settings2,
  Sparkles,
  PackageCheck,
  Tag,
  Boxes,
  ShieldCheck,
  AlertTriangle,
  Droplet,
  Wrench,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Car,
  X,
  ExternalLink,
  ArrowUpDown,
  Filter,
  Info,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { 
  PartsAnalyticsSummary, 
  PartCatalogItem,
  SparePartOriginType,
  PartMatchResult
} from '../../types';
import { downloadCatalogTemplate } from '../../services/partsCatalogService';

interface PartsCatalogViewProps {
  partsAnalytics: PartsAnalyticsSummary;
  catalog: PartCatalogItem[];
  catalogSource: 'default' | 'custom';
  onOpenCatalogModal: () => void;
}

interface DynamicTopPart {
  key: string;
  code: string;
  name: string;
  category: string;
  categoryLevel1: string;
  categoryLevel2: string;
  categoryLevel3: string;
  origin: SparePartOriginType | 'DIGER_YP';
  isMatched: boolean;
  count: number;
  totalCost: number;
  avgCost: number;
  sharePct: number;
  distinctVehiclesCount: number;
  plates: string[];
  records: PartMatchResult[];
  topBrands: { brand: string; count: number }[];
}

export const PartsCatalogView: React.FC<PartsCatalogViewProps> = ({
  partsAnalytics,
  catalog,
  catalogSource,
  onOpenCatalogModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'matched' | 'unmatched'>('all');
  const [originFilter, setOriginFilter] = useState<'all' | SparePartOriginType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [partSortMode, setPartSortMode] = useState<'count' | 'cost'>('count');
  const [topPartsSearch, setTopPartsSearch] = useState('');
  const [showAllTopParts, setShowAllTopParts] = useState(false);
  const [selectedPartDetail, setSelectedPartDetail] = useState<DynamicTopPart | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const {
    totalSpend,
    matchedRecordsCount,
    unmatchedRecordsCount,
    matchRatePct,
    distinctMatchedPartsCount,
    boschSpend,
    otherPartsSpend,
    fluidsSpend,
    laborSpend,
    boschSpendPct,
    otherPartsSpendPct,
    fluidsSpendPct,
    laborSpendPct,
    matches,
  } = partsAnalytics;

  // Reset pagination on filter or search change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, originFilter, categoryFilter]);

  // Active records based on origin filter
  const activeOriginMatches = useMemo(() => {
    if (originFilter === 'all') return matches;
    return matches.filter(m => m.sparePartOrigin === originFilter);
  }, [matches, originFilter]);

  const totalActiveOriginSpend = useMemo(() => {
    return activeOriginMatches.reduce((sum, m) => sum + (m.totalPrice || 0), 0);
  }, [activeOriginMatches]);

  // DYNAMIC TOP USED PARTS CALCULATION (Responds dynamically when user clicks on Diğer Y.P. / Bosch / Sıvılar / İşçilik / Tümü)
  const dynamicTopParts = useMemo(() => {
    const map = new Map<string, {
      key: string;
      code: string;
      name: string;
      category: string;
      categoryLevel1: string;
      categoryLevel2: string;
      categoryLevel3: string;
      origin: SparePartOriginType | 'DIGER_YP';
      isMatched: boolean;
      count: number;
      totalCost: number;
      platesSet: Set<string>;
      records: PartMatchResult[];
      brandMap: Map<string, number>;
    }>();

    activeOriginMatches.forEach(m => {
      let key = '';
      let displayName = '';
      let code = m.matchedPartCode || '';

      if (m.isMatched && m.matchedPartName) {
        key = m.matchedPartCode || m.matchedPartName;
        displayName = m.matchedPartName;
        code = m.matchedPartCode || 'PARÇA';
      } else {
        const cleanName = (m.cleanPartName || m.matchedPartName || m.rawDescription || m.sparePartType || 'Özel Parça / İşlem').trim();
        key = `CLEAN-${cleanName.toLowerCase()}`;
        displayName = cleanName;
        code = 'ÖZEL';
      }

      const l1 = m.matchedCategoryLevel1 || (
        m.sparePartOrigin === 'BOSCH' ? 'Bosch Parçalar' :
        m.sparePartOrigin === 'DIGER_YP' ? 'Yedek Parça (Muadil)' :
        m.sparePartOrigin === 'SIVILAR_KIMYASAL' ? 'Sıvı & Motor Yağı' :
        m.sparePartOrigin === 'ISCILIK' ? 'İşçilik & Servis' : 'Diğer Masraflar'
      );
      const l2 = m.matchedCategoryLevel2 || 'Genel Parça Grubu';
      const l3 = m.matchedCategoryLevel3 || displayName;
      const cat = m.matchedCategory || `${l1} > ${l2} > ${l3}`;

      const existing = map.get(key) || {
        key,
        code,
        name: displayName,
        category: cat,
        categoryLevel1: l1,
        categoryLevel2: l2,
        categoryLevel3: l3,
        origin: m.sparePartOrigin || 'DIGER_YP',
        isMatched: m.isMatched,
        count: 0,
        totalCost: 0,
        platesSet: new Set<string>(),
        records: [],
        brandMap: new Map<string, number>(),
      };

      existing.count += 1;
      existing.totalCost += m.totalPrice || 0;
      if (m.plate) existing.platesSet.add(m.plate);
      existing.records.push(m);
      if (m.brand) {
        existing.brandMap.set(m.brand, (existing.brandMap.get(m.brand) || 0) + 1);
      }
      map.set(key, existing);
    });

    const list: DynamicTopPart[] = Array.from(map.values()).map(item => {
      const avgCost = Math.round(item.totalCost / Math.max(1, item.count));
      const sharePct = totalActiveOriginSpend > 0 ? Number(((item.totalCost / totalActiveOriginSpend) * 100).toFixed(1)) : 0;
      const topBrands = Array.from(item.brandMap.entries())
        .map(([brand, count]) => ({ brand, count }))
        .sort((a, b) => b.count - a.count);

      return {
        key: item.key,
        code: item.code,
        name: item.name,
        category: item.category,
        categoryLevel1: item.categoryLevel1,
        categoryLevel2: item.categoryLevel2,
        categoryLevel3: item.categoryLevel3,
        origin: item.origin,
        isMatched: item.isMatched,
        count: item.count,
        totalCost: Math.round(item.totalCost),
        avgCost,
        sharePct,
        distinctVehiclesCount: item.platesSet.size,
        plates: Array.from(item.platesSet),
        records: item.records,
        topBrands,
      };
    });

    // Sort by count (usage frequency) or by totalCost
    return list.sort((a, b) => {
      if (partSortMode === 'count') {
        if (b.count !== a.count) return b.count - a.count;
        return b.totalCost - a.totalCost;
      } else {
        if (b.totalCost !== a.totalCost) return b.totalCost - a.totalCost;
        return b.count - a.count;
      }
    });
  }, [activeOriginMatches, totalActiveOriginSpend, partSortMode]);

  // Filtered Top Parts list by topPartsSearch
  const filteredTopParts = useMemo(() => {
    const q = topPartsSearch.trim().toLowerCase();
    if (!q) return dynamicTopParts;
    return dynamicTopParts.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [dynamicTopParts, topPartsSearch]);

  // Dynamic Category Breakdown for active origin
  const dynamicCategoryBreakdown = useMemo(() => {
    const catMap = new Map<string, {
      count: number;
      totalCost: number;
      level1: string;
      level2: string;
      level3: string;
      partName: string;
    }>();

    activeOriginMatches.forEach(m => {
      const partName = m.matchedPartName || m.matchedCategoryLevel3 || m.rawDescription || 'Genel Parça / İşlem';
      const l1 = m.matchedCategoryLevel1 || (
        m.sparePartOrigin === 'BOSCH' ? 'Bosch Parçalar' :
        m.sparePartOrigin === 'DIGER_YP' ? 'Yedek Parça (Muadil)' :
        m.sparePartOrigin === 'SIVILAR_KIMYASAL' ? 'Sıvı & Motor Yağı' :
        m.sparePartOrigin === 'ISCILIK' ? 'İşçilik & Servis' : 'Diğer Masraflar'
      );
      const l2 = m.matchedCategoryLevel2 || 'Genel Hizmet';
      const l3 = partName;
      const cat = `${l1} > ${l2} > ${partName}`;

      const existing = catMap.get(cat) || {
        count: 0,
        totalCost: 0,
        level1: l1,
        level2: l2,
        level3: l3,
        partName,
      };
      existing.count += 1;
      existing.totalCost += m.totalPrice;
      catMap.set(cat, existing);
    });

    return Array.from(catMap.entries())
      .map(([category, stats]) => ({
        category,
        level1: stats.level1,
        level2: stats.level2,
        level3: stats.partName || stats.level3,
        name: stats.partName || stats.level3,
        partName: stats.partName || stats.level3,
        count: stats.count,
        totalCost: Math.round(stats.totalCost),
        sharePct: totalActiveOriginSpend > 0 ? Number(((stats.totalCost / totalActiveOriginSpend) * 100).toFixed(1)) : 0,
        avgCost: Math.round(stats.totalCost / Math.max(1, stats.count)),
      }))
      .sort((a, b) => b.totalCost - a.totalCost);
  }, [activeOriginMatches, totalActiveOriginSpend]);

  // Filtered table rows
  const filteredMatches = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return matches.filter(m => {
      // Origin filter (Bosch vs Diger YP vs Sivilar vs Iscilik)
      if (originFilter !== 'all') {
        if (m.sparePartOrigin !== originFilter) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && m.matchedCategory !== categoryFilter && m.matchedCategoryLevel1 !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'matched' && !m.isMatched) return false;
      if (statusFilter === 'unmatched' && m.isMatched) return false;

      // Search query filter
      if (search) {
        const matchSearch =
          (m.plate && m.plate.toLowerCase().includes(search)) ||
          (m.brand && m.brand.toLowerCase().includes(search)) ||
          (m.supplier && m.supplier.toLowerCase().includes(search)) ||
          (m.rawDescription && m.rawDescription.toLowerCase().includes(search)) ||
          (m.sparePartType && m.sparePartType.toLowerCase().includes(search)) ||
          (m.matchedPartName && m.matchedPartName.toLowerCase().includes(search)) ||
          (m.matchedPartCode && m.matchedPartCode.toLowerCase().includes(search));

        if (!matchSearch) return false;
      }

      return true;
    });
  }, [matches, searchTerm, statusFilter, originFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredMatches.length / pageSize) || 1;
  const pagedMatches = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMatches.slice(start, start + pageSize);
  }, [filteredMatches, page, pageSize]);

  // Categories list for dropdown
  const allCategories = useMemo(() => {
    const catSet = new Set<string>();
    for (let i = 0; i < matches.length; i++) {
      if (matches[i].matchedCategory) catSet.add(matches[i].matchedCategory);
    }
    return Array.from(catSet).sort();
  }, [matches]);

  const originNameLabel = useMemo(() => {
    if (originFilter === 'BOSCH') return 'Bosch Parçalar';
    if (originFilter === 'DIGER_YP') return 'Diğer Yedek Parçalar (Muadil / Bosch Dışı)';
    if (originFilter === 'SIVILAR_KIMYASAL') return 'Sıvılar & Motor Yağı';
    if (originFilter === 'ISCILIK') return 'İşçilik & Servis';
    return 'Tüm Masraf ve Parça Türleri';
  }, [originFilter]);

  const handleFilterByPart = (partNameOrCode: string) => {
    setSearchTerm(partNameOrCode);
    const tableEl = document.getElementById('parts-transactions-table');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Active Catalog Status */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
            <PackageCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900">Parça & Yedek Parça (Y.P.) Analiz Merkezi</h2>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                catalogSource === 'custom'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {catalogSource === 'custom' ? 'Özel Şirket Parça Kataloğu' : 'Standart Parça Kataloğu'} ({catalog.length} Parça)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Fatura kayıtlarındaki "Y.P" menşei verisiyle <strong>Bosch Orijinal / Eşdeğer Parçalar</strong>, <strong>Diğer Y.P. (Muadil / Yan Sanayi)</strong>, <strong>Motor Yağı & Sıvılar</strong> ve <strong>İşçilik</strong> kalemleri ayrıştırılarak maliyet ve en çok kullanılan parçalar analiz edilir.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={downloadCatalogTemplate}
            id="btn-view-download-template"
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Kendi parça kataloğunuzu hazırlamak için örnek Excel şablonunu indirin"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Şablon İndir (.xlsx)</span>
          </button>

          <button
            onClick={onOpenCatalogModal}
            id="btn-open-catalog-manager"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span>Kataloğu Yönet / Özel Yükle</span>
          </button>
        </div>
      </div>

      {/* Y.P. ORIGIN CARDS ROW (Bosch vs. Diğer Y.P. vs. Sıvılar/Yağ vs. İşçilik) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Menşei & Tür Filtresi:</span>
            <span className="text-xs text-slate-500">Tıklayarak o grupta en çok kullanılan parçaları anında görüntüleyin</span>
          </div>
          {originFilter !== 'all' && (
            <button
              onClick={() => setOriginFilter('all')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
            >
              <span>Filtreyi Temizle (Tümünü Göster)</span>
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Bosch Parçalar */}
          <div 
            onClick={() => setOriginFilter(originFilter === 'BOSCH' ? 'all' : 'BOSCH')}
            className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
              originFilter === 'BOSCH' 
                ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500 shadow-md scale-[1.01]' 
                : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
            }`}
          >
            {originFilter === 'BOSCH' && (
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center space-x-1 shadow-2xs">
                <CheckCircle2 className="h-3 w-3" />
                <span>Aktif Seçim</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Bosch Parçalar</span>
              <ShieldCheck className={`h-4 w-4 ${originFilter === 'BOSCH' ? 'text-emerald-700' : 'text-emerald-600'}`} />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900">{boschSpend.toLocaleString('tr-TR')} ₺</span>
              <span className="text-xs font-bold text-emerald-700">%{boschSpendPct}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, boschSpendPct)}%` }} 
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span>Orijinal / OEM Bosch</span>
              <span className="text-emerald-700 font-semibold underline">Parçaları Gör ›</span>
            </div>
          </div>

          {/* 2. Diğer Y.P. (Bosch Olmayan / Muadil) */}
          <div 
            onClick={() => setOriginFilter(originFilter === 'DIGER_YP' ? 'all' : 'DIGER_YP')}
            className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
              originFilter === 'DIGER_YP' 
                ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500 shadow-md scale-[1.01]' 
                : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-sm'
            }`}
          >
            {originFilter === 'DIGER_YP' && (
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center space-x-1 shadow-2xs">
                <CheckCircle2 className="h-3 w-3" />
                <span>Aktif Seçim</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Diğer Y.P. (Yedek Parça)</span>
              <AlertTriangle className={`h-4 w-4 ${originFilter === 'DIGER_YP' ? 'text-amber-700' : 'text-amber-500'}`} />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900">{otherPartsSpend.toLocaleString('tr-TR')} ₺</span>
              <span className="text-xs font-bold text-amber-700">%{otherPartsSpendPct}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div 
                className="bg-amber-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, otherPartsSpendPct)}%` }} 
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span>Muadil / Yan Sanayi</span>
              <span className="text-amber-700 font-semibold underline">Parçaları Gör ›</span>
            </div>
          </div>

          {/* 3. Motor Yağı & Sıvılar & Kimyasallar */}
          <div 
            onClick={() => setOriginFilter(originFilter === 'SIVILAR_KIMYASAL' ? 'all' : 'SIVILAR_KIMYASAL')}
            className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
              originFilter === 'SIVILAR_KIMYASAL' 
                ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500 shadow-md scale-[1.01]' 
                : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            {originFilter === 'SIVILAR_KIMYASAL' && (
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center space-x-1 shadow-2xs">
                <CheckCircle2 className="h-3 w-3" />
                <span>Aktif Seçim</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Sıvılar & Kimyasallar</span>
              <Droplet className={`h-4 w-4 ${originFilter === 'SIVILAR_KIMYASAL' ? 'text-blue-700' : 'text-blue-500'}`} />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900">{fluidsSpend.toLocaleString('tr-TR')} ₺</span>
              <span className="text-xs font-bold text-blue-700">%{fluidsSpendPct}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div 
                className="bg-blue-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, fluidsSpendPct)}%` }} 
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span>Motor yağı, antifriz, AdBlue</span>
              <span className="text-blue-700 font-semibold underline">Sıvıları Gör ›</span>
            </div>
          </div>

          {/* 4. İşçilik & Servis Hizmeti */}
          <div 
            onClick={() => setOriginFilter(originFilter === 'ISCILIK' ? 'all' : 'ISCILIK')}
            className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
              originFilter === 'ISCILIK' 
                ? 'bg-purple-50/90 border-purple-500 ring-2 ring-purple-500 shadow-md scale-[1.01]' 
                : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-sm'
            }`}
          >
            {originFilter === 'ISCILIK' && (
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center space-x-1 shadow-2xs">
                <CheckCircle2 className="h-3 w-3" />
                <span>Aktif Seçim</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">İşçilik & Servis</span>
              <Wrench className={`h-4 w-4 ${originFilter === 'ISCILIK' ? 'text-purple-700' : 'text-purple-600'}`} />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900">{laborSpend.toLocaleString('tr-TR')} ₺</span>
              <span className="text-xs font-bold text-purple-700">%{laborSpendPct}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div 
                className="bg-purple-600 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, laborSpendPct)}%` }} 
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span>Montaj, bakım & arıza tespiti</span>
              <span className="text-purple-700 font-semibold underline">İşçilikleri Gör ›</span>
            </div>
          </div>

        </div>
      </div>

      {/* Active Filter Notification Bar */}
      {originFilter !== 'all' && (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          originFilter === 'DIGER_YP' 
            ? 'bg-amber-50/90 border-amber-200 text-amber-900' 
            : originFilter === 'BOSCH'
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
            : originFilter === 'SIVILAR_KIMYASAL'
            ? 'bg-blue-50/90 border-blue-200 text-blue-900'
            : 'bg-purple-50/90 border-purple-200 text-purple-900'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-white/80 shrink-0 shadow-2xs">
              {originFilter === 'DIGER_YP' ? (
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              ) : originFilter === 'BOSCH' ? (
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              ) : originFilter === 'SIVILAR_KIMYASAL' ? (
                <Droplet className="h-4 w-4 text-blue-600" />
              ) : (
                <Wrench className="h-4 w-4 text-purple-600" />
              )}
            </div>
            <div className="text-xs leading-relaxed">
              <span className="font-bold">{originNameLabel} Seçildi:</span> Bu grupta toplam{' '}
              <strong className="font-bold underline">{activeOriginMatches.length} adet işlem</strong> ve{' '}
              <strong className="font-bold underline">{dynamicTopParts.length} farklı parça/kalem</strong> bulunmaktadır. En fazla kullanılan parçalar aşağıda sıralanmaktadır.
            </div>
          </div>

          <button
            onClick={() => setOriginFilter('all')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shrink-0 shadow-2xs"
          >
            Filtreyi Sıfırla
          </button>
        </div>
      )}

      {/* DYNAMIC TOP USED PARTS & CATEGORY BREAKDOWN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: DYNAMIC TOP USED PARTS PANEL (User Query: "yedek parça kısmına tıkladığımızda hangi parçaları en fazla kullanmışız onu ver") */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            
            {/* Top Panel Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {originFilter === 'all' 
                      ? 'En Fazla Kullanılan Parçalar ve Bakım Kalemleri' 
                      : `${originNameLabel} - En Fazla Kullanılan Parçalar`}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toplam {filteredTopParts.length} parça listeleniyor • Kullanım sıklığı ve harcama dökümü
                </p>
              </div>

              {/* Sorting & Search Controls */}
              <div className="flex items-center space-x-2 flex-wrap">
                
                {/* Sort Toggle */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setPartSortMode('count')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center space-x-1 ${
                      partSortMode === 'count'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="En çok değişen parçaları sıklığa göre sıralar"
                  >
                    <BarChart3 className="h-3 w-3" />
                    <span>En Çok Kullanılanlar (Adet)</span>
                  </button>
                  <button
                    onClick={() => setPartSortMode('cost')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center space-x-1 ${
                      partSortMode === 'cost'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="En yüksek harcama yapılan parçaları tutara göre sıralar"
                  >
                    <DollarSign className="h-3 w-3" />
                    <span>En Yüksek Tutar (₺)</span>
                  </button>
                </div>

                {/* Quick Search in Top Parts */}
                <div className="relative w-36 sm:w-44">
                  <Search className="h-3 w-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Parça adı ara..."
                    value={topPartsSearch}
                    onChange={e => setTopPartsSearch(e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

              </div>
            </div>

            {/* List of Dynamic Top Parts */}
            <div className="space-y-3 pt-4 max-h-[560px] overflow-y-auto pr-1">
              {(showAllTopParts ? filteredTopParts : filteredTopParts.slice(0, 10)).map((part, idx) => {
                const isTop3 = idx < 3;
                return (
                  <div 
                    key={part.key} 
                    className="p-3.5 rounded-xl bg-slate-50/80 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 transition-all shadow-2xs space-y-2.5"
                  >
                    {/* Top Row: Rank, Code, Name, Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2.5 min-w-0">
                        {/* Rank Badge */}
                        <div className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          idx === 0 
                            ? 'bg-amber-100 text-amber-800 border border-amber-300 font-extrabold' 
                            : idx === 1 
                            ? 'bg-slate-200 text-slate-700 border border-slate-300 font-bold'
                            : idx === 2
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 font-bold'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          #{idx + 1}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs truncate" title={part.name}>
                              {part.name}
                            </span>
                            {part.code && part.code !== 'ÖZEL' && (
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 font-semibold text-slate-700">
                                {part.code}
                              </span>
                            )}
                            {part.origin === 'BOSCH' ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Bosch
                              </span>
                            ) : part.origin === 'DIGER_YP' ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                Diğer Y.P.
                              </span>
                            ) : part.origin === 'SIVILAR_KIMYASAL' ? (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                Sıvı / Yağ
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                İşçilik
                              </span>
                            )}
                          </div>

                          {/* 3-Level Category Breadcrumb */}
                          <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-medium truncate mt-0.5">
                            <span>{part.categoryLevel1}</span>
                            <span className="text-slate-400">›</span>
                            <span>{part.categoryLevel2}</span>
                            <span className="text-slate-400">›</span>
                            <span className="text-blue-600 font-semibold">{part.categoryLevel3}</span>
                          </div>
                        </div>
                      </div>

                      {/* Usage Count Pill (Highlight) */}
                      <div className="flex flex-col items-end shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-2xs flex items-center space-x-1">
                          <PackageCheck className="h-3 w-3" />
                          <span>{part.count} Değişim</span>
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1">
                          {part.distinctVehiclesCount} Araçta Değişti
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Progress Bar for Share */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full ${partSortMode === 'count' ? 'bg-blue-600' : 'bg-emerald-600'}`}
                          style={{ width: `${Math.min(100, (part.count / Math.max(1, dynamicTopParts[0]?.count || 1)) * 100)}%` }} 
                        />
                      </div>
                    </div>

                    {/* Bottom Row: Cost Stats & Drilldown Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
                      <div className="flex items-center space-x-4 text-slate-600">
                        <div>
                          Toplam Harcama: <strong className="text-slate-900 font-bold">{part.totalCost.toLocaleString('tr-TR')} ₺</strong>
                          <span className="text-[10px] text-slate-500 ml-1">(%{part.sharePct})</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => setSelectedPartDetail(part)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors shadow-2xs"
                          title="Hangi araçlarda ve servislerde değiştiğini detaylı inceleyin"
                        >
                          <Car className="h-3 w-3 text-slate-500" />
                          <span>Araçları Gör ({part.distinctVehiclesCount})</span>
                        </button>

                        <button
                          onClick={() => handleFilterByPart(part.name)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold transition-colors"
                          title="Aşağıdaki işlem tablosunu bu parçaya göre filtreler"
                        >
                          <Filter className="h-3 w-3" />
                          <span>Tabloda Filtrele</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}

              {filteredTopParts.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  Filtreleme kriterlerine uygun parça bulunamadı.
                </div>
              )}
            </div>

            {/* Show All / Show Less Toggle Button */}
            {filteredTopParts.length > 10 && (
              <div className="pt-3 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowAllTopParts(!showAllTopParts)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <span>{showAllTopParts ? 'Daha Az Parça Göster (İlk 10)' : `Tüm Parçaları Göster (Toplam ${filteredTopParts.length} Parça)`}</span>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Right 1 Col: DYNAMIC CATEGORY BREAKDOWN TABLE */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Kategori Dağılımı</h3>
                  <p className="text-[11px] text-slate-500">Seçili türe göre harcama payı</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {dynamicCategoryBreakdown.length} Kategori
              </span>
            </div>

            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {dynamicCategoryBreakdown.map(cat => {
                const partDisplayName = cat.partName || cat.name || cat.level3 || cat.category;
                return (
                  <div 
                    key={cat.category} 
                    onClick={() => handleFilterByPart(partDisplayName)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 transition-colors border border-slate-100 hover:border-blue-200 cursor-pointer group"
                    title="Bu kategoriye ait kayıtları filtrelemek için tıklayın"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="truncate max-w-[65%]">
                        <div className="font-bold text-slate-900 truncate group-hover:text-blue-700" title={partDisplayName}>
                          {partDisplayName}
                        </div>
                        <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-normal truncate mt-0.5">
                          <span className="font-medium text-slate-600">{cat.level1 || 'Genel'}</span>
                          {cat.level2 && (
                            <>
                              <span className="text-slate-400">›</span>
                              <span className="text-slate-500">{cat.level2}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-slate-900">{cat.totalCost.toLocaleString('tr-TR')} ₺</div>
                        <div className="text-[10px] text-blue-600 font-semibold">%{cat.sharePct} pay</div>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full" 
                        style={{ width: `${Math.min(100, cat.sharePct * 1.5)}%` }} 
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                      <span>{cat.count} İşlem / Değişim</span>
                      <span>Ort. {cat.avgCost.toLocaleString('tr-TR')} ₺</span>
                    </div>
                  </div>
                );
              })}

              {dynamicCategoryBreakdown.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  Kategori verisi bulunamadı.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Matched Records Table */}
      <div id="parts-transactions-table" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Controls & Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Standartlaştırılan Parça ve Bakım Kayıtları</h3>
              <p className="text-xs text-slate-500">
                Toplam {filteredMatches.length} / {matches.length} kayıt listeleniyor.
              </p>
            </div>

            {/* Status & Origin Filter Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setOriginFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  originFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tüm Türler ({matches.length})
              </button>

              <button
                onClick={() => setOriginFilter('BOSCH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1 ${
                  originFilter === 'BOSCH'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <ShieldCheck className="h-3 w-3" />
                <span>Bosch Parçalar</span>
              </button>

              <button
                onClick={() => setOriginFilter('DIGER_YP')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1 ${
                  originFilter === 'DIGER_YP'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <AlertTriangle className="h-3 w-3" />
                <span>Diğer Y.P. (Bosch Dışı)</span>
              </button>

              <button
                onClick={() => setOriginFilter('SIVILAR_KIMYASAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1 ${
                  originFilter === 'SIVILAR_KIMYASAL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <Droplet className="h-3 w-3" />
                <span>Sıvılar / Motor Yağı</span>
              </button>

              <button
                onClick={() => setOriginFilter('ISCILIK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1 ${
                  originFilter === 'ISCILIK'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100'
                }`}
              >
                <Wrench className="h-3 w-3" />
                <span>İşçilik</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between pt-1">
            <div className="relative w-full sm:w-80">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Servis, parça adı veya açıklama ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tüm Kategoriler ({allCategories.length})</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="matched">Sadece Katalog Eşleşenler</option>
                <option value="unmatched">Eşleşmeyen / Özel</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/90 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3.5 py-2.5">Sıra / Araç</th>
                <th className="px-3.5 py-2.5">Y.P. Türü / Menşei</th>
                <th className="px-3.5 py-2.5">Servis Noktası</th>
                <th className="px-3.5 py-2.5">Fatura Açıklaması</th>
                <th className="px-3.5 py-2.5">Eşleşen Parça & 3 Kademeli Kategori</th>
                <th className="px-3.5 py-2.5 text-right">Fatura Tutarı</th>
                <th className="px-3.5 py-2.5 text-center">Güven Skoru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedMatches.map(m => (
                <tr key={m.recordId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    <div className="font-bold text-slate-900">Araç #{m.rowNumber}</div>
                    <div className="text-[10px] text-slate-400">{m.brand || 'Filo'}</div>
                  </td>
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    {m.sparePartOrigin === 'BOSCH' ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Bosch Parça</span>
                      </span>
                    ) : m.sparePartOrigin === 'DIGER_YP' ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Diğer Y.P.</span>
                      </span>
                    ) : m.sparePartOrigin === 'SIVILAR_KIMYASAL' ? (
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          <Droplet className="h-3 w-3" />
                          <span>Sıvı / Motor Yağı</span>
                        </span>
                        {m.wasReclassifiedFromOtherYP && (
                          <span className="inline-flex items-center text-[9px] text-blue-700 bg-blue-50/90 px-1.5 py-0.5 rounded border border-blue-200 font-medium" title="Faturada 'Diğer Y.P.' yazmasına rağmen, açıklamadaki motor yağı/sıvı tespit edilerek doğru kategoriye aktarıldı.">
                            ⚡ Sıvı Olarak Ayrıştırıldı
                          </span>
                        )}
                      </div>
                    ) : m.sparePartOrigin === 'ISCILIK' ? (
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          <Wrench className="h-3 w-3" />
                          <span>İşçilik & Servis</span>
                        </span>
                        {m.wasReclassifiedFromOtherYP && (
                          <span className="inline-flex items-center text-[9px] text-purple-700 bg-purple-50/90 px-1.5 py-0.5 rounded border border-purple-200 font-medium" title="Faturada 'Diğer Y.P.' yazmasına rağmen, açıklamadaki işçilik hizmeti tespit edilerek doğru kategoriye aktarıldı.">
                            ⚡ İşçilik Olarak Ayrıştırıldı
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                        {m.sparePartType || 'Genel'}
                      </span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 max-w-[160px] truncate text-slate-600" title={m.supplier}>
                    {m.supplier || '-'}
                  </td>
                  <td className="px-3.5 py-2.5 max-w-xs truncate text-slate-800" title={m.rawDescription}>
                    {m.rawDescription}
                  </td>
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                        {m.matchedPartCode ? (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                            {m.matchedPartCode}
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-50 font-bold text-amber-700 border border-amber-200">
                            STANDART
                          </span>
                        )}
                        <span className="truncate max-w-[220px]" title={m.cleanPartName || m.matchedPartName || m.rawDescription}>
                          {m.cleanPartName || m.matchedPartName || m.rawDescription}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-600 font-medium flex items-center space-x-1 mt-0.5">
                        <span className="font-semibold text-slate-800">{m.matchedCategoryLevel1}</span>
                        <span className="text-slate-400">›</span>
                        <span>{m.matchedCategoryLevel2}</span>
                        <span className="text-slate-400">›</span>
                        <span className="text-blue-600 font-medium">{m.matchedCategoryLevel3}</span>
                      </div>
                      {m.matchedKeywords && m.matchedKeywords.length > 0 && (
                        <div className="text-[9px] text-emerald-700 flex items-center space-x-1 mt-0.5 truncate max-w-[240px]" title={`Eşleşen Katalog Kelimesi (KEYWORDS_TR): ${m.matchedKeywords.join(', ')}`}>
                          <span className="font-semibold text-emerald-800">Anahtar:</span>
                          <span className="bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 truncate">{m.matchedKeywords.slice(0, 2).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                    {m.totalPrice.toLocaleString('tr-TR')} ₺
                  </td>
                  <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      m.confidence >= 80 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : m.confidence >= 50 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      %{m.confidence} ({m.confidenceLevel})
                    </span>
                  </td>
                </tr>
              ))}

              {filteredMatches.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                    Filtre kriterlerine uygun kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredMatches.length > pageSize && (
          <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Toplam <span className="font-semibold text-slate-900">{filteredMatches.length}</span> kayıttan{' '}
              <span className="font-semibold text-slate-900">{(page - 1) * pageSize + 1}</span> -{' '}
              <span className="font-semibold text-slate-900">{Math.min(page * pageSize, filteredMatches.length)}</span> arası gösteriliyor
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                id="btn-parts-prev-page"
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
                id="btn-parts-next-page"
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

      {/* PART VEHICLE DRILLDOWN MODAL */}
      {selectedPartDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3 bg-slate-50/80">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                  <PackageCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">{selectedPartDetail.name}</h3>
                    {selectedPartDetail.code && (
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-200 font-bold text-slate-700">
                        {selectedPartDetail.code}
                      </span>
                    )}
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      selectedPartDetail.origin === 'BOSCH'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedPartDetail.origin === 'DIGER_YP'
                        ? 'bg-amber-100 text-amber-800'
                        : selectedPartDetail.origin === 'SIVILAR_KIMYASAL'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {selectedPartDetail.origin === 'BOSCH' ? 'Bosch Parça' : selectedPartDetail.origin === 'DIGER_YP' ? 'Diğer Y.P. (Muadil)' : selectedPartDetail.origin === 'SIVILAR_KIMYASAL' ? 'Sıvı & Yağ' : 'İşçilik'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedPartDetail.categoryLevel1} › {selectedPartDetail.categoryLevel2} › <strong className="text-slate-700">{selectedPartDetail.categoryLevel3}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPartDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5">
              
              {/* Key Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">Toplam Değişim</div>
                  <div className="text-xl font-bold text-blue-600 mt-0.5">{selectedPartDetail.count} Kez</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">Etkilenen Araç</div>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">{selectedPartDetail.distinctVehiclesCount} Araç</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">Toplam Harcama</div>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">{selectedPartDetail.totalCost.toLocaleString('tr-TR')} ₺</div>
                </div>
              </div>

              {/* Bosch Conversion Recommendation if DIGER_YP */}
              {selectedPartDetail.origin === 'DIGER_YP' && (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start space-x-2.5">
                  <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>Bosch Parça Dönüşüm & Tasarruf Fırsatı:</strong> Bu parça şu anda filoda <strong>{selectedPartDetail.count} kez</strong> muadil/yan sanayi olarak değişmiştir. Bosch Car Service ağı ve toplu Bosch OEM parça tedarik protokolü ile doğrudan Bosch eşdeğer parçaya geçildiğinde yaklaşık <strong>%{Math.round(selectedPartDetail.totalCost * 0.15).toLocaleString('tr-TR')} ₺ (%15)</strong> maliyet tasarrufu ve 2 yıl garantili parça güvencesi sağlanabilir.
                  </div>
                </div>
              )}

              {/* Table of Vehicles & Invoices */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Car className="h-3.5 w-3.5 text-blue-600" />
                    <span>Bu Parçanın Değiştiği Araçlar ve Faturalar ({selectedPartDetail.records.length})</span>
                  </h4>
                  <button
                    onClick={() => {
                      handleFilterByPart(selectedPartDetail.name);
                      setSelectedPartDetail(null);
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline"
                  >
                    Ana Tabloda Filtrele
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-semibold sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Araç & Marka</th>
                        <th className="py-2 px-3">Servis Noktası</th>
                        <th className="py-2 px-3">Fatura Açıklaması</th>
                        <th className="py-2 px-3 text-right">Tutar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {selectedPartDetail.records.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">
                            <div>Araç #{r.rowNumber}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{r.brand || 'Filo'}</div>
                          </td>
                          <td className="py-2 px-3 text-slate-600 max-w-[140px] truncate" title={r.supplier}>
                            {r.supplier || '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-800 max-w-[200px] truncate" title={r.rawDescription}>
                            {r.rawDescription}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                            {r.totalPrice.toLocaleString('tr-TR')} ₺
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {selectedPartDetail.plates.length} Araç Kaydı
              </span>
              <button
                onClick={() => setSelectedPartDetail(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

