export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'cash' | 'upi' | 'bank' | 'card' | 'other';

export type CategoryId = 
  | 'groceries'     // राशन/किराना
  | 'vegetables'    // सब्ज़ी व फल
  | 'dairy'         // दूध व डेयरी
  | 'bills'         // बिजली, पानी, रिचार्ज
  | 'fuel'          // पेट्रोल व यात्रा
  | 'rent'          // मकान या दुकान किराया
  | 'business'      // दुकान/माल खरीद
  | 'salary'        // तनख्वाह / आमदनी
  | 'food'          // होटल, चाय, नाश्ता
  | 'health'        // दवाई व डॉक्टर
  | 'education'     // बच्चों की पढ़ाई
  | 'personal'      // निजी खर्च
  | 'other';        // अन्य

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: CategoryId;
  description: string;
  date: string; // ISO string or YYYY-MM-DD
  paymentMethod: PaymentMethod;
  note?: string;
  billNumber?: string;
  createdAt: number;
}

export type PartyType = 'customer' | 'supplier' | 'friend' | 'family';

export interface PartyTransaction {
  id: string;
  partyId: string;
  type: 'you_gave' | 'you_got'; // you_gave = आपने दिया (Debit/उधार दिया), you_got = आपको मिला (Credit/जमा हुआ)
  amount: number;
  date: string;
  note: string;
  billNumber?: string;
  createdAt: number;
}

export interface Party {
  id: string;
  name: string;
  phone: string;
  type: PartyType;
  address?: string;
  notes?: string;
  createdAt: number;
}

export interface MonthlyBudget {
  month: string; // YYYY-MM
  amount: number;
}

export type ActiveTab = 'cashbook' | 'khata' | 'budget' | 'reports';

export type Language = 'hi' | 'en';
