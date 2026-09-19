// ---------- Ambient background audio ----------
const bgMusic = document.getElementById('bg-music');
const bgWind  = document.getElementById('bg-wind');

bgMusic.volume = 0.25;  // quiet, sits behind everything
bgWind.volume  = 0.18;  // just a light ambient layer

// Browsers block audio with sound until the user interacts with the page,
// so we start both loops on the very first tap/click/keypress anywhere.
function unlockAudio() {
  bgMusic.play()
    .then(() => console.log('bg-music playing'))
    .catch(err => console.error('bg-music failed:', err));

  bgWind.play()
    .then(() => console.log('bg-wind playing'))
    .catch(err => console.error('bg-wind failed:', err));

  window.removeEventListener('pointerdown', unlockAudio);
  window.removeEventListener('keydown', unlockAudio);
}
window.addEventListener('pointerdown', unlockAudio);
window.addEventListener('keydown', unlockAudio);

// Extra diagnostics: tells you immediately if a file 404s or won't decode
bgMusic.addEventListener('error', () => console.error('bg-music failed to load — check the file path/name'));
bgWind.addEventListener('error',  () => console.error('bg-wind failed to load — check the file path/name'));

// ---------- Button sounds ----------
// One shared "selection" click, plus a unique sound per button, played together.
const SELECTION_VOLUME = 0.3;
const UNIQUE_VOLUME    = 0.28;

const uniqueSoundFiles = {
  profile:  'shared/assets/audio/profile-button.mp3',
  play:     'shared/assets/audio/play-button.mp3',
  credits:  'shared/assets/audio/credits-button.mp3',
  settings: 'shared/assets/audio/settings-button.mp3',
  quit:     'shared/assets/audio/quit-button.mp3',
};

function playSound(src, volume) {
  // cloneNode lets the same sound overlap itself if tapped rapidly,
  // instead of cutting off the previous play
  const audio = new Audio(src);
  audio.volume = volume;
  audio.play().catch(() => {});
}

function playButtonSound(action) {
  playSound('shared/assets/audio/selection-sound.mp3', SELECTION_VOLUME);
  const uniqueSrc = uniqueSoundFiles[action];
  if (uniqueSrc) playSound(uniqueSrc, UNIQUE_VOLUME);
}

// ---------- Button glow + hotspots ----------
document.querySelectorAll('.hotspot').forEach(btn => {
  const action = btn.dataset.action;
  const overlay = document.querySelector(`.btn-overlay[data-for="${action}"]`);

  const show = () => overlay.classList.add('active');
  const hide = () => overlay.classList.remove('active');

  // Glow appears the instant you press down or hover in
  btn.addEventListener('pointerenter', show);
  btn.addEventListener('pointerdown', () => {
    show();
    playButtonSound(action);
  });

  // Glow disappears the instant you release or drag off, no timer
  btn.addEventListener('pointerup', () => {
    hide();
    runAction(action);
  });
  btn.addEventListener('pointerleave', hide);
  btn.addEventListener('pointercancel', hide);
});

function runAction(action) {
  switch (action) {
    case 'play':
      window.location.href = 'games/memory-match/index.html';
      break;
    case 'profile':
      console.log('Profile screen not built yet');
      break;
    case 'credits':
      console.log('Credits screen not built yet');
      break;
    case 'settings':
      console.log('Settings screen not built yet');
      break;
    case 'quit':
      window.close();
      break;
  }
}
