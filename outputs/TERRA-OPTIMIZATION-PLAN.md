# ODDLING — Terra optimization build plan

## Objective

Make the current Midnight Menagerie experience understandable, responsive to the player, reliable to share, and worth repeating. Keep the cream/plum/ochre handbill identity and the static, account-free architecture.

This plan is based on inspection of `src/core.ts`, `src/main.tsx`, `src/style.css`, `src/core.test.ts`, `package.json`, README.md, and DESIGN.md. Findings below are source-confirmed; responsive, browser, device, and performance acceptance still require execution. Earlier README claims should not be treated as verification.

The central acceptance question: can a first-time visitor create a creature, explain how their actions changed it, save the same creature they saw, and invite someone into a working encounter?

## 1. What needs fixing

| Priority | Current implementation | Required outcome |
|---|---|---|
| P0 | The default Arc contains 34 coordinates, but share validation requires exactly 32. `deriveRecipe` can therefore produce recipes its own decoder rejects. | All new recipes have exactly 32 coordinates. Previously issued links receive an explicit compatibility policy. |
| P0 | The stage renders fixed family paths; gesture geometry and seed mostly do not affect the visible silhouette. Warmth changes an unused legacy palette. | Shape, seed, rhythm, and warmth each make a visible, bounded contribution. |
| P0 | Warmth says “Hold” but implements only a range input. | Real pointer/keyboard hold plus an equivalent labeled slider. |
| P0 | Drawing samples by event index, auto-advances on release, and treats cancellation as completion. | Path-length resampling, primary-pointer tracking, editable preview, explicit Continue, and safe cancellation. |
| P0 | PNG export uses a different path from the stage, generic fonts, unwrapped text, and a hard-coded hostname. Pair export saves only the first creature. | One shared illustration model for stage and exports; correct single/pair artwork, local fonts, wrapping, actual hostname. |
| P0 | Sharing silently attempts native share and clipboard together. URL changes are read only on mount. | Explicit Share and Copy actions, feedback, selectable fallback, and working navigation. |
| P1 | Pairs breathe side by side; Orbit/Echo/Bow selection and six-second choreography are absent. | Reproducible pair encounters with a static ending and Replay. |
| P1 | Reduced-motion CSS does not stop JS-driven transforms. The entire app rerenders on every animation frame. | Motion preference controls the animation clock; animation is isolated from application state. |
| P1 | Stored JSON is not schema-validated; remove/clear operations can throw. Collection cannot reopen a specimen. | Validated, failure-tolerant storage and actionable collection entries. |
| P1 | Absolute positioning dominates even mobile layouts; remove buttons are 30px high and selected presets lack state feedback. | Content-driven mobile layout, 44px targets, visible selection and focus, complete keyboard flow. |
| P1 | Every tap creates another AudioContext. Dependencies use `latest`; only three unit tests exist and build skips typechecking. | Reused optional audio service, pinned dependencies, typecheck, targeted regression and browser tests. |

## 2. Preserve these contracts

- Keep `CreatureRecipeV1`, `SharePayloadV1`, `#s=` links, seed meaning, name tables, and deterministic name/description generation.
- Freeze fixtures from the current derivation before edits. Do not consume extra random numbers before name/description generation; use a separate seeded stream for new rendering attributes.
- Preserve family selection for valid existing recipes. Do not silently change aspect-ratio rules or the Coil cutoff while adding geometry improvements. Any grammar correction affecting existing identity needs an explicit version decision.
- New visual geometry may become richer, but the same recipe must still give the same result after reload and in export.
- Retain local storage’s 12-specimen limit and existing key. Validate at every persistence and link boundary.
- Keep SVG as the canonical graphics implementation. No reason to add a WebGL dependency for flat printed silhouettes.
- No accounts, public feeds, backend, leaderboard, compatibility scores, runtime AI, or analytics service in this release.

### Legacy Arc handling

First fix the new Arc constant to a valid 16-point shape. Add regression coverage proving every preset, default, and generated recipe round-trips.

