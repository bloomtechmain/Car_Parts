import type { Config } from 'tailwindcss';

/*
 * Palette — "workshop manual"
 *   ink    : warm near-black, the page
 *   paper  : manual-page off-white, used for light sections
 *   bone   : text on ink
 *   signal : the one accent — safety orange
 *
 * `navy` and `gold` are kept as aliases so the supplier / admin dashboards
 * (which were written against those names) pick up the new palette as-is.
 */
const ink = {
  DEFAULT: '#0f0e0c',
  2: '#161511',
  3: '#1d1b17',
  line: '#2d2a24',
};

const signal = {
  DEFAULT: '#ff5a1f',
  light: '#ff7a45',
  dark: '#e2450c',
};

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink,
        paper: {
          DEFAULT: '#ebe6db',
          2: '#e0d9cb',
          line: '#c9c0ae',
          ink: '#24211c',
        },
        bone: '#e9e3d6',
        steel: '#8f897d',
        signal,
        navy: {
          DEFAULT: ink.DEFAULT,
          light: ink[2],
          card: ink[3],
          border: ink.line,
        },
        gold: signal,
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        display: ['"Big Shoulders Display"', 'Impact', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        label: '0.18em',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        piston: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(9px)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
      },
      animation: {
        marquee: 'marquee 48s linear infinite',
        'marquee-slow': 'marquee 80s linear infinite',
        blink: 'blink 1.6s steps(2, start) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
