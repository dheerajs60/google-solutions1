import React from 'react';
import { useAuditStore } from '../store/useAuditStore';
import clsx from 'clsx';

const HeatmapCell = ({ score, status }) => {
    const colorClass = 
        status === 'PASS' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 
        status === 'WARNING' ? 'bg-[#FFF3E0] text-[#EF6C00]' : 
        'bg-[#FFEBEE] text-[#C62828]';

    return (
        <div className={clsx("inline-flex items-center justify-center px-4 py-2 rounded-lg font-black text-xs min-w-[80px]", colorClass)}>
            {score.toFixed(2)}
        </div>
    );
};

export const Heatmap = () => {
    const { heatmap, auditId } = useAuditStore();

    if (!auditId) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center text-on-surface-variant font-medium gap-3">
                <span className="material-symbols-outlined text-4xl text-outline-variant">grid_view</span>
                <span>No active audit. Please run an audit to view the bias heatmap.</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-700 pb-12">
            {/* Educational Header */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-start gap-4">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
                <div>
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-1">Intersectionality: How it works</h3>
                    <p className="text-[10px] text-on-surface-variant leading-relaxed max-w-3xl font-medium">
                        The Heatmap isolates specific demographic slices to reveal where bias is concentrated. <strong>Intersectional Analysis</strong> is critical because models often perform fairly on broad groups (e.g., 'Gender') but fail on specific combinations (e.g., 'Young Female' vs 'Senior Male'). 
                        <br/><br/>
                        A <strong>Demographic Parity</strong> pass combined with a <strong>Disparate Impact</strong> fail indicates that while the selection rate is balanced, the model's errors are still skewing against specific protected classes.
                    </p>
                </div>
            </div>

            <div>
                <h1 className="text-2xl font-black tracking-tighter text-on-surface mb-2">Bias Heatmap</h1>
                <p className="text-sm text-on-surface-variant max-w-2xl">High-fidelity isolation of bias distribution across audited features.</p>
            </div>

            <div className="card-layer overflow-hidden bg-white shadow-xl ring-1 ring-slate-200/50">
                <div className="p-8 border-b border-outline-variant/10 bg-slate-50/50">
                    <h3 className="headline-small mb-1 font-black">Intersectional Audit Traces</h3>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Metric performance across groups</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Sensitive Attribute</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-center border-l border-outline-variant/10">Demographic Parity</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-center border-l border-outline-variant/10">Equal Opportunity</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-center border-l border-outline-variant/10">Disparate Impact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                            {heatmap?.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                                            <span className="text-sm font-black text-slate-900">{row.attribute}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center border-l border-outline-variant/10 text-slate-500">
                                        <HeatmapCell score={row.demographic_parity.score} status={row.demographic_parity.status} />
                                    </td>
                                    <td className="px-8 py-6 text-center border-l border-outline-variant/10 text-slate-500">
                                        <HeatmapCell score={row.equal_opportunity.score} status={row.equal_opportunity.status} />
                                    </td>
                                    <td className="px-8 py-6 text-center border-l border-outline-variant/10 text-slate-500">
                                        <HeatmapCell score={row.disparate_impact.score} status={row.disparate_impact.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-8 bg-slate-50/50 border-t border-outline-variant/10">
                    <div className="flex items-start space-x-4">
                        <span className="material-symbols-outlined text-primary text-xl translate-y-0.5">info</span>
                        <div>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">How to read this heatmap</p>
                            <p className="text-[10px] text-on-surface-variant leading-relaxed font-medium">
                                Values close to 1.0 indicate perfect parity (fairness). Red cells represent critical bias hotspots where specific demographic groups are subject to systemic disadvantage under the current model constraints.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
