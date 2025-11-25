## Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and edit files under `src/app/**`. The dev server hot reloads automatically.

## Environment variables

| Name | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | yes | Base URL of the Corners API used by `src/lib/api.ts`. Example: `https://api.corners.africa`. |

## Netlify deployment

The repo includes a `netlify.toml` that tells Netlify to:

- run `npm run build`
- publish the `.next` directory
- use Node.js 18
- load the official `@netlify/plugin-nextjs` for SSR/ISR support

To deploy a fresh site:

1. Install the CLI (optional): `npm install -g netlify-cli`.
2. Authenticate: `netlify login`.
3. Inside this folder run `netlify init` and choose “Create & configure a new site”.
4. Set `NEXT_PUBLIC_API_URL` in the site dashboard (Site settings → Build & deploy → Environment).
5. Deploy from git (recommended): push to `main`, then connect the GitHub repo in Netlify. Every push triggers a build.
6. For manual previews run `netlify deploy --build` (staging) or `netlify deploy --prod`.

## Git workflow

1. Check status: `git status`.
2. Stage changes: `git add <files>`.
3. Commit: `git commit -m "feat: describe change"`.
4. Push: `git push origin main`.

Once GitHub is connected to Netlify, the push automatically creates a new production deploy.
# African-corners
