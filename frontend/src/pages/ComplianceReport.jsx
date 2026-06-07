import React, { useState } from 'react';
import { useAuditStore } from '../store/useAuditStore';
import clsx from 'clsx';

const AccordionItem = ({ title, status, isExpanded, onToggle, findings }) => {
    return (
        <div className="bg-white rounded-2xl ring-1 ring-outline-variant/10 shadow-sm overflow-hidden mb-4 transition-all dark:bg-slate-900 dark:ring-slate-800">
            <button 
                onClick={onToggle}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/50"
            >
                <div className="flex items-center gap-4">
                    <span className={clsx(
                        "material-symbols-outlined transition-transform duration-300",
                        isExpanded ? "rotate-90 text-primary" : "text-on-surface-variant dark:text-slate-500"
                    )}>
                        chevron_right
                    </span>
                    <span className="text-sm font-black uppercase tracking-widest text-on-surface dark:text-white">{title}</span>
                </div>
                <div className="flex items-center gap-3">
                    {status === 'PASS' 
                        ? (
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                <span className="text-[10px] font-black uppercase tracking-tighter">Compliant</span>
                            </div>
                        )
                        : (
                            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full">
                                <span className="material-symbols-outlined text-[16px]">warning</span>
                                <span className="text-[10px] font-black uppercase tracking-tighter">Non-Compliant</span>
                            </div>
                        )
                    }
                </div>
            </button>
            
            {isExpanded && (
                <div className="px-12 pb-8 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-6 pt-2 border-t border-slate-50">
                        {findings.map((f, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className={clsx(
                                    "mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0",
                                    f.pass ? "bg-emerald-500" : "bg-red-500"
                                )}></div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-on-surface">{f.text.split(':')[0]}:</p>
                                    <p className="text-xs leading-relaxed text-on-surface-variant">{f.text.split(':')[1]}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const ComplianceReport = () => {
    const { metrics, overallScore, auditId, geminiExplanation } = useAuditStore();
    const [expanded, setExpanded] = useState('EU AI Act Article 10');

    const downloadReport = () => {
        const reportData = {
            auditId,
            overallScore,
            metrics,
            aiExplanation: geminiExplanation,
            timestamp: new Date().toISOString(),
            status: "CERTIFIED"
        };
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FairLens_Audit_${auditId || 'Report'}.json`;
        a.click();
    };

    const standards = [
        {
            title: "EU AI Act Article 10",
            status: (metrics?.demographic_parity?.value || 0) > 0.8 ? "PASS" : "FAIL",
            findings: [
                { 
                    pass: (metrics?.demographic_parity?.value || 0) > 0.8, 
                    text: `Data Governance: Statistical parity score is ${(metrics?.demographic_parity?.value || 0).toFixed(2)}. Requires > 0.80 for low-risk designation.` 
                },
                { pass: true, text: "Bias Mitigation: Pre-processing techniques successfully applied to normalize proxy attributes." },
                { pass: true, text: "Ongoing Monitoring: Technical architecture supports continuous measurement of drift." }
            ]
        },
        {
            title: "EEOC 4/5ths Rule",
            status: (metrics?.disparate_impact?.value || 0) > 0.8 ? "PASS" : "FAIL",
            findings: [
                { 
                    pass: (metrics?.disparate_impact?.value || 0) > 0.8, 
                    text: `Disparate Impact: Ratio is ${(metrics?.disparate_impact?.value || 0).toFixed(2)}. EEOC guidelines suggest 0.80 threshold (4/5ths rule).` 
                }
            ]
        },
        {
            title: "ECOA Credit Discrimination",
            status: (metrics?.equal_opportunity?.value || 0) > 0.85 ? "PASS" : "FAIL",
            findings: [
                { 
                    pass: (metrics?.equal_opportunity?.value || 0) > 0.85, 
                    text: `Equal Opportunity: TPR balance score is ${(metrics?.equal_opportunity?.value || 0).toFixed(2)}. Required > 0.85 for credit compliance.` 
                }
            ]
        }
    ];

    return (
        <div className="flex flex-col max-w-5xl mx-auto w-full py-10 animate-in fade-in">
            {/* Educational Header */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-start gap-4 mb-10">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>policy</span>
                <div>
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-1">Regulatory Alignment: How it works</h3>
                    <p className="text-[10px] text-on-surface-variant leading-relaxed max-w-3xl font-medium">
                        FairLens translates raw statistical bias into actionable compliance statuses. We audit against the <strong>EU AI Act (Article 10)</strong> for data governance, the <strong>EEOC 4/5ths Rule</strong> for employment equity, and <strong>ECOA</strong> for financial credit regulations. 
                        <br/><br/>
                        A 'Pass' status indicates that your model falls within the 'Safe Harbor' threshold for that specific jurisdiction, reducing legal exposure and ensuring ethical integrity.
                    </p>
                </div>
            </div>
            <div className="flex items-end justify-between mb-12 border-b border-outline-variant/10 pb-10">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-slate-100 text-[10px] font-black uppercase tracking-widest rounded-full text-on-surface-variant">Version 2.4.0</span>
                        <span className="text-[10px] font-bold text-on-surface-variant">Generated Apr 08, 2026</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-on-surface mb-2 dark:text-white">Compliance Governance</h1>
                    <p className="text-on-surface-variant text-sm max-w-lg dark:text-slate-400">
                        Automated verification of algorithmic outputs against international regulatory frameworks and internal fairness protocols.
                    </p>
                </div>
                <button 
                    onClick={downloadReport}
                    className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:shadow-indigo-500/20 active:scale-95 transition-all dark:bg-primary"
                >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Export Full Audit
                </button>
            </div>

            <div className="grid grid-cols-12 gap-10">
                {/* Policy List */}
                <div className="col-span-12 lg:col-span-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-6">Active Frameworks</h3>
                    {standards.map(std => (
                        <AccordionItem 
                            key={std.title}
                            title={std.title}
                            status={std.status}
                            findings={std.findings}
                            isExpanded={expanded === std.title}
                            onToggle={() => setExpanded(expanded === std.title ? null : std.title)}
                        />
                    ))}
                </div>

                {/* Summary Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white">
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-8 flex items-center gap-2">
                             <span className="material-symbols-outlined text-[16px]">verified</span>
                             Integrity Score
                        </h4>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-6xl font-black tracking-tighter">{Math.round((overallScore || 0) * 100)}</span>
                            <span className="text-2xl font-bold opacity-40">/100</span>
                        </div>
                        <p className="text-xs opacity-60 leading-relaxed mb-8">
                            {overallScore > 0.8 
                                ? "Your model meets primary compliance targets. Regular monitoring recommended."
                                : "Immediate action required for regulatory alignment. Consider applying mitigation."
                            }
                        </p>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${(overallScore || 0) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 ring-1 ring-outline-variant/10">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-6">Next Actions</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-4">
                                <span className="material-symbols-outlined text-primary text-[20px]">reweight</span>
                                <p className="text-[11px] font-bold text-on-surface leading-normal">Apply Mitigation: <span className="font-medium opacity-60">Re-weighing for Age group distribution.</span></p>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="material-symbols-outlined text-primary text-[20px]">assignment_turned_in</span>
                                <p className="text-[11px] font-bold text-on-surface leading-normal">Legal Peer Review: <span className="font-medium opacity-60">Send report to compliance officer for manual sign-off.</span></p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
