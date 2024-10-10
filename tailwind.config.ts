import type { Config } from "tailwindcss"

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["GeneralSans"],
        mono: ["JetBrainsMono"],
      },
    },
  },
  plugins: [],
} satisfies Config
