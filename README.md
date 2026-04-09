# Portfolio

Personal portfolio site for Guil Maueler, built with
[Next.js](https://nextjs.org) (App Router), TypeScript, and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Editing content

All copy (name, title, bio, services, projects, testimonials, socials, email)
lives in a single file:

```
src/content/site.ts
```

Edit that file and every section of the site updates automatically. No markup
changes needed for routine content updates.

To swap project images, drop new files into `public/projects/` and update the
matching `image` field in `src/content/site.ts`.

## Project structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout, fonts, metadata, theme provider
│   ├── page.tsx        # Single-page composition of all sections
│   └── globals.css     # Tailwind + theme tokens (light & dark)
├── components/
│   ├── Nav.tsx         # Sticky top nav + anchor links + theme toggle
│   ├── ThemeProvider.tsx
│   ├── ThemeToggle.tsx # Light/dark toggle
│   ├── Section.tsx     # Layout primitive for content sections
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── Services.tsx
│   ├── Projects.tsx
│   ├── Testimonials.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
└── content/
    └── site.ts         # Single source of truth for all copy
```

## Theme

Light mode is the default. A moon/sun button in the nav toggles dark mode.
Theme state is persisted via [`next-themes`](https://github.com/pacocoursey/next-themes)
and uses a `class` strategy on `<html>` so Tailwind's `dark:` variants and the
CSS variables in `globals.css` stay in sync.

## Deployment

This site is built for zero-config deploys to
[Vercel](https://vercel.com/new):

1. Push this repo to GitHub
2. Import the repo in Vercel
3. Accept the defaults — no environment variables required

Any push to the default branch will trigger a production deploy.

## Scripts

| Command         | Description                 |
| --------------- | --------------------------- |
| `npm run dev`   | Start the dev server        |
| `npm run build` | Build for production        |
| `npm run start` | Run the production build    |
| `npm run lint`  | Lint with ESLint            |
