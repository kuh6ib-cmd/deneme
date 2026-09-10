import React from 'react';
import { Loader2, CheckCircle2, FileSpreadsheet, AlertCircle, X } from 'lucide-react';
import { ParseProgress } from '../services/excelImporter';

interface FileLoadingModalProps {
  isOpen: boolean;
  progress: ParseProgress | null;
  fileName: string;
  error?: string | null;
  onClose?: () => void;
}

export const FileLoadingModal: React.FC<FileLoadingModalProps> = ({
  isOpen,
  progress,
  fileName,
  error,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-5 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Kapat / İptal"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex justify-center">
          {error ? (
            <div className="h-16 w-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="h-8 w-8" />
            </div>
          ) : progress?.stage === 'complete' ? (
            <div className="h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center relative">
              <FileSpreadsheet className="h-8 w-8 text-blue-700" />
              <Loader2 className="h-6 w-6 absolute -bottom-1 -right-1 text-blue-600 animate-spin" />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">
            {error ? 'Dosya Okuma Hatası' : progress?.stage === 'complete' ? 'Veri Başarıyla Yüklendi' : 'Büyük Veri Seti İşleniyor'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 truncate max-w-xs mx-auto" title={fileName}>
            {fileName}
          </p>
        </div>

        {!error && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>{progress?.message || 'İşleniyor...'}</span>
              <span>{progress?.percent ?? 0}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress?.percent ?? 0}%` }}
              />
            </div>
            {progress?.sheetName && (
              <p className="text-[11px] text-slate-400">
                Seçilen Çalışma Sayfası: <span className="font-semibold text-slate-600">{progress.sheetName}</span>
                {progress.totalRows ? ` (${progress.totalRows.toLocaleString('tr-TR')} satır)` : ''}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-left text-xs text-rose-800 space-y-1">
            <p className="font-semibold">Hata Detayı:</p>
            <p className="text-rose-700 leading-relaxed">{error}</p>
          </div>
        )}

        {error && onClose ? (
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            Kapat
          </button>
        ) : onClose && progress?.stage !== 'complete' ? (
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 hover:underline pt-1 transition-colors"
          >
            İptal Et
          </button>
        ) : null}
      </div>
    </div>
  );
};
