SQUISHY DUMPLING ADVENTURE — NEXT.JS / REACT / TYPESCRIPT

Files:
- page.tsx
- board-data.ts
- squishy-dumpling-adventure.css

Install:
Copy all three files into:
app/games/squishy-dumpling-adventure/

Then visit:
/games/squishy-dumpling-adventure

The page uses the project's standard Next.js client component pattern. No new package is required for this local-play build.

Included:
- Three large custom CSS/SVG-style illustrated worlds
- Original dumpling character artwork drawn inline as SVG
- Board coordinates and special-space/event data adapted from the recovered Woodland Adventure source
- The secret left-hand tunnel branch and rejoin at the nap landmark
- Step-by-step dice movement, active-player tracking and camera/scroll following
- Movement effects, landmark jumps, missed turns, swaps, choose-a-player-back, Wisdom cards and challenges
- Local multiplayer and computer opponents
- Responsive layout and mobile board scrolling

Not yet included in this package:
- Firebase room creation/joining and real-time cross-device state synchronisation. The original Firebase project/config and room implementation were recovered, but the multiplayer layer still needs a deliberate port to this React state model. The online link in setup is intentionally labelled as pending rather than pretending it works.

No original Christmas JPEG board images are used. All world scenery and dumpling characters are drawn in code.
