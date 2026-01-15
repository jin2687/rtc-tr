import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { QRCodeScreen } from './components/QRCodeScreen';
import { CompassScreen } from './components/CompassScreen';
import { usePeer } from './hooks/usePeer';
import { useGeolocation } from './hooks/useGeolocation';
import { useCompass } from './hooks/useCompass';

type AppScreen = 'login' | 'qr' | 'compass';

const UPDATE_INTERVAL = 5000; // 5 seconds

function App() {
  const [screen, setScreen] = useState<AppScreen>('login');
  const [hostIdFromUrl, setHostIdFromUrl] = useState<string | null>(null);

  // WebRTC
  const {
    peerId,
    role,
    members,
    error: peerError,
    isConnected,
    createHost,
    connectToHost,
    sendLocation,
    disconnect,
  } = usePeer();

  // Sensors
  const { location, startTracking, stopTracking } = useGeolocation(UPDATE_INTERVAL);
  const {
    heading,
    needsPermission,
    requestPermission,
  } = useCompass();

  // Check URL for host parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hostId = params.get('host');
    if (hostId) {
      setHostIdFromUrl(hostId);
    }
  }, []);

  // Handle login
  const handleCreateHost = (username: string) => {
    createHost(username);
    startTracking();
  };

  const handleJoinAsClient = (username: string, hostId: string) => {
    connectToHost(username, hostId);
    startTracking();
  };

  // Navigate to QR screen when host is ready
  useEffect(() => {
    if (role === 'host' && peerId && screen === 'login') {
      setScreen('qr');
    }
  }, [role, peerId, screen]);

  // Navigate to compass screen when client connects
  useEffect(() => {
    if (role === 'client' && isConnected && screen === 'login') {
      setScreen('compass');
    }
  }, [role, isConnected, screen]);

  // Send location updates every 5 seconds
  useEffect(() => {
    if (!isConnected || !location) return;

    const interval = setInterval(() => {
      sendLocation(location, heading);
    }, UPDATE_INTERVAL);

    // Send immediately on first connection
    sendLocation(location, heading);

    return () => clearInterval(interval);
  }, [isConnected, location, heading, sendLocation]);

  // Handle disconnect
  const handleDisconnect = () => {
    disconnect();
    stopTracking();
    setScreen('login');
    // Clear URL parameters
    window.history.replaceState({}, '', window.location.pathname);
  };

  // Handle start session from QR screen
  const handleStartSession = () => {
    setScreen('compass');
  };

  // Render screens
  if (peerError) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">エラー</h2>
          <p className="text-gray-700 mb-4">{peerError}</p>
          <button
            onClick={handleDisconnect}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'login') {
    return (
      <LoginScreen
        onCreateHost={handleCreateHost}
        onJoinAsClient={handleJoinAsClient}
        hostId={hostIdFromUrl}
      />
    );
  }

  if (screen === 'qr' && role === 'host' && peerId) {
    return (
      <QRCodeScreen
        peerId={peerId}
        memberCount={members.length}
        onReady={handleStartSession}
      />
    );
  }

  if (screen === 'compass' && peerId) {
    return (
      <CompassScreen
        members={members}
        myLocation={location}
        myHeading={heading}
        myId={peerId}
        needsCompassPermission={needsPermission}
        onRequestCompassPermission={requestPermission}
        onDisconnect={handleDisconnect}
      />
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">読み込み中...</p>
      </div>
    </div>
  );
}

export default App;
