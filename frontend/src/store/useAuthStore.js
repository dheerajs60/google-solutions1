import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,
            theme: 'light',
            setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
            clearUser: () => set({ user: null, isAuthenticated: false, isLoading: false }),
            setTheme: (theme) => {
                set({ theme });
                if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            },
            toggleTheme: () => {
                set((state) => {
                    const newTheme = state.theme === 'light' ? 'dark' : 'light';
                    if (newTheme === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                    return { theme: newTheme };
                });
            }
        }),
        {
            name: 'fairlens-auth-storage',
            partialize: (state) => ({ theme: state.theme }), // Only persist theme
        }
    )
);

export default useAuthStore;
