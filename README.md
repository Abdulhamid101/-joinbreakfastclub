# Breakfast Club — Website (v1)

A simple, componentized React (Vite) landing page for Breakfast Club,
built from the brand bible. First push — enough to get joinbreakfastclub.com
live and indexable. Structured so we can keep adding sections/chapters later
without a rewrite.

## Structure

```
src/
  data/content.js       ← all copy lives here (edit this, not the components)
  styles/tokens.css     ← colors, type scale, spacing — the design system
  styles/global.css     ← resets + shared utility classes
  components/           ← one component + one stylesheet per section
  App.jsx                ← composes the sections in order
```

To add a new section later: add its copy to `content.js`, create a
`Component.jsx` + `Component.css` pair, then drop it into `App.jsx`.

## Run locally

```
npm install
npm run dev
```

## Build for production

```
npm run build
```

Outputs static files to `dist/` — deployable to any static host.

## Deploy (fastest path to joinbreakfastclub.com being live)

1. Push this folder to a GitHub repo.
2. Import the repo on Vercel or Netlify (framework preset: Vite).
3. Deploy — you'll get a free `*.vercel.app` / `*.netlify.app` URL immediately.
4. In the host's dashboard, add `joinbreakfastclub.com` as a custom domain
   and update the DNS records (A/CNAME) at your domain registrar as instructed.
5. DNS can take a few minutes to a few hours to propagate.
