/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
        colors: {
          background: '#f8f9fa',
          surface: '#f8f9fa',
          'surface-container-lowest': '#ffffff',
          'surface-container-low': '#f3f4f5',
          'surface-container': '#edeeef',
          'surface-container-high': '#e7e8e9',
          'surface-container-highest': '#e1e3e4',
          'on-surface': '#191c1d',
          'on-surface-variant': '#464555',
          primary: '#4f46e5', // Corrected to the design's main Indigo
          'primary-container': '#4f46e5',
          'on-primary': '#ffffff',
          'on-primary-container': '#dad7ff',
          secondary: '#10b981', // Emerald for success/fairness
          'secondary-container': '#ecfdf5',
          'on-secondary': '#ffffff',
          'on-secondary-container': '#065f46',
          warning: '#f59e0b', // Amber for warnings
          'warning-container': '#fffbeb',
          error: '#ef4444', // Red for bias fails
          'error-container': '#fef2f2',
          'on-error': '#ffffff',
          outline: '#777587',
          'outline-variant': '#c7c4d8',
        },
        boxShadow: {
            'ambient': '0 12px 32px rgba(79, 70, 229, 0.08)',
            'card': '0 2px 8px rgba(0, 0, 0, 0.04)',
        }
      },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
  }
