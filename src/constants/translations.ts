import { CategoryId, PaymentMethod, PartyType } from '../types';

export const CATEGORIES: Record<CategoryId, { hi: string; en: string; icon: string; color: string }> = {
  groceries: { hi: 'राशन / किराना', en: 'Groceries', icon: 'ShoppingBag', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
  vegetables: { hi: 'सब्ज़ी व फल', en: 'Vegetables & Fruits', icon: 'Carrot', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' },
  dairy: { hi: 'दूध व डेयरी', en: 'Milk & Dairy', icon: 'Coffee', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' },
  bills: { hi: 'बिजली / मोबाइल / बिल', en: 'Bills & Utilities', icon: 'Zap', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/40 dark:text-yellow-400' },
  fuel: { hi: 'पेट्रोल / यात्रा', en: 'Fuel & Travel', icon: 'Fuel', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400' },
  rent: { hi: 'किराया (मकान/दुकान)', en: 'Rent', icon: 'Home', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400' },
  business: { hi: 'व्यापार / दुकान माल', en: 'Business / Goods', icon: 'Briefcase', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-400' },
  salary: { hi: 'वेतन / आमदनी', en: 'Salary / Income', icon: 'BadgeDollarSign', color: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300' },
  food: { hi: 'खाना / नाश्ता / होटल', en: 'Food & Dining', icon: 'Utensils', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400' },
  health: { hi: 'दवाई व डॉक्टर', en: 'Medical & Health', icon: 'HeartPulse', color: 'text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400' },
  education: { hi: 'पढ़ाई व स्कूल फीस', en: 'Education & Fees', icon: 'GraduationCap', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400' },
  personal: { hi: 'निजी खर्च व कपड़े', en: 'Personal & Shopping', icon: 'Sparkles', color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/40 dark:text-pink-400' },
  other: { hi: 'अन्य हिसाब', en: 'Other', icon: 'MoreHorizontal', color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300' }
};

export const PAYMENT_METHODS: Record<PaymentMethod, { hi: string; en: string }> = {
  cash: { hi: 'नकद (Cash)', en: 'Cash' },
  upi: { hi: 'UPI / PhonePe / GPay', en: 'UPI' },
  bank: { hi: 'बैंक ट्रांसफर (Bank)', en: 'Bank Transfer' },
  card: { hi: 'कार्ड (ATM/Card)', en: 'Debit/Credit Card' },
  other: { hi: 'अन्य', en: 'Other' }
};

export const PARTY_TYPES: Record<PartyType, { hi: string; en: string }> = {
  customer: { hi: 'ग्राहक (Customer)', en: 'Customer' },
  supplier: { hi: 'दुकानदार / सप्लायर', en: 'Supplier' },
  friend: { hi: 'दोस्त (Friend)', en: 'Friend' },
  family: { hi: 'रिश्तेदार (Family)', en: 'Family' }
};

export const TRANSLATIONS = {
  hi: {
    appName: 'हिसाब किताब',
    tagline: 'आपका डिजिटल खाता व खर्च डायरी',
    tabs: {
      cashbook: 'रोज़नामचा (खर्च-आय)',
      khata: 'उधार-जमा खाता',
      budget: 'मासिक बजट',
      reports: 'हिसाब रिपोर्ट'
    },
    actions: {
      addExpense: 'खर्च जोड़ें (-)',
      addIncome: 'कमाई जोड़ें (+)',
      addParty: 'नया ग्राहक/खाता जोड़ें',
      gaveMoney: 'मैंने दिया (- लेना है)',
      gotMoney: 'मुझे मिला (+ जमा हुआ)',
      voiceAdd: 'बोलकर हिसाब जोड़ें',
      calculator: 'कैलकुलेटर',
      exportPdf: 'विवरण डाउनलोड करें (PDF/CSV)',
      search: 'हिसाब खोजें...',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'बदलें',
      settle: 'खाता चुकता करें',
      sendReminder: 'WhatsApp पर तगादा / याद दिलाएं',
      clearAll: 'डेटा रीसेट करें',
      exportData: 'डेटा बैकअप लें (JSON)',
      importData: 'डेटा रिस्टोर करें'
    },
    labels: {
      totalIncome: 'कुल आमदनी (जमा)',
      totalExpense: 'कुल खर्च (नामे)',
      netBalance: 'शुद्ध बचत (हाथ में)',
      youWillGet: 'कुल लेना बाकी (उधार दिया)',
      youWillGive: 'कुल देना बाकी (जमा किया)',
      netKhataBalance: 'खाता शुद्ध बकाया',
      date: 'तारीख',
      amount: 'रकम (₹)',
      category: 'वर्ग / श्रेणी',
      paymentMethod: 'भुगतान का माध्यम',
      description: 'विवरण / नोट (जैसे: 2 किलो सेब, बिजली का बिल)',
      partyName: 'व्यक्ति या दुकान का नाम',
      phoneNumber: 'मोबाइल नंबर (WhatsApp के लिए)',
      partyType: 'खाता प्रकार',
      monthlyBudget: 'इस महीने का बजट',
      budgetSpent: 'बजट में से खर्च हुआ',
      budgetRemaining: 'शेष बचा बजट',
      allCategories: 'सभी वर्ग',
      allTypes: 'सभी प्रकार',
      filterToday: 'आज',
      filterThisWeek: 'इस हफ़्ते',
      filterThisMonth: 'इस महीने',
      filterAll: 'शुरू से अब तक',
      noTransactions: 'अभी तक कोई हिसाब नहीं लिखा गया है',
      noParties: 'कोई ग्राहक या खाता नहीं मिला',
      recentEntries: 'हाल का हिसाब-किताब',
      topSpending: 'सबसे ज़्यादा खर्च वाले वर्ग'
    }
  },
  en: {
    appName: 'Hisab Kitab',
    tagline: 'Smart Ledger & Daily Expense Book',
    tabs: {
      cashbook: 'Daily Cashbook',
      khata: 'Credit / Debit Khata',
      budget: 'Monthly Budget',
      reports: 'Reports & Analytics'
    },
    actions: {
      addExpense: 'Add Expense (-)',
      addIncome: 'Add Income (+)',
      addParty: 'Add New Contact/Party',
      gaveMoney: 'You Gave (- To Receive)',
      gotMoney: 'You Got (+ Received)',
      voiceAdd: 'Voice Entry',
      calculator: 'Calculator',
      exportPdf: 'Download Statement',
      search: 'Search entries...',
      save: 'Save Entry',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      settle: 'Settle Balance',
      sendReminder: 'Send WhatsApp Reminder',
      clearAll: 'Reset All Data',
      exportData: 'Backup Data (JSON)',
      importData: 'Restore Backup'
    },
    labels: {
      totalIncome: 'Total Income',
      totalExpense: 'Total Expenses',
      netBalance: 'Net Balance',
      youWillGet: 'You Will Get (To Receive)',
      youWillGive: 'You Will Give (To Pay)',
      netKhataBalance: 'Net Ledger Balance',
      date: 'Date',
      amount: 'Amount (₹)',
      category: 'Category',
      paymentMethod: 'Payment Mode',
      description: 'Description / Note',
      partyName: 'Name of Person / Shop',
      phoneNumber: 'Mobile Number',
      partyType: 'Relationship / Type',
      monthlyBudget: 'Monthly Budget',
      budgetSpent: 'Spent so far',
      budgetRemaining: 'Remaining Budget',
      allCategories: 'All Categories',
      allTypes: 'All Types',
      filterToday: 'Today',
      filterThisWeek: 'This Week',
      filterThisMonth: 'This Month',
      filterAll: 'All Time',
      noTransactions: 'No transactions recorded yet',
      noParties: 'No parties or contacts recorded yet',
      recentEntries: 'Recent Entries',
      topSpending: 'Top Spending Categories'
    }
  }
};
