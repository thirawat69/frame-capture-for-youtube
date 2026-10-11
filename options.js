const DEFAULTS = { width: 1440, copy: true, download: false, folder: 'YouTube Frames' };
const $ = (id) => document.getElementById(id);

chrome.storage.sync.get(DEFAULTS, (s) => {
  $('width').value = s.width;
  $('copy').checked = s.copy;
  $('download').checked = s.download;
  $('folder').value = s.folder;
});

function save() {
  chrome.storage.sync.set(
    {
      width: Math.max(0, parseInt($('width').value, 10) || 0),
      copy: $('copy').checked,
      download: $('download').checked,
      folder: $('folder').value.trim(),
    },
    () => {
      $('saved').style.visibility = 'visible';
      setTimeout(() => ($('saved').style.visibility = 'hidden'), 1000);
    },
  );
}

for (const id of ['width', 'copy', 'download', 'folder']) $(id).addEventListener('change', save);
