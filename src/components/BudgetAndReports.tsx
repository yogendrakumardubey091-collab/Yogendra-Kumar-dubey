import React, { useState, useMemo } from 'react';
import { Transaction, Language, CategoryId } from '../types';
import { TRANSLATIONS, CATEGORIES } from '../constants/translations';
import { formatRupee } from '../utils/formatters';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  Target, 
  Download, 
  Upload, 
  RefreshCw,
  ShoppingBag,
  Carrot,
  Coffee,
  Zap,
  Fuel,
  Home,
  Briefcase,
  BadgeDollarSign,
  Utensils,
  HeartPulse,
  GraduationCap,
  Sparkles,
  MoreHorizontal,
  Flame
} from 'lucide-react';

interface BudgetAndReportsProps {
  transactions: Transaction[];
  monthlyBudget: number;
  onUpdateBudget: (newBudget: number) => void;
  lang: Language;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag,
  Carrot,
  Coffee,
  Zap,
  Fuel,
  Home,
  Briefcase,
  BadgeDollarSign,
  Utensils,
  HeartPulse,
  GraduationCap,
  Sparkles,
  MoreHorizontal
};

export const BudgetAndReports: React.FC<BudgetAndReportsProps> = ({
  transactions,
  monthlyBudget,
  onUpdateBudget,
  lang,
  onExportData,
  onImportData,
  onResetData
}) => {
  const t = TRANSLATIONS[lang];
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState(monthlyBudget.toString());

  // Current month stats
  const currentMonthData = useMemo(() => {
    const now = new Date();
    const currentMonthPrefix = now.toISOString().substring(0, 7); // YYYY-MM
    
    // Days in current month and days passed
    const year = now.getFullYear();
    const month = now.getMonth();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = Math.max(1, totalDaysInMonth - currentDay);

    const monthTxs = transactions.filter(tx => tx.date.startsWith(currentMonthPrefix));

    let monthIncome = 0;
    let monthExpense = 0;
    const categoryTotals: Record<CategoryId, number> = {
      groceries: 0,
      vegetables: 0,
      dairy: 0,
      bills: 0,
      fuel: 0,
      rent: 0,
      business: 0,
      salary: 0,
      food: 0,
      health: 0,
      education: 0,
      personal: 0,
      other: 0
    };

    for (const tx of monthTxs) {
      if (tx.type === 'income') {
        monthIncome += tx.amount;
      } else {
        monthExpense += tx.amount;
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
      }
    }

    // Sort categories by highest spend
    const sortedCategories = Object.entries(categoryTotals)
      .filter(([_, amt]) => amt > 0)
      .map(([catKey, amount]) => ({
        id: catKey as CategoryId,
        amount,
        percent: monthExpense > 0 ? (amount / monthExpense) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    const budgetRemaining = Math.max(0, monthlyBudget - monthExpense);
    const budgetPercent = monthlyBudget > 0 ? Math.min(100, Math.round((monthExpense / monthlyBudget) * 100)) : 0;
    const safeDailySpend = daysRemaining > 0 ? Math.round(budgetRemaining / daysRemaining) : 0;

    return {
      monthIncome,
      monthExpense,
      netSavings: monthIncome - monthExpense,
      sortedCategories,
      budgetRemaining,
      budgetPercent,
      daysRemaining,
      safeDailySpend
    };
  }, [transactions, monthlyBudget]);

  const handleBudgetSave = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(budgetValue);
    if (!isNaN(num) && num >= 0) {
      onUpdateBudget(num);
      setIsEditingBudget(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Monthly Budget Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.labels.monthlyBudget}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'hi' ? 'इस महीने के खर्च की सीमा तय करें और बचत बढ़ाएं' : 'Set your monthly spending target'}
              </p>
            </div>
          </div>

          <div>
            {isEditingBudget ? (
              <form onSubmit={handleBudgetSave} className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={budgetValue}
                    onChange={(e) => setBudgetValue(e.target.value)}
                    className="w-32 pl-6 pr-2 py-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  {t.actions.save}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingBudget(false)}
                  className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {t.actions.cancel}
                </button>
              </form>
            ) : (
              <button
                onClick={() => {
                  setBudgetValue(monthlyBudget.toString());
                  setIsEditingBudget(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap"
              >
                {lang === 'hi' ? 'बजट बदलें' : 'Edit Budget'}
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & Burn Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {t.labels.budgetSpent}: <strong className="font-mono text-slate-900 dark:text-white">{formatRupee(currentMonthData.monthExpense)}</strong>
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {lang === 'hi' ? 'कुल बजट' : 'Total Budget'}: <strong className="font-mono text-slate-900 dark:text-white">{formatRupee(monthlyBudget)}</strong>
            </span>
          </div>

          {/* Visual Bar */}
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                currentMonthData.budgetPercent > 90
                  ? 'bg-rose-500'
                  : currentMonthData.budgetPercent > 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${currentMonthData.budgetPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-medium">
            <span className={
              currentMonthData.budgetPercent > 90 ? 'text-rose-600 font-bold' :
              currentMonthData.budgetPercent > 70 ? 'text-amber-600 font-semibold' :
              'text-emerald-600 font-semibold'
            }>
              {currentMonthData.budgetPercent}% {lang === 'hi' ? 'बजट इस्तेमाल हुआ' : 'used'}
            </span>

            <span className="text-slate-600 dark:text-slate-300 font-mono">
              {t.labels.budgetRemaining}: <strong>{formatRupee(currentMonthData.budgetRemaining)}</strong>
            </span>
          </div>
        </div>

        {/* Smart Advice Box for Daily Spending */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
            <Flame className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">
              {lang === 'hi' ? 'दैनिक सुरक्षित खर्च की सीमा' : 'Safe Daily Spending Pace'}
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              {lang === 'hi' ? (
                <>
                  महीने में अभी <strong className="text-slate-900 dark:text-white font-mono">{currentMonthData.daysRemaining} दिन</strong> बाकी हैं। बजट के भीतर रहने के लिए आप प्रतिदिन औसतन <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{formatRupee(currentMonthData.safeDailySpend)}</strong> तक खर्च कर सकते हैं।
                </>
              ) : (
                <>
                  <strong className="text-slate-900 dark:text-white font-mono">{currentMonthData.daysRemaining} days</strong> left in this month. You can safely spend up to <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{formatRupee(currentMonthData.safeDailySpend)}/day</strong> to remain within budget.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress Bars */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {t.labels.topSpending}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'hi' ? 'इस महीने के खर्चे' : 'This Month'}
          </span>
        </div>

        {currentMonthData.sortedCategories.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            {lang === 'hi' ? 'इस महीने अभी कोई खर्च दर्ज नहीं हुआ है।' : 'No expenses recorded this month.'}
          </div>
        ) : (
          <div className="space-y-4">
            {currentMonthData.sortedCategories.map((item) => {
              const catInfo = CATEGORIES[item.id] || CATEGORIES.other;
              const Icon = CATEGORY_ICON_MAP[catInfo.icon] || MoreHorizontal;

              return (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${catInfo.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {catInfo[lang]}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono tabular-nums">
                      <span className="text-slate-400 text-[11px]">
                        {Math.round(item.percent)}%
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatRupee(item.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800 dark:bg-slate-200 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(2, item.percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Backup and Data Management */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          {lang === 'hi' ? 'डेटा सुरक्षा एवं बैकअप' : 'Data Backup & Management'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {lang === 'hi' 
            ? 'आपका सारा हिसाब आपके ब्राउज़र में सुरक्षित रहता है। कभी भी बैकअप फ़ाइल डाउनलोड करें ताकि आपका हिसाब हमेशा सुरक्षित रहे।'
            : 'All your accounts and transactions are saved locally. You can export or restore anytime.'}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Download JSON Backup */}
          <button
            onClick={onExportData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>{t.actions.exportData}</span>
          </button>

          {/* Import JSON Backup */}
          <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-lg transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>{t.actions.importData}</span>
            <input
              type="file"
              accept=".json"
              onChange={onImportData}
              className="hidden"
            />
          </label>

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              if (window.confirm(lang === 'hi' ? 'क्या आप शुरुआती नमूना डेटा पुनः लोड करना चाहते हैं?' : 'Reset to default sample data?')) {
                onResetData();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-xs rounded-lg transition-colors ml-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'शुरुआती नमूना डेटा लोड करें' : 'Reset Sample Data'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
