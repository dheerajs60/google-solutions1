import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Methodology = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F4F4F6] text-on-surface selection:bg-primary/30 selection:text-primary pb-20">
            {/* Header */}
            <header className="h-24 px-10 md:px-20 flex items-center justify-between border-b border-outline-variant/10 bg-white/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-white text-[24px]">troubleshoot</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-on-surface">FairLens</span>
                </div>
                <button 
                    onClick={() => navigate('/upload')}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                >
                    Launch Audit
                </button>
            </header>

            <main className="max-w-6xl mx-auto px-10 py-20 animate-in fade-in duration-700">
                {/* Hero section */}
                <div className="mb-24 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-primary/20">
                        Technical Specification
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-on-surface mb-8 leading-tight">
                        The Science of <span className="text-primary">Algorithmic Equity.</span>
                    </h1>
                    <p className="text-xl text-on-surface-variant max-w-3xl mx-auto font-medium leading-relaxed">
                        FairLens integrates state-of-the-art fairness definitions with clinical-grade model auditing to ensure transparency in high-stakes automated decisions.
                    </p>
                </div>

                {/* Core Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                    {[
                        {
                            icon: "analytics",
                            title: "Bias Mapping",
                            desc: "We utilize heatmaps to visualize group-wise prediction disparities across multi-dimensional sensitive attributes (Race, Gender, Age)."
                        },
                        {
                            icon: "auto_fix_high",
                            title: "Active Mitigation",
                            desc: "Our engine implements Threshold Optimization and Reweighing to simulate fairness-performance trade-offs on the Pareto frontier."
                        },
                        {
                            icon: "psychology",
                            title: "Narrative Audits",
                            desc: "LLM-powered forensic analysis (Gemini 2.0) translates complex statistical variances into actionable insights for compliance officers."
                        }
                    ].map((feature, i) => (
                        <div key={i} className="p-8 rounded-[32px] bg-white border border-outline-variant/10 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group">
                            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-8 group-hover:bg-primary transition-colors">
                                <span className="material-symbols-outlined text-primary group-hover:text-white text-[28px]">{feature.icon}</span>
                            </div>
                            <h3 className="text-xl font-black text-on-surface mb-4 tracking-tight">{feature.title}</h3>
                            <p className="text-on-surface-variant leading-relaxed font-medium">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Mathematical Foundations */}
                <div className="bg-white rounded-[40px] p-10 md:p-16 border border-outline-variant/10 shadow-sm relative overflow-hidden">
                    <h2 className="text-3xl font-black text-on-surface mb-12 tracking-tight flex items-center gap-4">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[18px] text-primary">function</span>
                        </span>
                        Mathematical Fairness Definitions
                    </h2>

                    <div className="space-y-12">
                        {[
                            {
                                term: "Demographic Parity",
                                logic: "P(Ŷ=1 | A=0) = P(Ŷ=1 | A=1)",
                                desc: "Ensuring that the likelihood of receiving a positive prediction is equal across all protected groups, regardless of their representation in the underlying training data."
                            },
                            {
                                term: "Equal Opportunity",
                                logic: "P(Ŷ=1 | Y=1, A=0) = P(Ŷ=1 | Y=1, A=1)",
                                desc: "Focuses on the True Positive Rate. We ensure the model is equally effective at identifying qualified candidates across all sensitive subgroups."
                            },
                            {
                                term: "Disparate Impact (80% Rule)",
                                logic: "Ratio = (Selection Rate B) / (Selection Rate A)",
                                desc: "A regulatory standard used to identify accidental 'proxy' discrimination. FairLens flags any ratio below 0.8 as a severe fairness violation."
                            }
                        ].map((math, i) => (
                            <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border-b border-outline-variant/10 pb-12 last:border-0 last:pb-0">
                                <div>
                                    <h4 className="text-xl font-black text-on-surface mb-3 tracking-tight">{math.term}</h4>
                                    <p className="text-on-surface-variant font-medium leading-relaxed">{math.desc}</p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-6 border border-outline-variant/10 flex items-center justify-center">
                                    <code className="text-primary font-mono text-lg font-bold">
                                        {math.logic}
                                    </code>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Architecture Flow */}
                <div className="mt-32">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="md:w-1/2">
                            <h2 className="text-4xl font-black text-on-surface mb-8 tracking-tighter leading-tight">
                                Integrated <span className="text-primary text-5xl">Clinical-Tech</span> Architecture.
                            </h2>
                            <div className="space-y-6">
                                {[
                                    { t: "Data Sanitization", d: "Automatic handling of missing values and categorical encoding via our Preprocessor engine." },
                                    { t: "The Audit Engine", d: "Leverages Random Forest Ensembles (Scikit-learn) validated with the Fairlearn SDK." },
                                    { t: "Interactive Forensics", d: "Simulate a post-processing threshold shift to see how it impacts your performance curve in real-time." }
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-6">
                                        <div className="text-primary font-black text-lg pt-1">0{i+1}.</div>
                                        <div>
                                            <h5 className="font-black text-on-surface mb-1 uppercase tracking-widest text-xs">{step.t}</h5>
                                            <p className="text-on-surface-variant font-medium text-sm">{step.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="md:w-5/12 relative">
                            <div className="bg-white border border-outline-variant/10 rounded-[32px] p-8 shadow-xl relative z-10 overflow-hidden group">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                            System Integrated
                                        </div>
                                        <h4 className="text-lg font-black text-on-surface">Tech-Stack Health</h4>
                                    </div>
                                    <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">dns</span>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { l: "Engine", v: "Scikit-Learn Ensemble", p: "98%" },
                                        { l: "Audit", v: "Fairlearn Core v0.10", p: "100%" },
                                        { l: "Intelligence", v: "Gemini 2.0 Flash", p: "94%" },
                                        { l: "Backend", v: "FastAPI / Uvicorn", p: "99%" }
                                    ].map((item, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-on-surface-variant">{item.l}</span>
                                                <span className="text-on-surface">{item.v}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary rounded-full transition-all duration-1000" 
                                                    style={{ width: item.p }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-10 pt-8 border-t border-outline-variant/10 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="w-1.5 h-6 bg-outline-variant/30 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                                        ))}
                                    </div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
                                        Syncing Neural Audit Traces...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* CTA */}
            <footer className="mt-20 py-20 border-t border-outline-variant/10 text-center">
                <h3 className="text-2xl font-black text-on-surface mb-10 tracking-tight">Ready to Audit your Intelligence?</h3>
                <button 
                    onClick={() => navigate('/upload')}
                    className="px-10 py-5 bg-primary text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95"
                >
                    Start First Audit
                </button>
            </footer>
        </div>
    );
};
