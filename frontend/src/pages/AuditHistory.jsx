import React, { useEffect, useState } from 'react';
import { auditService } from '../services/auditService';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import clsx from 'clsx';

export const AuditHistory = () => {
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);

    useEffect(() => {
        if (user?.uid) {
            auditService.getHistory(user.uid).then(setHistory);
        } else {
            setHistory([]);
        }
    }, [user?.uid]);

    return (
        <div className="flex flex-col gap-10 w-full animate-in fade-in py-10 pb-12">
            {/* Educational Header */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-start gap-4">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>history_edu</span>
                <div>
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-1">Chain of Custody: How it works</h3>
                    <p className="text-[10px] text-on-surface-variant leading-relaxed max-w-3xl font-medium">
                        The Audit Ledger maintains a persistent, immutable record of every fairness evaluation conducted. This <strong>Chain of Custody</strong> is essential for forensic auditing and regulatory reporting, allowing compliance officers to track how model fairness evolved over time as new mitigations were applied.
                        <br/><br/>
                        Click on any protocol entity to re-hydrate its full state in the <strong>Dashboard</strong> for historical comparison.
                    </p>
                </div>
            </div>
            <div className="flex items-end justify-between border-b border-outline-variant/10 pb-10 dark:border-slate-800">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-on-surface mb-2 dark:text-white">Audit Ledger</h1>
                    <p className="text-on-surface-variant text-sm max-w-lg leading-relaxed dark:text-slate-400">
                        A centralized record of all automated fairness evaluations and compliance validations conducted within the platform.
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] transition-colors group-focus-within:text-primary">search</span>
                        <input 
                            type="text" 
                            placeholder="Filter audits..." 
                            className="w-72 pl-12 pr-6 py-3 bg-white border border-outline-variant/10 rounded-xl text-xs font-bold outline-none ring-primary/10 focus:ring-4 transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-outline-variant/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-slate-50 transition-all">
                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                        Sort By
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl ring-1 ring-outline-variant/10 shadow-xl overflow-hidden dark:bg-slate-900 dark:ring-slate-800">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                        <tr>
                            <th className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant dark:text-slate-400">Protocol Entity</th>
                            <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant dark:text-slate-400">Classification</th>
                            <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant dark:text-slate-400">Timestamp</th>
                            <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant dark:text-slate-400">Integrity</th>
                            <th className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant text-right dark:text-slate-400">Validation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((row, idx) => (
                            <tr 
                                key={idx} 
                                onClick={() => navigate(`/dashboard?auditId=${row.id}`)} 
                                className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                            >
                                <td className="py-6 px-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">dataset</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-on-surface tracking-tight dark:text-white">{row.dataset}</p>
                                            <p className="text-[10px] text-on-surface-variant uppercase font-medium dark:text-slate-500">Record ID: {row.id?.substring(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-6 px-8 text-xs font-bold text-on-surface-variant">{row.model_type}</td>
                                <td className="py-6 px-8 text-xs font-bold text-on-surface-variant">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px] opacity-40">calendar_today</span>
                                        {row.date}
                                    </div>
                                </td>
                                <td className="py-6 px-8">
                                    <div className="flex items-center gap-4">
                                        <span className={clsx(
                                            "text-xs font-black w-8",
                                            row.status === 'PASS' ? 'text-emerald-600' : 'text-amber-600'
                                        )}>{(row.overall_score * 100).toFixed(0)}%</span>
                                        <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={clsx(
                                                    "h-full rounded-full transition-all duration-1000",
                                                    row.status === 'PASS' ? 'bg-emerald-500' : 'bg-amber-400'
                                                )} 
                                                style={{ width: `${row.overall_score * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-6 px-10 text-right">
                                    <span className={clsx(
                                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                        row.status === 'PASS' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                    )}>
                                        <span className="material-symbols-outlined text-[14px]">
                                            {row.status === 'PASS' ? 'verified' : 'priority_high'}
                                        </span>
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:border-primary/20 transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-primary mb-4">analytics</span>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface mb-1">Global Sentiment</h4>
                    <p className="text-[10px] text-on-surface-variant">Historical bias trend analysis</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:border-primary/20 transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-primary mb-4">policy</span>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface mb-1">Health Summary</h4>
                    <p className="text-[10px] text-on-surface-variant">Compliance health across audits</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:border-primary/20 transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-primary mb-4">inventory</span>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface mb-1">Full Archive</h4>
                    <p className="text-[10px] text-on-surface-variant">Access raw audit log files</p>
                </div>
                <div className="bg-indigo-600 rounded-2xl p-6 flex flex-col justify-end group cursor-pointer overflow-hidden relative">
                    <span className="material-symbols-outlined text-white/20 absolute -right-2 -top-2 text-6xl group-hover:scale-150 transition-transform duration-700">security</span>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Compliance Vault</h4>
                    <p className="text-[10px] text-white/60">Manage security keys</p>
                </div>
            </div>
        </div>
    );
};
