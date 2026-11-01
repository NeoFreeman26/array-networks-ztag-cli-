import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { ALL_ZTAG_COMMANDS } from './data/ztagCommands';
import { ZTAG_CHAPTERS } from './data/ztagChapters';
import { ZTagCommand } from './types/ztag';
import { Navbar } from './components/Navbar';
import { CommandCard } from './components/CommandCard';
import { CommandDetailModal } from './components/CommandDetailModal';
import { RecipesView } from './components/RecipesView';
import { SnmpOidView } from './components/SnmpOidView';
import { TerminalSimulator } from './components/TerminalSimulator';
import {
  Search,
  Loader2,
  X,
  Filter,
  Layers,
  Bookmark,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Command as CommandIcon,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'commands' | 'recipes' | 'oids' | 'terminal'>('commands');
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [selectedPrompt, setSelectedPrompt] = useState<string>('all');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);

  // Bookmarks in localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ztag_cli_bookmarks');
      return saved ? JSON.parse(saved) : ['basic-show-version', 'net-ip-route', 'ha-vrrp'];
    } catch {
      return ['basic-show-version', 'net-ip-route'];
    }
  });

  // Active Command in Modal
  const [selectedCommand, setSelectedCommand] = useState<ZTagCommand | null>(null);

  // Terminal injection prefill
  const [terminalInjectCmd, setTerminalInjectCmd] = useState<string>('');

  // Popular search keywords for quick filtering
  const popularKeywords = [
    { label: 'interface', desc: '介面與 IP' },
    { label: 'ip route', desc: '路由設定' },
    { label: 'vrrp', desc: '雙機 HA' },
    { label: 'slb', desc: '負載均衡' },
    { label: 'tcpdump', desc: '即時抓包' },
    { label: 'aaa-server', desc: '認證伺服器' },
    { label: 'license', desc: '授權狀態' },
    { label: 'show', desc: '查看狀態' },
    { label: 'write memory', desc: '存檔' },
  ];

  // Save bookmarks
  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('ztag_cli_bookmarks', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Debounced search with visual loading state
  useEffect(() => {
    if (searchQuery !== debouncedQuery) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        startTransition(() => {
          setDebouncedQuery(searchQuery);
          setIsSearching(false);
        });
      }, 220);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery, debouncedQuery]);

  // Keyboard shortcut Ctrl+K or / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('cli-search-input')?.focus();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.getElementById('cli-search-input')?.focus();
      } else if (e.key === 'Escape' && document.activeElement?.id === 'cli-search-input') {
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered Commands list
  const filteredCommands = useMemo(() => {
    return ALL_ZTAG_COMMANDS.filter((cmd) => {
      // 1. Chapter filter
      if (selectedChapter !== 'all' && cmd.chapterId !== selectedChapter) {
        return false;
      }

      // 2. Prompt mode filter
      if (selectedPrompt !== 'all' && cmd.prompt !== selectedPrompt) {
        return false;
      }

      // 3. Action type filter
      if (selectedActionType !== 'all' && cmd.actionType !== selectedActionType) {
        return false;
      }

      // 4. Bookmark filter
      if (onlyBookmarked && !bookmarkedIds.includes(cmd.id)) {
        return false;
      }

      // 5. Search query filter
      if (!debouncedQuery.trim()) {
        return true;
      }

      const q = debouncedQuery.toLowerCase().trim();
      const matchName = cmd.name.toLowerCase().includes(q);
      const matchSyntax = cmd.syntax.toLowerCase().includes(q);
      const matchDescZh = cmd.descriptionZh.toLowerCase().includes(q);
      const matchDescEn = cmd.description?.toLowerCase().includes(q);
      const matchSubCat = cmd.subCategory.toLowerCase().includes(q);
      const matchParams = cmd.parameters.some(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
      const matchExamples = cmd.examples.some(
        (ex) => ex.command.toLowerCase().includes(q) || ex.title.toLowerCase().includes(q)
      );

      return (
        matchName ||
        matchSyntax ||
        matchDescZh ||
        Boolean(matchDescEn) ||
        matchSubCat ||
        matchParams ||
        matchExamples
      );
    });
  }, [
    debouncedQuery,
    selectedChapter,
    selectedPrompt,
    selectedActionType,
    onlyBookmarked,
    bookmarkedIds,
  ]);

  const handleSendToTerminal = (cmdStr: string) => {
    setTerminalInjectCmd(cmdStr);
    setActiveTab('terminal');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSelectedChapter('all');
    setSelectedPrompt('all');
    setSelectedActionType('all');
    setOnlyBookmarked(false);
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedChapter !== 'all' ||
    selectedPrompt !== 'all' ||
    selectedActionType !== 'all' ||
    onlyBookmarked;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalCommands={ALL_ZTAG_COMMANDS.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'commands' && (
          <div className="space-y-6">
            {/* Professional Search & Query Bar Section */}
            <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center space-x-2 text-sky-400 text-xs font-semibold tracking-wider uppercase mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>ArrayOS ZTAG 10.3 CLI Search Engine</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    ArrayOS ZTAG 指令全域檢索系統
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    支援按指令關鍵字、CLI 語法、參數選項、中文功能描述及實戰情境快速對照查詢。
                  </p>
                </div>

                {/* Status Counter Badge */}
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono flex items-center space-x-2 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>資料庫已載入:</span>
                    <span className="text-sky-400 font-bold">{ALL_ZTAG_COMMANDS.length}</span>
                    <span>條指令</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Search Input Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {isSearching || isPending ? (
                    <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-slate-400 group-focus-within:text-sky-400 transition-colors" />
                  )}
                </div>

                <input
                  id="cli-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="輸入指令關鍵字或功能（例如：ip route, vrrp, ping, interface, show, aaa）..."
                  className="w-full pl-12 pr-28 py-3.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono transition-all shadow-inner"
                />

                <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1.5">
                  {searchQuery && (
                    <button
                      id="clear-search-btn"
                      onClick={() => setSearchQuery('')}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title="清除搜尋內容 (Esc)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-700/80 rounded shadow-sm select-none">
                    Ctrl+K
                  </kbd>
                </div>
              </div>

              {/* Loading State & Search Feedback Banner */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Left: Dynamic Search State Indicator */}
                <div className="flex items-center space-x-2">
                  {isSearching || isPending ? (
                    <div className="flex items-center space-x-1.5 text-sky-400 font-medium animate-pulse bg-sky-950/40 px-2.5 py-1 rounded-lg border border-sky-500/30">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>正在即時搜尋 ArrayOS CLI 指令庫...</span>
                    </div>
                  ) : searchQuery.trim() ? (
                    <div className="flex items-center space-x-1.5 text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        搜尋「<span className="text-sky-300 font-mono">{searchQuery}</span>」結果：
                        共找到 <strong className="text-white font-mono">{filteredCommands.length}</strong> 筆指令
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 flex items-center space-x-1">
                      <span>支援模糊搜尋與多欄位檢索</span>
                      <span className="text-slate-600">・</span>
                      <span>顯示全部 {filteredCommands.length} 條指令</span>
                    </span>
                  )}
                </div>

                {/* Right: Reset filter button if any active */}
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center space-x-1 text-slate-400 hover:text-sky-400 transition-colors font-medium"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>重設所有篩選與搜尋條件</span>
                  </button>
                )}
              </div>

              {/* Popular Keyword Quick Filters */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-400 mr-1 flex items-center">
                  <CommandIcon className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  熱門指令捷徑：
                </span>
                {popularKeywords.map((kw) => (
                  <button
                    key={kw.label}
                    onClick={() => setSearchQuery(kw.label)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                      searchQuery.toLowerCase().includes(kw.label.toLowerCase())
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                        : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{kw.label}</span>
                    <span className="ml-1 text-[11px] text-slate-400 font-sans">({kw.desc})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Bar: Mode, Action Type, Bookmarked */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-medium flex items-center mr-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  權限等級：
                </span>
                {[
                  { id: 'all', label: '全部模式' },
                  { id: 'AN>', label: 'AN> (User)' },
                  { id: 'AN#', label: 'AN# (Privileged)' },
                  { id: 'AN(config)#', label: 'AN(config)# (Global)' },
                  { id: 'vs(config)$', label: 'vs(config)$ (Virtual)' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedPrompt(m.id)}
                    className={`px-2.5 py-1 rounded-lg font-mono transition-colors ${
                      selectedPrompt === m.id
                        ? 'bg-sky-600 text-white font-medium'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-medium">動作類型：</span>
                {[
                  { id: 'all', label: '全部類型' },
                  { id: 'config', label: '配置 config' },
                  { id: 'show', label: '查詢 show' },
                  { id: 'action', label: '操作 action' },
                  { id: 'no', label: '刪除 no' },
                ].map((act) => (
                  <button
                    key={act.id}
                    onClick={() => setSelectedActionType(act.id)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      selectedActionType === act.id
                        ? 'bg-sky-600 text-white font-medium'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}

                <button
                  onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border transition-colors ${
                    onlyBookmarked
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarked ? 'fill-current' : ''}`} />
                  <span>已收藏 ({bookmarkedIds.length})</span>
                </button>
              </div>
            </div>

            {/* Layout with Chapter Sidebar and Command Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Chapter Category Sidebar */}
              <div className="lg:col-span-3 space-y-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:p-4 sticky top-20">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <span className="flex items-center">
                    <BookOpen className="w-3.5 h-3.5 mr-1 text-sky-400" />
                    CLI 章節分類
                  </span>
                  <span>{ZTAG_CHAPTERS.length} 章</span>
                </div>

                <button
                  onClick={() => setSelectedChapter('all')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                    selectedChapter === 'all'
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4" />
                    <span>全部手冊章節</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-black/20">
                    {ALL_ZTAG_COMMANDS.length}
                  </span>
                </button>

                <div className="space-y-1 pt-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                  {ZTAG_CHAPTERS.filter((ch) => ch.id !== 'all').map((ch) => {
                    const chapterCount = ALL_ZTAG_COMMANDS.filter(
                      (c) => c.chapterId === ch.id
                    ).length;
                    const isSelected = selectedChapter === ch.id;

                    return (
                      <button
                        key={ch.id}
                        onClick={() => setSelectedChapter(ch.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-sky-600 text-white font-medium shadow-md shadow-sky-600/20'
                            : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-semibold truncate">{ch.titleZh}</div>
                          <div className="text-[11px] opacity-75 truncate">{ch.title}</div>
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-mono shrink-0 ${
                            isSelected ? 'bg-black/30' : 'bg-slate-800'
                          }`}
                        >
                          {chapterCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Content Area: Commands Grid */}
              <div className="lg:col-span-9">
                {/* Loading Skeleton Indicator when searching */}
                {isSearching ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center space-x-3 text-sm text-sky-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>正在搜尋指令關鍵字並重構指令集...</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3 animate-pulse"
                        >
                          <div className="flex gap-2">
                            <div className="h-5 w-16 bg-slate-800 rounded"></div>
                            <div className="h-5 w-16 bg-slate-800 rounded"></div>
                          </div>
                          <div className="h-6 w-3/4 bg-slate-800 rounded"></div>
                          <div className="h-10 bg-slate-950 rounded"></div>
                          <div className="h-4 w-5/6 bg-slate-800 rounded"></div>
                          <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : filteredCommands.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCommands.map((command) => (
                      <CommandCard
                        key={command.id}
                        command={command}
                        onSelect={(cmd) => setSelectedCommand(cmd)}
                        isBookmarked={bookmarkedIds.includes(command.id)}
                        onToggleBookmark={toggleBookmark}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">找不到符合條件的指令</h3>
                      <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                        找不到與「<span className="text-sky-300 font-mono">{searchQuery}</span>」相符的指令。請嘗試精簡關鍵字，或切換至其他章節分類。
                      </p>
                    </div>
                    <button
                      onClick={handleResetFilters}
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-colors shadow-md"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>清除所有篩選條件</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Practical Configuration Recipes */}
        {activeTab === 'recipes' && (
          <RecipesView onSendToTerminal={handleSendToTerminal} />
        )}

        {/* Tab 3: SNMP OID Reference */}
        {activeTab === 'oids' && <SnmpOidView />}

        {/* Tab 4: Interactive CLI Terminal Simulator */}
        {activeTab === 'terminal' && (
          <TerminalSimulator initialCommand={terminalInjectCmd} />
        )}
      </main>

      {/* Modal for Command Details & Interactive Command Builder */}
      {selectedCommand && (
        <CommandDetailModal
          command={selectedCommand}
          onClose={() => setSelectedCommand(null)}
          onSendToTerminal={handleSendToTerminal}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Array Networks ArrayOS ZTAG CLI 參考工具庫. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span>支援 ArrayOS 10.x / ZTAG 系列設備</span>
            <span>•</span>
            <span className="text-sky-400">專為網管人員與系統整合工程師打造</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
