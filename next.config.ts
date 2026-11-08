import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // keep `next dev` from dropping extra files into the repo
  agentRules: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
