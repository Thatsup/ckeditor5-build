# CKEditor 5 build — webpack → Vite library migration

## Background

`@thatsup/ckeditor5-build` is a redistributable npm package consumed by other Thatsup projects via a `<script src=".../build/ckeditor.js">` tag that exposes a `CKEDITOR` global. It currently uses webpack to bundle the unified `ckeditor5@48` package plus a custom `InternalLink` plugin into a UMD file at `build/ckeditor.js`.

Webpack-based custom builds are no longer the recommended way to package CKEditor 5. The current recommendation is to consume the unified `ckeditor5` npm package with a modern bundler (Vite preferred). Because this repo's role is to be a shared, drop-in script tag for downstream consumers — not to be folded into a single app — the modernized form is a **Vite library-mode bundle**, not a Vite app.

## Goals

- Replace webpack with Vite, producing a UMD + ES bundle that is a drop-in replacement for the current `build/ckeditor.js`.
- Preserve the public surface: `CKEDITOR.ClassicEditor`, `CKEDITOR.BalloonEditor`, `CKEDITOR.MiniEditor`, with the same plugins, toolbar config, image/table/heading config, license key, and Swedish translations.
- Preserve the drop-in consumption model: one `<script src>` tag, no separate CSS file required by consumers.
- Keep the custom `InternalLink` plugin behavior identical end-to-end (autocomplete against `places.json`, link insertion with `data-page`, title fetch from `place.json`).

## Non-goals

- No plugin rewrites, no new editor types, no React/Vue integration.
- No changes to the `InternalLink` plugin's runtime behavior, config shape, or DOM output.
- No upgrade of `ckeditor5` itself (stays at `^48.1.1`).
- No CI/release-process changes beyond what's required for the new build command.

## Approach

### Location

A fresh project is scaffolded at `/Users/robin/Sites/ckeditor5-build-vite` (sibling to this repo). The webpack repo stays intact as a reference and as the currently-published artifact until the new bundle is verified, at which point the new directory replaces it (same package name, same downstream consumers).

### Project shape

```
ckeditor5-build-vite/
├─ package.json          (name: @thatsup/ckeditor5-build, version bump)
├─ vite.config.js        (build.lib with UMD + ES formats)
├─ src/
│  ├─ ckeditor.js        (ported as-is from current src/ckeditor.js)
│  └─ plugins/
│     └─ internallink/   (whole subtree copied as-is, except 2 SVG imports)
├─ sample/
│  └─ index.html         (current sample, served by Vite during dev)
└─ dist/                 (build output — replaces current build/)
   ├─ ckeditor.umd.js    ← drop-in for existing <script src> consumers
   ├─ ckeditor.umd.js.map
   └─ ckeditor.es.js
```

`package.json` updates:
- `main` → `./dist/ckeditor.umd.js`
- `module` → `./dist/ckeditor.es.js`
- `files` → `["dist"]`. The current `files` array also lists `ckeditor5-metadata.json`, but no such file exists in the repo; the stale entry is dropped.
- `scripts.dev` → `vite`
- `scripts.build` → `vite build`
- Move `awesomplete`, `axios`, `lodash` from `devDependencies` to `dependencies` (they are bundled runtime code).
- Remove webpack-era devDeps: `webpack`, `webpack-cli`, `css-loader`, `style-loader`, `raw-loader`, `terser-webpack-plugin`, `ts-loader`.
- Add: `vite`, `vite-plugin-css-injected-by-js`.

### `vite.config.js` outline

```js
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [cssInjectedByJsPlugin()],
  build: {
    lib: {
      entry: 'src/ckeditor.js',
      name: 'CKEDITOR',
      formats: ['umd', 'es'],
      fileName: (format) => `ckeditor.${format}.js`,
    },
    sourcemap: true,
    minify: 'terser',
  },
});
```

### The three toolchain adjustments Vite requires

