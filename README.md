# ODDLING

An account-free interactive art experiment: draw, tap, and warm a small impossible creature, then share its portable specimen link.

## Run locally

```sh
pnpm install
pnpm dev
pnpm build
```

The production artifact is `dist/` and can be hosted as a static HTTPS site.

## Architecture

- `src/core.ts` owns the versioned recipe, gesture normalization, deterministic creature derivation, descriptions, and fragment serialization.
- `src/main.tsx` owns the creation state machine, local collection, share behavior, optional synthesized tap sound, and SVG creature surface.
- Links use `#s=<base64url>` and include no server-side state. Invalid recipes fail safely.

The visual surface uses a self-hosted, two-ink SVG handbill renderer so the app has no WebGL dependency and remains accessible on constrained devices. It produces Coil, Kite, Ribbon, and Pebble families from the same deterministic recipe grammar.

## Known delivery choices

- Portrait and story exports are composed PNGs at 1080×1350 and 1080×1920; both use the Midnight Menagerie paper, typography, frame, creature, and specimen copy.
- A single shared specimen opens as a featured act and begins companion creation; pair links open a deterministic two-creature encounter.
- The local collection is intentionally browser-local and retains the latest 12 completed specimens.
