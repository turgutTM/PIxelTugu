import { withUt } from "uploadthing/tw";

/** @type {import('tailwindcss').Config} */
export default withUt({
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        colorCycle: {
          "0%, 100%": { color: "#F97316" }, 
          "50%": { color: "#FCD34D" }, 
        },
      },

      fontFamily: {
        pixelify: ["'Pixelify Sans'", "sans-serif"],
        playwrite: ["'Playwrite IN'", "sans-serif"],
        fingerpaint: ["'Finger Paint'", "sans-serif"],
      },
      boxShadow: {
        pixel: "4px 4px 0 #000, -4px -4px 0 #ffff",
        "pixel-sm": "2px 2px 0 #000, -2px -2px 0 #ffff",
        "pixel-inset": "inset 2px 2px 0 #000, inset -2px -2px 0 #ffff",
      },
      colors: {
        pixelPink: "#ff4d4d",
        pixelBlue: "#ff9999",
        pixelGreen: "#ff6666",
        pixelYellow: "#ff3333",
        pixelBlack: "#660000",
        pixelWhite: "#ffe6e6",
      },
      animation: {
        float: "float 5s infinite ease-in-out",
        bouncePixel: "bouncePixel 1.5s infinite",
        grow: "grow 1s ease-out forwards",
        colorCycle: "colorCycle 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "50%": {
            transform: "translateY(-20px) rotate(180deg)",
            opacity: "0.7",
          },
          "100%": { transform: "translateY(0) rotate(360deg)", opacity: "1" },
        },
        bouncePixel: {
          "0%, 100%": { transform: "translateY(-5px)" },
          "50%": { transform: "translateY(5px)" },
        },
        grow: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
});
