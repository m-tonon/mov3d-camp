import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {
      base: projectDir,
    },
  },
};

export default config;
