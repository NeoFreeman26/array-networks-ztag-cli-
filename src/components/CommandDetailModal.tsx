import React, { useState, useEffect } from 'react';
import { ZTagCommand, CommandParameter } from '../types/ztag';
import {
  X,
  Copy,
  Check,
  Terminal,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface CommandDetailModalProps {
  command: ZTagCommand | null;
  onClose: () => void;
  onSendToTerminal?: (cmdStr: string) => void;
}

export const CommandDetailModal: React.FC<CommandDetailModalProps> = ({
  command,
  onClose,
  onSendToTerminal,
}) => {
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [copiedGenerated, setCopiedGenerated] = useState(false);
  const [copiedExampleIndex, setCopiedExampleIndex] = useState<number | null>(null);

  useEffect(() => {
    if (command) {
      const initial: Record<string, string> = {};
      command.parameters.forEach((p) => {
        initial[p.name] = p.defaultValue || '';
      });
      setParamValues(initial);
      setCopiedGenerated(false);
      setCopiedExampleIndex(null);
    }
  }, [command]);

  if (!command) return null;

  // Generate interactive command string based on parameter inputs
  const buildCommandString = (): string => {
    let result = command.name;
    command.parameters.forEach((p) => {
      const val = paramValues[p.name]?.trim();
      if (val) {
        // If string contains spaces and not already quoted
        if (val.includes(' ') && !val.startsWith('"') && !val.endsWith('"')) {
          result += ` "${val}"`;
        } else {
          result += ` ${val}`;
        }
      } else if (p.required) {
        result += ` <${p.name}>`;
      }
    });
    return result;
  };

  const handleCopyGenerated = () => {
    navigator.clipboard.writeText(buildCommandString());
    setCopiedGenerated(true);
    setTimeout(() => setCopiedGenerated(false), 2000);
  };

  const handleCopyExample = (cmdText: string, index: number) => {
    navigator.clipboard.writeText(cmdText);
    setCopiedExampleIndex(index);
    setTimeout(() => setCopiedExampleIndex(null), 2000);
  };

  const handleResetParams = () => {
    const initial: Record<string, string> = {};
    command.parameters.forEach((p) => {
      initial[p.name] = p.defaultValue || '';
    });
    setParamValues(initial);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        id="command-detail-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                {command.prompt}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {command.actionType}
              </span>
              <span className="text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-800">
                {command.chapterName}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
              {command.name}
            </h2>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              {command.descriptionZh}
            </p>
          </div>

          <button
            id="close-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors ml-3"
            title="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-200 text-sm">
          {/* Complete Syntax Section */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-slate-300">
                完整語法標準 (CLI Syntax)
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(command.syntax);
                  setCopiedGenerated(true);
                  setTimeout(() => setCopiedGenerated(false), 2000);
                }}
                className="flex items-center space-x-1 text-slate-400 hover:text-sky-400 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>複製語法</span>
              </button>
            </div>
            <div className="font-mono text-xs sm:text-sm text-sky-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800 overflow-x-auto select-all">
              {command.syntax}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              說明：粗體為主幹，<span className="text-sky-300">&lt;&gt;</span> 為必填參數，
              <span className="text-slate-400">[]</span> 為可選參數，
              <span className="text-amber-300">&#123; | &#125;</span> 為多選一選項。
            </p>
          </div>

          {/* Interactive Command Builder */}
          {command.parameters && command.parameters.length > 0 && (
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900 border border-sky-500/20 rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-base">互動式指令產生器 (Command Builder)</h4>
                    <p className="text-xs text-slate-400">填入或調整下方參數，即時產生可直接執行的指令碼</p>
                  </div>
                </div>
                <button
                  onClick={handleResetParams}
                  className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 transition-colors"
                  title="恢復預設值"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重設參數</span>
                </button>
              </div>

              {/* Form Input Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                {command.parameters.map((param) => (
                  <div key={param.name} className="flex flex-col space-y-1">
                    <label className="text-xs font-mono font-medium text-slate-300 flex items-center justify-between">
                      <span>
                        {param.name}
                        {param.required ? (
                          <span className="text-rose-400 ml-1">*必填</span>
                        ) : (
                          <span className="text-slate-500 ml-1">(可選)</span>
                        )}
                      </span>
                      <span className="text-slate-400 text-[11px] font-sans">
                        {param.type}
                      </span>
                    </label>

                    {param.options && param.options.length > 0 ? (
                      <select
                        value={paramValues[param.name] ?? param.defaultValue ?? ''}
                        onChange={(e) =>
                          setParamValues({ ...paramValues, [param.name]: e.target.value })
                        }
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-sky-500 transition-colors"
                      >
                        {param.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder={param.placeholder || param.defaultValue || `輸入 ${param.name}`}
                        value={paramValues[param.name] || ''}
                        onChange={(e) =>
                          setParamValues({ ...paramValues, [param.name]: e.target.value })
                        }
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    )}
                    <span className="text-[11px] text-slate-400 leading-tight">
                      {param.description}
                    </span>
                  </div>
                ))}
              </div>

              {/* Realtime Output Bar */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="font-mono text-xs sm:text-sm text-emerald-400 overflow-x-auto whitespace-pre">
                  <span className="text-slate-500 mr-2">{command.prompt}</span>
                  {buildCommandString()}
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={handleCopyGenerated}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-colors shadow-sm"
                  >
                    {copiedGenerated ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>已複製</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>複製指令</span>
                      </>
                    )}
                  </button>
                  {onSendToTerminal && (
                    <button
                      onClick={() => {
                        onSendToTerminal(buildCommandString());
                        onClose();
                      }}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm"
                      title="發送至終端機模擬器執行"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>在終端模擬執行</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Parameter Explanations Table */}
          {command.parameters && command.parameters.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-2 text-sm flex items-center space-x-2">
                <Info className="w-4 h-4 text-sky-400" />
                <span>參數規格與有效值 (Parameters Table)</span>
              </h4>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                      <th className="p-3 w-1/4">參數名稱</th>
                      <th className="p-3 w-1/6">屬性 / 型別</th>
                      <th className="p-3 w-1/6">預設值</th>
                      <th className="p-3">說明與取值限制</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono">
                    {command.parameters.map((p) => (
                      <tr key={p.name} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-sky-300">
                          {p.name}
                          {p.required && (
                            <span className="text-rose-400 ml-1 font-sans">*</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400 font-sans">{p.type}</td>
                        <td className="p-3 text-amber-300">
                          {p.defaultValue ? p.defaultValue : '-'}
                        </td>
                        <td className="p-3 font-sans text-slate-300 leading-relaxed">
                          {p.description}
                          {p.options && (
                            <div className="mt-1 text-slate-400 text-[11px] font-mono">
                              可選值: [{p.options.join(', ')}]
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Practical Examples */}
          {command.examples && command.examples.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>實戰應用範例 (Examples & Scenarios)</span>
              </h4>
              <div className="space-y-3">
                {command.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800/90 rounded-xl p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-sky-400">{ex.title}</span>
                      <button
                        onClick={() => handleCopyExample(ex.command, idx)}
                        className="text-slate-400 hover:text-white flex items-center space-x-1"
                      >
                        {copiedExampleIndex === idx ? (
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
                    <pre className="font-mono text-xs text-emerald-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 overflow-x-auto whitespace-pre">
                      {ex.command}
                    </pre>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {ex.explanation}
                    </p>
                    {ex.output && (
                      <div className="mt-2 text-xs">
                        <span className="text-slate-400 block mb-1">設備輸出結果：</span>
                        <pre className="font-mono text-[11px] text-slate-300 bg-slate-900/50 p-2 rounded border border-slate-800/60 overflow-x-auto">
                          {ex.output}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Notices */}
          {command.notices && command.notices.length > 0 && (
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-4 text-amber-200">
              <div className="flex items-center space-x-2 font-semibold text-amber-400 mb-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>原廠重要注意事項 (Notice)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-amber-200/90 leading-relaxed">
                {command.notices.map((n, idx) => (
                  <li key={idx}>{n}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Commands */}
          {command.relatedCommands && command.relatedCommands.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400 flex items-center">
                <Layers className="w-3.5 h-3.5 mr-1" />
                相關關聯指令：
              </span>
              {command.relatedCommands.map((rc) => (
                <span
                  key={rc}
                  className="font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700"
                >
                  {rc}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
