---
name: Frontend stack versions (March 2026)
description: Current frontend tech stack versions after migration - Next.js 16, React 19, HeroUI 2.8.10, Tailwind 4
type: project
---

Frontend (`apps/web`) was migrated on 2026-03-11:

- Next.js 14.2 → 16.1 (React 19, async params/cookies, Turbopack default, middleware→proxy rename)
- Tailwind CSS 3.4 → 4.2 (CSS-first with `@import "tailwindcss"` + `@config` backward compat approach)
- HeroUI 2.7.9 → 2.8.10 (Tailwind v4 compatible)
- Build uses `--webpack` flag since Turbopack is now default in Next.js 16
- Many components needed `'use client'` added due to React 19 stricter server/client boundary enforcement
