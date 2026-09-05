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

[Play the 1,023-byte edition](https://dead-center-arcade.vercel.app/1k.html).

`public/1k.html` is the entire game, including HTML, styling, and JavaScript. It is 1,023 raw UTF-8 bytes, with no external assets or libraries. Arrow keys move; hold Space to shoot. Death reloads the game. This edition omits touch controls, menus, pause, saved best scores, and the full version's detailed rendering.

Verify its byte count with `wc -c public/1k.html`. To run its browser tests, install Chromium with `npx playwright install chromium`, then run `node tests/1k.cjs`. An installed Chrome can be selected with `CHROME_PATH`.
