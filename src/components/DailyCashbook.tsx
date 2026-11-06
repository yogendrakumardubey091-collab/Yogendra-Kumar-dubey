import React, { useState, useMemo } from 'react';
import { Transaction, Language, TransactionType, CategoryId } from '../types';
import { TRANSLATIONS, CATEGORIES, PAYMENT_METHODS } from '../constants/translations';
import { formatRupee, formatDateLocale } from '../utils/formatters';
import { 
  TrendingDown, 
  TrendingUp, 
  Wallet, 
  Search, 
  Plus, 
  Minus, 
  Mic, 
  Download, 
  Trash2, 
  Edit3, 
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
  Receipt,
  CreditCard
} from 'lucide-react';

interface DailyCashbookProps {
  transactions: Transaction[];
  lang: Language;
  onAddTransaction: (type: TransactionType) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenVoice: () => void;
  onOpenExport: () => void;
  monthlyBudget: number;
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

export const DailyCashbook: React.FC<DailyCashbookProps> = ({
  transactions,
  lang,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onOpenVoice,
  onOpenExport,
  monthlyBudget
}) => {
  const t = TRANSLATIONS[lang];
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | 'all'>('all');

  // Filter transactions based on date, type, search, category
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Compute week start (7 days ago)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    // Current month prefix: YYYY-MM
    const currentMonthPrefix = todayStr.substring(0, 7);

    return transactions
      .filter(tx => {
        // Date filter
        if (dateFilter === 'today' && tx.date !== todayStr) return false;
        if (dateFilter === 'week' && tx.date < sevenDaysAgoStr) return false;
        if (dateFilter === 'month' && !tx.date.startsWith(currentMonthPrefix)) return false;

        // Type filter
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const descMatch = (tx.description || '').toLowerCase().includes(q);
          const noteMatch = (tx.note || '').toLowerCase().includes(q);
          const billMatch = (tx.billNumber || '').toLowerCase().includes(q);
          const catName = (CATEGORIES[tx.category]?.[lang] || '').toLowerCase();
          const catMatch = catName.includes(q);
          if (!descMatch && !noteMatch && !billMatch && !catMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort descending by date, then createdAt
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return b.createdAt - a.createdAt;
      });
  }, [transactions, dateFilter, typeFilter, searchQuery, categoryFilter, lang]);

