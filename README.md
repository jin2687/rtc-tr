# WebRTC Group Compass

複数人の位置情報と方角をリアルタイムで共有する、サーバーレスなWebアプリケーション。

## 🚀 デモ

**デプロイURL**: https://jin2687.github.io/rtc-tr/

## ✨ 主な機能

- **完全サーバーレス**: WebRTC (PeerJS Cloud)のみで動作
- **スター型ネットワーク**: Host-Client構成でスケーラブル
- **リアルタイム位置共有**: 5秒間隔で自動更新
- **デバイスコンパス対応**: iOS/Android両対応
- **QRコード招待**: ホストがQRコードで参加者を招待
- **距離・方位表示**: Haversine式による正確な計算

## 🛠 技術スタック

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS
- **WebRTC**: PeerJS
- **QR Code**: qrcode.react
- **Icons**: lucide-react
- **Testing**: Vitest
- **Deployment**: GitHub Pages + GitHub Actions

## 📱 使い方

### ホスト（グループ作成者）
1. アプリを開く
2. ユーザー名を入力して「グループを作成」
3. 表示されたQRコードを参加者に共有
4. 参加者が2人以上集まったら「セッションを開始」

### クライアント（参加者）
1. ホストのQRコードをスキャン
2. ユーザー名を入力して「グループに参加」
3. 自動的にメイン画面に遷移

### メイン画面
- 他のメンバーまでの距離と方角が表示される
- 矢印はデバイスの向きに応じて自動回転
- iOS: 初回のみコンパス許可が必要

## 🏗 アーキテクチャ

### ネットワーク構成
```
        Host (親機)
       /    |    \
      /     |     \
Client1  Client2  Client3
```

- **Host**: 全Clientのハブとして機能
- **Client**: Hostとのみ通信
- セッション管理は不要（ブラウザを閉じるまで有効）

### データフロー
1. Client → Host: 自身の位置情報を送信
2. Host: 全メンバーの情報を集約
3. Host → All Clients: 最新のメンバーリストをブロードキャスト

### 更新頻度
- バッテリー保護のため **5秒間隔** で位置情報を送信

## 📂 プロジェクト構造

```
src/
├── components/          # UIコンポーネント
│   ├── LoginScreen.tsx      # ログイン画面
│   ├── QRCodeScreen.tsx     # QRコード表示画面
│   └── CompassScreen.tsx    # メイン画面
├── hooks/              # カスタムフック
│   ├── usePeer.ts           # WebRTC接続管理
│   ├── useGeolocation.ts    # GPS位置情報
│   └── useCompass.ts        # デバイスコンパス
├── utils/              # ユーティリティ
│   ├── geo.ts               # 距離・方位計算
│   └── geo.test.ts          # ユニットテスト
└── types/              # TypeScript型定義
    └── index.ts
```

## 🧪 テスト

```bash
npm test
```

全ての地理計算関数にユニットテストが実装されています。

## 🔒 センサー許可

### iOS (Safari)
- `DeviceOrientationEvent.requestPermission()` による明示的な許可
- ユーザーアクション（ボタンタップ）が必須
- `webkitCompassHeading` を使用

### Android (Chrome)
- `deviceorientationabsolute` イベントを優先使用
- フォールバック: `deviceorientation` イベント

## 📦 ビルド・デプロイ

### ローカル開発
```bash
npm install
npm run dev
```

### 本番ビルド
```bash
npm run build
```

### GitHub Pages へのデプロイ
```bash
git push origin main
```

GitHub Actions が自動的にビルド・デプロイを実行します。

## 🔧 設定

### Vite設定 (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/rtc-tr/',  // GitHub Pagesのベースパス
})
```

## 📝 ライセンス

MIT

## 🙏 謝辞

- PeerJS - シンプルなWebRTC API
- Tailwind CSS - ユーティリティファーストなCSS
- Vite - 高速なビルドツール
