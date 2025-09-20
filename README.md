# リアルタイムTodoアプリ

Next.js + TypeScript + WebRTC + Socket.ioを使用したリアルタイム同期機能付きのTodoアプリケーションです。

## 技術スタック

- **Next.js 14** - React フレームワーク（App Router使用）
- **TypeScript** - 型安全な開発
- **Orval** - OpenAPI仕様からAPIクライアント自動生成
- **pnpm** - パッケージマネージャー
- **WebRTC** - P2P通信によるリアルタイム同期
- **Socket.io** - シグナリングサーバー
- **Zustand** - 状態管理
- **TanStack Query** - サーバー状態管理
- **Tailwind CSS** - スタイリング
- **Zod** - バリデーション

## 機能

- ✅ Todoの作成・編集・削除
- ✅ 完了/未完了の切り替え
- ✅ リアルタイム同期（WebRTC + Socket.io）
- ✅ SSR対応
- ✅ BFFパターンでのAPI実装
- ✅ OpenAPI仕様準拠

## アーキテクチャ

```
  [ブラウザA] ←→ [Next.jsサーバー(BFF)] ←→ [ブラウザB]
       ↓              ↓                         ↓
    [Socket.io] ← [シグナリングサーバー] → [Socket.io]
       ↓                                        ↓
    [WebRTC] ←────── P2P接続 ──────→ [WebRTC]
```

データの流れ

```

  Todoを追加するときの流れ：

  1. ユーザーがフォームに入力
      ↓
  2. TodoForm.tsx: onSubmit()実行
      ↓
  3. TodoPageClient.tsx: handleAddTodo()実行
      ↓
  4. useTodoStore: addTodo()実行
      ↓
  5. axios.post("/api/todos")でBFFにリクエスト
      ↓
  6. BFF: todoDb.create()でデータ作成
      ↓
  7. レスポンスを受け取って状態更新
      ↓
  8. useWebRTC: broadcastTodoAdd()で他のユーザーに通知
      ↓
  9. Socket.io + WebRTCで他のブラウザに送信
      ↓
  10. 他のブラウザでも表示更新

```


## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (BFF)
│   │   ├── todos/
│   │   └── socket/
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # ホームページ（SSR）
│   └── todo-page-client.tsx # クライアントコンポーネント
├── components/            # UIコンポーネント
│   ├── TodoForm.tsx
│   ├── TodoList.tsx
│   └── TodoItem.tsx
├── hooks/                 # カスタムフック
│   └── useWebRTC.ts      # WebRTC接続管理
├── server/               # サーバーサイド
│   ├── db.ts            # インメモリDB
│   └── socket-server.ts # Socket.ioサーバー
├── services/             # APIクライアント
│   └── api-client.ts
├── store/                # 状態管理
│   └── useTodoStore.ts
├── types/                # 型定義
│   └── todo.ts
└── api/                  # API仕様
    └── openapi.yaml

```

## セットアップ

### 必要な環境

- Node.js 18以上
- pnpm

### インストール

```bash
# 依存関係のインストール
pnpm install
```

### 開発サーバーの起動

```bash
# 開発サーバーを起動（http://localhost:3000）
pnpm dev
```

### ビルド

```bash
# プロダクションビルド
pnpm build

# プロダクションサーバー起動
pnpm start
```

### その他のコマンド

```bash
# Lintチェック
pnpm lint

# APIクライアント生成（Orval）
pnpm generate:api
```

## 使い方

1. アプリケーションを起動すると、自動的にWebRTC接続が確立されます
2. 複数のブラウザタブ/ウィンドウで開くと、リアルタイムで同期されます
3. Todoの追加・編集・削除・完了状態の変更が即座に反映されます

## アーキテクチャ

### BFF (Backend for Frontend)

- `/api`配下にBFF層を実装
- クライアントからの要求を最適化
- OpenAPI仕様でAPI定義

### リアルタイム同期

1. **Socket.io**: シグナリングサーバーとして動作
2. **WebRTC**: ピア間で直接データ同期
3. **Zustand**: ローカル状態管理

### SSR対応

- 初回ロード時はサーバーサイドでデータ取得
- クライアントサイドでハイドレーション

## 環境変数

```env
# .env.local
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## 注意事項

- 現在はインメモリDBを使用しているため、サーバー再起動でデータが消失します
- プロダクション環境では永続化層の実装が必要です
- WebRTCのICEサーバーはGoogleのSTUNサーバーを使用しています

## ライセンス

MIT