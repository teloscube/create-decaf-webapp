import react from '@vitejs/plugin-react';
import { writeFileSync } from 'fs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';
import { version } from './package.json';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const basePath = env.PUBLIC_URL;
  const DECAF_HOST = env.DECAF_WEBAPP_HOST || 'sandbox.dev.decafhub.com';
  const DECAF_URL = `https://${DECAF_HOST}`;

  const proxyConfig = {
    [`^(?!${basePath}).*`]: {
      target: DECAF_URL,
      prependPath: false,
      changeOrigin: true,
      headers: {
        Host: DECAF_HOST,
        'X-DECAF-APIURL': DECAF_URL,
      },
    },
  };

  return {
    base: basePath,
    envPrefix: 'DECAF_WEBAPP',
    plugins: [
      react(),
      checker({
        overlay: false,
        typescript: true,
        eslint: {
          lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
        },
      }),
      {
        name: 'generate-version-json',
        writeBundle: () => {
          writeFileSync('./build/version.json', JSON.stringify({ version }));
        },
      },
    ],
    server: {
      port: 3000,
      proxy: proxyConfig,
    },
    preview: {
      port: 5000,
      proxy: proxyConfig,
    },
    build: {
      outDir: 'build',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});