Some old default/Arc links may already contain the exact 34-coordinate Arc constant. Support a narrowly scoped import repair: when all other recipe fields validate and shape matches that exact historical constant, remove the final unused point. The old metrics used only the first 32 coordinates, so this preserves the old family/name inputs. Apply the same repair to stored recipes. Reject other incorrect lengths. Return a canonical 32-coordinate recipe and only emit canonical recipes afterward. Document this exception; do not broadly weaken the schema.

## 3. Make play immediately understandable

Keep the poetic opening. Add one practical sentence beneath it: “Draw its shape. Tap its rhythm. Give it a little warmth.” Label the opening creature “Demonstration specimen.”

During creation, show a compact printed progress line: “Shape · Rhythm · Warmth,” with the current step marked by an underline and filled ticket. Every step has Continue, Undo this step, and Back where applicable. No automatic step completion after drawing, no countdown, and no forced sound.

Separate the canvas area from instructional controls so people can scroll on mobile without accidentally drawing. Presets remain visible and keyboard-accessible. Mark chosen presets with `aria-pressed` and a filled ticket. Switching to custom input clears the preset selection.

Acceptance: a first-time tester can identify the next action at every step without explanation from the builder.

## 4. Make every gesture matter

### Shape

Implement one shared `normalizeGesture` using cumulative path length, 16 evenly spaced samples, quantization, and degenerate-stroke fallback. Track one active primary pointer, set capture, ignore other pointers, and restore the last completed shape on cancellation. Use `touch-action: none` only on the drawing area. Match coordinate normalization to the SVG viewBox so strokes stay under the pointer at every aspect ratio.

Keep raw input in a bounded temporary buffer and dispose of it after normalization. Draw the live ochre stroke and update a coarse creature preview at most once per animation frame. Pointer-up commits a preview; Continue advances.

### Silhouette grammar

Derive renderer-neutral geometry from the normalized recipe once. Each family should have editable proportions, curvature, gesture, and accent placement:

- Coil: curved loop torso, offset arms, connected details and star-shaped negative space.
- Kite: angular shoulders/core, tapered limbs, pronounced leaning pose.
- Ribbon: long curved torso and sweeping limbs following the stroke’s dominant direction.
- Pebble: compact irregular body, lobe proportions, exaggerated planted stance.

Seed controls bounded asymmetry; shape controls body proportions and direction; warmth controls ochre coverage and ink patterns; energy controls motion. Essential outlines remain plum. Use no face or extra surface colors.

Review twelve fixed specimens: three meaningfully different shapes/seeds within each family. Require structural variety within families, not merely different rotation or stars. Verify all four remain identifiable in monochrome.

### Rhythm

Use median intervals, clamp to 150–1,200ms, and map inversely to energy. Fewer than two taps means neutral. Ignore taps after eight until Undo. Presets set energy directly and must not inject fake timestamps into recorded taps.

Each tap triggers a visible compression/recovery and a numbered score stamp. Different energies produce clearly distinguishable cadence. Dispose of timestamps when energy is committed.

### Warmth

Implement a dedicated hold target: press/hold with pointer or Space; release commits warmth; cap at three seconds. Handle cancellation, blur, and hidden documents without stuck holds. The slider provides the same 0–255 result and useful value text.

Show a growing ochre sunburst and increasing accent coverage while holding. Compare 0, 128, and 255 for the same seed/shape: all must be visibly distinct while preserving its outline and identity.

## 5. Improve the reveal and encounter

The reveal is a short authored unfolding followed by a settled composition. Put the creature name in Bowlby, keep the description between rules, and give one dominant action: Invite a companion for solo creation, or Meet the featured act for invitation creation. Save portrait is secondary; Make another is tertiary. Story format belongs in the export panel rather than another equal-weight button.

Display a short factual creation receipt: “Your stroke shaped its body. Your taps set its rhythm.” Avoid personality claims.

Store sender identity separately from the editable draft. Refresh during companion creation must not lose the invitation: retain the incoming fragment and optionally persist the draft in guarded session storage. Completing a companion saves the new creature and leads to the pair without replacing the sender.

