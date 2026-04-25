export type MockRoomStatus = "LIVE NOW" | "WAITING" | "FINISHED";

export type MockRoom = {
  id: string;
  prizePool: string;
  entry: string;
  players: number;
  maxPlayers: number;
  roundSeconds: number;
  eliminationRate: string;
  status: MockRoomStatus;
  aliveDots: number;
  extraAlive: number;
  countdownLabel: string;
  countdownValue: string;
};

export const mockRooms: MockRoom[] = [
  {
    id: "001",
    prizePool: "24.50",
    entry: "0.5",
    players: 49,
    maxPlayers: 50,
    roundSeconds: 10,
    eliminationRate: "20%",
    status: "LIVE NOW",
    aliveDots: 18,
    extraAlive: 31,
    countdownLabel: "Next elimination",
    countdownValue: "00:08",
  },
  {
    id: "002",
    prizePool: "55.87",
    entry: "1",
    players: 32,
    maxPlayers: 100,
    roundSeconds: 15,
    eliminationRate: "25%",
    status: "WAITING",
    aliveDots: 16,
    extraAlive: 14,
    countdownLabel: "Starts in",
    countdownValue: "00:19",
  },
  {
    id: "003",
    prizePool: "8.40",
    entry: "0.1",
    players: 12,
    maxPlayers: 100,
    roundSeconds: 8,
    eliminationRate: "30%",
    status: "LIVE NOW",
    aliveDots: 12,
    extraAlive: 0,
    countdownLabel: "Next elimination",
    countdownValue: "00:04",
  },
  {
    id: "004",
    prizePool: "37.94",
    entry: "0.3",
    players: 27,
    maxPlayers: 50,
    roundSeconds: 12,
    eliminationRate: "20%",
    status: "WAITING",
    aliveDots: 14,
    extraAlive: 13,
    countdownLabel: "Starts in",
    countdownValue: "00:41",
  },
  {
    id: "005",
    prizePool: "50.00",
    entry: "0.5",
    players: 50,
    maxPlayers: 50,
    roundSeconds: 10,
    eliminationRate: "25%",
    status: "FINISHED",
    aliveDots: 1,
    extraAlive: 0,
    countdownLabel: "Winner locked",
    countdownValue: "ROOM #005",
  },
  {
    id: "006",
    prizePool: "145.00",
    entry: "2",
    players: 73,
    maxPlayers: 100,
    roundSeconds: 12,
    eliminationRate: "18%",
    status: "LIVE NOW",
    aliveDots: 20,
    extraAlive: 53,
    countdownLabel: "Next elimination",
    countdownValue: "00:11",
  },
];
