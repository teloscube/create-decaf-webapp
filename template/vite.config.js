import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const basePath = env.PUBLIC_URL;
  const DECAF_HOST = env.DECAF_WEBAPP_HOST || 'sandbox.dev.decafhub.com';
  const DECAF_URL = `https://${DECAF_HOST}`;

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
    ],
    server: {
      port: 3000,
      proxy: {
        [`^(?!${basePath}).*`]: {
          target: DECAF_URL,
          prependPath: false,
          changeOrigin: true,
          headers: {
            Host: DECAF_HOST,
            'X-DECAF-APIURL': DECAF_URL,
          },
        },
      },
    },
    build: {
      outDir: 'build',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
  };
});
