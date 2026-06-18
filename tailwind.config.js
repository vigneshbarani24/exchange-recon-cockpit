/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#13202B", canvas2: "#162635",
        node: "#1B2D3A", node2: "#21384A",
        teal: "#2BB7A8", tealb: "#4FD8C8",
        amber: "#D69A4A", amberb: "#EBB667",
        green: "#46A87E", greenb: "#5FC698",
        danger: "#CF6A5E",
        ink: "#DCE6EB", muted: "#8AA3AD", muted2: "#6F8893",
        line: "rgba(255,255,255,.14)",
      },
      fontFamily: {
        disp: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
