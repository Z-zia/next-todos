"use client";

import { Todo } from "@/types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, description?: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="mt-1 w-5 h-5 text-blue-500 rounded focus:ring-blue-400"
        />
        <div className="flex-1">
          <h3
            className={`text-lg font-medium ${
              todo.completed ? "line-through text-gray-400" : "text-gray-800"
            }`}
          >
            {todo.title}
          </h3>
          {todo.description && (
            <p
              className={`mt-1 text-sm ${
                todo.completed ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {todo.description}
            </p>
          )}
          <div className="mt-2 text-xs text-gray-400">
            更新日時: {new Date(todo.updatedAt).toLocaleString("ja-JP")}
          </div>
        </div>
        <button
          onClick={() => onDelete(todo.id)}
          className="text-red-500 hover:text-red-700 transition-colors"
        >
          削除
        </button>
      </div>
    </div>
  );
}