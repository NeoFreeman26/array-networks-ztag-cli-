import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Trash2, ArrowDown, HelpCircle, Check, Copy } from 'lucide-react';

interface TerminalSimulatorProps {
  initialCommand?: string;
}

interface CommandHistoryItem {
  prompt: string;
  command: string;
  output: string;
  type?: 'normal' | 'error' | 'success';
}

export const TerminalSimulator: React.FC<TerminalSimulatorProps> = ({ initialCommand }) => {
  const [currentPrompt, setCurrentPrompt] = useState<'AN>' | 'AN#' | 'AN(config)#'>('AN>');
  const [inputVal, setInputVal] = useState(initialCommand || '');
  const [history, setHistory] = useState<CommandHistoryItem[]>([
    {
      prompt: '',
      command: '',
      output: `*******************************************************************\n* Array Networks ArrayOS ZTAG CLI Shell (v10.3)                   *\n* Type '?' or 'help' for available commands.                       *\n* Type 'enable' to enter Privileged EXEC mode.                     *\n* Type 'config terminal' to enter Configuration mode.              *\n*******************************************************************`,
      type: 'normal',
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialCommand) {
      setInputVal(initialCommand);
    }
  }, [initialCommand]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleExecute = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    let output = '';
    let nextPrompt = currentPrompt;
    let type: 'normal' | 'error' | 'success' = 'normal';

    const lower = trimmed.toLowerCase();

    // Emulate basic commands
    if (lower === 'enable') {
      nextPrompt = 'AN#';
      output = '';
    } else if (lower === 'disable' || lower === 'exit' && currentPrompt === 'AN#') {
      nextPrompt = 'AN>';
      output = '';
    } else if (lower === 'configure terminal' || lower === 'config terminal' || lower === 'conf t') {
      if (currentPrompt === 'AN>') {
        output = '% Permission denied. You must be in privileged mode (AN#). Type "enable" first.';
        type = 'error';
      } else {
        nextPrompt = 'AN(config)#';
        output = 'Entering configuration mode terminal. Use "exit" or "end" to leave.';
      }
    } else if (lower === 'exit' && currentPrompt === 'AN(config)#') {
      nextPrompt = 'AN#';
      output = '';
    } else if (lower === 'end') {
      nextPrompt = 'AN#';
      output = '';
    } else if (lower === 'clear' || lower === 'cls') {
      setHistory([]);
      setInputVal('');
      return;
    } else if (lower === 'help' || lower === '?') {
      output = `Available commands in ${currentPrompt} mode:\n` +
        (currentPrompt === 'AN>'
          ? `  enable            Enter privileged EXEC mode\n  ping <ip>         Send ICMP echo packets\n  traceroute <ip>   Trace route to host\n  show version      Display system version and build\n  exit              Disconnect session`
          : currentPrompt === 'AN#'
          ? `  configure terminal Enter configuration mode\n  show running-config Display active running configuration\n  show interface     Display interface status\n  write memory       Save running config to NVRAM\n  ping <ip>          Send ICMP echo packets\n  disable            Return to user mode`
          : `  interface <id>     Configure network interface\n  ip route <net>     Configure static route\n  ip default-gateway Set default gateway\n  aaa-server <name>  Configure AAA authentication server\n  exit               Exit to Privileged mode`);
    } else if (lower.startsWith('show version')) {
      output = `ArrayOS (TM) ZTAG Software, Version 10.3.0.21\n` +
        `Copyright (c) 2000-2026 Array Networks, Inc. All rights reserved.\n` +
        `Hardware: AG1500 (4 CPU cores, 16384 MB RAM)\n` +
        `System Uptime: 42 days, 6 hours, 18 minutes\n` +
        `ZTAG License: Active (250 Concurrent SSL VPN Users, SLB Enabled)`;
      type = 'success';
    } else if (lower.startsWith('show running') || lower.startsWith('show run')) {
      output = `! Building configuration...\n` +
        `! Current configuration : 2048 bytes\n` +
        `hostname Array-ZTAG-GW01\n` +
        `interface port1\n  ip address 192.168.1.1 255.255.255.0\n  no shutdown\n!\n` +
        `interface port2\n  ip address 203.0.113.10 255.255.255.0\n  no shutdown\n!\n` +
        `ip default-gateway 203.0.113.1\n` +
        `service web\n  http-port 80\n  https-port 443\nend`;
    } else if (lower.startsWith('ping')) {
      const parts = trimmed.split(' ');
      const target = parts[1] || '127.0.0.1';
      output = `PING ${target} (56 data bytes):\n` +
        `64 bytes from ${target}: icmp_seq=1 ttl=64 time=1.24 ms\n` +
        `64 bytes from ${target}: icmp_seq=2 ttl=64 time=1.18 ms\n` +
        `64 bytes from ${target}: icmp_seq=3 ttl=64 time=1.31 ms\n` +
        `--- ${target} ping statistics ---\n` +
        `3 packets transmitted, 3 packets received, 0.0% packet loss\n` +
        `round-trip min/avg/max = 1.18/1.24/1.31 ms`;
      type = 'success';
    } else if (lower.startsWith('write memory') || lower.startsWith('write') || lower.startsWith('wr')) {
      output = `Saving running configuration to startup configuration...\n[OK] Configuration saved successfully.`;
      type = 'success';
    } else {
      // General feedback
      output = `[Command Executed on ArrayOS CLI]\n> ${trimmed}\nCommand syntax accepted into staging configuration buffer.`;
      type = 'success';
    }

    setHistory((prev) => [
      ...prev,
      {
        prompt: currentPrompt,
        command: trimmed,
        output,
        type,
      },
    ]);

    setCurrentPrompt(nextPrompt);
    setInputVal('');
  };

  const handleQuickInsert = (cmd: string) => {
    setInputVal(cmd);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-4">
      {/* Terminal Header */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="flex items-center space-x-2 ml-3">
              <TerminalIcon className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-mono font-semibold text-slate-300">
                ArrayOS-Console :: ssh admin@192.168.1.254:22
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              Mode: <span className="text-sky-400">{currentPrompt}</span>
            </span>
            <button
              onClick={() => setHistory([])}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="清除螢幕"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Screen */}
        <div className="p-4 sm:p-5 font-mono text-xs sm:text-sm bg-slate-950/95 text-slate-200 h-[480px] overflow-y-auto space-y-3">
          {history.map((item, idx) => (
            <div key={idx} className="space-y-1">
              {item.command && (
                <div className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-semibold select-none">
                    {item.prompt}
                  </span>
                  <span className="text-white font-medium">{item.command}</span>
                </div>
              )}
              {item.output && (
                <pre
                  className={`whitespace-pre-wrap pl-2 border-l-2 leading-relaxed ${
                    item.type === 'error'
                      ? 'border-rose-500 text-rose-300'
                      : item.type === 'success'
                      ? 'border-emerald-500 text-emerald-300/90'
                      : 'border-slate-700 text-slate-300'
                  }`}
                >
                  {item.output}
                </pre>
              )}
            </div>
          ))}

          {/* Active Input Line */}
          <form onSubmit={handleExecute} className="flex items-center space-x-2 pt-2">
            <span className="text-emerald-400 font-semibold select-none">
              {currentPrompt}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 bg-transparent text-white focus:outline-none font-mono caret-sky-400"
              placeholder="輸入 ArrayOS 指令，如 'show version', 'enable', 'conf t'..."
              autoFocus
            />
            <button
              type="submit"
              className="p-1 px-2.5 rounded bg-sky-600/80 hover:bg-sky-600 text-white text-xs font-mono transition-colors"
            >
              Enter 執行
            </button>
          </form>

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick Macro Buttons */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium mr-1">常用測試指令快捷：</span>
        {[
          'show version',
          'enable',
          'configure terminal',
          'show running-config',
          'ping 8.8.8.8',
          'write memory',
          'show interface',
          'exit',
        ].map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleQuickInsert(cmd)}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-sky-500 text-slate-300 hover:text-white font-mono transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
};
