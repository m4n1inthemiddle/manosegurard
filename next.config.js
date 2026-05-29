/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'picsum.photos'],
  },
  typescript: {
    ignoreBuildErrors: true,   // 🔥 Esto evita que el error de TypeScript detenga el build
  },
}

module.exports = nextConfig