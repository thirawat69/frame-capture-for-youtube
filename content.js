const DEFAULTS = { width: 1440, copy: true, download: false, folder: 'YouTube Frames' };
let settings = { ...DEFAULTS };

chrome.storage.sync.get(DEFAULTS, (s) => (settings = s));
chrome.storage.onChanged.addListener((changes) => {
  for (const key in changes) settings[key] = changes[key].newValue;
});

function getVideo() {
  return document.querySelector('#movie_player video.html5-main-video') || document.querySelector('video');
}

function videoTitle() {
  const h1 = document.querySelector('ytd-watch-metadata h1');
  const raw = h1?.textContent || document.title.replace(/ - YouTube$/, '');
  // Characters Obsidian/filesystems reject in filenames
  const clean = raw.replace(/[:/\\|#^[\]?*"<>]/g, '').replace(/\s+/g, ' ').trim();
  return clean.slice(0, 120) || 'YouTube';
}

function timestamp(sec) {
  sec = Math.floor(sec);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(Math.floor(sec / 3600))}-${pad(Math.floor((sec % 3600) / 60))}-${pad(sec % 60)}`;
}

function toast(text) {
  const player = document.querySelector('#movie_player') || document.body;
  const el = document.createElement('div');
  el.className = 'yfc-toast';
  el.textContent = text;
  player.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

async function capture() {
  const video = getVideo();
  if (!video || !video.videoWidth) return toast('No video found');

  // Draw the decoded frame itself — subtitles and controls are DOM overlays, so they never end up here.
  // Only scale down; upscaling a 720p source just makes it blurry.
  const scale = settings.width > 0 ? Math.min(1, settings.width / video.videoWidth) : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  let blob;
  try {
    blob = await new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('empty'))), 'image/png'),
    );
  } catch {
    return toast("Can't capture this video (it may be DRM-protected)");
  }

  const done = [];
  if (settings.copy) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      done.push('copied');
    } catch {
      done.push('copy failed');
    }
  }
  if (settings.download) {
    const name = `${videoTitle()} — ${timestamp(video.currentTime)}.png`;
    const folder = settings.folder.replace(/^\/+|\/+$/g, '');
    chrome.runtime.sendMessage({
      type: 'download',
      dataUrl: await blobToDataUrl(blob),
      filename: folder ? `${folder}/${name}` : name,
    });
    done.push('saved');
  }
  toast(`📸 ${canvas.width}×${canvas.height} · ${done.join(' · ') || 'nothing to do — turn on copy or save in the popup'}`);
}

function cameraIcon(compact) {
  // Built with createElementNS because YouTube enforces Trusted Types, which blocks innerHTML
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  if (compact) {
    // Newer player: 24px icons, YouTube's own CSS pads and centres them in the button
    svg.setAttribute('viewBox', '6 6 24 24');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
  } else {
    svg.setAttribute('viewBox', '0 0 36 36');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
  }
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('fill', '#fff');
  path.setAttribute(
    'd',
    'M14.5 10l-1.8 2.5H10a2 2 0 0 0-2 2V24a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-9.5a2 2 0 0 0-2-2h-2.7L21.5 10h-7zM18 15a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
  );
  svg.appendChild(path);
  return svg;
}

function addButton() {
  const bar = document.querySelector('#movie_player .ytp-right-controls');
  if (!bar || bar.querySelector('.yfc-btn')) return;
  // Newer player groups the right-side buttons into pills; join the left pill so the button sits inside it
  const group = bar.querySelector('.ytp-right-controls-left');
  const btn = document.createElement('button');
  btn.className = group ? 'ytp-button yfc-btn' : 'ytp-button yfc-btn yfc-legacy';
  btn.title = 'Capture frame (Alt+Shift+S)';
  btn.setAttribute('aria-label', 'Capture frame');
  btn.appendChild(cameraIcon(!!group));
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    capture();
  });
  (group || bar).prepend(btn);
}

document.addEventListener('yt-navigate-finish', addButton);
setInterval(addButton, 1500);

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'capture') capture();
});
