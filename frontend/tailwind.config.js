module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        dark: "var(--dark)",
        light: "var(--light)",
      },
      backgroundColor: {
        promo: "#F8F7FF",
        footer: "#0D0C22",
      },
    },
  },
  plugins: [],
};
