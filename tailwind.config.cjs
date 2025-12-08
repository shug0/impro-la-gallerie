/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,ts,tsx,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
      },
      colors: {
        // Design System - Couleurs principales
        'warm-white': '#fdfbf7',      // Blanc cassé avec nuance dorée - texte principal
        'gallery-gray': '#9ca3af',    // Gris pour texte secondaire (citations, descriptions)
        'gallery-border': '#4b5563',  // Gris pour bordures (boutons, inputs)
        'gallery-muted': '#6b7280',   // Gris très doux pour éléments discrets
      },
    },
  },
  plugins: [],
}

