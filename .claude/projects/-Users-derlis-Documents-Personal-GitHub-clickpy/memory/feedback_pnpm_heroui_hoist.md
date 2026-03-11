---
name: pnpm HeroUI hoist requirement
description: With pnpm monorepo, @heroui packages must be hoisted and tailwind content must point to root node_modules for styles to work
type: feedback
---

When using HeroUI with Tailwind CSS in a pnpm monorepo:

1. `.npmrc` must include `public-hoist-pattern[]=*@heroui/*` so that `@heroui/theme` is accessible
2. `tailwind.config.ts` content array must include the **root** node_modules path: `"../../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"` (not just `./node_modules/...`) because pnpm doesn't symlink `@heroui/theme` into the workspace's local node_modules
3. After changing `.npmrc`, must `rm -rf node_modules && pnpm install` for it to take effect
