/** @type {import('tailwindcss').Config} */

import daisyui from "daisyui"

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        'page': '1440px'
      },
      gridTemplateColumns: {
        'editor': '1fr 3fr 1fr'
      },
    },
  },
  plugins: [
    daisyui
  ],
  daisyui: {
    themes: ['winter', 'night']
  }
}

