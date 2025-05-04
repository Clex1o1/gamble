# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

---

# Process

## Tools

1. Create a new Nuxt project - chose nuxt as framework since as meta framework it will do all the work of simple authentication, routing, cron, etc. and i'm most experienced with it
2. Install Tailwind CSS and UI - for styling. since nuxt ui depends on tailwind i can use both to style my project
3. Install Supabase - for database, authentication (provides anon users) and realtime updates. I choosed this over AWS since i'm most familiar with it
4. Install VueUse - usefull composables for cookie handling e.g.
5. Install Nuxt Auth - for authentication. ???

## Conceptions

There are some options to solve the problem:

1. The Users pulls updates from the server. After each minute or page reload / navigation the users polls the server for updates.
2. The server runs a cron job which updates the data of all users. (at least per minute) The users receives the updates via the realtime connection. or the initial data load. (on page load / navigation).

## Question

- Is the 60 Time for one player or one round?
