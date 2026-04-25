import React, {useMemo} from "react";
import type {CSSProperties, ReactNode} from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FP = 30;
const TOTAL_FRAMES = 30 * FP;

const SCENES = {
  hook: [0, 90],
  lobby: [90, 240],
  join: [240, 360],
  gameplay: [360, 600],
  spectator: [600, 750],
  ending: [750, 900],
} as const;

const colors = {
  bg: "#05050b",
  panel: "rgba(14, 16, 30, 0.72)",
  panel2: "rgba(20, 23, 42, 0.74)",
  border: "rgba(151, 121, 255, 0.25)",
  purple: "#8f5dff",
  blue: "#3bd6ff",
  cyan: "#28f3ce",
  pink: "#ff4fd8",
  red: "#ff3d6e",
  gold: "#ffd166",
  green: "#42ff9f",
};

const fontDisplay = "Bahnschrift, Orbitron, Segoe UI, Arial, sans-serif";
const fontMono = "Cascadia Mono, JetBrains Mono, Consolas, monospace";
const fontBody = "Segoe UI, Space Grotesk, Arial, sans-serif";

type SceneName = keyof typeof SCENES;

type Room = {
  id: string;
  stake: string;
  players: string;
  pace: string;
  status: string;
  glow: string;
};

type Player = {
  wallet: string;
  seed: number;
};

const rooms: Room[] = [
  {id: "ROOM #042", stake: "25 USDC", players: "24/32", pace: "BLITZ", status: "WAITING", glow: colors.cyan},
  {id: "ROOM #057", stake: "100 USDC", players: "31/32", pace: "TURBO", status: "FILLING", glow: colors.purple},
  {id: "ROOM #064", stake: "250 USDC", players: "16/16", pace: "LIVE", status: "ROUND 03", glow: colors.red},
  {id: "ROOM #071", stake: "50 USDC", players: "09/20", pace: "STANDARD", status: "OPEN", glow: colors.blue},
];

const players: Player[] = [
  {wallet: "0x4A9f...B71C", seed: 1},
  {wallet: "0x81DD...3A90", seed: 2},
  {wallet: "0x22F0...D418", seed: 3},
  {wallet: "0xF90A...88E2", seed: 4},
  {wallet: "0x6E44...10FA", seed: 5},
  {wallet: "0xC731...F77D", seed: 6},
  {wallet: "0x0C4B...92AA", seed: 7},
  {wallet: "0x9F11...41D0", seed: 8},
  {wallet: "0x7B18...AC44", seed: 9},
  {wallet: "0x580E...C313", seed: 10},
  {wallet: "0x2BC2...700D", seed: 11},
  {wallet: "0xAA64...E510", seed: 12},
  {wallet: "0x3E91...7F90", seed: 13},
  {wallet: "0xB040...D62A", seed: 14},
  {wallet: "0x109B...5BE0", seed: 15},
  {wallet: "0xDE8A...9099", seed: 16},
];

const beatFrames = 12;

export const LastNadsStandingPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const audioSrc = useMemo(() => createEnergeticBeatDataUri(30), []);
  const beat = pulse(frame, beatFrames, 0.72);
  const cameraScale = 1 + beat * 0.012 + interpolate(frame, [0, TOTAL_FRAMES], [0.012, -0.006]);
  const driftX = Math.sin(frame / 54) * 18;
  const driftY = Math.cos(frame / 67) * 12;

  return (
    <AbsoluteFill style={styles.root}>
      <Audio src={audioSrc} volume={0.42} />
      <NeonBackground frame={frame} />
      <div
        style={{
          ...styles.camera,
          transform: `translate3d(${driftX}px, ${driftY}px, 0) scale(${cameraScale})`,
        }}
      >
        <HookScene frame={frame} fps={fps} />
        <LobbyScene frame={frame} />
        <JoinScene frame={frame} />
        <GameplayScene frame={frame} />
        <SpectatorScene frame={frame} />
        <EndingScene frame={frame} />
      </div>
      <BeatHud frame={frame} />
      <CutFlashes frame={frame} />
      <Vignette />
      <GlobalStyles />
    </AbsoluteFill>
  );
};

const HookScene: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const start = SCENES.hook[0];
  const end = SCENES.hook[1];
  const p = sceneProgress(frame, start, end);
  const enter = spring({frame: frame - start, fps, config: {damping: 15, mass: 0.7, stiffness: 110}});
  const exit = interpolate(frame, [end - 18, end], [1, 0], clamp);
  const glitch = Math.sin(frame * 1.9) > 0.36 ? 1 : 0;

  return (
    <SceneLayer active={isInScene(frame, "hook")} opacity={exit}>
      <div style={{...styles.centerStack, transform: `scale(${0.86 + enter * 0.14})`}}>
        <LogoMark frame={frame} size={148} />
        <div style={styles.kicker}>MONAD TESTNET // SURVIVAL PROTOCOL</div>
        <div style={styles.titleWrap}>
          <GlitchText glitch={glitch} size={112} text="Last Nads Standing" />
        </div>
        <div
          style={{
            ...styles.subtitle,
            opacity: interpolate(p, [0.2, 0.42], [0, 1], clamp),
            transform: `translateY(${interpolate(p, [0.2, 0.42], [22, 0], clamp)}px)`,
          }}
        >
          Onchain Battle Royale on Monad.
        </div>
        <div style={styles.hookBars}>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              style={{
                ...styles.hookBar,
                background: index % 2 === 0 ? colors.purple : colors.blue,
                transform: `scaleX(${interpolate(p, [0.3 + index * 0.06, 0.62], [0, 1], clamp)})`,
                boxShadow: `0 0 24px ${index % 2 === 0 ? colors.purple : colors.blue}`,
              }}
            />
          ))}
        </div>
      </div>
      <div
        style={{
          ...styles.bootText,
          opacity: interpolate(p, [0.08, 0.24, 0.85, 1], [0, 1, 1, 0], clamp),
        }}
      >
        BLOCK CONFIRMED / STAKE LOCKED / LAST WALLET WINS
      </div>
    </SceneLayer>
  );
};

