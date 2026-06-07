import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../services/authService';

export const Landing = () => {
    const navigate = useNavigate();

    const handleSignIn = async () => {
        try {
            await signInWithGoogle();
            navigate('/dashboard');
        } catch (error) {
            console.error('Sign in failed', error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
            {/* Nav */}
            <nav className="h-24 w-full flex items-center justify-between px-10 md:px-20 absolute top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-xl">
                        <span className="material-symbols-outlined text-white text-[24px]">troubleshoot</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-slate-900">
                        FairLens
                    </span>
                </div>
                
                <div className="hidden md:flex gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <a href="#" className="hover:text-slate-900 transition-colors">Technology</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Compliance</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Enterprise</a>
                </div>
                
                <div className="flex items-center gap-6">
                    <button 
                        onClick={handleSignIn}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                        Sign in with Google
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-10 md:px-20 pt-32 max-w-7xl mx-auto w-full relative z-10">
                
                <div className="w-full lg:w-1/2 flex flex-col items-start lg:pr-12 text-center lg:text-left items-center lg:items-start">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-indigo-100/50">
                        <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                        Precision Bias Auditing
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.95] mb-8">
                        The Clinical Standard for <span className="gradient-text">AI Fairness.</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10 max-w-xl">
                        A high-fidelity platform designed for researchers and compliance officers to detect algorithmic bias, simulate mitigations, and automate regulatory governance.
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                        <button 
                            onClick={handleSignIn}
                            className="flex items-center gap-3 px-10 py-4.5 bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all active:scale-95"
                        >
                            Sign in with Google
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                        <button 
                            onClick={() => navigate('/methodology')}
                            className="flex items-center gap-3 px-10 py-4.5 bg-white border border-slate-200 text-slate-900 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 transition-all"
                        >
                            View Methodology
                        </button>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 mt-20 lg:mt-0 relative flex justify-center">
                    {/* Visual Graphic */}
                    <div className="relative w-full max-w-md perspective-1000">
                         {/* Background blur blobs */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-200/30 blur-[100px] rounded-full -z-10 animate-pulse"></div>
                        
                        {/* 3D Floating Mockup */}
                        <div className="bg-white/80 backdrop-blur-2xl ring-1 ring-slate-200/50 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-[40px] p-8 rotate-y--10 rotate-x-5 transition-transform duration-700 hover:rotate-y-0 hover:rotate-x-0 cursor-default group">
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audit in Progress</h4>
                                    <p className="text-sm font-black text-slate-900">Demographic Parity Index</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <span className="material-symbols-outlined text-[24px]">radar</span>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                {[
                                    { label: "High Equity", value: "0.94", color: "bg-emerald-500" },
                                    { label: "Moderate Bias", value: "0.72", color: "bg-amber-400" },
                                    { label: "Systemic Gap", value: "0.58", color: "bg-red-500" }
                                ].map((row, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-slate-400">{row.label}</span>
                                            <span className="text-slate-900">{row.value}</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${row.color} rounded-full transition-all duration-1000 delay-${i * 200}`} style={{ width: `${parseFloat(row.value) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-100 flex justify-between items-center">
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>
                                    ))}
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                                    Simulating Mitigations...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Trusted By Strip */}
            <div className="w-full bg-slate-50 py-16 mt-auto">
                <div className="max-w-7xl mx-auto px-10 md:px-20 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-10">Integrates with Clinical Ecosystems</p>
                    <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        <span className="text-xl font-black text-slate-900">PYTORCH</span>
                        <span className="text-xl font-black text-slate-900">FAIRLEARN</span>
                        <span className="text-xl font-black text-slate-900">AZURE ML</span>
                        <span className="text-xl font-black text-slate-900">AWS SAGEMAKER</span>
                        <span className="text-xl font-black text-slate-900">HUGGINGFACE</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
