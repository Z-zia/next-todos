"use client";

import { useEffect, useState } from "react";
import { TodoForm } from "@/components/TodoForm";
import { TodoList } from "@/components/TodoList";
import { useTodoStore } from "@/store/useTodoStore";
import { useWebRTC } from "@/hooks/useWebRTC";
import { Todo } from "@/types/todo";
import { Priority } from "@/types/todo";

interface TodoPageClientProps {
  initialTodos: Todo[];
}

export function TodoPageClient({ initialTodos }: TodoPageClientProps) {
  const [roomId] = useState("default-room");
  const {
    todos,
    isLoading,
    error,
    fetchTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    setTodos,
  } = useTodoStore();

  const {
    isConnected,
    peersCount,
    broadcastTodoAdd,
    broadcastTodoDelete,
    broadcastTodoToggle,
    broadcastTodoUpdate,
  } = useWebRTC(roomId);

  useEffect(() => {
    if (initialTodos.length > 0) {
      setTodos(initialTodos);
    } else {
      fetchTodos();
    }
  }, []);

  const handleAddTodo = async (title: string, priority: Priority, description?: string) => {
    const newTodo = await addTodo(title, priority, description);
    if (newTodo) {
      broadcastTodoAdd(newTodo);
    }
  };

  const handleToggleTodo = async (id: string) => {
    await toggleTodo(id);
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      broadcastTodoToggle(todo);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    await deleteTodo(id);
    broadcastTodoDelete(id);
  };

  const handleEditTodo = async (id: string, title: string, priority: Priority, description?: string) => {
    await updateTodo(id, title, priority, description);
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      broadcastTodoUpdate({ ...todo, title, priority, description });
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-700">
              {isConnected ? "接続中" : "切断中"}
            </span>
          </div>
          <span className="text-sm text-gray-700">
            接続中のピア: {peersCount}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      )}

      <TodoForm onSubmit={handleAddTodo} />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <TodoList
          todos={todos}
          onToggle={handleToggleTodo}
          onDelete={handleDeleteTodo}
          onEdit={handleEditTodo}
        />
      )}
    </div>
  );
}