Create `deriveEncounter(a, b)` and a pure elapsed-time pose function. Canonically order by seed, using canonical recipe serialization as a tie-breaker. Choose Orbit, Echo, or Bow with a fixed deterministic function. Each runs once for six seconds, settles, and offers Replay. Pair pages invite “Make your own” and never accumulate a third creature.

The checkerboard belongs below the feet as a small stage platform. Keep solid plum silhouettes legible against cream rather than covering their bodies with matching dark squares.

## 6. Repair exports and sharing

Use one print scene/geometry model for on-screen SVG, collection thumbnails, and canonical export pose. Export accepts the complete `SharePayloadV1`, not a single recipe argument.

Compose 1080×1350 and 1080×1920 canvases with locally loaded fonts, paper/frame, one or two correct creatures, names, descriptions, and `location.hostname`. Wait explicitly for the required fonts. Wrap descriptions and fit long names inside safe margins. Keep both pair names equally prominent. Do not claim an unconfigured domain such as `oddling.art`.

Export flow: choose Portrait or Story → prepare image → preview → explicit Share image or Download PNG. Native file sharing is called from that final user action only if supported. Report preparation failures and allow retry; clean up object URLs and image resources on success, failure, replacement, and unmount.

Link flow: Share link and Copy link are separate actions. Show “Link copied” only after success. On clipboard failure show a selectable URL. Treat native-share cancellation neutrally. Use invitation copy for singles and pair-appropriate copy for pairs.

Implement a small fragment adapter handling initial load, hash changes, and browser history. Centralize transitions so changes made by the app do not reset a live draft. Invalid links must never mutate the collection. Test refresh, Back, Forward, and switching between links in the same tab.

Localhost links cannot invite friends on other devices. Document this during development; production sharing acceptance requires a separately authorized static HTTPS deployment. Repository publication alone is not site deployment.

## 7. Collection, accessibility, and performance

Make Tonight’s Creatures accessible from welcome and reveal. Use a responsive numbered program grid with Open, Save, and Remove. Opening a local specimen is a personal specimen view, not an incoming invitation. Add Close, Escape, correct focus return, and an empty state. Clear collection uses a deliberate labeled confirmation. State that items are stored only in this browser.

Parse storage as untrusted data: check array shape, validate/repair recipes, deduplicate canonically, and cap at 12. Catch all read/write/remove failures. In-memory creation and sharing must work when storage fails.

Use normal document flow for mobile header, creature stage, and controls; use grid for desktop composition. Allow scrolling on short screens and zoom. Preserve the creature as the focal point. Build actual complete scallops sized from the frame dimensions rather than stretched dashed rounded strokes.

All targets are at least 44px. Use plum focus outlines that remain visible outside clipped starburst artwork; put decorative clipping on a child rather than clipping the button’s focus ring. Announce step transitions and export/copy results politely. Move focus to the new step heading. Include adjacent textual descriptions, selected states, and keyboard equivalents.

Add an explicit motion control initialized from `prefers-reduced-motion`. Disable JS idle motion, transitions, and automatic encounters when reduced; show canonical static poses. An explicit replay may animate once without restarting idle motion.

Use one visibility-aware rAF clock scoped to animated artwork. Stop it when hidden or motion is disabled; resume without catch-up jumps. Memoize recipe derivation and avoid rerendering the whole form/collection each frame. Reuse one lazily created AudioContext, handle unsupported/denied audio, disconnect completed voices, and close on teardown.

## 8. Execution order and file ownership

Use one coordinating Terra task. If parallel workers are desired, delegate only after contracts and fixtures are frozen, with the following non-overlapping ownership:

1. **Coordinator — foundation:** create compatibility fixtures, fix/repair Arc recipes, define renderer/encounter/export interfaces, add typecheck, and freeze dependencies.
2. **Creature worker:** pure geometry/print attributes, shared SVG renderer, choreography, animation clock. Own `src/creature/*`.
3. **Experience worker:** step surfaces, input capture, controls, responsive layout, focus, collection UI. Own `src/experience/*` and scoped styles.
4. **Distribution worker:** validated storage, fragment adapter, export composition, sharing panel/helpers. Own `src/distribution/*`.
5. **Coordinator — integration:** own root reducer, shared types, dependency edits, compatibility tests, docs, and acceptance.

