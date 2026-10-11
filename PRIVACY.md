# Privacy Policy

**Frame Capture for YouTube** · Effective October 11, 2026

Frame Capture for YouTube does not collect, store, transmit, sell, or share any personal data.

## What the extension does with data

- **Captured frames** are created locally in your browser from the video you are watching. They go only where you choose: your clipboard, a PNG file in your Downloads folder, or both. They are never uploaded anywhere.
- **Settings** (max width, copy/save toggles, Downloads subfolder name) are saved with Chrome's `storage.sync` API. If you have Chrome Sync turned on, Chrome syncs them across your own signed-in browsers. The developer cannot see them.
- **Video titles and timestamps** are read from the YouTube page only to name saved files. They are not stored or sent anywhere.

## What the extension does not do

- No analytics, tracking, cookies, or advertising
- No network requests to the developer or any third party
- No access to your YouTube account, watch history, or any website other than `youtube.com`
- No remote code — every script ships inside the extension package

## Permissions

| Permission | Why |
| --- | --- |
| `storage` | Save your capture settings |
| `downloads` | Save captured frames as PNG files when you turn that option on |
| `clipboardWrite` | Copy captured frames to your clipboard |
| `youtube.com` access | Read the video element to draw the current frame and add the capture button to the player |

## Changes

Any change to this policy will be published in this file, and the effective date above will be updated. The full history is available in this repository's commit log.

## Contact

Questions or concerns: [open an issue](https://github.com/thirawat69/frame-capture-for-youtube/issues).
