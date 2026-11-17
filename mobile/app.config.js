// Extiende app.json. Solo cambia algo al exportar la versión web para GitHub Pages:
// el flujo .github/workflows/pages.yml define EXPO_BASE_URL=/proyecto_junto porque el sitio
// vive en https://<usuario>.github.io/proyecto_junto/. En el teléfono y en local no aplica.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
