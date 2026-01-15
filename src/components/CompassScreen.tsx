import { Navigation, MapPin, Compass as CompassIcon, AlertCircle } from 'lucide-react';
import { Member, Location } from '../types';
import {
  calculateDistance,
  calculateBearing,
  calculateRelativeDirection,
  formatDistance,
  getDirectionName,
} from '../utils/geo';

interface CompassScreenProps {
  members: Member[];
  myLocation: Location | null;
  myHeading: number | null;
  myId: string;
  needsCompassPermission: boolean;
  onRequestCompassPermission: () => void;
  onDisconnect: () => void;
}

export function CompassScreen({
  members,
  myLocation,
  myHeading,
  myId,
  needsCompassPermission,
  onRequestCompassPermission,
  onDisconnect,
}: CompassScreenProps) {
  const otherMembers = members.filter((m) => m.id !== myId);
  const me = members.find((m) => m.id === myId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <CompassIcon className="w-6 h-6 text-indigo-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">Group Compass</h1>
          </div>
          <button
            onClick={onDisconnect}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            切断
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* My Info */}
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center mb-2">
              <MapPin className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">自分の位置</span>
            </div>
            <div className="text-xs text-gray-600">
              {myLocation ? (
                <>
                  <div>緯度: {myLocation.latitude.toFixed(6)}</div>
                  <div>経度: {myLocation.longitude.toFixed(6)}</div>
                </>
              ) : (
                <div className="text-red-500">位置情報を取得中...</div>
              )}
            </div>
          </div>

          {/* Compass Status */}
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center mb-2">
              <Navigation className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">コンパス</span>
            </div>
            <div className="text-xs text-gray-600">
              {myHeading !== null ? (
                <>
                  <div>{Math.round(myHeading)}°</div>
                  <div className="font-semibold">{getDirectionName(myHeading)}</div>
                </>
              ) : needsCompassPermission ? (
                <div className="text-amber-600">許可が必要です</div>
              ) : (
                <div className="text-red-500">コンパスを取得中...</div>
              )}
            </div>
          </div>
        </div>

        {/* Compass Permission Request */}
        {needsCompassPermission && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-900 mb-1">
                  コンパスの許可が必要です
                </h3>
                <p className="text-xs text-amber-800 mb-3">
                  方向を表示するには、デバイスの向きへのアクセス許可が必要です。
                </p>
                <button
                  onClick={onRequestCompassPermission}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 px-4 rounded transition"
                >
                  許可する
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Member List */}
        <div className="space-y-3">
          <h2 className="text-white font-semibold flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            メンバー ({members.length})
          </h2>

          {/* My Card */}
          {me && (
            <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {me.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {me.name} <span className="text-sm text-blue-600">(あなた)</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {me.location ? '位置情報: 有効' : '位置情報: 取得中'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Members */}
          {otherMembers.map((member) => {
            let distance: number | null = null;
            let bearing: number | null = null;
            let relativeDirection: number | null = null;

            if (myLocation && member.location) {
              distance = calculateDistance(myLocation, member.location);
              bearing = calculateBearing(myLocation, member.location);
              if (myHeading !== null) {
                relativeDirection = calculateRelativeDirection(myHeading, bearing);
              }
            }

            return (
              <div
                key={member.id}
                className="bg-white rounded-lg p-4 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {member.name}
                      </div>
                      {distance !== null ? (
                        <div className="text-sm text-gray-600">
                          {formatDistance(distance)}
                          {bearing !== null && (
                            <span className="ml-2 font-medium">
                              {getDirectionName(bearing)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">
                          位置情報を待機中...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Direction Arrow */}
                  {relativeDirection !== null && (
                    <div className="ml-3">
                      <div
                        className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center"
                        style={{
                          transform: `rotate(${relativeDirection}deg)`,
                          transition: 'transform 0.3s ease-out',
                        }}
                      >
                        <Navigation className="w-6 h-6 text-indigo-600" fill="currentColor" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {otherMembers.length === 0 && (
            <div className="bg-white rounded-lg p-6 text-center text-gray-500">
              他のメンバーはいません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
