import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Poster fonts are read from disk at render time, so ship them with that route.
  outputFileTracingIncludes: { "/api/poster/[id]": ["./assets/fonts/**"], "/api/chat": ["./assets/fonts/**"] },
};

export default nextConfig;
