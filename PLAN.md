# Hungry Orca: plan and decisions

## The idea (owner, 2026-10-17)

A simple game like Flappy Bird, but the player is an orca swimming and eating fish. The water surface is visible. Ice sheets with seals: when the orca swims right below one, the seal falls into the water and the orca eats it. **Easy, and not as fast as Flappy Bird.**

How it was built: one HTML file with a canvas and plain JavaScript, no install, works on computers, tablets and phones.

## Decisions (dated, newest last)

### 2026-10-17
- **Rare sunfish** the orca can explode (like a YouTube video): kept cartoon-style (bubbles, stars and confetti, no blood), +10, with a "!" warning before it appears.
- Points: fish +1, seal +5, sunfish +10.
- **A few slow obstacles with 3 lives** (not a no-lose relaxed mode): submarine, fishing boat with a net, jellyfish. A life back every 50 points.
- **Must work on phones too.** Phone held upright: the game is letterboxed with sky and sand and a "Turn your phone sideways" hint.
- **The submarine and net move a bit** (sub bobs and tilts; the net sways and sinks/rises).
- **A seal that falls in isn't eaten automatically**: it flees and dives, and you have to catch it.
- **The orca's mouth opens** when food is near, and snaps shut on a bite.
- **More realistic orca shape** (first pass), then: **no red inside the mouth, make it transparent**, and **narrower dorsal fin at the base**.
- **Swimming into a net:** the net stretches and rips, but you still lose a life. **On the last life the orca gets stuck in the net** (dragged off), or for other obstacles **flips belly-up and dies**.
- **The tail stops moving when the orca is dead.**
- **More realistic graphics overall**, orca like the owner's reference sheet of orca silhouettes; **arctic water, darker the deeper you go** (done by a Fable agent, then reviewed).
- **Slowly speed things up the whole game** (speed keeps rising to about 2.5× after 3.5 minutes; obstacles come a bit more often).
- **Published on GitHub**: public repo `hungry-orca`, playable on GitHub Pages.
- **Whaling ship** with a man shooting a harpoon (warning line first, dodgeable, costs a life). **The dorsal fin was still too wide and the tail must not have vertical fins**; the owner saw too little difference in the orca, so it was redrawn: longer and slimmer, narrow tall fin, horizontal flukes beating up and down.
- **Full screen and installable app**: full-screen button, app manifest (opens full screen, sideways), offline support, Install app button.
- **Icon in the same style as ProPoker and PrimeTime** (glass disc, white symbol): arctic blue with a white orca.
- **Document everything**: CLAUDE.md, this file, README, `npm test` and `npm run screenshots`.
