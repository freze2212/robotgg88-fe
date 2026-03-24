/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // 👈 Quét tất cả file trong src
    "./public/index.html"         // 👈 (nếu bạn dùng CRA và có file HTML ở public)
  ],
  theme: {
    extend: {
      backgroundImage: {
        'login-bg': "url('/assets/bg.png')",
      },
    },
  },
  plugins: [],
}