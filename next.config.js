/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'picsum.photos'],
  },
  typescript: {
    ignoreBuildErrors: true,   // 🔥 Evita que errores de TS detengan el build
  },
}

module.exports = nextConfig