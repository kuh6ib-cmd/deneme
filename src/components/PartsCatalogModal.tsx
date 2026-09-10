import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  RotateCcw, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  FileSpreadsheet,
  Tag,
  HelpCircle
} from 'lucide-react';
import { PartCatalogItem } from '../types';
import { 
  DEFAULT_PARTS_CATALOG, 
  parseCustomCatalogFile, 
  downloadCatalogTemplate 
} from '../services/partsCatalogService';

interface PartsCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: PartCatalogItem[];
  catalogSource: 'default' | 'custom';
  onUpdateCatalog: (newCatalog: PartCatalogItem[], source: 'default' | 'custom') => void;
}

export const PartsCatalogModal: React.FC<PartsCatalogModalProps> = ({
  isOpen,
  onClose,
  catalog,
  catalogSource,
  onUpdateCatalog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Part Form State
  const [newPartCode, setNewPartCode] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [newPartCat1, setNewPartCat1] = useState('Mekanik & Yürüyen Aksam');
  const [newPartCat2, setNewPartCat2] = useState('Fren Sistemi');
  const [newPartCat3, setNewPartCat3] = useState('Ön Fren Balatası');
  const [newPartKeywords, setNewPartKeywords] = useState('');
  const [newPartUnit, setNewPartUnit] = useState('Adet');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Categories list (Level 1 and full)
  const categories = Array.from(new Set(catalog.map(c => c.category))).sort();

  // Filtered Catalog Items
  const filteredItems = catalog.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.categoryLevel1 && item.categoryLevel1.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.categoryLevel2 && item.categoryLevel2.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.categoryLevel3 && item.categoryLevel3.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory || item.categoryLevel1 === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const parsedItems = await parseCustomCatalogFile(file);
      onUpdateCatalog(parsedItems, 'custom');
      setUploadSuccess(`Başarılı! ${parsedItems.length} adet parça kataloğu ve 3 kademeli kategori yapısı tanımlandı.`);
    } catch (err: any) {
      setUploadError(err.message || 'Katalog dosyası okunurken hata oluştu.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetToDefault = () => {
    onUpdateCatalog(DEFAULT_PARTS_CATALOG, 'default');
    setUploadSuccess('Standart Filo 3 kademeli parça kataloğuna sıfırlandı.');
    setUploadError(null);
  };

  const handleAddNewPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName) return;

    const kws = newPartKeywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const cat1 = newPartCat1.trim() || 'Genel Mekanik';
    const cat2 = newPartCat2.trim() || 'Genel Sistem';
    const cat3 = newPartCat3.trim() || newPartName.trim();
    const fullCat = `${cat1} > ${cat2} > ${cat3}`;

    const newItem: PartCatalogItem = {
      id: `part-custom-${Date.now()}`,
      code: newPartCode.trim().toUpperCase() || `PRC-${Date.now().toString().slice(-4)}`,
      name: newPartName.trim(),
      categoryLevel1: cat1,
      categoryLevel2: cat2,
      categoryLevel3: cat3,
      category: fullCat,
      unit: newPartUnit,
      keywords: kws.length > 0 ? kws : [newPartName.toLowerCase(), cat1.toLowerCase(), cat2.toLowerCase()],
      description: 'Manuel eklenen parça tanımı',
    };

    const updated = [newItem, ...catalog];
    onUpdateCatalog(updated, 'custom');
    setShowAddForm(false);
    // Reset form
    setNewPartCode('');
    setNewPartName('');
    setNewPartKeywords('');
    setUploadSuccess(`"${newItem.name}" kataloğa eklendi.`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>Parça Kataloğu & Eşleştirme Yönetimi</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  catalogSource === 'custom' 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {catalogSource === 'custom' ? 'Özel Şirket Kataloğu' : 'Standart Parça Kataloğu'} ({catalog.length} Parça)
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Faturalardaki işlem ve değişen parçaları standartlaştırmak, OEM kodlarını atamak ve 3 kademeli kategorilere göre sınıflandırmak için referans katalog.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="btn-close-parts-modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Upload & Template Action Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Upload Custom Catalog Card */}
            <div className="p-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-blue-900 font-semibold text-sm mb-1">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <span>Kendi Parça Kataloğunuzu Yükleyin</span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Şirketinizin parça listesini içeren Excel (.xlsx) veya CSV dosyasını yükleyin. Dosyanızdaki <strong>KEYWORDS_TR</strong> sütunundaki olası parça isimleri taranarak parça listesindeki tüm adlar otomatik normalize edilir.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  id="btn-upload-catalog-file"
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{isUploading ? 'Ayrıştırılıyor...' : 'Excel / CSV Dosyası Seç'}</span>
                </button>

                <button
                  type="button"
                  onClick={downloadCatalogTemplate}
                  id="btn-download-catalog-template"
                  className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                  title="Örnek katalog Excel şablonunu indir"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  <span>Şablon İndir</span>
                </button>
              </div>
            </div>

            {/* Catalog Info & Quick Reset Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-900 flex items-center space-x-1.5">
                    <Tag className="h-4 w-4 text-slate-500" />
                    <span>Aktif Katalog Durumu</span>
                  </span>
                  {catalogSource === 'custom' && (
                    <button
                      onClick={handleResetToDefault}
                      id="btn-reset-default-catalog"
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center space-x-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Standart Kataloğa Dön</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Şu an <strong>{catalog.length} adet</strong> parça referansı devrede. Periyodik filtrelerden fren balatasına, debriyajdan triger setine kadar tüm fatura açıklamaları taranır.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-500">
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>3 Kademeli Taksonomi & Eşleştirme Motoru Aktif</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  id="btn-toggle-add-part-form"
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{showAddForm ? 'Formu Kapat' : 'Yeni Parça Ekle'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Success / Error Alerts */}
          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
              <button onClick={() => setUploadSuccess(null)} className="text-emerald-500 hover:text-emerald-700">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-800">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
              <button onClick={() => setUploadError(null)} className="text-rose-500 hover:text-rose-700">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Manual Add New Part Form */}
          {showAddForm && (
            <form onSubmit={handleAddNewPart} className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <Plus className="h-3.5 w-3.5 text-blue-600" />
                <span>Yeni Parça Referansı Ekle</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Parça Kodu (OEM / Kod)</label>
                  <input
                    type="text"
                    value={newPartCode}
                    onChange={e => setNewPartCode(e.target.value)}
                    placeholder="Örn: BOSCH-FRN-09"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Parça / İşlem Adı *</label>
                  <input
                    type="text"
                    required
                    value={newPartName}
                    onChange={e => setNewPartName(e.target.value)}
                    placeholder="Örn: Arka Amortisör Çifti"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">1. Seviye: Genel Kategori (L1) *</label>
                  <select
                    value={newPartCat1}
                    onChange={e => setNewPartCat1(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 text-xs"
                  >
                    <option value="Mekanik & Yürüyen Aksam">Mekanik & Yürüyen Aksam</option>
                    <option value="Periyodik Bakım & Sıvılar">Periyodik Bakım & Sıvılar</option>
                    <option value="Elektrik & Elektronik">Elektrik & Elektronik</option>
                    <option value="Lastik, Jant & Aksesuar">Lastik, Jant & Aksesuar</option>
                    <option value="İklimlendirme & Konfor">İklimlendirme & Konfor</option>
                    <option value="Kaporta & Boya & Cam">Kaporta & Boya & Cam</option>
                    <option value="Diğer & Özel Hizmetler">Diğer & Özel Hizmetler</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">2. Seviye: Alt Kategori / Sistem (L2) *</label>
                  <input
                    type="text"
                    required
                    value={newPartCat2}
                    onChange={e => setNewPartCat2(e.target.value)}
                    placeholder="Örn: Fren Sistemi, Filtre Grubu, Şanzıman"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">3. Seviye: Detay / Parça Grubu (L3) *</label>
                  <input
                    type="text"
                    required
                    value={newPartCat3}
                    onChange={e => setNewPartCat3(e.target.value)}
                    placeholder="Örn: Ön Fren Balatası, Yağ Filtresi"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Birim</label>
                  <input
                    type="text"
                    value={newPartUnit}
                    onChange={e => setNewPartUnit(e.target.value)}
                    placeholder="Adet / Set / Takım"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Olası Parça İsimleri & Anahtar Kelimeler (KEYWORDS_TR)</label>
                  <input
                    type="text"
                    value={newPartKeywords}
                    onChange={e => setNewPartKeywords(e.target.value)}
                    placeholder="Örn: ön balata, fren balatası ön, on balata (virgülle ayırın)"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Parçayı Kataloğa Kaydet
                </button>
              </div>
            </form>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Parça adı, kod veya anahtar kelime..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tüm Kategoriler ({categories.length})</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Catalog Items List Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3 py-2.5">Kod</th>
                  <th className="px-3 py-2.5">Parça / İşlem Tanımı</th>
                  <th className="px-3 py-2.5">3 Kademeli Hiyerarşi (Genelden Özele)</th>
                  <th className="px-3 py-2.5">Birim</th>
                  <th className="px-3 py-2.5">Olası İsimler (KEYWORDS_TR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {item.code}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {item.name}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col text-[11px]">
                        <span className="font-semibold text-slate-900">{item.categoryLevel1 || 'Genel'}</span>
                        <span className="text-slate-600 text-[10px] flex items-center space-x-1">
                          <span>↳ {item.categoryLevel2 || 'Alt Grup'}</span>
                          <span className="text-slate-400">›</span>
                          <span className="text-blue-600 font-medium">{item.categoryLevel3 || 'Detay'}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                      {item.unit || 'Adet'}
                    </td>
                    <td className="px-3 py-2 text-slate-500 max-w-xs truncate text-[11px]">
                      {item.keywords.slice(0, 4).join(', ')}
                      {item.keywords.length > 4 && ` (+${item.keywords.length - 4})`}
                    </td>
                  </tr>
                ))}

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-xs">
                      Arama kriterlerine uygun parça bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center space-x-1">
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            <span>Fatura açıklamalarında geçen kelimeler bu katalogla otomatik eşleştirilir ve sınıflandırılır.</span>
          </span>
          <button
            onClick={onClose}
            id="btn-close-parts-modal-bottom"
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
