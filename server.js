const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  // HTTPサーバー作成（Next.jsのリクエスト処理）
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Socket.ioサーバー作成
  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: dev ? 'http://localhost:3000' : false,
      credentials: true,
    },
  });

  // ルーム管理用のMap（roomId -> Set<socketId>）
  const rooms = new Map();

  // Socket.io接続処理
  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // ========== ルーム管理 ==========
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(socket.id);

      // 既存のピアに新規参加を通知
      socket.to(roomId).emit('peer-joined', socket.id);

      // 新規参加者に既存のピア一覧を送信
      const peers = Array.from(rooms.get(roomId)).filter((id) => id !== socket.id);
      socket.emit('room-peers', peers);
      console.log(`👥 User ${socket.id} joined room: ${roomId}`);
    });

    // ========== Todo同期イベント ==========
    socket.on('todo-update', (data) => {
      socket.to(data.roomId).emit('todos-updated', data.todos);
    });

    socket.on('todo-add', (data) => {
      socket.to(data.roomId).emit('todo-added', data.todo);
      console.log(`➕ Todo added in room ${data.roomId}`);
    });

    socket.on('todo-delete', (data) => {
      socket.to(data.roomId).emit('todo-deleted', data.todoId);
      console.log(`🗑️ Todo deleted in room ${data.roomId}`);
    });

    socket.on('todo-toggle', (data) => {
      socket.to(data.roomId).emit('todo-toggled', data.todo);
    });

    // ========== WebRTCシグナリング ==========
    // Offer: 接続要求をピアに転送
    socket.on('webrtc-offer', (data) => {
      socket.to(data.to).emit('webrtc-offer', {
        from: socket.id,
        offer: data.offer,
      });
    });

    // Answer: 接続応答をピアに転送
    socket.on('webrtc-answer', (data) => {
      socket.to(data.to).emit('webrtc-answer', {
        from: socket.id,
        answer: data.answer,
      });
    });

    // ICE候補: ネットワーク経路情報を転送
    socket.on('webrtc-ice-candidate', (data) => {
      socket.to(data.to).emit('webrtc-ice-candidate', {
        from: socket.id,
        candidate: data.candidate,
      });
    });

    // ========== 切断処理 ==========
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id);
        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId);
        }
      }
      socket.to(roomId).emit('peer-left', socket.id);
      console.log(`👋 User ${socket.id} left room: ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
      rooms.forEach((peers, roomId) => {
        if (peers.has(socket.id)) {
          peers.delete(socket.id);
          socket.to(roomId).emit('peer-left', socket.id);
        }
      });
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});