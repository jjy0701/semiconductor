/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./*.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 밝은 초록-흰색 테마
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // 메인 초록
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        light: {
          bg: '#ffffff', // 메인 배경 (흰색)
          card: '#f8fffe', // 카드 배경 (아주 연한 초록빛)
          hover: '#f0fdf4', // 호버 상태
          border: '#e5e7eb', // 테두리
        },
        status: {
          normal: '#22c55e', // 정상 (초록)
          warning: '#f59e0b', // 경고 (주황)
          error: '#ef4444', // 에러 (빨강)
          info: '#3b82f6', // 정보 (파랑)
        },
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'Segoe UI', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'glow-green': '0 0 15px rgba(34, 197, 94, 0.3)',
        'glow-blue': '0 0 15px rgba(59, 130, 246, 0.3)',
        'glow-red': '0 0 15px rgba(239, 68, 68, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-green': 'linear-gradient(135deg, #22c55e 0%, #86efac 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'gradient-light': 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
      },
    },
  },
  plugins: [],
}
