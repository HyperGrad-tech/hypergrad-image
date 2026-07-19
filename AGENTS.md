---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '1f7290de-9c85-47e0-9cd6-33d75c27b647'
  PropagateID: '1f7290de-9c85-47e0-9cd6-33d75c27b647'
  ReservedCode1: 'cc4b96e3-bea4-4326-bba9-b37894f0bf4f'
  ReservedCode2: 'cc4b96e3-bea4-4326-bba9-b37894f0bf4f'
---

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Toolchain requirements (important)

- **Node**: `>=22.12.0` (Astro 7 hard requirement; rolldown native binding also rejects Node 20 < 20.19.0). The bundled TeleAgent Node is v20.18.0 and will NOT work — it silently skips the `@rolldown/binding-darwin-arm64` optional dependency and the build aborts with `Cannot find native binding`.
- **Build**: prefix PATH with Homebrew Node before running `pnpm install` / `pnpm build`:
  ```
  export PATH="/opt/homebrew/bin:$PATH"   # node v25.x
  /Users/lingjingwei/.npm-global/bin/pnpm install
  /Users/lingjingwei/.npm-global/bin/pnpm build
  ```
  (TeleAgent's corepack-shimmed `pnpm` is broken — corepack 0.29.3 has stale signing keys. Use the npm-global install at the absolute path above.)
- After first install, run `pnpm approve-builds` once to allow the esbuild postinstall script (Astro internal). Build still works without it because the platform binary ships pre-built, but approving removes the warning.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)