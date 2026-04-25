Continue the existing `Last Man Standing` product design. Do not redesign from scratch. Extend the same UI system that already exists in the
  previous screens:
  - landing hero
  - lobby / room list
  - create room modal
  - arena screen

  This is the same product, same brand, same component language, same top nav, same spacing logic, same dark premium Monad aesthetic.

  Project:
  - Last Man Standing
  - On-chain survival arena game on Monad
  - Real-time eliminations every 10–15 seconds
  - Players join rooms, one player survives, winner takes the pool
  - Spectators can watch live
  - There is a shield mechanic
  - There will also be a mockUSDC faucet page for tomorrow’s demo flow

  Style rules:
  - preserve the exact existing design direction
  - dark background
  - Monad purple accent `#6e56f9`
  - subtle glow, thin borders, premium glassy cards
  - supporting colors:
    - cyan / teal for alive / active
    - red for danger / elimination
    - amber / gold for prize / value
    - muted slate for passive info
  - typography should stay consistent with existing screens
  - do not introduce a new visual style
  - this should feel like the next screens/features of the same app

  Use the product flow from the brief:
  - players connect wallet
  - join a room
  - wait for lobby threshold or timer
  - eliminations happen every few seconds
  - one player wins
  - shields can block one elimination
  - spectators follow the game live
  - UX should feel dramatic, readable, and demo-friendly

  I want you to design 3 things:

  1. How It Works Modal
  Design a modal popup opened from the existing `How It Works` action in the top nav / landing flow.

  Goal:
  - explain the game clearly in a compact, polished, premium way
  - should feel like part of the same product
  - not a boring docs modal
  - should be very easy to scan quickly during a demo

  Modal content structure:
  - title: `How It Works`
  - short intro:
    - Last Man Standing is a real-time on-chain survival arena on Monad
  - step-by-step explanation:
    1. Join a room
    2. Wait for the countdown or minimum players
    3. Eliminations happen every 10–15 seconds
    4. Shields can block one elimination
    5. Last player standing wins the prize pool
  - also mention spectator mode:
    - you can watch the game live even if you are not playing
  - also mention that randomness is transparent / verifiable
  - optional small section:
    - `Why Monad`
    - fast enough for real-time on-chain game loops

  Visual direction:
  - use cards or timeline blocks, not long paragraphs
  - each step should have a strong number / icon / label
  - compact helper chips are okay
  - include close button
  - support desktop-first layout but keep it responsive
  - keep the backdrop blurred/dimmed like the Create Room modal

  2. Faucet Page for mockUSDC
  Design a dedicated page for claiming / minting demo `mockUSDC` for tomorrow’s flow.

  Context:
  - this is for demo/test usage
  - mockUSDC will be used inside the product flow tomorrow
  - this page should feel native to the same app, not a separate tool

  Goal:
  - simple, clear, and trustworthy
  - tells users they can claim mockUSDC for test/demo participation
  - should feel like an intentional part of the Monad game experience

  Page structure:
  A. same top nav as the existing app
  - branding
  - Monad Testnet badge
  - nav consistency
  - Connect Wallet button

  B. page header
  - title: `mockUSDC Faucet`
  - short explanation:
    - claim demo funds for testnet gameplay
    - use mockUSDC to join rooms / test tomorrow’s experience
  - include a note that this is not real money

  C. wallet status section
  - connected wallet address
  - network badge
  - faucet availability / readiness
  - optional small status text:
    - `Ready to claim`
    - `Daily limit available`
    - or `Already claimed today`

  D. claim card
  - main card with:
    - available amount to claim
    - token badge `mockUSDC`
    - one main CTA:
      - `Claim mockUSDC`
  - after claim, there should be room for a success state:
    - `mockUSDC sent`
    - show tx hash placeholder
    - show updated balance placeholder

  E. usage guidance
  - a small section that explains:
    - use mockUSDC to join rooms
    - claim before the demo starts
    - if wallet/network is wrong, switch to Monad Testnet
  - optionally add a link/button:
    - `Back to Lobby`

  Design notes:
  - this page should feel more utility-oriented than the arena, but still premium
  - use the same color system and card system
  - avoid making it look like a generic DeFi faucet site
  - keep the experience short and focused

  3. Spectate View
  Design a dedicated spectate mode / spectate screen for a live arena.

  Context:
  - spectators are an important part of the product
  - the brief highlights social viewing, live reactions, and prediction-market potential
  - this view should feel optimized for watching, not for active player control

  Goal:
  - let non-players follow the arena clearly
  - make the match easy and exciting to watch
  - should share layout DNA with the existing arena screen, but adapted for spectators

  Spectate screen structure:
  A. top nav
  - same existing nav
  - visual continuity with the rest of the product

  B. page header
  - room number
  - status badge like `Live`
  - round number
  - alive count
  - eliminated count
  - prize pool
  - countdown to next elimination

  C. main arena board
  - keep the player grid visible
  - highlight who is still alive
  - clearly dim eliminated players
  - if possible show who just got eliminated recently
  - spectators do not need player-only controls
  - current user highlight should be absent in pure spectator mode

  D. spectator-focused side panel
  Replace player-centric emphasis with watch-centric UI:
  - live feed
  - recent eliminations
  - shield events
  - round transitions
  - optional “who is favored” / “watch focus” blocks
  - optional small “prediction coming soon” placeholder card if useful

  E. spectator engagement layer
  Please include tasteful spectator-oriented modules such as:
  - `Live Feed`
  - `Most Watched Player`
  - `Last Shield Used`
  - `Prediction Market Coming Soon`
  These can be mock UI blocks, but they should feel plausible and product-like

  F. state variation
  Design at least 2 visual states:
  1. standard spectate mode
     - match in progress
     - no urgent warning
  2. high-tension mode
     - elimination incoming
     - red urgency
     - countdown almost done
     - stronger focus on live feed and the next cut

  Important:
  - spectate screen must feel like the same product as the arena screen
  - not a different dashboard
  - same structure, but tuned for observers
  - emphasize clarity, drama, and readability

  Output I want:
  1. `How It Works` modal
  2. `mockUSDC Faucet` page
  3. `Spectate` screen
  4. all three should clearly continue the existing Last Man Standing design system, not restart it