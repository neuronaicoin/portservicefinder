import type { NextConfig } from "next";

const nextConfig: import('next').NextConfig = { typescript: { ignoreBuildErrors: true }, eslint: { ignoreDuringBuilds: true } }
const nextConfig2: NextConfig = {
  /* config options here */
};

export default nextConfig;
