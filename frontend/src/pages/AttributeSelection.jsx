import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUploadStore } from '../store/useUploadStore';
import { useAuditStore } from '../store/useAuditStore';
import { auditService } from '../services/auditService';
import useAuthStore from '../store/useAuthStore';
import clsx from 'clsx';

export const AttributeSelection = () => {
    const navigate = useNavigate();
    const { 
        columns, sensitiveAttributes, toggleSensitiveAttribute, 
        targetColumn, setTargetColumn, modelType, setModelType, 
        file, positiveLabel, setPositiveLabel,
        auditError, setAuditError
    } = useUploadStore();
    const { setAuditResults } = useAuditStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-populate for Sample Mode
    React.useEffect(() => {
        if (useUploadStore.getState().isSampleMode && !targetColumn) {
            setTargetColumn('income');
            setPositiveLabel(' >50K');
            // Check if they are already selected to avoid toggling off
            if (!sensitiveAttributes.includes('sex')) toggleSensitiveAttribute('sex');
            if (!sensitiveAttributes.includes('race')) toggleSensitiveAttribute('race');
        }
    }, [useUploadStore.getState().isSampleMode, targetColumn, setTargetColumn, setPositiveLabel, sensitiveAttributes, toggleSensitiveAttribute]);

    const handleRunAudit = async () => {
        if (!targetColumn || sensitiveAttributes.length === 0) return;
        setIsSubmitting(true);
        setAuditError(null);
        try {
            const userId = useAuthStore.getState().user?.uid;
            const results = await auditService.runAudit(file, sensitiveAttributes, targetColumn, positiveLabel, userId);
            // Ensure state is updated BEFORE navigation
            setAuditResults(results);
            setTimeout(() => navigate('/dashboard'), 100);
        } catch (error) {
            console.error("Audit failed", error);
            // Extract meaningful error from FastAPI detail
            const message = error.response?.data?.detail || error.message || "An unexpected error occurred during the audit.";
            setAuditError(message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-12 animate-in fade-in duration-700 relative">
            
            {/* Top Left Go Back Arrow */}
            <button 
                onClick={() => navigate('/dashboard')}
                className="absolute top-12 left-0 flex items-center justify-center p-3 text-on-surface-variant hover:bg-slate-100 hover:text-primary rounded-full transition-all group"
                title="Go back to Dashboard"
            >
                <span className="material-symbols-outlined text-[24px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            </button>

            {/* Step Indicators */}
            <div className="flex justify-center items-center gap-3 mb-10">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-12 rounded-full bg-slate-200"></div>
                    <span className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant">Data</span>
                </div>
                <div className="h-[1px] w-4 bg-outline-variant opacity-30"></div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-16 rounded-full bg-primary"></div>
                    <span className="text-[11px] font-black tracking-widest uppercase text-primary">Variables</span>
                </div>
                <div className="h-[1px] w-4 bg-outline-variant opacity-30"></div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-12 rounded-full bg-surface-container-highest"></div>
                    <span className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant">Model</span>
                </div>
            </div>

            {/* Selection Card */}
            <div className="bg-white rounded-2xl p-10 ring-1 ring-outline-variant/10 shadow-xl w-full">
                {auditError && (
                    <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <span className="material-symbols-outlined text-error text-[20px]">error</span>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-error">Audit Execution Failed</p>
                            <p className="text-[10px] text-error/80 mt-1">{auditError}</p>
                        </div>
                        <button onClick={() => setAuditError(null)} className="text-error/50 hover:text-error">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                )}

                <div className="mb-10">
                    <h1 className="text-2xl font-black tracking-tight text-on-surface mb-2">Step 2: Define Variables</h1>
                    <p className="text-on-surface-variant text-sm leading-relaxed max-w-lg">
                        Select protected features for localized bias auditing and define the model outcome you wish to evaluate.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left: Protected Attributes */}
                    <div className="space-y-6">
                        <div>
                             <h3 className="text-xs font-black uppercase tracking-widest text-on-surface mb-4 flex items-center">
                                <span className="material-symbols-outlined text-[18px] mr-2 text-primary">verified_user</span>
                                Protected Attributes
                             </h3>
                             <div className="flex flex-wrap gap-2">
                                {columns.map(col => {
                                    const isSelected = sensitiveAttributes.includes(col);
                                    return (
                                        <button
                                            key={col}
                                            onClick={() => toggleSensitiveAttribute(col)}
                                            className={clsx(
                                                "px-4 py-2 rounded-lg text-xs font-bold transition-all border",
                                                isSelected 
                                                    ? "bg-primary text-white border-primary shadow-md" 
                                                    : "bg-surface-container-low border-outline-variant/10 text-on-surface-variant hover:bg-slate-200"
                                            )}
                                        >
                                            {col}
                                        </button>
                                    );
                                })}
                             </div>
                        </div>
                    </div>

                    {/* Right: Target Setup */}
                    <div className="space-y-8">
                         <div>
                             <h3 className="text-xs font-black uppercase tracking-widest text-on-surface mb-4 flex items-center">
                                <span className="material-symbols-outlined text-[18px] mr-2 text-primary">target</span>
                                Model Target
                             </h3>
                             <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Outcome Column</label>
                                    <select 
                                        value={targetColumn} 
                                        onChange={(e) => setTargetColumn(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/10 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option value="" disabled>Select column...</option>
                                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Positive Label</label>
                                    <input 
                                        type="text"
                                        value={positiveLabel}
                                        onChange={(e) => setPositiveLabel(e.target.value)}
                                        placeholder="e.g. 1 or Yes"
                                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/10 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
                                    />
                                    <p className="text-[10px] text-on-surface-variant italic">The value indicating a successful or favorable categorical outcome.</p>
                                </div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-10 mt-10 border-t border-outline-variant/10">
                    <button 
                        onClick={() => navigate('/upload')}
                        className="text-xs font-black text-on-surface-variant uppercase tracking-widest hover:text-on-surface transition-colors"
                    >
                        Go Back
                    </button>
                    <div className="flex gap-4">
                        <button 
                            disabled={isSubmitting || !targetColumn || sensitiveAttributes.length === 0}
                            onClick={handleRunAudit}
                            className="bg-slate-900 text-white px-10 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <span className="material-symbols-outlined animate-spin text-sm mr-2">progress_activity</span>
                                    Auditing...
                                </span>
                            ) : "Execute Fairness Audit"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-start gap-3 p-4 bg-primary/5 rounded-xl max-w-lg">
                <span className="material-symbols-outlined text-primary text-[20px]">lightbulb</span>
                <p className="text-[11px] leading-normal text-on-surface-variant">
                    <strong>Selection Tip:</strong> Auditing multiple sensitive attributes simultaneously allows FairLens to detect <strong>intersectionality bias</strong> patterns.
                </p>
            </div>
        </div>
    );
};
