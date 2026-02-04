/** @type {import('next').NextConfig} */
const nextConfig = {
  // -----------------------------------------------------------------------------
  // IMAGE DOMAINS
  // -----------------------------------------------------------------------------
  // If displaying external images, add their domains here:
  // images: {
  //   remotePatterns: [
  //     { protocol: 'https', hostname: '**' },  // Allow all (careful in prod)
  //   ],
  // },
  experimental: {
    serverComponentsExternalPackages: ['playwright', '@axe-core/playwright'],
  },

  // -----------------------------------------------------------------------------
  // NOTES
  // -----------------------------------------------------------------------------
  // - May need to add playwright to serverComponentsExternalPackages
  //   if there are issues with bundling
  // - Keep minimal for MVP
};

export default nextConfig;
