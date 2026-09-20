// ===================== Setup =====================
const el = id => document.getElementById(id);

const audio = {
  warDrums:    el('a-war-drums'),
  cloudWind:   el('a-cloud-wind'),
  thunder:     el('a-thunder'),
  rain:        el('a-rain'),
  collapse:    el('a-collapse'),
  brickBuildup:el('a-brick-buildup'),
  titleImpact: el('a-title-impact'),
  titleSword:  el('a-title-sword'),
};

const VOLUMES = {
  warDrums: 0.5, cloudWind: 0.35, thunder: 0.5, rain: 0.4,
  collapse: 0.55, brickBuildup: 0.5, titleImpact: 0.65, titleSword: 0.55,
};
Object.keys(audio).forEach(k => audio[k].volume = VOLUMES[k]);

function play(key) {
  audio[key].currentTime = 0;
  audio[key].play().catch(() => {});
}

const titleImg  = el('titleImg');
const brickWall = el('brickWall');

const BRICK_IMG = '../shared/assets/images/cutscene/brick.png';
const TITLE_1   = '../shared/assets/images/cutscene/title-name.png';
const TITLE_2   = '../shared/assets/images/cutscene/title-name2.png';

// ===================== Build a FULL-SCREEN grid of individual brick pieces =====================
const BRICK_ASPECT = 1750 / 1000;
const ROWS = 10;
const rowHeight  = window.innerHeight / ROWS;
const brickWidth = rowHeight * BRICK_ASPECT;
const COLS = Math.ceil(window.innerWidth / brickWidth);
const cellWidth  = window.innerWidth / COLS; // stretch slightly so it fills edge-to-edge

const pieces = []; // { el, row, col }

for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const piece = document.createElement('div');
    piece.className = 'brick-piece';
    piece.style.left   = `${col * cellWidth}px`;
    piece.style.top    = `${row * rowHeight}px`;
    piece.style.width  = `${cellWidth + 1}px`;  // +1 avoids hairline gaps between cells
    piece.style.height = `${rowHeight + 1}px`;
    piece.style.backgroundImage = `url(${BRICK_IMG})`;
    brickWall.appendChild(piece);
    pieces.push({ el: piece, row, col });
  }
}

// Random offscreen starting point + rotation, like it's flying in from a direction —
// picks one of several directions so pieces converge from all around the screen.
function randomStartTransform() {
  const dist = 50 + Math.random() * 50; // vw/vh distance offscreen
  const rot  = (Math.random() * 90 - 45).toFixed(0); // tighter spin, feels more like it's being thrown, not tumbling wildly
  const dirs = [
    `translate(${dist}vw, 0)`,
    `translate(${-dist}vw, 0)`,
    `translate(0, ${dist}vh)`,
    `translate(0, ${-dist}vh)`,
    `translate(${dist * 0.7}vw, ${-dist * 0.7}vh)`,
    `translate(${-dist * 0.7}vw, ${dist * 0.7}vh)`,
  ];
  const dir = dirs[Math.floor(Math.random() * dirs.length)];
  return { transform: `${dir} rotate(${rot}deg)`, dist };
}

function buildWall() {
  // Every piece gets its own random flight-in delay within the same overall
  // window, so many are converging at once. Position uses an ease-in-out
  // curve so the distance is actually visible throughout the flight (not
  // front-loaded like ease-out, which made pieces "teleport" near the end).
  // Opacity fades in fast and separately, so the piece is clearly visible
  // for its whole trip instead of appearing only once it's nearly arrived.
  const BUILD_WINDOW_MS = 6800; // brick-buildup.mp3 has ~7s of usable buildup time
  const shuffled = [...pieces].sort(() => Math.random() - 0.5);

  shuffled.forEach(p => {
    const { transform, dist } = randomStartTransform();
    p.el.style.transform = transform;
    const delay    = Math.random() * (BUILD_WINDOW_MS - 1100);
    // further-traveling pieces take longer, closer ones arrive faster — real velocity
    const duration = 650 + dist * 6 + Math.random() * 250;

    p.el.style.transition =
      `transform ${duration}ms cubic-bezier(0.33,0,0.55,1) ${delay}ms, ` +
      `opacity 160ms linear ${delay}ms`;

    setTimeout(() => p.el.classList.add('up'), 20); // triggers the transition
  });
}

