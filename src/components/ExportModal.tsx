import React, { useState } from 'react';
import { Transaction, Language } from '../types';
import { TRANSLATIONS, CATEGORIES, PAYMENT_METHODS } from '../constants/translations';
import { formatRupee, formatDateLocale, exportToCsv } from '../utils/formatters';
import { X, Printer, Download, FileSpreadsheet, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  lang: Language;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  lang
}) => {
  const t = TRANSLATIONS[lang];
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const csvContent = exportToCsv(transactions, lang);
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hisab_kitab_statement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-3xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {lang === 'hi' ? 'खाता विवरण व रिपोर्ट' : 'Statement & Ledger Export'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'hi' ? 'प्रिंट करें अथवा एक्सेल / CSV फ़ाइल डाउनलोड करें' : 'Print statement or download CSV file'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto print:p-0 print:max-h-none">
          {/* Printable Statement Header */}
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {lang === 'hi' ? 'हिसाब किताब - खाता विवरण' : 'Hisab Kitab - Account Statement'}
            </h2>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>{lang === 'hi' ? 'दिनांक' : 'Generated On'}: {new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}</span>
              <span>{transactions.length} {lang === 'hi' ? 'कुल लेन-देन' : 'total transactions'}</span>
            </div>
          </div>

          {/* Quick Summary Box */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                {t.labels.totalIncome}
              </div>
              <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                +{formatRupee(totalIncome)}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                {t.labels.totalExpense}
              </div>
              <div className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
                -{formatRupee(totalExpense)}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                {t.labels.netBalance}
              </div>
              <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {formatRupee(balance)}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-2.5">{t.labels.date}</th>
                  <th className="p-2.5">{t.labels.description}</th>
                  <th className="p-2.5">{t.labels.category}</th>
                  <th className="p-2.5">{t.labels.paymentMethod}</th>
                  <th className="p-2.5 text-right">{t.labels.amount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {transactions.slice(0, 30).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 font-mono whitespace-nowrap">{tx.date}</td>
                    <td className="p-2.5 font-medium">{tx.description}</td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400">{CATEGORIES[tx.category]?.[lang] || tx.category}</td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400">{PAYMENT_METHODS[tx.paymentMethod]?.[lang] || tx.paymentMethod}</td>
                    <td className={`p-2.5 text-right font-mono font-bold whitespace-nowrap ${
                      tx.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {tx.type === 'expense' ? '-' : '+'}{formatRupee(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {transactions.length > 30 && (
            <p className="text-[11px] text-slate-400 text-center">
              {lang === 'hi' ? `...और ${transactions.length - 30} अन्य लेन-देन (CSV में पूरे उपलब्ध हैं)` : `...and ${transactions.length - 30} more entries (all included in CSV)`}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'hi' ? 'प्रिंट / PDF' : 'Print / PDF'}</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
            >
              {downloadSuccess ? <Check className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
              <span>{downloadSuccess ? (lang === 'hi' ? 'डाउनलोड संपन्न!' : 'Downloaded!') : (lang === 'hi' ? 'CSV (Excel) डाउनलोड करें' : 'Download CSV')}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-lg"
          >
            {t.actions.cancel}
          </button>
        </div>

      </div>
    </div>
  );
};
