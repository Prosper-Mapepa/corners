This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Netlify

The repo already contains a `netlify.toml` configured for the official Next.js Netlify plugin. To deploy:

1. Install the Netlify CLI (optional but recommended): `npm install -g netlify-cli`.
2. Authenticate once: `netlify login`.
3. Initialize a site (creates or links a Netlify project): `netlify init`.
4. Deploy preview builds at any time: `netlify deploy --build --context=deploy-preview`.
5. Trigger the production deployment (runs `npm run build` and publishes `.next`): `netlify deploy --prod`.

Alternatively, connect the GitHub repository directly inside the Netlify UI. Netlify will detect the framework, use the build command `npm run build`, publish `.next`, and respect the configured Node.js version.

## Git workflow

1. Ensure dependencies are installed: `npm install`.
2. Review changes with `git status` and `git diff`.
3. Commit with a descriptive message, e.g. `git commit -am "chore: prepare netlify deployment"`.
4. Push to the remote main branch: `git push origin main`.

Once the repository is connected to Netlify, every push to `main` (or any selected branch) triggers an automatic build and deploy.
# African-corners
