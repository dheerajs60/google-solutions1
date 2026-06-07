import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useUploadStore } from '../../store/useUploadStore';
import useAuthStore from '../../store/useAuthStore';

export const Topbar = () => {
    const { file } = useUploadStore();
    const { user } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Focused onboarding flow: hide sidebar on upload and selection screens
    const isFocusedFlow = ['/upload', '/attribute-selection', '/'].includes(location.pathname);

    return (
        <header className={`sticky top-0 h-16 px-8 flex items-center justify-between z-40 transition-colors duration-300 ${isFocusedFlow ? 'bg-slate-50/80 backdrop-blur-xl dark:bg-slate-950/80' : 'bg-white border-b border-outline-variant/10 dark:bg-slate-900 dark:border-slate-800'}`}>
            <div className="flex items-center space-x-6">
                {!isFocusedFlow ? (
                    <>
                        <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 space-x-2 dark:text-slate-500">
                             <Link to="/dashboard" className="hover:text-slate-900 transition-colors dark:hover:text-white">FairLens</Link>
                             <span className="text-slate-200 dark:text-slate-700">/</span>
                             <span className="text-slate-900 dark:text-slate-200"> {location.pathname.split('/').pop() || 'Dashboard'}</span>
                        </div>
                        <div className="h-4 w-[1px] bg-outline-variant/30 dark:bg-slate-800"></div>
                        <div className="flex items-center bg-surface-container-high px-3 py-1.5 rounded-full space-x-2 dark:bg-slate-800">
                            <span className="material-symbols-outlined text-[16px] dark:text-primary">database</span>
                            <span className="text-[11px] font-bold tracking-tight text-on-surface-variant truncate max-w-[200px] dark:text-slate-300">
                                {file ? file.name : "System Sandbox"}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                             <span className="material-symbols-outlined text-white text-sm">troubleshoot</span>
                        </div>
                        <div className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white">FairLens</div>
                    </div>
                )}
            </div>
            
            <div className="flex items-center space-x-6">
                {!isFocusedFlow && (
                    <button 
                        onClick={() => navigate('/upload')}
                        className="flex items-center px-4 py-1.5 bg-gradient-to-br from-primary to-primary-container text-white text-[11px] font-bold rounded-lg hover:scale-95 transition-transform shadow-md"
                    >
                        Run new audit
                    </button>
                )}
                
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => navigate('/settings?tab=profile')}>
                        <div className="flex flex-col items-end mr-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary leading-none mb-1">Lead Auditor</span>
                            <span className="text-xs font-bold text-on-surface-variant dark:text-slate-200 group-hover:text-primary transition-colors">
                                {user?.displayName || user?.email?.split('@')[0] || "Forensic Agent"}
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-xl overflow-hidden border-2 border-outline-variant/30 flex items-center justify-center bg-surface-container-lowest dark:bg-slate-800 dark:border-slate-700 group-hover:border-primary transition-colors shadow-sm">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-on-surface-variant text-[24px] dark:text-slate-400">person</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
