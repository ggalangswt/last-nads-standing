export type MatchPlayer = {
  address: string;
  id: number;
  roundOut?: number;
  shield: boolean;
  shieldUsed: boolean;
  state: "alive" | "eliminated" | "you";
};

export type MatchFeedEvent = {
  id: number;
  time: string;
  title: string;
  type: "elim" | "round" | "shield" | "start" | "milestone";
};

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function createMockPlayers(roomId: string): MatchPlayer[] {
  const seed = Number.parseInt(roomId.replace(/\D/g, ""), 10) || 42;
  const template = [
    "0xee3b...4858",
    "0x1331...f654",
    "0x1310...96ee",
    "0xc343...b322",
    "0xc3e4...d55f",
    "0xe590...fe40",
    "0xc21a...4ba9",
    "0x8fec...5805",
    "0xd9bb...51f7",
    "0x3266...15a6",
    "0x155c...e945",
    "0x219f...6d76",
    "0x0cac...c4e4",
    "0xeb3f...4ca6",
    "0xc223...4ba6",
    "0xb038...9820",
    "0x39a9...abfd",
    "0x4c0c...9981",
    "0xcee3...c464",
    "0xb498...8ddb",
    "0xb43f...ca80",
    "0x3a1c...595a",
    "0x1f6b...3bc0",
    "0x0092...83c2",
  ];

  const eliminatedSet = new Set([8, 9, 11, 15, 19, 23].map((offset) => (seed + offset) % template.length));
  const youIndex = seed % template.length;

  return template.map((address, index) => ({
    address,
    id: index + 1,
    roundOut: eliminatedSet.has(index) ? Math.max(1, 4 + (index % 4)) : undefined,
    shield: index % 5 !== 1,
    shieldUsed: index % 7 === 0,
    state: index === youIndex ? "you" : eliminatedSet.has(index) ? "eliminated" : "alive",
  }));
}

export function createMockFeed({
  roomId,
  imminent,
  players,
  round,
  mode,
}: {
  imminent: boolean;
  mode: "arena" | "spectate";
  players: MatchPlayer[];
  roomId: string;
  round: number;
}) {
  const alive = players.filter((player) => player.state !== "eliminated").length;
  const eliminated = players.length - alive;
  const room = String(roomId).padStart(4, "0");

  const base: MatchFeedEvent[] = imminent
    ? [
        { id: 1, type: "round", title: `Round ${round + 1} incoming...`, time: "now" },
        { id: 2, type: "milestone", title: `${Math.max(1, Math.round(alive * 0.2))} wallets will be cut`, time: "3s" },
        { id: 3, type: "start", title: `${alive}/${players.length} still alive`, time: `${eliminated} out` },
      ]
    : [
        { id: 1, type: "round", title: `${mode === "arena" ? "Room" : "Spectating room"} #${room}`, time: "now" },
        { id: 2, type: "start", title: `${alive} players still alive`, time: `${round} rounds` },
      ];

  const eliminatedEvents = players
    .filter((player) => player.state === "eliminated")
    .slice(0, imminent ? 2 : 3)
    .map((player, index) => ({
      id: index + 10,
      type: "elim" as const,
      title: `${player.address} eliminated in Round ${player.roundOut ?? round}`,
      time: imminent ? "recent" : `R${player.roundOut ?? round}`,
    }));

  const shieldEvent: MatchFeedEvent = {
    id: 99,
    type: "shield",
    title: "Shield blocked elimination",
    time: imminent ? "now" : "live",
  };

  return [...base, shieldEvent, ...eliminatedEvents];
}

export function createMockMatch(roomId: string, imminent: boolean, mode: "arena" | "spectate") {
  const seed = Number.parseInt(roomId.replace(/\D/g, ""), 10) || 42;
  const players = createMockPlayers(roomId);
  const alive = players.filter((player) => player.state !== "eliminated").length;
  const eliminated = players.length - alive;
  const round = 4 + (seed % 4) + (imminent ? 1 : 0);
  const prize = (32 + seed % 20 + (imminent ? 0.53 : 0.21)).toFixed(2);
  const timer = imminent ? 2 : 8;

  return {
    alive,
    eliminated,
    feed: createMockFeed({ imminent, mode, players, roomId, round }),
    players,
    prize,
    round,
    roomLabel: `#${String(seed % 999).padStart(3, "0")}`,
    timer,
  };
}
