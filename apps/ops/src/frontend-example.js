// Example usage of OpsClient with Socket.IO in frontend
// This can be used in a React component or any frontend framework

import { useEffect, useState } from 'react';
import OpsClient from '../path/to/ops/src/client.js';

export function useOpsClient() {
  const [client] = useState(() => new OpsClient());
  const [isConnected, setIsConnected] = useState(false);
  const [activeRooms, setActiveRooms] = useState([]);

  useEffect(() => {
    // Connect to Socket.IO server
    client.connect();

    // Listen for connection events
    client.on('connected', () => {
      console.log('Connected to ops server');
      setIsConnected(true);
    });

    client.on('disconnected', () => {
      console.log('Disconnected from ops server');
      setIsConnected(false);
    });

    // Listen for game events
    client.onGameStarted((data) => {
      console.log('Game started:', data);
      // Update UI with new game state
    });

    client.onPlayerEliminated((data) => {
      console.log('Player eliminated:', data);
      // Update player list, show elimination animation, etc.
    });

    client.onGameFinished((data) => {
      console.log('Game finished:', data);
      // Show winner, update room status, etc.
    });

    // Fetch initial data
    fetchActiveRooms();

    return () => {
      client.disconnect();
    };
  }, [client]);

  const fetchActiveRooms = async () => {
    try {
      const rooms = await client.getActiveRooms();
      setActiveRooms(rooms.rooms || []);
    } catch (error) {
      console.error('Failed to fetch active rooms:', error);
    }
  };

  const getRoomDetails = async (roomAddress) => {
    try {
      return await client.getRoom(roomAddress);
    } catch (error) {
      console.error('Failed to get room details:', error);
      return null;
    }
  };

  const getRoomPlayers = async (roomAddress) => {
    try {
      return await client.getRoomPlayers(roomAddress);
    } catch (error) {
      console.error('Failed to get room players:', error);
      return null;
    }
  };

  return {
    isConnected,
    activeRooms,
    getRoomDetails,
    getRoomPlayers,
    client,
  };
}

// Example React component usage
export function GameRoom({ roomAddress }) {
  const { isConnected, getRoomDetails, getRoomPlayers } = useOpsClient();
  const [roomData, setRoomData] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (roomAddress) {
      loadRoomData();
    }
  }, [roomAddress]);

  const loadRoomData = async () => {
    const room = await getRoomDetails(roomAddress);
    const playerList = await getRoomPlayers(roomAddress);

    setRoomData(room);
    setPlayers(playerList?.players || []);
  };

  return (
    <div>
      <div>Connection: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</div>

      {roomData && (
        <div>
          <h2>Room {roomAddress}</h2>
          <p>Status: {roomData.gameInfo?.status}</p>
          <p>Current Round: {roomData.gameInfo?.currentRound}</p>
          <p>Players: {roomData.gameInfo?.totalPlayers}</p>
          <p>Prize Pool: {roomData.gameInfo?.prizePool} MON</p>
        </div>
      )}

      <div>
        <h3>Players</h3>
        {players.map((player, index) => (
          <div key={index}>
            {player.address}: {player.isAlive ? 'Alive' : 'Eliminated'}
          </div>
        ))}
      </div>
    </div>
  );
}