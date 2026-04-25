Continue the existing design system that was already created earlier for `Last Man Standing`. Do not redesign from scratch. This is a continuation of the same product, same visual language, same layout DNA, same colors, and same component system.

Project:
- Last Man Standing
- On-chain survival arena game on Monad
- Dark premium game UI
- Monad purple accent
- Existing style already established in previous screens:
  - landing hero
  - lobby / room listing
- Keep the same visual identity and extend it naturally

Design references:
- Keep matching the existing screens that were already generated before
- The design should feel consistent with the previously created UI:
  - dark navy / black background
  - subtle purple glow
  - glassy cards
  - neon but controlled
  - arcade / spectator-esports feel
- Accent color: Monad purple `#6e56f9`
- Supporting colors:
  - bright cyan / teal for alive players
  - red for elimination danger
  - amber / gold for prize pool
  - muted slate for inactive states

Product flow context from the project brief:
- Players join a room by paying a small entry fee
- A room starts once the minimum players threshold is reached or lobby timer ends
- Every 10–15 seconds, a round triggers and a percentage of players are randomly eliminated
- One player remains and wins the prize pool
- Spectators can watch the match in real time
- There is a shield mechanic:
  - each player has 1 shield per game
  - shield can block one elimination
  - shield usage should appear clearly in the UI
- The experience should feel real-time, dramatic, and spectator-friendly

I want you to design TWO things that fit seamlessly into the existing UI:

1. Create Room Modal
Design a polished modal popup for `Create Room` / `Deploy New Arena`, matching the previously generated lobby style.

Modal goals:
- feels premium and production-ready
- sits above the existing lobby background
- dark glass card with soft purple glow
- clear hierarchy
- compact, not oversized
- should feel like configuring a live on-chain arena

Modal content:
- title: `Deploy New Arena`
- short helper text:
  - configure your survival room
  - smart contract deploys instantly on Monad
- controls:
  - Entry Fee
  - Min Players
  - Max Players
  - Elimination %
  - Round Interval
- use modern slider controls with visible current numeric values
- include a derived summary card:
  - `Estimated Prize Pool`
  - show a highlighted MON amount
- primary CTA:
  - `Deploy Room`
- include close button at top-right
- optional subtle helper labels:
  - `Monad Testnet`
  - `Instant deploy`
  - `Gas-light setup`
- the modal must look like part of the same product, not like a generic admin form

Important UX notes for the modal:
- sliders should feel tactile and game-like, not enterprise dashboard-like
- make it obvious that room config affects pace and tension
- prize pool summary should stand out visually
- spacing should be elegant and readable
- keep the background dimmed, but still let the lobby show through underneath

2. Arena Screen
Design the live room / arena screen for a single active room.
This is the screen after a player enters a room or a spectator opens a live match.

Arena goals:
- real-time, dramatic, very readable
- should feel like watching a live elimination game
- must support both player and spectator understanding
- must continue the same style from the landing + lobby
- not a new visual language

  Layout structure:
  A. Top navigation
  - reuse the same existing nav style from the current product
  - branding on left
  - Monad Testnet badge
  - Live Rooms count
  - Online count
  - nav actions like `How It Works`, `Spectate`, `Create Room`, `Connect Wallet`

  B. Back navigation
  - `Back to Lobby`

  C. Match summary strip / header cards
  Show at least:
  - Room number
  - Round
  - Alive
  - Eliminated
  - Prize Pool
  - Countdown / timer circle
  Use a horizontal metrics strip with cards consistent with the room-listing style

  D. Critical alert state
  Include a state for:
  - `Elimination Incoming`
  Use a strong red alert banner when countdown is near zero

  E. Main player arena grid
  This is the core of the screen.
  Design a large grid showing players still in the match.

  Player card behavior:
  - alive players:
    - bright cyan / green glow
    - active presence
  - eliminated players:
    - dimmed / ghosted / marked with X
    - still visible so spectators can follow the round history
  - current user:
    - highlighted with purple border / badge `YOU`
  - shield state:
    - some players show a shield icon
    - shield use should be visible and readable
  - each player tile should include:
    - compact wallet short address
    - stylized player token / icon / avatar mark
    - subtle state indicator
  - the arena should feel like a live tournament board, not a plain table

  F. Live feed panel on the right
  A vertical feed showing dramatic real-time events:
  - round starting
  - player eliminated
  - shield blocked elimination
  - countdown milestone
  Use different card colors per event type:
  - red for elimination
  - blue/cyan for shield block
  - amber for round start
  - make it very scan-friendly

  G. Arena state variations
  Please include at least 2 visual states of the arena:
  1. normal active round state
     - countdown ongoing
     - alive players visible
     - live feed updating
  2. elimination imminent state
     - timer low
     - red warning banner
     - tension increased
     - visual emphasis on incoming elimination moment

  Design principles:
  - preserve the existing design system
  - do not change the app’s brand direction
  - keep the same nav/button/card language
  - use the same purple-led palette
  - maintain visual coherence with the previous lobby/hero UI
  - make the arena more intense than the lobby, but still related
  - avoid clutter
  - prioritize visual hierarchy and spectator readability

  Tone:
  - esports + crypto game
  - high-stakes, but polished
  - dramatic, not childish
  - clean enough for a hackathon demo, but believable as a real product

  What I want as output:
  1. a polished `Create Room` modal
  2. a polished live `Arena` screen
  3. an alternate arena state for imminent elimination
  4. all designs should clearly look like they belong to the same existing product, not a redesign