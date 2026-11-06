import { CategoryId, Language, Transaction, Party, PartyTransaction } from '../types';

export function formatRupee(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format to en-IN style
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(absAmount);

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatDateLocale(dateString: string, lang: Language): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    
    const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);
    
    if (diffDays === 0) {
      return lang === 'hi' ? 'आज' : 'Today';
    } else if (diffDays === 1) {
      return lang === 'hi' ? 'कल' : 'Yesterday';
    }
    
    return date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

// Generate friendly WhatsApp message for collecting Udhar
export function createWhatsAppReminder(party: Party, balance: number, lang: Language): string {
  const absBal = formatRupee(Math.abs(balance));
  
  if (lang === 'hi') {
    return `नमस्ते ${party.name} जी,\n\nयह आपके हिसाब-किताब की विनम्र याद दिलाने के लिए है। आपका कुल बकाया ${absBal} लेना बाकी है।\nकृपया जल्द भुगतान करने की कृपा करें।\nधन्यवाद! 🙏`;
  } else {
    return `Hello ${party.name},\n\nThis is a polite reminder regarding your pending ledger balance of ${absBal}. Kindly arrange the payment at your earliest convenience.\nThank you!`;
  }
}

// Heuristic voice transcript parser for Hindi and English hisab commands
export function parseVoiceInput(text: string): { amount: number | null; description: string; type: 'expense' | 'income'; category?: CategoryId } {
  let cleaned = text.trim();
  let type: 'expense' | 'income' = 'expense';
  
  const incomeKeywords = ['मिला', 'आया', 'कमाई', 'वेतन', 'सैलरी', 'बिक्री', 'क्रेडिट', 'received', 'got', 'salary', 'income', 'sale'];
  for (const kw of incomeKeywords) {
    if (cleaned.toLowerCase().includes(kw)) {
      type = 'income';
      break;
    }
  }

  // Find amount: Look for digits or Hindi number words
  const digitMatch = cleaned.match(/\d+/g);
  let amount: number | null = null;
  if (digitMatch && digitMatch.length > 0) {
    amount = parseInt(digitMatch[0], 10);
  } else {
    // Basic Hindi number words check
    const hindiNumbers: Record<string, number> = {
      'सौ': 100, 'दो सौ': 200, 'तीन सौ': 300, 'चार सौ': 400, 'पांच सौ': 500,
      'हजार': 1000, 'दो हजार': 2000, 'पांच हजार': 5000, 'दस हजार': 10000,
      'पचास': 50, 'साठ': 60, 'सत्तर': 70, 'अस्सी': 80, 'नब्बे': 90
    };
    for (const [word, val] of Object.entries(hindiNumbers)) {
      if (cleaned.includes(word)) {
        amount = val;
        break;
      }
    }
  }

  // Guess category
  let category: CategoryId = 'other';
  const lower = cleaned.toLowerCase();
  if (lower.includes('सब्जी') || lower.includes('सब्ज़ी') || lower.includes('फल') || lower.includes('fruit') || lower.includes('veg')) {
    category = 'vegetables';
  } else if (lower.includes('राशन') || lower.includes('किराना') || lower.includes('grocery') || lower.includes('आटा') || lower.includes('दाल')) {
    category = 'groceries';
  } else if (lower.includes('दूध') || lower.includes('milk') || lower.includes('डेयरी') || lower.includes('दही')) {
    category = 'dairy';
  } else if (lower.includes('पेट्रोल') || lower.includes('डीजल') || lower.includes('petrol') || lower.includes('diesel') || lower.includes('किराया')) {
    category = 'fuel';
  } else if (lower.includes('बिल') || lower.includes('बिजली') || lower.includes('पानी') || lower.includes('रिचार्ज') || lower.includes('bill')) {
    category = 'bills';
  } else if (lower.includes('दवाई') || lower.includes('डॉक्टर') || lower.includes('medicine') || lower.includes('medical')) {
    category = 'health';
  } else if (lower.includes('खाना') || lower.includes('होटल') || lower.includes('चाय') || lower.includes('नाश्ता') || lower.includes('tea') || lower.includes('food')) {
    category = 'food';
  } else if (lower.includes('सैलरी') || lower.includes('वेतन') || lower.includes('salary')) {
    category = 'salary';
    type = 'income';
  }

  return {
    amount,
    description: cleaned,
    type,
    category
  };
}

// Export CSV string
export function exportToCsv(transactions: Transaction[], lang: Language): string {
  const headers = lang === 'hi' 
    ? ['तारीख', 'प्रकार', 'रकम (रुपये)', 'वर्ग', 'विवरण', 'भुगतान माध्यम', 'नोट', 'बिल नंबर']
    : ['Date', 'Type', 'Amount (INR)', 'Category', 'Description', 'Payment Method', 'Note', 'Bill No'];
  
  const rows = transactions.map(tx => [
    tx.date,
    tx.type === 'income' ? (lang === 'hi' ? 'जमा (Income)' : 'Income') : (lang === 'hi' ? 'नामे (Expense)' : 'Expense'),
    tx.amount,
    tx.category,
    `"${(tx.description || '').replace(/"/g, '""')}"`,
    tx.paymentMethod,
    `"${(tx.note || '').replace(/"/g, '""')}"`,
    tx.billNumber || ''
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
