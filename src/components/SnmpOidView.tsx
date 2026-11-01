import React, { useState } from 'react';
import { ZTAG_SNMP_OIDS } from '../data/ztagOids';
import { Server, Search, Copy, Check, Filter } from 'lucide-react';

export const SnmpOidView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedOid, setCopiedOid] = useState<string | null>(null);

  // Extract unique categories
  const allCategories = Array.from(new Set(ZTAG_SNMP_OIDS.map((o) => o.category)));

  const filteredOids = ZTAG_SNMP_OIDS.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      item.oid.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.descriptionZh && item.descriptionZh.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOid(text);
    setTimeout(() => setCopiedOid(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-sky-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Server className="w-4 h-4" />
              <span>Array Networks MIB Reference</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              SNMP OID 監控速查表
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              收錄 ArrayOS ZTAG 常用私有 MIB 監控 OID，供 Zabbix、PRTG、Prometheus SNMP Exporter 快速對照與採集。
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
              Array Enterprise MIB 根: <span className="text-sky-400 font-mono">.1.3.6.1.4.1.7564</span>
            </span>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋 OID、分類或說明 (如 memory, cpu, vrrp, ssl, temperature)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
            >
              <option value="all">所有監控分類 ({ZTAG_SNMP_OIDS.length})</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* OID Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-300 font-semibold border-b border-slate-700 text-xs uppercase tracking-wider">
                <th className="p-4 w-1/4">分類 Category</th>
                <th className="p-4 w-1/3">SNMP OID</th>
                <th className="p-4">中文說明與英文原廠定義</th>
                <th className="p-4 w-16 text-right">複製</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {filteredOids.map((item) => (
                <tr key={item.oid} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-semibold text-white text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 text-sky-300 border border-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-emerald-400 text-xs">
                    <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 select-all font-bold">
                      {item.oid}
                    </span>
                  </td>
                  <td className="p-4 text-xs space-y-0.5">
                    <div className="text-white font-medium">{item.descriptionZh}</div>
                    <div className="text-slate-400 font-mono text-[11px]">{item.description}</div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleCopy(item.oid)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="複製 OID"
                    >
                      {copiedOid === item.oid ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
