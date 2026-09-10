import React, { useState, useEffect } from 'react';
import { AnalyticsResult } from '../services/analyticsEngine';
import { AnomalyItem } from '../types';
import { Sparkles, X, RefreshCw, Copy, Check, ShieldAlert, TrendingDown } from 'lucide-react';

interface AiInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics: AnalyticsResult;
  anomalies: AnomalyItem[];
}

export const AiInsightsModal: React.FC<AiInsightsModalProps> = ({
  isOpen,
  onClose,
  analytics,
  anomalies,
}) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string>('');
  const [source, setSource] = useState<'gemini' | 'rule-based'>('rule-based');
  const [copied, setCopied] = useState(false);

  const fetchAiInsights = async () => {
    setLoading(true);
    try {
      const payload = {
        metrics: analytics.summary,
        anomalies: anomalies.slice(0, 20),
        topRisks: analytics.riskRecords.slice(0, 10),
        brandStats: analytics.brandStats.slice(0, 5),
        supplierStats: analytics.supplierStats.slice(0, 5),
      };

      const res = await fetch('/api/gemini/executive-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data && data.insights) {
        setInsights(data.insights);
        setSource(data.source || 'gemini');
      }
    } catch (e) {
      console.error('Error fetching AI insights:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !insights) {
      fetchAiInsights();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(insights);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-slate-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  AI Yönetici Brifingi & Karar Destek Raporu
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                  {source === 'gemini' ? 'Gemini 3.7 Flash AI' : 'Kıdemli Filo Analisti Motoru'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Stratejik maliyet optimizasyonu, TCO iyileştirmesi ve riskli araç tasfiye önerileri
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchAiInsights}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 transition-colors disabled:opacity-50"
              title="Yeniden Oluştur"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              title="Metni Kopyala"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-slate-700">
                Filo verileri taranıyor ve üst yönetim brifingi hazırlanıyor...
              </p>
              <p className="text-xs text-slate-400">
                Marka dağılımı, tedarikçi iskontoları, riskli araçlar ve anomali maliyetleri sentezleniyor.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-slate-800 text-sm leading-relaxed">
              {/* Quick Highlight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                  <div className="flex items-center space-x-2 text-purple-700 font-bold text-xs mb-1">
                    <TrendingDown className="h-4 w-4" />
                    <span>Tahmini Tasarruf Hedefi</span>
                  </div>
                  <div className="text-lg font-extrabold text-purple-900">
                    %{18} - %{24}
                  </div>
                  <div className="text-[11px] text-purple-600 font-medium">
                    Yaklaşık {Math.round(analytics.summary.totalCost * 0.21).toLocaleString('tr-TR')} ₺ / Yıl
                  </div>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                  <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs mb-1">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Kritik Tasfiye Adayları</span>
                  </div>
                  <div className="text-lg font-extrabold text-rose-900">
                    {analytics.riskRecords.filter(r => r.riskLevel === 'Kritik Risk').length} Araç
                  </div>
                  <div className="text-[11px] text-rose-600 font-medium">
                    &gt;8 Yaş ve &gt;150.000 KM Üzeri
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs mb-1">
                    <Sparkles className="h-4 w-4" />
                    <span>Ortalama Bilet Fiyatı</span>
                  </div>
                  <div className="text-lg font-extrabold text-blue-900">
                    {analytics.summary.avgTicketCost.toLocaleString('tr-TR')} ₺
                  </div>
                  <div className="text-[11px] text-blue-600 font-medium">
                    {analytics.summary.totalRecords} Adet İş Emrinde
                  </div>
                </div>
              </div>

              {/* Formatted Insights Text */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 font-sans whitespace-pre-wrap space-y-3">
                {insights}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Veri Gizliliği: Filo analitiği güvenli sunucu katmanında işlenmektedir.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
