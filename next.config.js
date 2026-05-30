/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,   // ← Desactiva la optimización (las imágenes se muestran sin procesar)
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig