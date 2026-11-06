import React, { useState } from 'react';
import { X, Delete, Check, Copy } from 'lucide-react';
import { Language } from '../types';

interface QuickCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onUseAmount?: (amount: number) => void;
  lang: Language;
}

export const QuickCalculator: React.FC<QuickCalculatorProps> = ({
  isOpen,
  onClose,
  onUseAmount,
  lang
}) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (justEvaluated) {
      setDisplay(digit);
      setExpression('');
      setJustEvaluated(false);
      return;
    }

    if (display === '0' && digit !== '.') {
      setDisplay(digit);
    } else {
      if (digit === '.' && display.includes('.')) return;
      setDisplay(display + digit);
    }
  };

  const handleOperator = (op: string) => {
    setExpression(`${display} ${op} `);
    setDisplay('0');
    setJustEvaluated(false);
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setJustEvaluated(false);
  };

  const handleBackspace = () => {
    if (justEvaluated) {
      handleClear();
      return;
    }
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleEquals = () => {
    try {
      if (!expression) return;
      const fullExpr = `${expression} ${display}`
        .replace(/×/g, '*')
        .replace(/÷/g, '/');

      // Safe mathematical expression evaluation using Function constructor on validated math chars
      if (!/^[0-9+\-*/. ()]+$/.test(fullExpr)) {
        setDisplay('Error');
        return;
      }

      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${fullExpr})`)();
      const rounded = Math.round((result + Number.EPSILON) * 100) / 100;
      setDisplay(rounded.toString());
      setExpression('');
      setJustEvaluated(true);
    } catch {
      setDisplay('Error');
      setExpression('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleUseInApp = () => {
    const val = parseFloat(display);
    if (!isNaN(val) && val > 0 && onUseAmount) {
      onUseAmount(val);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xs overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            {lang === 'hi' ? 'त्वरित कैलकुलेटर' : 'Quick Calculator'}
          </span>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950/80 text-right space-y-1">
          <div className="text-[11px] text-slate-500 font-mono h-4 overflow-hidden truncate">
            {expression}
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white truncate tabular-nums">
            ₹{display}
          </div>
        </div>

        {/* Button Keypad */}
        <div className="p-3 grid grid-cols-4 gap-2">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="py-3 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl hover:bg-rose-100 transition-colors"
          >
            C
          </button>
          <button
            onClick={handleBackspace}
            className="py-3 flex items-center justify-center text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOperator('%')}
            className="py-3 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-colors"
          >
            %
          </button>
          <button
            onClick={() => handleOperator('÷')}
            className="py-3 text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleDigit('7')}
            className="py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-slate-200/80 transition-colors"
          >
            7
          </button>
          <button
            onClick={() => handleDigit('8')}
            className="py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-slate-200/80 transition-colors"
          >
            8
          </button>
          <button
            onClick={() => handleDigit('9')}
            className="py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-slate-200/80 transition-colors"
          >
            9
          </button>
          <button
            onClick={() => handleOperator('×')}
            className="py-3 text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleDigit('4')}
            className="py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-slate-200/80 transition-colors"
          >
            4
          </button>
          <button
            onClick={() => handleDigit('5')}
            className="py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-slate-200/80 transition-colors"
          >
            5
          </button>
          <button
            onClick={() => handleDigit('6')}
            className="py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-slate-200/80 transition-colors"
          >
            6
          </button>
          <button
            onClick={() => handleOperator('-')}
            className="py-3 text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            -
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleDigit('1')}
            className="py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-slate-200/80 transition-colors"
          >
            1
          </button>
          <button
            onClick={() => handleDigit('2')}
            className="py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-slate-200/80 transition-colors"
          >
            2
          </button>
          <button
            onClick={() => handleDigit('3')}
            className="py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-slate-200/80 transition-colors"
          >
            3
          </button>
          <button
            onClick={() => handleOperator('+')}
            className="py-3 text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleDigit('0')}
            className="py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-slate-200/80 transition-colors"
          >
            0
          </button>
          <button
            onClick={() => handleDigit('.')}
            className="py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-slate-200/80 transition-colors"
          >
            .
          </button>
          <button
            onClick={handleEquals}
            className="col-span-2 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
          >
            =
          </button>
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-1.5 px-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (lang === 'hi' ? 'कॉपी हो गया' : 'Copied!') : (lang === 'hi' ? 'रकम कॉपी करें' : 'Copy')}</span>
          </button>

          {onUseAmount && (
            <button
              onClick={handleUseInApp}
              className="flex-1 py-1.5 px-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              {lang === 'hi' ? 'रकम में भरें' : 'Use Amount'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
