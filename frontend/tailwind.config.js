import { createThemes } from 'tw-colors';
import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {

        fontSize: {
            'sm': '12px',
            'base': '14px',
            'xl': '16px',
            '2xl': '20px',
            '3xl': '28px',
            '4xl': '38px',
            '5xl': '50px',
        },

        extend: {
            fontFamily: {
                inter: ["'Inter'", "sans-serif"],
                gelasio: ["'Gelasio'", "serif"]
            },
        },

    },
    plugins: [
        createThemes({
            light: {
                'white': '#FFFFFF',
                'black': '#09090b',    /* zinc-950 */
                'grey': '#f4f4f5',     /* zinc-100 */
                'dark-grey': '#71717a', /* zinc-500 */
                'red': '#ef4444',
                'transparent': 'transparent',
                'twitter': '#0ea5e9',
                'purple': '#8b5cf6'    /* violet-500 */
            },
            dark: {
                'white': '#09090b',    /* zinc-950 background */
                'black': '#fafafa',    /* zinc-50 text */
                'grey': '#27272a',     /* zinc-800 borders/surfaces */
                'dark-grey': '#a1a1aa', /* zinc-400 */
                'red': '#f87171',
                'transparent': 'transparent',
                'twitter': '#0ea5e9',
                'purple': '#a78bfa'    /* violet-400 */
            }
        }),
        daisyui,
    ],
};