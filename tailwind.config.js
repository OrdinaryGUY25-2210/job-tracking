/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1F2A44',
        inkSoft: '#5B6478',
        paper: '#F2F4F7',
        surface: '#FFFFFF',
        line: '#E1E5EB',
        lineSoft: '#EDEFF3',
        submitted: '#6B84A3',
        submittedBg: '#EAEEF4',
        processing: '#C98A2E',
        processingBg: '#FBF0DE',
        interview: '#6B5FA3',
        interviewBg: '#EFEAF7',
        accepted: '#4C8B57',
        acceptedBg: '#E7F1E7',
        rejected: '#B85C50',
        rejectedBg: '#F7E9E7',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card: '16px',
      },
      spacing: {
        '3.5': '0.875rem',
        '4.5': '1.125rem',
      },
    },
  },
  plugins: [],
};
