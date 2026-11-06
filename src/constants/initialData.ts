import { Transaction, Party, PartyTransaction } from '../types';

const now = new Date();
const formatDate = (daysAgo: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'income',
    amount: 45000,
    category: 'salary',
    description: 'महीने का वेतन / तनख्वाह (Salary)',
    date: formatDate(5),
    paymentMethod: 'bank',
    note: 'खाते में क्रेडिट हुआ',
    createdAt: Date.now() - 5 * 86400000
  },
  {
    id: 'tx-2',
    type: 'expense',
    amount: 3200,
    category: 'groceries',
    description: 'महीने का राशन (आटा, दाल, चावल, तेल)',
    date: formatDate(4),
    paymentMethod: 'upi',
    note: 'राशन भंडार से लिया',
    billNumber: 'BILL-402',
    createdAt: Date.now() - 4 * 86400000
  },
  {
    id: 'tx-3',
    type: 'expense',
    amount: 1450,
    category: 'bills',
    description: 'बिजली का बिल भुगतान (Electricity Bill)',
    date: formatDate(3),
    paymentMethod: 'upi',
    note: 'GPay से भरा',
    createdAt: Date.now() - 3 * 86400000
  },
  {
    id: 'tx-4',
    type: 'expense',
    amount: 850,
    category: 'fuel',
    description: 'बाइक में पेट्रोल (Bike Petrol)',
    date: formatDate(2),
    paymentMethod: 'cash',
    createdAt: Date.now() - 2 * 86400000
  },
  {
    id: 'tx-5',
    type: 'expense',
    amount: 380,
    category: 'vegetables',
    description: 'ताज़ी सब्ज़ी और फल (मंडी से)',
    date: formatDate(1),
    paymentMethod: 'cash',
    note: 'टमाटर, आलू, प्याज और केला',
    createdAt: Date.now() - 1 * 86400000
  },
  {
    id: 'tx-6',
    type: 'income',
    amount: 3500,
    category: 'business',
    description: 'दुकान से माल की नकद बिक्री',
    date: formatDate(1),
    paymentMethod: 'cash',
    createdAt: Date.now() - 1 * 86400000 + 1000
  },
  {
    id: 'tx-7',
    type: 'expense',
    amount: 250,
    category: 'food',
    description: 'शाम की चाय और समोसे (चाय नाश्ता)',
    date: formatDate(0),
    paymentMethod: 'upi',
    createdAt: Date.now() - 2000000
  },
  {
    id: 'tx-8',
    type: 'expense',
    amount: 1200,
    category: 'dairy',
    description: 'महीने का दूध का हिसाब',
    date: formatDate(0),
    paymentMethod: 'cash',
    note: 'डेयरी वाले को भुगतान किया',
    createdAt: Date.now() - 1000000
  }
];

export const INITIAL_PARTIES: Party[] = [
  {
    id: 'party-1',
    name: 'रमेश कुमार (किराना स्टोर)',
    phone: '9876543210',
    type: 'supplier',
    address: 'बाज़ार गली नं 4',
    notes: 'दुकान का राशन का खाता',
    createdAt: Date.now() - 20 * 86400000
  },
  {
    id: 'party-2',
    name: 'सोनू शर्मा (दोस्त)',
    phone: '9823456781',
    type: 'friend',
    address: 'मॉडल टाउन',
    notes: 'जरूरत के लिए पैसे दिए थे',
    createdAt: Date.now() - 15 * 86400000
  },
  {
    id: 'party-3',
    name: 'वर्मा जी (ग्राहक)',
    phone: '9811223344',
    type: 'customer',
    address: 'दुकान नंबर 12',
    createdAt: Date.now() - 10 * 86400000
  }
];

export const INITIAL_PARTY_TRANSACTIONS: PartyTransaction[] = [
  {
    id: 'ptx-1',
    partyId: 'party-1',
    type: 'you_got', // You got goods / owe them money, or paid them
    amount: 2500,
    date: formatDate(6),
    note: 'सामान लिया था उधार',
    createdAt: Date.now() - 6 * 86400000
  },
  {
    id: 'ptx-2',
    partyId: 'party-1',
    type: 'you_gave', // You gave cash towards settlement
    amount: 1500,
    date: formatDate(2),
    note: 'नकद भुगतान किया',
    createdAt: Date.now() - 2 * 86400000
  },
  {
    id: 'ptx-3',
    partyId: 'party-2',
    type: 'you_gave', // You gave friend loan
    amount: 5000,
    date: formatDate(12),
    note: 'इमरजेंसी में उधार दिया था',
    createdAt: Date.now() - 12 * 86400000
  },
  {
    id: 'ptx-4',
    partyId: 'party-2',
    type: 'you_got', // Friend returned part
    amount: 2000,
    date: formatDate(3),
    note: 'Google Pay से वापस मिले',
    createdAt: Date.now() - 3 * 86400000
  },
  {
    id: 'ptx-5',
    partyId: 'party-3',
    type: 'you_gave', // Customer took goods worth 1800
    amount: 1800,
    date: formatDate(4),
    note: 'दुकान से 2 बोरी माल लिया',
    createdAt: Date.now() - 4 * 86400000
  }
];