const LobbyScene: React.FC<{frame: number}> = ({frame}) => {
  const [start, end] = SCENES.lobby;
  const p = sceneProgress(frame, start, end);
  const exit = interpolate(frame, [end - 20, end], [1, 0], clamp);
  const panelIn = interpolate(p, [0.02, 0.22], [70, 0], clamp);

  return (
    <SceneLayer active={isInScene(frame, "lobby")} opacity={exit}>
      <SceneHeader
        eyebrow="// LOBBY"
        frame={frame}
        sceneStart={start}
        title="Find the next arena."
        value="Rooms updating live"
      />
      <div
        style={{
          ...styles.dashboard,
          opacity: interpolate(p, [0.04, 0.2], [0, 1], clamp),
          transform: `translateY(${panelIn}px) rotateX(${interpolate(p, [0, 0.25], [9, 0], clamp)}deg)`,
        }}
      >
        <div style={styles.leftRail}>
          {["LIVE", "OPEN", "HIGH STAKE", "BLITZ"].map((item, index) => (
            <div
              key={item}
              style={{
                ...styles.railPill,
                borderColor: index === 1 ? "rgba(59,214,255,0.55)" : "rgba(255,255,255,0.08)",
                color: index === 1 ? colors.blue : "rgba(255,255,255,0.48)",
                boxShadow: index === 1 ? "0 0 24px rgba(59,214,255,0.16)" : "none",
              }}
            >
              {item}
            </div>
          ))}
        </div>
        <div style={styles.roomList}>
          {rooms.map((room, index) => {
            const rowIn = interpolate(p, [0.1 + index * 0.05, 0.34 + index * 0.05], [52, 0], clamp);
            const featured = index === 1;
            return (
              <div
                key={room.id}
                style={{
                  ...styles.roomRow,
                  borderColor: featured ? "rgba(143,93,255,0.72)" : "rgba(255,255,255,0.08)",
                  opacity: interpolate(p, [0.08 + index * 0.04, 0.3 + index * 0.04], [0, 1], clamp),
                  transform: `translateX(${rowIn}px)`,
                  boxShadow: featured ? "0 0 48px rgba(143,93,255,0.18)" : "none",
                }}
              >
                <div style={styles.roomStatusDot(room.glow)} />
                <div style={styles.roomId}>{room.id}</div>
                <Metric label="STAKE" value={room.stake} />
                <Metric label="PLAYERS" value={room.players} />
                <Metric label="PACE" value={room.pace} />
                <div
                  style={{
                    ...styles.statusBadge,
                    color: room.glow,
                    borderColor: hexToRgba(room.glow, 0.42),
                    background: hexToRgba(room.glow, 0.08),
                  }}
                >
                  {room.status}
                </div>
              </div>
            );
          })}
        </div>
        <div style={styles.createPanel}>
          <div style={styles.createButtonAura(frame)}>
            <div style={styles.createButton}>CREATE ROOM</div>
          </div>
          <div style={styles.paramsGrid}>
            <ParamChip label="USDC STAKE" value="100" />
            <ParamChip label="PLAYERS" value="32" />
            <ParamChip label="PACE" value="TURBO" />
          </div>
          <div style={styles.sliderTrack}>
            <div
              style={{
                ...styles.sliderFill,
                width: `${interpolate(p, [0.42, 0.74], [18, 82], clamp)}%`,
              }}
            />
          </div>
          <div style={styles.panelCaption}>Non-custodial escrow. Winner claims the pool.</div>
        </div>
      </div>
    </SceneLayer>
  );
};

const JoinScene: React.FC<{frame: number}> = ({frame}) => {
  const [start, end] = SCENES.join;
  const p = sceneProgress(frame, start, end);
  const exit = interpolate(frame, [end - 16, end], [1, 0], clamp);
  const walletConnected = p > 0.18;
  const stakeProgress = interpolate(p, [0.28, 0.64], [0, 1], clamp);
  const roomFill = Math.floor(interpolate(p, [0.2, 0.94], [7, 16], clamp));

  return (
    <SceneLayer active={isInScene(frame, "join")} opacity={exit}>
      <SceneHeader
        eyebrow="// JOIN PHASE"
        frame={frame}
        sceneStart={start}
        title="Connect. Stake. Drop in."
        value="Room #057"
      />
      <div style={styles.joinLayout}>
        <div
          style={{
            ...styles.walletPanel,
            transform: `translateX(${interpolate(p, [0.02, 0.22], [-110, 0], clamp)}px)`,
            opacity: interpolate(p, [0.02, 0.2], [0, 1], clamp),
          }}
        >
          <div style={styles.panelLabel}>WALLET</div>
          <div style={styles.walletCard}>
            <div style={styles.walletIcon(frame)} />
            <div>
              <div style={styles.walletAddress}>0x81DD...3A90</div>
              <div style={styles.walletSub}>{walletConnected ? "Connected to Monad" : "Awaiting signature"}</div>
            </div>
            <div
              style={{
                ...styles.connectedBadge,
                opacity: walletConnected ? 1 : 0.25,
                color: walletConnected ? colors.green : "rgba(255,255,255,0.35)",
              }}
            >
              {walletConnected ? "CONNECTED" : "PENDING"}
            </div>
          </div>
          <div style={styles.transactionBox}>
            <FlowLine frame={frame} offset={0} />
            <div style={styles.txLabel}>USDC stake approval</div>
            <div style={styles.txAmount}>100.00 USDC</div>
            <div style={styles.txBar}>
              <div style={{...styles.txFill, width: `${stakeProgress * 100}%`}} />
            </div>
          </div>
        </div>
        <div style={styles.joinCenter}>
          <TokenStream frame={frame} progress={stakeProgress} />
          <div style={styles.chainNode("left", p)}>USDC</div>
          <div style={styles.chainNode("right", p)}>ROOM</div>
          <div style={styles.chainConnector}>
            <div style={{...styles.chainConnectorFill, transform: `scaleX(${stakeProgress})`}} />
          </div>
        </div>
        <div
          style={{
            ...styles.roomPanel,
            transform: `translateX(${interpolate(p, [0.06, 0.28], [110, 0], clamp)}px)`,
            opacity: interpolate(p, [0.06, 0.24], [0, 1], clamp),
          }}
        >
          <div style={styles.panelLabel}>PLAYERS ENTERING</div>
          <div style={styles.slotGrid}>
            {players.map((player, index) => {
              const active = index < roomFill;
              return (
                <div
                  key={player.wallet}
                  style={{
                    ...styles.playerSlot,
                    opacity: active ? 1 : 0.24,
                    transform: `scale(${active ? 1 : 0.84})`,
                    borderColor: active ? hexToRgba(index % 3 === 0 ? colors.cyan : colors.purple, 0.44) : "rgba(255,255,255,0.08)",
                  }}
                >
                  <Avatar seed={player.seed} size={38} />
                  <span>{active ? player.wallet.slice(0, 6) : "OPEN"}</span>
                </div>
              );
            })}
          </div>
          <div style={styles.roomCount}>{roomFill}/16 LOCKED</div>
        </div>
      </div>
    </SceneLayer>
  );
};