  // Aggregate metrics for filtered scope
  const metrics = useMemo(() => {
    let income = 0;
    let expense = 0;

    for (const tx of filteredTransactions) {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
      }
    }

    return {
      income,
      expense,
      balance: income - expense
    };
  }, [filteredTransactions]);

  // Group transactions by date for a traditional Roznamcha ledger view
  const groupedTransactions = useMemo(() => {
    const groups: { date: string; items: Transaction[]; dayIncome: number; dayExpense: number }[] = [];
    const map = new Map<string, Transaction[]>();

    for (const tx of filteredTransactions) {
      if (!map.has(tx.date)) {
        map.set(tx.date, []);
      }
      map.get(tx.date)!.push(tx);
    }

    for (const [date, items] of map.entries()) {
      let dayIncome = 0;
      let dayExpense = 0;
      for (const item of items) {
        if (item.type === 'income') dayIncome += item.amount;
        else dayExpense += item.amount;
      }
      groups.push({ date, items, dayIncome, dayExpense });
    }

    return groups;
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* 3 Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t.labels.totalIncome}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {formatRupee(metrics.income)}
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
            {dateFilter === 'today' ? (lang === 'hi' ? 'आज की कुल आमदनी' : "Today's income") :
             dateFilter === 'week' ? (lang === 'hi' ? 'इस हफ़्ते की कमाई' : "This week's income") :
             dateFilter === 'month' ? (lang === 'hi' ? 'इस महीने की कुल कमाई' : "This month's income") :
             (lang === 'hi' ? 'कुल दर्ज कमाई' : 'All time income')}
          </p>
        </div>

        {/* Total Expense */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t.labels.totalExpense}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
            {formatRupee(metrics.expense)}
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
            {monthlyBudget > 0 ? (
              <span>
                {lang === 'hi' ? `बजट ₹${monthlyBudget.toLocaleString('en-IN')} का ${Math.round((metrics.expense / monthlyBudget) * 100)}%` : 
                 `${Math.round((metrics.expense / monthlyBudget) * 100)}% of ₹${monthlyBudget.toLocaleString('en-IN')} budget`}
              </span>
            ) : (
              lang === 'hi' ? 'कुल खर्च हुआ' : 'Total spent'
            )}
          </p>
        </div>

        {/* Net Hand Balance */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t.labels.netBalance}
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums ${
            metrics.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatRupee(metrics.balance)}
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
            {metrics.balance >= 0 
              ? (lang === 'hi' ? 'सुरक्षित बचत / शेष राशि' : 'Net positive balance') 
              : (lang === 'hi' ? 'खर्च आमदनी से अधिक है' : 'Expenses exceed income')}
          </p>
        </div>
      </div>

      {/* Quick Entry Action Buttons & Voice Button */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddTransaction('expense')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              <Minus className="w-4 h-4 stroke-[3]" />
              <span>{t.actions.addExpense}</span>
            </button>
            <button
              onClick={() => onAddTransaction('income')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t.actions.addIncome}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Recognition Button */}
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title={lang === 'hi' ? 'बोलकर एंट्री जोड़ें (जैसे: 500 रुपये सब्ज़ी)' : 'Voice input for quick entry'}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{t.actions.voiceAdd}</span>
            </button>

            {/* Export / Download Statement */}
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.actions.exportPdf}</span>
              <span className="sm:hidden">{lang === 'hi' ? 'डाउनलोड' : 'Export'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.actions.search}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Date Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 overflow-x-auto">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                dateFilter === 'today'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.labels.filterToday}
            </button>
            <button
              onClick={() => setDateFilter('week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                dateFilter === 'week'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.labels.filterThisWeek}
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                dateFilter === 'month'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.labels.filterThisMonth}
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                dateFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.labels.filterAll}
            </button>
          </div>
        </div>

        {/* Secondary filters: Type and Category */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Type Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.labels.allTypes}
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                typeFilter === 'expense'
                  ? 'bg-rose-500 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {lang === 'hi' ? 'केवल खर्च (-)' : 'Expenses'}
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                typeFilter === 'income'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {lang === 'hi' ? 'केवल आय (+)' : 'Income'}
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CategoryId | 'all')}
            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium focus:outline-hidden"
          >
            <option value="all">{t.labels.allCategories}</option>
            {Object.entries(CATEGORIES).map(([catKey, info]) => (
              <option key={catKey} value={catKey}>
                {info[lang]}
              </option>
            ))}
          </select>

          <span className="text-slate-400 dark:text-slate-500 text-[11px] ml-auto">
            {filteredTransactions.length} {lang === 'hi' ? 'हिसाब दर्ज' : 'records found'}
          </span>
        </div>
      </div>

      {/* Transaction Records List (Grouped by Date - Roznamcha Style) */}
      {groupedTransactions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Receipt className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            {t.labels.noTransactions}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
            {lang === 'hi' 
              ? 'आज का खर्च या आमदनी लिखकर अपने हिसाब को व्यवस्थित रखें।' 
              : 'Start logging your daily expenses and income to manage your finances easily.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => onAddTransaction('expense')}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-all"
            >
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{t.actions.addExpense}</span>
            </button>
            <button
              onClick={() => onAddTransaction('income')}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{t.actions.addIncome}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedTransactions.map((group) => (
            <div key={group.date} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
              {/* Day Header with Net Day Flow */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {formatDateLocale(group.date, lang)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({group.date})
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                  {group.dayIncome > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      +{formatRupee(group.dayIncome)}
                    </span>
                  )}
                  {group.dayExpense > 0 && (
                    <span className="text-rose-600 dark:text-rose-400 font-medium">
                      -{formatRupee(group.dayExpense)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions in this Day */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {group.items.map((tx) => {
                  const categoryInfo = CATEGORIES[tx.category] || CATEGORIES.other;
                  const IconComponent = CATEGORY_ICON_MAP[categoryInfo.icon] || MoreHorizontal;
                  const isExpense = tx.type === 'expense';

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Left: Category Icon & Details */}
                      <div className="flex items-start gap-3.5 min-w-0 pr-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${categoryInfo.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              {tx.description}
                            </span>
                          </div>

                          {/* Unboxed Metadata (Category, Payment Method, Note) */}
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                            <span>{categoryInfo[lang]}</span>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-slate-400" />
                              {PAYMENT_METHODS[tx.paymentMethod]?.[lang] || tx.paymentMethod}
                            </span>
                            {tx.billNumber && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono text-[11px] text-slate-400">
                                  #{tx.billNumber}
                                </span>
                              </>
                            )}
                            {tx.note && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="italic truncate max-w-xs">{tx.note}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className={`text-base font-bold font-mono tabular-nums ${
                            isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {isExpense ? '-' : '+'}{formatRupee(tx.amount)}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {isExpense 
                              ? (lang === 'hi' ? 'खर्च' : 'Expense') 
                              : (lang === 'hi' ? 'जमा' : 'Income')}
                          </div>
                        </div>

                        {/* Edit and Delete Buttons */}
                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title={t.actions.edit}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(lang === 'hi' ? 'क्या आप इस हिसाब को हटाना चाहते हैं?' : 'Delete this entry?')) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            title={t.actions.delete}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
