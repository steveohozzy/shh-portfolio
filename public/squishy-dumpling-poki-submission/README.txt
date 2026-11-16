SQUISHY DUMPLING BOARD GAME — POKI SUBMISSION BUILD

CONTENTS
- index.html: standalone game entry point
- assets/: all three original board images, bundled locally

GAMEPLAY RETAINED
- Original game interface, boards, characters, dice, sound and animations
- All three board stages and their board-space effects
- Local multiplayer (2–6 players on one device)
- Play Against the Computer
- Questions, special spaces, player selection and winner/replay flow

REMOVED FOR THIS SUBMISSION
- Firebase online multiplayer, room creation/joining and PINs
- External invitations and social sharing controls
- Website-specific metadata and links
- External Google Fonts dependency
- Website PWA/service-worker registration

POKI SDK
- The official Poki SDK script is included in the page head.
- gameLoadingFinished is called after SDK initialisation (or SDK failure).
- gameplayStart is called when a game begins.
- gameplayStop is called when the game ends or is restarted.
- commercialBreak is requested on Play Again before the game reloads.

SUBMISSION CHECKLIST
1. Upload the ZIP as an HTML5/web game through Poki's submission page.
2. Ensure index.html is at the ZIP root (it is in this package).
3. Run Poki Inspector when the submission flow makes it available.
4. Test desktop, mobile and tablet layouts, touch/mouse controls, sound,
   all three stages, local multiplayer, computer opponent and replay.
5. Confirm the exact uploaded build works when hosted by Poki.

NOTES
- The game has no Firebase or other game-server dependency in this build.
- The only external script is the official Poki SDK. The game can still start
  if SDK initialisation fails, but Poki SDK integration should be tested on
  Poki hosting before approval.
- This package is prepared for submission; only Poki can confirm acceptance.
