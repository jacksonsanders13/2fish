import type { NextConfig } from "next";

// We run dev/build with --webpack (see package.json). Turbopack's CSS step
// spawns a separate node process that kept crashing on Windows.
const nextConfig: NextConfig = {
  // keep `next dev` from dropping extra files into the repo
  agentRules: false,
};

export default nextConfig;
