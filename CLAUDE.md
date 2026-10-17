# Hungry Orca

An easy, slow Flappy-Bird-style game for kids. The player is an orca in the Arctic: eat fish, swim under ice floes so the seals fall in, ram the rare sunfish, and avoid fishing nets, whalers' harpoons, submarines and jellyfish. `PLAN.md` has every decision the owner made (dated, newest last; add new ones there).

- **Live:** https://dbugger85.github.io/hungry-orca/ (GitHub Pages from `main` / root; `git push` redeploys in about a minute)
- **Repo:** https://github.com/dbugger85/hungry-orca (public, branch `main`)
- **Owner:** a beginner "vibe coder". Explain changes in plain language. Commit and push only when asked, and never put the claude.ai session link in commits.

## Commands

```sh
npm test                       # quick checks, no browser: the script parses, manifest + icons + sw.js files exist
npm run screenshots            # headless Chromium screenshots of set-up scenes → test/out/*.png (gitignored)
npm run screenshots -- whaler  # only scenes whose name contains "whaler"
npm start                      # serve at http://localhost:8000 (needed to test the service worker; file:// works for the game)
```

Run `npm test` after every change and `npm run screenshots` after anything visual, then **look at the PNGs**. Headless Chrome doesn't run `requestAnimationFrame` normally, so `test/screenshots.mjs` copies `index.html`, replaces the last `requestAnimationFrame(frame);` with a scene script (set up objects, call `update(1/60)` N times, optionally an autopilot calling `swim()`), then draws. If the end of the script changes, update `TAIL` there. Add a scene when you add something new. In this sandbox a local web server is only reachable with the sandbox off and `--bind 127.0.0.1`.

## Stack and rules

