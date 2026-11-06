import React, { useState, useMemo } from 'react';
import { Party, PartyTransaction, Language } from '../types';
import { TRANSLATIONS, PARTY_TYPES } from '../constants/translations';
import { formatRupee, formatDateLocale, createWhatsAppReminder } from '../utils/formatters';
import { 
  X, 
  Phone, 
  Plus, 
  Minus, 
  Trash2, 
  MessageCircle, 
  CheckCircle2, 
  ArrowDownLeft, 
  ArrowUpRight,
  Printer,
  Calendar,
  FileText
} from 'lucide-react';

interface PartyDetailModalProps {
  party: Party;
  partyTransactions: PartyTransaction[];
  lang: Language;
  onClose: () => void;
  onAddTransaction: (partyId: string, type: 'you_gave' | 'you_got', amount: number, note: string, date: string) => void;
  onDeleteTransaction: (id: string) => void;
  onSettleParty: (partyId: string, currentBalance: number) => void;
  onDeleteParty: (partyId: string) => void;
}

export const PartyDetailModal: React.FC<PartyDetailModalProps> = ({
  party,
  partyTransactions,
  lang,
  onClose,
  onAddTransaction,
  onDeleteTransaction,
  onSettleParty,
  onDeleteParty
}) => {
  const t = TRANSLATIONS[lang];
  const [activeAction, setActiveAction] = useState<'none' | 'you_gave' | 'you_got'>('none');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Filter transactions for this party
  const partyHistory = useMemo(() => {
    return partyTransactions
      .filter(ptx => ptx.partyId === party.id)
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.createdAt - a.createdAt;
      });
  }, [partyTransactions, party.id]);

  // Calculate current balance
  // you_gave = gave them money / goods (+ they owe you)
  // you_got = got money (- balance decreases)
  const balance = useMemo(() => {
    let bal = 0;
    for (const ptx of partyHistory) {
      if (ptx.type === 'you_gave') {
        bal += ptx.amount;
      } else {
        bal -= ptx.amount;
      }
    }
    return bal;
  }, [partyHistory]);

  const isToReceive = balance > 0;
  const isToGive = balance < 0;
  const isSettled = balance === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0 || activeAction === 'none') return;

    onAddTransaction(party.id, activeAction, num, note.trim(), date);
    setAmount('');
    setNote('');
    setActiveAction('none');
  };

  const handleWhatsApp = () => {
    const msg = createWhatsAppReminder(party, balance, lang);
    const cleanPhone = party.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xl flex items-center justify-center">
              {party.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {party.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                {party.phone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {party.phone}
                  </span>
                )}
                <span aria-hidden="true">·</span>
                <span>{PARTY_TYPES[party.type]?.[lang] || party.type}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title={lang === 'hi' ? 'खाता प्रिंट करें' : 'Print Ledger'}
              className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Balance Status Banner */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {lang === 'hi' ? 'वर्तमान बकाया स्थिति' : 'Current Net Balance'}
              </span>
              <div className={`text-3xl font-extrabold font-mono tabular-nums mt-0.5 ${
                isToReceive ? 'text-emerald-600 dark:text-emerald-400' :
                isToGive ? 'text-rose-600 dark:text-rose-400' :
                'text-slate-700 dark:text-slate-300'
              }`}>
                {formatRupee(Math.abs(balance))}
              </div>
              <p className="text-xs font-semibold mt-1">
                {isToReceive && (
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {lang === 'hi' ? '← आपको इनसे यह रकम लेनी है' : '← You will receive this amount'}
                  </span>
                )}
                {isToGive && (
                  <span className="text-rose-700 dark:text-rose-400">
                    {lang === 'hi' ? '→ आपको इन्हें यह रकम देनी है' : '→ You need to pay this amount'}
                  </span>
                )}
                {isSettled && (
                  <span className="text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {lang === 'hi' ? 'कोई बकाया नहीं है, पूरा हिसाब चुकता है' : 'All clear! Zero balance.'}
                  </span>
                )}
              </p>
            </div>

            {/* Quick Settle & Reminder Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {!isSettled && (
                <button
                  onClick={() => {
                    if (window.confirm(lang === 'hi' ? 'क्या आप पूरा हिसाब चुकता दर्ज करना चाहते हैं?' : 'Settle this full balance to zero?')) {
                      onSettleParty(party.id, balance);
                    }
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
                >
                  {t.actions.settle}
                </button>
              )}

              {isToReceive && party.phone && (
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'WhatsApp तगादा' : 'Send Reminder'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Add Form Section */}
        {activeAction !== 'none' ? (
          <form onSubmit={handleSubmit} className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                activeAction === 'you_gave' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {activeAction === 'you_gave' 
                  ? (lang === 'hi' ? 'आपने दिया (उधार / माल / पैसे)' : 'You Gave (Debit)')
                  : (lang === 'hi' ? 'आपको मिला (जमा / वापसी)' : 'You Got (Credit)')}
              </span>
              <button
                type="button"
                onClick={() => setActiveAction('none')}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {t.actions.cancel}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Amount */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.labels.amount} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    autoFocus
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-2 text-sm font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.labels.date}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              {/* Note / Description */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.labels.description}
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={lang === 'hi' ? 'उदा. नकद, माल या बिल' : 'e.g. Cash, Goods'}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveAction('none')}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium"
              >
                {t.actions.cancel}
              </button>
              <button
                type="submit"
                className={`px-4 py-1.5 text-xs font-semibold text-white rounded-lg shadow-2xs ${
                  activeAction === 'you_gave' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {t.actions.save}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center gap-3">
            <button
              onClick={() => setActiveAction('you_gave')}
              className="flex-1 max-w-xs flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
            >
              <Minus className="w-4 h-4 stroke-[3]" />
              <span>{lang === 'hi' ? 'मैंने दिया (- लेना है)' : 'You Gave (Debit)'}</span>
            </button>
            <button
              onClick={() => setActiveAction('you_got')}
              className="flex-1 max-w-xs flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{lang === 'hi' ? 'मुझे मिला (+ जमा हुआ)' : 'You Got (Credit)'}</span>
            </button>
          </div>
        )}

        {/* Ledger Transaction History List */}
        <div className="p-5 max-h-80 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 pb-1">
            <span>{lang === 'hi' ? 'खाता विवरण व इतिहास' : 'Statement Entries'}</span>
            <span>{partyHistory.length} {lang === 'hi' ? 'प्रविष्टियां' : 'records'}</span>
          </div>

          {partyHistory.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              {lang === 'hi' ? 'इस खाते में अभी कोई लेन-देन दर्ज नहीं है।' : 'No entries logged in this account yet.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              {partyHistory.map((ptx) => {
                const isGave = ptx.type === 'you_gave';
                return (
                  <div
                    key={ptx.id}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isGave ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                      }`}>
                        {isGave ? <ArrowUpRight className="w-4 h-4 stroke-[2.5]" /> : <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-white">
                          {isGave ? (lang === 'hi' ? 'आपने दिया' : 'You Gave') : (lang === 'hi' ? 'आपको मिला' : 'You Got')}
                          {ptx.note && <span className="font-normal text-slate-500 dark:text-slate-400 ml-1.5">({ptx.note})</span>}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {formatDateLocale(ptx.date, lang)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`text-sm font-bold font-mono tabular-nums ${
                        isGave ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {isGave ? '-' : '+'}{formatRupee(ptx.amount)}
                      </div>
                      <button
                        onClick={() => onDeleteTransaction(ptx.id)}
                        className="p-1 text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title={t.actions.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm(lang === 'hi' ? `क्या आप "${party.name}" का पूरा खाता हटाना चाहते हैं?` : `Delete party ${party.name}?`)) {
                onDeleteParty(party.id);
                onClose();
              }
            }}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
          >
            {lang === 'hi' ? 'खाता डिलीट करें' : 'Delete Account'}
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {lang === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
