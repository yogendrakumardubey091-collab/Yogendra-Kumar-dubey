import React from 'react';
import { ActiveTab, Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { 
  Calculator, 
  Sun, 
  Moon, 
  Languages, 
  Plus, 
  BookOpen, 
  Users, 
  PieChart, 
  BarChart3,
  IndianRupee
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onOpenNewTransaction: (type?: 'expense' | 'income') => void;
  onOpenCalculator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  isDarkMode,
  setIsDarkMode,
  onOpenNewTransaction,
  onOpenCalculator
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark (Single text element, 1 line) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <IndianRupee className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                {t.appName}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-1 hidden sm:inline-block">
                {t.tagline}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Clean single line controls) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl">
            <button
              onClick={() => setActiveTab('cashbook')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'cashbook'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              {t.tabs.cashbook}
            </button>

            <button
              onClick={() => setActiveTab('khata')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'khata'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              {t.tabs.khata}
            </button>

            <button
              onClick={() => setActiveTab('budget')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'budget'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              {t.tabs.budget}
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'reports'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {t.tabs.reports}
            </button>
          </nav>

          {/* Zone 3: Actions (1 Primary CTA + Essential Tools) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Calculator */}
            <button
              onClick={onOpenCalculator}
              title={t.actions.calculator}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label={t.actions.calculator}
            >
              <Calculator className="w-4 h-4" />
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
              title={lang === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => onOpenNewTransaction('expense')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">{lang === 'hi' ? '+ नया हिसाब' : '+ New Entry'}</span>
              <span className="sm:hidden">{lang === 'hi' ? '+ नया' : '+ New'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400">
          <button
            onClick={() => setActiveTab('cashbook')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-md transition-colors ${
              activeTab === 'cashbook' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{lang === 'hi' ? 'रोज़नामचा' : 'Cashbook'}</span>
          </button>

          <button
            onClick={() => setActiveTab('khata')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-md transition-colors ${
              activeTab === 'khata' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{lang === 'hi' ? 'उधार खाता' : 'Khata'}</span>
          </button>

          <button
            onClick={() => setActiveTab('budget')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-md transition-colors ${
              activeTab === 'budget' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>{lang === 'hi' ? 'बजट' : 'Budget'}</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-md transition-colors ${
              activeTab === 'reports' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{lang === 'hi' ? 'रिपोर्ट' : 'Reports'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
