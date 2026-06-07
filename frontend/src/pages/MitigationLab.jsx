import React from 'react';
import { useAuditStore } from '../store/useAuditStore';
import { useUploadStore } from '../store/useUploadStore';
import { auditService } from '../services/auditService';
import { ParetoChart } from '../components/charts/ParetoChart';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

export const MitigationLab = () => {
    const { 
        auditId, metrics, applyMitigation,
        reweighingStrength, thresholdAdjust, applyPostProcessing,
        mitigationResult, setMitigationState
    } = useAuditStore();
    const { columns, targetColumn, file } = useUploadStore();
    const [isSimulating, setIsSimulating] = React.useState(false);
    const navigate = useNavigate();

    const paretoPoints = mitigationResult?.pareto_points || [];
    const afterMetrics = mitigationResult?.after_metrics;

    const handleSimulate = async () => {
        if (!auditId) return;
        setIsSimulating(true);
        try {
            const result = await auditService.runMitigation(auditId, reweighingStrength, thresholdAdjust, applyPostProcessing);
            setMitigationState({ mitigationResult: result });
        } catch (error) {
            console.error("Mitigation simulation failed", error);
        } finally {
            setIsSimulating(false);
        }
    };

    const handleApply = () => {
        applyMitigation(mitigationResult);
        navigate('/dashboard');
    };

    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-700 pb-12">
            {/* Educational Header */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-start gap-4">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>precision_manufacturing</span>
                <div>
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-1">Bias Remediation: How it works</h3>
                    <p className="text-[10px] text-on-surface-variant leading-relaxed max-w-3xl font-medium">
                        The Mitigation Lab allows you to surgically remove bias using two distinct methods. <strong>Reweighing</strong> is a <em>Pre-processing</em> technique that adjusts the importance of data samples before the model learns from them. <strong>Threshold Adjustment</strong> is a <em>Post-processing</em> technique that optimizes decision boundaries after a model is trained to ensure equalized outcomes.
                        <br/><br/>
                        Simulating a mitigation creates a **Pareto Frontier**, showing the mathematical trade-off between absolute accuracy and fairness compliance.
                    </p>
                </div>
            </div>

            <div>
                <h1 className="text-2xl font-black tracking-tighter text-on-surface mb-2">Mitigation Lab</h1>
                <p className="text-sm text-on-surface-variant max-w-2xl">Tune fairness algorithms and observe real-time trade-offs between bias removal and model performance.</p>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* Control Panel */}
                <div className="col-span-1 xl:col-span-4 space-y-6 sticky top-24">
                    <div className="card-layer p-6 bg-white overflow-hidden relative">
                         <div className="absolute top-0 right-0 p-4 opacity-10">
                            <span className="material-symbols-outlined text-4xl">tune</span>
                        </div>
                        <h3 className="headline-small mb-8 flex items-center space-x-2">
                            <span>Technique Tuning</span>
                        </h3>
                        
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Reweighing</label>
                                    <span className="text-sm font-black text-primary bg-primary/5 px-2 py-0.5 rounded">{Math.round((reweighingStrength || 0.5) * 100)}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="1" step="0.05" 
                                    value={reweighingStrength || 0.5} 
                                    onChange={(e) => setMitigationState({ reweighingStrength: parseFloat(e.target.value) })}
                                    className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
                                />
                                <p className="text-[10px] leading-relaxed text-on-surface-variant">Reweighting samples to balance group-wise representation.</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Post-Processing</label>
                                    <span className="text-sm font-black text-primary bg-primary/5 px-2 py-0.5 rounded">{Math.round((thresholdAdjust || 0.5) * 100)}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="1" step="0.05" 
                                    value={thresholdAdjust || 0.5} 
                                    onChange={(e) => setMitigationState({ thresholdAdjust: parseFloat(e.target.value) })}
                                    className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
                                />
                                <p className="text-[10px] leading-relaxed text-on-surface-variant">Threshold optimization for equalized odds compliance.</p>
                            </div>

                            <div className="pt-4 flex items-center space-x-3">
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={applyPostProcessing || false}
                                        onChange={(e) => setMitigationState({ applyPostProcessing: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </div>
                                <span className="text-xs font-bold text-on-surface">Auto-Correct (Aggressive)</span>
                            </div>

                            <button 
                                onClick={handleSimulate}
                                disabled={isSimulating || !auditId}
                                className="w-full py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSimulating ? "Simulating Traces..." : "Simulate Mitigation"}
                            </button>

                            {mitigationResult && (
                                <button 
                                    onClick={handleApply}
                                    className="w-full py-4 bg-secondary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-secondary/90 transition-all shadow-lg active:scale-[0.98]"
                                >
                                    Apply to Dashboard
                                </button>
                            )}
                        </div>
                    </div>

                    {!auditId && (
                        <div className="card-layer p-4 bg-error/10 border-none">
                            <p className="text-[10px] text-error font-bold text-center">No active audit. Please run an audit in the Dashboard first.</p>
                        </div>
                    )}

                    <div className="card-layer p-4 bg-primary/5 border-none">
                         <div className="flex items-start space-x-3">
                            <span className="material-symbols-outlined text-primary text-lg">info</span>
                            <p className="text-[10px] leading-normal text-primary/80 font-medium">
                                <strong>Pro-Tip:</strong> High reweighing strength often increases fairness but may slightly degrade overall model precision in sparse regions.
                            </p>
                         </div>
                    </div>
                </div>

                {/* Results and Comparison */}
                <div className="col-span-1 xl:col-span-8 space-y-8">
                    {/* Metrics Comparison Grid */}
                    <div className="bg-white rounded-2xl ring-1 ring-outline-variant/10 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-outline-variant/10 bg-surface-container-lowest">
                            <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Live Comparison</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant/10">
                            {[
                                { label: 'Demographic Parity', key: 'demographic_parity' },
                                { label: 'Equal Opportunity', key: 'equal_opportunity' },
                                { label: 'Disparate Impact', key: 'disparate_impact' }
                            ].map((item) => {
                                const original = metrics?.[item.key]?.value || 0;
                                const mitigated = afterMetrics?.[item.key]?.value;
                                const diff = mitigated ? mitigated - original : 0;
                                
                                return (
                                    <div key={item.key} className="p-8 space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-tighter text-on-surface-variant">{item.label}</p>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Before</span>
                                                <span className="text-xl font-bold text-on-surface">{original.toFixed(2)}</span>
                                            </div>
                                            <span className="material-symbols-outlined text-outline-variant">trending_flat</span>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">After</span>
                                                <span className={clsx("text-2xl font-black", typeof mitigated === 'number' ? (diff > 0 ? "text-secondary" : "text-error") : "text-on-surface")}>
                                                    {typeof mitigated === 'number' ? mitigated.toFixed(2) : '-.--'}
                                                </span>
                                            </div>
                                        </div>
                                        {typeof mitigated === 'number' && (
                                            <div className={clsx(
                                                "inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter",
                                                diff > 0 ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"
                                            )}>
                                                <span className="material-symbols-outlined text-sm mr-1">{diff > 0 ? 'expand_less' : 'expand_more'}</span>
                                                {Math.abs(diff*100).toFixed(0)}% Shift
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Pareto Chart */}
                    <div className="card-layer p-8 bg-white">
                        <div className="flex justify-between items-center mb-8">
                             <div>
                                <h3 className="headline-small">Pareto Frontier</h3>
                                <p className="text-xs text-on-surface-variant">Optimizing the accuracy-fairness trade-off curve.</p>
                             </div>
                             <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary/20 ring-2 ring-primary"></div>
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">Current</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-secondary/20 ring-2 ring-secondary"></div>
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">Optimized</span>
                                </div>
                             </div>
                        </div>
                        <ParetoChart points={paretoPoints} isLoading={isSimulating} />
                    </div>
                </div>

            </div>
        </div>
    );
};
