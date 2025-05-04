// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'
export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        // you can optionally set Nuxt-specific environment options
        // environmentOptions: {
        //   nuxt: {
        //     rootDir: fileURLToPath(new URL('./playground', import.meta.url)),
        //     domEnvironment: 'happy-dom', // 'happy-dom' (default) or 'jsdom'
        //     overrides: {
        //       // other Nuxt config you want to pass
        //     }
        //   }
        // }
    },
    resolve: {
        alias: {
            '~': path.resolve(__dirname, './'),
        },
    },
})