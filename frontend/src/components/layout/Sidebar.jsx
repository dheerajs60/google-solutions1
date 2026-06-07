import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { signOut } from '../../services/authService';

export const Sidebar = () => {
    const navigate = useNavigate();
    
    const navItems = [
        { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { path: '/upload', icon: 'add_chart', label: 'Run Audit' },
        { path: '/heatmap', icon: 'grid_view', label: 'Bias Heatmap' },
        { path: '/mitigation', icon: 'science', label: 'Mitigation Lab' },
        { path: '/report', icon: 'description', label: 'Compliance Report' },
        { path: '/history', icon: 'history', label: 'Audit History' }
    ];

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <aside className="h-screen w-64 flex flex-col p-4 space-y-2 bg-slate-50 border-r border-slate-200 z-50 shrink-0 transition-colors duration-300 dark:bg-slate-900 dark:border-slate-800">
            <div className="mb-10 px-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-lg dark:bg-primary">
                    <span className="material-symbols-outlined text-white text-[20px]">troubleshoot</span>
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tighter dark:text-white">FairLens</span>
            </div>
            
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => clsx(
                            "flex items-center px-3 py-2 space-x-3 text-sm font-medium transition-all duration-200 ease-in-out rounded-lg",
                            isActive 
                                ? "bg-white text-primary shadow-sm dark:bg-slate-800 dark:text-white" 
                                : "text-on-surface-variant hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                        )}
                    >
                        <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            
            <div className="pt-4 border-t border-outline-variant/20 space-y-1 dark:border-slate-800">
                <NavLink
                    to="/settings"
                    className={({ isActive }) => clsx(
                        "flex items-center px-3 py-2 space-x-3 text-sm font-medium transition-all duration-200 ease-in-out rounded-lg",
                        isActive 
                            ? "bg-white text-primary shadow-sm dark:bg-slate-800 dark:text-white" 
                            : "text-on-surface-variant hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                    )}
                >
                    <span className="material-symbols-outlined text-[22px]">settings</span>
                    <span>Settings</span>
                </NavLink>

                <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 space-x-3 text-sm font-medium text-error hover:bg-error/5 transition-all duration-200 ease-in-out rounded-lg"
                >
                    <span className="material-symbols-outlined text-[22px]">logout</span>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};