const GameplayScene: React.FC<{frame: number}> = ({frame}) => {
  const [start, end] = SCENES.gameplay;
  const p = sceneProgress(frame, start, end);
  const exit = interpolate(frame, [end - 20, end], [1, 0], clamp);
  const local = frame - start;
  const round = Math.min(7, Math.floor(interpolate(p, [0.03, 0.95], [1, 7], clamp)));
  const aliveCount = Math.max(3, 16 - Math.floor(interpolate(p, [0.08, 0.92], [0, 13], clamp)));
  const eliminationPulse = pulse(local, 42, 0.5);

  return (
    <SceneLayer active={isInScene(frame, "gameplay")} opacity={exit}>
      <SceneHeader
        eyebrow="// GAMEPLAY"
        frame={frame}
        sceneStart={start}
        title="Every round removes wallets."
        value={`Round 0${round}`}
      />
      <div style={styles.gameplayWrap}>
        <div style={styles.arenaPanel}>
          <div style={styles.arenaTopBar}>
            <div style={styles.livePill}>LIVE</div>
            <div style={styles.roundTicker}>
              {Array.from({length: 7}).map((_, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.roundDot,
                    background: index < round ? colors.red : "rgba(255,255,255,0.1)",
                    boxShadow: index < round ? "0 0 18px rgba(255,61,110,0.7)" : "none",
                  }}
                />
              ))}
            </div>
            <div style={styles.poolMini}>POOL 1,600 USDC</div>
          </div>
          <div
            style={{
              ...styles.arenaGrid,
              transform: `perspective(1100px) rotateX(${10 + Math.sin(frame / 40) * 2}deg) rotateZ(${Math.sin(frame / 90) * 1.4}deg)`,
            }}
          >
            {players.map((player, index) => {
              const alive = index < aliveCount || index === 7;
              const danger = index === aliveCount && eliminationPulse > 0.25;
              const eliminatedAt = index >= aliveCount;
              return (
                <div
                  key={player.wallet}
                  style={{
                    ...styles.arenaTile,
                    opacity: alive ? 1 : 0.18,
                    transform: `translateY(${alive ? 0 : 26}px) scale(${alive ? 1 : 0.72})`,
                    borderColor: danger ? "rgba(255,61,110,0.8)" : alive ? "rgba(40,243,206,0.34)" : "rgba(255,255,255,0.06)",
                    boxShadow: danger ? "0 0 46px rgba(255,61,110,0.48)" : alive ? "0 0 28px rgba(40,243,206,0.18)" : "none",
                  }}
                >
                  <Avatar seed={player.seed} size={58} muted={eliminatedAt} />
                  <div style={styles.tileWallet}>{player.wallet}</div>
                  {eliminatedAt ? <div style={styles.eliminatedText}>OUT</div> : null}
                </div>
              );
            })}
          </div>
          <div style={styles.progressShell}>
            <div style={{...styles.progressFill, width: `${interpolate(p, [0, 1], [8, 88], clamp)}%`}} />
          </div>
        </div>
        <div style={styles.eventStack}>
          <EventCard color={colors.cyan} label="ROUND TIMER" value={`${Math.max(1, 12 - Math.floor((local / 10) % 12))}s`} />
          <EventCard color={colors.green} label="ALIVE" value={`${aliveCount} WALLETS`} />
          <EventCard color={colors.red} label="ELIMINATED" value={`${16 - aliveCount} WALLETS`} />
          <div
            style={{
              ...styles.elimBanner,
              opacity: eliminationPulse,
              transform: `translateX(${interpolate(eliminationPulse, [0, 1], [36, 0])}px)`,
            }}
          >
            ELIMINATION ROUND
          </div>
        </div>
      </div>
    </SceneLayer>
  );
};

const SpectatorScene: React.FC<{frame: number}> = ({frame}) => {
  const [start, end] = SCENES.spectator;
  const p = sceneProgress(frame, start, end);
  const exit = interpolate(frame, [end - 18, end], [1, 0], clamp);
  const selection = interpolate(p, [0.22, 0.46], [0, 1], clamp);
  const rewardPulse = pulse(frame - start, 16, 0.74);

  return (
    <SceneLayer active={isInScene(frame, "spectator")} opacity={exit}>
      <SceneHeader
        eyebrow="// SPECTATOR MODE"
        frame={frame}
        sceneStart={start}
        title="Pick a survivor. Watch the odds move."
        value="Prediction live"
      />
      <div style={styles.spectatorLayout}>
        <div style={styles.watchPanel}>
          <div style={styles.panelLabel}>SELECT PLAYER</div>
          <div style={styles.predictionGrid}>
            {players.slice(0, 9).map((player, index) => {
              const picked = index === 4;
              return (
                <div
                  key={player.wallet}
                  style={{
                    ...styles.predictionCard,
                    borderColor: picked ? `rgba(255,209,102,${0.42 + rewardPulse * 0.36})` : "rgba(255,255,255,0.08)",
                    background: picked ? "rgba(255,209,102,0.08)" : "rgba(255,255,255,0.025)",
                    transform: picked ? `scale(${1 + selection * 0.04})` : "scale(1)",
                    boxShadow: picked ? "0 0 58px rgba(255,209,102,0.2)" : "none",
                  }}
                >
                  <Avatar seed={player.seed} size={48} />
                  <span>{player.wallet}</span>
                  <strong>{picked ? "4.8x" : `${(2.1 + index / 3).toFixed(1)}x`}</strong>
                  {picked ? <div style={styles.selectedCheck}>SELECTED</div> : null}
                </div>
              );
            })}
          </div>
        </div>
        <div style={styles.predictionPanel}>
          <div style={styles.panelLabel}>PREDICTION TICKET</div>
          <div style={styles.ticketWallet}>0x6E44...10FA</div>
          <div style={styles.oddsRow}>
            <span>Survival odds</span>
            <strong>4.8x</strong>
          </div>
          <div style={styles.oddsRow}>
            <span>Stake</span>
            <strong>10 USDC</strong>
          </div>
          <div style={styles.rewardBox}>
            <div style={styles.rewardGlow(frame)} />
            <span>WIN REWARDS</span>
            <strong>48 USDC</strong>
          </div>
          <div style={styles.confirmButton}>LOCK PREDICTION</div>
        </div>
      </div>
    </SceneLayer>
  );
};

const EndingScene: React.FC<{frame: number}> = ({frame}) => {
  const [start] = SCENES.ending;
  const p = sceneProgress(frame, SCENES.ending[0], SCENES.ending[1]);
  const winnerIn = interpolate(p, [0.02, 0.32], [120, 0], clamp);
  const prizeFlow = interpolate(p, [0.2, 0.62], [0, 1], clamp);
  const logoIn = interpolate(p, [0.62, 0.84], [0, 1], clamp);

  return (
    <SceneLayer active={isInScene(frame, "ending")} opacity={1}>
      <div style={styles.endingStage}>
        <div
          style={{
            ...styles.winnerCard,
            transform: `translateY(${winnerIn}px) scale(${0.92 + prizeFlow * 0.08})`,
            opacity: interpolate(p, [0.04, 0.22], [0, 1], clamp),
          }}
        >
          <div style={styles.crown}>WINNER</div>
          <Avatar seed={5} size={116} />
          <div style={styles.winnerWallet}>0x6E44...10FA</div>
          <div style={styles.winnerMeta}>last wallet standing</div>
        </div>
        <PrizePoolFlow
          frame={frame - start}
          opacity={interpolate(p, [0, 0.64, 0.78], [1, 1, 0], clamp)}
          progress={prizeFlow}
        />
        <div
          style={{
            ...styles.finalLockup,
            opacity: logoIn,
            transform: `translateY(${interpolate(logoIn, [0, 1], [60, 0])}px)`,
          }}
        >
          <LogoMark frame={frame} size={98} />
          <GlitchText glitch={pulse(frame, 18, 0.85) > 0.5 ? 1 : 0} size={74} text="Last Nads Standing" />
          <div style={styles.tagline}>Stake. Survive. Win.</div>
        </div>
      </div>
    </SceneLayer>
  );
};

const SceneHeader: React.FC<{
  eyebrow: string;
  frame: number;
  sceneStart: number;
  title: string;
  value: string;
}> = ({eyebrow, frame, sceneStart, title, value}) => {
  const local = frame - sceneStart;
  return (
    <div
      style={{
        ...styles.sceneHeader,
        opacity: interpolate(local, [0, 16], [0, 1], clamp),
        transform: `translateY(${interpolate(local, [0, 18], [-28, 0], clamp)}px)`,
      }}
    >
      <div>
        <div style={styles.eyebrow}>{eyebrow}</div>
        <div style={styles.sceneTitle}>{title}</div>
      </div>
      <div style={styles.headerValue}>{value}</div>
    </div>
  );
};

