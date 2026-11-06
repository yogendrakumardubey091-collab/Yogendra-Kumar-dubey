import React, { useState } from 'react';
import { Party, PartyType, Language } from '../types';
import { TRANSLATIONS, PARTY_TYPES } from '../constants/translations';
import { X, UserPlus, Phone, MapPin, FileText } from 'lucide-react';

interface AddPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (party: Omit<Party, 'id' | 'createdAt'>, openingBalance?: { type: 'you_gave' | 'you_got'; amount: number }) => void;
  lang: Language;
}

export const AddPartyModal: React.FC<AddPartyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  lang
}) => {
  const t = TRANSLATIONS[lang];
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<PartyType>('customer');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Opening balance fields
  const [hasOpeningBalance, setHasOpeningBalance] = useState(false);
  const [openingType, setOpeningType] = useState<'you_gave' | 'you_got'>('you_gave');
  const [openingAmount, setOpeningAmount] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let opening: { type: 'you_gave' | 'you_got'; amount: number } | undefined = undefined;
    if (hasOpeningBalance) {
      const num = parseFloat(openingAmount);
      if (!isNaN(num) && num > 0) {
        opening = { type: openingType, amount: num };
      }
    }

    onSave(
      {
        name: name.trim(),
        phone: phone.trim(),
        type,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined
      },
      opening
    );

    // Reset
    setName('');
    setPhone('');
    setType('customer');
    setAddress('');
    setNotes('');
    setHasOpeningBalance(false);
    setOpeningAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden my-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {lang === 'hi' ? 'नया खाता / ग्राहक जोड़ें' : 'Add New Contact/Party'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Party Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.labels.partyName} *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={lang === 'hi' ? 'जैसे: विजय वर्मा, किराना स्टोर' : 'e.g. Ramesh Kumar'}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.labels.phoneNumber}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10 अंकों का मोबाइल नंबर"
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {lang === 'hi' ? 'WhatsApp पर पेमेंट का तगादा / रसीद भेजने के लिए काम आएगा' : 'Used for sending payment reminders on WhatsApp'}
            </p>
          </div>

          {/* Party Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.labels.partyType}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PARTY_TYPES).map(([typeKey, info]) => (
                <button
                  type="button"
                  key={typeKey}
                  onClick={() => setType(typeKey as PartyType)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all text-left ${
                    type === typeKey
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {info[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Address & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {lang === 'hi' ? 'पता / दुकान (ऐच्छिक)' : 'Address (Optional)'}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="उदा. मेन रोड, दुकान 4"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {lang === 'hi' ? 'विशेष टिप्पणी (ऐच्छिक)' : 'Notes'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="उदा. पुराना ग्राहक"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Optional Opening Balance */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={hasOpeningBalance}
                onChange={(e) => setHasOpeningBalance(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>{lang === 'hi' ? 'पुराना बकाया हिसाब जोड़ें (Opening Balance)' : 'Add Opening Balance'}</span>
            </label>

            {hasOpeningBalance && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setOpeningType('you_gave')}
                    className={`py-1.5 rounded-md font-semibold transition-colors ${
                      openingType === 'you_gave'
                        ? 'bg-rose-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {lang === 'hi' ? 'मुझे लेना है (- दिया)' : 'To Receive (Gave)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpeningType('you_got')}
                    className={`py-1.5 rounded-md font-semibold transition-colors ${
                      openingType === 'you_got'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {lang === 'hi' ? 'मुझे देना है (+ मिला)' : 'To Pay (Got)'}
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={openingAmount}
                    onChange={(e) => setOpeningAmount(e.target.value)}
                    placeholder="रकम दर्ज करें"
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
            >
              {lang === 'hi' ? 'खाता बनाएं' : 'Create Account'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
