import { useState } from 'react';
import { Users } from 'lucide-react';

interface LoginScreenProps {
  onCreateHost: (username: string) => void;
  onJoinAsClient: (username: string, hostId: string) => void;
  hostId: string | null;
}

export function LoginScreen({ onCreateHost, onJoinAsClient, hostId }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('ユーザー名を入力してください');
      return;
    }

    setError('');

    if (hostId) {
      // Join as client
      onJoinAsClient(username.trim(), hostId);
    } else {
      // Create host
      onCreateHost(username.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <Users className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            WebRTC Group Compass
          </h1>
          <p className="text-gray-600 text-center">
            {hostId
              ? 'グループに参加します'
              : 'グループを作成またはセッションを開始'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              ユーザー名
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="名前を入力してください"
              maxLength={20}
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition transform hover:scale-105 active:scale-95"
          >
            {hostId ? 'グループに参加' : 'グループを作成'}
          </button>
        </form>

        {hostId && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">ホストID:</span> {hostId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
