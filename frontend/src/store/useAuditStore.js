import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auditService } from '../services/auditService';

export const useAuditStore = create(
    persist(
        (set, get) => ({
            // Core Audit Data
            auditId: null,
            overallScore: null,
            metrics: null,
            heatmap: [],
            lineage: [],
            geminiExplanation: '',
            groupComparisons: [],
            isLoading: false,
            isAIAnalysing: false,
            aiAnalysisFailed: false,
            error: null,
            
            fetchAIAnalysis: async (id) => {
                const auditId = id || get().auditId;
                if (!auditId) return;
                
                set({ isAIAnalysing: true, aiAnalysisFailed: false, geminiExplanation: '' });
                try {
                    await auditService.getAnalysisStream(auditId, (chunk) => {
                        set((state) => ({ 
                            geminiExplanation: state.geminiExplanation + chunk 
                        }));
                    });
                } catch (err) {
                    console.error("AI Analysis streaming failed:", err);
                    set({ aiAnalysisFailed: true });
                } finally {
                    set({ isAIAnalysing: false });
                }
            },
            
            // Mitigation Simulation State
            reweighingStrength: 0.5,
            thresholdAdjust: 0.5,
            applyPostProcessing: false,
            mitigationResult: null,

            setAuditResults: (results) => {
                set({
                    auditId: results.id,
                    overallScore: results.overall_score,
                    metrics: results.metrics,
                    heatmap: results.heatmap,
                    lineage: results.lineage,
                    geminiExplanation: results.gemini_explanation,
                    groupComparisons: results.group_comparisons,
                    aiAnalysisFailed: false,
                    error: null
                });
                
                // If backend returns existing mitigation, apply it
                if (results.mitigation_results) {
                    get().applyMitigation(results.mitigation_results);
                } else {
                    set({ mitigationResult: null, mitigationActive: false });
                }
            },

            setMitigationState: (updates) => set((state) => ({ ...state, ...updates })),
            
            fetchAudit: async (id) => {
                const auditId = id || get().auditId;
                if (!auditId) return;
                
                set({ isLoading: true, error: null });
                try {
                    const results = await auditService.getAudit(auditId);
                    // If we passed an ID from URL, update the stored auditId
                    if (id) set({ auditId: id });
                    get().setAuditResults(results);
                } catch (err) {
                    set({ error: err.message || 'Failed to fetch audit' });
                } finally {
                    set({ isLoading: false });
                }
            },
            
            applyMitigation: (mitigationResult) => {
                if (!mitigationResult) return;
                
                const { after_metrics, pareto_points } = mitigationResult;
                const optimizedPoint = pareto_points.find(p => p.type === 'After Mitigation');
                
                set((state) => ({
                    mitigationResult,
                    mitigationActive: true,
                    metrics: after_metrics,
                    overallScore: optimizedPoint ? optimizedPoint.fairness : state.overallScore,
                    lineage: [
                        ...state.lineage,
                        { stage: "Mitigation Applied", status: "PASS", description: "Successfully applied threshold optimization" }
                    ]
                }));
            },
            
            clearAudit: () => set({
                auditId: null,
                overallScore: null,
                metrics: null,
                heatmap: [],
                lineage: [],
                geminiExplanation: '',
                groupComparisons: [],
                mitigationResult: null,
                aiAnalysisFailed: false,
                error: null
            })
        }),
        {
            name: 'fairlens-audit-storage',
            partialize: (state) => ({ auditId: state.auditId })
        }
    )
);