const SceneLayer: React.FC<{active: boolean; children: ReactNode; opacity: number}> = ({
  active,
  children,
  opacity,
}) => {
  if (!active) return null;
  return (
    <AbsoluteFill style={{...styles.sceneLayer, opacity}}>
      {children}
    </AbsoluteFill>
  );
};

const NeonBackground: React.FC<{frame: number}> = ({frame}) => {
  const beat = pulse(frame, beatFrames, 0.72);
  return (
    <AbsoluteFill style={styles.background}>
      <div style={styles.bgRadial(colors.purple, 20 + beat * 8, 8, 0.2)} />
      <div style={styles.bgRadial(colors.blue, 78, 18 + beat * 8, 0.16)} />
      <div style={styles.bgRadial(colors.pink, 50, 92, 0.11)} />
      <div
        style={{
          ...styles.grid,
          transform: `translateY(${(frame * 1.25) % 80}px) perspective(900px) rotateX(58deg) scale(1.34)`,
        }}
      />
      <ParticleField frame={frame} />
      <div style={styles.scanlines} />
    </AbsoluteFill>
  );
};

const ParticleField: React.FC<{frame: number}> = ({frame}) => {
  const dots = Array.from({length: 46}, (_, index) => index);
  return (
    <div style={styles.particleLayer}>
      {dots.map((index) => {
        const x = (index * 97) % 1920;
        const y = (index * 211) % 1080;
        const drift = ((frame * (0.5 + (index % 5) * 0.16) + index * 33) % 380) - 190;
        const size = 2 + (index % 4);
        const color = index % 3 === 0 ? colors.blue : index % 3 === 1 ? colors.purple : colors.cyan;
        return (
          <div
            key={index}
            style={{
              ...styles.particle,
              height: size,
              left: x,
              opacity: 0.32 + ((index % 7) / 12),
              top: y,
              transform: `translate3d(${drift}px, ${Math.sin((frame + index) / 20) * 18}px, 0)`,
              width: size,
              background: color,
              boxShadow: `0 0 18px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
};

const BeatHud: React.FC<{frame: number}> = ({frame}) => {
  const bars = Array.from({length: 26}, (_, index) => index);
  return (
    <div style={styles.beatHud}>
      {bars.map((index) => {
        const height = 10 + pulse(frame + index * 3, 18, 0.68) * (28 + (index % 4) * 8);
        return (
          <div
            key={index}
            style={{
              ...styles.beatBar,
              height,
              opacity: 0.2 + pulse(frame + index, beatFrames, 0.7) * 0.55,
            }}
          />
        );
      })}
    </div>
  );
};

const CutFlashes: React.FC<{frame: number}> = ({frame}) => {
  const flashes = [90, 240, 360, 600, 750];
  const opacity = Math.max(
    ...flashes.map((cut) => interpolate(Math.abs(frame - cut), [0, 7, 18], [0.72, 0.2, 0], clamp)),
  );
  return <AbsoluteFill style={{...styles.cutFlash, opacity}} />;
};

const Vignette = () => <AbsoluteFill style={styles.vignette} />;

const GlitchText: React.FC<{glitch: number; size: number; text: string}> = ({glitch, size, text}) => {
  const base: CSSProperties = {
    ...styles.glitchText,
    fontSize: size,
    lineHeight: 0.94,
  };

  return (
    <div style={styles.glitchWrap}>
      <div
        style={{
          ...base,
          color: "#ffffff",
          textShadow: `0 0 18px ${colors.purple}, 0 0 48px ${colors.blue}`,
        }}
      >
        {text}
      </div>
      <div
        style={{
          ...base,
          ...styles.glitchLayer,
          color: colors.blue,
          opacity: glitch ? 0.75 : 0.2,
          transform: `translate(${glitch ? -8 : -2}px, ${glitch ? -5 : 0}px)`,
          clipPath: "inset(0 0 54% 0)",
        }}
      >
        {text}
      </div>
      <div
        style={{
          ...base,
          ...styles.glitchLayer,
          color: colors.pink,
          opacity: glitch ? 0.72 : 0.18,
          transform: `translate(${glitch ? 9 : 2}px, ${glitch ? 6 : 0}px)`,
          clipPath: "inset(48% 0 0 0)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

const LogoMark: React.FC<{frame: number; size: number}> = ({frame, size}) => {
  const spin = frame * 0.34;
  return (
    <div style={{...styles.logoMark, height: size, width: size}}>
      <div
        style={{
          ...styles.logoRing,
          transform: `rotate(${spin}deg)`,
        }}
      />
      <div
        style={{
          ...styles.logoRing,
          borderColor: "rgba(59,214,255,0.48)",
          inset: size * 0.18,
          transform: `rotate(${-spin * 1.2}deg)`,
        }}
      />
      <div style={{...styles.logoCore, fontSize: size * 0.24}}>LNS</div>
    </div>
  );
};

const Metric: React.FC<{label: string; value: string}> = ({label, value}) => (
  <div style={styles.metric}>
    <div>{label}</div>
    <strong>{value}</strong>
  </div>
);

const ParamChip: React.FC<{label: string; value: string}> = ({label, value}) => (
  <div style={styles.paramChip}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const FlowLine: React.FC<{frame: number; offset: number}> = ({frame, offset}) => (
  <div style={styles.flowLine}>
    {Array.from({length: 5}).map((_, index) => (
      <span
        key={index}
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.cyan}, transparent)`,
          borderRadius: 999,
          height: 2,
          left: `${((frame * 2 + offset + index * 22) % 100)}%`,
          opacity: 0.18 + index * 0.12,
          position: "absolute",
          top: `${24 + index * 17}%`,
          width: 110,
        }}
      />
    ))}
  </div>
);

const TokenStream: React.FC<{frame: number; progress: number}> = ({frame, progress}) => {
  return (
    <div style={styles.tokenStream}>
      {Array.from({length: 9}).map((_, index) => {
        const local = ((frame * 1.8 + index * 18) % 100) / 100;
        return (
          <div
            key={index}
            style={{
              ...styles.tokenDot,
              opacity: local < progress + 0.18 ? 0.95 : 0.08,
              transform: `translate3d(${interpolate(local, [0, 1], [-180, 180])}px, ${Math.sin(local * Math.PI * 2) * 34}px, 0) scale(${0.7 + local * 0.45})`,
            }}
          >
            $
          </div>
        );
      })}
    </div>
  );
};

const Avatar: React.FC<{muted?: boolean; seed: number; size: number}> = ({muted, seed, size}) => {
  const hue = (seed * 47) % 360;
  const accent = muted ? "rgba(255,255,255,0.12)" : `hsl(${hue}, 92%, 62%)`;
  return (
    <div
      style={{
        ...styles.avatar,
        height: size,
        width: size,
        background: muted
          ? "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))"
          : `linear-gradient(135deg, hsl(${hue}, 92%, 62%), hsl(${(hue + 44) % 360}, 92%, 48%))`,
        boxShadow: muted ? "none" : `0 0 24px ${accent}`,
        color: muted ? "rgba(255,255,255,0.3)" : "#061018",
        fontSize: size * 0.32,
      }}
    >
      {seed.toString(16).toUpperCase().padStart(2, "0")}
    </div>
  );
};

const EventCard: React.FC<{color: string; label: string; value: string}> = ({color, label, value}) => (
  <div style={{...styles.eventCard, borderColor: hexToRgba(color, 0.32), boxShadow: `0 0 34px ${hexToRgba(color, 0.08)}`}}>
    <span style={{color}}>{label}</span>
    <strong>{value}</strong>
  </div>
);

const PrizePoolFlow: React.FC<{frame: number; opacity: number; progress: number}> = ({frame, opacity, progress}) => {
  return (
    <div style={{...styles.prizeLayer, opacity}}>
      <div style={styles.prizePool}>
        <span>PRIZE POOL</span>
        <strong>1,600 USDC</strong>
      </div>
      {Array.from({length: 18}).map((_, index) => {
        const t = ((frame * 1.6 + index * 9) % 100) / 100;
        const active = t < progress + 0.28;
        return (
          <div
            key={index}
            style={{
              ...styles.prizeToken,
              opacity: active ? 1 : 0,
              transform: `translate3d(${interpolate(t, [0, 1], [280, -430])}px, ${Math.sin(t * Math.PI) * -190 + t * 160 + Math.cos(index) * 22}px, 0) scale(${1.25 - t * 0.38})`,
            }}
          >
            USDC
          </div>
        );
      })}
    </div>
  );
};

const GlobalStyles = () => (
  <style>{`
    * { box-sizing: border-box; }
    body { margin: 0; background: ${colors.bg}; }
  `}</style>
);

function isInScene(frame: number, scene: SceneName) {
  const [start, end] = SCENES[scene];
  if (scene === "ending") return frame >= start && frame < end;
  return frame >= start && frame < end;
}

function sceneProgress(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [0, 1], clamp);
}

function pulse(frame: number, every: number, falloff = 0.6) {
  const local = ((frame % every) + every) % every;
  const raw = 1 - local / every;
  return Math.pow(Math.max(0, raw), 1 / Math.max(0.08, falloff));
}

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

function createEnergeticBeatDataUri(seconds: number) {
  const sampleRate = 16000;
  const samples = sampleRate * seconds;
  const bytesPerSample = 2;
  const channels = 1;
  const dataSize = samples * bytesPerSample * channels;
  const buffer = new Uint8Array(44 + dataSize);
  const view = new DataView(buffer.buffer);

  writeString(buffer, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(buffer, 8, "WAVE");
  writeString(buffer, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * bytesPerSample, true);
  view.setUint16(32, channels * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(buffer, 36, "data");
  view.setUint32(40, dataSize, true);

  let noise = 22222;
  const bpm = 150;
  const secondsPerBeat = 60 / bpm;
  const scale = [0, 3, 7, 10, 12, 15, 19, 22];

  for (let i = 0; i < samples; i += 1) {
    const t = i / sampleRate;
    const beat = (t / secondsPerBeat) % 1;
    const halfBeat = (t / (secondsPerBeat / 2)) % 1;
    const step = Math.floor(t / (secondsPerBeat / 2));
    noise = (noise * 1664525 + 1013904223) >>> 0;
    const white = ((noise / 4294967295) * 2 - 1) * Math.pow(1 - halfBeat, 10);
    const kickEnv = Math.exp(-beat * 10);
    const kickFreq = 50 + 82 * Math.exp(-beat * 14);
    const kick = Math.sin(Math.PI * 2 * kickFreq * t) * kickEnv;
    const snare = step % 4 === 2 ? white * 0.72 : 0;
    const hat = white * (step % 2 === 1 ? 0.28 : 0.14);
    const note = 92 * Math.pow(2, scale[step % scale.length] / 12);
    const bass = Math.sin(Math.PI * 2 * note * t) * Math.exp(-halfBeat * 3.2) * 0.3;
    const leadGate = Math.pow(1 - ((t / (secondsPerBeat / 4)) % 1), 2.8);
    const leadNote = 184 * Math.pow(2, scale[(step + 3) % scale.length] / 12);
    const lead = Math.sign(Math.sin(Math.PI * 2 * leadNote * t)) * leadGate * 0.055;
    const riser = Math.sin(Math.PI * 2 * (430 + t * 18) * t) * Math.min(1, t / seconds) * 0.025;
    const mixed = Math.max(-1, Math.min(1, kick * 0.72 + snare + hat + bass + lead + riser));
    view.setInt16(44 + i * 2, mixed * 0x7fff * 0.62, true);
  }

  return `data:audio/wav;base64,${base64(buffer)}`;
}

function writeString(buffer: Uint8Array, offset: number, value: string) {
  for (let i = 0; i < value.length; i += 1) {
    buffer[offset + i] = value.charCodeAt(i);
  }
}

function base64(bytes: Uint8Array) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    output += chars[(chunk >> 18) & 63] + chars[(chunk >> 12) & 63] + chars[(chunk >> 6) & 63] + chars[chunk & 63];
  }
  if (i < bytes.length) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const chunk = (a << 16) | (b << 8);
    output += chars[(chunk >> 18) & 63] + chars[(chunk >> 12) & 63] + (i + 1 < bytes.length ? chars[(chunk >> 6) & 63] : "=") + "=";
  }
  return output;
}

