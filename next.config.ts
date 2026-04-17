import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "uploads-ssl.webflow.com" },
      { protocol: "https", hostname: "cdn.prod.website-files.com" },
      { protocol: "https", hostname: "daks2k3a4ib2z.cloudfront.net" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
  async redirects() {
    return [
      // Proposals moved from /<slug> to /for/<slug>. The Odyssey link
      // was already shared externally — keep it working.
      {
        source: "/odyssey",
        destination: "/for/odyssey",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
