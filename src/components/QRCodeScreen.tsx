import { QRCodeSVG } from 'qrcode.react';
import { Users, CheckCircle } from 'lucide-react';

interface QRCodeScreenProps {
  peerId: string;
  memberCount: number;
  onReady: () => void;
}

export function QRCodeScreen({ peerId, memberCount, onReady }: QRCodeScreenProps) {
  const inviteUrl = `${window.location.origin}${window.location.pathname}?host=${peerId}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-green-100 p-4 rounded-full mb-4">
            <Users className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            グループを作成しました
          </h2>
          <p className="text-gray-600 text-center">
            このQRコードをスキャンして参加
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border-4 border-gray-200 mb-6">
          <QRCodeSVG
            value={inviteUrl}
            size={256}
            level="H"
            className="w-full h-auto"
          />
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">招待URL</p>
            <p className="text-xs font-mono text-gray-800 break-all">
              {inviteUrl}
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                参加メンバー
              </span>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {memberCount}
            </span>
          </div>

          <button
            onClick={onReady}
            disabled={memberCount < 2}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition transform ${
              memberCount >= 2
                ? 'bg-green-600 hover:bg-green-700 text-white hover:scale-105 active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {memberCount >= 2 ? 'セッションを開始' : '参加者を待っています...'}
            </div>
          </button>

          {memberCount < 2 && (
            <p className="text-xs text-center text-gray-500">
              最低2人のメンバーが必要です
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
