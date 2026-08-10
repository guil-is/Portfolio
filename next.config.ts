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
  async rewrites() {
    return {
      // beforeFiles so the host match wins over the portfolio's own pages —
      // collage.guil.is proxies the Webflow site while keeping the URL masked.
      beforeFiles: [
        {
          source: "/:path*",
          destination: "https://guil-collages.webflow.io/:path*",
          has: [{ type: "host", value: "collage.guil.is" }],
        },
      ],
    };
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
