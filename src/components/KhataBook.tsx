import React, { useState, useMemo } from 'react';
import { Party, PartyTransaction, Language, PartyType } from '../types';
import { TRANSLATIONS, PARTY_TYPES } from '../constants/translations';
import { formatRupee, createWhatsAppReminder } from '../utils/formatters';
import { 
  Users, 
  Search, 
  Plus, 
  Minus, 
  Phone, 
  ArrowUpRight, 
  ArrowDownLeft, 
  MessageCircle, 
  CheckCircle,
  ChevronRight,
  UserPlus,
  Share2
} from 'lucide-react';

interface KhataBookProps {
  parties: Party[];
  partyTransactions: PartyTransaction[];
  lang: Language;
  onSelectParty: (party: Party) => void;
  onAddParty: () => void;
  onQuickAddTransaction: (partyId: string, type: 'you_gave' | 'you_got') => void;
}

export const KhataBook: React.FC<KhataBookProps> = ({
  parties,
  partyTransactions,
  lang,
  onSelectParty,
  onAddParty,
  onQuickAddTransaction
}) => {
  const t = TRANSLATIONS[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<PartyType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'to_receive' | 'to_give' | 'settled'>('all');

  // Compute party balances
  // Balance convention: you_gave (+ to receive) vs you_got (- to pay / settled)
  const partyBalances = useMemo(() => {
    const balances: Record<string, { balance: number; lastDate: string; txCount: number }> = {};

    for (const p of parties) {
      balances[p.id] = { balance: 0, lastDate: '', txCount: 0 };
    }

    for (const ptx of partyTransactions) {
      if (!balances[ptx.partyId]) {
        balances[ptx.partyId] = { balance: 0, lastDate: ptx.date, txCount: 0 };
      }
      balances[ptx.partyId].txCount += 1;
      if (!balances[ptx.partyId].lastDate || ptx.date > balances[ptx.partyId].lastDate) {
        balances[ptx.partyId].lastDate = ptx.date;
      }

      if (ptx.type === 'you_gave') {
        // You gave them loan or goods => they owe you (positive)
        balances[ptx.partyId].balance += ptx.amount;
      } else {
        // You received money or goods => balance decreases
        balances[ptx.partyId].balance -= ptx.amount;
      }
    }

    return balances;
  }, [parties, partyTransactions]);

  // Aggregate overall ledger metrics
  const overallMetrics = useMemo(() => {
    let toReceive = 0; // lena hai
    let toGive = 0;    // dena hai

    for (const p of parties) {
      const bal = partyBalances[p.id]?.balance || 0;
      if (bal > 0) {
        toReceive += bal;
      } else if (bal < 0) {
        toGive += Math.abs(bal);
      }
    }

    return {
      toReceive,
      toGive,
      net: toReceive - toGive
    };
  }, [parties, partyBalances]);

  // Filtered parties
  const filteredParties = useMemo(() => {
    return parties.filter(p => {
      // Type filter
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;

      const bal = partyBalances[p.id]?.balance || 0;
      // Status filter
      if (statusFilter === 'to_receive' && bal <= 0) return false;
      if (statusFilter === 'to_give' && bal >= 0) return false;
      if (statusFilter === 'settled' && bal !== 0) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = p.name.toLowerCase().includes(q);
        const phoneMatch = p.phone.includes(q);
        const notesMatch = (p.notes || '').toLowerCase().includes(q);
        if (!nameMatch && !phoneMatch && !notesMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by absolute balance descending (highest priority debts first)
      const balA = Math.abs(partyBalances[a.id]?.balance || 0);
      const balB = Math.abs(partyBalances[b.id]?.balance || 0);
      return balB - balA;
    });
  }, [parties, partyBalances, typeFilter, statusFilter, searchQuery]);

  const handleWhatsAppShare = (party: Party, balance: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = createWhatsAppReminder(party, balance, lang);
    const cleanPhone = party.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top 3 KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* You will get (Lena hai) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {t.labels.youWillGet}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {formatRupee(overallMetrics.toReceive)}
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'hi' ? 'ग्राहकों / दोस्तों से वसूलना बाकी' : 'To collect from customers & friends'}
          </p>
        </div>

        {/* You will give (Dena hai) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              {t.labels.youWillGive}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
            {formatRupee(overallMetrics.toGive)}
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'hi' ? 'सप्लायर / दूसरों को चुकाना है' : 'To pay suppliers & lenders'}
          </p>
        </div>

        {/* Net Khata Position */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t.labels.netKhataBalance}
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums ${
            overallMetrics.net >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatRupee(overallMetrics.net)}
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
            {overallMetrics.net >= 0 
              ? (lang === 'hi' ? 'शुद्ध रूप से बाजार से लेना अधिक है' : 'Net positive market credit')
              : (lang === 'hi' ? 'देने की देनदारी अधिक है' : 'Net payable balance')}
          </p>
        </div>
      </div>

      {/* Action Bar & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'hi' ? 'ग्राहक, दोस्त या मोबाइल नंबर खोजें...' : 'Search by name or phone...'}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Add New Party Button */}
          <button
            onClick={onAddParty}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.actions.addParty}</span>
          </button>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {lang === 'hi' ? 'सभी खाते' : 'All'}
            </button>
            <button
              onClick={() => setStatusFilter('to_receive')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                statusFilter === 'to_receive'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {lang === 'hi' ? 'लेना बाकी' : 'To Receive'}
            </button>
            <button
              onClick={() => setStatusFilter('to_give')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                statusFilter === 'to_give'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {lang === 'hi' ? 'देना बाकी' : 'To Give'}
            </button>
            <button
              onClick={() => setStatusFilter('settled')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                statusFilter === 'settled'
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {lang === 'hi' ? 'चुकता' : 'Settled'}
            </button>
          </div>

          {/* Party Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as PartyType | 'all')}
            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium focus:outline-hidden"
          >
            <option value="all">{lang === 'hi' ? 'सभी प्रकार के खाते' : 'All Relationship Types'}</option>
            {Object.entries(PARTY_TYPES).map(([typeKey, info]) => (
              <option key={typeKey} value={typeKey}>
                {info[lang]}
              </option>
            ))}
          </select>

          <span className="text-slate-400 dark:text-slate-500 text-[11px] ml-auto">
            {filteredParties.length} {lang === 'hi' ? 'खाते' : 'parties'}
          </span>
        </div>
      </div>

      {/* Parties List */}
      {filteredParties.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Users className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            {t.labels.noParties}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
            {lang === 'hi'
              ? 'दुकानदार, ग्राहक या दोस्त का नाम जोड़ें और उनके साथ का उधार-जमा हिसाब तुरंत दर्ज करें।'
              : 'Add your contacts, customers, or suppliers to keep track of credits and debits.'}
          </p>
          <button
            onClick={onAddParty}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.actions.addParty}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredParties.map((party) => {
            const data = partyBalances[party.id] || { balance: 0, lastDate: '', txCount: 0 };
            const balance = data.balance;
            const isToReceive = balance > 0;
            const isToGive = balance < 0;
            const isSettled = balance === 0;

            // Generate initial
            const initial = party.name.trim().charAt(0) || 'P';

            return (
              <div
                key={party.id}
                onClick={() => onSelectParty(party)}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Avatar & Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-lg flex items-center justify-center shrink-0">
                      {initial}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {party.name}
                      </h4>

                      {/* Unboxed Metadata */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        {party.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {party.phone}
                          </span>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>{PARTY_TYPES[party.type]?.[lang] || party.type}</span>
                        {party.address && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate max-w-[120px]">{party.address}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Balance Status */}
                  <div className="text-right shrink-0">
                    <div className={`text-base font-bold font-mono tabular-nums ${
                      isToReceive ? 'text-emerald-600 dark:text-emerald-400' :
                      isToGive ? 'text-rose-600 dark:text-rose-400' :
                      'text-slate-500 dark:text-slate-400'
                    }`}>
                      {formatRupee(Math.abs(balance))}
                    </div>
                    <div className="text-[11px] font-semibold mt-0.5">
                      {isToReceive && (
                        <span className="text-emerald-700 dark:text-emerald-400">
                          {lang === 'hi' ? 'लेना है' : 'To Receive'}
                        </span>
                      )}
                      {isToGive && (
                        <span className="text-rose-700 dark:text-rose-400">
                          {lang === 'hi' ? 'देना है' : 'To Pay'}
                        </span>
                      )}
                      {isSettled && (
                        <span className="text-slate-400 flex items-center justify-end gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          {lang === 'hi' ? 'चुकता' : 'Settled'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Strip on Card */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5">
                    {/* Quick Give Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAddTransaction(party.id, 'you_gave');
                      }}
                      className="px-2.5 py-1 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-md font-semibold transition-colors flex items-center gap-1"
                    >
                      <Minus className="w-3 h-3 stroke-[3]" />
                      <span>{lang === 'hi' ? 'दिया' : 'Gave'}</span>
                    </button>

                    {/* Quick Receive Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAddTransaction(party.id, 'you_got');
                      }}
                      className="px-2.5 py-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-md font-semibold transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>{lang === 'hi' ? 'मिला' : 'Got'}</span>
                    </button>

                    {/* WhatsApp Reminder Button (if balance to receive > 0 and phone exists) */}
                    {isToReceive && party.phone && (
                      <button
                        onClick={(e) => handleWhatsAppShare(party, balance, e)}
                        title={lang === 'hi' ? 'WhatsApp पर तगादा भेजें' : 'Send WhatsApp Reminder'}
                        className="px-2 py-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-md transition-colors flex items-center gap-1 font-medium"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-600" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors font-medium">
                    <span>{lang === 'hi' ? 'खाता बही' : 'Ledger'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
