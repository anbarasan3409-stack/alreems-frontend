/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B0200',
        secondary: '#3949AB',
        accent: '#FFB300',
        background: '#FFFFFF',
        text: '#212121',
        border: '#E0E0E0',
        error: '#D32F2F',
        success: '#388E3C',
        info: '#1976D2',
      },
    },
  },
};

export default config;
