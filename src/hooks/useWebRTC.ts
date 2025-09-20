"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import SimplePeer from "simple-peer";
import { Todo } from "@/types/todo";
import { useTodoStore } from "@/store/useTodoStore";


// 備忘) Socket.ioとWebRTC(simple-peer)を組み合わせる理由
// 
// | 用途               | Socket.io          | WebRTC             |
// |-------------------|--------------------|--------------------|
// | 初回接続の仲介      | ✅ 必須             | ❌ 単独では無理      |
// | リアルタイムデータ   | ⚠️ サーバー経由で遅い | ✅ 直接送信で速い    |
// | 大量データ         | ⚠️ サーバー負荷大     | ✅ P2Pで負荷分散    |
// | NAT越え           | ✅ 簡単              | ⚠️ STUN/TURN必要  |
export function useWebRTC(roomId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [peers, setPeers] = useState<Map<string, SimplePeer.Instance>>(new Map());
  const socketRef = useRef<Socket | null>(null);
  const { setTodos } = useTodoStore();

  useEffect(() => {
    // 既に接続がある場合は再利用
    if (socketRef.current?.connected) {
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      path: "/socket.io",
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join-room", roomId);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("room-peers", (peerIds: string[]) => {
      peerIds.forEach((peerId) => {
        createPeer(peerId, socket.id!, true);
      });
    });

    socket.on("peer-joined", (peerId: string) => {
      createPeer(peerId, socket.id!, false);
    });

    socket.on("peer-left", (peerId: string) => {
      const peer = peers.get(peerId);
      if (peer) {
        peer.destroy();
        setPeers((prev) => {
          const next = new Map(prev);
          next.delete(peerId);
          return next;
        });
      }
    });

    socket.on("todo-updated", (todo: Todo) => {
      useTodoStore.getState().updateTodoFromPeer(todo);
    });

    socket.on("todo-added", (todo: Todo) => {
      useTodoStore.getState().addTodoFromPeer(todo);
    });

    socket.on("todo-deleted", (todoId: string) => {
      useTodoStore.getState().deleteTodoFromPeer(todoId);
    });

    socket.on("todo-toggled", (todo: Todo) => {
      useTodoStore.getState().toggleTodoFromPeer(todo);
    });

    socket.on("webrtc-offer", ({ from, offer }: { from: string; offer: any }) => {
      const peer = createPeer(from, socket.id!, false);
      peer.signal(offer);
    });

    socket.on("webrtc-answer", ({ from, answer }: { from: string; answer: any }) => {
      const peer = peers.get(from);
      if (peer) {
        peer.signal(answer);
      }
    });

    socket.on("webrtc-ice-candidate", ({ from, candidate }: { from: string; candidate: any }) => {
      const peer = peers.get(from);
      if (peer) {
        peer.signal(candidate);
      }
    });

    return () => {
      // クリーンアップ処理
      if (socketRef.current?.connected) {
        socket.emit("leave-room", roomId);
        socket.removeAllListeners();
        socket.disconnect();
      }
      peers.forEach((peer) => peer.destroy());
      setPeers(new Map());
      socketRef.current = null;
    };
  }, [roomId]);

  const createPeer = (peerId: string, myId: string, initiator: boolean) => {
    const peer = new SimplePeer({
      initiator,
      trickle: true,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
    });

    peer.on("signal", (signal) => {
      if (signal.type === "offer") {
        socketRef.current?.emit("webrtc-offer", { to: peerId, offer: signal });
      } else if (signal.type === "answer") {
        socketRef.current?.emit("webrtc-answer", { to: peerId, answer: signal });
      } else if (signal.candidate) {
        socketRef.current?.emit("webrtc-ice-candidate", { to: peerId, candidate: signal });
      }
    });

    peer.on("connect", () => {
      console.log(`Connected to peer ${peerId}`);
    });

    peer.on("data", (data: any) => {
      const message = JSON.parse(data.toString());
      if (message.type === "todos-sync") {
        setTodos(message.todos);
      }
    });

    peer.on("error", (err) => {
      console.error(`Error with peer ${peerId}:`, err);
    });

    setPeers((prev) => {
      const next = new Map(prev);
      next.set(peerId, peer);
      return next;
    });

    return peer;
  };

  const broadcastTodos = (todos: Todo[]) => {
    socketRef.current?.emit("todo-update", { roomId, todos });
    peers.forEach((peer) => {
      if (peer.connected) {
        peer.send(JSON.stringify({ type: "todos-sync", todos }));
      }
    });
  };

  const broadcastTodoAdd = (todo: Todo) => {
    socketRef.current?.emit("todo-add", { roomId, todo });
  };

  const broadcastTodoDelete = (todoId: string) => {
    socketRef.current?.emit("todo-delete", { roomId, todoId });
  };

  const broadcastTodoToggle = (todo: Todo) => {
    socketRef.current?.emit("todo-toggle", { roomId, todo });
  };

  const broadcastTodoUpdate = (todo: Todo) => {
    socketRef.current?.emit("todo-update", { roomId, todo });
  };

  return {
    isConnected,
    peersCount: peers.size,
    broadcastTodos,
    broadcastTodoAdd,
    broadcastTodoDelete,
    broadcastTodoToggle,
    broadcastTodoUpdate,
  };
}