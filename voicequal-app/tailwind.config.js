/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        zinc: { 800: '#1a5455', 900: '#0F3D3E', 950: '#072425' },
        emerald: { 400: '#39AC83', 500: '#1F8A70', 600: '#166350' },
        amber: { 400: '#D4AF37', 500: '#A67C2E', 600: '#8a6523' },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [],
}

