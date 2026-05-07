/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A', // Deep Blue
        secondary: '#3B82F6', // Blue
        danger: '#EF4444', // Red
        warning: '#F59E0B', // Orange
        success: '#10B981', // Green
        surface: '#FFFFFF',
        background: '#F3F4F6'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
