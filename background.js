chrome.commands.onCommand.addListener((command, tab) => {
  if (command !== 'capture-frame' || !tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { type: 'capture' }).catch(() => {});
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== 'download') return;
  chrome.downloads.download({
    url: msg.dataUrl,
    filename: msg.filename,
    conflictAction: 'uniquify',
    saveAs: false,
  });
});
