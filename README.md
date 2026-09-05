# Dead Center

A browser recreation of mors's pico1k arena shooter, based on a supplied gameplay recording.

[Play the game](https://dead-center-arcade.vercel.app)

Move with WASD or arrow keys. Hold Space to fire toward the center. Bullets ricochet once and disappear on their next wall hit. Avoid targets and your returning bullets. Touch controls are available on mobile.

## Development

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

```sh
npm run validate
npm run build
```

The static build is in `dist/client`. Game simulation and pixel rendering are in `lib/game.ts`; controls and screens are in `app/page.tsx`.

This is an independent recreation, not the original game's source code.

## Under 1 KB edition

[Play the 1,022-byte edition](https://dead-center-arcade.vercel.app/1k.html).

`public/1k.html` contains the entire executable game: HTML, CSS, JavaScript, the unpacker, and a UTF-8 marker. Its 1,022-byte size is the uncompressed file size. No external code, images, fonts, or runtime downloads are required.

The rewrite has inward-facing ship rotation, arrow/WASD movement, center-aimed shots, pink targets, dark blue scoring, impact-localized wall waves, one ricochet per bullet, ammunition consumed by target hits, and automatic restart on death. Targets travel along diameters of the arena. Menus, touch controls, pause, and saved best scores remain in the larger edition.

`compact/game.js` contains the unpacked source. `scripts/build-1k.cjs` uses RegPack during development and enforces the complete-file byte limit. RegPack is not downloaded at runtime. Run `npm run build:1k` to regenerate the file, or `npm run build` to regenerate it and build the larger edition.

The byte savings come from polar coordinates for moving objects, shared drawing and collision calculations, a compact key map, and dictionary packing. The UTF-8 marker ensures the triangular ship renders correctly even when opening the file from disk.

Run `wc -c public/1k.html` to verify the size. For browser checks, run `npx playwright install chromium`, then `node tests/1k.cjs`. An installed Chrome can be selected with `CHROME_PATH`.
