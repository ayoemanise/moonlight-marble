# moonlight-marble

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/ayoemanise/moonlight-marble/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/ayoemanise/moonlight-marble/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

Moonlight & Marble — a top-down noir museum heist for the desktop browser,
drawn in canvas with no engine and no network. You are the Magpie: slip
through three rooms of the Marlowe Museum, read the wardens' sweeping vision
cones, stay inside the dark patches, blind the cameras with an EMP tick,
throw clatter decoys where the mouse points, crawl the vents, pick the
locked doors, lift the Celestial Sapphire from its pedestal and reach the
getaway before the alarm dial hits lockdown.

- Keyboard and mouse: WASD/arrows move, SHIFT sneak, Q decoy (aim with the
  mouse), E EMP the nearest camera, S smoke bomb, F picks a lock, CLICK
  grabs the loot, crawls vents and escapes.
- Three handcrafted rooms: The West Gallery, The Vault Wing, The Rotunda
  Night — wardens on patrol beats, cameras on brass posts, a live alarm
  meter, and tools that cost their limited belt slots.
- All sound is synthesized in WebAudio; all art is drawn in code.

## Run it

```sh
node serve.ts   # serves game/ and opens http://localhost:8080
```

or serve `game/` with any static file server — the game is plain static
files (index.html plus ES modules), plays offline, and hands itself in with
`node main.ts`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=v4tk2e29&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>
