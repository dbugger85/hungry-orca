// Screenshots of the game in set-up situations, taken with headless Chromium (/usr/bin/chromium).
// Headless Chrome doesn't run the animation loop, so each scene copies index.html, replaces the
// main loop with a script that builds the situation, runs update() N times, then keeps drawing.
// Output: test/out/*.png (gitignored). Look at them after changing how anything looks.
//   npm run screenshots            all scenes
//   npm run screenshots -- whaler  only the scenes whose name contains "whaler"
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname;
const out = root + 'test/out/';
mkdirSync(out, { recursive: true });
const html = readFileSync(root + 'index.html', 'utf8');
const TAIL = 'requestAnimationFrame(frame);\n</script>';
if (!html.includes(TAIL)) throw new Error('index.html no longer ends with the main loop call; update test/screenshots.mjs');

// Runs `steps` frames of 1/60 s; `pilot` swims whenever the orca sinks below that y
const run = (steps, pilot = 0) => `for (let i = 0; i < ${steps}; i++) { if (${pilot} && state === 'play' && orca.y > ${pilot} && orca.vy > 0) swim(); update(1/60); }`;
const quiet = 'floeTimer = 99; obsTimer = 99; sunTimer = 99; fishTimer = 99;';

const SCENES = {
  // name: [setup code, window size, 'own' if the scene draws by itself]
  title: ['', '1200,700'],
  gameplay: [`start(); invuln = 999; floeTimer = 0.5; obsTimer = 1; sunTimer = 2; ${run(900, 260)} invuln = 0;`, '1200,700'],
  mixed: [`start(); ${quiet}
    obstacles.push({ type: 'boat', x: 520, net: 150, seed: 1, sway: 0, depth: 150 });
    obstacles.push({ type: 'sub', x: 800, by: 380, y: 380, ph: 0, tilt: 0 });
    obstacles.push({ type: 'jelly', x: 420, by: 420, y: 420, ph: 0 });
    sunfish = { x: 1000, by: 300, y: 300, ph: 0 };
    for (let i = 0; i < 6; i++) fishes.push({ x: 300 + i * 110, by: 250 + (i * 77) % 200, y: 0, vx: 30, ph: i, c: '#3a6a8c', s: 1 });
    ${run(30, 300)}`, '1200,700'],
  seal: [`start(); ${quiet}
    floes.push({ x: 300, w: 150, hasSeal: true, tipped: false, tipT: 0, seed: 1, pts: [[-75, 2], [-67, -12], [-30, -15], [22, -13], [65, -14], [75, 2], [63, 20], [-61, 22]] });
    seals.push({ x: 600, y: 300, vx: 0, vy: 0, inWater: true, ang: 0.2, dive: 400 });
    ${run(1)}`, '1200,700'],
  'net-tear': [`start(); ${quiet} orca.y = 270;
    obstacles.push({ type: 'boat', x: ORCA_X - 50, net: 200, seed: 2, sway: 0, depth: 200 });
    ${run(45, 270)}`, '1000,580'],
  'net-death': [`start(); ${quiet} lives = 1; orca.y = 270;
    obstacles.push({ type: 'boat', x: ORCA_X - 50, net: 200, seed: 2, sway: 0, depth: 200 });
    ${run(80, 270)}`, '1000,580'],
  'flip-death': [`start(); ${quiet} lives = 1; orca.y = 270;
    obstacles.push({ type: 'jelly', x: ORCA_X + 60, by: 300, y: 300, ph: 0 });
    ${run(250)}`, '1000,580'],
  'whaler-aim': [`start(); ${quiet} orca.y = 300;
    obstacles.push({ type: 'whaler', x: 620, seed: 1, cool: 1.2, shots: 0, aim: 2, recoil: 0 });
    ${run(40, 300)}`, '1100,640'],
  'whaler-shot': [`start(); ${quiet} orca.y = 300;
    obstacles.push({ type: 'whaler', x: 620, seed: 1, cool: 1.2, shots: 0, aim: 2, recoil: 0 });
    ${run(110, 300)}`, '1100,640'],
  'orca-closeup': [`state = 'play';
    const f3 = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#2a8fa8'; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.setTransform(3, 0, 0, 3, 0, 0); orca.chomp = 0; orca.mouth = 0; drawOrca(115, 80, 0, 1); orca.mouth = 1; drawOrca(305, 80, 0, 1);
      orca.mouth = 0; drawOrca(115, 170, 0, 1, 1, true); requestAnimationFrame(f3); }; f3();`, '1200,650', 'own'],
  'install-buttons': [`installPrompt = { prompt() {} };`, '1100,620'],
  'phone-landscape': ['', '844,390'],
  'phone-portrait': ['', '390,844'],
};

const only = process.argv[2];
for (const [name, [setup, size, own]] of Object.entries(SCENES)) {
  if (only && !name.includes(only)) continue;
  const loop = own ? '' : 'const f2 = () => { draw(); requestAnimationFrame(f2); }; f2();';
  const scene = setup ? `setTimeout(() => { resize(); ${setup}\n ${loop} }, 300);\n</script>` : TAIL;
  const page = out + name + '.html';
  writeFileSync(page, html.replace(TAIL, scene));
  execFileSync('chromium', ['--headless', '--disable-gpu', '--hide-scrollbars', `--window-size=${size}`, '--virtual-time-budget=2500', `--screenshot=${out + name}.png`, 'file://' + page], { stdio: 'ignore' });
  console.log('test/out/' + name + '.png');
}
