import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Sibling projects under IPVO/ confuse Turbopack's workspace root; lock resolution here.
  turbopack: {
    root: projectDir,
    resolveAlias: {
      tailwindcss: path.join(projectDir, 'node_modules/tailwindcss'),
      'tw-animate-css': path.join(projectDir, 'node_modules/tw-animate-css'),
    },
  },
  outputFileTracingRoot: projectDir,
};

export default nextConfig;
