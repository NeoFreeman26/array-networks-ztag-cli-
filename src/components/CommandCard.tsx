import React, { useState } from 'react';
import { ZTagCommand } from '../types/ztag';
import { Copy, Check, ChevronRight, Sliders, AlertCircle, Bookmark } from 'lucide-react';

interface CommandCardProps {
  command: ZTagCommand;
  onSelect: (cmd: ZTagCommand) => void;
  isBookmarked: boolean;
  onToggleBookmark: (cmdId: string) => void;
}

export const CommandCard: React.FC<CommandCardProps> = ({
  command,
  onSelect,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const getPromptBadgeColor = (prompt: string) => {
    switch (prompt) {
      case 'AN>':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'AN#':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'AN(config)#':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'vs(config)$':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  const getActionBadgeColor = (type: string) => {
    switch (type) {
      case 'config':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'show':
        return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
      case 'action':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'no':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      case 'clear':
        return 'bg-red-500/15 text-red-300 border-red-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div
      id={`command-card-${command.id}`}
      onClick={() => onSelect(command)}
      className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 hover:border-sky-500/50 rounded-xl p-5 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-sky-500/5 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Header Tags */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`px-2 py-0.5 text-xs font-mono font-medium rounded-md border ${getPromptBadgeColor(
                command.prompt
              )}`}
            >
              {command.prompt}
            </span>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-md border uppercase ${getActionBadgeColor(
                command.actionType
              )}`}
            >
              {command.actionType}
            </span>
            <span className="text-xs text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800 truncate max-w-[180px]">
              {command.subCategory}
            </span>
          </div>

          <button
            title={isBookmarked ? '取消收藏' : '收藏指令'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(command.id);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked
                ? 'text-amber-400 hover:text-amber-300 bg-amber-400/10'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Command Name & Syntax */}
        <div className="mb-2">
          <h3 className="text-base font-bold text-white group-hover:text-sky-400 font-mono transition-colors">
            {command.name}
          </h3>
          <div className="mt-1 font-mono text-xs text-sky-300/90 bg-slate-950/70 p-2 rounded-lg border border-slate-900 overflow-x-auto whitespace-pre">
            {command.syntax}
          </div>
        </div>

        {/* Description in Chinese */}
        <p className="text-sm text-slate-300 line-clamp-2 mb-3 leading-relaxed">
          {command.descriptionZh}
        </p>

        {/* Primary Example Preview */}
        {command.examples && command.examples.length > 0 && (
          <div className="mt-3 bg-slate-900/70 border border-slate-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-medium text-slate-300">範例：{command.examples[0].title}</span>
              <button
                onClick={(e) => handleCopy(e, command.examples[0].command)}
                className="hover:text-sky-300 flex items-center space-x-1 transition-colors"
                title="複製範例"
              >
                {copied ? (
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
            <code className="text-xs font-mono text-emerald-300/90 block overflow-x-auto whitespace-pre">
              {command.examples[0].command}
            </code>
          </div>
        )}
      </div>

      {/* Footer Info & Details Button */}
      <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-3">
          <span>{command.parameters.length} 個參數</span>
          {command.notices && command.notices.length > 0 && (
            <span className="flex items-center text-amber-400/90">
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              注意事項
            </span>
          )}
        </div>
        <div className="flex items-center text-sky-400 group-hover:translate-x-1 transition-transform font-medium">
          <span>查看詳情與產生器</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </div>
      </div>
    </div>
  );
};
