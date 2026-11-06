import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, CategoryId, PaymentMethod, Language } from '../types';
import { TRANSLATIONS, CATEGORIES, PAYMENT_METHODS } from '../constants/translations';
import { 
  X, 
  Minus, 
  Plus, 
  Calendar, 
  CreditCard, 
  FileText, 
  Tag, 
  Sparkles,
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
  MoreHorizontal
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  initialTransaction?: Transaction | null;
  defaultType?: TransactionType;
  lang: Language;
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

const COMMON_SUGGESTIONS_EXPENSE = [
  'सब्ज़ी व फल',
  'महीने का राशन',
  'दूध का बिल',
  'पेट्रोल / ऑटो किराया',
  'बिजली का बिल',
  'चाय व नाश्ता',
  'दवाई व मेडिकल',
  'दुकान का सामान'
];

const COMMON_SUGGESTIONS_INCOME = [
  'महीने की तनख्वाह (Salary)',
  'दुकान की नकद बिक्री',
  'पुराना बकाया वापस मिला',
  'ऑनलाइन पेमेंट प्राप्त हुआ',
  'ब्याज या किराया आया'
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTransaction,
  defaultType = 'expense',
  lang
}) => {
  const t = TRANSLATIONS[lang];

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<CategoryId>('groceries');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [note, setNote] = useState<string>('');
  const [billNumber, setBillNumber] = useState<string>('');

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmount(initialTransaction.amount.toString());
      setCategory(initialTransaction.category);
      setDescription(initialTransaction.description);
      setDate(initialTransaction.date);
      setPaymentMethod(initialTransaction.paymentMethod);
      setNote(initialTransaction.note || '');
      setBillNumber(initialTransaction.billNumber || '');
    } else {
      setType(defaultType);
      setAmount('');
      setCategory(defaultType === 'income' ? 'salary' : 'groceries');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('cash');
      setNote('');
      setBillNumber('');
    }
  }, [initialTransaction, defaultType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    onSave(
      {
        type,
        amount: num,
        category,
        description: description.trim() || (type === 'income' ? (lang === 'hi' ? 'आमदनी' : 'Income') : (lang === 'hi' ? 'खर्च' : 'Expense')),
        date,
        paymentMethod,
        note: note.trim() || undefined,
        billNumber: billNumber.trim() || undefined
      },
      initialTransaction ? initialTransaction.id : undefined
    );
    onClose();
  };

  const handleQuickAmount = (delta: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + delta).toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-lg overflow-hidden my-8">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {initialTransaction 
              ? (lang === 'hi' ? 'हिसाब सुधारें (Edit)' : 'Edit Transaction') 
              : (lang === 'hi' ? 'नया हिसाब दर्ज करें' : 'Add New Transaction')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Income vs Expense Segmented Control */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (category === 'salary') setCategory('groceries');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Minus className="w-4 h-4 stroke-[3]" />
              <span>{lang === 'hi' ? 'खर्च (-) नामे' : 'Expense (-)'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('salary');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{lang === 'hi' ? 'आमदनी (+) जमा' : 'Income (+)'}</span>
            </button>
          </div>

          {/* Amount Input with Large Rupee Symbol */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.labels.amount} *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 text-2xl font-mono font-extrabold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-slate-400 mr-1 font-medium">{lang === 'hi' ? 'त्वरित जोड़ें:' : 'Quick add:'}</span>
              {[100, 200, 500, 1000, 2000, 5000].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleQuickAmount(val)}
                  className="px-2 py-1 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Description & Quick Suggestions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.labels.description} *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={lang === 'hi' ? 'उदा. 2 किलो आम, बिजली बिल, शाम का नाश्ता' : 'e.g. Groceries, Electricity bill'}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />

            {/* Suggestion tags */}
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {(type === 'expense' ? COMMON_SUGGESTIONS_EXPENSE : COMMON_SUGGESTIONS_INCOME).slice(0, 4).map((sug) => (
                <button
                  type="button"
                  key={sug}
                  onClick={() => setDescription(sug)}
                  className="text-[11px] text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 underline decoration-dotted transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker (Grid with visual icons) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.labels.category}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
              {Object.entries(CATEGORIES).map(([catKey, info]) => {
                const Icon = CATEGORY_ICON_MAP[info.icon] || MoreHorizontal;
                const isSelected = category === catKey;
                return (
                  <button
                    type="button"
                    key={catKey}
                    onClick={() => setCategory(catKey as CategoryId)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                        : 'hover:bg-slate-200/60 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{info[lang]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.labels.date}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.labels.paymentMethod}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                {Object.entries(PAYMENT_METHODS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item[lang]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Bill Number or Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                {lang === 'hi' ? 'बिल / पर्ची नंबर (ऐच्छिक)' : 'Bill / Receipt No. (Optional)'}
              </label>
              <input
                type="text"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                placeholder="उदा. #402"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                {lang === 'hi' ? 'अतिरिक्त नोट (ऐच्छिक)' : 'Extra Note'}
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={lang === 'hi' ? 'उदा. GPay से भुगतान किया' : 'Optional remarks'}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {t.actions.cancel}
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition-all ${
                type === 'expense' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {initialTransaction 
                ? (lang === 'hi' ? 'बदलाव सहेजें' : 'Update Entry') 
                : (lang === 'hi' ? 'हिसाब में जोड़ें' : 'Save Entry')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
