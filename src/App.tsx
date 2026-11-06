import React, { useState, useEffect } from 'react';
import { 
  Transaction, 
  Party, 
  PartyTransaction, 
  ActiveTab, 
  Language, 
  TransactionType 
} from './types';
import { 
  INITIAL_TRANSACTIONS, 
  INITIAL_PARTIES, 
  INITIAL_PARTY_TRANSACTIONS 
} from './constants/initialData';
import { Header } from './components/Header';
import { DailyCashbook } from './components/DailyCashbook';
import { KhataBook } from './components/KhataBook';
import { PartyDetailModal } from './components/PartyDetailModal';
import { BudgetAndReports } from './components/BudgetAndReports';
import { TransactionModal } from './components/TransactionModal';
import { AddPartyModal } from './components/AddPartyModal';
import { QuickCalculator } from './components/QuickCalculator';
import { ExportModal } from './components/ExportModal';
import { VoiceInputModal } from './components/VoiceInputModal';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('hisab_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Language state (defaulting to Hindi for native experience)
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('hisab_lang');
    return (saved === 'en' || saved === 'hi') ? saved : 'hi';
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('cashbook');

  // Transactions State with LocalStorage
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('hisab_transactions');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_TRANSACTIONS;
  });

  // Parties & Ledger Contacts
  const [parties, setParties] = useState<Party[]>(() => {
    try {
      const saved = localStorage.getItem('hisab_parties');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_PARTIES;
  });

  // Party Transactions (You gave / You got)
  const [partyTransactions, setPartyTransactions] = useState<PartyTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('hisab_party_transactions');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_PARTY_TRANSACTIONS;
  });

  // Monthly Budget Target
  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('hisab_monthly_budget');
      if (saved) return Number(saved);
    } catch {
      // ignore
    }
    return 35000;
  });

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [defaultTxType, setDefaultTxType] = useState<TransactionType>('expense');

  const [isAddPartyModalOpen, setIsAddPartyModalOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Sync dark class on document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('hisab_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  // Sync language
  useEffect(() => {
    localStorage.setItem('hisab_lang', lang);
  }, [lang]);

  // Persist state
  useEffect(() => {
    localStorage.setItem('hisab_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('hisab_parties', JSON.stringify(parties));
  }, [parties]);

  useEffect(() => {
    localStorage.setItem('hisab_party_transactions', JSON.stringify(partyTransactions));
  }, [partyTransactions]);

  useEffect(() => {
    localStorage.setItem('hisab_monthly_budget', monthlyBudget.toString());
  }, [monthlyBudget]);

  // Transaction Handlers
  const handleOpenAddTx = (type: TransactionType = 'expense') => {
    setEditingTx(null);
    setDefaultTxType(type);
    setIsTxModalOpen(true);
  };

  const handleOpenEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setDefaultTxType(tx.type);
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>, 
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions(prev => prev.map(item => item.id === existingId ? { ...item, ...txData } : item));
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now()
      };
      setTransactions(prev => [newTx, ...prev]);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(item => item.id !== id));
  };

  // Party Handlers
  const handleAddParty = (
    partyData: Omit<Party, 'id' | 'createdAt'>,
    openingBalance?: { type: 'you_gave' | 'you_got'; amount: number }
  ) => {
    const partyId = `party-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newParty: Party = {
      ...partyData,
      id: partyId,
      createdAt: Date.now()
    };
    setParties(prev => [newParty, ...prev]);

    if (openingBalance && openingBalance.amount > 0) {
      const openingTx: PartyTransaction = {
        id: `ptx-${Date.now()}`,
        partyId,
        type: openingBalance.type,
        amount: openingBalance.amount,
        date: new Date().toISOString().split('T')[0],
        note: lang === 'hi' ? 'पुराना बकाया हिसाब (Opening Balance)' : 'Opening Balance',
        createdAt: Date.now()
      };
      setPartyTransactions(prev => [openingTx, ...prev]);
    }
  };

  const handleDeleteParty = (partyId: string) => {
    setParties(prev => prev.filter(p => p.id !== partyId));
    setPartyTransactions(prev => prev.filter(ptx => ptx.partyId !== partyId));
    if (selectedParty?.id === partyId) {
      setSelectedParty(null);
    }
  };

  const handleAddPartyTransaction = (
    partyId: string, 
    type: 'you_gave' | 'you_got', 
    amount: number, 
    note: string, 
    date: string
  ) => {
    const newPtx: PartyTransaction = {
      id: `ptx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      partyId,
      type,
      amount,
      note,
      date,
      createdAt: Date.now()
    };
    setPartyTransactions(prev => [newPtx, ...prev]);
  };

  const handleDeletePartyTransaction = (id: string) => {
    setPartyTransactions(prev => prev.filter(ptx => ptx.id !== id));
  };

  const handleSettleParty = (partyId: string, currentBalance: number) => {
    if (currentBalance === 0) return;
    
    // If balance > 0 (they owe you), settling means you got full money
    // If balance < 0 (you owe them), settling means you gave full money
    const settleType = currentBalance > 0 ? 'you_got' : 'you_gave';
    const amount = Math.abs(currentBalance);

    handleAddPartyTransaction(
      partyId,
      settleType,
      amount,
      lang === 'hi' ? 'पूरा हिसाब चुकता किया गया (Settled)' : 'Full settlement',
      new Date().toISOString().split('T')[0]
    );
  };

  // Full Backup Export as JSON
  const handleExportData = () => {
    const backup = {
      transactions,
      parties,
      partyTransactions,
      monthlyBudget,
      version: 1,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hisab_kitab_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Full Backup Import from JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        if (Array.isArray(data.transactions) && Array.isArray(data.parties)) {
          setTransactions(data.transactions);
          setParties(data.parties);
          setPartyTransactions(data.partyTransactions || []);
          if (data.monthlyBudget) setMonthlyBudget(data.monthlyBudget);
          alert(lang === 'hi' ? 'डेटा सफलतापूर्वक रिस्टोर हो गया!' : 'Data restored successfully!');
        } else {
          alert(lang === 'hi' ? 'फ़ाइल का प्रारूप सही नहीं है।' : 'Invalid file format.');
        }
      } catch {
        alert(lang === 'hi' ? 'फ़ाइल पढ़ने में त्रुटि हुई।' : 'Error parsing backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to default sample
  const handleResetData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setParties(INITIAL_PARTIES);
    setPartyTransactions(INITIAL_PARTY_TRANSACTIONS);
    setMonthlyBudget(35000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Header following Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenNewTransaction={handleOpenAddTx}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Tab 1: Daily Roznamcha (Cashbook) */}
        {activeTab === 'cashbook' && (
          <DailyCashbook
            transactions={transactions}
            lang={lang}
            onAddTransaction={handleOpenAddTx}
            onEditTransaction={handleOpenEditTx}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenVoice={() => setIsVoiceModalOpen(true)}
            onOpenExport={() => setIsExportModalOpen(true)}
            monthlyBudget={monthlyBudget}
          />
        )}

        {/* Tab 2: Udhar-Jama Khata Book */}
        {activeTab === 'khata' && (
          <KhataBook
            parties={parties}
            partyTransactions={partyTransactions}
            lang={lang}
            onSelectParty={(party) => setSelectedParty(party)}
            onAddParty={() => setIsAddPartyModalOpen(true)}
            onQuickAddTransaction={(partyId, type) => {
              const party = parties.find(p => p.id === partyId);
              if (party) setSelectedParty(party);
            }}
          />
        )}

        {/* Tab 3: Monthly Budget */}
        {activeTab === 'budget' && (
          <BudgetAndReports
            transactions={transactions}
            monthlyBudget={monthlyBudget}
            onUpdateBudget={(val) => setMonthlyBudget(val)}
            lang={lang}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onResetData={handleResetData}
          />
        )}

        {/* Tab 4: Reports & Analytics */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <BudgetAndReports
              transactions={transactions}
              monthlyBudget={monthlyBudget}
              onUpdateBudget={(val) => setMonthlyBudget(val)}
              lang={lang}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onResetData={handleResetData}
            />
          </div>
        )}

      </main>

      {/* Modals & Drawers */}
      
      {/* 1. Add/Edit Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        initialTransaction={editingTx}
        defaultType={defaultTxType}
        lang={lang}
      />

      {/* 2. Add Contact/Party Modal */}
      <AddPartyModal
        isOpen={isAddPartyModalOpen}
        onClose={() => setIsAddPartyModalOpen(false)}
        onSave={handleAddParty}
        lang={lang}
      />

      {/* 3. Party Detail / Statement Modal */}
      {selectedParty && (
        <PartyDetailModal
          party={selectedParty}
          partyTransactions={partyTransactions}
          lang={lang}
          onClose={() => setSelectedParty(null)}
          onAddTransaction={handleAddPartyTransaction}
          onDeleteTransaction={handleDeletePartyTransaction}
          onSettleParty={handleSettleParty}
          onDeleteParty={handleDeleteParty}
        />
      )}

      {/* 4. Quick In-App Calculator */}
      <QuickCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        lang={lang}
        onUseAmount={(amt) => {
          setDefaultTxType('expense');
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
      />

      {/* 5. Statement Print & CSV Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        lang={lang}
      />

      {/* 6. Voice Recognition Modal */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onApplyVoiceTransaction={(txData) => {
          handleSaveTransaction(txData);
        }}
        lang={lang}
      />

      {/* Quiet Footer */}
      <footer className="mt-12 py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {lang === 'hi' 
              ? 'स्मार्ट हिसाब किताब — आपका सुरक्षित व सरल डिजिटल खाता' 
              : 'Smart Hisab Kitab — Secure & Simple Digital Ledger'}
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            {lang === 'hi' ? 'डेटा आपके डिवाइस में सुरक्षित संग्रहित' : '100% Client-Side Local Storage'}
          </span>
        </div>
      </footer>

    </div>
  );
}
