import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppShell = ({ children }) => {
    const location = useLocation();
    
    // Focused onboarding flow: hide sidebar on upload and selection screens
    const isFocusedFlow = ['/upload', '/attribute-selection', '/'].includes(location.pathname);
    
    return (
        <div className="flex h-screen bg-surface transition-colors duration-300 dark:bg-slate-950">
            {!isFocusedFlow && <Sidebar />}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <Topbar />
                <main className={`flex-1 overflow-y-auto ${isFocusedFlow ? 'flex items-center justify-center pt-16' : 'p-8'}`}>
                    <div className={isFocusedFlow ? "w-full" : "max-w-7xl mx-auto h-full"}>
                        {children}
                    </div>
                </main>
                
                {/* Visual Background Element from design */}
                {isFocusedFlow && (
                    <div className="fixed top-0 right-0 -z-10 w-1/2 h-screen opacity-40 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 to-transparent"></div>
                    </div>
                )}
            </div>
        </div>
    );
};
