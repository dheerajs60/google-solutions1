import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import { signOut } from '../services/authService';
import { auditService } from '../services/auditService';
import { useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { auth } from '../config/firebase';
import { updateProfile } from 'firebase/auth';

export const Settings = () => {
    const { user, theme, setTheme, setUser } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const activeTab = queryParams.get('tab'); // 'profile', 'notifications', or null for all
    
    const [notifications, setNotifications] = useState(true);
    const [auditAutoSave, setAuditAutoSave] = useState(true);
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error'

    // Fetch persisted settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            if (user?.uid) {
                try {
                    const settings = await auditService.getSettings(user.uid);
                    if (settings) {
                        if (settings.theme) setTheme(settings.theme);
                        if (settings.notifications !== undefined) setNotifications(settings.notifications);
                        if (settings.auditAutoSave !== undefined) setAuditAutoSave(settings.auditAutoSave);
                    }
                } catch (err) {
                    console.error("Failed to load settings from backend:", err);
                }
            }
        };
        loadSettings();
    }, [user?.uid]);

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const handleThemeChange = (e) => {
        const newTheme = e.target.value.toLowerCase();
        setTheme(newTheme);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);
        try {
            // 1. Update Firebase Profile if name changed
            if (displayName !== user?.displayName) {
                await updateProfile(auth.currentUser, { displayName });
                setUser({ ...auth.currentUser, displayName }); // Update local store
            }

            // 2. Save preferences to backend Firestore
            const settings = {
                theme,
                notifications,
                auditAutoSave,
                lastUpdated: new Date().toISOString()
            };
            await auditService.updateSettings(user.uid, settings);
            
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error("Failed to save settings:", err);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const sections = [
        {
            title: 'Profile Settings',
            icon: 'person',
            description: 'Manage your account information and preferences',
            fields: [
                { label: 'Display Name', value: displayName, type: 'text', onChange: (e) => setDisplayName(e.target.value) },
                { label: 'Email Address', value: user?.email || 'user@example.com', type: 'email', disabled: true }
            ]
        },
        {
            title: 'Audit Preferences',
            icon: 'shield_with_heart',
            description: 'Configure default behavior for fairness audits',
            fields: [
                { label: 'Auto-save results to BigQuery', value: auditAutoSave, type: 'toggle', onChange: () => setAuditAutoSave(!auditAutoSave) },
                { label: 'Enable AI Forensic Reports by default', value: true, type: 'toggle', disabled: true }
            ]
        },
        {
            id: 'config',
            title: 'Platform Config',
            icon: 'settings_suggest',
            description: 'Global application monitoring and security',
            fields: [
                { label: 'Email Notifications', id: 'notifications-toggle', value: notifications, type: 'toggle', onChange: () => setNotifications(!notifications) },
                { label: 'Interface Theme', value: theme.charAt(0).toUpperCase() + theme.slice(1), type: 'select', options: ['Light', 'Dark'], onChange: handleThemeChange }
            ]
        }
    ];

    const filteredSections = activeTab 
        ? sections.filter(s => s.title.toLowerCase().includes(activeTab.toLowerCase()))
        : sections;

    return (
        <div className="flex flex-col gap-10 w-full animate-in fade-in py-10 pb-12 transition-colors duration-300">
            <div className="flex items-end justify-between border-b border-outline-variant/10 pb-10 dark:border-slate-800">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-on-surface mb-2 dark:text-white transition-colors duration-300">
                        {activeTab === 'profile' ? 'Profile Information' : 'Protocol Settings'}
                    </h1>
                    <p className="text-on-surface-variant text-sm max-w-lg leading-relaxed dark:text-slate-400">
                        Configure your auditing environment, security protocols, and integration preferences for the FairLens platform.
                    </p>
                </div>
                
                <div className="flex gap-4">
                    {saveStatus === 'success' && (
                        <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Saved to Cloud
                        </div>
                    )}
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-6 py-3 border border-error/20 text-error rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-error/5 active:scale-95 transition-all"
                    >
                        Sign Out
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className={clsx(
                            "flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all",
                            isSaving && "opacity-70 cursor-wait"
                        )}
                    >
                        {isSaving ? 'Syncing...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-4">
                    <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden group dark:bg-slate-800">
                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-3xl">verified_user</span>
                            </div>
                            <h3 className="text-xl font-bold mb-1">{displayName || 'Lead Auditor'}</h3>
                            <p className="text-white/50 text-xs font-medium mb-6">{user?.email}</p>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg w-fit">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest">Active Session</span>
                            </div>
                        </div>
                        <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700">shield</span>
                    </div>

                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 dark:bg-slate-900 dark:border-slate-800">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">System Health</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-on-surface-variant dark:text-slate-400">Firestore Sync</span>
                                <span className="text-emerald-600">ONLINE</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-on-surface-variant dark:text-slate-400">BigQuery Pipeline</span>
                                <span className="text-emerald-600">CONNECTED</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-on-surface-variant dark:text-slate-400">Vertex AI Stream</span>
                                <span className="text-emerald-600 font-black">ACTIVE</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-10">
                    {filteredSections.map((section, idx) => (
                        <div key={idx} className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-on-surface-variant dark:bg-slate-900 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-[20px]">{section.icon}</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-on-surface dark:text-white transition-colors duration-300">{section.title}</h3>
                                    <p className="text-on-surface-variant text-xs dark:text-slate-400 transition-colors duration-300">{section.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-14">
                                {section.fields.map((field, fIdx) => (
                                    <div key={fIdx} className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1 dark:text-slate-500">
                                            {field.label}
                                        </label>
                                        {field.type === 'toggle' ? (
                                            <button 
                                                onClick={field.onChange}
                                                disabled={field.disabled}
                                                className={clsx(
                                                    "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                                                    field.value ? "bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30" : "bg-white border-outline-variant/10 dark:bg-slate-900 dark:border-slate-800",
                                                    field.disabled && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <span className="text-xs font-bold text-on-surface dark:text-slate-300">Enable Feature</span>
                                                <div className={clsx(
                                                    "w-10 h-5 rounded-full relative transition-colors",
                                                    field.value ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                                                )}>
                                                    <div className={clsx(
                                                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                                        field.value ? "left-6" : "left-1"
                                                    )}></div>
                                                </div>
                                            </button>
                                        ) : field.type === 'select' ? (
                                            <select 
                                                className="w-full p-4 bg-white border border-outline-variant/10 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                                                onChange={field.onChange}
                                                value={field.value}
                                            >
                                                {field.options.map(opt => <option key={opt}>{opt}</option>)}
                                            </select>
                                        ) : (
                                            <input 
                                                type={field.type}
                                                value={field.value}
                                                onChange={field.onChange}
                                                disabled={field.disabled}
                                                className="w-full p-4 bg-white border border-outline-variant/10 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all disabled:bg-slate-50 disabled:text-on-surface-variant/50 dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:disabled:bg-slate-950 dark:disabled:text-slate-600"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