- **One file:** the whole game is `index.html`: a `<canvas>` and plain JavaScript in one `<script>`. No framework, no build step, no libraries, no image or sound files. Everything is drawn with canvas code and every sound is synthesized (Web Audio). Only relative paths.
- **Kid-friendly:** the explosion is confetti and stars, deaths are cartoon (belly-up with X eyes, or stuck in a net), no blood.
- **Easy and slow** (owner's wish): soft walls at the surface and seabed, 3 lives, lives come back, forgiving hit boxes. Keep new things gentle.
- **Phones and tablets first-class:** tap anywhere to swim; test landscape and portrait phone sizes (the screenshot scenes include both).
- **Performance:** gradients are built once in `buildGradients()` (called from `resize()`) and kept in `G`; no `shadowBlur`; particles drawn as batched paths. Don't create gradients per object per frame.
- **Mouth stays see-through** (owner's wish): when the jaw opens, only teeth and a small pink tongue are drawn, no dark/red mouth fill.
- **The orca must look like a real orca** (owner's reference: a sheet of orca silhouettes): long slim body, smallish rounded head, tall narrow dorsal fin mid-body, **horizontal flukes seen edge-on that beat up and down** (no fish-like vertical tail), white chin/belly/flank patch and eye patch, grey saddle.
- **When you add, rename or remove a file the app loads, update `FILES` in `sw.js`** (`npm test` checks the listed files exist). The worker is network-first, so a normal change doesn't need a new `CACHE` name.

## Files

| File | What |
|---|---|
| `index.html` | The whole game (see the code map below) |
| `manifest.webmanifest` | Installable app: `display: fullscreen`, `orientation: landscape`, dark navy `background_color`/`theme_color`, icons |
| `sw.js` | Service worker for offline play: same-origin files network-first with the cache as fallback; Google Fonts cache-first. Registered only over http(s) |
| `icons/icon.svg`, `icons/icon-square.svg` | Icon sources in the shared glass style of PrimeTime/ProPoker/ProQuiz (arctic-blue gradient, frosted disc with rim light, white orca with the eye patch cut out and the belly see-through via an SVG mask). `icon.svg` is rounded (normal icon, favicon); `icon-square.svg` is full-bleed (maskable, Apple) |
| `icons/*.png` | Made with `rsvg-convert -w 512 -h 512 icons/icon.svg -o icons/icon-512.png` (also 192 from `icon.svg`; `icon-maskable-512.png` 512 and `apple-touch-icon.png` 180 from `icon-square.svg`) |
| `test/check.mjs` | `npm test` |
| `test/screenshots.mjs` | `npm run screenshots`: scenes title, gameplay (autopilot), mixed, seal, net-tear, net-death, flip-death, whaler-aim, whaler-shot, orca-closeup (closed, open, dead), install-buttons, phone-landscape, phone-portrait |
| `README.md` | For players: how to play, install, files, development commands |
| `screenshots/` | The README pictures (`gameplay`, `whaler`, `title`), JPGs made from `npm run screenshots` output with `magick test/out/<name>.png -quality 82 screenshots/<name>.jpg`; remake them when the look changes |
| `PLAN.md` | The owner's decisions, dated |

## Code map (`index.html`, in this order)

- **Setup:** `H = 540` game units tall (fixed), `W` adapts to the screen (720–1600; narrower screens letterbox with sky above and sand below plus a "Turn your phone sideways" hint). `SURFACE = 130`, `SEABED = 500`, `ORCA_X = 210` (the orca stays at this x; the world scrolls). `resize()` sets `scale`, `offX/offY`, `dpr` (max 2) and rebuilds `G`.
- **Sound:** `tone()` and `noise()` make every effect in `sfx` (swim, eat, splash, seal, pop, hit, life, over, harpoon, tear). Audio starts on the first tap (`audioInit()`). `muted` toggles with the speaker button or M.
- **Best score:** localStorage `hungryOrcaBest` (wrapped in try/catch).
- **State:** `state` is `'title' | 'play' | 'dying' | 'over'`. `reset()`/`start()`, `die(kind, o)` (`'net'` = stuck in the net, `'flip'` = belly-up), `gameOver()` (2.2 s after `die`).
- **Input:** tap/click anywhere (pointerdown), or Space/↑/W/Enter = swim (`orca.vy = -240`). F = full screen, M = mute. `topButtons()` places the round buttons top right: sound (`W-40`), full screen (if the browser can and the app isn't installed), and the yellow **Install app** pill (only when Chrome fired `beforeinstallprompt`, not during play). `toggleFullscreen()` also tries `screen.orientation.lock('landscape')`. The service worker is registered here.
- **Helpers:** `waveY(x)` (the moving surface), `orcaPts()` (5 points along the orca's body, rotated with it) for collisions: `hitsCircle`, `hitsRect` (pad 14, forgiving), `mouthHits` (front 3 points only, so food must reach the head). `addScore()` gives a life back every 50 points (max 3).
- **Spawning:** fish every 0.7–1.3 s; floes every 4.5–7.5 s (80% with a seal; not while a boat/whaler is at the right edge); obstacles every 4.5–7 s minus up to 2.5 s over time, at least 280 px apart (`rightEdge()`), mix boat 28% / sub 28% / jelly 22% / whaler 22% (no whalers in the first 15 s; boats and whalers swap to a sub when a floe is near); sunfish first after 22–30 s, then every 35–55 s, with a 1.6 s flashing "!" warning on the right.
- **Update:** `ws` = world scroll speed: `min(260, 105 + 0.7 × seconds)` while playing (owner: slowly faster the whole game), slows down while dying, 0 when over, 70 on the title screen. Orca physics: gravity 360, max sink 160, soft surface (bounce, splash) and seabed. The mouth opens when food is ahead (`orca.mouth` 0..1) and snaps shut on a bite (`orca.snap`). Everything moves with `ws`; collisions only while `live`.
  - **Fish** +1. **Seal**: swimming under a floe with a seal (orca within 85 of the surface) tips it in; it splashes, then **flees**: dives towards a random depth and swims away at 55 px/s, so you have to chase it; +5 only when the mouth reaches it. **Sunfish**: ram it → `explode()` (ring, confetti, stars, bubbles, screen shake) +10.
  - **Obstacles** (hit = lose a life, 2 s blinking invulnerability): `boat` (net sways ±14 and sinks/rises ±32; on a hit the net stretches round the orca's nose for 0.4 s, then rips: the top stays, the bottom sinks and fades, and a torn net can't hurt again), `sub` (bobs ±38 and tilts), `jelly` (bobs), `whaler` (a harpooner at a bow cannon aims at the orca; a flashing red dotted aiming line shows during the last 0.9 s; it fires up to 2 harpoons, 2.4 s apart, at 330 px/s on a rope, they slow down in the water).
  - **Last life:** a net → `die('net')`: the orca is wrapped in the net (`drawWrappedNet`) and wriggles while the boat drags it; anything else → `die('flip')`: it rolls belly-up (`orca.flip`), X eyes, floats to the surface. Tail and flipper stop moving once dead (`still`), and the net wriggle stops when the game-over panel shows.
- **Drawing:** scenery (`drawSky` with snowy ridges, `drawWaterBase` teal → near-black navy, `drawWaterTint` over submerged parts, `drawRays`, marine snow, `drawSeabed` with gravel, boulders, kelp, starfish, `drawSurfaceLine`), characters (`drawOrca(x, y, ang, alpha, flip, dead)` with a hinged lower jaw, `drawFish`, `drawSeal(x, y, ang, flip)`, `drawFloe`, `drawSunfish`), obstacles (`drawBoatHull`, `drawWhaler`, `drawHarpoons`, `drawNet`/`netMesh`/`netFloats`, `drawWrappedNet`, `drawSub`, `drawJelly`), effects and HUD (`drawParticles`, `textOut`, hearts, `drawTopButtons`, `drawTitle`, `drawOver`). `draw()` layers them: sky → water → floes and hulls → tint → rays → seabed → nets/subs/jellies → harpoons → fish, seals, sunfish → particles → orca → surface line → texts → HUD.
- **Main loop:** `frame()` with `dt` capped at 0.05 s.

## Ideas not built yet
- Norwegian text (the owner's other apps are English + Norwegian)
- A pause button
- An install card with iPhone steps (like Substitutor/PrimeTime) instead of only the README
