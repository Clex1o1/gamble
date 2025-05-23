import tailwindcss from "@tailwindcss/vite";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxtjs/supabase',
    '@nuxt/test-utils'
  ],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    },
  },
  supabase: {
    redirect: false,
  },
  runtimeConfig: {
    public: {
      GUESS_RESOLVE_SECONDS: process.env.GUESS_RESOLVE_SECONDS ?? '60', // can be overridden by NUXT_GUESS_TIME environment variable
    }
  },
})