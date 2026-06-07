import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuditStore } from '../store/useAuditStore';
import { MetricCard } from '../components/shared/MetricCard';
import { HeatmapCell } from '../components/shared/HeatmapCell';
import { BiasLineage } from '../components/dashboard/BiasLineage';
import { geminiService } from '../services/geminiService';
import { Activity } from 'lucide-react';
import { auditService } from '../services/auditService';
import ReactMarkdown from 'react-markdown';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { clsx } from 'clsx';

export const Dashboard = () => {
    const { 
        overallScore, 
        metrics, 
        heatmap, 
        lineage, 
        geminiExplanation, 
        auditId: currentAuditId, 
        fetchAudit, 
        fetchAIAnalysis,
        isLoading, 
        isAIAnalysing,
        aiAnalysisFailed,
        error,
        mitigationActive 
    } = useAuditStore();
    
    const [recentActivites, setRecentActivities] = useState([]);
    const location = useLocation();
    const [typedExplanation, setTypedExplanation] = useState('');
    const explanationRef = useRef('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlAuditId = params.get('auditId');
        
        if (urlAuditId && urlAuditId !== currentAuditId) {
            fetchAudit(urlAuditId);
        } else if (currentAuditId && !metrics && !isLoading && !error) {
            fetchAudit(currentAuditId);
        }
    }, [location.search, currentAuditId, metrics, isLoading, error, fetchAudit]);

    // Automatically trigger AI analysis if missing
    useEffect(() => {
        if (metrics && !geminiExplanation && !isAIAnalysing && !aiAnalysisFailed && currentAuditId) {
            fetchAIAnalysis(currentAuditId);
        }
    }, [metrics, geminiExplanation, isAIAnalysing, aiAnalysisFailed, currentAuditId, fetchAIAnalysis]);
    
    // Fetch real history for the dashboard
    useEffect(() => {
        const userId = auditService.getUserId();
        auditService.getHistory(userId).then(data => {
            setRecentActivities(data.slice(0, 3));
        });
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-6 animate-pulse">
                <div className="relative">
                    <div className="h-20 w-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
                    <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary text-3xl">troubleshoot</span>
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-bold text-on-surface dark:text-white">Analyzing bias patterns...</h3>
                    <p className="text-sm text-on-surface-variant dark:text-slate-400">Our forensic engine is evaluating demographic parity and error equity.</p>
                </div>
            </div>
        );
    }

    if (error) {
        const is404 = error.includes('404') || error.includes('not found');
        
        if (is404) {
            // If it's a 404, just show the the same "Initialize" screen as no metrics
            return (
                <div className="flex flex-col gap-10 w-full animate-in fade-in py-10">
                    <div className="flex flex-col items-center justify-center min-h-[300px] gap-8 bg-slate-50 rounded-3xl border border-slate-100 p-12 dark:bg-slate-900/50 dark:border-slate-800 transition-colors">
                        <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center dark:bg-amber-900/20">
                            <span className="material-symbols-outlined text-amber-600 text-4xl">inventory_2</span>
                        </div>
                        <div className="text-center max-w-lg space-y-3">
                            <h2 className="text-2xl font-black tracking-tight text-on-surface dark:text-white">Audit Session Expired</h2>
                            <p className="text-sm text-on-surface-variant leading-relaxed dark:text-slate-400 font-medium">
                                The requested audit record could not be found or has expired from the cache. Start a new protocol to continue.
                            </p>
                        </div>
                        <Link 
                            to="/upload"
                            className="flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:scale-95 transition-all dark:bg-primary"
                        >
                            <span className="material-symbols-outlined text-[20px]">upload_file</span>
                            Start New Audit
                        </Link>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-8 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-3xl bg-error/5 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-error/10 blur-2xl rounded-full animate-pulse"></div>
                    <span className="material-symbols-outlined text-error text-5xl relative z-10">error_med</span>
                </div>
                
                <div className="text-center max-w-md space-y-3">
                    <h2 className="text-2xl font-black tracking-tight text-on-surface dark:text-white">Audit Integrity Compromised</h2>
                    <p className="text-sm text-on-surface-variant leading-relaxed dark:text-slate-400">
                        {error}. Ensure your dataset configuration matches the schema requirements.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => fetchAudit(currentAuditId)}
                        className="px-8 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:-translate-y-1 active:scale-95 transition-all"
                    >
                        Retry Audit Trace
                    </button>
                    <Link 
                        to="/upload"
                        className="px-8 py-4 bg-white border border-outline-variant/20 text-on-surface rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:hover:bg-slate-800"
                    >
                        Start New Protocol
                    </Link>
                </div>
            </div>
        );
    }

    if (!metrics && !currentAuditId) {
        return (
            <div className="flex flex-col gap-10 w-full animate-in fade-in py-10">
                <div className="flex flex-col items-center justify-center min-h-[300px] gap-8 bg-slate-50 rounded-3xl border border-slate-100 p-12 dark:bg-slate-900/50 dark:border-slate-800 transition-colors">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-4xl">analytics</span>
                    </div>
                    <div className="text-center max-w-lg space-y-3">
                        <h2 className="text-2xl font-black tracking-tight text-on-surface dark:text-white">Initialize Your Auditing Protocol</h2>
                        <p className="text-sm text-on-surface-variant leading-relaxed dark:text-slate-400 font-medium">
                            The FairLens dashboard is ready for analysis. Upload a dataset or select a historical record from the ledger below to start investigating bias signatures.
                        </p>
                    </div>
                    <Link 
                        to="/upload"
                        className="flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 active:scale-95 transition-all dark:bg-primary"
                    >
                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                        Start New Audit
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant dark:text-slate-500 mb-4">Recent Platform Activity</h3>
                        <div className="bg-white rounded-3xl ring-1 ring-outline-variant/10 shadow-sm overflow-hidden dark:bg-slate-900 dark:ring-slate-800">
                             {recentActivites.length > 0 ? (
                                 recentActivites.map((row, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => navigate(`/dashboard?auditId=${row.id}`)}
                                        className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0 dark:border-slate-800 dark:hover:bg-slate-800/50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center dark:bg-slate-800">
                                                <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-on-surface dark:text-white">{row.dataset}</p>
                                                <p className="text-[9px] text-on-surface-variant uppercase tracking-tighter dark:text-slate-500 font-black">{row.date} • {row.model_type}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={clsx(
                                                "text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                                row.status === 'PASS' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                            )}>
                                                {row.status}
                                            </span>
                                            <span className="material-symbols-outlined text-on-surface-variant text-sm opacity-20 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">chevron_right</span>
                                        </div>
                                    </div>
                                 ))
                             ) : (
                                 <div className="p-12 text-center text-on-surface-variant font-medium text-xs opacity-50 italic">
                                     Protocol history is empty. Your first audit will appear here.
                                 </div>
                             )}
                        </div>
                    </div>
                    
                    <div className="md:col-span-1 space-y-6">
                        <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden group shadow-2xl h-full flex flex-col justify-between min-h-[300px]">
                            <div className="relative z-10">
                                <span className="material-symbols-outlined text-primary text-4xl mb-4">clinical_notes</span>
                                <h4 className="text-xl font-bold mb-2">Automated Compliance</h4>
                                <p className="text-xs text-white/50 leading-relaxed font-medium">
                                    FairLens provides intersectional bias detection grounded in EU AI Act and EEOC frameworks.
                                </p>
                            </div>
                            <div className="relative z-10 pt-8 mt-auto">
                                <Link to="/history" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors">
                                    Open Ledger Archive <span className="material-symbols-outlined text-sm">north_east</span>
                                </Link>
                            </div>
                            <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[180px] text-white/5 -rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-transform duration-1000">verified</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-700 transition-colors">
            {/* Educational Header */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-start gap-4 dark:bg-slate-900 dark:border-slate-800">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
                <div>
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-1">Audit Protocol: How it works</h3>
                    <p className="text-[10px] text-on-surface-variant leading-relaxed max-w-3xl font-medium dark:text-slate-400">
                        This dashboard provides a high-fidelity overview of your model's fairness signature. The <strong>Integrity Score</strong> is a weighted average of three critical dimensions: <strong>Selection Parity</strong> (are outcomes balanced?), <strong>Error Equity</strong> (are mistakes distributed fairly?), and <strong>Impact Ratios</strong> (long-term societal effects). 
                        <br/><br/>
                        Use the <strong>Bias Lineage</strong> trace on the right to track how decisions moved through the audit pipe, and review the <strong>Lead Auditor's Report</strong> below for AI-driven clinical insights.
                    </p>
                </div>
            </div>

            {/* Summary Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    title="Overall Fairness" 
                    score={overallScore} 
                    description="Aggregate score across all metrics"
                />
                <MetricCard 
                    title="Demographic Parity" 
                    score={metrics?.demographic_parity?.value} 
                    description={metrics?.demographic_parity?.description}
                />
                <MetricCard 
                    title="Equal Opportunity" 
                    score={metrics?.equal_opportunity?.value} 
                    description={metrics?.equal_opportunity?.description}
                />
                <MetricCard 
                    title="Disparate Impact" 
                    score={metrics?.disparate_impact?.value} 
                    description={metrics?.disparate_impact?.description}
                />
            </div>

            {/* Row 2: Gemini Analysis and Lineage */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gemini AI Explanation Panel */}
                <div className="lg:col-span-2 card-layer border-l-4 border-l-primary p-6 relative overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300">
                    <div className="absolute top-0 right-0 p-4">
                        <div className="flex items-center space-x-1.5 bg-primary/5 px-3 py-1 rounded-full dark:bg-primary/10">
                            <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                            <span className="text-[10px] font-bold text-primary tracking-tight uppercase">Vertex AI • Gemini 1.5 Pro</span>
                        </div>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-on-surface mb-4 dark:text-white">Forensic Bias Analysis</h2>
                    <div className="space-y-4 max-w-2xl min-h-[140px]">
                        {isAIAnalysing && !geminiExplanation ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-2.5 bg-slate-100 rounded-full w-48 dark:bg-slate-800"></div>
                                <div className="h-2 bg-slate-100 rounded-full max-w-[480px] dark:bg-slate-800"></div>
                                <div className="h-2 bg-slate-100 rounded-full max-w-[400px] dark:bg-slate-800"></div>
                                <div className="h-2 bg-slate-100 rounded-full max-w-[440px] dark:bg-slate-800"></div>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-4">Forensic Auditor is thinking...</p>
                            </div>
                        ) : geminiExplanation ? (
                            <>
                                <div className="prose prose-sm dark:prose-invert max-w-none text-on-surface-variant leading-relaxed dark:text-slate-300">
                                    <ReactMarkdown>{geminiExplanation}</ReactMarkdown>
                                    {isAIAnalysing && <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse"></span>}
                                </div>
                                
                                {/* Visual Chart for Clarity */}
                                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-6">Visual Parity Analysis</h3>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                layout="vertical"
                                                data={[
                                                    { name: 'Disparate Impact', value: metrics?.disparate_impact?.value || 0 },
                                                    { name: 'Demographic Parity', value: metrics?.demographic_parity?.value || 0 },
                                                    { name: 'Equal Opportunity', value: metrics?.equal_opportunity?.value || 0 }
                                                ]}
                                                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                                <XAxis type="number" domain={[0, 1]} tick={{fontSize: 10}} />
                                                <YAxis type="category" dataKey="name" tick={{fontSize: 10, fontWeight: 'bold'}} />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <ReferenceLine x={0.8} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: '80% Rule', fontSize: 10, fill: '#ef4444' }} />
                                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                                    {
                                                        [0.8, 0.8, 0.8].map((threshold, index) => (
                                                            <Cell 
                                                                key={`cell-${index}`} 
                                                                fill={metrics?.disparate_impact?.value < 0.8 ? '#f43f5e' : '#10b981'} 
                                                            />
                                                        ))
                                                    }
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 italic">* Red line indicates the 80% (0.8) regulatory threshold for Disparate Impact.</p>
                                </div>

                                <div className="flex items-center gap-4 mt-6">
                                    <Link to="/report" className="inline-flex items-center text-primary font-bold text-xs hover:underline">
                                        View Web Report
                                        <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                                    </Link>
                                    <button 
                                        onClick={() => auditService.downloadAuditCSV(currentAuditId)}
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all dark:border-slate-800 dark:hover:bg-slate-800"
                                    >
                                        <span className="material-symbols-outlined text-sm">download</span>
                                        Download Audit Report (CSV)
                                    </button>
                                </div>
                            </>
                        ) : aiAnalysisFailed ? (
                            <div className="py-4 px-4 bg-error/10 border border-error/20 rounded-xl">
                                <p className="text-xs text-error font-medium mb-3">
                                    <strong>AI Quota Exceeded:</strong> The Gemini AI service is currently rate limited or unavailable. The core audit metrics above are fully calculated and mathematically sound.
                                </p>
                                <button 
                                    onClick={() => fetchAIAnalysis(currentAuditId)}
                                    className="px-4 py-2 bg-error text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-error/90 active:scale-95 transition-all"
                                >
                                    Retry AI Report
                                </button>
                            </div>
                        ) : (
                            <div className="py-2">
                                <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed mb-4">
                                    The Lead Auditor is ready to investigate the audit traces and identify statistical drivers for the detected bias.
                                </p>
                                <button 
                                    onClick={() => fetchAIAnalysis(currentAuditId)}
                                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest group active:scale-95 transition-all shadow-lg shadow-primary/20"
                                >
                                    <span className="material-symbols-outlined text-[18px]">clinical_notes</span>
                                    Generate Forensic Report
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Bias Lineage & Activity */}
                <div className="lg:col-span-1 space-y-8 sticky top-24 self-start">
                    <BiasLineage stages={lineage} />
                    
                    {/* Activity Feed */}
                    <div className="card-layer p-6 dark:bg-slate-900 border-outline-variant/10">
                        <h3 className="headline-small mb-4">Recent Audit Activity</h3>
                        <div className="space-y-4">
                            {recentActivites.length > 0 ? recentActivites.slice(0, 3).map((act, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg ${act.status === 'PASS' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'} flex items-center justify-center`}>
                                        <span className={`material-symbols-outlined ${act.status === 'PASS' ? 'text-emerald-600' : 'text-amber-600'} text-lg`}>
                                            {act.status === 'PASS' ? 'check_circle' : 'priority_high'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-on-surface dark:text-white">Audit {act.status}</p>
                                        <p className="text-[10px] text-on-surface-variant dark:text-slate-400 uppercase tracking-tighter font-black">{act.dataset}</p>
                                        <span className="text-[9px] text-slate-400 font-medium tracking-tighter">{act.date}</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-[10px] text-on-surface-variant italic opacity-60">No recent activity found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Version Footer for Verification */}
            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 opacity-20">
                <p className="text-[10px] text-center font-bold uppercase tracking-widest">FairLens Engine v2.2.0 - Stabilized Architecture</p>
            </div>
        </div>
    );
};
