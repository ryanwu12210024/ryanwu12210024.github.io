module.exports = {
  content: [
    "./_includes/**/*.{html,liquid}",
    "./_layouts/**/*.{html,liquid}",
    "./**/*.{html,md,liquid}",
  ],
  theme: { extend: {
    fontFamily: {
      sans: ['Fira Code', 'monospace']
    }
    } 
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};




