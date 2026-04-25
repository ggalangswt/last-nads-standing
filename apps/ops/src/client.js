// Client library for interacting with the ops server
// Can be used by the frontend to get real-time updates and game data

export class OpsClient {
  constructor(httpUrl = "http://localhost:3001", wsUrl = httpUrl) {
    this.httpUrl = httpUrl;
    this.wsUrl = wsUrl;
    this.socket = null;
    this.eventListeners = new Map();
  }

  // HTTP API methods
  async getHealth() {
    return this._fetch("/health");
  }

  async getContracts() {
    return this._fetch("/contracts");
  }

  async getActiveRooms() {
    return this._fetch("/api/rooms");
  }

  async getRoom(address) {
    return this._fetch(`/api/rooms/${address}`);
  }

  async getRoomPlayers(address) {
    return this._fetch(`/api/rooms/${address}/players`);
  }

  async startRoom(address) {
    return this._fetch(`/api/rooms/start/${address}`, {
      method: "POST",
    });
  }

  async executeRound(address) {
    return this._fetch(`/api/rooms/${address}/execute-round`, {
      method: "POST",
    });
  }

  async _fetch(path, options = {}) {
    const response = await fetch(`${this.httpUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Socket.IO methods
  connect() {
    if (this.socket?.connected) return;

    // Dynamic import to avoid issues if socket.io-client is not available
    import('socket.io-client').then(({ io }) => {
      this.socket = io(this.wsUrl, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
      });

      this.socket.on("connect", () => {
        console.log("Connected to ops Socket.IO server");
        this._emit("connected");
      });

      this.socket.on("disconnect", () => {
        console.log("Disconnected from ops Socket.IO server");
        this._emit("disconnected");
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error);
        this._emit("error", error);
      });

      // Listen for all game events
      const gameEvents = [
        "room_created",
        "player_joined",
        "game_started",
        "round_started",
        "round_executed",
        "player_eliminated",
        "shield_blocked",
        "game_finished",
        "game_winner",
        "prize_claimed",
        "round_ready",
        "game_status",
        "spectator_react",
      ];

      gameEvents.forEach((event) => {
        this.socket.on(event, (data) => {
          this._emit(event, data);
        });
      });

    }).catch((error) => {
      console.error("Failed to load socket.io-client:", error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Event handling
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  _emit(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Convenience methods for game events
  onRoomCreated(callback) {
    this.on("room_created", callback);
  }

  onPlayerJoined(callback) {
    this.on("player_joined", callback);
  }

  onGameStarted(callback) {
    this.on("game_started", callback);
  }

  onRoundStarted(callback) {
    this.on("round_started", callback);
  }

  onRoundExecuted(callback) {
    this.on("round_executed", callback);
  }

  onPlayerEliminated(callback) {
    this.on("player_eliminated", callback);
  }

  onGameFinished(callback) {
    this.on("game_finished", callback);
  }

  onGameWinner(callback) {
    this.on("game_winner", callback);
  }

  onRoundReady(callback) {
    this.on("round_ready", callback);
  }

  onGameStatus(callback) {
    this.on("game_status", callback);
  }

  onSpectatorReact(callback) {
    this.on("spectator_react", callback);
  }

  sendSpectatorReaction(roomAddress, emoji, from) {
    this.socket?.emit("spectator_react", { roomAddress, emoji, from });
  }

  // Socket.IO specific methods
  get isConnected() {
    return this.socket?.connected || false;
  }

  get socketId() {
    return this.socket?.id || null;
  }
}

// Default export
export default OpsClient;