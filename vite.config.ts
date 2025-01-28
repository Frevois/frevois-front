import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import svgr from 'vite-plugin-svgr'
import wasm from 'vite-plugin-wasm'

import { version } from './package.json'

const icons: Record<string, string> = {
  development: '/favicon-local.svg',
  production: '/favicon-prod.svg',
  staging: '/favicon-staging.svg',
}

const titles: Record<string, string> = {
  development: 'Lago - Local',
  production: 'Lago',
  staging: 'Lago - Cloud',
}

const ReactCompilerConfig = {}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = env.PORT ? parseInt(env.PORT) : 8080

  return {
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./vitest-setup.ts'],
    },
    plugins: [
      react({
        babel: {
          plugins: [
            ['babel-plugin-styled-components', { displayName: true }],
            ['babel-plugin-react-compiler', ReactCompilerConfig],
          ],
        },
      }),

      wasm(),

      svgr({
        include: '**/*.svg',
        svgrOptions: {
          plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
          svgoConfig: {
            plugins: [
              {
                name: 'prefixIds',
                params: {
                  prefixIds: false,
                  prefixClassNames: false,
                },
              },
            ],
          },
        },
      }),

      createHtmlPlugin({
        inject: {
          data: {
            title: titles[env.APP_ENV] || titles.production,
            favicon: icons[env.APP_ENV] || icons.production,
          },
        },
      }),
    ],
    define: process.env.VITEST
      ? {
          APP_ENV: JSON.stringify('production'),
          API_URL: JSON.stringify('http://localhost:3000'),
          DOMAIN: JSON.stringify('localhost'),
          APP_VERSION: JSON.stringify('1.0.0'),
          IS_REACT_ACT_ENVIRONMENT: true,
          LAGO_OAUTH_PROXY_URL: JSON.stringify('https://proxy.lago.dev'),
          LAGO_DISABLE_SIGNUP: JSON.stringify('false'),
          NANGO_PUBLIC_KEY: JSON.stringify(''),
        }
      : {
          APP_ENV: JSON.stringify(env.APP_ENV),
          API_URL: JSON.stringify(env.API_URL),
          DOMAIN: JSON.stringify(env.LAGO_DOMAIN),
          APP_VERSION: JSON.stringify(version),
          LAGO_OAUTH_PROXY_URL: JSON.stringify(env.LAGO_OAUTH_PROXY_URL),
          LAGO_DISABLE_SIGNUP: JSON.stringify(env.LAGO_DISABLE_SIGNUP),
          NANGO_PUBLIC_KEY: JSON.stringify(env.NANGO_PUBLIC_KEY),
        },
    resolve: {
      alias: {
        '~': resolve(__dirname, 'src'),
        lodash: 'lodash-es',
        '@mui/styled-engine': resolve(__dirname, 'node_modules/@mui/styled-engine-sc'),
      },
    },
    server: {
      port,
      host: true,
      strictPort: true,
      allowedHosts: ['app.lago.dev'],
    },
    preview: {
      port,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      target: 'es2024',
      rollupOptions: {
        output: {
          chunkFileNames: '[name].[hash].js',
          entryFileNames: '[name].[hash].js',
          sourcemapFileNames: '[name].[hash].js.map',
        },
      },
    },
  }
})
