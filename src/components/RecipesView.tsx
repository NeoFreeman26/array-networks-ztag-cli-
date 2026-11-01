import React, { useState } from 'react';
import { ZTAG_RECIPES } from '../data/ztagRecipes';
import { ZTagRecipe } from '../types/ztag';
import {
  FileCode,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Terminal,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface RecipesViewProps {
  onSendToTerminal?: (cliBatch: string) => void;
}

export const RecipesView: React.FC<RecipesViewProps> = ({ onSendToTerminal }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string>(ZTAG_RECIPES[0].id);
  const [copiedStepIndex, setCopiedStepIndex] = useState<string | null>(null);
  const [copiedAllId, setCopiedAllId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: '全部實戰方案' },
    { id: 'init', label: '出廠初裝配置' },
    { id: 'network', label: '網路與多鏈路' },
    { id: 'slb', label: '伺服器負載均衡' },
    { id: 'ha', label: '雙機高可用 HA' },
    { id: 'security', label: '資安防護與 ACL' },
  ];

  const filteredRecipes =
    selectedCategory === 'all'
      ? ZTAG_RECIPES
      : ZTAG_RECIPES.filter((r) => r.category === selectedCategory);

  const handleCopyAll = (recipe: ZTagRecipe) => {
    const fullScript = recipe.steps
      .map((s: { title: string; command: string; explanation?: string }, idx: number) => `# 步驟 ${idx + 1}: ${s.title}\n${s.command}`)
      .join('\n\n');
    navigator.clipboard.writeText(fullScript);
    setCopiedAllId(recipe.id);
    setTimeout(() => setCopiedAllId(null), 2000);
  };

  const handleCopyStep = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedStepIndex(key);
    setTimeout(() => setCopiedStepIndex(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-sky-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <FileCode className="w-4 h-4" />
              <span>ArrayOS ZTAG Best Practices</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              實戰設定組合範本 (Recipes & Best Practices)
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              提供工程師與網管人員在專案上線前最常面臨的實務配置完整腳本，含出廠初始設置、VRRP HA、SLB 與資安 ACL。
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/80 self-start">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recipes Accordion / List */}
      <div className="space-y-4">
        {filteredRecipes.map((recipe) => {
          const isExpanded = expandedRecipeId === recipe.id;
          return (
            <div
              key={recipe.id}
              className="bg-slate-800/70 border border-slate-700/80 rounded-xl overflow-hidden transition-all shadow-sm"
            >
              {/* Recipe Summary Bar */}
              <div
                onClick={() => setExpandedRecipeId(isExpanded ? '' : recipe.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/90 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase">
                      {recipe.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {recipe.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300">
                    {recipe.description}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyAll(recipe);
                    }}
                    className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-600 transition-colors"
                  >
                    {copiedAllId === recipe.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">已複製全套腳本</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>複製整組腳本</span>
                      </>
                    )}
                  </button>
                  <div className="text-slate-400 p-1">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-sky-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Step Details */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-700/80 bg-slate-900/60 space-y-4">
                  <div className="flex sm:hidden justify-end">
                    <button
                      onClick={() => handleCopyAll(recipe)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded bg-slate-700 text-xs text-white"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>複製整組腳本</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {recipe.steps.map((step, idx) => {
                      const stepKey = `${recipe.id}-${idx}`;
                      return (
                        <div
                          key={idx}
                          className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="h-5 w-5 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center border border-sky-500/30">
                                {idx + 1}
                              </span>
                              <h4 className="font-semibold text-white text-sm">
                                {step.title}
                              </h4>
                            </div>

                            <button
                              onClick={() => handleCopyStep(step.command, stepKey)}
                              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                            >
                              {copiedStepIndex === stepKey ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400">已複製</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>複製</span>
                                </>
                              )}
                            </button>
                          </div>

                          <pre className="font-mono text-xs sm:text-sm text-emerald-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800 overflow-x-auto whitespace-pre">
                            {step.command}
                          </pre>

                          <p className="text-xs text-slate-400 leading-relaxed">
                            {step.explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {onSendToTerminal && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          const fullScript = recipe.steps
                            .map((s) => s.command)
                            .join('\n');
                          onSendToTerminal(fullScript);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-md"
                      >
                        <Terminal className="w-4 h-4" />
                        <span>將此整組範本注入 CLI 模擬終端機</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
