/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,   // ← Desactiva la optimización (evita el error de hostname)
    // Si prefieres mantener la optimización, usa domains en lugar de remotePatterns:
    // domains: ['images.unsplash.com', 'picsum.photos', 'rbzydlhuwkmiodrbjso.supabase.co'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig