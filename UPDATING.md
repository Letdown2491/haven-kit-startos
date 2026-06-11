# Updating the upstream version

This package wraps [barrydeen/haven](https://github.com/barrydeen/haven), built
from source by the local `Dockerfile`. The packaged version is determined by
the `HAVEN_VERSION` build arg default in `Dockerfile` — a git tag or commit in
the upstream repo. There is no image tag or submodule to bump.

## Determining the upstream version

```sh
gh release view -R barrydeen/haven --json tagName -q .tagName
```

The current pin is the `ARG HAVEN_VERSION=` default in `Dockerfile`.

## Applying the bump

1. **Update the pin** in `Dockerfile`:

   ```dockerfile
   ARG HAVEN_VERSION=v1.2.3
   ```

   Prefer release tags; pin a commit only when an unreleased fix is needed
   (and say so in the comment above the ARG).

2. **Advance the version graph** in `startos/versions/`. StartOS computes
   upgrade paths from this graph, so the previously-current version must be
   kept as a node:

   - Copy the existing `current.ts` to a per-version file named for the
     version it holds (e.g. `v1_2_2.ts`), renaming the export to match
     (`export const v1_2_2 = ...`).
   - Rewrite `current.ts` with the new version (`x.y.z:0` — reset the
     package-revision suffix on upstream bumps, increment it for
     packaging-only changes) and fresh release notes.
   - Register the old version in `versions/index.ts` under `other`.

3. **Review the config surface**: if the new haven version adds or renames
   `.env` settings, update `defaultEnv` in `startos/init/seedFiles.ts` and the
   relevant action in `startos/actions/`.

4. **Verify**: `npm run check && make x86`, then sideload and confirm the
   relay starts, the Setup action round-trips, and a config change restarts
   the relay.
