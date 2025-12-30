module.exports = {
  content: [
    "./_includes/**/*.{html,liquid}",
    "./_layouts/**/*.{html,liquid}",
    "./**/*.{html,md,liquid}",
  ],
  theme: { extend: {} },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};