const styles = {
  root: {
    background: colors.bg,
    color: "white",
    fontFamily: fontBody,
    overflow: "hidden",
  } satisfies CSSProperties,
  background: {
    background:
      "linear-gradient(120deg, #05050b 0%, #08091a 42%, #030612 100%)",
    overflow: "hidden",
  } satisfies CSSProperties,
  camera: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    transformOrigin: "50% 52%",
    willChange: "transform",
  } satisfies CSSProperties,
  sceneLayer: {
    padding: "88px 112px",
  } satisfies CSSProperties,
  bgRadial: (color: string, x: number, y: number, opacity: number): CSSProperties => ({
    background: `radial-gradient(circle at center, ${hexToRgba(color, opacity)} 0%, transparent 58%)`,
    filter: "blur(6px)",
    height: 760,
    left: `${x}%`,
    position: "absolute",
    top: `${y}%`,
    transform: "translate(-50%, -50%)",
    width: 980,
  }),
  grid: {
    backgroundImage:
      "linear-gradient(rgba(59,214,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(143,93,255,0.16) 1px, transparent 1px)",
    backgroundSize: "80px 80px",
    bottom: -540,
    height: 960,
    left: -280,
    opacity: 0.34,
    position: "absolute",
    right: -280,
    transformOrigin: "50% 100%",
  } satisfies CSSProperties,
  scanlines: {
    background:
      "repeating-linear-gradient(180deg, rgba(255,255,255,0.025) 0, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 5px)",
    inset: 0,
    mixBlendMode: "screen",
    opacity: 0.45,
    pointerEvents: "none",
    position: "absolute",
  } satisfies CSSProperties,
  particleLayer: {
    inset: 0,
    position: "absolute",
  } satisfies CSSProperties,
  particle: {
    borderRadius: 999,
    position: "absolute",
  } satisfies CSSProperties,
  vignette: {
    background:
      "radial-gradient(circle at center, transparent 42%, rgba(0,0,0,0.62) 100%), linear-gradient(90deg, rgba(0,0,0,0.25), transparent 18%, transparent 82%, rgba(0,0,0,0.25))",
    pointerEvents: "none",
  } satisfies CSSProperties,
  cutFlash: {
    background: "linear-gradient(90deg, rgba(59,214,255,0.42), rgba(255,79,216,0.38))",
    mixBlendMode: "screen",
    pointerEvents: "none",
  } satisfies CSSProperties,
  centerStack: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "center",
    textAlign: "center",
  } satisfies CSSProperties,
  logoMark: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    marginBottom: 30,
    position: "relative",
  } satisfies CSSProperties,
  logoRing: {
    border: "2px solid rgba(143,93,255,0.72)",
    clipPath: "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)",
    inset: 0,
    position: "absolute",
    boxShadow: "0 0 34px rgba(143,93,255,0.45), inset 0 0 28px rgba(59,214,255,0.16)",
  } satisfies CSSProperties,
  logoCore: {
    alignItems: "center",
    background: "linear-gradient(135deg, rgba(143,93,255,0.92), rgba(59,214,255,0.82))",
    clipPath: "polygon(25% 7%, 75% 7%, 94% 50%, 75% 93%, 25% 93%, 6% 50%)",
    color: "#05050b",
    display: "flex",
    fontFamily: fontDisplay,
    fontWeight: 900,
    height: "56%",
    justifyContent: "center",
    letterSpacing: 1,
    width: "56%",
  } satisfies CSSProperties,
  kicker: {
    color: colors.cyan,
    fontFamily: fontMono,
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 5,
    marginBottom: 22,
    textShadow: `0 0 20px ${colors.cyan}`,
  } satisfies CSSProperties,
  titleWrap: {
    maxWidth: 1560,
  } satisfies CSSProperties,
  glitchWrap: {
    display: "inline-block",
    position: "relative",
  } satisfies CSSProperties,
  glitchText: {
    fontFamily: fontDisplay,
    fontWeight: 900,
    letterSpacing: 0,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  } satisfies CSSProperties,
  glitchLayer: {
    left: 0,
    mixBlendMode: "screen",
    position: "absolute",
    top: 0,
  } satisfies CSSProperties,
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    fontFamily: fontMono,
    fontSize: 30,
    letterSpacing: 1.4,
    marginTop: 22,
  } satisfies CSSProperties,
  hookBars: {
    display: "flex",
    gap: 18,
    marginTop: 38,
    width: 760,
  } satisfies CSSProperties,
  hookBar: {
    height: 5,
    transformOrigin: "0 50%",
    width: "25%",
  } satisfies CSSProperties,
  bootText: {
    bottom: 78,
    color: "rgba(255,255,255,0.46)",
    fontFamily: fontMono,
    fontSize: 16,
    left: 112,
    letterSpacing: 4,
    position: "absolute",
  } satisfies CSSProperties,
  sceneHeader: {
    alignItems: "flex-start",
    display: "flex",
    justifyContent: "space-between",
    left: 112,
    position: "absolute",
    right: 112,
    top: 66,
  } satisfies CSSProperties,
  eyebrow: {
    color: colors.blue,
    fontFamily: fontMono,
    fontSize: 16,
    fontWeight: 800,
    letterSpacing: 5,
    marginBottom: 12,
    textShadow: `0 0 20px ${colors.blue}`,
  } satisfies CSSProperties,
  sceneTitle: {
    color: "white",
    fontFamily: fontDisplay,
    fontSize: 48,
    fontWeight: 850,
    letterSpacing: 0,
    textShadow: "0 0 34px rgba(143,93,255,0.22)",
  } satisfies CSSProperties,
  headerValue: {
    border: "1px solid rgba(59,214,255,0.34)",
    borderRadius: 8,
    color: colors.cyan,
    fontFamily: fontMono,
    fontSize: 17,
    fontWeight: 800,
    letterSpacing: 2.2,
    padding: "14px 18px",
    textTransform: "uppercase",
    boxShadow: "0 0 28px rgba(59,214,255,0.11)",
  } satisfies CSSProperties,
  dashboard: {
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 16,
    boxShadow: "0 30px 110px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.08)",
    display: "grid",
    gridTemplateColumns: "190px minmax(0, 1fr) 420px",
    gap: 22,
    height: 720,
    marginTop: 114,
    padding: 22,
    transformOrigin: "50% 100%",
    background: "linear-gradient(135deg, rgba(12,14,28,0.86), rgba(18,18,34,0.68))",
  } satisfies CSSProperties,
  leftRail: {
    borderRight: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: "12px 18px 12px 0",
  } satisfies CSSProperties,
  railPill: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    fontFamily: fontMono,
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: 2,
    padding: "18px 16px",
  } satisfies CSSProperties,
  roomList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  } satisfies CSSProperties,
  roomRow: {
    alignItems: "center",
    background: "linear-gradient(90deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    display: "grid",
    gridTemplateColumns: "28px 170px repeat(3, 1fr) 130px",
    minHeight: 122,
    padding: "18px 20px",
  } satisfies CSSProperties,
  roomStatusDot: (color: string): CSSProperties => ({
    background: color,
    borderRadius: 999,
    boxShadow: `0 0 22px ${color}`,
    height: 13,
    width: 13,
  }),
  roomId: {
    color: "white",
    fontFamily: fontDisplay,
    fontSize: 27,
    fontWeight: 850,
  } satisfies CSSProperties,
  metric: {
    color: "rgba(255,255,255,0.46)",
    fontFamily: fontMono,
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  } satisfies CSSProperties,
  statusBadge: {
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    fontFamily: fontMono,
    fontSize: 13,
    fontWeight: 900,
    justifySelf: "end",
    letterSpacing: 1.6,
    padding: "10px 12px",
  } satisfies CSSProperties,
  createPanel: {
    background: "linear-gradient(180deg, rgba(143,93,255,0.12), rgba(59,214,255,0.04))",
    border: "1px solid rgba(143,93,255,0.32)",
    borderRadius: 14,
    boxShadow: "0 0 60px rgba(143,93,255,0.13), inset 0 1px 0 rgba(255,255,255,0.08)",
    padding: 24,
  } satisfies CSSProperties,
  createButtonAura: (frame: number): CSSProperties => ({
    border: "1px solid rgba(143,93,255,0.7)",
    borderRadius: 10,
    boxShadow: `0 0 ${30 + pulse(frame, beatFrames, 0.8) * 28}px rgba(143,93,255,0.45)`,
    padding: 6,
  }),
  createButton: {
    background: "linear-gradient(90deg, #8f5dff, #3bd6ff)",
    borderRadius: 7,
    color: "#05050b",
    fontFamily: fontDisplay,
    fontSize: 25,
    fontWeight: 900,
    letterSpacing: 2,
    padding: "22px 24px",
    textAlign: "center",
  } satisfies CSSProperties,
  paramsGrid: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "1fr",
    marginTop: 24,
  } satisfies CSSProperties,
  paramChip: {
    alignItems: "center",
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 18px",
  } satisfies CSSProperties,
  sliderTrack: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    height: 10,
    marginTop: 22,
    overflow: "hidden",
  } satisfies CSSProperties,
  sliderFill: {
    background: `linear-gradient(90deg, ${colors.purple}, ${colors.blue})`,
    boxShadow: `0 0 18px ${colors.blue}`,
    height: "100%",
  } satisfies CSSProperties,
  panelCaption: {
    color: "rgba(255,255,255,0.54)",
    fontFamily: fontMono,
    fontSize: 13,
    lineHeight: 1.55,
    marginTop: 22,
  } satisfies CSSProperties,
  joinLayout: {
    alignItems: "center",
    display: "grid",
    gap: 36,
    gridTemplateColumns: "460px minmax(0, 1fr) 520px",
    height: "100%",
    paddingTop: 120,
  } satisfies CSSProperties,
  walletPanel: {
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    boxShadow: "0 30px 90px rgba(0,0,0,0.48)",
    padding: 24,
  } satisfies CSSProperties,
  roomPanel: {
    background: colors.panel,
    border: "1px solid rgba(59,214,255,0.24)",
    borderRadius: 14,
    boxShadow: "0 30px 90px rgba(0,0,0,0.48)",
    padding: 24,
  } satisfies CSSProperties,
  panelLabel: {
    color: colors.blue,
    fontFamily: fontMono,
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: 3.4,
    marginBottom: 18,
  } satisfies CSSProperties,
  walletCard: {
    alignItems: "center",
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 12,
    display: "grid",
    gap: 16,
    gridTemplateColumns: "58px 1fr auto",
    padding: 18,
  } satisfies CSSProperties,
  walletIcon: (frame: number): CSSProperties => ({
    background: `conic-gradient(from ${frame * 2}deg, ${colors.purple}, ${colors.blue}, ${colors.cyan}, ${colors.purple})`,
    borderRadius: 14,
    boxShadow: "0 0 28px rgba(59,214,255,0.28)",
    height: 58,
    width: 58,
  }),
  walletAddress: {
    fontFamily: fontMono,
    fontSize: 22,
    fontWeight: 900,
  } satisfies CSSProperties,
  walletSub: {
    color: "rgba(255,255,255,0.48)",
    fontFamily: fontMono,
    fontSize: 13,
    marginTop: 4,
  } satisfies CSSProperties,
  connectedBadge: {
    border: "1px solid currentColor",
    borderRadius: 7,
    fontFamily: fontMono,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.6,
    padding: "9px 11px",
  } satisfies CSSProperties,
  transactionBox: {
    background: "rgba(0,0,0,0.24)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    marginTop: 18,
    overflow: "hidden",
    padding: 18,
    position: "relative",
  } satisfies CSSProperties,
  flowLine: {
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
    position: "absolute",
  } satisfies CSSProperties,
  txLabel: {
    color: "rgba(255,255,255,0.55)",
    fontFamily: fontMono,
    fontSize: 13,
  } satisfies CSSProperties,
  txAmount: {
    color: colors.cyan,
    fontFamily: fontDisplay,
    fontSize: 38,
    fontWeight: 900,
    marginTop: 6,
  } satisfies CSSProperties,
  txBar: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    height: 12,
    marginTop: 18,
    overflow: "hidden",
  } satisfies CSSProperties,
  txFill: {
    background: `linear-gradient(90deg, ${colors.cyan}, ${colors.purple})`,
    height: "100%",
  } satisfies CSSProperties,
  joinCenter: {
    alignItems: "center",
    display: "flex",
    height: 500,
    justifyContent: "center",
    position: "relative",
  } satisfies CSSProperties,
  tokenStream: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    left: "50%",
    position: "absolute",
    top: "50%",
  } satisfies CSSProperties,
  tokenDot: {
    alignItems: "center",
    background: colors.gold,
    borderRadius: 999,
    boxShadow: "0 0 24px rgba(255,209,102,0.72)",
    color: "#171009",
    display: "flex",
    fontFamily: fontMono,
    fontSize: 16,
    fontWeight: 900,
    height: 38,
    justifyContent: "center",
    position: "absolute",
    width: 38,
  } satisfies CSSProperties,
  chainNode: (side: "left" | "right", p: number): CSSProperties => ({
    alignItems: "center",
    background: side === "left" ? "rgba(255,209,102,0.12)" : "rgba(143,93,255,0.13)",
    border: `1px solid ${side === "left" ? "rgba(255,209,102,0.45)" : "rgba(143,93,255,0.48)"}`,
    borderRadius: 14,
    color: side === "left" ? colors.gold : colors.purple,
    display: "flex",
    fontFamily: fontDisplay,
    fontSize: 26,
    fontWeight: 900,
    height: 118,
    justifyContent: "center",
    left: side === "left" ? 24 : undefined,
    opacity: interpolate(p, [0.16, 0.36], [0, 1], clamp),
    position: "absolute",
    right: side === "right" ? 24 : undefined,
    width: 150,
  }),
  chainConnector: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    height: 8,
    left: 174,
    overflow: "hidden",
    position: "absolute",
    right: 174,
  } satisfies CSSProperties,
  chainConnectorFill: {
    background: `linear-gradient(90deg, ${colors.gold}, ${colors.cyan}, ${colors.purple})`,
    height: "100%",
    transformOrigin: "0 50%",
  } satisfies CSSProperties,
  slotGrid: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(4, 1fr)",
  } satisfies CSSProperties,
  playerSlot: {
    alignItems: "center",
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    height: 92,
    justifyContent: "center",
    transition: "all 0.2s ease",
  } satisfies CSSProperties,
  roomCount: {
    color: colors.cyan,
    fontFamily: fontDisplay,
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: 2,
    marginTop: 20,
    textAlign: "right",
  } satisfies CSSProperties,
  gameplayWrap: {
    display: "grid",
    gap: 28,
    gridTemplateColumns: "minmax(0, 1fr) 360px",
    height: "100%",
    paddingTop: 128,
  } satisfies CSSProperties,
  arenaPanel: {
    background: "linear-gradient(180deg, rgba(10,12,24,0.82), rgba(8,9,18,0.64))",
    border: "1px solid rgba(59,214,255,0.18)",
    borderRadius: 16,
    boxShadow: "0 36px 110px rgba(0,0,0,0.58)",
    overflow: "hidden",
    padding: 26,
  } satisfies CSSProperties,
  arenaTopBar: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 22,
  } satisfies CSSProperties,
  livePill: {
    background: "rgba(255,61,110,0.14)",
    border: "1px solid rgba(255,61,110,0.5)",
    borderRadius: 999,
    color: colors.red,
    fontFamily: fontMono,
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: 2.4,
    padding: "10px 16px",
  } satisfies CSSProperties,
  roundTicker: {
    display: "flex",
    gap: 12,
  } satisfies CSSProperties,
  roundDot: {
    borderRadius: 999,
    height: 13,
    width: 48,
  } satisfies CSSProperties,
  poolMini: {
    color: colors.gold,
    fontFamily: fontMono,
    fontSize: 15,
    fontWeight: 900,
    letterSpacing: 2,
  } satisfies CSSProperties,
  arenaGrid: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "repeat(4, 1fr)",
    transformOrigin: "50% 55%",
  } satisfies CSSProperties,
  arenaTile: {
    alignItems: "center",
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(40,243,206,0.3)",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    height: 124,
    justifyContent: "center",
    position: "relative",
  } satisfies CSSProperties,
  tileWallet: {
    color: "rgba(255,255,255,0.68)",
    fontFamily: fontMono,
    fontSize: 12,
    marginTop: 10,
  } satisfies CSSProperties,
  eliminatedText: {
    background: "rgba(255,61,110,0.15)",
    border: "1px solid rgba(255,61,110,0.45)",
    borderRadius: 6,
    color: colors.red,
    fontFamily: fontDisplay,
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: 2,
    padding: "4px 8px",
    position: "absolute",
    transform: "rotate(-8deg)",
  } satisfies CSSProperties,
  progressShell: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    height: 13,
    marginTop: 28,
    overflow: "hidden",
  } satisfies CSSProperties,
  progressFill: {
    background: `linear-gradient(90deg, ${colors.purple}, ${colors.red}, ${colors.gold})`,
    boxShadow: "0 0 24px rgba(255,61,110,0.4)",
    height: "100%",
  } satisfies CSSProperties,
  eventStack: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  } satisfies CSSProperties,
  eventCard: {
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: 22,
  } satisfies CSSProperties,
  elimBanner: {
    background: "linear-gradient(90deg, rgba(255,61,110,0.28), rgba(255,61,110,0.08))",
    border: "1px solid rgba(255,61,110,0.48)",
    borderRadius: 10,
    color: colors.red,
    fontFamily: fontDisplay,
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: 2,
    padding: "24px 20px",
    textAlign: "center",
  } satisfies CSSProperties,
  spectatorLayout: {
    display: "grid",
    gap: 28,
    gridTemplateColumns: "minmax(0, 1fr) 420px",
    height: "100%",
    paddingTop: 128,
  } satisfies CSSProperties,
  watchPanel: {
    background: "rgba(10,12,24,0.78)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 16,
    padding: 26,
  } satisfies CSSProperties,
  predictionGrid: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "repeat(3, 1fr)",
  } satisfies CSSProperties,
  predictionCard: {
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    display: "grid",
    gap: 12,
    gridTemplateColumns: "58px 1fr auto",
    minHeight: 104,
    padding: 18,
    position: "relative",
  } satisfies CSSProperties,
  selectedCheck: {
    background: colors.gold,
    borderRadius: 5,
    bottom: 10,
    color: "#12100a",
    fontFamily: fontMono,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 1.2,
    padding: "4px 6px",
    position: "absolute",
    right: 10,
  } satisfies CSSProperties,
  predictionPanel: {
    background: "linear-gradient(180deg, rgba(255,209,102,0.12), rgba(143,93,255,0.08))",
    border: "1px solid rgba(255,209,102,0.32)",
    borderRadius: 16,
    boxShadow: "0 34px 100px rgba(0,0,0,0.5)",
    padding: 26,
  } satisfies CSSProperties,
  ticketWallet: {
    color: "white",
    fontFamily: fontDisplay,
    fontSize: 34,
    fontWeight: 900,
    marginBottom: 26,
  } satisfies CSSProperties,
  oddsRow: {
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    fontFamily: fontMono,
    fontSize: 17,
    justifyContent: "space-between",
    padding: "18px 0",
  } satisfies CSSProperties,
  rewardBox: {
    background: "rgba(255,209,102,0.12)",
    border: "1px solid rgba(255,209,102,0.42)",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 28,
    overflow: "hidden",
    padding: 24,
    position: "relative",
  } satisfies CSSProperties,
  rewardGlow: (frame: number): CSSProperties => ({
    background: "linear-gradient(90deg, transparent, rgba(255,209,102,0.4), transparent)",
    height: "140%",
    left: `${((frame * 2) % 180) - 50}%`,
    position: "absolute",
    top: "-20%",
    transform: "rotate(12deg)",
    width: "38%",
  }),
  confirmButton: {
    background: `linear-gradient(90deg, ${colors.gold}, ${colors.purple})`,
    borderRadius: 9,
    color: "#09080d",
    fontFamily: fontDisplay,
    fontSize: 20,
    fontWeight: 900,
    letterSpacing: 1.8,
    marginTop: 22,
    padding: "20px 24px",
    textAlign: "center",
  } satisfies CSSProperties,
  endingStage: {
    alignItems: "center",
    display: "flex",
    height: "100%",
    justifyContent: "center",
    position: "relative",
  } satisfies CSSProperties,
  winnerCard: {
    alignItems: "center",
    background: "rgba(10,12,24,0.68)",
    border: "1px solid rgba(40,243,206,0.24)",
    borderRadius: 16,
    boxShadow: "0 0 110px rgba(40,243,206,0.16)",
    display: "flex",
    flexDirection: "column",
    left: 220,
    padding: 36,
    position: "absolute",
    top: 250,
    width: 360,
    zIndex: 3,
  } satisfies CSSProperties,
  crown: {
    color: colors.gold,
    fontFamily: fontMono,
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: 4,
    marginBottom: 18,
  } satisfies CSSProperties,
  winnerWallet: {
    color: "white",
    fontFamily: fontDisplay,
    fontSize: 32,
    fontWeight: 900,
    marginTop: 20,
  } satisfies CSSProperties,
  winnerMeta: {
    color: "rgba(255,255,255,0.48)",
    fontFamily: fontMono,
    fontSize: 14,
    letterSpacing: 2,
    marginTop: 6,
    textTransform: "uppercase",
  } satisfies CSSProperties,
  prizeLayer: {
    height: 520,
    left: "50%",
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: 980,
    zIndex: 1,
  } satisfies CSSProperties,
  prizePool: {
    background: "rgba(255,209,102,0.12)",
    border: "1px solid rgba(255,209,102,0.36)",
    borderRadius: 14,
    color: colors.gold,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontFamily: fontDisplay,
    fontSize: 32,
    fontWeight: 900,
    left: 560,
    padding: "24px 30px",
    position: "absolute",
    top: 178,
    width: 330,
    zIndex: 2,
  } satisfies CSSProperties,
  prizeToken: {
    alignItems: "center",
    background: colors.gold,
    borderRadius: 999,
    boxShadow: "0 0 24px rgba(255,209,102,0.74)",
    color: "#161007",
    display: "flex",
    fontFamily: fontMono,
    fontSize: 11,
    fontWeight: 900,
    height: 48,
    justifyContent: "center",
    left: 410,
    position: "absolute",
    top: 155,
    width: 48,
    zIndex: 1,
  } satisfies CSSProperties,
  finalLockup: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    right: 150,
    textAlign: "center",
    top: 270,
    zIndex: 4,
  } satisfies CSSProperties,
  tagline: {
    color: colors.cyan,
    fontFamily: fontMono,
    fontSize: 30,
    fontWeight: 900,
    letterSpacing: 4,
    marginTop: 18,
    textShadow: `0 0 24px ${colors.cyan}`,
  } satisfies CSSProperties,
  avatar: {
    alignItems: "center",
    borderRadius: 12,
    clipPath: "polygon(25% 5%, 75% 5%, 96% 50%, 75% 95%, 25% 95%, 4% 50%)",
    display: "flex",
    fontFamily: fontDisplay,
    fontWeight: 900,
    justifyContent: "center",
  } satisfies CSSProperties,
  beatHud: {
    alignItems: "flex-end",
    bottom: 34,
    display: "flex",
    gap: 7,
    left: 112,
    opacity: 0.52,
    position: "absolute",
  } satisfies CSSProperties,
  beatBar: {
    background: `linear-gradient(180deg, ${colors.blue}, ${colors.purple})`,
    borderRadius: 999,
    boxShadow: "0 0 16px rgba(59,214,255,0.45)",
    width: 5,
  } satisfies CSSProperties,
};