First integrate one complete solo flow through a faithful portrait export. Then integrate invitation → companion → pair → pair export, followed by collection and failure paths. Workers must not independently change shared types or dependency versions.

Suggested root state: route identity, draft recipe/input state, source invitation, selected local specimen, completed payload, preferences, and transient UI status. Keep transient timestamps and pointer paths outside persisted recipes. Define state transitions in one reducer; avoid duplicating completed identity across unrelated useState values.

## 9. Required verification

### Automated regression tests

- Every preset/default has 32 coordinates and round-trips; exact legacy Arc is repaired; arbitrary 34-coordinate data is rejected.
- Frozen valid recipe fixtures retain name, description, and family.
- Path-length sampling handles uneven event density, single points, repeated points, and tiny strokes.
- Rhythm mapping uses the median, has correct boundary values, and caps at eight taps.
- Single/pair payloads round-trip; oversized, truncated, invalid ranges, invalid kinds, unsupported versions, and malformed storage fail safely.
- Pair ordering, equal-seed tie-breaking, and encounter selection are deterministic.
- Keyboard-only creation, pointer cancel, hold interruption, preset/custom switching, and Undo work.
- Incoming single → companion → pair survives refresh/navigation; pair links do not add a third creature.
- Blocked storage/audio/clipboard/sharing preserve core creation; copy fallback is selectable.
- Both export dimensions are correct and pair exports contain two creatures. Visually confirm typography, shape match, and text bounds.

### Visual and browser acceptance

Capture one batch at 320px, 390×844, 768×1024, 1440×900, and 200% zoom. Cover welcome, all steps, reveal, incoming, pair, program, invalid link, reduced motion, the twelve silhouette fixtures, and both export sizes. Fix the findings together and run one confirmation pass.

Run production flows in Chromium, Firefox, and WebKit. Check real iOS Safari and Android Chrome for pointer/hold/download/native sharing where devices are available; record missing coverage explicitly. Measure contrast rather than assuming the palette guarantees it.

Pin exact installed dependency versions and commit the lockfile. Keep the existing pnpm workflow unless deliberately migrating package managers in a separate change. Add `typecheck` and a CI job for install, typecheck, unit tests, build, and selected browser tests. Ignore generated TypeScript/Vite artifacts. Verify bundled font licenses are included.

Measure production gzip JavaScript against the 600KB budget; report the actual value. Check animation on a representative phone for at least 30fps, with no frame-driven whole-app renders. Repeat creation/export twenty times and check that audio contexts, object URLs, and memory do not grow without bound. These are acceptance targets, not claims about current performance.

## 10. Small follow-on enhancements

Only after the core acceptance passes:

- “Try another take” from reveal: preserve the seed and return to editing with reversible changes, so players can explore cause and effect.
- “Invite from your program”: share any saved creature without rebuilding it.
- “Dance with another specimen”: choose two saved creatures for a local encounter using the same pair contract.

Do not introduce streaks, currencies, rarity rankings, or personality labels. The repeat motivation is discovering different forms and small performances.

## 11. Definition of done and handoff

Deliver source, production build, updated README/DESIGN/architecture notes, compatibility fixtures, CI configuration, test results, representative screenshots, portrait/story samples for a single and pair, and an honest list of remaining limitations. Correct documentation that currently overstates encounter animation, export typography, or reduced-motion support.

Run an observed test with ten people after technical acceptance. Proposed product thresholds: eight complete unaided; six can explain which inputs changed the result; five voluntarily save or initiate sharing. Separately recruit at least ten invitation recipients and target at least four completed companions. Record the denominator and observed failures. These are decision thresholds, not established market benchmarks.

Build priority: **trustworthy creation → visible authorship → faithful export → working invitation → replay enhancements**. Publishing the site and outreach remain separate release actions.
