import React from 'react';
import { Terminal, BookOpen, FileCode, Search, Server, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'commands' | 'recipes' | 'oids' | 'terminal';
  setActiveTab: (tab: 'commands' | 'recipes' | 'oids' | 'terminal') => void;
  totalCommands: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalCommands,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Version */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('commands')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  ArrayOS ZTAG
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full">
                  v10.3 CLI
                </span>
              </div>
              <p className="text-xs text-slate-400">指令查詢・語法範例・實戰腳本工具</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              id="tab-commands-btn"
              onClick={() => setActiveTab('commands')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'commands'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>指令手冊</span>
              <span className="hidden md:inline-flex px-1.5 py-0.2 text-xs bg-black/25 rounded-md font-mono">
                {totalCommands}
              </span>
            </button>

            <button
              id="tab-recipes-btn"
              onClick={() => setActiveTab('recipes')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'recipes'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>實戰配置方案</span>
            </button>

            <button
              id="tab-oids-btn"
              onClick={() => setActiveTab('oids')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'oids'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>SNMP OID 速查</span>
            </button>

            <button
              id="tab-terminal-btn"
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'terminal'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>CLI 模擬終端</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
