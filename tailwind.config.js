/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bio-dark': '#010b04',
                'bio-primary': '#5a8a5a',
                'bio-secondary': '#8b7aa6',
                'bio-glow': '#7a9a7a',
                'bio-danger': '#b85450',
                'bio-warning': '#d4a74a',
                'bio-success': '#5a9a6a',
            },
            fontFamily: {
                'grotesk': ['Space Grotesk', 'system-ui', 'sans-serif'],
            },
            backdropBlur: {
                'xs': '2px',
            }
        },
    },
    plugins: [require('daisyui')],
    daisyui: {
        themes: [
            {
                biodark: {
                    "primary": "#5a8a5a",
                    "secondary": "#8b7aa6",
                    "accent": "#7a9a7a",
                    "neutral": "#010409",
                    "base-100": "#010b04",
                    "base-200": "#031306",
                    "base-300": "#05150b",
                    "info": "#60a5fa",
                    "success": "#5a9a6a",
                    "warning": "#d4a74a",
                    "error": "#b85450",
                },
            },
        ],
    },
}
