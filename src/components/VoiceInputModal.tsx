import React, { useState, useEffect, useRef } from 'react';
import { Language, Transaction, CategoryId } from '../types';
import { TRANSLATIONS, CATEGORIES } from '../constants/translations';
import { parseVoiceInput, formatRupee } from '../utils/formatters';
import { X, Mic, MicOff, Check, AlertCircle, Sparkles } from 'lucide-react';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVoiceTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  lang: Language;
}

// Extend Window interface for Web Speech API recognition
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onApplyVoiceTransaction,
  lang
}) => {
  const t = TRANSLATIONS[lang];
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualText, setManualText] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [parsedData, setParsedData] = useState<{ amount: number | null; description: string; type: 'expense' | 'income'; category?: CategoryId } | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    // Check speech recognition support
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition || 
                              (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
        setParsedData(parseVoiceInput(currentText));
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [lang]);

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setManualText('');
      setParsedData(null);
      // Auto-start listening if supported
      if (recognitionRef.current && isSupported) {
        try {
          recognitionRef.current.start();
        } catch {
          // already started or ignored
        }
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    }
  }, [isOpen, isSupported]);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch {
        // restart
      }
    }
  };

  const handleManualParse = (text: string) => {
    setManualText(text);
    setTranscript(text);
    setParsedData(parseVoiceInput(text));
  };

  const handleConfirm = () => {
    if (!parsedData || !parsedData.amount) return;

    onApplyVoiceTransaction({
      type: parsedData.type,
      amount: parsedData.amount,
      category: parsedData.category || 'other',
      description: parsedData.description || (parsedData.type === 'income' ? 'आमदनी' : 'दैनिक खर्च'),
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {lang === 'hi' ? 'बोलकर हिसाब जोड़ें' : 'Voice Entry'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center space-y-5">
          {/* Big Mic Button */}
          <div className="flex flex-col items-center justify-center">
            <button
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-rose-500 text-white scale-110 shadow-lg shadow-rose-500/30 ring-8 ring-rose-100 dark:ring-rose-950/40'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
              }`}
            >
              {isListening ? (
                <Mic className="w-8 h-8 animate-pulse" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>

            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-3">
              {isListening 
                ? (lang === 'hi' ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now') 
                : (lang === 'hi' ? 'माइक दबाकर बोलें' : 'Tap microphone to speak')}
            </span>
          </div>

          {/* Example prompt hints */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-500 dark:text-slate-400 text-left space-y-1">
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              {lang === 'hi' ? 'ऐसे बोल सकते हैं:' : 'Examples:'}
            </div>
            <div>• "{lang === 'hi' ? 'पांच सौ रुपये सब्ज़ी के लिए खर्च किए' : 'Spent 500 rs on groceries'}"</div>
            <div>• "{lang === 'hi' ? 'दो हजार रुपये दुकान की बिक्री से मिले' : 'Got 2000 rs shop sales'}"</div>
            <div>• "{lang === 'hi' ? 'तीन सौ पचास रुपये पेट्रोल डलवाया' : '350 rs bike fuel'}"</div>
          </div>

          {/* Transcript / Result */}
          {transcript && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-left space-y-2">
              <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                {lang === 'hi' ? 'सुना गया विवरण:' : 'Transcribed:'}
              </div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                "{transcript}"
              </div>

              {parsedData && (
                <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 mr-1.5">{lang === 'hi' ? 'पहचाना गया:' : 'Detected:'}</span>
                    <strong className="text-emerald-700 dark:text-emerald-300">
                      {parsedData.type === 'income' ? '+ ' : '- '}
                      {parsedData.amount ? formatRupee(parsedData.amount) : (lang === 'hi' ? 'रकम नहीं मिली' : 'No amount')}
                    </strong>
                    {parsedData.category && (
                      <span className="ml-1 text-slate-600 dark:text-slate-300">
                        ({CATEGORIES[parsedData.category]?.[lang] || parsedData.category})
                      </span>
                    )}
                  </div>

                  {parsedData.amount && (
                    <button
                      onClick={handleConfirm}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{lang === 'hi' ? 'जोड़ें' : 'Add'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick text input fallback */}
          <div className="pt-2 text-left">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              {lang === 'hi' ? 'या वाक्य यहाँ लिखें:' : 'Or type a short sentence:'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={manualText}
                onChange={(e) => handleManualParse(e.target.value)}
                placeholder={lang === 'hi' ? 'उदा. 400 रुपये फल लिए' : 'e.g. 400 rs fruits'}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
              {parsedData && parsedData.amount && (
                <button
                  onClick={handleConfirm}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg whitespace-nowrap"
                >
                  {lang === 'hi' ? 'दर्ज करें' : 'Apply'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
          >
            {t.actions.cancel}
          </button>
        </div>

      </div>
    </div>
  );
};
