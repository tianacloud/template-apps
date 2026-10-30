/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  // The editor tags text with `font-serif` as a marker only; its font comes from the editor rules.
  blocklist: ['font-serif'],
  theme: { extend: {} },
  plugins: [],
};
