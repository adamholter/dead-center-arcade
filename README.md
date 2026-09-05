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