function collapseWall(onDone) {
  // Top rows fall first, bottom rows fall last, with random jitter so it
  // crumbles naturally. Pieces from higher rows fall further, so they get
  // a longer duration and more tumble — real physics, not uniform motion.
  const ROW_STAGGER_MS = 260;
  const JITTER_MS = 220;

  let lastFireTime = 0;

  pieces.forEach(p => {
    const baseDelay = p.row * ROW_STAGGER_MS;
    const jitter = Math.random() * JITTER_MS;
    const totalDelay = baseDelay + jitter;
    lastFireTime = Math.max(lastFireTime, totalDelay);

    // how far this piece has to fall to clear the bottom of the screen
    const fallDistanceVh = 110 + (ROWS - p.row) * 8 + Math.random() * 20;
    const fallDurationMs = 900 + (ROWS - p.row) * 70 + Math.random() * 150;
    const drift = (Math.random() * 40 - 20).toFixed(1); // vw
    const rot = (Math.random() * 60 - 30 + (ROWS - p.row) * 4).toFixed(0); // higher pieces tumble more

    setTimeout(() => {
      p.el.style.transition = `transform ${fallDurationMs}ms cubic-bezier(0.55,0.06,0.68,0.19) 0ms, opacity ${fallDurationMs}ms ease 0ms`;
      p.el.style.transform = `translate(${drift}vw, ${fallDistanceVh}vh) rotate(${rot}deg)`;
      p.el.classList.remove('up');
      p.el.classList.add('fall');
    }, totalDelay);

    lastFireTime = Math.max(lastFireTime, totalDelay + fallDurationMs);
  });

  setTimeout(onDone, lastFireTime + 300);
}

// ===================== Timeline =====================
function runCutscene() {
  play('warDrums');

  setTimeout(() => {
    play('cloudWind');
    el('csTopCloud').classList.add('blow-left');
    el('csBottomCloud').classList.add('blow-right');
  }, 2000);

  setTimeout(() => {
    el('csDark1').classList.add('show');
    play('thunder');
    play('rain');
  }, 4000);

  setTimeout(() => play('collapse'), 6000);
  setTimeout(() => el('csDark2').classList.add('show'), 7000);
  setTimeout(() => el('csDark3').classList.add('show'), 8000);

  // t=10.5s — bricks summon in from all directions, building the wall
  setTimeout(() => {
    play('brickBuildup');
    buildWall();
  }, 10500);

  // t=10.5s + 9s(audio) + 2s(pause) = 21.5s — title slams in, carved by the bricks
  setTimeout(() => {
    titleImg.src = TITLE_1;
    titleImg.classList.add('show', 'shake-strong');
    play('titleImpact');
  }, 21500);

  // t=23.5s — second title, real but gentler impact
  setTimeout(() => {
    titleImg.classList.remove('shake-strong');
    titleImg.src = TITLE_2;
    void titleImg.offsetWidth; // restart animation
    titleImg.classList.add('shake-mild');
    play('titleSword');
  }, 23500);

  // t=25.5s — a beat of anticipation: title suddenly punches bigger, cinematic
  setTimeout(() => {
    titleImg.classList.remove('shake-mild');
    titleImg.classList.add('pop-big');
  }, 25500);

  // t=27s — everything crumbles: title falls with real velocity first, then
  // the wall collapses top-to-bottom, revealing the actual game screen
  setTimeout(() => {
    play('collapse');
    titleImg.classList.add('title-fall');

    setTimeout(() => {
      collapseWall(() => {
        window.location.href = '../games/memory-match/index.html';
      });
    }, 600);
  }, 27000);
}

runCutscene();
