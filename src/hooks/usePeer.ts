import { useState, useEffect, useCallback, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { Member, Message, Location, Role } from '../types';

interface UsePeerResult {
  peerId: string | null;
  role: Role | null;
  members: Member[];
  error: string | null;
  isConnected: boolean;
  createHost: (username: string) => void;
  connectToHost: (username: string, hostId: string) => void;
  sendLocation: (location: Location, heading: number | null) => void;
  disconnect: () => void;
}

export function usePeer(): UsePeerResult {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  const usernameRef = useRef<string>('');
  const memberDataRef = useRef<Map<string, Member>>(new Map());

  // Create Host
  const createHost = useCallback((username: string) => {
    try {
      const peer = new Peer();
      peerRef.current = peer;
      usernameRef.current = username;

      peer.on('open', (id) => {
        setPeerId(id);
        setRole('host');
        setIsConnected(true);
        setError(null);

        // Add self as host member
        const hostMember: Member = {
          id,
          name: username,
          location: null,
          heading: null,
        };
        memberDataRef.current.set(id, hostMember);
        setMembers([hostMember]);
      });

      peer.on('connection', (conn) => {
        connectionsRef.current.set(conn.peer, conn);

        conn.on('open', () => {
          console.log('Client connected:', conn.peer);
        });

        conn.on('data', (data) => {
          const message = data as Message;

          if (message.type === 'member-info') {
            // Add new member
            const newMember: Member = {
              id: conn.peer,
              name: message.data.name || 'Unknown',
              location: message.data.location || null,
              heading: message.data.heading || null,
            };
            memberDataRef.current.set(conn.peer, newMember);
            setMembers(Array.from(memberDataRef.current.values()));

            // Broadcast updated member list to all clients
            broadcastMembers();
          } else if (message.type === 'location') {
            // Update member location
            const member = memberDataRef.current.get(conn.peer);
            if (member) {
              member.location = message.data.location || null;
              member.heading = message.data.heading || null;
              memberDataRef.current.set(conn.peer, member);
              setMembers(Array.from(memberDataRef.current.values()));

              // Broadcast updated member list to all clients
              broadcastMembers();
            }
          }
        });

        conn.on('close', () => {
          console.log('Client disconnected:', conn.peer);
          connectionsRef.current.delete(conn.peer);
          memberDataRef.current.delete(conn.peer);
          setMembers(Array.from(memberDataRef.current.values()));
        });
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        setError(`接続エラー: ${err.message}`);
      });
    } catch (err) {
      setError('Hostの作成に失敗しました');
      console.error(err);
    }
  }, []);

  // Broadcast member list to all clients
  const broadcastMembers = useCallback(() => {
    const message: Message = {
      type: 'all-members',
      data: {
        members: Array.from(memberDataRef.current.values()),
      },
    };

    connectionsRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
  }, []);

  // Connect to Host as Client
  const connectToHost = useCallback((username: string, hostId: string) => {
    try {
      const peer = new Peer();
      peerRef.current = peer;
      usernameRef.current = username;

      peer.on('open', (id) => {
        setPeerId(id);
        setRole('client');

        // Connect to host
        const conn = peer.connect(hostId);
        connectionsRef.current.set(hostId, conn);

        conn.on('open', () => {
          setIsConnected(true);
          setError(null);

          // Send initial member info
          const message: Message = {
            type: 'member-info',
            data: {
              name: username,
              location: null,
              heading: null,
            },
          };
          conn.send(message);
        });

        conn.on('data', (data) => {
          const message = data as Message;

          if (message.type === 'all-members') {
            // Update member list from host
            if (message.data.members) {
              setMembers(message.data.members);
            }
          }
        });

        conn.on('close', () => {
          setIsConnected(false);
          setError('Hostとの接続が切断されました');
        });

        conn.on('error', (err) => {
          setError(`接続エラー: ${err.message}`);
        });
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        setError(`接続エラー: ${err.message}`);
      });
    } catch (err) {
      setError('Hostへの接続に失敗しました');
      console.error(err);
    }
  }, []);

  // Send location update
  const sendLocation = useCallback(
    (location: Location, heading: number | null) => {
      if (!peerRef.current || !peerId) return;

      const message: Message = {
        type: 'location',
        data: {
          location,
          heading,
        },
      };

      if (role === 'host') {
        // Update own location
        const member = memberDataRef.current.get(peerId);
        if (member) {
          member.location = location;
          member.heading = heading;
          memberDataRef.current.set(peerId, member);
          setMembers(Array.from(memberDataRef.current.values()));

          // Broadcast to all clients
          broadcastMembers();
        }
      } else if (role === 'client') {
        // Send to host
        connectionsRef.current.forEach((conn) => {
          if (conn.open) {
            conn.send(message);
          }
        });
      }
    },
    [role, peerId, broadcastMembers]
  );

  // Disconnect
  const disconnect = useCallback(() => {
    connectionsRef.current.forEach((conn) => {
      conn.close();
    });
    connectionsRef.current.clear();

    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    setPeerId(null);
    setRole(null);
    setMembers([]);
    setIsConnected(false);
    memberDataRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    peerId,
    role,
    members,
    error,
    isConnected,
    createHost,
    connectToHost,
    sendLocation,
    disconnect,
  };
}
