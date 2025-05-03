// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./test/setup.ts'],
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
    }
})