# Last Nads Standing

  **Last Nads Standing is an onchain battle royale on Monad where players enter
  the same room, survive repeated elimination rounds, and the last wallet alive
  wins the prize pool.**

  It takes the tension of survival games and turns it into a game loop that is
  easy to understand, fun to spectate, and transparent onchain. One room. One
  prize pool. One survivor.

  ## Overview

  Most onchain games are either too complex to explain quickly or too slow to
  feel exciting. We wanted something that a judge, player, or spectator could
  understand in seconds:

  - players join a room with an entry fee
  - the game runs through repeated elimination rounds
  - spectators follow the action live
  - the final survivor takes the reward

  This makes Last Nads Standing closer to a battle royale showpiece than a
  passive blockchain app.

  ## What We Built

  - A room-based onchain survival game
  - Smart contracts for room creation, joining, rounds, winner selection, and
  prize claiming
  - Automatic elimination rounds triggered by a keeper flow
  - Realtime backend updates for room state, game state, and event relays
  - A spectator prediction layer where viewers can bet on the winner
  - A demo faucet flow for testnet onboarding

  ## Inspiration

  Last Nads Standing is inspired by:

  - **Squid Game** for its survival tension, spectator drama, and escalating
  stakes
  - **Free Fire / PUBG** for the battle royale structure where many enter and
  only one survives

  This is not an official adaptation of any of those titles. The inspiration is
  in the emotional loop and competitive format: short, tense rounds with rising
  pressure and a clear last-player-standing objective.

  ## Why It Is Compelling

  - **Instantly understandable**: the core loop can be explained in under 20
  seconds
  - **Fun to watch**: every round creates suspense, not just the ending
  - **Transparent by design**: room state, eliminations, and winner logic live
  onchain
  - **Strong demo energy**: it works well for hackathon judging, streams, and
  live walkthroughs
  - **Repeatable matches**: short rounds make it easy to replay, spectate, and
  experiment with room setups

  ## Why Monad

  This project is a much better fit on Monad than on a slower chain because the
  game depends on cadence, responsiveness, and repeated state changes.

  - **Ethereum compatibility** lets us build with familiar tooling like
  Solidity, Foundry, Wagmi, and viem
  - **High throughput** helps room creation, joins, and match flow feel smooth
  instead of congested
  - **400ms block time** makes rapid room and round updates feel closer to a
  live multiplayer loop
  - **800ms finality** improves the feel of decisive moments like game start,
  round execution, and, Monad matters because we are not just storing final
  outcomes onchain. We are running a repeated elimination loop with rounds, live
  state changes, and spectator attention around every phase of the match Works

  . A player creates a room through the factory.
  2. Other players join the room and build the prize pool the platform fee is
  settled, and spectator predictions can be resolved.

  ## Architecture

  - `apps/web`
    Next.js frontend for the landing page, monitoring, state and room is
  resolved.
  - `MockUSDC`
    Testnet faucet token with cooldown support for easier
  demoA5b3DEAbA03D8B9c4004669432079FDCEBFF9`
  - `PredictionPool`: `0x19A13d6197af07d1Acd12e04bA6A246823c45aBF124127`

  ## Repo Structure

  ```text
  .
  ├── apps/
  │      └ already represents and use prototype or mock state
  - This is a hackathon-stage build, not a production-hardened
  releasepnPLORER_URL=https://testnet.monadexplorer.com

  The ops app may also require its own .env values for keeper behavior and
  backend runtime when running the realtime flow locally.

  ## Improvements

  - Fully connect the frontend to live contract state across all views
  - Expand spectator gameplay and prediction interactions dan tajam untuk juri`
  - lebih formal/profesional
  - lebih hype untuk hackathon submission

  ## Deployment

  **Contract addresses (chainId: 10143)**

  Berikut hanya alamat kontrak (satu per baris):

  ```
  0xDA116a9C27Ac644bC52180e76a7f8387F6054433
  0x6AE008d846A82CE49011b9850975257e37759c5b
  0xb11537815438AffDbD2419955806eC8A9f9F907f
  0x65DB8a243Fa7E2768bB933c94C0b09C3Cc538FF2
  0x2916C916c771Ff6bDC992830Ccf937Ec88822Be7
  0x090cD890fFf732d913E9f277137a50F3822efB15
  0x82E0fA3e38e25aDA8689a4beC833A93b5A99A15E
  ```

  **Front-end (demo / live)**: https://last-nads-standing-web.vercel.app/

  Keterangan: front-end demo tersedia di URL di atas — gunakan untuk melihat
  UI, daftar room, dan alur bermain. Pastikan wallet dan RPC diarahkan ke jaringan
  yang sesuai (chainId `10143`) ketika mencoba interaksi onchain.
