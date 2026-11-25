// Copia de la configuración que antes iba dentro de code.html (tailwind.config).
// Si cambias colores o tamaños aquí, vuelve a ejecutar: node scripts/generar-css.js
const cfg = {
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          "on-background": "#FFFDF5",
          "surface-container": "#1C1815",
          "surface-variant": "#231F1C",
          "surface-bright": "#2E2824",
          "surface-dim": "#0D0B0A",
          "inverse-surface": "#FFFDF5",
          "outline": "#9E8E7C",
          "surface": "#0D0B0A",
          "surface-container-low": "#14110F",
          "surface-container-lowest": "#0D0B0A",
          "surface-container-high": "#28231E",
          "surface-container-highest": "#332C27",
          "on-surface": "#FFFDF5",
          "on-surface-variant": "#E8DFD8",
          "background": "#0D0B0A",
          // Refined Warm Tones
          "warm-cream": "#FFFDF5",
          "warm-cream-muted": "#E8DFD8",
          "primary": "#FFF4D4",
          "primary-container": "#FFD700",
          "primary-amber": "#FFC72C",
          "on-primary": "#2D2200",
          "on-primary-fixed": "#241A00",
          "secondary": "#B6C4FF",
          "secondary-container": "#1A3D9E",
          "on-secondary-container": "#C8D5FF",
          "carmine": "#C5221F",
          "carmine-dark": "#B71C1C",
          "on-tertiary-container": "#C5221F",
          "tertiary": "#FFF0ED",
          "error": "#FFB4AB",
          "error-container": "#B71C1C"
        },
        borderRadius: {
          "DEFAULT": "0.25rem",
          "lg": "0.75rem",
          "xl": "1rem",
          "2xl": "1.5rem",
          "3xl": "2rem",
          "full": "9999px"
        },
        spacing: {
          "margin-mobile": "1.25rem",
          "space-xl": "2.5rem",
          "gutter": "1.5rem",
          "space-md": "1rem",
          "space-xs": "0.25rem",
          "margin": "3rem",
          "gutter-mobile": "1rem",
          "space-lg": "1.5rem",
          "space-sm": "0.5rem"
        },
        fontFamily: {
          "headline-lg": ["Plus Jakarta Sans"],
          "label-md": ["Plus Jakarta Sans"],
          "headline-md": ["Plus Jakarta Sans"],
          "body-sm": ["Be Vietnam Pro"],
          "label-sm": ["Plus Jakarta Sans"],
          "body-lg": ["Be Vietnam Pro"],
          "headline-xl-mobile": ["Plus Jakarta Sans"],
          "headline-lg-mobile": ["Plus Jakarta Sans"],
          "label-lg": ["Plus Jakarta Sans"],
          "title-md": ["Plus Jakarta Sans"],
          "display-lg": ["Plus Jakarta Sans"],
          "body-md": ["Be Vietnam Pro"],
          "display-lg-mobile": ["Plus Jakarta Sans"],
          "headline-sm": ["Plus Jakarta Sans"],
          "headline-xl": ["Plus Jakarta Sans"]
        },
        fontSize: {
          "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
          "label-md": ["13px", { lineHeight: "18px", letterSpacing: "0.04em", fontWeight: "600" }],
          "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
          "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
          "label-sm": ["11px", { lineHeight: "16px", letterSpacing: "0.06em", fontWeight: "700" }],
          "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
          "label-lg": ["15px", { lineHeight: "20px", letterSpacing: "0.02em", fontWeight: "700" }],
          "title-md": ["18px", { lineHeight: "24px", fontWeight: "600" }],
          "display-lg": ["56px", { lineHeight: "64px", letterSpacing: "-0.02em", fontWeight: "800" }],
          "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
          "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600" }],
          "headline-xl": ["40px", { lineHeight: "48px", letterSpacing: "-0.015em", fontWeight: "700" }]
        }
      }
    }
  };
cfg.content = ['../code.html', '../scripts/generar-carta.js'];
cfg.plugins = [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')];
module.exports = cfg;
