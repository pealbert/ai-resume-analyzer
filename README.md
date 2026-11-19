# AI Resume Analyzer

A client-side React Router application that analyzes PDF resumes with Puter.js.

## Local development

```sh
vp install
vp dev
```

Run the production checks with:

```sh
vp check
vp test
vp run build
vp preview
```

## Vercel deployment

The repository includes `vercel.json` with the required React Router SPA fallback and the
`build/client` output directory. Import the repository into Vercel and deploy it from the repository
root. No application secrets are required because Puter uses its user-pays authentication model.

The production build targets Node.js 26. The `/wipe` maintenance route is development-only and is
excluded from production builds.