1. **SVG as raw strings.** Webpack's `raw-loader` made `import LinkIcon from '.../link.svg'` return the file's text. Vite returns a URL by default. Fix: append `?raw` to the two SVG imports in the InternalLink plugin (`InternalLinkUi.js`'s `link.svg` import, and the analogous `unlink.svg` import). CKEditor's own internal icons are unaffected because they ship inside the `ckeditor5` package already.

2. **CSS injection.** Webpack's `style-loader` (with `injectType: 'singletonStyleTag'`) auto-injected `ckeditor5.css` and the plugin's theme CSS into the page at runtime, so a single `<script src>` was sufficient. Vite library mode extracts CSS to a sibling `style.css` file by default. To preserve the single-script drop-in, the build uses `vite-plugin-css-injected-by-js`, which inlines the extracted CSS into the bundle and injects it via JS at runtime — same observable behavior as today.

3. **Runtime dependencies.** `awesomplete`, `axios`, and `lodash` are currently misclassified as devDependencies. They are bundled into the output but should be declared as runtime dependencies for correctness and so downstream installs of the npm package surface them correctly.

### What is NOT externalized

For a drop-in UMD consumed via `<script src>`, **nothing is externalized** — `ckeditor5`, `awesomplete`, `axios`, and `lodash` are all bundled in, matching the current webpack output. The ES build follows the same policy for parity; downstream consumers using the ES build via their own bundler get the same self-contained artifact.

## Verification

During development, `npm run dev` (i.e. `vite`) starts a dev server. The user visits `http://localhost:5173/sample/` to load `sample/index.html`. No project-root `index.html` is needed; Vite serves any HTML file under the project root.

### Automated (run during migration)

1. `npm run build` succeeds; `dist/ckeditor.umd.js` exists.
2. Bundle size within ±20% of the current `build/ckeditor.js` — a wildly different size signals a missing plugin or a duplicated `ckeditor5` copy.
3. Headless smoke load (via chrome-devtools MCP): load `sample/index.html` against `vite preview`, assert no console errors, assert `window.CKEDITOR.ClassicEditor`, `BalloonEditor`, and `MiniEditor` are all functions.

### Manual (sign-off by user)

1. `npm run dev` serves `sample/index.html`; all 3 editors mount with the expected toolbar.
2. Exercise every toolbar item on the Classic editor (headings, bold/italic/underline, link, alignment, lists, image upload, blockquote, insert table, media embed, horizontal line, remove format, undo/redo). Behavior matches the current webpack build.
3. **InternalLink end-to-end** (highest-risk surface — exercises the SVG-raw fix, awesomplete CSS, lodash, and axios): open the InternalLink form, type to autocomplete from `/places.json`, pick a suggestion, confirm link is inserted with `data-page="<uuid>"`, click the link to confirm the actions balloon shows the title fetched from `/place.json`.
4. Set `language: 'sv'` in the sample; verify tooltips/labels are Swedish.
5. Drop-in test: copy `dist/ckeditor.umd.js` into a scratch HTML page with just a plain `<script src>` (no module loader, no other tags). Confirm `CKEDITOR.ClassicEditor.create(...)` works exactly like today.

### Risks & mitigations

- **CSS load order vs. consumer styles.** `css-injected-by-js` injects at script-execution time, which can land later than a consumer's own `<link rel="stylesheet">`. Mitigation: verify in the manual sample that editor styles render correctly; if a consumer reports a specificity collision, the fallback is to switch to emitting `dist/ckeditor.css` and document a `<link>` requirement.
- **Tree-shaking differences.** Vite + Rollup may tree-shake `lodash` and `ckeditor5` slightly differently than webpack. Mitigation: the bundle-size check above, plus end-to-end exercise of every toolbar item.
- **UMD global name collisions.** The current global is `CKEDITOR`. Vite's UMD generation uses the `name` field directly; verified in `vite.config.js`.

## Out of scope (explicit non-changes)

- The `tests/` directory — left untouched; not part of the published artifact.
- `.idea`, `.eslintrc.js`, `CHANGELOG.md` — copied or recreated as-is; no content changes.
- The `place.json` / `places.json` sample data files — copied unchanged.
