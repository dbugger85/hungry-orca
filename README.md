# Hungry Orca

An easy, slow Flappy-Bird-style game for kids. Swim as an orca in the Arctic, eat fish, knock seals off the ice, pop the rare sunfish, and avoid fishing nets, whalers' harpoons, submarines and jellyfish.

**Play:** https://dbugger85.github.io/hungry-orca/

## How to play

- Tap, click or press Space to swim up. The orca sinks slowly on its own.
- Fish: +1
- Swim right under an ice floe and the seal falls in. Catch it: +5
- Sunfish (rare): ram it, +10
- Watch out for the whaling ship: a red dotted line shows where the harpoon will fly.
- You have 3 lives and get one back every 50 points. A net rips when you hit it, but it still costs a life.
- The game gets slowly faster over time.

Works on computers, tablets and phones (best held sideways).

## Full screen and app

- **Full screen:** tap the corners button at the top right (or press F). On Android it also turns the screen sideways.
- **Install as an app (Android, Chrome, Edge):** tap **Install app** at the top of the start screen, or use the browser menu > *Install app* / *Add to Home screen*.
- **iPhone/iPad:** open the game in Safari, tap Share > **Add to Home Screen**. It then opens full screen from the home screen.
- Once installed, the game also works offline.

## Files

The game is all in `index.html`: one file with a canvas and plain JavaScript, no build step. Open it in a browser to play locally.

`manifest.webmanifest`, `sw.js` (offline support) and `icons/` make it installable. `icons/icon.svg` (rounded) and `icons/icon-square.svg` (full-bleed, for Android and iPhone) are the sources, in the same glass style as PrimeTime, ProPoker and ProQuiz; the PNGs are made with `rsvg-convert -w 512 -h 512 icons/icon.svg -o icons/icon-512.png`.
