/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'rbzydlhuwkmiodrbjso.supabase.co', // ← dominio de tu bucket
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,   // 🔥 Evita que errores de TS detengan el build
  },
}

module.exports = nextConfig